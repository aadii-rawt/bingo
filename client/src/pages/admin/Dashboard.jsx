import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  IndianRupee,
  CreditCard,
  Loader2,
} from "lucide-react";

import api from "../../lib/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    pendingVendors: 0,
    bookingsToday: 0,
    revenueCollected: 0,
    paymentsFailed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/dashboard"
      );

      setStats(
        response?.data?.data || {}
      );
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Pending Vendors",
      value: stats.pendingVendors,
      icon: Users,
      description:
        "Vendor applications waiting for approval",
    },
    {
      title: "Bookings Today",
      value: stats.bookingsToday,
      icon: CalendarDays,
      description:
        "Bookings scheduled for today",
    },
    {
      title: "Revenue Collected",
      value: `₹${Number(
        stats.revenueCollected || 0
      ).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      description:
        "Total collected from completed payments",
    },
    {
      title: "Failed Payments",
      value: stats.paymentsFailed,
      icon: CreditCard,
      description:
        "Payments that failed",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2
          size={26}
          className="animate-spin text-black dark:text-white"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-black dark:text-white">
          Overview of your platform activity.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATS */}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-[#181818]">
                  <Icon
                    size={20}
                    className="text-black dark:text-white"
                  />
                </div>
              </div>

              <p className="mt-5 text-sm text-black dark:text-white">
                {card.title}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-black dark:text-white">
                {card.value}
              </h2>

              <p className="mt-2 text-xs text-black dark:text-white">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;