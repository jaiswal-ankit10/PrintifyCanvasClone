export function getSideForPreview(previewKey, canvasData) {
  const key = previewKey.toLowerCase();

  if (canvasData[previewKey]) return canvasData[previewKey];

  if (key.includes("back")) return canvasData.back || canvasData.front;
  if (key.includes("sleeve")) {
    return key.includes("left")
      ? canvasData.sleeveLeft
      : canvasData.sleeveRight;
  }
  return canvasData.front || canvasData.mug;
}
