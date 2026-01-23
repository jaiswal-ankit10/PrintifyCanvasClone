import { Minus, Plus, Hand, ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function BottomBar({ isPanMode, setIsPanMode, zoom, setZoom }) {
  const [open, setOpen] = useState(false);

  const zoomOptions = [145, 125, 100, 50, 25, 7, 3];

  function zoomIn() {
    const currentIndex = zoomOptions.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomOptions[currentIndex - 1]);
    }
  }

  function zoomOut() {
    const currentIndex = zoomOptions.indexOf(zoom);
    if (currentIndex < zoomOptions.length - 1) {
      setZoom(zoomOptions[currentIndex + 1]);
    }
  }

  //close dropdown when user clicks anywhere
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="fixed bottom-0 w-[calc(100%-4rem)] h-14  border-t border-gray-200 bg-white shadow-lg flex items-center justify-between px-4">
      {/* LEFT CONTROLS */}
      <div className="flex items-center gap-3">
        {/* Minus */}
        <div className="flex items-center">
          <button
            onClick={zoomOut}
            disabled={zoom === zoomOptions[zoomOptions.length - 1]}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Zoom dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="min-w-17.5 h-8 px-2 border border-gray-200  bg-white flex items-center justify-between gap-1 hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-sm font-medium">{zoom}%</span>
              {open ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {open && (
              <div className="absolute bottom-10 left-0 w-full bg-white border border-gray-200  shadow-md z-50 ">
                {zoomOptions.map((z) => (
                  <button
                    key={z}
                    onClick={() => {
                      setZoom(z);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1 text-sm hover:bg-gray-100 ${
                      zoom === z ? "bg-gray-200" : ""
                    }`}
                  >
                    {z}%
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Plus */}
          <button
            onClick={zoomIn}
            disabled={zoom === zoomOptions[0]}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Hand (Pan tool) */}
        <button
          onClick={() => setIsPanMode((prev) => !prev)}
          className={`w-8 h-8 flex items-center justify-center border border-gray-200 rounded
    ${isPanMode ? "bg-gray-200" : "bg-white hover:bg-gray-100"}
  `}
        >
          <Hand className="w-4 h-4" />
        </button>
      </div>

      {/* RIGHT ACTION */}
      <button className="bg-[#b8ff66] text-[#2f2e0c] font-bold px-6 py-2 rounded-md hover:brightness-95 pl-10 w-96 cursor-pointer">
        Save product
      </button>
    </div>
  );
}
