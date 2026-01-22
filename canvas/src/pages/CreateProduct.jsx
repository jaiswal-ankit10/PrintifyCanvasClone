import { useState } from "react";
import Navbar from "../components/Navbar";
import { products } from "../data/products";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CreateProduct() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <Navbar />
      <div className=" py-10 bg-[#f5f5f0]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-[#2f2e0c]">
            Choose one of our bestselling products
          </h2>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`cursor-pointer transition 
    ${selectedProduct === product.id ? "bg-[#e0e0d7]" : "hover:bg-[#e0e0d7]"}
  `}
              >
                <div className="relative group bg-[#d9d9d2] rounded mb-4 h-70  overflow-hidden">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="absolute inset-0 m-auto max-h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                  />

                  <img
                    src={product.hoverImage}
                    alt={`${product.name} preview`}
                    className="absolute inset-0 m-auto max-h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-base leading-snug mb-1 text-[#2f2e0c]">
                    {product.name}
                  </h3>

                  <p className="text-sm font-semibold text-[#2f2e0c]">
                    From USD {product.priceFrom}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-12 mr-10">
        <button
          disabled={!selectedProduct}
          onClick={() => navigate(`/editor/${selectedProduct}`)}
          className={`px-6 py-3 rounded-md text-lg font-semibold flex items-center gap-2 cursor-pointer
    ${
      selectedProduct
        ? "bg-[#4f513c] text-white hover:opacity-90"
        : "bg-[#e6e6de] text-[#9a9a8c] cursor-not-allowed"
    }
  `}
        >
          Create product <ArrowRight />
        </button>
      </div>
    </>
  );
}
