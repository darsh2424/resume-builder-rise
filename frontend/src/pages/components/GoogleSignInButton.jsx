import { useAuth } from "../../auth/AuthContext";

export default function GoogleSignInButton() {
  const { firebaseUser, login, logout } = useAuth();

  return (
    <div>
      {!firebaseUser ? (
        <button onClick={login} className="bg-blue-500 text-white px-4 py-2 rounded">Sign in with Google</button>
        
      ) : (
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      )}
    </div>
  );
}
