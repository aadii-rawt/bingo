import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const user = {
    name: "John Customer",
    role: "Customer",
  };

  const links = [
    {
      label: "Dashboard",
      path: "/user/dashboard",
      icon: "dashboard",
    },
    {
      label: "My Bookings",
      path: "/user/bookings",
      icon: "bookings",
    },
    {
      label: "Payments",
      path: "/user/payments",
      icon: "payments",
    },
    {
      label: "Profile",
      path: "/user/profile",
      icon: "profile",
    },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black dark:bg-[#181818] dark:text-white">
      <Sidebar
        title="Customer"
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

export default UserLayout;