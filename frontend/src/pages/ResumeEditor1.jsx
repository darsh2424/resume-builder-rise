
import { useEffect, useRef, useState, useCallback } from "react";
import { FaUndo, FaRedo } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import ToolSidebar from "./components/ToolSlidebar/ToolSidebar";

export default function ResumeEditor() {
  const canvasRef = useRef(null);
  const [canvasSelect, setCanvasSelect] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const clipboardRef = useRef(null);

  // Utility functions
  const validateCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas is not initialized");
      return false;
    }
    return true;
  };

  const getActiveObjectSafe = () => {
    if (!validateCanvas()) return null;
    return canvasRef.current.getActiveObject();
  };

  const saveState = (selectedObjects = null) => {
    if (selectedObjects) {
      setCanvasSelect(selectedObjects);
    }
    const canvas = canvasRef.current;
    if (canvas && typeof canvas.toJSON === "function") {
      const snapshot = JSON.parse(JSON.stringify(canvas.toJSON(["id", "link"])));
      setUndoStack(prev => [...prev, snapshot]);
      setRedoStack([]);
    }
  };

  const undo = () => {
    if (undoStack.length < 2) return;

    const canvas = canvasRef.current;
    const newRedoStack = [...redoStack];
    const newUndoStack = [...undoStack];

    newRedoStack.push(newUndoStack.pop());
    const last = newUndoStack[newUndoStack.length - 1];

    setRedoStack(newRedoStack);
    setUndoStack(newUndoStack);

    canvas.loadFromJSON(last, () => {
      canvas.renderAll();
      updateTemplateJson(canvas);
    });
  };

  const redo = () => {
    if (!redoStack.length) return;

    const canvas = canvasRef.current;
    const newRedoStack = [...redoStack];
    const newUndoStack = [...undoStack];

    const next = newRedoStack.pop();
    newUndoStack.push(next);

    setRedoStack(newRedoStack);
    setUndoStack(newUndoStack);

    canvas.loadFromJSON(next, () => {
      canvas.renderAll();
      updateTemplateJson(canvas);
    });
  };

  const updateTemplateJson = (canvas) => {
    const canvasState = JSON.parse(JSON.stringify(canvas.toJSON(["id", "link"])));
    templateJson.version = canvasState.version || "5.2.4";
    templateJson.objects = canvasState.objects;
    templateJson.background = canvasState.background;
  };

  const applyAndSave = (obj = null) => {
    const canvas = canvasRef.current;
    if (!validateCanvas()) return;

    if (obj) {
      canvas.setActiveObject(obj);
    }

    canvas.renderAll();
    updateTemplateJson(canvas);
    saveState(obj ? [obj] : null);
  };

  const decorateObject = (obj) => {
    obj.set({
      selectable: true,
      hasControls: true,
      lockScalingFlip: true,
      cornerStyle: "circle",
      cornerColor: "#4285f4",
      borderColor: "#4285f4",
      id: obj.id || uuidv4()
    });
    obj.setCoords();
  };

  const handleToolAction = useCallback((action, payload) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    const isText = active && active.type === "textbox";

    switch (action) {
      case "bold":
      case "italic":
      case "underline":
        if (!isText) return alert("Select a text box");
        if (action === "bold") active.set("fontWeight", active.fontWeight === "bold" ? "normal" : "bold");
        if (action === "italic") active.set("fontStyle", active.fontStyle === "italic" ? "normal" : "italic");
        if (action === "underline") active.set("underline", !active.underline);
        applyAndSave(active);
        break;

      case "fontSize":
      case "fontFamily":
      case "fill":
        if (!isText) return alert("Select a text box");
        active.set(action, payload);
        applyAndSave(active);
        break;

      case "textAlign":
        if (!isText) return alert("Select a text box");
        active.set("textAlign", payload);
        applyAndSave(active);
        break;

      case "addBullets":
        if (!isText) return alert("Select a text box");
        const lines = active.text.split("\n").map(line => line.startsWith("•") ? line : `• ${line}`);
        active.set("text", lines.join("\n"));
        applyAndSave(active);
        break;

      case "addText": {
        const t = new window.fabric.Textbox("New Text", {
          left: 100, top: 100, width: 200, fontSize: 16, fill: "#000", link: "", id: uuidv4()
        });
        canvas.add(t);
        decorateObject(t);
        canvas.setActiveObject(t);
        applyAndSave(t);
        break;
      }

      case "addRect": {
        const r = new window.fabric.Rect({
          left: 100, top: 100, width: 120, height: 60, fill: "#e0e0e0", id: uuidv4()
        });
        canvas.add(r);
        decorateObject(r);
        canvas.setActiveObject(r);
        applyAndSave(r);
        break;
      }

      case "addCircle": {
        const c = new window.fabric.Circle({
          left: 120, top: 120, radius: 30, fill: "#aaccee", id: uuidv4()
        });
        canvas.add(c);
        decorateObject(c);
        canvas.setActiveObject(c);
        applyAndSave(c);
        break;
      }

      case "addLine": {
        const l = new window.fabric.Line([60, 100, 300, 100], {
          stroke: "#333", strokeWidth: 2, id: uuidv4()
        });
        canvas.add(l);
        decorateObject(l);
        canvas.setActiveObject(l);
        applyAndSave(l);
        break;
      }

      case "shapeFill":
        if (!active || active.type === "textbox") return alert("Select a shape");
        active.set("fill", payload);
        applyAndSave(active);
        break;

      case "deleteObject":
        if (active) {
          canvas.remove(active);
          canvas.discardActiveObject();
          applyAndSave();
        }
        break;

      case "bringForward":
        if (active) {
          canvas.bringForward(active);
          applyAndSave(active);
        }
        break;

      case "sendBackward":
        if (active) {
          canvas.sendBackwards(active);
          applyAndSave(active);
        }
        break;

      case "addImage":
        window.fabric.Image.fromURL(payload, img => {
          img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5, id: uuidv4() });
          canvas.add(img);
          decorateObject(img);
          canvas.setActiveObject(img);
          applyAndSave(img);
        });
        break;

      case "clear":
        canvas.clear();
        canvas.renderAll();
        updateTemplateJson(canvas);
        saveState();
        break;

      case "copy":
        if (active) {
          active.clone(clone => {
            clipboardRef.current = clone;
          });
        }
        break;

      case "cut":
        if (active) {
          active.clone(clone => {
            clipboardRef.current = clone;
            canvas.remove(active);
            canvas.discardActiveObject();
            saveState();
          });
        }
        break;

      case "paste":
        if (clipboardRef.current) {
          clipboardRef.current.clone(clone => {
            clone.set({ left: 120, top: 120, id: uuidv4() });
            decorateObject(clone);
            canvas.add(clone);
            canvas.setActiveObject(clone);
            saveState(clone);
          });
        }
        break;

      case "undo": undo(); break;
      case "redo": redo(); break;

      default: break;
    }
  }, [undoStack, redoStack]);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const c = new window.fabric.Canvas(canvasRef.current, {
      height: 1000,
      width: 600,
      backgroundColor: "#fff",
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      stateful: true
    });

    try {
      c.loadFromJSON(templateJson, () => {
        c.getObjects().forEach(obj => {
          decorateObject(obj);
        });
        canvasRef.current = c;
        c.renderAll();
        saveState();
      });
    } catch (error) {
      console.error("Error loading template:", error);
      c.renderAll();
      saveState();
    }

    const eventHandlers = {
      "object:modified": () => {
        updateTemplateJson(c);
        saveState();
      },
      "object:added": () => {
        updateTemplateJson(c);
        saveState();
      },
      "object:removed": () => {
        updateTemplateJson(c);
        saveState();
      },
      "selection:created": (e) => {
        setCanvasSelect(e?.selected || []);
        updateTemplateJson(c);
      },
      "selection:updated": (e) => {
        setCanvasSelect(e?.selected || []);
        updateTemplateJson(c);
      },
      "selection:cleared": () => {
        setCanvasSelect([]);
        updateTemplateJson(c);
      }
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      c.on(event, handler);
    });

    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        c.off(event, handler);
      });
      c.dispose();
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {

      const canvas = canvasRef.current;
      if (!canvas) return;

      // ESC to clear selection
      if (e.key === "Escape") {
        const active = canvas.getActiveObject();
        if (active) {
          canvas.discardActiveObject();
          canvas.renderAll();
          setCanvasSelect([]);
        }
        return;
      }
      if (e.key === "Delete") {
        const active = canvas.getActiveObject();
        if (active) {
          handleToolAction("deleteObject")
          saveState()
        }
        return;
      }
      // detect ctrl/cmd
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      const key = e.key.toLowerCase();
      // prevent default browser behavior for these combos
      if (["c", "v", "x", "z", "y"].includes(key)) {
        e.preventDefault();
        switch (key) {
          case "c":
            handleToolAction("copy");
            break;
          case "x":
            handleToolAction("cut");
            break;
          case "v":
            handleToolAction("paste");
            break;
          case "z":
            // Cmd+Shift+Z or Ctrl+Shift+Z should redo
            if (e.shiftKey) handleToolAction("redo");
            else handleToolAction("undo");
            break;
          case "y":
            handleToolAction("redo");
            break;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleToolAction]);

  return (
    <div className="relative flex">
      <ToolSidebar onToolAction={handleToolAction} isMobile={isMobile} />
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={undo} className="p-2 bg-white rounded shadow hover:bg-gray-100 transition">
          <FaUndo />
        </button>
        <button onClick={redo} className="p-2 bg-white rounded shadow hover:bg-gray-100 transition">
          <FaRedo />
        </button>
      </div>
      <div className="flex-1 p-4 flex justify-center">
        <canvas ref={canvasRef} className="border rounded shadow-lg" tabIndex={0} />
      </div>
      <button
        onClick={() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const currentJson = JSON.stringify(canvas.toJSON(["id", "link"]), null, 2);
          navigator.clipboard.writeText(currentJson);
          alert("Current canvas state copied to clipboard!");
        }}
        className="absolute top-2 right-45 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 transition"
      >
        📋 Copy JSON
      </button>
    </div>
  );
}

