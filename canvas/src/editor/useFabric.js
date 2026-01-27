import { useRef, useCallback } from "react";
import * as fabric from "fabric";
import { useLibrary } from "../context/LibraryContext";

export const useFabric = (dimensions, setZoom) => {
  const fabricRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });

  const { addToLibrary } = useLibrary();

  // 1. Initialize Canvas
  const initCanvas = useCallback((canvasElement) => {
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

    fabricRef.current = canvas;
    return canvas;
  }, []);

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
      });

      canvas.add(text);
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
    [dimensions, createMask],
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
      reader.onload = () => {
        const imageData = {
          id: crypto.randomUUID(),
          src: reader.result,
          name: file.name,
          createdAt: Date.now(),
        };

        addToLibrary(imageData);
        fabric.Image.fromURL(
          reader.result,
          (img) => {
            // Scale image if it's too large
            if (img.width > 400) {
              img.scaleToWidth(250);
            } else if (img.height > 400) {
              img.scaleToHeight(250);
            }

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
              clipPath: createMask({
                canvas,
                currentDimensions: dimensions,
              }),
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            
            // Ensure mockup stays at back
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
              });
              canvas.sendObjectToBack(obj);
            });
            
            canvas.requestRenderAll();
          },
          { crossOrigin: "anonymous" }
        );
      };

      reader.readAsDataURL(file);
    };

    input.click();
  }, [dimensions, createMask, addToLibrary]);

  return {
    fabricRef,
    initCanvas,
    loadMockup,
    addText,
    uploadImage,
    updateAllMasks,
    getUserLayers,
  };
};
