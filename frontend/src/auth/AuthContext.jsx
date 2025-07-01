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
  const [token, setToken] = useState(null);

  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    setFirebaseUser(user);

    // Get Firebase ID token
    const idToken = await user.getIdToken();
    setToken(idToken);

    // Send user info to backend
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}api/auth/google-login`, {
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
    }, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      }
    });

    setUserDetails(response.data);
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setUserDetails(null);
    setToken(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setFirebaseUser(null);
        setUserDetails(null);
        setToken(null);
        return;
      }

      setFirebaseUser(user);

      // Refresh token
      const idToken = await user.getIdToken();
      setToken(idToken);

      // Optional: Re-fetch userDetails from backend
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}api/auth/google-login`, {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
        }, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          }
        });

        setUserDetails(response.data);
      } catch (err) {
        console.error("Auto-login failed", err);
        setFirebaseUser(null);
        setUserDetails(null);
        setToken(null);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, userDetails, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
