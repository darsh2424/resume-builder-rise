import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TemplateGallery from "./pages/TemplateGallery";
import ResumeEditor from "./pages/ResumeEditor";
import { AuthProvider } from "./auth/AuthContext";
import Header from "./pages/components/Header";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <div className="pt-14">
          <Routes>
            <Route path="/" element={<TemplateGallery />} />
            <Route path="/editor/:id" element={<ResumeEditor />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
