import { useEffect, useRef } from "react";
import * as fabric from "fabric";

export default function PreviewCanvas({
  mockupUrl,
  sideJson,
  onReady,
  large = false,
  colorMode = "rgb",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvasSize = large ? 600 : 140;

    // 1. Initialize Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: false,
      preserveObjectStacking: true,
      width: canvasSize,
      height: canvasSize,
    });

    const loadContent = async () => {
      try {
        if (!mockupUrl) return;

        // 2. Use FabricImage.fromURL (standard for v6)
        const img = await fabric.FabricImage.fromURL(mockupUrl, {
          crossOrigin: "anonymous",
        });

        // Calculate scale
        const scale = (canvasSize * 0.95) / Math.max(img.width, img.height);

        // V6 FIX: Assign directly to canvas.backgroundImage
        img.set({
          scaleX: scale,
          scaleY: scale,
          originX: "center",
          originY: "center",
          left: canvasSize / 2,
          top: canvasSize / 2,
        });

        canvas.backgroundImage = img;

        // 3. Load the Design JSON
        if (sideJson) {
          // V6 FIX: loadFromJSON is async and does not use a callback in the same way
          await canvas.loadFromJSON(sideJson);

          canvas.getObjects().forEach((obj) => {
            // Do not modify the background image if it ended up in getObjects
            if (obj === img) return;

            obj.set({ selectable: false, evented: false });

            // Scale coordinates from 600px edit canvas to 140px grid
            if (!large) {
              const ratio = 140 / 600;
              obj.left *= ratio;
              obj.top *= ratio;
              obj.scaleX *= ratio;
              obj.scaleY *= ratio;
            }

            // Apply CMYK-like filter to images
            if (colorMode === "cmyk" && obj.type === "image") {
              const saturationFilter = new fabric.filters.Saturation({
                saturation: -0.2,
              });
              obj.filters = [saturationFilter];
              obj.applyFilters();
            }
          });
        }

        canvas.renderAll();
        onReady?.(canvas);
      } catch (error) {
        console.error("Error loading preview canvas:", error);
      }
    };

    loadContent();

    return () => {
      canvas.dispose();
    };
  }, [mockupUrl, sideJson, colorMode, large, onReady]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", margin: "0 auto", border: "1px solid #eee" }}
    />
  );
}
