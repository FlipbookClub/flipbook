import ExpoModulesCore
import PDFKit

// Wraps Apple's PDFKit (the same framework Preview.app and Books.app use) to
// get real, native text selection and highlight annotations — no WebView, no
// third-party SDK. See modules/native-highlight-pdf/README (plan doc) for why.
class NativeHighlightPdfView: ExpoView, UIGestureRecognizerDelegate {
  private let pdfView = PDFView()
  private var startPage: Int = 1
  private var pendingHighlights: [[String: Any]] = []
  // Guards against re-jumping on every prop re-fire once the requested start
  // page has actually been applied for the current document. Reset whenever
  // a new document loads or a genuinely different startPage is requested.
  private var hasAppliedStartPage = false
  // Which (0-indexed) pages currently have painted highlight annotations —
  // lets a repaint touch only pages that actually changed instead of the
  // whole document. See applyPendingHighlights().
  private var highlightedPageIndices: Set<Int> = []
  // Cheap content signature of the last-painted highlight set, so a
  // `highlights` prop re-fire with IDENTICAL data (RN/Fabric's prop diffing
  // for array props isn't guaranteed to be reference-stable across every
  // re-render — see applyPendingHighlights()) is a true no-op rather than a
  // full repaint.
  private var lastHighlightsSignature: String = ""

