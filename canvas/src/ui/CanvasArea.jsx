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

// Simple debounce
const useDebounce = (fn, delay) => {
  const timeoutRef = useRef(null);
  const fnRef = useRef(fn);
  
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fnRef.current?.(...args);
    }, delay);
  }, [delay]);
};

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
      onCanvasChange,
    },
    ref,
  ) => {
    const canvasRef = useRef(null);
    
    // Debounce the change notification to prevent infinite loops and thrashing
    const debouncedOnCanvasChange = useDebounce(() => {
      if (onCanvasChange) onCanvasChange();
    }, 500);

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
          });
          canvas.sendObjectToBack(obj);
        }

        if (obj.name === "printGuide") {
          obj.set({
            selectable: false,
            evented: false,
            visible: true,
            lockMovementX: true,
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
            if (onCanvasChange) onCanvasChange();
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

    /* SELF-HEALING: Mockup */
    useEffect(() => {
      if (!fabricRef.current || !mockup) return;
      const canvas = fabricRef.current;

      // Check if mockup exists
      const existing = canvas
        .getObjects()
        .find((o) => o.name === "mockupBackground");
      if (!existing) {
        loadMockup(mockup);
      }
    }, [mockup, loadMockup]);

    /* SELF-HEALING: Print Guide */
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      const existingGuide = canvas
        .getObjects()
        .find((o) => o.name === "printGuide");
      if (!existingGuide) {
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
        canvas.requestRenderAll();
      }
      // Note: We don't remove/update existing guide here to avoid conflict with active resize
      // The updateAllMasks and resizeObserver handle dimensions updates.
    }, [dimensions]);

    /* Load side JSON & listen for changes */
    const currentSideRef = useRef(activeSide);

    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      let isLoading = false;

      const onAdded = (e) => {
        if (isLoading || !e.target) return;
        enforceSystemObjects();
        syncLayers();
        
        const isSystem =
          e.target.name === "mockupBackground" || e.target.name === "printGuide";
        if (!isSystem) {
          debouncedOnCanvasChange();
        }
      };

      const onRemoved = (e) => {
        syncLayers();
        const isSystem =
          e.target?.name === "mockupBackground" ||
          e.target?.name === "printGuide";
        if (!isSystem) {
          debouncedOnCanvasChange();
        }
      };

      const onModified = (e) => {
        if (!e.target?.selectable) return;
        syncLayers();
        debouncedOnCanvasChange();
      };

      canvas.on("object:added", onAdded);
      canvas.on("object:removed", onRemoved);
      canvas.on("object:modified", onModified);

      // Only load JSON if the active side has changed or if it's the first load
      if (
        currentSideRef.current !== activeSide ||
        canvas.getObjects().length <= 2
      ) {
        currentSideRef.current = activeSide;
        isLoading = true;

        const restoreSystemObjects = () => {
          // 1. Restore Mockup (Force reload to ensure correct side's mockup)
          // Fix Duplication: Remove existing mockup before loading a new one
          const oldMockup = canvas
            .getObjects()
            .find((o) => o.name === "mockupBackground");
          if (oldMockup) canvas.remove(oldMockup);

          loadMockup(mockup);

          // 2. Restore Print Guide
          const oldGuide = canvas
            .getObjects()
            .find((o) => o.name === "printGuide");
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
        };

        if (sideData) {
          canvas.loadFromJSON(sideData, () => {
            isLoading = false;

            // GHOST BUSTING
            canvas.getObjects().forEach((obj) => {
              const isSystemName =
                obj.name === "mockupBackground" || obj.name === "printGuide";
              // Check for nameless images/rects that shouldn't be there
              // STRICTER: If it's not text or user-image/graphic, kill it.
              const isAllowed =
                obj.type.includes("text") ||
                obj.name === "user-image" ||
                obj.name === "user-graphic" ||
                obj.userEditable === true ||
                // Allow user objects that might have lost name but are selectable
                // BUT EXCLUDE anything that looks like an imposter mockup (huge image at 0,0)
                (obj.selectable === true && obj.width < canvas.width * 0.9);

              if (isSystemName || !isAllowed) {
                canvas.remove(obj);
              }

              // DOUBLE CHECK: If it is an image, huge, and nameless -> IT IS AN IMPOSTER. KILL IT.
              // BUT: Spare it if it is explicitly userEditable
              if (
                obj.type === "image" &&
                !obj.name &&
                !obj.userEditable &&
                obj.width > canvas.width * 0.5
              ) {
                 canvas.remove(obj);
              }
            });

            restoreSystemObjects();
            updateAllMasks(dimensions);
            enforceSystemObjects();
            canvas.requestRenderAll();
            syncLayers();
          });
        } else {
          // No side data -> Clear and restore
          canvas.clear();
          isLoading = false;
          restoreSystemObjects();
          syncLayers();
          canvas.requestRenderAll();
        }
      }

      return () => {
        canvas.off("object:added", onAdded);
        canvas.off("object:removed", onRemoved);
        canvas.off("object:modified", onModified);
      };
    }, [
      activeSide,
      // sideData, // REMOVED to prevent loop
      dimensions,
      enforceSystemObjects,
      syncLayers,
      updateAllMasks,
      onCanvasChange,
    ]);
    
    /* Print guide and Mockup are now handled by the main loading effect */

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
