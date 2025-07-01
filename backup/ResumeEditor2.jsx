import { useEffect, useRef, useState } from "react";
import ToolSidebar from "./components/ToolSlidebar/ToolSidebar";
import { FaUndo, FaRedo } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid"; // Install this using: npm i uuid

export default function ResumeEditor() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const clipboardRef = useRef(null);
  const templateJsonRef = useRef({
    version: "5.2.4",
    objects: [
      {
        "type": "rect",
        "left": 0,
        "top": 0,
        "width": 200,
        "height": 1000,
        "fill": "#1c2b38"
      },
      {
        "type": "textbox",
        "left": 20,
        "top": 180,
        "width": 120,
        "fontSize": 14,
        "fill": "#fff",
        "fontWeight": "bold",
        "text": "CONTACT"
      },
      {
        "type": "textbox",
        "left": 20,
        "top": 200,
        "width": 120,
        "fontSize": 11,
        "fill": "#fff",
        "text": "iamdarsh2424@gmail.com\nKailol, Panchmahal - 389350\nlinkedin.com/in/darshparikh11/"
      },
      {
        "type": "textbox",
        "left": 20,
        "top": 270,
        "width": 120,
        "fontSize": 14,
        "fontWeight": "bold",
        "fill": "#fff",
        "text": "EDUCATION"
      },
      {
        "type": "textbox",
        "left": 20,
        "top": 290,
        "width": 120,
        "fontSize": 11,
        "fill": "#fff",
        "text": "Masters Degree in Computer Application\nGLS University – Ahmedabad\n2024 – Present\nCGPA: 8.17\n\nBachelor’s Degree in Computer Application\nSEMCOM College, The CVM University – Anand\n2021 – 2024\nCGPA : 9.84\n\nSchool Education –\nClass XII with 80% in 2021,\nFrom Shree Narayan Vidyalaya, Harni-Vadodara\n\nClass X with 82% in 2019,\nShantiniketan Rotary Vidyalaya, Kailol-Panchmahal"
      },
      {
        "type": "textbox",
        "left": 20,
        "top": 550,
        "width": 120,
        "fontSize": 14,
        "fontWeight": "bold",
        "fill": "#fff",
        "text": "SKILLS"
      },
      {
        "type": "textbox",
        "left": 20,
        "top": 570,
        "width": 120,
        "fontSize": 11,
        "fill": "#fff",
        "text": "• Web Development Expertise:\n  PHP, ASP.NET with C#, HTML,CSS Mastery\n• Web application Frameworks (i.e. React etc.)\n• Responsive Design Knowledge\n• Software Development Experience\n• Effective Team Player"
      },
      {
        "type": "textbox",
        "left": 180,
        "top": 30,
        "width": 400,
        "fontSize": 28,
        "fontWeight": "bold",
        "fill": "#000",
        "text": "DARSH"
      },
      {
        "type": "textbox",
        "left": 270,
        "top": 30,
        "width": 300,
        "fontSize": 28,
        "fontWeight": "normal",
        "fill": "#555",
        "text": "PARIKH"
      },
      {
        "type": "textbox",
        "left": 180,
        "top": 70,
        "width": 400,
        "fontSize": 16,
        "fontWeight": "bold",
        "fill": "#006699",
        "text": "WORK EXPERIENCE"
      },
      {
        "type": "textbox",
        "left": 180,
        "top": 100,
        "width": 360,
        "fontSize": 12,
        "fill": "#000",
        "text": "➤ Maxgen Technologies Pvt.Ltd - Internship (OCT 2024 - FEB 2025)\nReact Developer (Learning Program + Internship)\n  • 6-month program:\n    ○ 4 months of web development training (HTML, CSS, JS, React)\n    ○ 2 months Internship.\n  • Enhanced knowledge of modern front-end development trends and best practices.\n\n➤ SEMCOM IT Internship - Live Project (MAY 2024 - JULY 2024)\nBackend Developer Intern - Hybrid\n  • NEEV - College Student Portal Project:\n    ○ Deepen my skills in PHP and database management.\n    ○ PDF and Excel report generation, Attendance tracking via Excel uploads,\n       Personalized dashboards for students, staff, and admins.\n\n➤ Web Developer - Remote Project Internships (JUL 2024 – Aug 2024)\nSkillCraft Technology Internship + Coding Samurai Internship\n  • During this two-month journey, I worked on several projects using ReactJs\n    ○ Responsive Landing Page, To Do List Web App, Tic-Tac-Toe Web App, Stop-Watch Web App"
      },
      {
        "type": "textbox",
        "left": 180,
        "top": 460,
        "width": 400,
        "fontSize": 16,
        "fontWeight": "bold",
        "fill": "#006699",
        "text": "CERTIFICATIONS"
      },
      {
        "type": "textbox",
        "left": 180,
        "top": 485,
        "width": 360,
        "fontSize": 12,
        "fill": "#000",
        "text": "• Building Web Applications in PHP - University of Michigan\n• SQL for Data Science - University of California, Davis\n• Introduction to Front-End Development - Coursera (Meta)\n• Responsive Web Design - Coursera - University of London"
      },
      {
        "type": "textbox",
        "left": 180,
        "top": 550,
        "width": 400,
        "fontSize": 16,
        "fontWeight": "bold",
        "fill": "#006699",
        "text": "PROJECTS"
      },
      {
        "type": "textbox",
        "left": 180,
        "top": 575,
        "width": 360,
        "fontSize": 12,
        "fill": "#000",
        "text": "• Student Portal - NEEV (PHP | MySQL | Bootstrap | WAMP)\n• Library Management System (PHP | MySQL | WAMP)\n• Blog Website (React | Bootstrap)\n• Electronic-Gadgets Marketplace System (.NET | SQL Server)"
      },
      {
        "type": "textbox",
        "left": 180,
        "top": 635,
        "width": 400,
        "fontSize": 16,
        "fontWeight": "bold",
        "fill": "#006699",
        "text": "OTHER ACHIEVEMENTS"
      },
      {
        "type": "textbox",
        "left": 180,
        "top": 660,
        "width": 360,
        "fontSize": 12,
        "fill": "#000",
        "text": "• Participated in CVMU Gyanotsav (2024)\n• 2nd Prize in SEMCOM’s Green Business and Technology Fair (2024) - Zig Zag Zoom Game\n• Participated in CVMU Hackathon (2023)\n• Participated in Novuskill: AD Making Competition (2024)"
      }
    ]
  });

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const saveState = () => {
    if (canvas) {
      const snapshot = canvas.toJSON(["id", "link"]);
      setUndoStack(prev => [...prev, snapshot]);
      setRedoStack([]);
    }
  };

  const undo = () => {
    if (!undoStack.length) return;
    const past = [...undoStack];
    const last = past.pop();
    setUndoStack(past);
    setRedoStack(r => [...r, canvas.toJSON(["id", "link"])]);
    canvas.loadFromJSON(last, () => {
      canvas.renderAll();
      updateTemplateJson(canvas);
      saveState();
    });
  };

  const redo = () => {
    if (!redoStack.length) return;
    const future = [...redoStack];
    const next = future.pop();
    setRedoStack(future);
    setUndoStack(prev => [...prev, canvas.toJSON(["id", "link"])]);
    canvas.loadFromJSON(next, () => {
      canvas.renderAll();
      updateTemplateJson(canvas);
      saveState();
    });
  };


  const handleToolAction = (action, payload) => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    const isText = active && active.type === "textbox";

    switch (action) {
      case "bold":
      case "italic":
      case "underline":
        if (!isText) return alert("Select a text box");
        if (action === "bold")
          active.set("fontWeight", active.fontWeight === "bold" ? "normal" : "bold");
        if (action === "italic")
          active.set("fontStyle", active.fontStyle === "italic" ? "normal" : "italic");
        if (action === "underline")
          active.set("underline", !active.underline);
        break;

      case "fontSize":
      case "fontFamily":
      case "fill":
        if (!isText) return alert("Select a text box");
        active.set(action, payload);
        break;

      case "textAlign":
        if (!isText) return alert("Select a text box");
        active.set("textAlign", payload);
        break;

      case "addBullets":
        if (!isText) return alert("Select a text box");
        const lines = active.text.split("\n").map(line => line.startsWith("•") ? line : `• ${line}`);
        active.set("text", lines.join("\n"));
        break;

      case "addText": {
        const t = new window.fabric.Textbox("New Text", {
          left: 100, top: 100, width: 200, fontSize: 16, fill: "#000", link: "", id: uuidv4()
        });
        canvas.add(t).setActiveObject(t);
        break;
      }

      case "addRect": {
        const r = new window.fabric.Rect({
          left: 100, top: 100, width: 120, height: 60, fill: "#e0e0e0", id: uuidv4()
        });
        canvas.add(r);
        break;
      }

      case "addCircle": {
        const c = new window.fabric.Circle({
          left: 120, top: 120, radius: 30, fill: "#aaccee", id: uuidv4()
        });
        canvas.add(c);
        break;
      }

      case "addLine": {
        const l = new window.fabric.Line([60, 100, 300, 100], {
          stroke: "#333", strokeWidth: 2, id: uuidv4()
        });
        canvas.add(l);
        break;
      }

      case "shapeFill":
        if (!active || active.type === "textbox") return alert("Select a shape");
        active.set("fill", payload);
        break;

      case "deleteObject":
        if (active) canvas.remove(active);
        break;

      case "bringForward":
        if (active) canvas.bringForward(active);
        break;

      case "sendBackward":
        if (active) canvas.sendBackwards(active);
        break;

      case "addImage":
        window.fabric.Image.fromURL(payload, img => {
          img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5, id: uuidv4() });
          canvas.add(img);
        });
        return; // async, don't save state immediately

      case "clear":
        canvas.clear();
        break;

      case "copy":
        if (active) {
          active.clone(clone => {
            clone.set("id", active.id || uuidv4()); // ensure custom id
            clipboardRef.current = clone;
          });
        }
        return;

      case "cut":
        if (active) {
          active.clone(clone => {
            clone.set("id", active.id || uuidv4());
            clipboardRef.current = clone;
            canvas.remove(active);
          });
        }
        break;

      case "paste":
        if (clipboardRef.current) {
          clipboardRef.current.clone(clone => {
            clone.set({ left: 120, top: 120, id: uuidv4() });
            canvas.add(clone);
            canvas.setActiveObject(clone);
            canvas.renderAll();
          });
        }
        return;

      case "undo": undo(); return;
      case "redo": redo(); return;

      default: return;
    }

    canvas.renderAll();
    updateTemplateJson(canvas);
    saveState();
  };


  useEffect(() => {
    const c = new window.fabric.Canvas(canvasRef.current, {
      height: 1000,
      width: 600,
      backgroundColor: "#fff",
      preserveObjectStacking: true
    });

    c.loadFromJSON(templateJsonRef.current, () => {
      c.getObjects().forEach(obj => {
        obj.set({
          id: obj.id || uuidv4(),
          selectable: true,
          hasControls: true,
          lockScalingFlip: true,
          cornerStyle: "circle",
          cornerColor: "#4285f4",
          borderColor: "#4285f4"
        });
      });
      c.renderAll();
      c.setActiveObject(c.getObjects()[0]);
      setCanvas(c);
      saveState();
    });


    const syncToJson = () => updateTemplateJson(c);
    c.on("object:modified", syncToJson);
    c.on("object:added", syncToJson);
    c.on("object:removed", syncToJson);



    c.on("selection:created", e => {
      const objects = e.selected;
      console.log("Selection created:", objects);
      updateTemplateJson(c);
      saveState();
    });

    c.on("selection:updated", e => {
      const objects = e.selected;
      console.log("Selection updated:", objects);
      updateTemplateJson(c);
      saveState();
    });

    c.on("object:moving", () => {
      updateTemplateJson(c);
      saveState();
    });

    c.on("text:changed", () => {
      updateTemplateJson(c);
      saveState();
    });
  }, []);

  return (
    <div className="relative flex">
      <ToolSidebar onToolAction={handleToolAction} isMobile={isMobile} />
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => handleToolAction("undo")} className="p-2 bg-white rounded shadow hover:bg-gray-100 transition">
          <FaUndo />
        </button>
        <button onClick={() => handleToolAction("redo")} className="p-2 bg-white rounded shadow hover:bg-gray-100 transition">
          <FaRedo />
        </button>
      </div>
      <div className="flex-1 p-4 flex justify-center">
        <canvas ref={canvasRef} className="border rounded shadow-lg" tabIndex={0} />
      </div>
      <button
        onClick={() => {
          if (!templateJsonRef) return;
          const liveJson = JSON.stringify(templateJsonRef.current, null, 2);
          navigator.clipboard.writeText(liveJson);
          alert("Live Resume JSON copied to clipboard!");
        }}
        className="absolute top-2 right-45 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 transition"
      >
        📋 Copy JSON
      </button>
    </div>
  );
}
const updateTemplateJson = (canvasInstance) => {
  templateJsonRef.current = {
    version: "5.2.4",
    objects: canvasInstance.getObjects().map(obj => obj.toObject(["id", "link"]))
  };
};



