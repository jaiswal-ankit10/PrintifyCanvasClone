import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  ChevronDown,
  Copy,
  Info,
  Italic,
  Loader2,
  PencilRuler,
  Pipette,
  Redo2,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONT_API;
export const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48, 56, 64, 72,
  80, 96, 120, 144,
];

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
  onChangeColor,
}) {
  const pickerRef = useRef(null);
  const fontFamilyRef = useRef(null);
  const fontSizeRef = useRef(null);

  const [showPicker, setShowPicker] = useState(false);
  const [showAlignment, setShowAlignment] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);

  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFontLoading, setIsFontLoading] = useState(false);

  const isText =
    selectedObject?.type === "i-text" || selectedObject?.type === "text";
  const isShape =
    selectedObject?.type === "group" || selectedObject?.name === "user-graphic";

  const loadGoogleFont = (fontFamily) => {
    return new Promise((resolve) => {
      const fontName = fontFamily.replace(/ /g, "+");

      if (document.getElementById(`font-${fontName}`)) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.id = `font-${fontName}`;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:ital,wght@0,300;0,400;0,600;0,700;1,400;1,700&display=swap`;
      link.onload = resolve;

      document.head.appendChild(link);
    });
  };

  const toggleBold = async () => {
    if (!selectedObject || !isText) return;

    await loadGoogleFont(selectedObject.fontFamily);

    const isBold =
      selectedObject.fontWeight === "bold" || selectedObject.fontWeight === 700;

    selectedObject.set({
      fontWeight: isBold ? 400 : 700,
      dirty: true,
    });

    selectedObject.initDimensions();
    selectedObject.canvas.requestRenderAll();
  };
  const toggleItalic = async () => {
    if (!selectedObject || !isText) return;

    await loadGoogleFont(selectedObject.fontFamily);

    const isItalic = selectedObject.fontStyle === "italic";

    selectedObject.set({
      fontStyle: isItalic ? "normal" : "italic",
      dirty: true,
    });

    selectedObject.initDimensions();
    selectedObject.canvas.requestRenderAll();
  };

  const handleFontSelect = async (fontFamily) => {
    if (!selectedObject || !isText) return;

    setIsFontLoading(true);
    await loadGoogleFont(fontFamily);
    selectedObject.set("fontFamily", fontFamily);

    selectedObject.canvas.requestRenderAll();

    setShowFontFamily(false);
    setIsFontLoading(false);
  };

  const handleFontSize = (size) => {
    if (!selectedObject || !isText) return;

    selectedObject.set("fontSize", size);
    selectedObject.canvas.requestRenderAll();
  };

  const setTextAlign = (align) => {
    if (!selectedObject || !isText) return;

    selectedObject.set({
      textAlign: align,
      dirty: true,
    });
    selectedObject.canvas.requestRenderAll();
    setShowAlignment(false);
  };

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=${GOOGLE_FONTS_API_KEY}`,
        );
        const data = await response.json();

        // Remove .slice() to get all 1,500+ fonts
        setFonts(data.items || []);
      } catch (error) {
        console.error("Error fetching Google Fonts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFonts();
  }, []);

  const filteredFonts = useMemo(() => {
    return fonts.filter((f) =>
      f.family.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [fonts, searchTerm]);

  // 3. Dynamically load previews for visible fonts only (Performance Optimization)
  useEffect(() => {
    if (filteredFonts.length > 0) {
      // Load CSS for the first 50 results to show previews in the list
      const previewBatch = filteredFonts
        .slice(0, 50)
        .map((f) => f.family.replace(/ /g, "+"))
        .join("|");

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css?family=${previewBatch}&display=swap`;
      document.head.appendChild(link);
    }
  }, [filteredFonts]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
      if (fontFamilyRef.current && !fontFamilyRef.current.contains(e.target)) {
        setShowFontFamily(false);
      }

      if (fontSizeRef.current && !fontSizeRef.current.contains(e.target)) {
        setShowFontSize(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // console.log(selectedObject);
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

              {isText && (
                <div className="flex items-center gap-2">
                  <div>
                    <button
                      ref={fontFamilyRef}
                      className="relative flex items-center gap-1 px-3 py-1 border border-gray-300 rounded  hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setShowFontFamily((prev) => !prev);
                        setShowFontSize(false);
                      }}
                    >
                      <span className="text-md font-medium">
                        {selectedObject.fontFamily}
                      </span>
                      <span>{<ChevronDown />}</span>
                    </button>

                    {showFontFamily && (
                      <div className="absolute z-10 bg-white p-2 border border-gray-200 max-h-80">
                        <div className="relative mb-6 mt-2">
                          <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                          />
                          <input
                            type="text"
                            placeholder="Search 1,500+ fonts..."
                            className="w-full bg-[#f5f5f0] rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#646323]/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="flex-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          <h3 className="text-[#2f2e0c] font-bold mb-4">
                            Discover Fonts
                          </h3>

                          {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                              <Loader2
                                className="animate-spin text-[#646323]"
                                size={32}
                              />
                              <p className="text-xs text-gray-500 font-medium">
                                Loading Google Library...
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {filteredFonts.map((font) => (
                                <button
                                  key={font.family}
                                  onClick={() => handleFontSelect(font.family)}
                                  className="w-full text-left py-4 px-3 hover:bg-[#f5f5f0] transition-all border-b border-gray-50 group flex justify-between items-center cursor-pointer rounded-md"
                                >
                                  <span
                                    style={{ fontFamily: font.family }}
                                    className="text-xl text-[#2f2e0c] truncate"
                                  >
                                    {font.family}
                                  </span>
                                </button>
                              ))}
                              {filteredFonts.length === 0 && (
                                <p className="text-center text-gray-400 text-sm py-10">
                                  No fonts found
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      ref={fontSizeRef}
                      onClick={() => {
                        setShowFontSize((prev) => !prev);
                        setShowFontFamily(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded  hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="text-md font-medium">
                        {selectedObject.fontSize}
                      </span>
                      <span>
                        <ChevronDown />
                      </span>
                    </button>

                    {showFontSize && (
                      <div className="absolute z-10 bg-white p-2 border border-gray-200 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {FONT_SIZES.map((size) => (
                          <button
                            key={size}
                            onClick={() => handleFontSize(size)}
                            className="px-3 py-2 hover:bg-gray-100 text-sm flex flex-col text-left cursor-pointer"
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isText && (
                <div className="flex items-center gap-2 border-l pl-3 border-gray-300 relative">
                  <button
                    onClick={toggleBold}
                    className={`p-1.5 rounded hover:bg-gray-100 ${selectedObject.fontWeight === 700 ? "bg-gray-200" : ""} cursor-pointer`}
                  >
                    <Bold size={20} />
                  </button>
                  <button
                    onClick={toggleItalic}
                    className="p-1.5 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <Italic size={20} />
                  </button>
                  <div className="h-6 w-px bg-gray-300 mx-1" />
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => setShowAlignment((prev) => !prev)}
                  >
                    <AlignLeft size={20} />
                  </button>
                  {showAlignment && (
                    <div className="absolute top-11 left-20 bg-white border border-gray-200 rounded z-10">
                      <button
                        onClick={() => setTextAlign("left")}
                        className="p-1.5 rounded hover:bg-gray-100 cursor-pointer"
                      >
                        <AlignLeft size={20} />
                      </button>
                      <button
                        onClick={() => setTextAlign("center")}
                        className="p-1.5 rounded hover:bg-gray-100 cursor-pointer"
                      >
                        <AlignCenter size={20} />
                      </button>
                      <button
                        onClick={() => setTextAlign("right")}
                        className="p-1.5 rounded hover:bg-gray-100 cursor-pointer"
                      >
                        <AlignRight size={20} />
                      </button>
                    </div>
                  )}
                  <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
                    <Baseline size={20} />
                  </button>
                </div>
              )}

              {/* Color Selector */}
              {isShape && (
                <div className="relative" ref={pickerRef}>
                  <button
                    className="cursor-pointer"
                    onClick={() => setShowPicker(!showPicker)}
                  >
                    <div
                      className="w-7 h-7 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: selectedObject.fill || "#000" }}
                    />
                  </button>

                  {showPicker && (
                    <div className="absolute top-10 left-0 z-50 bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-64">
                      <HexColorPicker
                        color={selectedObject.fill || "#000"}
                        onChange={onChangeColor}
                      />

                      <div className="mt-4 flex items-center gap-2 border-t pt-3">
                        <div
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: selectedObject.fill }}
                        />
                        <div className="flex-1 px-2 py-1 bg-gray-100 rounded text-sm font-mono uppercase">
                          {selectedObject.fill}
                        </div>
                        <Pipette
                          size={18}
                          className="text-gray-500 cursor-pointer hover:text-black"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="h-6 w-px bg-gray-300 mx-1" />

              <button
                onClick={onCopy}
                className="p-2 hover:border border-gray-300 rounded transition cursor-pointer"
                title="Duplicate"
              >
                <Copy size={19} />
              </button>

              <button
                onClick={onDelete}
                className="p-2 hover:border border-gray-300 rounded transition cursor-pointer"
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
