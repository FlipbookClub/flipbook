import ExpoModulesCore

public class NativeHighlightPdfModule: Module {
  public func definition() -> ModuleDefinition {
    Name("NativeHighlightPdf")

    // Cover capture / page-count for the upload flow. Module-level (no
    // mounted view needed) — opens the picked PDF directly rather than going
    // through react-native-pdf's off-screen render + react-native-view-shot's
    // snapshot (fragile: view-shot was lazily require()'d and silently
    // skipped cover capture whenever it wasn't in the current dev-client
    // binary). See NativeHighlightPdfDocumentInspector.
    AsyncFunction("inspectPdf") { (uri: String, coverWidth: Double, coverHeight: Double) -> [String: Any] in
      try NativeHighlightPdfDocumentInspector.inspect(uri: uri, coverWidth: coverWidth, coverHeight: coverHeight)
    }.runOnQueue(.main)

    View(NativeHighlightPdfView.self) {
      // onDebug is a diagnostic stream (bounds/scale/window-attachment at
      // every render-pipeline state transition) — see refreshRenderPipeline
      // in NativeHighlightPdfView. Safe to leave wired: it only emits on
      // discrete state changes, not per frame.
      Events("onPageChanged", "onSelectionChanged", "onHighlightTapped", "onDebug")

      // Imperative command surface. See NativeHighlightPdfView's top-of-file
      // comment for why this replaced the old documentUri/startPage/highlights
      // reactive Props. All of these touch UIKit (PDFView/PDFAnnotation)
      // through the view, so they run on the main queue explicitly.
      AsyncFunction("openDocument") {
        (view: NativeHighlightPdfView, uri: String, startPage: Int, displayMode: String) -> [String: Any] in
        try view.openDocument(uri: uri, startPage: startPage, displayMode: displayMode)
      }.runOnQueue(.main)

      AsyncFunction("setDisplayMode") { (view: NativeHighlightPdfView, mode: String) in
        view.setDisplayMode(mode)
      }.runOnQueue(.main)

      AsyncFunction("jumpToPage") { (view: NativeHighlightPdfView, page: Int) in
        view.jumpToPage(page)
      }.runOnQueue(.main)

      AsyncFunction("addHighlight") { (view: NativeHighlightPdfView, item: [String: Any]) in
        view.addHighlight(item)
      }.runOnQueue(.main)

      AsyncFunction("removeHighlight") { (view: NativeHighlightPdfView, id: String, page: Int) in
        view.removeHighlight(id: id, page: page)
      }.runOnQueue(.main)

      AsyncFunction("clearSelection") { (view: NativeHighlightPdfView) in
        view.clearCurrentSelection()
      }.runOnQueue(.main)

      // Returns the selection's {page, quote, rects} WITHOUT painting an
      // annotation — the caller persists it as a reaction first, then paints
      // it via addHighlight() once that reaction exists. Avoids an orphan
      // annotation if the user cancels the composer after tapping the
      // highlight FAB.
      AsyncFunction("captureSelection") { (view: NativeHighlightPdfView) -> [String: Any]? in
        return view.captureSelection()
      }.runOnQueue(.main)
    }
  }
}
