import { useLibrary } from "../context/LibraryContext";

export default function MyLibrary({ onAddImage }) {
  const { libraryImages } = useLibrary();

  if (!libraryImages.length) {
    return (
      <div className="flex justify-center items-center text-sm text-gray-500 h-full px-2">
        <div className="flex flex-col items-center">
          <img src={"/no-file-uploaded.svg"} alt="" />
          <h1 className="font-bold text-xl text-black my-2">
            Nothing here yet
          </h1>
          <p className="text-md font-medium text-black/70">
            Your design files will appear here once added.
          </p>
        </div>
      </div>
    );
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
