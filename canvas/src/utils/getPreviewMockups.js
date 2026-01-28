export function getPreviewMockups(product) {
  if (product.previewMockups) {
    return product.previewMockups;
  }

  return product.mockups;
}
