import ExpoModulesCore
import PDFKit

// Wraps Apple's PDFKit (the same framework Preview.app and Books.app use) to
// get real, native text selection and highlight annotations — no WebView, no
// third-party SDK. See modules/native-highlight-pdf/README (plan doc) for why.
class NativeHighlightPdfView: ExpoView, UIGestureRecognizerDelegate {
  private let pdfView = PDFView()
  private var startPage: Int = 1
  private var pendingHighlights: [[String: Any]] = []

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

    // Press-and-hold to select a word, matching standard text-selection
    // affordance (PDFKit's own default is a slower double-tap-hold).
    // minimumPressDuration undercuts PDFKit's internal ~0.5s so ours wins.
    // shouldRecognizeSimultaneously lets it coexist with PDFView's own
    // gesture recognizers (scrolling, its own selection drag handles) —
    // it only ever fires after the finger has been stationary, so normal
    // scrolling is unaffected.
    let longPress = UILongPressGestureRecognizer(target: self, action: #selector(handleLongPress(_:)))
    longPress.minimumPressDuration = 0.35
    longPress.delegate = self
    pdfView.addGestureRecognizer(longPress)

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
    applyPendingHighlights()
    jumpToStartPageIfNeeded()
  }

  // Prop application order between `documentUri` and `startPage` isn't
  // guaranteed by the view system, so either setter needs to be able to
  // trigger the initial jump — whichever arrives second is the one that
  // actually has both pieces of information available.
  func setStartPage(_ page: Int) {
    startPage = max(1, page)
    jumpToStartPageIfNeeded()
  }

  private func jumpToStartPageIfNeeded() {
    guard let document = pdfView.document, startPage > 1,
      let page = document.page(at: startPage - 1)
    else { return }
    pdfView.go(to: page)
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

  // Repaints every highlight annotation from scratch from `pendingHighlights`
  // (server-confirmed data, normalized 0..1 top-left origin per the reactions
  // schema). Simple clear-and-redraw — highlight counts per page are small,
  // so there's no need for incremental diffing here. Each annotation is
  // stamped with its reaction id (via `userName`, a free-form PDFAnnotation
  // string field) so a tap can be traced back to the reaction thread.
  private func applyPendingHighlights() {
    guard let document = pdfView.document else { return }
    for pageIndex in 0..<document.pageCount {
      guard let page = document.page(at: pageIndex) else { continue }
      for annotation in page.annotations where annotation.type == "Highlight" {
        page.removeAnnotation(annotation)
      }
    }
    for item in pendingHighlights {
      guard
        let id = item["id"] as? String,
        let pageNum = item["page"] as? Int,
        let rects = item["rects"] as? [[String: Any]],
        let page = document.page(at: pageNum - 1)
      else { continue }
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

  @objc private func handleLongPress(_ gesture: UILongPressGestureRecognizer) {
    guard gesture.state == .began else { return }
    let point = gesture.location(in: pdfView)
    guard let page = pdfView.page(for: point, nearest: true) else { return }
    let pagePoint = pdfView.convert(point, to: page)
    guard let selection = page.selectionForWord(at: pagePoint) else { return }
    pdfView.setCurrentSelection(selection, animate: true)
    let generator = UIImpactFeedbackGenerator(style: .light)
    generator.impactOccurred()
  }

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
