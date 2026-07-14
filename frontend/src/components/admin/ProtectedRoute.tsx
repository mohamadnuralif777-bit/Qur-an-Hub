import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner className="h-screen" size="lg" />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
