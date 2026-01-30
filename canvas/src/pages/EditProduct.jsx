import { useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import TopBar from "../ui/TopBar";
import LeftToolbar from "../ui/LeftToolBar";
import CanvasArea from "../ui/CanvasArea";
import RightPanel from "../ui/RightPanel";
import BottonBar from "../ui/BottonBar";
import { products } from "../data/products";
import SideTabs from "../ui/SideTabs";
import SidePanel from "../components/SidePanel";
import AIGenerator from "../components/AIGenerator";
import GraphicsLibrary from "../components/GraphicsLibrary";
import TextOptions from "../components/TextOptions";
import MyLibrary from "../components/MyLibrary";
import Templates from "../components/Templates";
import PreviewPage from "./PreviewPage";

// helper to exclude system objects (mockup, printGuide) and ghost objects from saved JSON
const getCleanCanvasState = (canvas) => {
  if (!canvas) return null;

  const json = canvas.toJSON([
    "name",
    "selectable",
    "evented",
    "clipPath",
    "fontFamily",
    "excludeFromExport",
    "userEditable",
  ]);

  if (json.objects) {
    json.objects = json.objects.filter((obj) => {
      const type = obj.type.toLowerCase();

      // 0. Whitelist Explicitly Editable User Objects
      if (obj.userEditable) {
        return true;
      }
      
      // EXPLICITLY EXCLUDE System Objects by Name
      if (obj.name === "mockupBackground" || obj.name === "printGuide") {
        return false;
      }

      if (obj.name === "user-image") {
        return true;
      }
      
      // EXPLICITLY EXCLUDE System Objects by Characteristics (if name is lost)
      // Mockups and PrintGuides are NOT selectable.
      // User images/text ARE selectable.
      if (obj.selectable === false && (type === "image" || type === "rect")) {
        return false;
      }

      // STRICT "NO NAME, NO SAVE" POLICY for non-text objects
      // Modified: Trust 'selectable' property.
      // Fabric.js optimization: If selectable is true (default), it is OMITTED from JSON.
      // System objects (mockups) have selectable: false, so it IS included.
      // So, if obj.selectable is TRUE or UNDEFINED, it is a user object.
      // We only exclude if it is EXPLICITLY false.
      
      const isText = type.includes("text");
      
      // IMPOSTER DETECTION:
      // If an object is selectable but looks like a system mockup (Image, No Name, Large),
      // it is a "Ghost Mockup" that shouldn't be saved.
      // This prevents the "Shirt in the corner" bug in previews.
      if (
        type === "image" &&
        !obj.name &&
        // Check if it's large (likely a full shirt background) relative to standard canvas
        (obj.width > 300 || obj.scaleX * obj.width > 300) 
      ) {
        return false;
      }

      if (obj.selectable !== false) {
        return true;
      }

      if (!isText && !obj.name) {
        return false;
      }
      
      return true; 
    });
  }

  // Inject Dimensions for Preview Mapping
  json.sourceWidth = canvas.width;
  json.sourceHeight = canvas.height;

  return json;
};

export default function EditProduct() {
  const { productId } = useParams();
  const canvasAreaRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(true);
  const [activeMode, setActiveMode] = useState("edit");
  const product = products.find((p) => p.id === productId);
  const [activeSide, setActiveSide] = useState(product.sides[0].key);
  const [isPanMode, setIsPanMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [mockupState, setMockupState] = useState({});
  const [activeTool, setActiveTool] = useState(null);
  const [layers, setLayers] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [canvasData, setCanvasData] = useState({
    front: null,
    back: null,
    sleeveLeft: null,
    sleeveRight: null,
    neck: null,
  });

  const activeSideData = product.sides.find((s) => s.key === activeSide);
  const currentDimensions = activeSideData.printDimensions;


  const handleAddText = (content, fontFamily) => {
    canvasAreaRef.current?.addText(content, fontFamily);

    const canvas = canvasAreaRef.current?.getCanvas();
    if (canvas) {
      const jsonData = getCleanCanvasState(canvas);
      setCanvasData((prev) => ({ ...prev, [activeSide]: jsonData }));

      const userObjects = canvas
        .getObjects()
        .filter((obj) => obj.selectable && obj.name !== "printGuide");
      setLayers([...userObjects].reverse());
    }
  };
  const handleUpload = () => canvasAreaRef.current?.uploadImage();

  const handleToolClick = (toolLabel) => {
    setActiveTool((prev) => (prev === toolLabel ? null : toolLabel));
  };

  const handleSideChange = (newSide) => {
    if (newSide === activeSide) return;

    const canvas = canvasAreaRef.current?.getCanvas();
    if (canvas) {
      const jsonData = getCleanCanvasState(canvas);
      setCanvasData((prev) => ({ ...prev, [activeSide]: jsonData }));
    }

    setActiveSide(newSide);
  };

  const syncCanvasData = useCallback((callback) => {
    const canvas = canvasAreaRef.current?.getCanvas();
    if (canvas) {
      const jsonData = getCleanCanvasState(canvas);

      setCanvasData((prev) => {
        const newData = { ...prev, [activeSide]: jsonData };
        if (callback) callback();
        return newData;
      });
    }
  }, [activeSide]);
  // Sync canvas state with local state
  useEffect(() => {
    if (canvasAreaRef.current) {
      setSelectedObject(canvasAreaRef.current.selectedObject);
      setCanUndo(canvasAreaRef.current.canUndo);
      setCanRedo(canvasAreaRef.current.canRedo);
    }
  }, [activeSide, canvasData]);

  const handleSelectionChange = useCallback((object) => {
    setSelectedObject(object);
  }, []);

  const handleUndoRedoChange = useCallback(({ canUndo, canRedo }) => {
    setCanUndo(canUndo);
    setCanRedo(canRedo);
  }, []);
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8f8f6] ">
      {activeMode === "edit" ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="shrink-0 h-screen">
            <LeftToolbar
              onUpload={handleUpload}
              activeTool={activeTool}
              onToolClick={handleToolClick}
            />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden ">
            <TopBar
              activeMode={activeMode}
              setActiveMode={async (mode) => {
                if (mode === "preview") {
                  await syncCanvasData();
                  setActiveMode(mode);
                } else {
                  setActiveMode(mode);
                }
              }}
              setIsEditOpen={setIsEditOpen}
              isEditOpen={isEditOpen}
              onUndo={() => canvasAreaRef.current?.undo?.()}
              onRedo={() => canvasAreaRef.current?.redo?.()}
              canUndo={canUndo}
              canRedo={canRedo}
              selectedObject={selectedObject}
              onDelete={() => canvasAreaRef.current?.deleteSelected?.()}
              onCopy={() => canvasAreaRef.current?.copySelected?.()}
              onChangeColor={() => canvasAreaRef.current?.changeColor?.()}
            />
            <SidePanel
              title={activeTool}
              isOpen={!!activeTool}
              onClose={() => setActiveTool(null)}
            >
              {activeTool === "Add text" && (
                <TextOptions
                  onAddText={handleAddText}
                  setIsProcessing={setIsProcessing}
                  onClosePanel={() => setActiveTool(null)}
                />
              )}
              {activeTool === "AI" && <AIGenerator />}
              {activeTool === "Graphics" && (
                <GraphicsLibrary
                  onAddGraphic={(graphic) =>
                    canvasAreaRef.current?.addGraphic(graphic)
                  }
                />
              )}
              {activeTool === "My library" && (
                <MyLibrary
                  onAddImage={(src) =>
                    canvasAreaRef.current?.addImageFromURL(src)
                  }
                />
              )}
              {activeTool === "Templates" && <Templates />}
            </SidePanel>

            <div className="relative flex-1 bg-[#f5f5f0] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <CanvasArea
                  ref={canvasAreaRef}
                  mockup={product.mockups[activeSide]}
                  isPanMode={isPanMode}
                  activeSide={activeSide}
                  dimensions={currentDimensions}
                  zoom={zoom}
                  setZoom={setZoom}
                  isProcessing={isProcessing}
                  sideData={canvasData[activeSide]}
                  setLayers={setLayers}
                  onSelectionChange={handleSelectionChange}
                  onUndoRedoChange={handleUndoRedoChange}
                  onCanvasChange={syncCanvasData}
                />
              </div>

              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
                <SideTabs
                  sides={product.sides}
                  activeSide={activeSide}
                  setActiveSide={handleSideChange}
                />
              </div>
            </div>

            <BottonBar
              isPanMode={isPanMode}
              setIsPanMode={setIsPanMode}
              zoom={zoom}
              setZoom={setZoom}
            />
          </div>

          <RightPanel
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            layers={layers}
            canvasRef={canvasAreaRef}
            setLayers={setLayers}
          />
        </div>
      ) : (
        <PreviewPage
          product={product}
          canvasData={canvasData}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
        />
      )}
    </div>
  );
}
