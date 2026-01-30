import LayersPanel from "./LayerPanel";
import { X } from "lucide-react";

export default function RightPanel({
  isOpen,
  onClose,
  layers,
  setLayers,
  canvasRef,
}) {
  if (!isOpen) return null;

  const handleSelect = (obj) => {
    const canvas = canvasRef.current.getCanvas();
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  };

  const handleDelete = (obj) => {
    const canvas = canvasRef.current.getCanvas();
    canvas.remove(obj);
    canvas.requestRenderAll();
    const userObjects = canvas
      .getObjects()
      .filter((o) => o.selectable && o.name !== "printGuide");
    setLayers([...userObjects].reverse());
  };

  const handleToggleVisibility = (obj) => {
    obj.set("visible", !obj.visible);
    canvasRef.current.getCanvas().requestRenderAll();
    setLayers((prev) => [...prev]);
  };
  const updateObject = (obj, properties) => {
    const canvas = canvasRef.current.getCanvas();
    if (!canvas || !obj) return;

    obj.set({
      ...properties,
      left: properties.left !== undefined ? Number(properties.left) : obj.left,
      top: properties.top !== undefined ? Number(properties.top) : obj.top,
    });

    obj.setCoords();
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();

    const userObjects = canvas
      .getObjects()
      .filter((o) => o.selectable && o.name !== "printGuide");

    setLayers([...userObjects].reverse());
  };

  return (
    <div className="absolute right-0 top-18 bottom-15 w-100 border border-gray-200 bg-white flex flex-col  animate-in slide-in-from-right">
      <div className="p-4 flex items-center justify-between">
        <h3 className="font-bold text-[#2f2e0c] text-lg">
          Variants and layers
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {/* Variants Section */}
        <div className="mb-8">
          <p className="text-lg font-semibold text-[#2f2e0c] mb-3">Variants</p>
          <div className="flex items-center justify-between  rounded-lg">
            <span className="text-md font-medium text-[#2f2e0c] px-1">
              Colors
            </span>
            <button className="text-md font-bold  text-[#2f2e0c] bg-white border border-gray-200 px-3 py-1 rounded-md hover:bg-gray-50">
              Select variants
            </button>
          </div>
        </div>

        {/* Layers Section */}
        <div className="">
          <p className="text-lg font-semibold text-[#2f2e0c] mb-3">Layers</p>
          <LayersPanel
            objects={layers}
            updateObject={updateObject}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onToggleVisibility={handleToggleVisibility}
            canvasRef={canvasRef}
          />
        </div>
      </div>
    </div>
  );
}
