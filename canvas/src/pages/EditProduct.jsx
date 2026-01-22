import { useParams } from "react-router-dom";
import { useState } from "react";
import TopBar from "../ui/TopBar";
import LeftToolbar from "../ui/LeftToolBar";
import CanvasArea from "../ui/CanvasArea";
import RightPanel from "../ui/RightPanel";
import BottonBar from "../ui/BottonBar";
import { products } from "../data/products";
import SideTabs from "../ui/SideTabs";

export default function EditProduct() {
  const { productId } = useParams();
  const [isEditOpen, setIsEditOpen] = useState(true);
  const [activeMode, setActiveMode] = useState("edit");
  const product = products.find((p) => p.id === productId);
  const [activeSide, setActiveSide] = useState(product.sides[0].key);
  const [isPanMode, setIsPanMode] = useState(false);
  const [zoom, setZoom] = useState(7);
  const [mockupState, setMockupState] = useState({});
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8f8f6]">
      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="shrink-0 h-screen">
          <LeftToolbar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar activeMode={activeMode} setActiveMode={setActiveMode} />
          {/* Canvas */}
          <div className="relative flex-1 bg-[#f5f5f0] overflow-hidden">
            {/* CANVAS STAGE */}
            <div className="absolute inset-0 flex items-center justify-center">
              <CanvasArea
                mockup={product.mockups[activeSide]}
                isPanMode={isPanMode}
                activeMode={activeMode}
                activeSide={activeSide}
                mockupState={mockupState}
                setMockupState={setMockupState}
                zoom={zoom}
              />
            </div>

            {/* SIDE TABS */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
              <SideTabs
                sides={product.sides}
                activeSide={activeSide}
                setActiveSide={setActiveSide}
              />
            </div>
          </div>
          <BottonBar
            isPanMode={isPanMode}
            setIsPanMode={setIsPanMode}
            zoom={zoom}
            setZoom={setZoom}
          />
        </div>
      </div>
    </div>
  );
}
