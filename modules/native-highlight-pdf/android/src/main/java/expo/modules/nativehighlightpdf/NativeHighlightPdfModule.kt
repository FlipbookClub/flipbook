package expo.modules.nativehighlightpdf

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NativeHighlightPdfModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeHighlightPdf")

    View(NativeHighlightPdfView::class) {
      Events("onDocumentLoaded", "onPageChanged", "onSelectionChanged", "onHighlightCreated", "onLoadError")

      Prop("documentUri") { view: NativeHighlightPdfView, uri: String ->
        view.setDocumentUri(uri)
      }

      Prop("startPage") { view: NativeHighlightPdfView, page: Int ->
        view.setStartPage(page)
      }

      Prop("highlights") { view: NativeHighlightPdfView, highlights: List<Map<String, Any?>> ->
        view.setHighlightsData(highlights)
      }

      AsyncFunction("jumpToPage") { view: NativeHighlightPdfView, page: Int ->
        view.jumpToPage(page)
      }

      AsyncFunction("clearSelection") { view: NativeHighlightPdfView ->
        view.clearCurrentSelection()
      }

      AsyncFunction("createHighlightFromSelection") { view: NativeHighlightPdfView ->
        view.createHighlightFromCurrentSelection()
      }
    }
  }
}
