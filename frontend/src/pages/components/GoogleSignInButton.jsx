import { useAuth } from "../../auth/AuthContext";
import { Link } from "react-router-dom";

export default function GoogleSignInButton() {
  const { firebaseUser, userDetails, login, logout } = useAuth();

  return (
    <div>
      {!firebaseUser ? (
        <button onClick={login} className="bg-blue-500 text-white px-4 py-2 rounded">Sign in with Google</button>

      ) : (
        <div className="flex px-5">
          {userDetails?.username && (
            <Link to={`/profile/${userDetails.username}`} className="px-5">
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                My Profile
              </button>
            </Link>
          )}
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
      )}
    </div>
  );
}
