import { useRef, useCallback } from "react";
import * as fabric from "fabric";

export const useFabric = (dimensions, setZoom) => {
  const fabricRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });

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
      if (canvas.isPanModeActive) {
        canvas.isDragging = true;
        canvas.selection = false;
        lastPos.current = { x: opt.e.clientX, y: opt.e.clientY };
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
    });

    // Inside useFabric.js -> initCanvas function
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

    // Inside useFabric.js -> initCanvas function
    let updateTimeout;
    const triggerCanvasUpdate = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        window.dispatchEvent(new Event("canvas-update"));
      }, 50); // 50ms debounce
    };

    canvas.on("object:added", triggerCanvasUpdate);
    canvas.on("object:removed", triggerCanvasUpdate);
    canvas.on("object:modified", (e) => {
      if (e.action === "drag" || e.action === "scale") {
        triggerCanvasUpdate();
      }
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
      const oldImgs = canvas
        .getObjects("image")
        .filter((obj) => !obj.selectable);
      oldImgs.forEach((o) => canvas.remove(o));

      const fabricImg = new fabric.Image(imgElement, {
        name: "mockup",
        originX: "center",
        originY: "center",
        left: canvas.width / 2,
        top: canvas.height / 2,
        selectable: false,
        evented: false,
        clipPath: null,
      });

      const scale = (canvas.height * 0.8) / fabricImg.height;
      fabricImg.scale(scale);

      canvas.add(fabricImg);
      canvas.sendObjectToBack(fabricImg);
      canvas.renderAll();
    };
  }, []);

  const createMask = ({ canvas, currentDimensions }) =>
    new fabric.Rect({
      left: canvas.width / 2 + (currentDimensions.leftOffset || 0),
      top: canvas.height / 2 + (currentDimensions.topOffset || 0),
      width: currentDimensions.width,
      height: currentDimensions.height,
      originX: "center",
      originY: "center",
      absolutePositioned: true,
    });

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
      canvas.renderAll();
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
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;

        // Use fabric.Image.fromURL which handles the async loading
        fabric.Image.fromURL(
          dataUrl,
          (img) => {
            img.set({
              left: canvas.width / 2,
              top: canvas.height / 2,
              originX: "center",
              originY: "center",
              clipPath: createMask({ canvas, currentDimensions: dimensions }),
            });

            if (img.width > 400) img.scaleToWidth(250);

            canvas.add(img);
            canvas.setActiveObject(img);

            // CRITICAL: Force the canvas to re-render after the image is added
            canvas.requestRenderAll();
          },
          { crossOrigin: "anonymous" },
        );
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [createMask]);

  return {
    fabricRef,
    initCanvas,
    loadMockup,
    addText,
    uploadImage,
    updateAllMasks,
  };
};
