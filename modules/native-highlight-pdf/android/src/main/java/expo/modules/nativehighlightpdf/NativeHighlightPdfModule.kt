package expo.modules.nativehighlightpdf

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Deliberately mirrors the iOS module's surface exactly (see
// modules/native-highlight-pdf/ios/NativeHighlightPdfModule.swift) so
// ReaderScreen.tsx needs no Platform.OS branching: same command names, same
// argument order, same return shapes, same events.
//
// Note there are no Prop() bindings for document/page/highlight state, and no
// onDocumentLoaded/onLoadError events. That is the point of the architecture:
// commands either resolve or throw, and nothing about the document is driven
// by React prop diffing. See NativeHighlightPdfView's header comment.
//
// Unlike the iOS module there are no explicit .runOnQueue(MAIN) calls: Expo's
// ViewDefinitionBuilder.build() already forces every view AsyncFunction onto
// the main queue on Android, so stating it again would be redundant.
class NativeHighlightPdfModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NativeHighlightPdf")

    View(NativeHighlightPdfView::class) {
      Events("onPageChanged", "onSelectionChanged", "onHighlightTapped", "onSelectionUnavailable")

      // The only correct teardown point. The view deliberately does NOT tear
      // down in onDetachedFromWindow, since a detached view can be
      // reattached and would then be permanently unable to render.
      OnViewDestroys { view: NativeHighlightPdfView ->
        view.destroy()
      }

      AsyncFunction("openDocument") { view: NativeHighlightPdfView, uri: String, startPage: Int, displayMode: String ->
        view.openDocument(uri, startPage, displayMode)
      }

      AsyncFunction("setDisplayMode") { view: NativeHighlightPdfView, mode: String ->
        view.setDisplayMode(mode)
      }

      AsyncFunction("jumpToPage") { view: NativeHighlightPdfView, page: Int ->
        view.jumpToPage(page)
      }

      AsyncFunction("addHighlight") { view: NativeHighlightPdfView, item: Map<String, Any?> ->
        view.addHighlight(item)
      }

      // `page` is accepted for signature parity with iOS (where annotations
      // live on a PDFPage and the page is needed to find them); here
      // highlights are keyed by id alone, so it is unused.
      AsyncFunction("removeHighlight") { view: NativeHighlightPdfView, id: String, page: Int ->
        view.removeHighlight(id)
      }

      AsyncFunction("clearSelection") { view: NativeHighlightPdfView ->
        view.clearCurrentSelection()
      }

      AsyncFunction("captureSelection") { view: NativeHighlightPdfView ->
        view.captureSelection()
      }
    }
  }
}
