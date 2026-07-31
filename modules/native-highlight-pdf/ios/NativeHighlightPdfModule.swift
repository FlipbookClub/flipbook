import ExpoModulesCore

public class NativeHighlightPdfModule: Module {
  public func definition() -> ModuleDefinition {
    Name("NativeHighlightPdf")

    View(NativeHighlightPdfView.self) {
      Events("onDocumentLoaded", "onPageChanged", "onSelectionChanged", "onHighlightTapped", "onLoadError")

      Prop("documentUri") { (view: NativeHighlightPdfView, uri: String) in
        view.setDocumentUri(uri)
      }

      Prop("startPage") { (view: NativeHighlightPdfView, page: Int) in
        view.setStartPage(page)
      }

      Prop("highlights") { (view: NativeHighlightPdfView, highlights: [[String: Any]]) in
        view.setHighlightsData(highlights)
      }

      // All four touch UIKit (PDFView/PDFAnnotation) through the view, so they
      // run on the main queue explicitly rather than relying on whichever
      // queue Expo Modules happens to dispatch async functions on by default.
      AsyncFunction("jumpToPage") { (view: NativeHighlightPdfView, page: Int) in
        view.jumpToPage(page)
      }.runOnQueue(.main)

      AsyncFunction("clearSelection") { (view: NativeHighlightPdfView) in
        view.clearCurrentSelection()
      }.runOnQueue(.main)

      // Returns the selection's {page, quote, rects} WITHOUT painting an
      // annotation — the caller persists it as a reaction first, and the
      // highlight paints back in reactively via the `highlights` prop once
      // that reaction exists. Avoids an orphan annotation if the user
      // cancels the composer after tapping the highlight FAB.
      AsyncFunction("captureSelection") { (view: NativeHighlightPdfView) -> [String: Any]? in
        return view.captureSelection()
      }.runOnQueue(.main)
    }
  }
}
