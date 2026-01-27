import {
  Trash2,
  Eye,
  EyeOff,
  Type,
  Image as ImageIcon,
  GripVertical,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  ArrowDownToLine,
  FoldHorizontal,
  FoldVertical,
} from "lucide-react";
import { useState } from "react";

export default function LayersPanel({
  objects,
  updateObject,
  onSelect,
  onDelete,
  onToggleVisibility,
}) {
  const [expandedId, setExpandedId] = useState(null);

  if (objects.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm italic">
        No layers yet. Add text or images to start.
      </div>
    );
  }

  const handleToggleExpand = (e, obj, index) => {
    e.stopPropagation();
    setExpandedId(expandedId === index ? null : index);
    onSelect(obj);
  };

  return (
    <div className="flex flex-col gap-3">
      {objects.map((obj, index) => {
        const isExpanded = expandedId === index;

        return (
          <div
            key={index}
            className={`border rounded-lg overflow-hidden transition-all ${
              isExpanded
                ? "border-[#646323] ring-1 ring-[#646323]/10"
                : "border-gray-200"
            }`}
          >
            {/* Header: Clickable Area */}
            <div
              className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                isExpanded ? "bg-[#f5f5f0]" : "hover:bg-gray-50"
              }`}
              onClick={() => onSelect(obj)}
            >
              <div className="flex items-center gap-3">
                <div className="text-gray-400 border border-gray-200 p-2 rounded bg-white">
                  {obj.type.includes("text") ? (
                    <Type size={18} />
                  ) : (
                    <ImageIcon size={18} />
                  )}
                </div>

                <div className="flex flex-col truncate w-32">
                  <span className="text-md font-bold text-[#2f2e0c] truncate">
                    {obj.type.includes("text")
                      ? obj.text
                      : `Image ${index + 1}`}
                  </span>
                  {obj.type.includes("text") && (
                    <span className="text-sm text-[#646323] truncate font-medium">
                      {obj.fontFamily}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(obj);
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-800 cursor-pointer"
                >
                  {obj.visible ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(obj);
                  }}
                  className="p-1.5 hover:bg-gray-200 rounded cursor-pointer text-gray-800"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={(e) => handleToggleExpand(e, obj, index)}
                  className={`p-1.5 rounded transition-colors cursor-pointer text-gray-800 `}
                >
                  <GripVertical size={20} />
                </button>
              </div>
            </div>

            {/* Expanded Content: Tool Panel */}
            {isExpanded && (
              <div className="p-4 bg-[#f5f5f0] flex flex-col gap-5 animate-in slide-in-from-top-2 duration-200">
                {/* Curved Text Toggle */}
                <div className="flex justify-between items-center">
                  <span className="text-md font-medium text-[#2f2e0c]">
                    Curved text
                  </span>
                  <input type="checkbox" className="w-4 h-4 accent-[#646323]" />
                </div>

                {/* Rotate Control */}
                <div>
                  <label className="text-sm font-medium text-[#2f2e0c] mb-1.5 block">
                    Rotate
                  </label>
                  <div className="flex border border-gray-200 rounded overflow-hidden">
                    <input
                      type="number"
                      value={Math.round(obj.angle || 0)}
                      onChange={(e) =>
                        updateObject(obj, {
                          angle: parseInt(e.target.value) || 0,
                        })
                      }
                      className="flex-1 p-3 text-sm outline-none bg-white"
                    />
                    <span className="bg-gray-50 px-3 py-4 text-sm font-bold text-[#65644b] border-l border-gray-200">
                      deg
                    </span>
                  </div>
                </div>

                {/* Position Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#2f2e0c] mb-1.5 block">
                      Position left
                    </label>
                    <div className="flex border border-gray-200 rounded overflow-hidden">
                      <input
                        type="text"
                        value="45.00"
                        className="w-full p-3 text-sm outline-none bg-gray-50 text-[#2f2e0c]"
                        readOnly
                      />
                      <span className="bg-gray-50 px-3 py-4 text-sm font-bold text-[#65644b] border-l border-gray-200">
                        %
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[#2f2e0c] text-sm font-medium mb-1.5 block">
                      Position top
                    </label>
                    <div className="flex border border-gray-200 rounded overflow-hidden">
                      <input
                        type="text"
                        value="50.00"
                        className="w-full p-3 text-sm outline-none bg-gray-50 text-[#2f2e0c]"
                        readOnly
                      />
                      <span className="bg-gray-50 px-3 py-4 text-sm border-l border-gray-200 font-bold text-[#65644b]">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alignment Buttons */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#2f2e0c] text-sm font-medium mb-1.5 block">
                    Alignment
                  </label>
                  <div className="grid grid-cols-6 gap-1">
                    <button
                      onClick={() => updateObject(obj, { left: 0 })}
                      className="p-2 border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center"
                    >
                      <ArrowLeftToLine size={18} />
                    </button>
                    <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <FoldHorizontal size={18} />
                    </button>
                    <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <ArrowRightToLine size={18} />
                    </button>
                    <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <ArrowUpToLine size={18} />
                    </button>
                    <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <FoldVertical size={18} />
                    </button>
                    <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <ArrowDownToLine size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
