import { useLibrary } from "../context/LibraryContext";

export default function MyLibrary({ onAddImage }) {
  const { libraryImages } = useLibrary();

  if (!libraryImages.length) {
    return <p className="text-sm text-gray-500">No uploads yet</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {libraryImages.map((img) => (
        <button
          key={img.id}
          onClick={() => onAddImage(img.src)}
          className="border rounded overflow-hidden hover:ring-2 ring-[#646323]"
        >
          <img
            src={img.src}
            alt={img.name}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
