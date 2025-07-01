export default function EditorToolbar({ canvas }) {
  const btn = "bg-white border px-1 rounded hover:bg-gray-100 transition";
  const getActiveTextbox = () => {
    const active = canvas?.getActiveObject();
    if (!active || active.type !== "textbox") {
      alert("Please select something.");
      return null;
    }
    return active;
  };

  const applyStyle = (type, value) => {
    const active = getActiveTextbox();
    if (!active) return;

    if (type === "bold") {
      const isBold = active.fontWeight === "bold";
      active.set("fontWeight", isBold ? "normal" : "bold");
    } else {
      active.set(type, value);
    }

    canvas.renderAll();
  };

  const deleteObject = () => {
    const active = canvas?.getActiveObject();
    if (active) {
      canvas.remove(active);
    } else {
      alert("Select an object to delete.");
    }
  };

  const addText = () => {
    const textbox = new window.fabric.Textbox("New Text", {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 16,
      fill: "#000"
    });
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
  };

  const addRect = () => {
    const rect = new window.fabric.Rect({
      left: 100,
      top: 100,
      fill: "#e0e0e0",
      width: 100,
      height: 60
    });
    canvas.add(rect);
  };

  const addCircle = () => {
    const circle = new window.fabric.Circle({
      radius: 30,
      fill: "#aaccee",
      left: 150,
      top: 150
    });
    canvas.add(circle);
  };

  const addLine = () => {
    const line = new window.fabric.Line([50, 100, 250, 100], {
      stroke: "#555",
      strokeWidth: 2
    });
    canvas.add(line);
  };

  const reloadTemplate = () => {
    window.location.reload();
  };

  return (
    <div className="flex gap-2 flex-wrap bg-white p-3 rounded shadow fixed top-2 left-1/2 -translate-x-1/2 z-30 border border-gray-200">
      <button onClick={() => applyStyle("bold")} className="btn">Bold</button>
      <select
        onChange={(e) => applyStyle("fontSize", parseInt(e.target.value))}
        className="border px-1 py-1 rounded"
      >
        <option>16</option>
        <option>18</option>
        <option>20</option>
        <option>24</option>
        <option>28</option>
      </select>
      <input
        type="color"
        onChange={(e) => applyStyle("fill", e.target.value)}
        className="w-8 h-8"
        title="Text Color"
      />
      <button onClick={deleteObject} className={btn}>Delete</button>
      <button onClick={addText} className={btn}>+ Text</button>
      <button onClick={addRect} className={btn}>+ Rectangle</button>
      <button onClick={addCircle} className={btn}>+ Circle</button>
      <button onClick={addLine} className={btn}>+ Line</button>
      <button onClick={reloadTemplate} className={btn}>Reload</button>
    </div>
  );
}
