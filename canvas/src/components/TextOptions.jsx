import { useState, useEffect, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import FontFaceObserver from "fontfaceobserver";

const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONT_API;

export default function TextOptions({
  onAddText,
  onClosePanel,
  setIsProcessing,
}) {
  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFontLoading, setIsFontLoading] = useState(false);

  // 1. Fetch ALL fonts from the API
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

  // 2. Filter fonts based on search
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

  const handleFontSelect = async (fontFamily) => {
    if (isFontLoading) return;
    setIsProcessing(true);
    setIsFontLoading(true);
    // Inject full weight support for the selected font
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@400;700&display=swap`;
    document.head.appendChild(link);

    const font = new FontFaceObserver(fontFamily);

    font
      .load(null, 5000)
      .then(() => {
        onAddText("New Text", fontFamily);
        onClosePanel();
      })
      .catch((err) => {
        console.warn("Font load failed", err);
        onAddText("New Text", "sans-serif");
        onClosePanel();
      })
      .finally(() => {
        setIsFontLoading(false);
        setIsProcessing(false);
      });
  };

  return (
    <div className="relative p-4 flex flex-col h-full bg-white">
      {isFontLoading && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#646323]" />
          <p className="mt-2 text-sm font-bold text-[#2f2e0c]">
            Applying font...
          </p>
        </div>
      )}
      <div className="relative mb-6">
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

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-[#2f2e0c] font-bold mb-4">Discover Fonts</h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-[#646323]" size={32} />
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
  );
}
