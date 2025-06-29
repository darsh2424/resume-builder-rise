import { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "./firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";
import axios from "axios";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    setFirebaseUser(user);

    // Send to backend
    const response = await axios.post("http://localhost:5000/api/auth/google-login", {
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
    });

    setUserDetails(response.data);
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setUserDetails(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        setFirebaseUser(null);
        setUserDetails(null);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, userDetails, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
