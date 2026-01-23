import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import * as fabric from "fabric";
import { useFabric } from "../editor/useFabric";
import { Loader2 } from "lucide-react";

const CanvasArea = forwardRef(
  (
    {
      mockup,
      isPanMode,
      zoom,
      dimensions,
      activeSide,
      setZoom,
      isProcessing,
      sideData,
      setLayers,
    },
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

    // Memoize sideData to prevent unnecessary re-renders
    const memoizedSideData = useMemo(() => sideData, [sideData, activeSide]);

    useImperativeHandle(ref, () => ({
      addText,
      uploadImage,
      getCanvas: () => fabricRef.current,
    }));

    // 1. Initialize Canvas
    useEffect(() => {
      const canvas = initCanvas(canvasRef.current);
      const parent = canvasRef.current.parentElement;

      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (fabricRef.current) {
            fabricRef.current.setDimensions({ width, height });
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

    // 2. Load side-specific designs
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      const designs = canvas
        .getObjects()
        .filter((obj) => obj.selectable && obj.name !== "printGuide");
      designs.forEach((obj) => canvas.remove(obj));

      if (sideData) {
        canvas.loadFromJSON(sideData, () => {
          updateAllMasks(dimensions);
          canvas.renderAll();

          const userObjects = canvas
            .getObjects()
            .filter((obj) => obj.selectable && obj.name !== "printGuide");
          setLayers([...userObjects].reverse());
        });
      } else {
        canvas.renderAll();
        setLayers([]); // Reset if no data
      }
    }, [activeSide, sideData, setLayers]);

    // 3. Update Visual Guide
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      const existingGuide = canvas
        .getObjects()
        .find((obj) => obj.name === "printGuide");
      if (existingGuide) canvas.remove(existingGuide);

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

    // 4. Sync Mockup
    useEffect(() => {
      loadMockup(mockup);
    }, [mockup, loadMockup]);

    // 5. Sync Zoom
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      const targetZoom = zoom / 100;
      const center = canvas.getCenterPoint();
      canvas.zoomToPoint(new fabric.Point(center.x, center.y), targetZoom);
    }, [zoom]);

    // 6. Sync Pan Mode
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      canvas.isPanModeActive = isPanMode;
      canvas.defaultCursor = isPanMode ? "grab" : "default";
      canvas.selection = !isPanMode;
      canvas.getObjects().forEach((obj) => {
        if (obj.type !== "rect") obj.selectable = !isPanMode;
      });
      canvas.renderAll();
    }, [isPanMode]);

    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="outline-none" />
        {isProcessing && (
          <div
            className="absolute z-30 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-sm transition-all duration-300"
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transform: `translate(${dimensions.leftOffset || 0}px, ${(dimensions.topOffset || 0) - 20}px) scale(${zoom / 100})`,
            }}
          >
            <Loader2 className="w-8 h-8 animate-spin text-[#646323]" />
            <span className="mt-2 text-[10px] font-bold text-[#646323] uppercase">
              Processing
            </span>
          </div>
        )}
      </div>
    );
  },
);

export default CanvasArea;
