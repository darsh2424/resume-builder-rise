import { useEffect, useRef, useState } from "react";
import ToolSidebar from "./components/ToolSlidebar/ToolSidebar";

export default function ResumeEditor() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const handleResize = () => setIsMobile(window.innerWidth < 768);
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const saveState = () => {
    if (canvas) {
      const json = canvas.toJSON(["link"]);
      setUndoStack(prev => [...prev, json]);
      setRedoStack([]);
    }
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = [...undoStack];
    const last = prev.pop();
    setUndoStack(prev);
    setRedoStack(r => [...r, canvas.toJSON(["link"])]);
    canvas.loadFromJSON(last, () => canvas.renderAll());
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = [...redoStack];
    const redoState = next.pop();
    setRedoStack(next);
    setUndoStack(prev => [...prev, canvas.toJSON(["link"])]);
    canvas.loadFromJSON(redoState, () => canvas.renderAll());
  };

  useEffect(() => {
    const keyHandler = (e) => {
      if (!canvas) return;
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [canvas, undoStack, redoStack]);

  const handleToolAction = (action, payload) => {
    if (!canvas) return;
    const getActiveTextbox = () => {
      const obj = canvas.getActiveObject();
      if (!obj || obj.type !== "textbox") {
        alert("Select a text box first.");
        return null;
      }
      return obj;
    };

    saveState();

    switch (action) {
      case "bold":
      case "italic":
      case "underline":
      case "fontSize":
      case "fill":
      case "fontFamily": {
        const active = getActiveTextbox();
        if (!active) return;
        active.set(
          action === "fontSize" ? "fontSize" :
            action === "fill" ? "fill" :
              action === "fontFamily" ? "fontFamily" :
                action,
          payload
        );
        canvas.renderAll();
        break;
      }
      case "addLink": {
        const active = getActiveTextbox();
        if (!active) return;
        const url = prompt("Enter URL:");
        if (!url || !url.trim()) return alert("Invalid URL");
        active.set("link", url.trim());
        canvas.renderAll();
        break;
      }
      case "removeLink": {
        const active = getActiveTextbox();
        if (!active) return;
        active.set("link", "");
        canvas.renderAll();
        break;
      }
      case "addText": {
        const t = new window.fabric.Textbox("New Text", {
          left: 100,
          top: 100,
          width: 200,
          fontSize: 16,
          fill: "#000",
          link: ""
        });
        canvas.add(t).setActiveObject(t);
        break;
      }
      case "addRect":
      case "addCircle":
      case "addLine":
      case "addImage":
      case "delete":
      case "bringForward":
      case "sendBackward":
      case "clear": {
        if (action === "addRect") {
          const rect = new window.fabric.Rect({ left: 100, top: 100, width: 120, height: 60, fill: "#e0e0e0" });
          canvas.add(rect);
        }
        if (action === "addCircle") {
          const circle = new window.fabric.Circle({ left: 120, top: 120, radius: 30, fill: "#aaccee" });
          canvas.add(circle);
        }
        if (action === "addLine") {
          const line = new window.fabric.Line([60, 100, 300, 100], { stroke: "#333", strokeWidth: 2 });
          canvas.add(line);
        }
        if (action === "addImage") {
          window.fabric.Image.fromURL(payload, img => {
            img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
            canvas.add(img);
          });
        }
        if (action === "delete") {
          const o = canvas.getActiveObject();
          if (o) canvas.remove(o);
        }
        if (action === "bringForward") canvas.bringForward(canvas.getActiveObject());
        if (action === "sendBackward") canvas.sendBackwards(canvas.getActiveObject());
        if (action === "clear") canvas.clear();
        break;
      }
      case "undo":
        undo();
        break;
      case "redo":
        redo();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const c = new window.fabric.Canvas(canvasRef.current, {
      height: 1000,
      width: 600,
      backgroundColor: "#fff",
      preserveObjectStacking: true,
    });
    c.loadFromJSON(templateJson, () => {
      c.renderAll();
      c.setActiveObject(c.getObjects()[0]);
    });
    setCanvas(c);
    saveState();
    return () => c.dispose();
  }, []);

  return (
    <div className="relative flex">
      <ToolSidebar onToolAction={handleToolAction} isMobile={isMobile} />
      <div className="flex-1 p-4 flex justify-center">
        <canvas ref={canvasRef} className="border rounded shadow-lg" />
      </div>
    </div>
  );
}

const templateJson = {
  version: "5.2.4",
  objects: [
    {
      type: "textbox",
      text: "ESTELLE DARCY",
      top: 40,
      left: 100,
      width: 400,
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      fill: "#000"
    },
    {
      type: "textbox",
      text: "UX DESIGNER",
      top: 80,
      left: 100,
      width: 400,
      fontSize: 20,
      textAlign: "center",
      fill: "#444"
    },
    {
      type: "textbox",
      text: "123 Anywhere St., Any City | hello@reallygreatsite.com | www.reallygreatsite.com",
      top: 110,
      left: 50,
      width: 500,
      fontSize: 13,
      textAlign: "center",
      fill: "#333"
    },
    {
      type: "textbox",
      text: "UX Designer with a focus on delivering impactful results, eager to tackle dynamic challenges and apply creativity to craft intuitive user experiences...",
      top: 140,
      left: 50,
      width: 500,
      fontSize: 13,
      fill: "#333"
    },
    {
      type: "textbox",
      text: "AREA OF EXPERTISE",
      top: 200,
      left: 50,
      width: 500,
      fontWeight: "bold",
      fontSize: 14,
      fill: "#000"
    },
    {
      type: "textbox",
      text: "Prototyping Tools  |  Interaction Design  |  Accessibility\nUser Research  |  Visual Design  |  Responsive Design",
      top: 220,
      left: 50,
      width: 500,
      fontSize: 13,
      fill: "#333"
    },
    {
      type: "textbox",
      text: "KEY ACHIEVEMENTS",
      top: 275,
      left: 50,
      width: 500,
      fontWeight: "bold",
      fontSize: 14,
      fill: "#000"
    },
    {
      type: "textbox",
      text:
        "• Market Expansion. Identified untapped markets and launched a system to harness the lime market,  resulting in a revenue increase of $1.2 Million for Morcelle in 6 months.\n\n" +
        "• Revenue Growth. Successful implementation of a new pricing strategy at XarrowAI increasing deal size  by 15% and market cap by $500,000.",
      top: 300,
      left: 50,
      width: 500,
      fontSize: 13,
      fill: "#333"
    },
    {
      type: "textbox",
      text: "PROFESSIONAL EXPERIENCE",
      top: 405,
      left: 50,
      width: 500,
      fontWeight: "bold",
      fontSize: 14,
      fill: "#000"
    },
    {
      type: "textbox",
      text:
        "Instant Chartz App, Morcelle Program                   Jan 2023 – Present\n" +
        "• Led development of an advanced automation system, achieving a 15% increase in efficiency.\n" +
        "• Streamlined manufacturing processes, reducing production costs by 10%.\n" +
        "• Preventive maintenance strategies → 20% decrease in equipment downtime.\n\n" +
        "System UX Engineer, XarrowAI Industries               Feb 2021 – Dec 2022\n" +
        "• Designed robotic control system, improving performance by 12%.\n" +
        "• Coordinated testing & validation, ensuring compliance with standards.\n" +
        "• Provided technical expertise, contributing to 15% reduction in failures.",
      top: 430,
      left: 50,
      width: 500,
      fontSize: 13,
      fill: "#333"
    },
    {
      type: "textbox",
      text: "EDUCATION",
      top: 610,
      left: 50,
      fontWeight: "bold",
      fontSize: 14,
      fill: "#000"
    },
    {
      type: "textbox",
      text:
        "UX Industrial Basics and General Application         Aug 2016 – Oct 2019\n" +
        "University of Engineering UX Cohort\n" +
        "• Major in Automotive Technology\n" +
        "• Thesis on “Technological Advancements within Mechatronics”\n\n" +
        "Bachelor of Design in Process Engineering              May 2014 – May 2016\n" +
        "Engineering University\n" +
        "• Coursework in Structural Design and Project Management",
      top: 630,
      left: 50,
      width: 500,
      fontSize: 13,
      fill: "#333"
    },
    {
      type: "textbox",
      text: "ADDITIONAL INFORMATION",
      top: 810,
      left: 50,
      width: 500,
      fontWeight: "bold",
      fontSize: 14,
      fill: "#000"
    },
    {
      type: "textbox",
      text:
        "• Languages: English, French, Mandarin\n" +
        "• Certifications: PDE License, PMT Certificate\n" +
        "• Awards/Activities: Most Innovative Employer (2021), Best Division (2024), Onboarding Project Lead (2023)",
      top: 835,
      left: 50,
      width: 500,
      fontSize: 13,
      fill: "#333"
    }
  ]
};
