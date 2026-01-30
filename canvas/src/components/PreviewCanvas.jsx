import { useEffect, useRef } from "react";
import * as fabric from "fabric";

export default function PreviewCanvas({
  mockupUrl,
  sideJson,
  onReady,
  large = false,
  colorMode = "rgb",
  offsetX = 0,
  offsetY = 0,
  printArea,
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

    let isMounted = true;

    const loadContent = async () => {
      try {
        if (!mockupUrl) return;

        // 2. Load the Design JSON FIRST
        // This ensures the JSON "resets" the canvas before we add our mockup
        if (sideJson) {
          if (!isMounted) return;
          try {
            await canvas.loadFromJSON(sideJson);

            // COORDINATE MAPPING
            const sourceWidth = sideJson.sourceWidth;
            const sourceHeight = sideJson.sourceHeight;

            if (sourceWidth && sourceHeight) {
                let previewCenter = canvas.getCenterPoint();
                
                // Calculate Scale Helper:
                // Default: Editor Mockup Scale: 0.8 * sourceHeight (approx) -> Preview Mockup Scale: 0.95 * canvasSize
                let scaleFactor = (canvasSize * 0.95) / (sourceHeight * 0.8);

                // OVERRIDE IF PRINT AREA DEFINED
                if (printArea) {
                    // Determine scale relative to 600px standard
                    const guideScale = large ? 1 : (canvasSize / 600);
                    
                    // 1. New Center & Offsets
                    const centerX = canvasSize / 2;
                    const centerY = canvasSize / 2;
                    
                    previewCenter = {
                        x: centerX + ((printArea.leftOffset || 0) * guideScale),
                        y: centerY + ((printArea.topOffset || 0) * guideScale)
                    };

                    // 2. New Scale Factor (ONLY IF WIDTH DEFINED)
                    if (printArea.width) {
                         const areaWidth = printArea.width * guideScale;
                         // Map sourceWidth -> areaWidth
                         scaleFactor = areaWidth / sourceWidth;
                    }
                }

                const sourceCenterX = sourceWidth / 2;
                const sourceCenterY = sourceHeight / 2;
                const rotationRad = printArea && printArea.rotation ? printArea.rotation * (Math.PI / 180) : 0;

                canvas.getObjects().forEach((obj) => {
                // 1. Force Visible / Unlock
                obj.set({
                  selectable: false,
                  evented: false,
                  clipPath: null, // CRITICAL: Remove clipPath to prevent masking issues after scaling
                });

                // 2. Identify and Remove Print Guide (even if name is lost)
                // Print guide is a Rect with dashed stroke.
                const isTypeRect = obj.type.toLowerCase() === "rect";
                const hasDashedStroke =
                  obj.strokeDashArray && obj.strokeDashArray.length > 0;
                const isTransparent = !obj.fill || obj.fill === "transparent";

                const isPrintGuide =
                  obj.name === "printGuide" ||
                  obj.name === "guideline" ||
                  (isTypeRect && hasDashedStroke && isTransparent);

                if (isPrintGuide) {
                  canvas.remove(obj);
                  return;
                }

                // 3. Shift to Origin (relative to source center)
                const relX = obj.left - sourceCenterX;
                const relY = obj.top - sourceCenterY;

                // 4. Scale Position
                let newX = relX * scaleFactor;
                let newY = relY * scaleFactor;

                // 5. Apply Rotation
                // Rotate (newX, newY) around (0,0) which corresponds to the printArea center
                if (rotationRad !== 0) {
                    const cos = Math.cos(rotationRad);
                    const sin = Math.sin(rotationRad);
                    const rotX = newX * cos - newY * sin;
                    const rotY = newX * sin + newY * cos;
                    newX = rotX;
                    newY = rotY;

                    obj.angle += (printArea.rotation || 0);
                }

                // 6. Set Final Position
                obj.left = previewCenter.x + newX;
                obj.top = previewCenter.y + newY;

                obj.scaleX *= scaleFactor;
                obj.scaleY *= scaleFactor;

                obj.setCoords(); // Refresh bounding box
              });
            } else {
              // Fallback for old saves without source dimensions: Heuristic Center
              console.warn("Legacy Save: Auto-centering content");
              const objects = canvas.getObjects();
              if (objects.length > 0) {
                const group = new fabric.Group(objects);
                const groupCenter = group.getCenterPoint();
                const previewCenter = canvas.getCenterPoint();
                const shiftX = previewCenter.x - groupCenter.x;
                const shiftY = previewCenter.y - groupCenter.y;

                // Scale based on canvas size heuristic
                const scale = canvasSize / 800;

                objects.forEach((o) => {
                  o.left += shiftX;
                  o.top += shiftY;
                  o.left = previewCenter.x + (o.left - previewCenter.x) * scale;
                  o.top = previewCenter.y + (o.top - previewCenter.y) * scale;
                  o.scaleX *= scale;
                  o.scaleY *= scale;
                  o.setCoords();
                });
              }
            }
          } catch (err) {
            // Ignore errors if unmounted (likely due to disposal during load)
            if (!isMounted) return;
            throw err;
          }
          if (!isMounted) return;

          canvas.backgroundImage = null;

          canvas.getObjects().forEach((obj) => {
            // System object filtering (already done by Saver mostly, but double check)
            if (obj.name === "printGuide" || obj.name === "guideline") {
              canvas.remove(obj);
            }
            obj.set({ selectable: false, evented: false });
          });
        }

        // 3. Load the Mockup AFTER JSON to lock it as the background
        if (!isMounted) return;
        const img = await fabric.FabricImage.fromURL(mockupUrl, {
          crossOrigin: "anonymous",
        });

        if (!isMounted) return;

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
      isMounted = false;
      canvas.dispose();
    };
  }, [mockupUrl, sideJson, colorMode, large]);

  return (
    <canvas ref={canvasRef} style={{ display: "block", margin: "0 auto" }} />
  );
}
