import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const user = {
    name: "John Vendor",
    role: "Vendor",
  };

  const links = [
    {
      label: "Dashboard",
      path: "/vendor/dashboard",
      icon: "dashboard",
    },
    {
      label: "Services",
      path: "/vendor/services",
      icon: "services",
    },
    {
      label: "Offerings",
      path: "/vendor/offerings",
      icon: "offerings",
    },
    {
      label: "Availability",
      path: "/vendor/availability",
      icon: "availability",
    },
    {
      label: "Bookings",
      path: "/vendor/bookings",
      icon: "bookings",
    },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black dark:bg-[#181818] dark:text-white">
      <Sidebar
        title="Vendor Panel"
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

export default VendorLayout;