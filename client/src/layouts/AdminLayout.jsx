import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const user = {
    name: "Admin",
    role: "Admin",
  };

  const links = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "dashboard",
    },
    {
      label: "Vendors Pending",
      path: "/admin/vendors",
      icon: "vendors",
    },
    {
      label: "Vendors ",
      path: "/admin/vendors/approved",
      icon: "vendors",
    },
    {
      label: "Services",
      path: "/admin/services",
      icon: "services",
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: "categories",
    },
    {
      label: "Bookings",
      path: "/admin/bookings",
      icon: "bookings",
    },
  ];

  const handleLogout = () => {
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black dark:bg-[#181818] dark:text-white">
      <Sidebar
        title="Admin Panel"
        links={links}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="p-5 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;