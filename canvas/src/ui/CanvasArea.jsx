import { useEffect, useRef } from "react";
import * as fabric from "fabric";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export default function CanvasArea({
  mockup,
  isPanMode,
  activeMode,
  activeSide,
  mockupState,
  setMockupState,
  zoom,
}) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const mockupRef = useRef(null);
  const lastPos = useRef(null);
  const zoomAnimRef = useRef(null);
  const panEnabledRef = useRef(isPanMode);
  const modeRef = useRef(activeMode);

  // INIT CANVAS
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1024,
      height: 600,
      selection: false,
    });

    fabricRef.current = canvas;

    // PRINT AREA (fixed)
    const printArea = new fabric.Rect({
      left: 210,
      top: 100,
      width: 300,
      height: 320,
      fill: "transparent",
      stroke: "#9a9a9a",
      strokeDashArray: [6, 6],
      selectable: false,
      evented: false,
    });

    canvas.add(printArea);

    // PAN LOGIC (PRINTIFY STYLE)
    canvas.on("mouse:down", (opt) => {
      if (!panEnabledRef.current || modeRef.current !== "edit") return;
      lastPos.current = opt.pointer;
      canvas.defaultCursor = "grabbing";
    });

    canvas.on("mouse:move", (opt) => {
      if (!lastPos.current || !panEnabledRef.current) return;

      const e = opt.e;
      const vpt = canvas.viewportTransform;

      // This moves the "camera", not the objects
      vpt[4] += e.clientX - lastPos.current.x;
      vpt[5] += e.clientY - lastPos.current.y;

      canvas.requestRenderAll();
      lastPos.current = { x: e.clientX, y: e.clientY };
    });

    canvas.on("mouse:up", () => {
      lastPos.current = null;
      canvas.defaultCursor =
        isPanMode && activeMode === "edit" ? "grab" : "default";

      if (mockupRef.current) {
        setMockupState((prev) => ({
          ...prev,
          [activeSide]: {
            x: mockupRef.current.left,
            y: mockupRef.current.top,
            scale: mockupRef.current.scaleX,
          },
        }));
      }
    });

    return () => canvas.dispose();
  }, []);

  // LOAD MOCKUP PER SIDE
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    canvas.getObjects("image").forEach((o) => canvas.remove(o));

    fabric.Image.fromURL(mockup, (img) => {
      const saved = mockupState[activeSide];

      img.set({
        originX: "center",
        originY: "center",
        left: saved?.x ?? canvas.width / 2,
        top: saved?.y ?? canvas.height / 2,
        scaleX: saved?.scale ?? 1,
        scaleY: saved?.scale ?? 1,
        selectable: false,
        evented: false,
      });

      mockupRef.current = img;
      canvas.add(img);
      canvas.sendToBack(img);
      canvas.requestRenderAll();
    });
  }, [mockup, activeSide]);

  // ZOOM

  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    const center = canvas.getCenter();
    canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom / 100);

    canvas.requestRenderAll();
  }, [zoom]);

  // CURSOR MODE
  useEffect(() => {
    if (!fabricRef.current) return;
    fabricRef.current.defaultCursor =
      isPanMode && activeMode === "edit" ? "grab" : "default";
  }, [isPanMode, activeMode]);

  useEffect(() => {
    panEnabledRef.current = isPanMode;
    modeRef.current = activeMode;
  }, [isPanMode, activeMode]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-white border rounded shadow-sm">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