  let onDocumentLoaded = EventDispatcher()
  let onPageChanged = EventDispatcher()
  let onSelectionChanged = EventDispatcher()
  let onHighlightTapped = EventDispatcher()
  let onLoadError = EventDispatcher()

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
      self, selector: #selector(handleDocumentChanged),
      name: .PDFViewDocumentChanged, object: pdfView)
    NotificationCenter.default.addObserver(
      self, selector: #selector(handlePageChanged),
      name: .PDFViewPageChanged, object: pdfView)
    NotificationCenter.default.addObserver(
      self, selector: #selector(handleSelectionChanged),
      name: .PDFViewSelectionChanged, object: pdfView)

    // BUG-001: a custom long-press recognizer used to live here, synthesizing
    // a selection via `page.selectionForWord(at:)` + `setCurrentSelection`.
    // That produces a *programmatic* selection, which PDFKit does NOT attach
    // its native drag handles to — so extending it required falling back to
    // PDFKit's own built-in double-tap-hold gesture, exactly the "requires
    // double-tap then drag" bug reported. PDFView provides real long-press
    // -> selection-with-handles for free; removing our recognizer lets it
    // win arbitration instead of shadowing it with an inferior substitute.

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

  // MARK: - Props (called by the generated Prop() bindings in the Module)

  func setDocumentUri(_ uri: String) {
    guard let url = resolveUrl(uri) else {
      onLoadError(["message": "Couldn't resolve file path: \(uri)"])
      return
    }
    guard let document = PDFDocument(url: url) else {
      onLoadError(["message": "Couldn't open PDF at \(uri)"])
      return
    }
    pdfView.document = document
    hasAppliedStartPage = false
    // New document — any prior signature/page-index bookkeeping belonged to
    // the previous book and must not cause this one's highlights to be
    // skipped as "unchanged."
    lastHighlightsSignature = ""
    highlightedPageIndices = []
    applyPendingHighlights()
    jumpToStartPageIfNeeded()
  }

  // Prop application order between `documentUri` and `startPage` isn't
  // guaranteed by the view system, so either setter needs to be able to
  // trigger the initial jump — whichever arrives second is the one that
  // actually has both pieces of information available.
  func setStartPage(_ page: Int) {
    let newPage = max(1, page)
    if newPage != startPage {
      startPage = newPage
      hasAppliedStartPage = false
    }
    jumpToStartPageIfNeeded()
  }

  // BUG-002: `PDFView.go(to:)` is unreliable when called synchronously from
  // a prop setter on first mount — the view (pinned to its parent via Auto
  // Layout constraints in init) may not have been through a real layout pass
  // yet, so it has no meaningful bounds for PDFKit to compute a scroll
  // destination against, and the call silently no-ops. The reader then sits
  // on page 1 while `onDocumentLoaded`'s JS handler optimistically reports
  // the *intended* resume page to the server — which the next real scroll
  // event promptly overwrites back down, reading as "always opens on page 1."
  // Deferring one run-loop tick lets the pending layout pass land first.
  private func jumpToStartPageIfNeeded() {
    guard !hasAppliedStartPage, let document = pdfView.document, startPage > 1,
      let page = document.page(at: startPage - 1)
    else { return }
    hasAppliedStartPage = true
    DispatchQueue.main.async { [weak self] in
      guard let self = self, self.pdfView.document === document else { return }
      self.pdfView.go(to: page)
    }
  }

  func setHighlightsData(_ items: [[String: Any]]) {
    pendingHighlights = items
    applyPendingHighlights()
  }

  private func resolveUrl(_ uri: String) -> URL? {
    if uri.hasPrefix("file://") || uri.hasPrefix("http://") || uri.hasPrefix("https://") {
      return URL(string: uri)
    }
    return URL(fileURLWithPath: uri)
  }

  // Cheap, order-independent signature of a highlight set, so a same-content
  // `highlights` prop re-fire is a true no-op. RN/Fabric's prop diffing for
  // array-type props isn't guaranteed to skip the native setter just because
  // the JS-side values are unchanged (that generally requires the JS array
  // to be the SAME reference, which isn't guaranteed across every re-render
  // of the screen) — so without this, `setHighlightsData` can fire far more
  // often than "a highlight was actually added or removed," including from
  // re-renders totally unrelated to highlights (e.g. ordinary page-scroll
  // state updates).
  private func signature(for items: [[String: Any]]) -> String {
    items.map { item -> String in
      let id = (item["id"] as? String) ?? ""
      let page = (item["page"] as? Int) ?? 0
      let rectsSig =
        (item["rects"] as? [[String: Any]])?
        .map { r -> String in
          let x = (r["x"] as? Double) ?? 0
          let y = (r["y"] as? Double) ?? 0
          let w = (r["w"] as? Double) ?? 0
          let h = (r["h"] as? Double) ?? 0
          return "\(x),\(y),\(w),\(h)"
        }
        .joined(separator: ";") ?? ""
      return "\(id):\(page):\(rectsSig)"
    }
    .sorted()
    .joined(separator: "|")
  }

  // Repaints highlight annotations from `pendingHighlights` (server-confirmed
  // data, normalized 0..1 top-left origin per the reactions schema). Each
  // annotation is stamped with its reaction id (via `userName`, a free-form
  // PDFAnnotation string field) so a tap can be traced back to the reaction
  // thread.
  //
  // BUG history: this used to unconditionally clear-and-redraw annotations
  // across the WHOLE document on every call, and got called far more often
  // than intended (see `signature` doc above) — bulk annotation churn in
  // .singlePageContinuous mode was disturbing PDFView's scroll position,
  // which the very next legitimate onPageChanged event then wrote back to
  // the server as the "current page," corrupting resume progress. Fixed two
  // ways together: (1) skip entirely when the content hasn't actually
  // changed, (2) when it has, touch only the pages whose highlights changed,
  // never the whole document.
  private func applyPendingHighlights() {
    guard let document = pdfView.document else { return }

    let newSignature = signature(for: pendingHighlights)
    guard newSignature != lastHighlightsSignature else { return }
    lastHighlightsSignature = newSignature

    var byPageIndex: [Int: [[String: Any]]] = [:]
    for item in pendingHighlights {
      guard let pageNum = item["page"] as? Int else { continue }
      byPageIndex[pageNum - 1, default: []].append(item)
    }
    let newPageIndices = Set(byPageIndex.keys)
    let pagesToTouch = highlightedPageIndices.union(newPageIndices)
    highlightedPageIndices = newPageIndices

    let pageIndexBeforeRepaint = pdfView.currentPage.map { document.index(for: $0) }

    for pageIndex in pagesToTouch {
      guard let page = document.page(at: pageIndex) else { continue }
      for annotation in page.annotations where annotation.type == "Highlight" {
        page.removeAnnotation(annotation)
      }
      guard let items = byPageIndex[pageIndex] else { continue }
      let pageBounds = page.bounds(for: .mediaBox)
      for item in items {
        guard
          let id = item["id"] as? String,
          let rects = item["rects"] as? [[String: Any]]
        else { continue }
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
    }

    // Belt-and-suspenders: re-assert the page we were actually on, even
    // though the pages-touched set above should no longer disturb it.
    // Deferred one run-loop tick in case any disturbance from the mutations
    // above is itself asynchronous inside PDFKit.
    if let wantIndex = pageIndexBeforeRepaint {
      DispatchQueue.main.async { [weak self] in
        guard let self = self, self.pdfView.document === document,
          let restorePage = document.page(at: wantIndex)
        else { return }
        self.pdfView.go(to: restorePage)
      }
    }
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

  @objc private func handleDocumentChanged() {
    guard let document = pdfView.document else { return }
    onDocumentLoaded(["totalPages": document.pageCount])
  }

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

  // MARK: - Imperative functions (called from JS via AsyncFunction)

  func jumpToPage(_ page: Int) {
    guard let document = pdfView.document, let target = document.page(at: page - 1) else { return }
    pdfView.go(to: target)
  }

  func clearCurrentSelection() {
    pdfView.setCurrentSelection(nil, animate: false)
  }

  // Captures whatever's currently selected as {page, quote, rects} — WITHOUT
  // painting an annotation. The caller persists this as a reaction first;
  // the highlight paints back in reactively via the `highlights` prop once
  // that reaction exists (see applyPendingHighlights), so cancelling the
  // composer after this call leaves no orphan annotation. Anchored to the
  // FIRST page the selection touches (matches the reactions schema's
  // one-page-per-highlight model) — a selection spanning pages is
  // vanishingly rare for a single reaction anyway.
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
}
