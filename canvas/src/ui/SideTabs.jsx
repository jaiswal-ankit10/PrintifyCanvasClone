function SideTabs({ sides, activeSide, setActiveSide }) {
  return (
    <div className="mt-4 flex gap-2 justify-center">
      {sides.map((side) => (
        <button
          key={side.key}
          onClick={() => setActiveSide(side.key)}
          className={`px-4 py-1 rounded-full text-sm transition cursor-pointer
            ${
              activeSide === side.key
                ? "bg-[#4f513c] text-white"
                : "bg-white border"
            }
          `}
        >
          {side.label}
        </button>
      ))}
    </div>
  );
}

export default SideTabs;
