export default function ToolCategoryPanel({ category, onToolAction }) {
    const btn = "w-full text-left px-1 py-2 border-b hover:bg-gray-100 bg-white";

    switch (category) {
        case "text":
            return (
                <div>
                    <button className={btn} onClick={() => onToolAction("bold")}>Bold</button>
                    <button className={btn} onClick={() => onToolAction("italic")}>Italic</button>
                    <button className={btn} onClick={() => onToolAction("underline")}>Underline</button>
                    <div className="px-4 py-2">
                        <label className="block mb-1">Font Size</label>
                        <select className="w-full" onChange={e => onToolAction("fontSize", parseInt(e.target.value))}>
                            {[12, 14, 16, 18, 20, 22, 24].map(v => <option key={v}>{v}</option>)}
                        </select>
                    </div>
                    <div className="px-4 py-2">
                        <label className="block mb-1">Font Family</label>
                        <select className="w-full" onChange={e => onToolAction("fontFamily", e.target.value)}>
                            {["Arial", "Times New Roman", "Comic Sans MS", "Verdana", "Georgia"].map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>
                    <div className="px-4 py-2">
                        <label>Font Color</label>
                        <input type="color" className="w-full mt-1" onChange={e => onToolAction("fill", e.target.value)} />
                    </div>
                    <button className={btn+ "border-none"} onClick={() => onToolAction("addText")}>Add Text</button>
                </div>
            );
        case "shapes":
            return (
                <div>
                    <button className={btn} onClick={() => onToolAction("addRect")}>Add Rectangle</button>
                    <button className={btn} onClick={() => onToolAction("addCircle")}>Add Circle</button>
                    <button className={btn} onClick={() => onToolAction("addLine")}>Add Line</button>
                </div>
            );
        case "overlay":
            return (
                <div>
                    <button className={btn} onClick={() => onToolAction("bringForward")}>Bring Forward</button>
                    <button className={btn} onClick={() => onToolAction("sendBackward")}>Send Backward</button>
                </div>
            );
        case "gallery":
            return <div><p className="text-sm text-gray-500">Gallery coming soon</p></div>;
        case "upload":
            return <div><p className="text-sm text-gray-500">Upload Image above</p></div>;
        default:
            return <div>No tools</div>;
    }
}
