Pod::Spec.new do |s|
  s.name           = 'NativeHighlightPdf'
  s.version        = '0.1.0'
  s.summary        = 'Native PDF text-selection + highlight annotation view (PDFKit-backed)'
  s.description    = 'Wraps Apple PDFKit to expose real text selection and highlight annotations to React Native, without a WebView.'
  s.author         = 'Flipbook'
  s.homepage       = 'https://github.com/FlipbookClub/flipbook'
  s.platforms      = {
    :ios => '15.1'
  }
  s.source         = { git: 'https://github.com/FlipbookClub/flipbook.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
