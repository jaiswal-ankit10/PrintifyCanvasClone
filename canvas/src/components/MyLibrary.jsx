import { useLibrary } from "../context/LibraryContext";

export default function MyLibrary({ onAddImage }) {
  const { libraryImages } = useLibrary();

  if (!libraryImages.length) {
    return <p className="p-2 text-sm text-gray-500">No uploads yet</p>;
  }

  return (
    <div className="p-2 grid grid-cols-2 gap-2">
      {libraryImages.map((img) => (
        <button
          key={img.id}
          onClick={() => onAddImage(img.src)}
          className="rounded overflow-hidden cursor-pointer"
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
