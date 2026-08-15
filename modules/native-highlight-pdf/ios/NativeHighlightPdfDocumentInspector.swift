import ExpoModulesCore
import PDFKit

// Module-level PDF inspection for the upload flow: page count + a first-page
// cover thumbnail, in one call, with no mounted view required. Replaces
// react-native-pdf's off-screen <Pdf singlePage> render +
// react-native-view-shot's snapshot on iOS (fragile: view-shot was lazily
// require()'d and silently skipped cover capture whenever it wasn't in the
// current dev-client binary). PDFKit's own thumbnail(of:for:) does the same
// job with zero extra dependencies.
enum NativeHighlightPdfDocumentInspector {
  static func inspect(uri: String, coverWidth: Double, coverHeight: Double) throws -> [String: Any] {
    guard let url = resolveUrl(uri) else {
      throw Exception(name: "E_BAD_URI", description: "Couldn't resolve file path: \(uri)")
    }
    guard let document = PDFDocument(url: url) else {
      throw Exception(name: "E_BAD_PDF", description: "Couldn't open PDF at \(uri)")
    }

    var result: [String: Any] = ["pageCount": document.pageCount]

    if let firstPage = document.page(at: 0) {
      let size = CGSize(width: coverWidth, height: coverHeight)
      let thumbnail = firstPage.thumbnail(of: size, for: .mediaBox)
      if let data = thumbnail.jpegData(compressionQuality: 0.7) {
        let dest = FileManager.default.temporaryDirectory
          .appendingPathComponent(UUID().uuidString)
          .appendingPathExtension("jpg")
        try data.write(to: dest)
        result["coverUri"] = dest.absoluteString
      }
    }

    return result
  }

  private static func resolveUrl(_ uri: String) -> URL? {
    if uri.hasPrefix("file://") || uri.hasPrefix("http://") || uri.hasPrefix("https://") {
      return URL(string: uri)
    }
    return URL(fileURLWithPath: uri)
  }
}
