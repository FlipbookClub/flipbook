package expo.modules.nativehighlightpdf

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.os.ParcelFileDescriptor
import android.view.MotionEvent
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import io.legere.pdfiumandroid.PdfDocument
import io.legere.pdfiumandroid.PdfPage
import io.legere.pdfiumandroid.PdfTextPage
import io.legere.pdfiumandroid.PdfiumCore
import java.io.File
import kotlin.math.max
import kotlin.math.min

private data class NormRect(val x: Double, val y: Double, val w: Double, val h: Double)

// Android has no first-party equivalent of iOS's PDFKit (androidx.pdf's
// PdfViewerFragment turned out to only support annotation via handing off to
// a DIFFERENT app via an intent — no in-process API). So this renders pages
// itself via PdfiumAndroid (the same PDFium binding react-native-pdf already
// depends on — see android/build.gradle) and hand-rolls text selection using
// its character hit-testing API, then draws highlight rects as our OWN
// overlay rather than a PDF-embedded annotation. We only need to persist the
// highlight DATA to our backend, not embed it in the PDF file itself, so this
// achieves the same practical outcome as the iOS module.
//
// Draw + touch handling live directly on THIS ExpoView (not a nested child
// View) — a separately-added child view's onTouchEvent never fired, almost
// certainly because RN/Fabric's touch dispatch on the outer ExpoView doesn't
// hand raw touches down to a manually-addView'd platform child the way plain
// Android ViewGroups do. Being the outer view ourselves sidesteps that.
class NativeHighlightPdfView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onDocumentLoaded by EventDispatcher()
  private val onPageChanged by EventDispatcher()
  private val onSelectionChanged by EventDispatcher()
  private val onHighlightCreated by EventDispatcher()
  private val onLoadError by EventDispatcher()

  private val pdfiumCore = PdfiumCore(context)
  private var document: PdfDocument? = null
  private var totalPages = 0
  private var startPageProp = 1

  private var currentPageIndex = 0
  private var currentPage: PdfPage? = null
  private var currentTextPage: PdfTextPage? = null
  private var pageBitmap: Bitmap? = null
  private var pageWidthPt = 0f
  private var pageHeightPt = 0f

  // Highlights confirmed by the server for the CURRENT page, already
  // normalized (from the `highlights` prop). Repainted on every page load.
  private var persistedRects: List<NormRect> = emptyList()
  // A highlight just created locally, painted immediately so the reader
  // doesn't wait on a round-trip before seeing their own mark (mirrors the
  // iOS module's same "paint now, backend catches up" approach).
  private var localRects: List<NormRect> = emptyList()

  private var selStartChar = -1
  private var selEndChar = -1
  private var dragAnchorChar = -1
  private var isSelecting = false

  private val highlightPaint = Paint().apply { color = 0x66FBC02D.toInt() }
  private val selectionPaint = Paint().apply { color = 0x664285F4.toInt() }

  init {
    setWillNotDraw(false) // ViewGroups skip onDraw by default — we need it.
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    pageBitmap?.let { canvas.drawBitmap(it, 0f, 0f, null) }
    drawRects(canvas, persistedRects, highlightPaint)
    drawRects(canvas, localRects, highlightPaint)
    drawRects(canvas, currentSelectionRects(), selectionPaint)
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    if (w > 0 && h > 0) renderCurrentPage()
  }

  override fun onTouchEvent(event: MotionEvent): Boolean = handleTouch(event)

  // A ViewGroup normally sends touches to children and only calls its own
  // onTouchEvent if none consume it. Since we have no children, force every
  // touch straight to our own onTouchEvent.
  override fun onInterceptTouchEvent(event: MotionEvent): Boolean = true

  private fun drawRects(canvas: Canvas, rects: List<NormRect>, paint: Paint) {
    val w = width.toFloat()
    val h = height.toFloat()
    if (w <= 0 || h <= 0) return
    for (r in rects) {
      canvas.drawRect(
        (r.x * w).toFloat(),
        (r.y * h).toFloat(),
        ((r.x + r.w) * w).toFloat(),
        ((r.y + r.h) * h).toFloat(),
        paint,
      )
    }
  }

  // MARK: - Props

  fun setDocumentUri(uri: String) {
    try {
      val path = if (uri.startsWith("file://")) uri.removePrefix("file://") else uri
      val pfd = ParcelFileDescriptor.open(File(path), ParcelFileDescriptor.MODE_READ_ONLY)
      document = pdfiumCore.newDocument(pfd)
      totalPages = document?.getPageCount() ?: 0
      onDocumentLoaded(mapOf("totalPages" to totalPages))
      loadPage(max(0, min(startPageProp - 1, totalPages - 1)))
    } catch (e: Exception) {
      onLoadError(mapOf("message" to ("Couldn't open PDF at $uri: ${e.message}")))
    }
  }

  fun setStartPage(page: Int) {
    startPageProp = max(1, page)
    if (document != null) loadPage(max(0, min(startPageProp - 1, totalPages - 1)))
  }

  // items: List of {id, page, rects: [{x,y,w,h}]} — matches convex reactions'
  // listHighlights shape. Only the ones for the CURRENTLY loaded page apply.
  fun setHighlightsData(items: List<Map<String, Any?>>) {
    val pageNum = currentPageIndex + 1
    persistedRects = items
      .filter { (it["page"] as? Number)?.toInt() == pageNum }
      .flatMap { item ->
        @Suppress("UNCHECKED_CAST")
        val rects = item["rects"] as? List<Map<String, Any?>> ?: emptyList()
        rects.mapNotNull { r ->
          val x = (r["x"] as? Number)?.toDouble()
          val y = (r["y"] as? Number)?.toDouble()
          val w = (r["w"] as? Number)?.toDouble()
          val h = (r["h"] as? Number)?.toDouble()
          if (x != null && y != null && w != null && h != null) NormRect(x, y, w, h) else null
        }
      }
    invalidate()
  }

  // MARK: - Page loading + rendering

  private fun loadPage(index: Int) {
    val doc = document ?: return
    if (index < 0 || index >= totalPages) return
    currentTextPage?.close()
    currentPage?.close()

    val page = doc.openPage(index) ?: run {
      onLoadError(mapOf("message" to "Couldn't open page $index"))
      return
    }
    currentPage = page
    currentTextPage = page.openTextPage()
    pageWidthPt = page.getPageWidthPoint().toFloat()
    pageHeightPt = page.getPageHeightPoint().toFloat()
    currentPageIndex = index
    localRects = emptyList()
    persistedRects = emptyList()
    selStartChar = -1
    selEndChar = -1

    renderCurrentPage()
    onPageChanged(mapOf("page" to (index + 1), "totalPages" to totalPages))
    // Caller (JS) re-supplies `highlights` for the new page via the prop
    // right after this fires.
  }

  private fun renderCurrentPage() {
    val page = currentPage ?: return
    val w = width
    val h = height
    if (w <= 0 || h <= 0) return
    val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
    page.renderPageBitmap(bitmap, 0, 0, w, h, renderAnnot = false)
    pageBitmap = bitmap
    invalidate()
  }

  // MARK: - Touch -> text selection

  // Confirmed against PdfiumAndroid's source (PdfTextPageU.textPageGetCharIndexAtPos):
  // it forwards x/y straight to FPDFText_GetCharIndexAtPos with no transform,
  // which expects PDF-native page coordinates — bottom-left origin, y
  // increasing upward. renderPageBitmap handles the flip to bitmap/device
  // space internally, but the raw text APIs do not, so we flip here.
  private fun viewToPagePoint(x: Float, y: Float): Pair<Double, Double> {
    val w = width.toFloat().coerceAtLeast(1f)
    val h = height.toFloat().coerceAtLeast(1f)
    val pdfX = (x / w * pageWidthPt).toDouble()
    val pdfY = (pageHeightPt - y / h * pageHeightPt).toDouble()
    return Pair(pdfX, pdfY)
  }

  private fun handleTouch(event: MotionEvent): Boolean {
    val textPage = currentTextPage ?: return false
    val (ptX, ptY) = viewToPagePoint(event.x, event.y)
    return when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        val idx = textPage.textPageGetCharIndexAtPos(ptX, ptY, 12.0, 12.0)
        if (idx < 0) return false
        dragAnchorChar = idx
        selStartChar = idx
        selEndChar = idx
        isSelecting = true
        invalidate()
        true
      }
      MotionEvent.ACTION_MOVE -> {
        if (!isSelecting) return false
        val idx = textPage.textPageGetCharIndexAtPos(ptX, ptY, 12.0, 12.0)
        if (idx >= 0) {
          selStartChar = min(dragAnchorChar, idx)
          selEndChar = max(dragAnchorChar, idx)
          invalidate()
        }
        true
      }
      MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
        isSelecting = false
        val hasSelection = selStartChar in 0..selEndChar
        onSelectionChanged(mapOf("hasSelection" to hasSelection))
        true
      }
      else -> false
    }
  }

  private fun currentSelectionRects(): List<NormRect> {
    val textPage = currentTextPage ?: return emptyList()
    if (selStartChar < 0 || selEndChar < selStartChar) return emptyList()
    return lineGroupedRects(textPage, selStartChar, selEndChar)
  }

  // Groups consecutive characters' boxes into per-line rects (characters on
  // the same visual line share a Y band) — same idea as iOS's
  // `selectionsByLine()`, hand-rolled here since PdfiumAndroid gives us only
  // per-character boxes.
  private fun lineGroupedRects(textPage: PdfTextPage, start: Int, end: Int): List<NormRect> {
    if (pageWidthPt <= 0f || pageHeightPt <= 0f) return emptyList()
    data class Line(var minX: Float, var maxX: Float, var minY: Float, var maxY: Float)
    val lines = mutableListOf<Line>()
    for (i in start..end) {
      val box = textPage.textPageGetCharBox(i) ?: continue
      // Confirmed against PdfiumAndroid's source: box.top/box.bottom hold the
      // raw PDF-native values unflipped (box.top is numerically the LARGER,
      // visually-higher y — the opposite of Android's usual top<bottom
      // convention). Flip into top-left-origin (visualTop < visualBottom,
      // distance from the page's top edge) before grouping/normalizing.
      val visualTop = pageHeightPt - box.top
      val visualBottom = pageHeightPt - box.bottom
      val height = visualBottom - visualTop
      if (box.width() <= 0f || height <= 0f) continue
      val midY = visualTop + height / 2f
      val line = lines.lastOrNull()?.takeIf { midY in it.minY..it.maxY }
      if (line != null) {
        line.minX = min(line.minX, box.left)
        line.maxX = max(line.maxX, box.right)
      } else {
        lines.add(Line(box.left, box.right, visualTop, visualBottom))
      }
    }
    return lines.map { l ->
      NormRect(
        x = (l.minX / pageWidthPt).toDouble(),
        y = (l.minY / pageHeightPt).toDouble(),
        w = ((l.maxX - l.minX) / pageWidthPt).toDouble(),
        h = ((l.maxY - l.minY) / pageHeightPt).toDouble(),
      )
    }
  }

  // MARK: - Imperative functions

  fun jumpToPage(page: Int) {
    loadPage(max(0, min(page - 1, totalPages - 1)))
  }

  fun clearCurrentSelection() {
    selStartChar = -1
    selEndChar = -1
    invalidate()
  }

  fun createHighlightFromCurrentSelection() {
    val textPage = currentTextPage ?: return
    if (selStartChar < 0 || selEndChar < selStartChar) return
    val length = selEndChar - selStartChar + 1
    val quote = textPage.textPageGetText(selStartChar, length)?.trim().orEmpty()
    if (quote.isEmpty()) return

    val rects = lineGroupedRects(textPage, selStartChar, selEndChar)
    if (rects.isEmpty()) return

    localRects = localRects + rects
    selStartChar = -1
    selEndChar = -1
    invalidate()

    onHighlightCreated(
      mapOf(
        "page" to (currentPageIndex + 1),
        "quote" to quote,
        "rects" to rects.map { mapOf("x" to it.x, "y" to it.y, "w" to it.w, "h" to it.h) },
      ),
    )
  }
}
