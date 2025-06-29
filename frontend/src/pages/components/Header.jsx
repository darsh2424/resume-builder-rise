import React from "react";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-14 bg-white shadow-md z-50 flex items-center justify-between px-6">
      <Link to="/" className="text-xl font-bold text-blue-600">
        ResumeBanao
      </Link>
      <div className="p-4">
        <Link to="/" className="text-xl font-bold text-blue-600">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Publish Template</button>
        </Link>
        <GoogleSignInButton />
      </div>
    </header>
  );
};

export default Header;
