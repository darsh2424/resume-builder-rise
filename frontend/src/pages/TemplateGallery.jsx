import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

export default function TemplateGallery() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postingId, setPostingId] = useState(null);

  const navigate = useNavigate();
  const { firebaseUser,token } = useAuth();

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}api/public-template`);
        if (Array.isArray(res.data)) {
          setTemplates(res.data);
        } else {
          setError("Unexpected response format.");
        }
      } catch (err) {
        const msg = err.response?.data?.msg || "Failed to load templates. Please try again later.";
        setError("Server says: " + msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);


  const handleUseTemplate = async (template) => {
    if (!firebaseUser) return;
    setPostingId(template._id);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}api/personal-template`, {
        publicTemplateId: template._id,
        canvasJson: template.canvasJson,
        title: template.title,
        fields: template.fields,
      });

      navigate(`/editor/${res.data._id}`);
    } catch (err) {
      console.error("Failed to create personal template:", err);
      alert("Something went wrong while creating your resume. Try again.");
    } finally {
      setPostingId(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading templates...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!templates.length) {
    return <div className="p-6 text-center text-gray-600">No templates available right now.</div>;
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((t) => {
        const avgRating = Array.isArray(t.ratings) && t.ratings.length
          ? (t.ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / t.ratings.length).toFixed(1)
          : "No ratings";

        return (
          <div key={t._id} className="border p-4 rounded shadow">
            <img
              src={t.thumbnail || "/fallback-thumbnail.png"}
              alt={t.title || "Template"}
              className="h-40 w-full object-cover mb-2 rounded"
              loading="lazy"
            />
            <h3 className="font-semibold text-lg">{t.title || "Untitled"}</h3>
            <p className="text-sm text-gray-600">By: {t.creatorName || "Unknown"}</p>
            <p className="text-sm">Rating: {avgRating} {t.ratings?.length ? `(${t.ratings.length})` : ""}</p>
            <button
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
              onClick={() => handleUseTemplate(t)}
              disabled={!firebaseUser || postingId === t._id}
            >
              {firebaseUser
                ? postingId === t._id ? "Creating..." : "Use Template"
                : "Sign in to Use"}
            </button>
          </div>
        );
      })}
    </div>
  );
}