import PreviewCanvas from "./PreviewCanvas";

export default function PreviewGrid({
  previewMockups,
  canvasData,
  activePreview,
  setActivePreview,
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(previewMockups).map(([key, mockup]) => {
        const sideJson = canvasData[mockup.usesSide];

        return (
          <button
            key={key}
            onClick={() => setActivePreview(key)}
            className={`w-38 border rounded p-1 cursor-pointer ${
              activePreview === key ? "border-black" : "border-gray-200"
            }`}
          >
            {/* Key forces new Fabric instance */}
            <PreviewCanvas
              key={key}
              mockupUrl={mockup.image}
              sideJson={sideJson}
            />

            <p className="text-[10px] text-center">{mockup.label}</p>
          </button>
        );
      })}
    </div>
  );
}
