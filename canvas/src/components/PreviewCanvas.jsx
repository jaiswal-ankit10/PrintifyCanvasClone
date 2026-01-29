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

    // 1. Initialize Canvas with a clean background
    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: false,
      preserveObjectStacking: true,
      width: canvasSize,
      height: canvasSize,
      backgroundColor: "#ffffff",
    });

    const loadContent = async () => {
      try {
        if (!mockupUrl) return;

        // 2. Load the Design JSON FIRST
        // This ensures the JSON "resets" the canvas before we add our mockup
        if (sideJson) {
          await canvas.loadFromJSON(sideJson);

          canvas.backgroundImage = null;

          canvas.getObjects().forEach((obj) => {
            if (obj.name === "printGuide" || obj.name === "guideline") {
              canvas.remove(obj);
              return;
            }
            obj.set({ selectable: false, evented: false });

            // Scale coordinates from 600px edit canvas to 140px grid
            if (!large) {
              const ratio = 140 / 600;
              obj.left *= ratio;
              obj.top *= ratio;
              obj.scaleX *= ratio;
              obj.scaleY *= ratio;
            }
          });
        }

        // 3. Load the Mockup AFTER JSON to lock it as the background
        const img = await fabric.FabricImage.fromURL(mockupUrl, {
          crossOrigin: "anonymous",
        });

        const scale = (canvasSize * 0.95) / Math.max(img.width, img.height);

        img.set({
          scaleX: scale,
          scaleY: scale,
          originX: "center",
          originY: "center",
          left: canvasSize / 2,
          top: canvasSize / 2,
        });

        canvas.backgroundImage = img;

        canvas.renderAll();
        onReady?.(canvas);
      } catch (error) {
        console.error("Error loading preview:", error);
      }
    };

    loadContent();

    return () => {
      canvas.dispose();
    };
  }, [mockupUrl, sideJson, colorMode, large]);

  return (
    <canvas ref={canvasRef} style={{ display: "block", margin: "0 auto" }} />
  );
}
