import { createContext, useContext, useEffect, useState } from "react";

const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const [libraryImages, setLibraryImages] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("my-library");
    if (saved) setLibraryImages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("my-library", JSON.stringify(libraryImages));
  }, [libraryImages]);

  const addToLibrary = (image) => {
    setLibraryImages((prev) => [image, ...prev]);
  };

  return (
    <LibraryContext.Provider value={{ libraryImages, addToLibrary }}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => useContext(LibraryContext);
