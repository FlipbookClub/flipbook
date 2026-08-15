import ExpoModulesCore
import PDFKit

// Wraps Apple's PDFKit (the same framework Preview.app and Books.app use) to
// get real, native text selection and highlight annotations — no WebView, no
// third-party SDK.
//
// Imperative-command architecture: JS opens the document once via
// openDocument() and thereafter only LISTENS to onPageChanged — PDFKit is the
// sole owner of scroll position from that point on. Nothing except an
// explicit, user-triggered call (openDocument, setDisplayMode, jumpToPage)
// ever calls pdfView.go(to:). An earlier version of this view took
// documentUri/startPage/highlights as reactive React props and grew three
// independent pieces of defensive bookkeeping trying to guess whether a given
// prop re-fire was stale, redundant, or racing another deferred
// DispatchQueue.main.async block — four rounds of device-tested patches later
// the reconciliation itself was still producing new races (a highlight
// repaint's "restore to current page" logic raced the initial resume jump;
// annotation churn disturbed scroll position with no reliable way to
// undo it). Removing the reactive layer removes the whole bug class instead
// of guarding against it: addHighlight/removeHighlight below never call
// pdfView.go() at all, so they structurally cannot move the reader.
class NativeHighlightPdfView: ExpoView, UIGestureRecognizerDelegate {
  private let pdfView = PDFView()
  // The start page requested by openDocument(), held until the view has real
  // bounds to jump within. Applied (and cleared) by refreshRenderPipeline().
  private var pendingStartPageIndex: Int? = nil
  // Last bounds size the render pipeline was asserted against — lets
  // layoutSubviews re-assert only on actual size changes, so routine layout
  // passes (and especially user pinch-zoom, which doesn't change our bounds)
  // never stomp PDFKit's state.
  private var lastAssertedSize: CGSize = .zero
  // PDFView has no public getter for usePageViewController, so track it.
  private var isPagedMode = false

  let onPageChanged = EventDispatcher()
  let onSelectionChanged = EventDispatcher()
  let onHighlightTapped = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    pdfView.autoScales = true
    pdfView.displayMode = .singlePageContinuous
    pdfView.displayDirection = .vertical
    pdfView.translatesAutoresizingMaskIntoConstraints = false
    addSubview(pdfView)
    NSLayoutConstraint.activate([
      pdfView.leadingAnchor.constraint(equalTo: leadingAnchor),
      pdfView.trailingAnchor.constraint(equalTo: trailingAnchor),
      pdfView.topAnchor.constraint(equalTo: topAnchor),
      pdfView.bottomAnchor.constraint(equalTo: bottomAnchor),
    ])

    NotificationCenter.default.addObserver(
      self, selector: #selector(handlePageChanged),
      name: .PDFViewPageChanged, object: pdfView)
    NotificationCenter.default.addObserver(
      self, selector: #selector(handleSelectionChanged),
      name: .PDFViewSelectionChanged, object: pdfView)

    // A custom long-press recognizer used to live here, synthesizing a
    // selection via `page.selectionForWord(at:)` + `setCurrentSelection`.
    // That produces a *programmatic* selection, which PDFKit does NOT attach
    // its native drag handles to — so extending it required falling back to
    // PDFKit's own built-in double-tap-hold gesture, exactly the "requires
    // double-tap then drag" bug this used to have. PDFView provides real
    // long-press -> selection-with-handles for free; removing our recognizer
    // lets it win arbitration instead of shadowing it with an inferior
    // substitute. (The other half of that fix is JS-side: the reader screen
    // wraps this view in `Gesture.Native()` so RNGH's app-wide root
    // recognizer stands down too — see ReaderScreen.tsx.)

    // Tap an existing highlight to open its reaction thread. cancelsTouchesInView
    // = false so this never blocks PDFView's own tap gestures (link-following,
    // double-tap zoom) — worst case both fire, which is harmless here.
    let tap = UITapGestureRecognizer(target: self, action: #selector(handleTap(_:)))
    tap.cancelsTouchesInView = false
    tap.delegate = self
    pdfView.addGestureRecognizer(tap)
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }

