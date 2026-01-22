import { useEffect, useRef } from "react";
import * as fabric from "fabric";

export default function CanvasArea({
  mockup,
  isPanMode,
  activeMode,
  activeSide,
  zoom,
}) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const panEnabledRef = useRef(isPanMode);

  // 1. INIT CANVAS
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1024,
      height: 600,
      backgroundColor: "#f5f5f0",
      selection: false,
    });

    fabricRef.current = canvas;

    // PRINT AREA (Dotted box)
    const printArea = new fabric.Rect({
      left: canvas.width / 2,
      top: canvas.height / 2 - 20,
      width: 220,
      height: 300,
      originX: "center",
      originY: "center",
      fill: "transparent",
      stroke: "#9a9a9a",
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      strokeWidth: 1,
    });

    canvas.add(printArea);

    // VIEWPORT PANNING
    canvas.on("mouse:down", (opt) => {
      if (panEnabledRef.current) {
        canvas.isDragging = true;
        lastPos.current = { x: opt.e.clientX, y: opt.e.clientY };
        canvas.defaultCursor = "grabbing";
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (canvas.isDragging) {
        const vpt = canvas.viewportTransform;
        vpt[4] += opt.e.clientX - lastPos.current.x;
        vpt[5] += opt.e.clientY - lastPos.current.y;
        canvas.requestRenderAll();
        lastPos.current = { x: opt.e.clientX, y: opt.e.clientY };
      }
    });

    canvas.on("mouse:up", () => {
      canvas.isDragging = false;
      canvas.defaultCursor = panEnabledRef.current ? "grab" : "default";
    });

    return () => canvas.dispose();
  }, []);

  // 2. LOAD MOCKUP (Robust Loading)
  useEffect(() => {
    if (!fabricRef.current || !mockup) return;
    const canvas = fabricRef.current;

    // Clear previous images
    const existingImages = canvas.getObjects("image");
    existingImages.forEach((img) => canvas.remove(img));

    const imgElement = new Image();
    imgElement.src = mockup;
    imgElement.crossOrigin = "anonymous";

    imgElement.onload = () => {
      const fabricImg = new fabric.Image(imgElement, {
        originX: "center",
        originY: "center",
        left: canvas.width / 2,
        top: canvas.height / 2,
        selectable: false,
        evented: false,
      });

      // Match image scale to canvas height
      const scale = (canvas.height * 0.8) / fabricImg.height;
      fabricImg.scale(scale);

      canvas.add(fabricImg);

      // FIX: Use the canvas method to send the object to the bottom of the stack
      canvas.sendObjectToBack(fabricImg);

      canvas.requestRenderAll();
    };

    imgElement.onerror = () => {
      console.error("Could not find image at:", mockup);
    };
  }, [mockup]);

  // 3. ZOOM HANDLER (Centered & Scaled)
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    // Zoom relative to the center of the viewport
    const center = new fabric.Point(canvas.width / 2, canvas.height / 2);
    canvas.zoomToPoint(center, zoom / 100);

    canvas.requestRenderAll();
  }, [zoom]);

  // 4. PAN MODE SYNC
  useEffect(() => {
    panEnabledRef.current = isPanMode;
    if (fabricRef.current) {
      fabricRef.current.defaultCursor = isPanMode ? "grab" : "default";
    }
  }, [isPanMode]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="outline-none" />
    </div>
  );
}
