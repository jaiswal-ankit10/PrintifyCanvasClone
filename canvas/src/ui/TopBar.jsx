import { Info, PencilRuler, Redo2, Undo2 } from "lucide-react";

export default function TopBar({ activeMode, setActiveMode }) {
  return (
    <div className="  bg-[#f5f5f0] flex items-center justify-between p-5">
      {/* Left */}
      <div className="flex items-center gap-6">
        <button title="Undo" className="cursor-pointer">
          <Info size={21} />
        </button>
        <div className="flex items-center gap-3">
          <button title="Undo" className="cursor-pointer">
            <Undo2 size={21} />
          </button>
          <button title="Redo" className="cursor-pointer">
            <Redo2 size={21} />
          </button>
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
          onClick={() => setIsEditOpen(true)}
          className="text-lg bg-white/90 p-2 border border-gray-200 cursor-pointer"
        >
          <PencilRuler size={20} />
        </button>
      </div>
    </div>
  );
}
