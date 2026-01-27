import React, { useEffect, useState } from "react";

const GraphicsLibrary = ({ onAddGraphic }) => {
  const [categories, setCategories] = useState([]);
  const [graphics, setGraphics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGraphics = async () => {
      try {
        // 1. Load master index
        const res = await fetch("/graphics/index.json");
        const index = await res.json();

        setCategories(index.categories);

        // 2. Load each category graphics
        const graphicsMap = {};

        await Promise.all(
          index.categories.map(async (cat) => {
            const res = await fetch(`/graphics/${cat.id}/index.json`);
            const data = await res.json();
            graphicsMap[cat.id] = data.graphics;
          }),
        );

        setGraphics(graphicsMap);
      } catch (err) {
        console.error("Failed to load graphics", err);
      } finally {
        setLoading(false);
      }
    };

    loadGraphics();
  }, []);

  if (loading) {
    return <div className="p-4 text-sm">Loading graphics…</div>;
  }

  return (
    <div className="p-3 space-y-6">
      {categories.map((cat) => (
        <div key={cat.id}>
          <h3 className="text-sm font-semibold mb-2">{cat.name}</h3>

          <div className="grid grid-cols-3 gap-2">
            {graphics[cat.id]?.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-md p-2 cursor-pointer hover:bg-gray-100 flex items-center justify-center"
                title={item.name}
                onClick={() => onAddGraphic(item)}
              >
                <img
                  src={item.file}
                  alt={item.name}
                  className="max-w-full max-h-16 object-contain"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GraphicsLibrary;
