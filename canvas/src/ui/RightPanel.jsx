function RightPanel() {
  return (
    <div className="w-80 border-l bg-[#f8f8f6] p-4">
      <h3 className="font-semibold mb-4">Variants and layers</h3>

      {/* Variants */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2">Variants</p>
        <div className="flex items-center justify-between">
          <span className="text-sm">Colors</span>
          <button className="text-sm border px-3 py-1 rounded">
            Select variants
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <span className="w-6 h-6 rounded-full bg-white border"></span>
        </div>
      </div>

      {/* Layers */}
      <div>
        <p className="text-sm font-medium mb-2">Layers</p>
        <div className="text-sm text-gray-400">No layers yet</div>
      </div>
    </div>
  );
}
export default RightPanel;
