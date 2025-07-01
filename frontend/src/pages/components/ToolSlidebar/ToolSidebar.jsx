import { useState } from "react";
import { BsType, BsImage } from "react-icons/bs";
import { FiUploadCloud } from "react-icons/fi";
import { AiOutlineMenu, AiOutlineClose, AiOutlineArrowDown } from "react-icons/ai";
import { FaShapes, FaLayerGroup, FaCut } from "react-icons/fa";
import ToolCategoryPanel from "./ToolCategoryPanel";

export default function ToolSidebar({ onToolAction, isMobile }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [active, setActive] = useState(null);
    const categories = [
        { id: "text", icon: <BsType size={28} /> },
        { id: "shapes", icon: <FaShapes size={28} /> },
        { id: "overlay", icon: <FaLayerGroup size={28} /> },
        { id: "gallery", icon: <BsImage size={28} /> },
        { id: "upload", icon: <FiUploadCloud size={28} /> },
        { id: "clipboard", icon: <FaCut size={28} /> },
    ];

    const openCat = id => {
        if (active === id) setActive(null);
        else {
            setActive(id);
            setDrawerOpen(true);
        }
    };

    const mobile = (
        <>
            <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="fixed bottom-4 right-4 z-50 bg-blue-600 p-3 rounded-full text-white shadow-lg"
            >
                {drawerOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
            </button>
            <div className={`fixed z-10  bottom-4 left-4 right-0 bg-white p-2 flex gap-2 overflow-x-auto shadow-md ${drawerOpen ? "" : "hidden"}`}>
                {categories.map(c => (
                    <button key={c.id} onClick={() => openCat(c.id)} className="p-2 bg-gray-100 rounded">
                        {c.icon}
                    </button>
                ))}
            </div>
            {drawerOpen && active && (
                <div className="fixed z-10 bottom-20 left-0 right-0 bg-white p-4 shadow-lg">
                    <div className="flex items-center mb-2">
                        <AiOutlineArrowDown size={20} onClick={() => setActive(null)} className="cursor-pointer" />
                        <span className="ml-2 font-semibold">{active}</span>
                    </div>
                    <ToolCategoryPanel category={active} onToolAction={onToolAction} />
                </div>
            )}
        </>
    );

    const desktop = (
        <div className="absolute min-h-lvh md:flex flex-col items-center z-10 bg-white p-2 border-r shadow-md">
            {categories.map(c => (
                <button key={c.id} onClick={() => openCat(c.id)} className="p-3 bg-gray-100 rounded hover:bg-gray-200">
                    {c.icon}
                </button>
            ))}
            {active && (
                <div className="absolute top-0 left-16 bg-white p-3 shadow-md border rounded">
                    <ToolCategoryPanel category={active} onToolAction={onToolAction} />
                </div>
            )}
        </div>
    );

    return isMobile ? mobile : desktop;
}
