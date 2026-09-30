// Browser APIs every target browser has but happy-dom doesn't implement

// FontFaceSet: components wait on document.fonts.ready before measuring text (SplitText)
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
}
