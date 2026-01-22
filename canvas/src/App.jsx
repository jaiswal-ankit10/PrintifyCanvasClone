import { Routes, Route } from "react-router-dom";
import CreateProduct from "./pages/CreateProduct";
import EditProduct from "./pages/EditProduct";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateProduct />} />
      <Route path="/editor/:productId" element={<EditProduct />} />
    </Routes>
  );
}
