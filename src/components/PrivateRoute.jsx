import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import LoadingSpinner from "./ui/LoadingSpinner";

export default function PrivateRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useUser();
  const location = useLocation();

  if (loading) return <LoadingSpinner size="lg" text="Checking auth..." />;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
}
