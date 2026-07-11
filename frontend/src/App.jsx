import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddSubscription from "./pages/AddSubscription";
import EditSubscription from "./pages/EditSubscription";
import ViewSubscription from "./pages/ViewSubscription";

const Protected = ({ children }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/subscriptions/new" element={<Protected><AddSubscription /></Protected>} />
          <Route path="/subscriptions/:id" element={<Protected><ViewSubscription /></Protected>} />
          <Route path="/subscriptions/:id/edit" element={<Protected><EditSubscription /></Protected>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
