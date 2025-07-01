import { useState } from "react";
import { BsType, BsImage } from "react-icons/bs";
import { FiUploadCloud } from "react-icons/fi";
import { AiOutlineMenu, AiOutlineClose, AiOutlineArrowLeft, AiOutlineArrowDown } from "react-icons/ai";
import { FaShapes, FaLink, FaUndo, FaRedo, FaLayerGroup } from "react-icons/fa";
import ToolCategoryPanel from "./ToolCategoryPanel";

export default function ToolSidebar({ onToolAction, isMobile }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);

    const categories = [
        { id: "text", icon: <BsType size={28} /> },
        { id: "shapes", icon: <FaShapes size={28} /> },
        { id: "gallery", icon: <BsImage size={28} /> },
        { id: "upload", icon: <FiUploadCloud size={28} /> },
        { id: "overlay", icon: <FaLayerGroup size={28} /> },
        { id: "undo", icon: <FaUndo size={20} onClick={() => onToolAction("undo")} className="cursor-pointer" /> },
        { id: "redo", icon: <FaRedo size={20} onClick={() => onToolAction("redo")} className="cursor-pointer" />},
    ];

    const openCat = (id) => {
        setActiveCategory(activeCategory === id ? null : id);
        setDrawerOpen(true);
    };

    const renderMobile = () => (
        <>
            <button onClick={() => drawerOpen ? setDrawerOpen(false) : setDrawerOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-blue-600 p-3 rounded-full text-white shadow-lg">
                {drawerOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
            </button>
            <div className={`fixed bottom-4 left-4 right-0 overflow-x-auto p-2 bg-white shadow-md flex gap-2 ${drawerOpen ? "" : "hidden"}`}>
                {categories.map(c =>
                    <button key={c.id} onClick={() => openCat(c.id)} className="p-2 bg-gray-100 rounded">
                        {c.icon}
                    </button>
                )}
            </div>
            {drawerOpen && activeCategory && (
                <div className="fixed max-h-3/12 bottom-20 left-0 right-0 p-4 overflow-y-auto">
                    <div className="flex items-center mb-2">
                        <AiOutlineArrowDown size={20} onClick={() => setActiveCategory(null)} className="cursor-pointer" />
                        <span className="ml-2 font-semibold">{activeCategory}</span>
                    </div>
                    <ToolCategoryPanel category={activeCategory} onToolAction={onToolAction} />
                </div>
            )}
        </>
    );

    const renderDesktop = () => (
        <div className="hidden md:flex flex-col items-center p-2 border-r space-y-2">
            {categories.map(c =>
                <button key={c.id} onClick={() => openCat(c.id)}
                    className="p-3 bg-gray-100 rounded hover:bg-gray-200">
                    {c.icon}
                </button>
            )}
            {activeCategory &&
                <div className="absolute h-screen top-0 left-16 bg-white border rounded p-3">
                    <ToolCategoryPanel category={activeCategory} onToolAction={onToolAction} />
                </div>
            }
        </div>
    );

    return isMobile ? renderMobile() : renderDesktop();
}
