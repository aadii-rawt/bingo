import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  IndianRupee,
  BriefcaseBusiness,
  Loader2,
} from "lucide-react";

import api from "../../lib/api";

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        bookingsResponse,
        servicesResponse,
      ] = await Promise.all([
        api.get("/bookings/vendor"),
        api.get("/services/my"),
      ]);

      const bookingsData =
        bookingsResponse?.data?.data || [];

      const servicesData =
        servicesResponse?.data?.data || [];

      setBookings(
        Array.isArray(bookingsData)
          ? bookingsData
          : []
      );

      setServices(
        Array.isArray(servicesData)
          ? servicesData
          : []
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
    fetchDashboardData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CALCULATE REAL DATA
  |--------------------------------------------------------------------------
  */

  const dashboardData = useMemo(() => {
    const today = new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(
      23,
      59,
      59,
      999
    );

    const todayBookings = bookings.filter(
      (booking) => {
        const date = new Date(
          booking.startTime
        );

        return (
          date >= startOfToday &&
          date <= endOfToday
        );
      }
    );

    const upcomingBookings =
      bookings.filter((booking) => {
        const date = new Date(
          booking.startTime
        );

        return (
          date > today &&
          [
            "PENDING",
            "CONFIRMED",
          ].includes(booking.status)
        );
      });

    const completedBookings =
      bookings.filter(
        (booking) =>
          booking.status ===
          "COMPLETED"
      );

    /*
     * Revenue from existing booking data.
     *
     * We only count completed bookings
     * whose payment has actually been
     * collected/paid.
     */

    const revenue =
      bookings
        .filter(
          (booking) =>
            booking.status ===
              "COMPLETED" &&
            [
              "PAID",
              "COLLECTED",
            ].includes(
              booking.paymentStatus
            )
        )
        .reduce(
          (total, booking) =>
            total +
            Number(
              booking.price || 0
            ),
          0
        );

    return {
      todayBookings,
      upcomingBookings,
      completedBookings,
      revenue,
      publishedServices:
        services.filter(
          (service) =>
            service.status ===
            "PUBLISHED"
        ),
    };
  }, [bookings, services]);

  /*
  |--------------------------------------------------------------------------
  | FORMAT
  |--------------------------------------------------------------------------
  */

  const formatPrice = (
    amount,
    currency = "INR"
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(amount || 0);
  };

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-7xl">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-black dark:text-white">
          Overview of your bookings and services.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATS */}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* TODAY */}

        <div className="rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-[#181818]">
            <CalendarDays
              size={20}
              className="text-black dark:text-white"
            />
          </div>

          <p className="mt-5 text-sm text-black dark:text-white">
            Today's Bookings
          </p>

          <h2 className="mt-1 text-2xl font-bold text-black dark:text-white">
            {
              dashboardData
                .todayBookings
                .length
            }
          </h2>
        </div>

        {/* UPCOMING */}

        <div className="rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-[#181818]">
            <Clock3
              size={20}
              className="text-black dark:text-white"
            />
          </div>

          <p className="mt-5 text-sm text-black dark:text-white">
            Upcoming Bookings
          </p>

          <h2 className="mt-1 text-2xl font-bold text-black dark:text-white">
            {
              dashboardData
                .upcomingBookings
                .length
            }
          </h2>
        </div>

        {/* REVENUE */}

        <div className="rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-[#181818]">
            <IndianRupee
              size={20}
              className="text-black dark:text-white"
            />
          </div>

          <p className="mt-5 text-sm text-black dark:text-white">
            Revenue
          </p>

          <h2 className="mt-1 text-2xl font-bold text-black dark:text-white">
            {formatPrice(
              dashboardData.revenue
            )}
          </h2>

          <p className="mt-1 text-xs text-black dark:text-white">
            From completed bookings
          </p>
        </div>

        {/* SERVICES */}

        <div className="rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-[#181818]">
            <BriefcaseBusiness
              size={20}
              className="text-black dark:text-white"
            />
          </div>

          <p className="mt-5 text-sm text-black dark:text-white">
            Published Services
          </p>

          <h2 className="mt-1 text-2xl font-bold text-black dark:text-white">
            {
              dashboardData
                .publishedServices
                .length
            }
          </h2>
        </div>
      </div>

      {/* RECENT BOOKINGS */}

      <div className="mt-8 rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]">
        <div>
          <h2 className="font-semibold text-black dark:text-white">
            Recent Bookings
          </h2>

          <p className="mt-1 text-xs text-black dark:text-white">
            Your latest customer bookings
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays
              size={30}
              className="mx-auto text-black dark:text-white"
            />

            <p className="mt-3 text-sm text-black dark:text-white">
              No bookings yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {bookings
              .slice(0, 5)
              .map((booking) => (
                <div
                  key={
                    booking._id
                  }
                  className="rounded-xl bg-white p-4 dark:bg-[#181818]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-black dark:text-white">
                        {booking
                          .customer
                          ?.name ||
                          booking
                            .customer
                            ?.email ||
                          "Customer"}
                      </p>

                      <p className="mt-1 text-sm text-black dark:text-white">
                        {booking
                          .service
                          ?.title ||
                          "Service"}
                        {" · "}
                        {booking
                          .offering
                          ?.name ||
                          "Offering"}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-sm font-medium text-black dark:text-white">
                        {formatDate(
                          booking.startTime
                        )}{" "}
                        ·{" "}
                        {formatTime(
                          booking.startTime
                        )}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-black dark:text-white">
                        {formatPrice(
                          booking.price,
                          booking.currency
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;