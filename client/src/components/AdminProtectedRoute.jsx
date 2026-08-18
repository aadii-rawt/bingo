import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";

const AdminProtectedRoute = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Logged in but not admin
  if (user.role !== "ADMIN") {
    if (user.role === "CUSTOMER") {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }

    if (user.role === "VENDOR") {
      return (
        <Navigate
          to="/vendor/dashboard"
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
  }

  return <Outlet />;
};

export default AdminProtectedRoute;