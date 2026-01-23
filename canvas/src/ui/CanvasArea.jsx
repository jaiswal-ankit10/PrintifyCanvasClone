import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import * as fabric from "fabric";
import { useFabric } from "../editor/useFabric";
import { Loader2 } from "lucide-react";

const CanvasArea = forwardRef(
  (
    { mockup, isPanMode, zoom, dimensions, activeSide, setZoom, isProcessing },
    ref,
  ) => {
    const canvasRef = useRef(null);
    const {
      fabricRef,
      initCanvas,
      loadMockup,
      addText,
      uploadImage,
      updateAllMasks,
    } = useFabric(dimensions, setZoom);

    // Expose methods to parents (LeftToolbar via EditProduct)
    useImperativeHandle(ref, () => ({
      addText,
      uploadImage,
    }));

    // 1. Initialize Canvas and Print Area
    useEffect(() => {
      const canvas = initCanvas(canvasRef.current);
      const parent = canvasRef.current.parentElement;

      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;

          if (fabricRef.current) {
            // Update Fabric's internal dimensions
            fabricRef.current.setDimensions({ width, height });

            // RE-CENTER UI: Ensure mockup/print area stay centered after resize
            const center = fabricRef.current.getCenterPoint();
            fabricRef.current.getObjects().forEach((obj) => {
              if (!obj.selectable || obj.name === "printGuide") {
                obj.set({
                  left: center.x + (dimensions.leftOffset || 0),
                  top: center.y + (dimensions.topOffset || 0),
                });
                obj.setCoords();
              }
            });

            fabricRef.current.requestRenderAll();
          }
        }
      });

      resizeObserver.observe(parent);

      return () => {
        resizeObserver.disconnect();
        canvas.dispose();
      };
    }, [initCanvas]);

    //  Update Visual Guide & Masks when Side or Dimensions change
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      // Remove old guide if it exists
      const existingGuide = canvas
        .getObjects()
        .find((obj) => obj.name === "printGuide");
      if (existingGuide) canvas.remove(existingGuide);

      // Create new Visual Guide with updated dimensions
      const printArea = new fabric.Rect({
        name: "printGuide",
        left: canvas.width / 2 + (dimensions.leftOffset || 0),
        top: canvas.height / 2 + (dimensions.topOffset || 0),
        width: dimensions.width,
        height: dimensions.height,
        originX: "center",
        originY: "center",
        fill: "transparent",
        stroke: "#9a9a9a",
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        strokeWidth: 1,
        clipPath: null,
      });

      canvas.add(printArea);
      updateAllMasks(dimensions);

      canvas.renderAll();
    }, [activeSide, dimensions, updateAllMasks]);

    // 2. Sync Mockup
    useEffect(() => {
      loadMockup(mockup);
    }, [mockup, loadMockup]);

    // 3. Sync Zoom
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      const currentZoom = canvas.getZoom();
      const targetZoom = zoom / 100;

      if (currentZoom !== targetZoom) {
        const center = canvas.getCenterPoint();
        canvas.zoomToPoint(new fabric.Point(center.x, center.y), targetZoom);
      }
    }, [zoom]);

    // 4. Sync Pan Mode State
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      canvas.isPanModeActive = isPanMode; // Bridge to the hook's event listener
      canvas.defaultCursor = isPanMode ? "grab" : "default";
      canvas.selection = !isPanMode;

      // Toggle selectability of designs based on pan mode
      canvas.getObjects().forEach((obj) => {
        if (obj.type !== "rect") obj.selectable = !isPanMode;
      });
      canvas.renderAll();
    }, [isPanMode]);

    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="outline-none" />

        {/* Localized Print Area Loader */}
        {isProcessing && (
          <div
            className="absolute z-30 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-sm transition-all duration-300"
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              // Position it exactly where the printGuide is
              transform: `translate(${dimensions.leftOffset || 0}px, ${(dimensions.topOffset || 0) - 20}px) scale(${zoom / 100})`,
            }}
          >
            <div className="relative">
              <Loader2 className="w-8 h-8 animate-spin text-[#646323]" />
              <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-[#646323] animate-ping opacity-20"></div>
            </div>
            <span className="mt-2 text-[10px] font-bold text-[#646323] uppercase tracking-tighter">
              Processing
            </span>
          </div>
        )}
      </div>
    );
  },
);

export default CanvasArea;
