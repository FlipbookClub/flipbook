package expo.modules.nativehighlightpdf

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.os.Handler
import android.os.Looper
import android.os.ParcelFileDescriptor
import android.util.LruCache
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.ViewConfiguration
import android.widget.OverScroller
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import io.legere.pdfiumandroid.PdfDocument
import io.legere.pdfiumandroid.PdfPage
import io.legere.pdfiumandroid.PdfTextPage
import io.legere.pdfiumandroid.PdfiumCore
import java.io.File
import java.util.concurrent.Executors
import kotlin.math.abs
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

// Normalized 0..1, TOP-LEFT origin, relative to a single page. Same
// convention as the reactions schema and the iOS module.
internal data class NormRect(val x: Double, val y: Double, val w: Double, val h: Double)

internal data class HighlightEntry(val id: String, val page: Int, val rects: List<NormRect>)

internal class PdfViewException(message: String) : CodedException(message)

private const val TAG = "NativeHighlightPdf"

// Android's continuous-scroll PDF reader, at parity with the iOS PDFKit
// module (modules/native-highlight-pdf/ios/NativeHighlightPdfView.swift).
//
// Command-driven, NOT prop-driven — the same architecture the iOS reader was
// rebuilt onto after four rounds of failed patches. JS calls openDocument()
// once and thereafter only listens to onPageChanged; this view owns scroll
// position outright. Two rules follow, and they are load-bearing:
//
//   1. Nothing may move scroll position as a side effect of data changing.
//      addHighlight/removeHighlight only invalidate; they never scroll.
//   2. The start page is applied once the view actually has bounds, not at
//      document-open time. openDocument holds it as pending and onSizeChanged
//      applies it, so a fast (cache-hit) open before layout still lands.
//
// Rendering: Android has no first-party PDFKit equivalent (androidx.pdf's
// PdfViewerFragment only supports annotation by handing off to another app),
// so pages are rendered via PdfiumAndroid and drawn onto this view's own
// canvas, with text selection hand-rolled from Pdfium's character
// hit-testing. Highlights are our own canvas overlay rather than annotations
// embedded in the PDF, which is all we need since the highlight DATA is what
// persists to Convex.
//
// Why one custom-drawn scrolling surface rather than a RecyclerView of page
// views: drawing and touch handling stay on THIS ExpoView, which is the
// arrangement already proven to receive touches here, and it gives exact
// control over scroll-vs-selection arbitration (the genuinely hard part)
// instead of negotiating it across nested view boundaries.
@SuppressLint("ViewConstructor")
class NativeHighlightPdfView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onPageChanged by EventDispatcher()
  private val onSelectionChanged by EventDispatcher()
  private val onHighlightTapped by EventDispatcher()

  private val pdfiumCore = PdfiumCore(context)
  // Every Pdfium call goes through this lock. Rendering happens off the main
  // thread; selection hit-tests are fast enough to run on it. Pdfium is not
  // safe to call concurrently on one document.
  private val pdfLock = Any()
  private val renderExecutor = Executors.newSingleThreadExecutor()
  private val mainHandler = Handler(Looper.getMainLooper())

  private var document: PdfDocument? = null
  private var totalPages = 0
  private var reportedPage = 0

  // Uniform slot height for every page, derived from page 0's aspect ratio.
  // Real-world books are uniform, and this keeps scroll offsets O(1) with no
  // layout shift as pages stream in. A page whose own aspect differs is drawn
  // scaled-to-fit and centered inside its slot (letterboxed) rather than
  // stretched, so nothing is ever distorted.
  private var defaultAspect = 1.414f // h/w, A4, until page 0 is measured
  private val pageAspects = mutableMapOf<Int, Float>()

  private var scrollY = 0
  private var pendingStartPageIndex: Int? = null

  private val scroller = OverScroller(context)
  private val touchSlop = ViewConfiguration.get(context).scaledTouchSlop

  // Rendered page bitmaps. Sized in bytes so a big page count can't OOM.
  private val bitmapCache: LruCache<Int, Bitmap>
  private val rendering = mutableSetOf<Int>()
  // Pages whose render produced nothing. Retrying them every frame is what
  // turns one bad page into a continuous redraw loop.
  private val failedPages = mutableSetOf<Int>()

  private val highlights = linkedMapOf<String, HighlightEntry>()

  // Selection state. selPage is the page the selection belongs to; a
  // selection never spans pages (matches the reactions schema's
  // one-page-per-highlight model and the iOS module's behaviour).
  private var selPage = -1
  private var selStartChar = -1
  private var selEndChar = -1
  private var selAnchorChar = -1
  private var isSelecting = false
  private var selTextPage: PdfTextPage? = null
  private var selTextPageIndex = -1

  private val highlightPaint = Paint().apply { color = 0x66FBC02D.toInt() }
  private val selectionPaint = Paint().apply { color = 0x664285F4.toInt() }
  private val handlePaint = Paint().apply { color = 0xFF4285F4.toInt(); isAntiAlias = true }
  private val placeholderPaint = Paint().apply { color = 0xFFF2F2F2.toInt() }

  private val pageGapPx: Int = (8 * context.resources.displayMetrics.density).roundToInt()
  private val handleRadiusPx: Float = 7f * context.resources.displayMetrics.density

  init {
    setWillNotDraw(false) // ViewGroups skip onDraw by default.
    isFocusable = true
    // A quarter of the heap. Sized generously on purpose: the cache must
    // comfortably hold every visible page plus the prefetched neighbours, or
    // each render evicts a page that is still on screen, which re-renders,
    // which evicts again — visible as constant flicker.
    val maxKb = (Runtime.getRuntime().maxMemory() / 1024 / 4).toInt()
    bitmapCache = object : LruCache<Int, Bitmap>(maxKb) {
      override fun sizeOf(key: Int, value: Bitmap): Int = value.byteCount / 1024
    }
  }

  // MARK: - Gesture handling
  //
  // Long-press enters selection mode (Android convention); until then a drag
  // scrolls. Once selecting, drags extend the selection and never scroll, so
  // the two can't fight. This mirrors the standard text-vs-scroll
  // disambiguation and is the reason touch is handled here rather than split
  // across nested views.
  private val gestureDetector = GestureDetector(context, object : GestureDetector.SimpleOnGestureListener() {
    override fun onDown(e: MotionEvent): Boolean {
      scroller.forceFinished(true)
      return true
    }

    override fun onScroll(e1: MotionEvent?, e2: MotionEvent, dx: Float, dy: Float): Boolean {
      if (isSelecting) return false
      scrollBy(dy.roundToInt())
      return true
    }

    override fun onFling(e1: MotionEvent?, e2: MotionEvent, vx: Float, vy: Float): Boolean {
      if (isSelecting) return false
      scroller.fling(0, scrollY, 0, -vy.roundToInt(), 0, 0, 0, max(0, contentHeight() - height))
      postInvalidateOnAnimation()
      return true
    }

    override fun onLongPress(e: MotionEvent) {
      beginSelectionAt(e.x, e.y)
    }

    override fun onSingleTapUp(e: MotionEvent): Boolean {
      handleTapForHighlight(e.x, e.y)
      return true
    }
  })

  override fun onTouchEvent(event: MotionEvent): Boolean {
    // While a selection drag is in flight, keep any parent scroll container
    // out of it.
    parent?.requestDisallowInterceptTouchEvent(isSelecting)
    gestureDetector.onTouchEvent(event)
    when (event.actionMasked) {
      MotionEvent.ACTION_MOVE -> if (isSelecting) extendSelectionTo(event.x, event.y)
      MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> if (isSelecting) endSelectionDrag()
    }
    return true
  }

  // No children, so every touch belongs to us.
  override fun onInterceptTouchEvent(event: MotionEvent): Boolean = true

  override fun computeScroll() {
    if (scroller.computeScrollOffset()) {
      scrollY = clampScroll(scroller.currY)
      emitPageIfChanged()
      postInvalidateOnAnimation()
    }
  }

  // MARK: - Layout + scrolling

  private fun slotHeight(): Int = if (width <= 0) 0 else (width * defaultAspect).roundToInt()

  private fun slotStride(): Int = slotHeight() + pageGapPx

  private fun contentHeight(): Int = if (totalPages == 0) 0 else totalPages * slotStride() - pageGapPx

  private fun clampScroll(y: Int): Int = min(max(0, y), max(0, contentHeight() - height))

  private fun scrollBy(dy: Int) {
    val next = clampScroll(scrollY + dy)
    if (next != scrollY) {
      scrollY = next
      emitPageIfChanged()
      invalidate()
    }
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    if (w <= 0 || h <= 0) return
    // Bitmaps were rendered for the old width.
    if (w != oldw) {
      bitmapCache.evictAll()
      // A page that failed at the old width deserves another go at the new one.
      failedPages.clear()
    }
    // Rule 2: apply the requested start page once we actually have bounds.
    // A cache-hit open runs before layout, so this is the path that usually
    // lands the resume page.
    pendingStartPageIndex?.let { index ->
      pendingStartPageIndex = null
      scrollY = clampScroll(index * slotStride())
      emitPageIfChanged()
    }
    scrollY = clampScroll(scrollY)
    invalidate()
  }

  // Topmost page that is at least half visible — the Android reading of
  // "the page you're on", matching what iOS reports.
  private fun currentPageIndex(): Int {
    val stride = slotStride()
    if (stride <= 0 || totalPages == 0) return 0
    return min(totalPages - 1, max(0, floor((scrollY + height * 0.25) / stride).toInt()))
  }

  private fun emitPageIfChanged() {
    if (totalPages == 0) return
    val page = currentPageIndex() + 1
    if (page != reportedPage) {
      reportedPage = page
      onPageChanged(mapOf("page" to page, "totalPages" to totalPages))
    }
  }

  // MARK: - Drawing

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    if (totalPages == 0 || width <= 0 || height <= 0) return
    val stride = slotStride()
    val first = max(0, (scrollY / stride))
    val last = min(totalPages - 1, ((scrollY + height) / stride))

    for (index in first..last) {
      val dest = pageDrawRect(index) ?: continue
      val bitmap = bitmapCache.get(index)
      if (bitmap != null && !bitmap.isRecycled) {
        canvas.drawBitmap(bitmap, null, dest, null)
      } else {
        canvas.drawRect(dest, placeholderPaint)
        requestRender(index)
      }
      drawHighlightsForPage(canvas, index, dest)
      if (index == selPage) drawSelection(canvas, dest)
    }
    // Keep one page either side warm so a steady scroll doesn't flash
    // placeholders.
    if (first - 1 >= 0) requestRender(first - 1)
    if (last + 1 < totalPages) requestRender(last + 1)
  }

  // Where page `index` is drawn on screen right now. Scaled to fit its slot
  // preserving that page's own aspect ratio, centered — so a page that
  // differs from the document's default is letterboxed, never stretched.
  private fun pageDrawRect(index: Int): RectF? {
    if (width <= 0) return null
    val stride = slotStride()
    val slotTop = index * stride - scrollY
    val slotH = slotHeight()
    val aspect = pageAspects[index] ?: defaultAspect
    var drawH = width * aspect
    var drawW = width.toFloat()
    if (drawH > slotH) {
      drawH = slotH.toFloat()
      drawW = drawH / aspect
    }
    val left = (width - drawW) / 2f
    val top = slotTop + (slotH - drawH) / 2f
    return RectF(left, top, left + drawW, top + drawH)
  }

  private fun drawHighlightsForPage(canvas: Canvas, index: Int, dest: RectF) {
    val pageNum = index + 1
    for (entry in highlights.values) {
      if (entry.page != pageNum) continue
      for (r in entry.rects) drawNormRect(canvas, r, dest, highlightPaint)
    }
  }

  private fun drawNormRect(canvas: Canvas, r: NormRect, dest: RectF, paint: Paint) {
    canvas.drawRect(
      dest.left + (r.x * dest.width()).toFloat(),
      dest.top + (r.y * dest.height()).toFloat(),
      dest.left + ((r.x + r.w) * dest.width()).toFloat(),
      dest.top + ((r.y + r.h) * dest.height()).toFloat(),
      paint,
    )
  }

  private fun drawSelection(canvas: Canvas, dest: RectF) {
    val rects = currentSelectionRects()
    if (rects.isEmpty()) return
    for (r in rects) drawNormRect(canvas, r, dest, selectionPaint)
    // Simple start/end pins, per P3-T5 — enough to show the selection is
    // draggable without imitating the full platform handle treatment.
    val first = rects.first()
    val last = rects.last()
    canvas.drawCircle(
      dest.left + (first.x * dest.width()).toFloat(),
      dest.top + (first.y * dest.height()).toFloat(),
      handleRadiusPx,
      handlePaint,
    )
    canvas.drawCircle(
      dest.left + ((last.x + last.w) * dest.width()).toFloat(),
      dest.top + ((last.y + last.h) * dest.height()).toFloat(),
      handleRadiusPx,
      handlePaint,
    )
  }

  // MARK: - Page rendering (off the main thread)

  private fun requestRender(index: Int) {
    if (index < 0 || index >= totalPages) return
    if (bitmapCache.get(index) != null) return
    if (failedPages.contains(index)) return
    synchronized(rendering) {
      if (!rendering.add(index)) return
    }
    val targetW = width
    val slotH = slotHeight()
    if (targetW <= 0 || slotH <= 0) {
      synchronized(rendering) { rendering.remove(index) }
      return
    }
    android.util.Log.d(TAG, "render start page=$index")
    renderExecutor.execute {
      var bitmap: Bitmap? = null
      var aspect: Float? = null
      try {
        synchronized(pdfLock) {
          val doc = document ?: return@execute
          val page: PdfPage = doc.openPage(index) ?: return@execute
          try {
            val wPt = page.getPageWidthPoint().toFloat()
            val hPt = page.getPageHeightPoint().toFloat()
            if (wPt > 0f && hPt > 0f) aspect = hPt / wPt
            var drawH = (targetW * (aspect ?: defaultAspect)).roundToInt()
            var drawW = targetW
            if (drawH > slotH) {
              drawH = slotH
              drawW = (drawH / (aspect ?: defaultAspect)).roundToInt()
            }
            if (drawW > 0 && drawH > 0) {
              val bmp = Bitmap.createBitmap(drawW, drawH, Bitmap.Config.ARGB_8888)
              bmp.eraseColor(0xFFFFFFFF.toInt())
              page.renderPageBitmap(bmp, 0, 0, drawW, drawH, renderAnnot = false)
              bitmap = bmp
            }
          } finally {
            page.close()
          }
        }
      } catch (e: Exception) {
        // A single page failing to render must not take the reader down.
        android.util.Log.w(TAG, "render failed for page $index: ${e.message}")
      } finally {
        val produced = bitmap
        mainHandler.post {
          synchronized(rendering) { rendering.remove(index) }
          aspect?.let { pageAspects[index] = it }
          if (produced != null) {
            bitmapCache.put(index, produced)
            // Only redraw when there is genuinely something new to show.
            // Invalidating unconditionally here means a page that fails to
            // render drives draw -> request -> fail -> invalidate -> draw
            // forever: an infinite redraw loop that reads as flicker.
            invalidate()
          } else {
            // Give up on this page rather than retrying it on every frame.
            failedPages.add(index)
            android.util.Log.w(TAG, "page $index produced no bitmap; not retrying")
          }
        }
      }
    }
  }

  // MARK: - Selection

  private fun pointToPage(x: Float, y: Float): Pair<Int, Pair<Double, Double>>? {
    val stride = slotStride()
    if (stride <= 0 || totalPages == 0) return null
    val index = ((scrollY + y) / stride).toInt()
    if (index < 0 || index >= totalPages) return null
    val dest = pageDrawRect(index) ?: return null
    if (!dest.contains(x, y)) return null
    // Pdfium's raw text APIs take PDF-native page coordinates: bottom-left
    // origin, y increasing upward. renderPageBitmap flips internally but
    // textPageGetCharIndexAtPos does not, so flip here. (Confirmed against
    // PdfiumAndroid's source: it forwards x/y straight to
    // FPDFText_GetCharIndexAtPos with no transform.)
    val fx = (x - dest.left) / dest.width()
    val fy = (y - dest.top) / dest.height()
    val dims = pageSizePoints(index) ?: return null
    return Pair(index, Pair((fx * dims.first).toDouble(), ((1f - fy) * dims.second).toDouble()))
  }

  private var cachedDims: Pair<Int, Pair<Float, Float>>? = null

  private fun pageSizePoints(index: Int): Pair<Float, Float>? {
    cachedDims?.let { if (it.first == index) return it.second }
    val doc = document ?: return null
    return synchronized(pdfLock) {
      val page = doc.openPage(index) ?: return null
      try {
        val dims = Pair(page.getPageWidthPoint().toFloat(), page.getPageHeightPoint().toFloat())
        cachedDims = Pair(index, dims)
        dims
      } finally {
        page.close()
      }
    }
  }

  private fun textPageFor(index: Int): PdfTextPage? {
    if (selTextPageIndex == index && selTextPage != null) return selTextPage
    closeSelTextPage()
    val doc = document ?: return null
    return synchronized(pdfLock) {
      val page = doc.openPage(index) ?: return null
      val textPage = try {
        page.openTextPage()
      } catch (_: Exception) {
        page.close()
        null
      }
      // The PdfPage is intentionally left open for the life of the text page;
      // closing it can invalidate the text page underneath us. Both are
      // released together in closeSelTextPage().
      selTextPageOwner = page
      selTextPage = textPage
      selTextPageIndex = if (textPage != null) index else -1
      textPage
    }
  }

  private var selTextPageOwner: PdfPage? = null

  private fun closeSelTextPage() {
    synchronized(pdfLock) {
      try { selTextPage?.close() } catch (_: Exception) {}
      try { selTextPageOwner?.close() } catch (_: Exception) {}
    }
    selTextPage = null
    selTextPageOwner = null
    selTextPageIndex = -1
  }

  private fun beginSelectionAt(x: Float, y: Float) {
    val hit = pointToPage(x, y) ?: return
    val (index, pt) = hit
    val textPage = textPageFor(index) ?: return
    val idx = synchronized(pdfLock) {
      try { textPage.textPageGetCharIndexAtPos(pt.first, pt.second, 12.0, 12.0) } catch (_: Exception) { -1 }
    }
    if (idx < 0) return
    selPage = index
    selAnchorChar = idx
    selStartChar = idx
    selEndChar = idx
    isSelecting = true
    performHapticFeedback(android.view.HapticFeedbackConstants.LONG_PRESS)
    onSelectionChanged(mapOf("hasSelection" to true))
    invalidate()
  }

  private fun extendSelectionTo(x: Float, y: Float) {
    if (selPage < 0) return
    val hit = pointToPage(x, y) ?: return
    val (index, pt) = hit
    // A selection stays on the page it started on.
    if (index != selPage) return
    val textPage = textPageFor(index) ?: return
    val idx = synchronized(pdfLock) {
      try { textPage.textPageGetCharIndexAtPos(pt.first, pt.second, 12.0, 12.0) } catch (_: Exception) { -1 }
    }
    if (idx < 0) return
    selStartChar = min(selAnchorChar, idx)
    selEndChar = max(selAnchorChar, idx)
    invalidate()
  }

  private fun endSelectionDrag() {
    isSelecting = false
    onSelectionChanged(mapOf("hasSelection" to (selPage >= 0 && selStartChar in 0..selEndChar)))
  }

  private fun currentSelectionRects(): List<NormRect> {
    if (selPage < 0 || selStartChar < 0 || selEndChar < selStartChar) return emptyList()
    val textPage = textPageFor(selPage) ?: return emptyList()
    return lineGroupedRects(textPage, selPage, selStartChar, selEndChar)
  }

  // Groups consecutive characters' boxes into per-line rects (characters on
  // the same visual line share a Y band) — the same idea as iOS's
  // selectionsByLine(), hand-rolled since Pdfium gives only per-character
  // boxes.
  private fun lineGroupedRects(textPage: PdfTextPage, pageIndex: Int, start: Int, end: Int): List<NormRect> {
    val dims = pageSizePoints(pageIndex) ?: return emptyList()
    val (wPt, hPt) = dims
    if (wPt <= 0f || hPt <= 0f) return emptyList()
    data class Line(var minX: Float, var maxX: Float, var minY: Float, var maxY: Float)
    val lines = mutableListOf<Line>()
    synchronized(pdfLock) {
      for (i in start..end) {
        val box = try { textPage.textPageGetCharBox(i) } catch (_: Exception) { null } ?: continue
        // Confirmed against PdfiumAndroid's source: box.top/box.bottom hold
        // raw PDF-native values unflipped (box.top is numerically the LARGER,
        // visually-higher y — the opposite of Android's top<bottom
        // convention). Flip into top-left origin before grouping.
        val visualTop = hPt - box.top.toFloat()
        val visualBottom = hPt - box.bottom.toFloat()
        val boxH = visualBottom - visualTop
        val boxLeft = box.left.toFloat()
        val boxRight = box.right.toFloat()
        if (boxRight - boxLeft <= 0f || boxH <= 0f) continue
        val midY = visualTop + boxH / 2f
        val line = lines.lastOrNull()?.takeIf { midY in it.minY..it.maxY }
        if (line != null) {
          line.minX = min(line.minX, boxLeft)
          line.maxX = max(line.maxX, boxRight)
        } else {
          lines.add(Line(boxLeft, boxRight, visualTop, visualBottom))
        }
      }
    }
    return lines.map { l ->
      NormRect(
        x = (l.minX / wPt).toDouble(),
        y = (l.minY / hPt).toDouble(),
        w = ((l.maxX - l.minX) / wPt).toDouble(),
        h = ((l.maxY - l.minY) / hPt).toDouble(),
      )
    }
  }

  // MARK: - Highlight tap

  private fun handleTapForHighlight(x: Float, y: Float) {
    val stride = slotStride()
    if (stride <= 0) return
    val index = ((scrollY + y) / stride).toInt()
    if (index < 0 || index >= totalPages) return
    val dest = pageDrawRect(index) ?: return
    if (!dest.contains(x, y)) return
    val fx = (x - dest.left) / dest.width()
    val fy = (y - dest.top) / dest.height()
    val pageNum = index + 1
    // Last drawn wins, matching the draw order the user sees.
    var hitId: String? = null
    for (entry in highlights.values) {
      if (entry.page != pageNum) continue
      for (r in entry.rects) {
        if (fx >= r.x && fx <= r.x + r.w && fy >= r.y && fy <= r.y + r.h) {
          hitId = entry.id
        }
      }
    }
    hitId?.let { onHighlightTapped(mapOf("reactionId" to it)) }
  }

  // MARK: - Imperative commands (called from JS via AsyncFunction)

  fun openDocument(uri: String, startPage: Int, displayMode: String): Map<String, Any> {
    val path = if (uri.startsWith("file://")) uri.removePrefix("file://") else uri
    val file = File(path)
    if (!file.exists()) throw PdfViewException("Couldn't resolve file path: $uri")
    val doc = try {
      val pfd = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
      synchronized(pdfLock) { pdfiumCore.newDocument(pfd) }
    } catch (e: Exception) {
      throw PdfViewException("Couldn't open PDF at $uri: ${e.message}")
    } ?: throw PdfViewException("Couldn't open PDF at $uri")

    closeSelTextPage()
    synchronized(pdfLock) { try { document?.close() } catch (_: Exception) {} }
    document = doc
    totalPages = synchronized(pdfLock) { doc.getPageCount() }
    if (totalPages <= 0) throw PdfViewException("PDF has no pages: $uri")

    bitmapCache.evictAll()
    failedPages.clear()
    pageAspects.clear()
    cachedDims = null
    highlights.clear()
    clearSelectionState()
    setDisplayMode(displayMode)

    // Measure page 0 so every slot has the document's real aspect ratio.
    pageSizePoints(0)?.let { (w, h) -> if (w > 0f && h > 0f) defaultAspect = h / w }

    val clamped = max(1, min(startPage, totalPages))
    reportedPage = 0
    if (width > 0 && height > 0) {
      scrollY = clampScroll((clamped - 1) * slotStride())
      emitPageIfChanged()
      invalidate()
    } else {
      // Rule 2: no bounds yet, so hold it for onSizeChanged.
      pendingStartPageIndex = clamped - 1
    }
    return mapOf("totalPages" to totalPages, "startPage" to clamped)
  }

  // Android ships continuous-scroll only for now. The command exists and is
  // accepted so the JS layer needs no Platform.OS branch (P3-T1); a paged
  // mode would be a separate layout strategy here.
  fun setDisplayMode(mode: String) {
    // No-op: continuous vertical scroll is the only mode implemented.
  }

  fun jumpToPage(page: Int) {
    if (totalPages == 0) return
    val index = max(0, min(page - 1, totalPages - 1))
    if (width <= 0 || height <= 0) {
      pendingStartPageIndex = index
      return
    }
    scroller.forceFinished(true)
    scrollY = clampScroll(index * slotStride())
    emitPageIfChanged()
    invalidate()
  }

  // Rule 1: paints only. Never touches scrollY.
  fun addHighlight(item: Map<String, Any?>) {
    val id = item["id"] as? String ?: return
    val page = (item["page"] as? Number)?.toInt() ?: return
    @Suppress("UNCHECKED_CAST")
    val rawRects = item["rects"] as? List<Map<String, Any?>> ?: emptyList()
    val rects = rawRects.mapNotNull { r ->
      val x = (r["x"] as? Number)?.toDouble()
      val y = (r["y"] as? Number)?.toDouble()
      val w = (r["w"] as? Number)?.toDouble()
      val h = (r["h"] as? Number)?.toDouble()
      if (x != null && y != null && w != null && h != null) NormRect(x, y, w, h) else null
    }
    if (rects.isEmpty()) return
    highlights[id] = HighlightEntry(id, page, rects)
    invalidate()
  }

  // Rule 1: removes only. Never touches scrollY.
  fun removeHighlight(id: String) {
    if (highlights.remove(id) != null) invalidate()
  }

  fun clearCurrentSelection() {
    clearSelectionState()
    onSelectionChanged(mapOf("hasSelection" to false))
    invalidate()
  }

  private fun clearSelectionState() {
    selPage = -1
    selStartChar = -1
    selEndChar = -1
    selAnchorChar = -1
    isSelecting = false
  }

  // Captures the selection as {page, quote, rects} WITHOUT painting a
  // highlight — the caller persists it as a reaction first, then paints it
  // via addHighlight once the row exists, so cancelling the composer leaves
  // no orphan. Same contract as the iOS module.
  fun captureSelection(): Map<String, Any>? {
    if (selPage < 0 || selStartChar < 0 || selEndChar < selStartChar) return null
    val textPage = textPageFor(selPage) ?: return null
    val length = selEndChar - selStartChar + 1
    val quote = synchronized(pdfLock) {
      try { textPage.textPageGetText(selStartChar, length) } catch (_: Exception) { null }
    }?.trim().orEmpty()
    if (quote.isEmpty()) return null
    val rects = lineGroupedRects(textPage, selPage, selStartChar, selEndChar)
    if (rects.isEmpty()) return null
    val page = selPage + 1
    clearSelectionState()
    onSelectionChanged(mapOf("hasSelection" to false))
    invalidate()
    return mapOf(
      "page" to page,
      "quote" to quote,
      "rects" to rects.map { mapOf("x" to it.x, "y" to it.y, "w" to it.w, "h" to it.h) },
    )
  }

  // Deliberately NOT tearing down in onDetachedFromWindow: detach is not
  // destruction. A detached view can be reattached, and shutting the render
  // executor down or closing the document there would leave a live view that
  // can never draw again — the Android twin of the iOS view-lifecycle bug
  // that rendered blank pages. Only release the bitmap cache here, which is
  // pure memory and rebuilds itself on the next draw.
  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    bitmapCache.evictAll()
  }

  // Real teardown, driven by Expo's OnViewDestroys (see the module
  // definition). Safe to call more than once.
  fun destroy() {
    closeSelTextPage()
    renderExecutor.shutdownNow()
    bitmapCache.evictAll()
    synchronized(pdfLock) { try { document?.close() } catch (_: Exception) {} }
    document = null
    totalPages = 0
  }
}
