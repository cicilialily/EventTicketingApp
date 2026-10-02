import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="route-loading">
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (allowedRoles.length > 0) {
    const userRole = user?.role?.toUpperCase();

    const hasPermission = allowedRoles.some(
      (role) => role.toUpperCase() === userRole,
    );

    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
