// ResumeEditor.js
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import {
  FaUndo, FaRedo, FaSave, FaGlobe, FaCode, FaExclamationTriangle,
  FaCheck, FaTimes, FaSyncAlt
} from "react-icons/fa";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import ToolSidebar from "./components/ToolSlidebar/ToolSidebar";
import { useAuth } from "../auth/AuthContext";

export default function ResumeEditor({ isNewTemplate = false }) {
  const canvasRef = useRef(null);
  const clipboardRef = useRef(null);
  const hasCreatedTemplateRef = useRef(false);
  const [canvasSelect, setCanvasSelect] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [devMode, setDevMode] = useState(false);
  const [devModeJson, setDevModeJson] = useState("");
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [showJsonValidation, setShowJsonValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [templateData, setTemplateData] = useState({
    id: null,
    title: "Untitled Resume",
    isPublic: false
  });

  const { id: templateId } = useParams();
  const [searchParams] = useSearchParams();
  const { firebaseUser, userDetails, token } = useAuth();
  const navigate = useNavigate();

  // Initialize template JSON structure
  const initialTemplateJson = {
    version: "5.2.4",
    objects: [],
    background: "#ffffff"
  };

  const [templateJson, setTemplateJson] = useState(initialTemplateJson);

  // Utility functions
  const updateTemplateJson = (canvas) => {
    if (!canvas) return;
    const canvasState = canvas.toJSON(["id", "link"]);
    const newTemplateJson = {
      version: canvasState.version || "5.2.4",
      objects: canvasState.objects || [],
      background: canvasState.background || "#ffffff",
    };
    setTemplateJson(newTemplateJson);
  };

  const validateCanvas = () => {
    if (!canvasRef.current) {
      console.error("Canvas is not initialized");
      return false;
    }
    return true;
  };

  const saveState = (selectedObjects = null) => {
    if (selectedObjects) {
      setCanvasSelect(selectedObjects);
    }
    const canvas = canvasRef.current;
    if (canvas) {
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

  const applyAndSave = (obj = null) => {
    const canvas = canvasRef.current;
    if (!validateCanvas()) return;
    if (obj) canvas.setActiveObject(obj);
    canvas.renderAll();
    updateTemplateJson(canvas);
    saveState(obj ? [obj] : null);
  };

  const handleToolAction = useCallback((action, payload) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    const isText = active?.type === "textbox";

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

  // Export canvas as image and upload to imgBB
  const exportAndUploadImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    try {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1
      });

      const formData = new FormData();
      formData.append('image', dataUrl.split(',')[1]);

      const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
        params: {
          key: import.meta.env.VITE_IMGBB_API_KEY
        }
      });

      return response.data.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  // Create new blank template in backend
  const createNewTemplate = async () => {
    try {

      // Get fresh token using Firebase v9+ syntax
      const freshToken = token || (firebaseUser && await firebaseUser.getIdToken());

      if (!freshToken) {
        throw new Error("No authentication token available");
      }

      const payload = {
        title: "Untitled Resume",
        canvasJson: initialTemplateJson,
        thumbnail: "",
        fields: []
      };

      console.log("Sending payload:", payload);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}api/personal-template`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${freshToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Create template error:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to create template",
        severity: "error"
      });
      return null;
    }
  };

  // Save template to backend
  const saveTemplate = async () => {
    if (!userDetails) {
      setSnackbar({ open: true, message: "Please login to save", severity: "error" });
      return;
    }

    const freshToken = token || (firebaseUser && await firebaseUser.getIdToken());

    if (!freshToken) {
      throw new Error("No authentication token available");
    }

    setIsSaving(true);
    try {
      const imageUrl = await exportAndUploadImage();
      const canvas = canvasRef.current;
      const canvasJson = canvas.toJSON(["id", "link"]);

      const payload = {
        title: templateData.title,
        canvasJson,
        thumbnail: imageUrl || ""
      };

      let response;

      if (templateData.id) {
        // Update existing template
        response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}api/personal-template/${templateData.id}`,
          payload,
          { headers: { Authorization: `Bearer ${freshToken}`, 'Content-Type': 'application/json' } }
        );
      } else {
        // Create new template
        response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}api/personal-template`,
          payload,
          { headers: { Authorization: `Bearer ${freshToken}`, 'Content-Type': 'application/json' } }
        );
        setTemplateData(prev => ({ ...prev, id: response.data._id }));
      }

      setSnackbar({ open: true, message: "Saved successfully", severity: "success" });
    } catch (error) {
      console.error("Error saving template:", error);
      setSnackbar({ open: true, message: "Failed to save", severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Publish template to public
  const publishTemplate = async () => {
    if (!userDetails) {
      setSnackbar({ open: true, message: "Please login to publish", severity: "error" });
      return;
    }

    const freshToken = token || (firebaseUser && await firebaseUser.getIdToken());

    if (!freshToken) {
      throw new Error("No authentication token available");
    }

    setIsLoading(true);
    try {
      const imageUrl = await exportAndUploadImage();
      const canvas = canvasRef.current;
      const canvasJson = canvas.toJSON(["id", "link"]);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}api/public-template`,
        {
          title: templateData.title,
          canvasJson,
          thumbnail: imageUrl,
          creatorName: userDetails.name,
          creatorPic: userDetails.photo
        },
        { headers: { Authorization: `Bearer ${freshToken}`, 'Content-Type': 'application/json' } }
      );

      // Delete the private template after publishing
      if (templateData.id) {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}api/personal-template/${templateData.id}`,
          { headers: { Authorization: `Bearer ${freshToken}`, 'Content-Type': 'application/json' } }
        );
      }

      setSnackbar({ open: true, message: "Published successfully", severity: "success" });
      navigate(`/profile/${userDetails.username}`);
    } catch (error) {
      console.error("Error publishing template:", error);
      setSnackbar({ open: true, message: "Failed to publish", severity: "error" });
    } finally {
      setIsLoading(false);
      setShowPublishDialog(false);
    }
  };

  // Initialize template
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (devMode) {
      setDevModeJson(JSON.stringify(templateJson, null, 2));
      setIsJsonValid(true);
      setShowJsonValidation(false);
    }
  }, [devMode]);

  useEffect(() => {
    if (!devMode) return;

    try {
      JSON.parse(devModeJson);
      setIsJsonValid(true);
    } catch (error) {
      setIsJsonValid(false);
    }
  }, [devModeJson, devMode]);

  const applyJsonToCanvas = () => {
    try {
      const parsedJson = JSON.parse(devModeJson);

      // Basic validation
      if (!parsedJson || typeof parsedJson !== 'object') {
        throw new Error("Invalid JSON structure");
      }

      if (!parsedJson.objects || !Array.isArray(parsedJson.objects)) {
        throw new Error("JSON must contain an 'objects' array");
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Clear the canvas
      canvas.clear();

      // Load new JSON
      canvas.loadFromJSON(parsedJson, () => {
        canvas.getObjects().forEach(obj => decorateObject(obj));
        canvas.renderAll();

        // Update states
        updateTemplateJson(canvas);
        saveState();

        // Add to undo stack
        setUndoStack(prev => [...prev, parsedJson]);
        setRedoStack([]);

        setSnackbar({
          open: true,
          message: "JSON applied successfully",
          severity: "success"
        });
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error applying JSON: ${error.message}`,
        severity: "error"
      });
    }
  };

  useEffect(() => {
    const initializeCanvas = async () => {

       if (isNewTemplate && hasCreatedTemplateRef.current) return;


      const canvas = new window.fabric.Canvas(canvasRef.current, {
        height: 1000,
        width: 600,
        backgroundColor: "#fff",
        preserveObjectStacking: true,
        renderOnAddRemove: true,
        stateful: true,
      });

      canvasRef.current = canvas;

      try {
        let templateToLoad = initialTemplateJson;
        let templateInfo = {
          id: null,
          title: "Untitled Resume",
          isPublic: false
        };

        // Handle new template creation
        if (isNewTemplate) {
          hasCreatedTemplateRef.current = true;

          const newTemplate = await createNewTemplate();
          if (newTemplate) {
            templateInfo = {
              id: newTemplate._id,
              title: newTemplate.title,
              isPublic: false
            };
            // Redirect to editor with new template ID
            navigate(`/editor/${newTemplate._id}`, { replace: true });
          }
        }
        // Handle existing template
        else if (templateId) {
          const source = searchParams.get("source");

          if (source === "public") {
            const { data } = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}api/public-template/${templateId}`
            );
            templateToLoad = data?.canvasJson || initialTemplateJson;
            templateInfo = {
              id: data._id,
              title: data.title,
              isPublic: true
            };
          } else {

            const freshToken = token || (firebaseUser && await firebaseUser.getIdToken());

            if (!freshToken) {
              throw new Error("No authentication token available");
            }
            const { data } = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}api/personal-template/${templateId}`,
              { headers: { Authorization: `Bearer ${freshToken}`, 'Content-Type': 'application/json' } }
            );
            templateToLoad = data?.canvasJson || initialTemplateJson;
            templateInfo = {
              id: data._id,
              title: data.title,
              isPublic: false
            };
            // console.log(templateInfo)
          }
        }


        setTemplateData(templateInfo);
        setTemplateJson(templateToLoad);

        // Load the template into canvas
        canvas.loadFromJSON(templateToLoad, () => {
          canvas.getObjects().forEach(obj => decorateObject(obj));
          canvas.renderAll();
          saveState();
        });
      } catch (err) {
        console.error("Error loading template:", err);
        setSnackbar({ open: true, message: "Error loading template", severity: "error" });
      } finally {
        setIsLoading(false);
      }

      // Event handlers
      const handlers = {
        "object:modified": () => { updateTemplateJson(canvas); saveState(); },
        "object:added": () => { updateTemplateJson(canvas); saveState(); },
        "object:removed": () => { updateTemplateJson(canvas); saveState(); },
        "selection:created": (e) => { setCanvasSelect(e?.selected || []); updateTemplateJson(canvas); },
        "selection:updated": (e) => { setCanvasSelect(e?.selected || []); updateTemplateJson(canvas); },
        "selection:cleared": () => { setCanvasSelect([]); updateTemplateJson(canvas); },
      };

      Object.entries(handlers).forEach(([e, fn]) => canvas.on(e, fn));

      return () => {
        Object.entries(handlers).forEach(([e, fn]) => canvas.off(e, fn));
        canvas.dispose();
      };
    };

    initializeCanvas();
  }, [templateId, isNewTemplate, userDetails]);

  return (
    <div className="relative flex flex-col h-screen">
      {/* Main content area */}
      <div className="flex-1">
        <ToolSidebar onToolAction={handleToolAction} isMobile={isMobile} disabled={isLoading || isSaving} />

        <div className="fixed top-20 right-4 z-0 flex gap-2">
          <button onClick={undo} disabled={isLoading || isSaving} className="p-2 bg-white rounded shadow hover:bg-gray-100 transition"><FaUndo /></button>
          <button onClick={redo} disabled={isLoading || isSaving} className="p-2 bg-white rounded shadow hover:bg-gray-100 transition"><FaRedo /></button>
        </div>

        <div className="flex-1 p-4 flex justify-center items-center relative z-0">
          <canvas ref={canvasRef} className="border rounded shadow-lg" />

          {/* Dev Mode Panel */}
          {devMode && (
            <div className={`absolute ${isMobile ? 'bottom-20 left-0 right-0 h-1/3' : 'right-0 top-0 bottom-20 w-1/3'} bg-gray-800 text-white p-4 overflow-auto z-10`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold">Canvas JSON Editor</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDevModeJson(JSON.stringify(templateJson, null, 2))}
                    className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                    title="Reset to current state"
                  >
                    <FaSyncAlt />
                  </button>
                  <button
                    onClick={applyJsonToCanvas}
                    disabled={!isJsonValid}
                    className={`p-1 rounded ${isJsonValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 cursor-not-allowed'}`}
                    title="Apply JSON to canvas"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setDevMode(false)}
                    className="p-1 bg-red-600 rounded hover:bg-red-700"
                    title="Close Dev Mode"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {showJsonValidation && (
                <div className={`mb-2 p-2 text-sm rounded ${isJsonValid ? 'bg-green-900' : 'bg-red-900'}`}>
                  {isJsonValid ? "Valid JSON" : "Invalid JSON - Check syntax"}
                </div>
              )}

              <textarea
                value={devModeJson} cols="45"
                onChange={(e) => setDevModeJson(e.target.value)}
                onFocus={() => setShowJsonValidation(true)}
                onBlur={() => setShowJsonValidation(false)}
                className={`flex-1 font-mono text-xs p-2 rounded bg-gray-900 min-h-screen ${!isJsonValid && showJsonValidation ? 'border border-red-500' : ''}`}
                spellCheck="false"
              />

              <div className="mt-2 text-xs text-gray-400">
                <p>Tip: Edit the JSON above and click the checkmark to apply changes.</p>
                <p>Warning: Invalid JSON may break your layout.</p>
              </div>
            </div>
          )}


          {(isLoading || isSaving) && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
              <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                <CircularProgress color="primary" size={60} />
                <p className="mt-4 text-gray-700">
                  {isNewTemplate ? "Creating new template..." :
                    isSaving ? "Saving your work..." : "Loading template..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 p-2 flex items-center justify-between border-t border-yellow-200 z-30">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-yellow-600 mr-2" />
          <span className="text-yellow-800 text-sm">Save Your Work To Not Lose It</span>
        </div>
        <div className="flex items-center space-x-2">
          {!templateData.isPublic && (
            <button
              onClick={() => setShowPublishDialog(true)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isLoading || isSaving}
            >
              <FaGlobe className="mr-2" /> Publish
            </button>
          )}
          <button
            onClick={saveTemplate}
            disabled={isLoading || isSaving}
            className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? (
              <CircularProgress size={16} color="inherit" className="mr-2" />
            ) : (
              <FaSave className="mr-2" />
            )}
            Save
          </button>
          <button
            onClick={() => setDevMode(!devMode)}
            className={`flex items-center px-3 py-1 rounded ${devMode ? 'bg-gray-800 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            disabled={isLoading || isSaving}
          >
            <FaCode className="mr-2" /> Dev Mode
          </button>
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      <Dialog
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '400px',
            maxWidth: '90vw',
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          fontWeight: '600'
        }}>
          Publish Template
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <p className="mb-4" style={{ fontSize: '1rem' }}>
            Are you sure you want to make this template public?
          </p>
          <p className="text-sm text-gray-600">
            Once published, this template will be visible to all users and you won't be able to make it private again.
          </p>
        </DialogContent>
        <DialogActions sx={{
          padding: '16px 24px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button
            onClick={() => setShowPublishDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={publishTemplate}
            color="primary"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{ textTransform: 'none' }}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className="bottom-25"
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </div>
  );
}