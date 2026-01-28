import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import * as fabric from "fabric";
import { Loader2 } from "lucide-react";
import { useFabric } from "../editor/useFabric";

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
      onSelectionChange,
      onUndoRedoChange,
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
      addGraphic,
      updateAllMasks,
      undo,
      redo,
      canRedo,
      canUndo,
      selectedObject,
      deleteSelected,
      copySelected,
      changeColor,
    } = useFabric(dimensions, setZoom);

    const setLayersRef = useRef(setLayers);

    useEffect(() => {
      setLayersRef.current = setLayers;
    }, [setLayers]);

    /* Lock mockup & print guide permanently */
    const enforceSystemObjects = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.getObjects().forEach((obj) => {
        if (obj.name === "mockupBackground") {
          obj.set({
            selectable: false,
            evented: false,
            visible: true,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            excludeFromExport: true,
          });
          canvas.sendObjectToBack(obj);
        }

        if (obj.name === "printGuide") {
          obj.set({
            selectable: false,
            evented: false,
            visible: true,
            lockMovementX: true,
            excludeFromExport: true,
            lockMovementY: true,
          });
        }
      });
    }, []);

    /* Sync user layers */
    const syncLayers = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Include all user-added objects even when selection is temporarily disabled (e.g., pan mode)
      const layers = canvas
        .getObjects()
        .filter(
          (obj) =>
            obj.name !== "mockupBackground" &&
            obj.name !== "printGuide" &&
            obj.userEditable !== false, // default true/undefined counts as editable
        )
        .slice()
        .reverse();

      setLayersRef.current((prev) => {
        if (prev.length !== layers.length) return layers;
        const changed = layers.some((obj, i) => obj !== prev[i]);
        return changed ? layers : prev;
      });
    }, []);

    /* Public canvas API */
    const addImageFromURL = useCallback(
      (url) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        (async () => {
          try {
            // Fabric v7: promise-based image loading
            const img = await fabric.FabricImage.fromURL(url, {
              crossOrigin: "anonymous",
            });
            // Scale image if it's too large
            if (img.width > 400) {
              img.scaleToWidth(250);
            } else if (img.height > 400) {
              img.scaleToHeight(250);
            }

            // Position image in the center of the print area
            const centerX = canvas.width / 2 + (dimensions.leftOffset || 0);
            const centerY = canvas.height / 2 + (dimensions.topOffset || 0);

            // Create clip mask for print area
            const clipMask = new fabric.Rect({
              left: centerX,
              top: centerY,
              width: dimensions.width,
              height: dimensions.height,
              originX: "center",
              originY: "center",
              absolutePositioned: true,
              inverted: false,
            });

            img.set({
              left: centerX,
              top: centerY,
              originX: "center",
              originY: "center",
              selectable: true,
              evented: true,
              visible: true,
              name: "user-image",
              userEditable: true,
              clipPath: clipMask,
            });

            canvas.add(img);
            canvas.setActiveObject(img);

            // Ensure mockup stays at back
            enforceSystemObjects();

            canvas.requestRenderAll();
            syncLayers();
          } catch (error) {
            console.error("Error loading image from URL:", error);
          }
        })();
      },
      [syncLayers, dimensions, enforceSystemObjects],
    );

    useImperativeHandle(ref, () => ({
      addText,
      uploadImage,
      addGraphic,
      addImageFromURL,
      getCanvas: () => fabricRef.current,
      undo,
      redo,
      canRedo,
      canUndo,
      selectedObject,
      deleteSelected,
      copySelected,
      changeColor,
    }));

    /* Init canvas */
    useEffect(() => {
      const canvas = initCanvas(canvasRef.current);
      const parent = canvasRef.current.parentElement;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          canvas.setDimensions({ width, height });
          updateAllMasks(dimensions);
          enforceSystemObjects();
          canvas.requestRenderAll();
        }
      });

      resizeObserver.observe(parent);

      return () => {
        resizeObserver.disconnect();
        canvas.dispose();
      };
    }, [initCanvas, dimensions, enforceSystemObjects, updateAllMasks]);

    /* Load side JSON & listen for changes */
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      let isLoading = false;

      const onAdded = (e) => {
        if (isLoading || !e.target) return;
        enforceSystemObjects();
        syncLayers();
      };

      const onRemoved = () => syncLayers();

      const onModified = (e) => {
        if (!e.target?.selectable) return;
        syncLayers();
      };

      canvas.on("object:added", onAdded);
      canvas.on("object:removed", onRemoved);
      canvas.on("object:modified", onModified);

      if (sideData) {
        isLoading = true;
        canvas.loadFromJSON(sideData, () => {
          isLoading = false;
          updateAllMasks(dimensions);
          enforceSystemObjects();
          canvas.requestRenderAll();
          syncLayers();
        });
      }

      return () => {
        canvas.off("object:added", onAdded);
        canvas.off("object:removed", onRemoved);
        canvas.off("object:modified", onModified);
      };
    }, [
      activeSide,
      sideData,
      dimensions,
      enforceSystemObjects,
      syncLayers,
      updateAllMasks,
    ]);

    /* Print guide */
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      const oldGuide = canvas.getObjects().find((o) => o.name === "printGuide");
      if (oldGuide) canvas.remove(oldGuide);

      const guide = new fabric.Rect({
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
      });

      canvas.add(guide);
      enforceSystemObjects();
      canvas.requestRenderAll();
    }, [dimensions, enforceSystemObjects]);

    /* Mockup */
    useEffect(() => {
      loadMockup(mockup);
    }, [mockup, loadMockup]);

    /* Zoom */
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      const center = canvas.getCenterPoint();
      canvas.zoomToPoint(new fabric.Point(center.x, center.y), zoom / 100);
    }, [zoom]);

    /* Sync canvas state with parent */
    useEffect(() => {
      if (onSelectionChange && selectedObject !== undefined) {
        onSelectionChange(selectedObject);
      }
    }, [selectedObject, onSelectionChange]);

    useEffect(() => {
      if (onUndoRedoChange) {
        onUndoRedoChange({ canUndo, canRedo });
      }
    }, [canUndo, canRedo, onUndoRedoChange]);

    /* Pan mode */
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      canvas.isPanModeActive = isPanMode;
      canvas.selection = !isPanMode;
      canvas.defaultCursor = isPanMode ? "grab" : "default";

      canvas.discardActiveObject();

      canvas.getObjects().forEach((obj) => {
        if (obj.name !== "printGuide" && obj.name !== "mockupBackground") {
          obj.selectable = !isPanMode;
        }
      });

      canvas.requestRenderAll();
    }, [isPanMode]);

    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="outline-none" />

        {isProcessing && (
          <div
            className="absolute z-30 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm"
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transform: `translate(${dimensions.leftOffset || 0}px, ${
                (dimensions.topOffset || 0) - 20
              }px) scale(${zoom / 100})`,
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
