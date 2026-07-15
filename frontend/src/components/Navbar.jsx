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
    <nav className="bg-slate-900/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent tracking-tight">
        SubTrackt
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400 hidden sm:block">Hi, <span className="text-slate-200 font-medium">{user?.name}</span></span>
        <Link
          to="/subscriptions/new"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25"
        >
          + Add
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
