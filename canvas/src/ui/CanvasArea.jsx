import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
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
      getUserLayers,
      updateAllMasks,
    } = useFabric(dimensions, setZoom);

    // Store latest values in refs to avoid dependency issues
    const getUserLayersRef = useRef(getUserLayers);
    const setLayersRef = useRef(setLayers);

    useEffect(() => {
      getUserLayersRef.current = getUserLayers;
      setLayersRef.current = setLayers;
    }, [getUserLayers, setLayers]);

    useImperativeHandle(ref, () => ({
      addText,
      uploadImage,
      getCanvas: () => fabricRef.current,
    }));

    // --- NEW: Wrapped syncLayers with Loop Protection ---
    const syncLayers = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // CRITICAL: Ensure mockup and print guide stay non-selectable, non-evented, and visible
      // Do this BEFORE getting layers to ensure mockup is excluded
      const mockupObjects = canvas
        .getObjects()
        .filter((obj) => obj.name === "mockupBackground");
      mockupObjects.forEach((obj) => {
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
      });

      canvas.getObjects().forEach((obj) => {
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

      // Get layers - this should exclude mockup since it's now non-selectable
      const newLayers = getUserLayersRef.current();

      // Double-check: filter out any mockup objects that might have slipped through
      const filteredLayers = newLayers.filter(
        (obj) => obj.name !== "mockupBackground" && obj.name !== "printGuide",
      );

      setLayersRef.current((prev) => {
        // 1. Length check (fastest)
        if (prev.length !== filteredLayers.length) return filteredLayers;

        // 2. Deep reference check to see if order or objects changed
        const isDifferent = filteredLayers.some(
          (obj, index) => obj !== prev[index],
        );

        // Only update state if something actually changed
        if (isDifferent) return filteredLayers;
        return prev;
      });
    }, []); // Using refs so no dependencies needed

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
    }, [initCanvas, dimensions]);

    // 2. Load side-specific designs & Listen for changes
    useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      // Event Listeners for user interactions
      const handleObjectAdded = (e) => {
        // Ensure mockup and print guide properties are maintained
        const obj = e.target;
        if (
          obj &&
          obj.name !== "mockupBackground" &&
          obj.name !== "printGuide"
        ) {
          // Ensure mockup and print guide stay in correct state
          canvas.getObjects().forEach((o) => {
            if (o.name === "mockupBackground") {
              o.set({ selectable: false, evented: false, visible: true });
              canvas.sendObjectToBack(o);
            } else if (o.name === "printGuide") {
              o.set({ selectable: false, evented: false, visible: true });
            }
          });
          syncLayers();
        } else {
          // If mockup or print guide was added/modified, ensure their properties
          if (obj && obj.name === "mockupBackground") {
            obj.set({ selectable: false, evented: false, visible: true });
            canvas.sendObjectToBack(obj);
          } else if (obj && obj.name === "printGuide") {
            obj.set({ selectable: false, evented: false, visible: true });
          }
          canvas.renderAll();
        }
      };

      const handleObjectRemoved = () => {
        syncLayers();
      };

      const handleObjectModified = (e) => {
        // Only sync if it's not mockup or print guide
        const obj = e.target;
        if (
          obj &&
          obj.name !== "mockupBackground" &&
          obj.name !== "printGuide"
        ) {
          syncLayers();
        }
      };

      // Ensure mockup and print guide stay visible on selection changes
      const handleSelectionCreated = (e) => {
        // Prevent mockup from being selected
        if (
          e.selected &&
          e.selected.some(
            (obj) =>
              obj.name === "mockupBackground" || obj.name === "printGuide",
          )
        ) {
          canvas.discardActiveObject();
        }

        canvas.getObjects().forEach((obj) => {
          if (obj.name === "mockupBackground") {
            obj.set({
              selectable: false,
              evented: false,
              visible: true,
              lockMovementX: true,
              lockMovementY: true,
            });
            canvas.sendObjectToBack(obj);
          } else if (obj.name === "printGuide") {
            obj.set({
              selectable: false,
              evented: false,
              visible: true,
              lockMovementX: true,
              lockMovementY: true,
            });
          }
        });
        canvas.requestRenderAll();
      };

      const handleSelectionCleared = () => {
        canvas.getObjects().forEach((obj) => {
          if (obj.name === "mockupBackground") {
            obj.set({
              selectable: false,
              evented: false,
              visible: true,
              lockMovementX: true,
              lockMovementY: true,
            });
            canvas.sendObjectToBack(obj);
          } else if (obj.name === "printGuide") {
            obj.set({
              selectable: false,
              evented: false,
              visible: true,
              lockMovementX: true,
              lockMovementY: true,
            });
          }
        });
        canvas.requestRenderAll();
      };

      // Prevent mockup from being selected via mouse events
      const handleMouseDown = (opt) => {
        if (
          opt.target &&
          (opt.target.name === "mockupBackground" ||
            opt.target.name === "printGuide")
        ) {
          // Don't prevent default to allow panning to work
          // Just ensure the object can't be selected
          if (canvas.getActiveObject() === opt.target) {
            canvas.discardActiveObject();
          }
          // Ensure properties are maintained
          opt.target.set({
            selectable: false,
            evented: false,
            visible: true,
            lockMovementX: true,
            lockMovementY: true,
          });
          if (opt.target.name === "mockupBackground") {
            canvas.sendObjectToBack(opt.target);
          }
        }
      };

      canvas.on("object:added", handleObjectAdded);
      canvas.on("object:removed", handleObjectRemoved);
      canvas.on("object:modified", handleObjectModified);
      canvas.on("selection:created", handleSelectionCreated);
      canvas.on("selection:cleared", handleSelectionCleared);
      canvas.on("mouse:down", handleMouseDown);

      // Store original renderAll and override to ensure mockup stays visible
      const originalRenderAll = canvas.renderAll.bind(canvas);
      const ensureMockupProperties = () => {
        const mockupObjs = canvas
          .getObjects()
          .filter((o) => o.name === "mockupBackground");
        mockupObjs.forEach((obj) => {
          obj.set({
            selectable: false,
            evented: false,
            visible: true,
            lockMovementX: true,
            lockMovementY: true,
          });
          canvas.sendObjectToBack(obj);
        });
      };

      canvas.renderAll = function () {
        ensureMockupProperties();
        return originalRenderAll();
      };

      if (sideData) {
        canvas.loadFromJSON(sideData, () => {
          updateAllMasks(dimensions);

          // CRITICAL: Ensure ALL mockup objects are properly configured
          const mockupObjects = canvas
            .getObjects()
            .filter((o) => o.name === "mockupBackground");
          mockupObjects.forEach((bg) => {
            bg.set({
              selectable: false,
              evented: false,
              visible: true,
              excludeFromExport: false,
              lockMovementX: true,
              lockMovementY: true,
              lockRotation: true,
              lockScalingX: true,
              lockScalingY: true,
            });
            canvas.sendObjectToBack(bg);
          });

          // Ensure print guide is visible and non-selectable
          const printGuide = canvas
            .getObjects()
            .find((o) => o.name === "printGuide");
          if (printGuide) {
            printGuide.set({
              selectable: false,
              evented: false,
              visible: true,
              lockMovementX: true,
              lockMovementY: true,
            });
          }

          // Force render to ensure visibility
          canvas.requestRenderAll();
          syncLayers();
        });
      }

      return () => {
        canvas.off("object:added", handleObjectAdded);
        canvas.off("object:removed", handleObjectRemoved);
        canvas.off("object:modified", handleObjectModified);
        canvas.off("selection:created", handleSelectionCreated);
        canvas.off("selection:cleared", handleSelectionCleared);
        canvas.off("mouse:down", handleMouseDown);
        // Restore original renderAll
        canvas.renderAll = originalRenderAll;
      };
    }, [activeSide, sideData, syncLayers, updateAllMasks, dimensions]);

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
        visible: true,
        strokeWidth: 1,
      });

      canvas.add(printArea);

      // Ensure mockup stays at the back
      const bg = canvas.getObjects().find((o) => o.name === "mockupBackground");
      if (bg) {
        bg.set({ selectable: false, evented: false, visible: true });
        canvas.sendObjectToBack(bg);
      }

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
        if (obj.name !== "printGuide" && obj.name !== "mockupBackground") {
          obj.selectable = !isPanMode;
        }
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
