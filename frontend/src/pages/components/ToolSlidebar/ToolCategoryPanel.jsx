import { FaBold, FaItalic, FaUnderline, FaFont, FaTextHeight, FaTrash, FaFill, FaSquare, FaCircle, FaCut, FaCopy, FaPaste, FaBorderAll, FaDotCircle, FaPlus } from "react-icons/fa";

export default function ToolCategoryPanel({ category, onToolAction }) {
    const btn = "flex items-center px-2 py-2 hover:bg-gray-100 rounded cursor-pointer";
    const iconClass = "mr-2";

    switch (category) {
        case "text":
            return (
                <div className="space-y-2 bg-white">
                    <div className={btn} onClick={() => onToolAction("bold")}><FaBold className={iconClass} />Bold</div>
                    <div className={btn} onClick={() => onToolAction("italic")}><FaItalic className={iconClass} />Italic</div>
                    <div className={btn} onClick={() => onToolAction("underline")}><FaUnderline className={iconClass} />Underline</div>
                    <div className="px-2 py-2">
                        <FaTextHeight className="mr-2" />Font Size:
                        <select className="ml-2" onChange={e => onToolAction("fontSize", parseInt(e.target.value))}>
                            {[12, 14, 16, 18, 20, 22, 24].map(v => <option key={v}>{v}</option>)}
                        </select>
                    </div>
                    <div className="px-2 py-2">
                        <FaFont className="mr-2" />Font Family:
                        <select className="ml-2" onChange={e => onToolAction("fontFamily", e.target.value)}>
                            {["Arial", "Times New Roman", "Comic Sans MS", "Verdana", "Georgia"].map(f => <option key={f}>{f}</option>)}
                        </select>
                    </div>
                    <div className="px-2 py-2">
                        <FaFill className="mr-2" />Font Color:
                        <input type="color" className="ml-2" onChange={e => onToolAction("fill", e.target.value)} />
                    </div>
                    <div className="px-2 py-2">
                        <div className={btn} onClick={() => onToolAction("addBullets")}><FaDotCircle className="mr-2" /> Add Bullets</div>
                    </div>
                    <div className="px-4 py-2">
                        <label className="block mb-1">Text Align</label>
                        <select
                            className="w-full"
                            onChange={(e) => onToolAction("textAlign", e.target.value)}
                        >
                            {["left", "center", "right", "justify"].map((align) => (
                                <option key={align} value={align}>
                                    {align.charAt(0).toUpperCase() + align.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="px-2 py-2">
                        <div className={`${btn} border-t pt-2`} onClick={() => onToolAction("addText")}><FaPlus className="mr-2" /> Add Text</div>
                    </div>
                </div>
            );

        case "shapes":
            return (
                <div className="space-y-2 bg-white">
                    <div className={btn} onClick={() => onToolAction("addRect")}><FaSquare className="mr-2" /> Add Rectangle</div>
                    <div className={btn} onClick={() => onToolAction("addCircle")}><FaCircle className="mr-2" /> Add Circle</div>
                    <div className={btn} onClick={() => onToolAction("addLine")}><FaBorderAll className="mr-2" /> Add Line</div>
                    <div className={btn} onClick={() => onToolAction("deleteObject")}><FaTrash className={iconClass} />Delete Selected</div>
                    <div className="px-2 py-2 flex items-center">
                        <FaFill className="mr-2" />Fill Color:
                        <input type="color" className="ml-2" onChange={e => onToolAction("shapeFill", e.target.value)} />
                    </div>
                </div>
            );

        case "overlay":
            return (
                <div className="space-y-2 bg-white">
                    <div className={btn} onClick={() => onToolAction("bringForward")}>⬆️ Bring Forward</div>
                    <div className={btn} onClick={() => onToolAction("sendBackward")}>⬇️ Send Backward</div>
                </div>
            );

        case "gallery":
            return <div className="p-2 bg-white text-gray-500">Gallery coming soon</div>;
        case "upload":
            return <div className="p-2 bg-white text-gray-500">Upload tool here</div>;
        case "clipboard":
            return (
                <div className="space-y-2 bg-white">
                    <div className={btn} onClick={() => onToolAction("cut")}><FaCut className={iconClass} /> Cut</div>
                    <div className={btn} onClick={() => onToolAction("copy")}><FaCopy className={iconClass} /> Copy</div>
                    <div className={btn} onClick={() => onToolAction("paste")}><FaPaste className={iconClass} /> Paste</div>
                    <div className={btn} onClick={() => onToolAction("deleteObject")}><FaTrash className={iconClass} /> Delete</div>
                </div>
            );

            
        default:
            return <div className="p-2 bg-white">No tools</div>;
    }
}
