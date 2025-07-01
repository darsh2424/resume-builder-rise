import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TemplateGallery from "./pages/TemplateGallery";
import ResumeEditor from "./pages/ResumeEditor";
import ProfilePage from "./pages/Profile/ProfilePage";
import Header from "./pages/components/Header";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <div className="pt-14">
          <Routes>
            <Route path="/" element={<TemplateGallery />} />
            <Route path="/editor/:id" element={
              <ProtectedRoute>
                <ResumeEditor />
              </ProtectedRoute>
            } />
            <Route path="/editor/new" element={
              <ProtectedRoute>
                <ResumeEditor isNewTemplate={true} />
              </ProtectedRoute>
            } />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
