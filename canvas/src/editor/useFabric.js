import { useRef, useCallback, useEffect, useState } from "react";
import * as fabric from "fabric";
import { useLibrary } from "../context/LibraryContext";

export const useFabric = (dimensions, setZoom) => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const fabricRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const history = useRef([]);
  const historyIndex = useRef(-1);
  const isSideEffect = useRef(false);

  const { addToLibrary } = useLibrary();

  const updateUndoRedoStatus = useCallback(() => {
    setCanUndo(historyIndex.current > 0);
    setCanRedo(historyIndex.current < history.current.length - 1);
  }, []);
  const saveState = useCallback(() => {
    if (!fabricRef.current || isSideEffect.current) return;

    const canvas = fabricRef.current;
    const json = canvas.toJSON([
      "name",
      "selectable",
      "evented",
      "clipPath",
      "userEditable",
      "lockMovementX",
      "lockMovementY",
      "lockRotation",
      "lockScalingX",
      "lockScalingY",
      "fontFamily",
      "fontSize",
    ]);

    if (historyIndex.current < history.current.length - 1) {
      history.current = history.current.slice(0, historyIndex.current + 1);
    }

    history.current.push(json);
    historyIndex.current++;

    if (history.current.length > 20) {
      history.current.shift();
      historyIndex.current--;
    }

    updateUndoRedoStatus();
  }, [updateUndoRedoStatus]);
  const undo = useCallback(async () => {
    if (historyIndex.current <= 1 || !fabricRef.current) return;

    isSideEffect.current = true;
    historyIndex.current--;
    const previousState = history.current[historyIndex.current];

    await fabricRef.current.loadFromJSON(previousState);
    fabricRef.current.renderAll();

    updateUndoRedoStatus();
    isSideEffect.current = false;
  }, [updateUndoRedoStatus]);

  const redo = useCallback(async () => {
    if (
      historyIndex.current >= history.current.length - 1 ||
      !fabricRef.current
    )
      return;

    isSideEffect.current = true;
    historyIndex.current++;
    const nextState = history.current[historyIndex.current];

    await fabricRef.current.loadFromJSON(nextState);
    fabricRef.current.renderAll();

    updateUndoRedoStatus();
    isSideEffect.current = false;
  }, [updateUndoRedoStatus]);

  // 1. Initialize Canvas
  const initCanvas = useCallback(
    (canvasElement) => {
      if (!canvasElement) return;

      // Get dimensions from the parent container
      const parent = canvasElement.parentElement;
      const width = parent.clientWidth || 1024;
      const height = parent.clientHeight || 600;
      const canvas = new fabric.Canvas(canvasElement, {
        width: width,
        height: height,
        backgroundColor: "#f5f5f0",
        preserveObjectStacking: true,
      });

      // Panning Event Listeners
      canvas.on("mouse:down", (opt) => {
        if (!canvas.isPanModeActive) return;

        canvas.isDragging = true;
        canvas.selection = false;
        lastPos.current = { x: opt.e.clientX, y: opt.e.clientY };
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
      });

      canvas.on("mouse:wheel", (opt) => {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;

        if (zoom > 20) zoom = 20;
        if (zoom < 0.05) zoom = 0.05;

        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

        opt.e.preventDefault();
        opt.e.stopPropagation();

        setZoom(Math.round(zoom * 100));
      });

      const updateSelection = () => setSelectedObject(canvas.getActiveObject());
      canvas.on("selection:created", updateSelection);
      canvas.on("selection:updated", updateSelection);
      canvas.on("selection:cleared", () => setSelectedObject(null));

      canvas.on("object:modified", () => saveState());
      fabricRef.current = canvas;
      saveState();
      return canvas;
    },
    [saveState],
  );

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      saveState(); // Capture in history
    }
  }, [saveState]);

  const copySelected = useCallback(async () => {
    const canvas = fabricRef.current;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const cloned = await activeObject.clone();
    cloned.set({
      left: activeObject.left + 20,
      top: activeObject.top + 20,
    });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    saveState(); // Capture in history
  }, [saveState]);

  const loadMockup = useCallback((url) => {
    if (!fabricRef.current || !url) return;
    const canvas = fabricRef.current;

    const imgElement = new Image();
    imgElement.crossOrigin = "anonymous";
    imgElement.src = url;

    imgElement.onload = () => {
      const existingMockups = canvas
        .getObjects()
        .filter((obj) => obj.name === "mockupBackground");
      existingMockups.forEach((o) => canvas.remove(o));

      const fabricImg = new fabric.Image(imgElement, {
        name: "mockupBackground",
        originX: "center",
        originY: "center",
        left: canvas.width / 2,
        top: canvas.height / 2,
        selectable: false,
        evented: false,
        visible: true,
        clipPath: null,
      });

      const scale = (canvas.height * 0.8) / fabricImg.height;
      fabricImg.scale(scale);

      canvas.add(fabricImg);
      canvas.sendObjectToBack(fabricImg);

      fabricImg.set({
        selectable: false,
        evented: false,
        visible: true,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
      });

      // Ensure print guide stays visible
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

      canvas.requestRenderAll();
    };
  }, []);

  const createMask = useCallback(
    ({ canvas, currentDimensions }) =>
      new fabric.Rect({
        left: canvas.width / 2 + (currentDimensions.leftOffset || 0),
        top: canvas.height / 2 + (currentDimensions.topOffset || 0),
        width: currentDimensions.width,
        height: currentDimensions.height,
        originX: "center",
        originY: "center",
        absolutePositioned: true,
        inverted: false,
      }),
    [],
  );

  const updateAllMasks = useCallback(
    (newDimensions) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.getObjects().forEach((obj) => {
        // Only update objects that are meant to be clipped (text/images)
        if (obj.clipPath && obj.name !== "printGuide") {
          obj.set(
            "clipPath",
            createMask({ canvas, currentDimensions: newDimensions }),
          );
        }
      });
      canvas.requestRenderAll();
    },
    [createMask],
  );

  const getUserLayers = useCallback(() => {
    if (!fabricRef.current) return [];
    return fabricRef.current
      .getObjects()
      .filter((obj) => {
        // Explicitly exclude mockup and print guide by name first
        if (obj.name === "printGuide" || obj.name === "mockupBackground") {
          return false;
        }
        // Then check if it's selectable (user-editable content)
        return obj.selectable === true;
      })
      .reverse();
  }, []);
  // addText
  const addText = useCallback(
    (content = "New Text", fontFamily = "sans-serif") => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      const text = new fabric.IText(content, {
        left: canvas.width / 2,
        top: canvas.height / 2,
        fontSize: 28,
        fontFamily: fontFamily,
        clipPath: createMask({ canvas: canvas, currentDimensions: dimensions }),
        fill: "#2f2e0c",
        originX: "center",
        originY: "center",
        cornerColor: "#646323",
        cornerSize: 8,
        transparentCorners: false,
        userEditable: true,
      });

      canvas.add(text);
      saveState();
      canvas.setActiveObject(text);

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
      canvas.requestRenderAll();
    },
    [dimensions, createMask, saveState],
  );

  const addGraphic = useCallback(
    async (graphic) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      try {
        // 1. Load SVG using Fabric v7 promise-based API
        const { objects, options } = await fabric.loadSVGFromURL(graphic.file);
        if (!objects || objects.length === 0) {
          console.error("Failed to load SVG from:", graphic.file);
          return;
        }

        // 2. Group elements and handle visibility based on category
        const obj = fabric.util.groupSVGElements(objects, options);

        const ensureVisible = (o) => {
          // Shapes JSON typically sets stroke: false, so they MUST have a fill
          const hasNoFill =
            !o.fill || o.fill === "none" || o.fill === "transparent";
          const hasNoStroke =
            !o.stroke || o.stroke === "none" || o.stroke === "transparent";

          if (hasNoFill) {
            o.set("fill", "#2f2e0c"); // Apply default brand color
          }

          // Icons JSON allows strokes; ensure they are visible if fill is missing
          if (graphic.category === "icons" && hasNoStroke) {
            o.set("stroke", "#2f2e0c");
            o.set("strokeWidth", 1);
          }
        };

        // Apply visibility logic to all paths within the SVG
        if (obj.type === "group" && typeof obj.getObjects === "function") {
          obj.getObjects().forEach((child) => ensureVisible(child));
        } else {
          ensureVisible(obj);
        }

        // 3. Calculate Layout and Scaling
        const centerX = canvas.width / 2 + (dimensions.leftOffset || 0);
        const centerY = canvas.height / 2 + (dimensions.topOffset || 0);

        // Necessary for accurate bounding box calculation in Fabric
        obj.setCoords();
        const bounds = obj.getBoundingRect(true, true);
        const bw = bounds.width || obj.width || 1;
        const bh = bounds.height || obj.height || 1;

        const targetSizePercentage = graphic.category === "shapes" ? 0.8 : 0.6;
        const printAreaDimension = Math.min(
          dimensions.width,
          dimensions.height,
        );
        const desiredSize = printAreaDimension * targetSizePercentage;

        const scale = desiredSize / Math.max(bw, bh);

        // 4. Set Properties and ClipPath.
        obj.set({
          left: centerX,
          top: centerY,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          evented: true,
          name: "user-graphic",
          clipPath: createMask({ canvas, currentDimensions: dimensions }),
          cornerColor: "#646323",
          cornerSize: 8,
          transparentCorners: false,
        });

        // Prevent individual selection of SVG sub-paths
        if (obj.getObjects) {
          obj.getObjects().forEach((child) => {
            child.selectable = false;
            child.evented = false;
          });
        }

        // 5. Add to Canvas and Maintain Layering
        canvas.add(obj);
        saveState();
        canvas.setActiveObject(obj);

        // Keep mockup at the very bottom
        canvas
          .getObjects()
          .filter((o) => o.name === "mockupBackground")
          .forEach((m) => canvas.sendObjectToBack(m));

        canvas.requestRenderAll();
      } catch (error) {
        console.error(
          "Error loading graphic:",
          graphic.name,
          "from",
          graphic.file,
          error,
        );
      }
    },
    [dimensions, createMask, saveState],
  );

  const uploadImage = useCallback(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        const imageData = {
          id: crypto.randomUUID(),
          src: reader.result,
          name: file.name,
          createdAt: Date.now(),
        };

        addToLibrary(imageData);
        try {
          const img = await fabric.FabricImage.fromURL(reader.result, {
            crossOrigin: "anonymous",
          });

          // Scale image if it's too large
          if (img.width > 400) img.scaleToWidth(100);
          else if (img.height > 400) img.scaleToHeight(200);

          // Position image in the center of the print area
          const centerX = canvas.width / 2 + (dimensions.leftOffset || 0);
          const centerY = canvas.height / 2 + (dimensions.topOffset || 0);

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
            clipPath: createMask({
              canvas,
              currentDimensions: dimensions,
            }),
          });

          canvas.add(img);
          saveState();
          canvas.setActiveObject(img);

          // Ensure mockup stays at back
          canvas
            .getObjects()
            .filter((obj) => obj.name === "mockupBackground")
            .forEach((obj) => {
              obj.set({
                selectable: false,
                evented: false,
                visible: true,
                lockMovementX: true,
                lockMovementY: true,
              });
              canvas.sendObjectToBack(obj);
            });

          canvas.requestRenderAll();
        } catch (error) {
          console.error("Error loading image:", error);
        }
      };

      reader.readAsDataURL(file);
    };

    input.click();
  }, [dimensions, createMask, addToLibrary, saveState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Z or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      }

      // Check for Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        redo();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    fabricRef,
    initCanvas,
    loadMockup,
    addText,
    uploadImage,
    addGraphic,
    updateAllMasks,
    getUserLayers,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedObject,
    deleteSelected,
    copySelected,
  };
};