function updateTemplateJson(canvas) {
  const updatedObjects = canvas.getObjects().map(obj =>
    obj.toObject(["id", "link"])
  );
  templateJson.objects = updatedObjects;
}

const templateJson = {
  "version": "5.1.0",
  "objects": [
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 55,
      "top": 71,
      "width": 500,
      "height": 31.64,
      "fill": "#333",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "fontSize": 28,
      "text": "JANE SMITH",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "center",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "6fc4339d-8570-4fe4-8c26-16e6ac7cf7aa"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 55,
      "top": 111,
      "width": 500,
      "height": 13.56,
      "fill": "#666",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "normal",
      "fontSize": 12,
      "text": "jane.smith@example.com | (987) 654-3210 | Portland, OR | linkedin.com/in/janesmith",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "center",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "84330bf3-24bf-43ae-b449-c73ccdcbf78c"
    },
    {
      "type": "line",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 50,
      "top": 100,
      "width": null,
      "height": null,
      "fill": "rgb(0,0,0)",
      "stroke": "#333",
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "id": "ec17a1a0-f9b6-44e6-9bc8-2cdfb7db8c78",
      "x1": null,
      "x2": null,
      "y1": null,
      "y2": null
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 33,
      "top": 176,
      "width": 500,
      "height": 18.08,
      "fill": "#333",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "fontSize": 16,
      "text": "EXPERIENCE",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "1ac3fb71-72c4-46cb-bcc5-51c09ce3d815"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 33,
      "top": 196,
      "width": 500,
      "height": 13.56,
      "fill": "#333",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "fontSize": 12,
      "text": "Product Designer",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "c942c264-6cd7-497e-afb3-76e3a23ef1e4"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 33,
      "top": 216,
      "width": 500,
      "height": 15.82,
      "fill": "#666",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "normal",
      "fontSize": 14,
      "text": "Creative Agency | Jun 2019 - Present",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "b4c4ffd0-7d63-455c-8649-02f581c86a61"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 33,
      "top": 236,
      "width": 500,
      "height": 51.53,
      "fill": "#333",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "normal",
      "fontSize": 12,
      "text": "• Designed 15+ client websites with 95% client satisfaction\n• Created design system used across all company projects\n• Conducted user research leading to 25% increase in conversions",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.4,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "1a6d5335-5835-4c27-b4b7-a197d9015ede"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 37,
      "top": 353,
      "width": 500,
      "height": 18.08,
      "fill": "#333",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "fontSize": 16,
      "text": "EDUCATION",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "49151714-bca5-4c0c-aa1a-ade577cc364f"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 37,
      "top": 376,
      "width": 500,
      "height": 13.56,
      "fill": "#333",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "fontSize": 12,
      "text": "BFA in Graphic Design",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "d4a368a6-fa28-4cdc-8747-e54116464b5a"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 37,
      "top": 390,
      "width": 500,
      "height": 15.82,
      "fill": "#666",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "normal",
      "fontSize": 14,
      "text": "University of Oregon | Graduated 2018",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "1ce3cd04-9bd7-4286-a585-c2dc35e67f52"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 35,
      "top": 418,
      "width": 500,
      "height": 13.56,
      "fill": "#333",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "fontSize": 12,
      "text": "HSC - 2022",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "3328481f-5c82-4754-81f0-da9a0957492a"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 35,
      "top": 432,
      "width": 500,
      "height": 15.82,
      "fill": "#666",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "normal",
      "fontSize": 14,
      "text": "University of Oregon | Pass - 75%",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "86bc44ab-1441-470b-9433-72bf0bbab902"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 35,
      "top": 468,
      "width": 500,
      "height": 13.56,
      "fill": "#333",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "fontSize": 12,
      "text": "SSC - 2020",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "df7dec0b-ef06-4479-bb43-244f645c2c77"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 34,
      "top": 485,
      "width": 500,
      "height": 15.82,
      "fill": "#666",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "normal",
      "fontSize": 14,
      "text": "University of Oregon | Pass - 80%",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "45c82440-9045-4aec-921d-8e29c3dfa054"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 35,
      "top": 554,
      "width": 500,
      "height": 18.08,
      "fill": "#333",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "fontSize": 16,
      "text": "PROJECTS",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "c6f365ac-de46-4cb8-8f4d-461940242034"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 34,
      "top": 582,
      "width": 500,
      "height": 144.28,
      "fill": "#666",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 0.91,
      "scaleY": 0.91,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "normal",
      "fontSize": 14,
      "text": "• Student Portal - NEEV (PHP | MySQL | Bootstrap | WAMP)\n           Seperate Dashboards with different functionalities\n\n• Library Management System (PHP | MySQL | WAMP)\n            Book issue, Book Return, Stock Management \n\n• Blog Website (React | Bootstrap)\n            Made during BFA",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "85adcaa2-fe80-47d4-9704-3ef7172ffdfc"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 37,
      "top": 765,
      "width": 500,
      "height": 18.08,
      "fill": "#333",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 1,
      "scaleY": 1,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "fontSize": 16,
      "text": "Achievements",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "6b48184e-afe6-4640-bc76-1935c626d6e1"
    },
    {
      "type": "textbox",
      "version": "5.1.0",
      "originX": "left",
      "originY": "top",
      "left": 35,
      "top": 792,
      "width": 500,
      "height": 144.28,
      "fill": "#666",
      "stroke": null,
      "strokeWidth": 1,
      "strokeDashArray": null,
      "strokeLineCap": "butt",
      "strokeDashOffset": 0,
      "strokeLineJoin": "miter",
      "strokeUniform": false,
      "strokeMiterLimit": 4,
      "scaleX": 0.94,
      "scaleY": 0.94,
      "angle": 0,
      "flipX": false,
      "flipY": false,
      "opacity": 1,
      "shadow": null,
      "visible": true,
      "backgroundColor": "",
      "fillRule": "nonzero",
      "paintFirst": "fill",
      "globalCompositeOperation": "source-over",
      "skewX": 0,
      "skewY": 0,
      "fontFamily": "Arial",
      "fontWeight": "normal",
      "fontSize": 14,
      "text": "• Participated in CVMU Gyanotsav (2024)\n\n• 2nd Prize in SEMCOM’s Green Business and Technology Fair (2024) -\n       Zig Zag Zoom Game\n\n• Participated in CVMU Hackathon (2023)\n\n• Participated in Novuskill: AD Making Competition (2024)",
      "underline": false,
      "overline": false,
      "linethrough": false,
      "textAlign": "left",
      "fontStyle": "normal",
      "lineHeight": 1.16,
      "textBackgroundColor": "",
      "charSpacing": 0,
      "styles": {},
      "direction": "ltr",
      "path": null,
      "pathStartOffset": 0,
      "pathSide": "left",
      "pathAlign": "baseline",
      "minWidth": 20,
      "splitByGrapheme": false,
      "id": "d7929805-3579-4a94-9d57-dee1ec5a5d6b"
    }
  ]
}