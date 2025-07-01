import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlus
} from "react-icons/fa";
const ProfilePage = () => {
  const { username: routeUsername } = useParams();
  const { firebaseUser, userDetails, token } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [publicTemplates, setPublicTemplates] = useState([]);
  const [privateTemplates, setPrivateTemplates] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("public");
  const { username } = useParams();
  const navigate = useNavigate();

  const isOwner = routeUsername === userDetails?.username;

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}api/auth/username/${routeUsername}`);
        if (!res.data) {
          setNotFound(true);
          return;
        }

        setProfileUser(res.data);

        const pub = await axios.get(`${import.meta.env.VITE_API_BASE_URL}api/public-template`);
        const userPublicTemplates = pub.data?.filter(t => t.creatorId === res.data._id) || [];
        setPublicTemplates(userPublicTemplates);

        if (isOwner) {
          try {
            const freshToken = token || (firebaseUser && await firebaseUser.getIdToken());

            if (!freshToken) {
              throw new Error("No authentication token available");
            }
            const priv = await axios.get(`${import.meta.env.VITE_API_BASE_URL}api/personal-template`, {
              headers: { Authorization: `Bearer ${freshToken}` },
            });
            setPrivateTemplates(priv.data || []);
          } catch {
            setPrivateTemplates([]);
          }
        }
      } catch {
        setNotFound(true);
      }
    }

    fetchProfile();
  }, [routeUsername]);

  if (notFound) {
    return (
      <div className="text-center mt-20">
        <p className="text-xl font-semibold">Username Not Found</p>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => navigate("/")}>
          Go Back To Home
        </button>
      </div>
    );
  }

  const templatesToShow = activeTab === "public" ? publicTemplates : privateTemplates;

  return (
    <div className="p-6">
      {/* Profile Info */}
      <div className="flex gap-6 items-center mb-2">
        <img src={profileUser?.photo} className="w-24 h-24 rounded-full object-cover" />
        <div>
          <p className="text-xl font-bold">{profileUser?.name}</p>
          <p className="text-gray-600">@{profileUser?.username}</p>
          <p className="text-sm text-gray-500">{profileUser?.email}</p>
          {isOwner && (
            <button
              onClick={() => navigate("/editor/new")}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded flex items-center"
            >
              <FaPlus className="mr-2" />
              Create New Template
            </button>
          )}
        </div>
      </div>

      {/* Toggle Tabs */}
      {isOwner && (
        <div className="flex gap-4 mt-10 mb-6 border-b pb-2">
          <button
            onClick={() => setActiveTab("public")}
            className={`font-semibold ${activeTab === "public" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          >
            My Published Templates
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={`font-semibold ${activeTab === "private" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          >
            My Private Templates
          </button>
        </div>
      )}

      {/* Templates */}
      <div className="grid grid-cols-3 gap-4">
        {templatesToShow.length === 0 ? (
          <p className="text-gray-600 col-span-3 text-center py-6">No Templates Found.</p>
        ) : (
          templatesToShow.map(t => (
            <div key={t._id} className="border p-4 rounded shadow">
              {t.thumbnail && <img src={t.thumbnail} alt={t.title} className="h-40 w-full object-cover mb-2" />}
              <h3 className="font-semibold">{t.title}</h3>
              <button
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                onClick={() => navigate(`/editor/${t._id}`)}
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
