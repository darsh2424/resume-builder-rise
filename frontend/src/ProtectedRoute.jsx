import { Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { firebaseUser } = useAuth();
  return firebaseUser ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
