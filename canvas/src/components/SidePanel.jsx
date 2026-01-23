import { X } from "lucide-react";

export default function SidePanel({ title, isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="absolute left-18 top-18 bottom-14 w-85 bg-white border-r border-gray-200 z-40  flex flex-col animate-in slide-in-from-left duration-200">
      {/* Shared Header */}
      <div className="p-5 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-xl font-extrabold text-[#2f2e0c] tracking-tight">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer text-gray-400 hover:text-black transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {children}
      </div>
    </div>
  );
}
