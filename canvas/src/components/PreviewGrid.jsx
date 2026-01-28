import PreviewCanvas from "./PreviewCanvas";
import { getSideForPreview } from "../utils/getSideForPreview";

export default function PreviewGrid({
  previewMockups,
  canvasData,
  activePreview,
  setActivePreview,
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Object.entries(previewMockups).map(([key, url]) => {
        const sideJson = getSideForPreview(key, canvasData);

        return (
          <button
            key={key}
            onClick={() => setActivePreview(key)}
            className={`border rounded p-1 ${
              activePreview === key ? "border-black" : "border-gray-200"
            }`}
          >
            <PreviewCanvas mockupUrl={url} sideJson={sideJson} />
            <p className="text-[10px] text-center capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </p>
          </button>
        );
      })}
    </div>
  );
}
