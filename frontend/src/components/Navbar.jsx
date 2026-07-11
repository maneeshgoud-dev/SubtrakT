import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/sign-out");
    } catch (_) {
      // sign-out best-effort
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <Link to="/dashboard" className="text-lg font-bold text-indigo-600">
        SubTracker
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Hi, {user?.name}</span>
        <Link
          to="/subscriptions/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
