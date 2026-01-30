import { useState } from "react";
import PreviewCanvas from "../components/PreviewCanvas";
import PreviewGrid from "../components/PreviewGrid";
import { getPreviewMockups } from "../utils/getPreviewMockups";
import { getSideForPreview } from "../utils/getSideForPreview";

export default function PreviewPage({
  product,
  canvasData,
  activeMode,
  setActiveMode,
}) {
  const [previewCanvas, setPreviewCanvas] = useState(null);
  const [colorMode, setColorMode] = useState("rgb");
  const previewMockups = getPreviewMockups(product);
  const previewKeys = Object.keys(previewMockups);
  const [activePreview, setActivePreview] = useState(previewKeys[0]);

  const activeSideJson = getSideForPreview(activePreview, canvasData);
  const activeMockup = previewMockups[activePreview];

  <PreviewCanvas
    mockupUrl={activeMockup.image}
    sideJson={canvasData[activeMockup.usesSide]}
  />;

  const downloadMockup = () => {
    if (!previewCanvas) return;

    const dataURL = previewCanvas.toDataURL({
      format: "png",
      multiplier: 2,
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "mockup.png";
    link.click();
  };

  return (
    <div>
      <div className="flex h-full bg-[#f8f8f6]">
        {/* LEFT: Large preview */}
        <div className="flex-1 flex items-center justify-center">
          <PreviewCanvas
            mockupUrl={activeMockup.image}
            sideJson={canvasData[activeMockup.usesSide]}
            colorMode={colorMode}
            onReady={setPreviewCanvas}
            large
            offsetX={activeMockup.offsetX || 0}
            offsetY={activeMockup.offsetY || 0}
            printArea={activeMockup.printArea}
          />
        </div>

        {/* RIGHT PANEL */}

        <div>
          <div className="flex rounded overflow-hidden border border-gray-200 ml-20 my-3 w-60">
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
          <div className="w-90 bg-white border border-gray-200 rounded px-4 py-5 max-h-[83vh] overflow-y-auto">
            <h3 className="text-sm font-semibold mb-3">Mockup view</h3>

            <PreviewGrid
              previewMockups={previewMockups}
              canvasData={canvasData}
              activePreview={activePreview}
              setActivePreview={setActivePreview}
            />

            <div className="mt-6 text-xs text-gray-500">
              Preview product size: L <br />
              Design is scaled down on smaller sizes.
            </div>

            {/* Color mode */}
            <div className="mt-6">
              <p className="text-sm font-semibold mb-2">Mockup color mode</p>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={colorMode === "cmyk"}
                  onChange={() => setColorMode("cmyk")}
                />
                Realistic (CMYK)
              </label>

              <label className="flex items-center gap-2 text-sm mt-1">
                <input
                  type="radio"
                  checked={colorMode === "rgb"}
                  onChange={() => setColorMode("rgb")}
                />
                Bright/colourful (RGB)
              </label>
            </div>
          </div>
        </div>
      </div>
      {/* DOWNLOAD */}
      <div className="fixed bottom-0 left-0 flex justify-between items-center w-full bg-white px-4 py-3 border-t border-gray-200">
        <button onClick={downloadMockup} className="text-xl">
          Download mockup
        </button>
        <button>Save Product</button>
      </div>
    </div>
  );
}
