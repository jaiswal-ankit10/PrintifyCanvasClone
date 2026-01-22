import {
  ArrowLeft,
  BookImage,
  FolderOpen,
  LayoutTemplate,
  Shapes,
  Sparkles,
  Type,
  Upload,
} from "lucide-react";

function ShutterstockIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.01 2C6.49 2 2 6.49 2 12.01 2 17.53 6.49 22 12.01 22 17.53 22 22 17.53 22 12.01 22 6.49 17.53 2 12.01 2zm3.78 6.77c-1.45-.51-2.77-.82-4.03-.82-2.16 0-3.23.77-3.23 2.13 0 1.44 1.27 1.86 3.06 2.46 2.59.87 4.45 1.82 4.45 4.42 0 2.51-2.02 4.1-5.27 4.1-1.56 0-3.27-.41-4.64-1.1v-2.58c1.41.79 3.01 1.3 4.56 1.3 2.01 0 3.12-.77 3.12-2.05 0-1.41-1.07-1.86-3.12-2.55-2.68-.9-4.35-1.82-4.35-4.37 0-2.51 1.95-4.14 5.14-4.14 1.44 0 2.9.25 4.31.79v2.41z" />
    </svg>
  );
}

function LeftToolbar() {
  const tools = [
    { label: "", icon: <ArrowLeft size={20} /> },
    { label: "Upload", icon: <Upload size={20} /> },
    { label: "AI", icon: <Sparkles size={20} /> },
    { label: "Add text", icon: <Type size={20} /> },
    { label: "My library", icon: <FolderOpen size={20} /> },
    { label: "Graphics", icon: <Shapes size={20} /> },
    { label: "Templates", icon: <LayoutTemplate size={20} /> },
    {
      label: "Shutterstock",
      icon: <ShutterstockIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-18 h-full border-r border-gray-200 bg-white flex flex-col items-center py-4 gap-6">
      {tools.map((tool) => (
        <button
          key={tool.label}
          className="flex flex-col items-center gap-1 text-[10px] text-[#2f2e0c] hover:bg-gray-200 cursor-pointer w-full p-2"
        >
          <span className="">{tool.icon}</span>
          {tool.label}
        </button>
      ))}
    </div>
  );
}

export default LeftToolbar;
