import ExpoModulesCore

public class NativeHighlightPdfModule: Module {
  public func definition() -> ModuleDefinition {
    Name("NativeHighlightPdf")

    View(NativeHighlightPdfView.self) {
      Events("onDocumentLoaded", "onPageChanged", "onSelectionChanged", "onHighlightCreated", "onLoadError")

      Prop("documentUri") { (view: NativeHighlightPdfView, uri: String) in
        view.setDocumentUri(uri)
      }

      Prop("startPage") { (view: NativeHighlightPdfView, page: Int) in
        view.setStartPage(page)
      }

      Prop("highlights") { (view: NativeHighlightPdfView, highlights: [[String: Any]]) in
        view.setHighlightsData(highlights)
      }

      AsyncFunction("jumpToPage") { (view: NativeHighlightPdfView, page: Int) in
        view.jumpToPage(page)
      }

      AsyncFunction("clearSelection") { (view: NativeHighlightPdfView) in
        view.clearCurrentSelection()
      }

      AsyncFunction("createHighlightFromSelection") { (view: NativeHighlightPdfView) in
        view.createHighlightFromCurrentSelection()
      }
    }
  }
}
