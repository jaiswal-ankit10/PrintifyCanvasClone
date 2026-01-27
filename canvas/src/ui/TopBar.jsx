import { Copy, Info, PencilRuler, Redo2, Trash2, Undo2 } from "lucide-react";

export default function TopBar({
  activeMode,
  setActiveMode,
  setIsEditOpen,
  isEditOpen,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedObject,
  onDelete,
  onCopy,
}) {
  return (
    <div
      className={`${selectedObject ? "bg-white" : "bg-[#f5f5f0]"} flex items-center justify-between py-2 px-4`}
    >
      {/* Left */}
      <div className="flex items-center gap-6">
        <button title="Undo" className="cursor-pointer">
          <Info size={21} />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 border-r pr-4 border-gray-300">
            <button
              title="Undo"
              className="cursor-pointer"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 size={21} />
            </button>
            <button
              title="Redo"
              className="cursor-pointer"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 size={21} />
            </button>
          </div>

          {selectedObject && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded  hover:bg-gray-50 cursor-pointer">
                <span className="text-md font-medium">Position</span>
              </button>

              {/* Color Indicator (if shape/text) */}
              {selectedObject.fill && (
                <button className="cursor-pointer">
                  <div
                    className="w-7 h-7 rounded-full border border-gray-200"
                    style={{ backgroundColor: selectedObject.fill || "#000" }}
                  />
                </button>
              )}

              <div className="h-6 w-px bg-gray-300 mx-1" />

              <button
                onClick={onCopy}
                className="p-2 hover:border border-gray-300 rounded transition"
                title="Duplicate"
              >
                <Copy size={19} />
              </button>

              <button
                onClick={onDelete}
                className="p-2 hover:border border-gray-300 rounded transition"
                title="Delete"
              >
                <Trash2 size={19} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center */}
      <div className="flex gap-2 items-center">
        <div className="flex rounded overflow-hidden border border-gray-200">
          <button
            onClick={() => setActiveMode("edit")}
            className={`px-6 py-2 text-md font-bold transition cursor-pointer w-30
            ${
              activeMode === "edit"
                ? "bg-[#646323] text-white"
                : "bg-white hover:bg-gray-100"
            }
          `}
          >
            Edit
          </button>

          <button
            onClick={() => setActiveMode("preview")}
            className={`px-6 py-2 text-md font-bold transition cursor-pointer w-30
            ${
              activeMode === "preview"
                ? "bg-[#646323] text-white"
                : "bg-white hover:bg-gray-100"
            }
          `}
          >
            Preview
          </button>
        </div>

        {/* Right */}
        <button
          title="Edit tools"
          onClick={() => setIsEditOpen((prev) => !prev)}
          className={`text-lg  p-2 border border-gray-200 cursor-pointer rounded ${isEditOpen ? "bg-[#e0e0d7]" : "bg-white/90"}`}
        >
          <PencilRuler size={20} />
        </button>
      </div>
    </div>
  );
}
