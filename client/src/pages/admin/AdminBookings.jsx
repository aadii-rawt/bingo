import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Loader2,
  Search,
} from "lucide-react";

import api from "../../lib/api";

const AdminBookings = () => {
  const [bookings, setBookings] =
    useState([]);

  const [vendors, setVendors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filters, setFilters] =
    useState({
      status: "",
      vendor: "",
      startDate: "",
      endDate: "",
    });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filters.status) {
        params.status =
          filters.status;
      }

      if (filters.vendor) {
        params.vendor =
          filters.vendor;
      }

      if (filters.startDate) {
        params.startDate =
          filters.startDate;
      }

      if (filters.endDate) {
        params.endDate =
          filters.endDate;
      }

      const response =
        await api.get(
          "/admin/bookings",
          {
            params,
          }
        );

      const data =
        response?.data?.data || [];

      setBookings(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response =
        await api.get(
          "/admin/bookings/vendors"
        );

      const data =
        response?.data?.data || [];

      setVendors(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
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

  const statusClass = (
    status
  ) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "CONFIRMED":
        return "bg-green-100 text-green-700";

      case "COMPLETED":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "NO_SHOW":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-black";
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      vendor: "",
      startDate: "",
      endDate: "",
    });
  };


  const forceRejectBooking = async (
  booking
) => {
  const reason = window.prompt(
    "Enter the reason for force rejecting this booking:"
  );

  if (!reason || !reason.trim()) {
    return;
  }

  try {
    setLoading(true);
    setError("");

    await api.patch(
      `/admin/bookings/${booking._id}/force-reject`,
      {
        reason: reason.trim(),
      }
    );

    await fetchBookings();
  } catch (error) {
    console.error(error);

    setError(
      error?.response?.data?.message ||
        "Unable to reject booking."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="mx-auto max-w-7xl">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">
          All Bookings
        </h1>

        <p className="mt-1 text-sm text-black dark:text-white">
          View bookings across all vendors.
        </p>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FILTERS */}

      <div className="mt-6 rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]">
        <div className="flex items-center gap-2">
          <Search
            size={18}
            className="text-black dark:text-white"
          />

          <h2 className="font-medium text-black dark:text-white">
            Filters
          </h2>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* STATUS */}

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status:
                  e.target.value,
              })
            }
            className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-black outline-none dark:bg-[#181818] dark:text-white"
          >
            <option value="">
              All Statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="CONFIRMED">
              Confirmed
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="REJECTED">
              Rejected
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

            <option value="NO_SHOW">
              No Show
            </option>
          </select>

          {/* VENDOR */}

          <select
            value={filters.vendor}
            onChange={(e) =>
              setFilters({
                ...filters,
                vendor:
                  e.target.value,
              })
            }
            className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-black outline-none dark:bg-[#181818] dark:text-white"
          >
            <option value="">
              All Vendors
            </option>

            {vendors.map(
              (vendor) => (
                <option
                  key={vendor._id}
                  value={
                    vendor._id
                  }
                >
                  {vendor.name}
                </option>
              )
            )}
          </select>

          {/* START DATE */}

          <input
            type="date"
            value={
              filters.startDate
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                startDate:
                  e.target.value,
              })
            }
            className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-black outline-none dark:bg-[#181818] dark:text-white"
          />

          {/* END DATE */}

          <input
            type="date"
            value={
              filters.endDate
            }
            onChange={(e) =>
              setFilters({
                ...filters,
                endDate:
                  e.target.value,
              })
            }
            className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-black outline-none dark:bg-[#181818] dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black dark:bg-[#181818] dark:text-white"
        >
          Clear Filters
        </button>
      </div>

      {/* BOOKINGS */}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2
            size={25}
            className="animate-spin text-black dark:text-white"
          />
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-gray-50 p-12 text-center dark:bg-[#303030]">
          <CalendarDays
            size={32}
            className="mx-auto text-black dark:text-white"
          />

          <h2 className="mt-4 font-semibold text-black dark:text-white">
            No bookings found
          </h2>

          <p className="mt-1 text-sm text-black dark:text-white">
            Try changing your filters.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map(
            (booking) => (
              <div
                key={
                  booking._id
                }
                className="rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                  {/* SERVICE */}

                  <div>
                    <h2 className="font-semibold text-black dark:text-white">
                      {booking
                        .service
                        ?.title ||
                        "Service"}
                    </h2>

                    <p className="mt-1 text-sm text-black dark:text-white">
                      {booking
                        .offering
                        ?.name ||
                        "Offering"}
                    </p>
                  </div>

                  {/* STATUS */}

                  <span
                    className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                      booking.status
                    )}`}
                  >
                    {
                      booking.status
                    }
                  </span>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-4">
                  {/* CUSTOMER */}

                  <div>
                    <p className="text-xs text-black dark:text-white">
                      Customer
                    </p>

                    <p className="mt-1 text-sm font-medium text-black dark:text-white">
                      {booking
                        .customer
                        ?.name ||
                        booking
                          .customer
                          ?.email ||
                        "-"}
                    </p>
                  </div>

                  {/* VENDOR */}

                  <div>
                    <p className="text-xs text-black dark:text-white">
                      Vendor
                    </p>

                    <p className="mt-1 text-sm font-medium text-black dark:text-white">
                      {booking
                        .vendor
                        ?.user
                        ?.name ||
                        booking
                          .vendor
                          ?.name ||
                        "-"}
                    </p>
                  </div>

                  {/* DATE */}

                  <div className="flex gap-2">
                    <CalendarDays
                      size={16}
                      className="mt-0.5 text-black dark:text-white"
                    />

                    <div>
                      <p className="text-xs text-black dark:text-white">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-black dark:text-white">
                        {formatDate(
                          booking.startTime
                        )}
                      </p>
                    </div>
                  </div>

                  {/* AMOUNT */}

                  <div>
                    <p className="text-xs text-black dark:text-white">
                      Amount
                    </p>

                    <p className="mt-1 font-semibold text-black dark:text-white">
                      {formatPrice(
                        booking.price,
                        booking.currency
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-black dark:text-white">
                  <Clock3 size={14} />

                  {formatTime(
                    booking.startTime
                  )}{" "}
                  -{" "}
                  {formatTime(
                    booking.endTime
                  )}

                  <span className="mx-1">
                    •
                  </span>

                  Payment:{" "}
                  {booking.paymentStatus}
                </div>
                {![
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "NO_SHOW",
].includes(booking.status) && (
  <button
    type="button"
    onClick={() =>
      forceRejectBooking(booking)
    }
    className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
  >
    Force Reject
  </button>
)}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;