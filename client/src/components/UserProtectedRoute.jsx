import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const UserProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  // Still checking refresh token
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
      </div>
    );
  }

  // No valid session
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // User can access this route
  if (user.role === "CUSTOMER") {
    return children;
  }

  // Vendor
  if (user.role === "VENDOR") {
    return (
      <Navigate
        to="/vendor/dashboard"
        replace
      />
    );
  }

  // Admin
  if (user.role === "ADMIN") {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/login"
      replace
    />
  );
};

export default UserProtectedRoute;