  func gestureRecognizer(
    _ gestureRecognizer: UIGestureRecognizer,
    shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer
  ) -> Bool {
    return true
  }

  // MARK: - Render-pipeline self-correction (the actual black-screen fix)

  // Device-verified failure mechanism, reconciled across six build rounds:
  // when openDocument() runs near-instantly (a local-cache HIT — which after
  // enough reading is EVERY open), it executes before this view's layout has
  // settled. PDFKit computes its autoScales scale factor and internal
  // document layout at document-set time against whatever bounds exist right
  // then — compute against unusable bounds and the visual pipeline is
  // silently broken with nothing ever recomputing it (page bookkeeping still
  // works, hence "Page 9 of 488" over black content). A cache MISS's
  // download delay let layout settle first, which is why first-ever opens
  // looked fine and masked this. No fixed delay inside openDocument can be
  // correct — layout arrival is genuinely asynchronous — so instead the view
  // self-corrects at the moments UIKit REPORTS layout state changed:
  // layoutSubviews (bounds arrived/changed) and didMoveToWindow (attached or
  // re-attached, which also covers Fabric view recycling). Event-driven, not
  // timing-guessed.
  override func layoutSubviews() {
    super.layoutSubviews()
    if bounds.size != lastAssertedSize {
      refreshRenderPipeline()
    }
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      refreshRenderPipeline()
    }
  }

  private func refreshRenderPipeline() {
    guard let document = pdfView.document, bounds.width > 0, bounds.height > 0 else { return }
    lastAssertedSize = bounds.size

    // layoutDocumentView() rebuilds PDFKit's internal document layout. It's
    // documented for "after any operation that changes the document", but is
    // unsafe while usePageViewController is on (that mode reparents PDFView's
    // internals into a UIPageViewController that owns its own layout), so
    // it's skipped there — paged mode was already confirmed rendering on
    // device without it.
    if !isPagedMode {
      pdfView.layoutDocumentView()
    }

    // Force an auto-scale re-fit. Assigning `scaleFactor` directly would
    // switch autoScales OFF, and assigning `autoScales = true` when it's
    // already true is an internal no-op that recomputes nothing — so the
    // only reliable re-fit is to toggle it off and back on.
    pdfView.autoScales = false
    pdfView.autoScales = true

    if let index = pendingStartPageIndex, let page = document.page(at: index) {
      pendingStartPageIndex = nil
      pdfView.go(to: page)
    }
  }

  // MARK: - Imperative commands (called from JS via AsyncFunction)

  func openDocument(uri: String, startPage: Int, displayMode: String) throws -> [String: Any] {
    guard let url = resolveUrl(uri) else {
      throw Exception(name: "E_BAD_URI", description: "Couldn't resolve file path: \(uri)")
    }
    guard let document = PDFDocument(url: url) else {
      throw Exception(name: "E_BAD_PDF", description: "Couldn't open PDF at \(uri)")
    }
    // Nil-then-set forces PDFKit to fully tear down any prior document state
    // (Fabric can recycle this view instance across screen entries).
    pdfView.document = nil
    pdfView.document = document
    applyDisplayMode(displayMode)

    let clamped = max(1, min(startPage, document.pageCount))
    pendingStartPageIndex = clamped - 1

    // Assert now if bounds are already valid; if not, layoutSubviews will
    // when they arrive. The extra one-tick pass covers the case where bounds
    // were already settled BEFORE this call (so no further layoutSubviews is
    // coming) but PDFKit's tiling still needs a runloop turn after the
    // document swap. Both paths funnel through the same idempotent refresh.
    lastAssertedSize = .zero
    refreshRenderPipeline()
    let targetIndex = clamped - 1
    DispatchQueue.main.async { [weak self] in
      guard let self = self, self.pdfView.document === document else { return }
      // Re-arm the target before the second pass: the autoScales re-fit
      // inside refreshRenderPipeline can shift scroll offset, which would
      // otherwise silently undo a jump the first pass already applied. One
      // runloop tick in, the user cannot have scrolled, so re-asserting the
      // resume page here is always correct.
      self.pendingStartPageIndex = targetIndex
      self.refreshRenderPipeline()
    }
    return ["totalPages": document.pageCount, "startPage": clamped]
  }

  // A direct, user-triggered mode switch (the reader-customization sheet) —
  // not reactive, so re-anchoring to the current page here is safe and
  // intentional, unlike the highlight-repaint path below.
  func setDisplayMode(_ mode: String) {
    // Switching modes changes document layout, so it goes through the same
    // idempotent refresh as opening — with the current page carried across as
    // the pending target so the reader keeps its place.
    if let document = pdfView.document, let anchor = pdfView.currentPage {
      pendingStartPageIndex = document.index(for: anchor)
    }
    applyDisplayMode(mode)
    lastAssertedSize = .zero
    refreshRenderPipeline()
  }

  // `.singlePage` alone has no built-in swipe-to-turn-page gesture — it
  // renders one static page with no innate way to navigate off it by touch.
  // `usePageViewController` is what actually wires up swipe-based page
  // transitions for a one-page-at-a-time layout; a black-content bug
  // previously attributed to it was, on closer look, the same go(to:)-
  // before-PDFKit's-render-pipeline-is-ready timing issue openDocument() now
  // defers around above (confirmed by that bug also reproducing in
  // Continuous mode, which never touched usePageViewController) — so there
  // was no real reason to avoid it.
  private func applyDisplayMode(_ mode: String) {
    isPagedMode = mode == "paged"
    if isPagedMode {
      pdfView.usePageViewController(true, withViewOptions: nil)
      pdfView.displayDirection = .horizontal
    } else {
      pdfView.usePageViewController(false, withViewOptions: nil)
      pdfView.displayMode = .singlePageContinuous
      pdfView.displayDirection = .vertical
    }
  }

  func jumpToPage(_ page: Int) {
    guard let document = pdfView.document, let target = document.page(at: page - 1) else { return }
    pdfView.go(to: target)
  }

  // Paints one highlight's annotations. Scoped by `userName == id` on
  // removal-before-repaint, so two different highlights sharing a page can't
  // stomp each other (the old per-page bulk-clear-then-repaint-everything
  // could). Deliberately calls pdfView.go() NOWHERE in this function —
  // annotation mutation must never move scroll position. That was the root
  // cause of the mid-session "react to a highlight snaps back to page 1"
  // bug: the old view captured "the page we're on" and scheduled an async
  // restore after every repaint, which raced the initial resume jump and
  // other deferred blocks. Removing the restore removes the race.
  func addHighlight(_ item: [String: Any]) {
    guard let document = pdfView.document,
      let id = item["id"] as? String,
      let pageNum = item["page"] as? Int,
      let rects = item["rects"] as? [[String: Any]],
      let page = document.page(at: pageNum - 1)
    else { return }
    removeAnnotations(id: id, on: page)
    let pageBounds = page.bounds(for: .mediaBox)
    for rectData in rects {
      guard
        let x = rectData["x"] as? Double, let y = rectData["y"] as? Double,
        let w = rectData["w"] as? Double, let h = rectData["h"] as? Double
      else { continue }
      let bounds = denormalizedRect(x: x, y: y, w: w, h: h, pageBounds: pageBounds)
      let annotation = PDFAnnotation(bounds: bounds, forType: .highlight, withProperties: nil)
      annotation.color = UIColor.systemYellow.withAlphaComponent(0.4)
      annotation.userName = id
      page.addAnnotation(annotation)
    }
  }

  func removeHighlight(id: String, page pageNum: Int) {
    guard let document = pdfView.document, let page = document.page(at: pageNum - 1) else { return }
    removeAnnotations(id: id, on: page)
  }

  private func removeAnnotations(id: String, on page: PDFPage) {
    for annotation in page.annotations where annotation.type == "Highlight" && annotation.userName == id {
      page.removeAnnotation(annotation)
    }
  }

  func clearCurrentSelection() {
    pdfView.setCurrentSelection(nil, animate: false)
  }

  // Captures whatever's currently selected as {page, quote, rects} — WITHOUT
  // painting an annotation. The caller persists this as a reaction first;
  // the highlight paints in via an explicit addHighlight() call once that
  // reaction exists, so cancelling the composer after this call leaves no
  // orphan annotation. Anchored to the FIRST page the selection touches
  // (matches the reactions schema's one-page-per-highlight model) — a
  // selection spanning pages is vanishingly rare for a single reaction
  // anyway.
  func captureSelection() -> [String: Any]? {
    guard let selection = pdfView.currentSelection, let document = pdfView.document else { return nil }
    let quote = selection.string?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    guard !quote.isEmpty, let firstPage = selection.pages.first else { return nil }

    let pageIndex = document.index(for: firstPage)
    let pageBounds = firstPage.bounds(for: .mediaBox)

    var rectsOut: [[String: Double]] = []
    for lineSelection in selection.selectionsByLine() {
      guard lineSelection.pages.first == firstPage else { continue }
      let bounds = lineSelection.bounds(for: firstPage)
      guard bounds.width > 0, bounds.height > 0 else { continue }
      rectsOut.append(normalizedRect(bounds, pageBounds: pageBounds))
    }
    guard !rectsOut.isEmpty else { return nil }

    pdfView.setCurrentSelection(nil, animate: false)

    return [
      "page": pageIndex + 1,
      "quote": quote,
      "rects": rectsOut,
    ]
  }

  // MARK: - Helpers

  private func resolveUrl(_ uri: String) -> URL? {
    if uri.hasPrefix("file://") || uri.hasPrefix("http://") || uri.hasPrefix("https://") {
      return URL(string: uri)
    }
    return URL(fileURLWithPath: uri)
  }

  // Our schema's rects are normalized 0..1 with a TOP-LEFT origin (matches
  // how every other screen coordinate in the app already works). PDF space
  // is bottom-left origin, so the y-axis flips on the way in and out. Every
  // operand is explicitly Double — mixing CGFloat and an untyped `1` literal
  // in the same expression is ambiguous to the Swift compiler.
  private func denormalizedRect(x: Double, y: Double, w: Double, h: Double, pageBounds: CGRect) -> CGRect {
    let pageWidth = Double(pageBounds.width)
    let pageHeight = Double(pageBounds.height)
    return CGRect(
      x: x * pageWidth,
      y: (1.0 - y - h) * pageHeight,
      width: w * pageWidth,
      height: h * pageHeight
    )
  }

  private func normalizedRect(_ bounds: CGRect, pageBounds: CGRect) -> [String: Double] {
    let pageWidth = Double(pageBounds.width)
    let pageHeight = Double(pageBounds.height)
    let minX = Double(bounds.minX)
    let minY = Double(bounds.minY)
    let width = Double(bounds.width)
    let height = Double(bounds.height)
    return [
      "x": minX / pageWidth,
      "y": 1.0 - (minY + height) / pageHeight,
      "w": width / pageWidth,
      "h": height / pageHeight,
    ]
  }

  // MARK: - Notifications -> JS events

  @objc private func handlePageChanged() {
    guard let document = pdfView.document, let currentPage = pdfView.currentPage else { return }
    let pageIndex = document.index(for: currentPage)
    onPageChanged(["page": pageIndex + 1, "totalPages": document.pageCount])
  }

  @objc private func handleSelectionChanged() {
    let hasSelection = !(pdfView.currentSelection?.string?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? true)
    onSelectionChanged(["hasSelection": hasSelection])
  }

  // MARK: - Gesture handlers

  @objc private func handleTap(_ gesture: UITapGestureRecognizer) {
    let point = gesture.location(in: pdfView)
    guard let page = pdfView.page(for: point, nearest: false) else { return }
    let pagePoint = pdfView.convert(point, to: page)
    guard
      let annotation = page.annotation(at: pagePoint),
      annotation.type == "Highlight",
      let reactionId = annotation.userName
    else { return }
    onHighlightTapped(["reactionId": reactionId])
  }
}
