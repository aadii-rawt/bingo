import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  CreditCard,
  Loader2,
  X,
} from "lucide-react";

import api from "../../lib/api";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] =
    useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bookings/my");

      const data = response?.data?.data || [];

      setBookings(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatPrice = (
    amount,
    currency = "INR"
  ) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
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

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700";

      case "COMPLETED":
        return "bg-blue-100 text-blue-700";

      case "CANCELLED":
      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "NO_SHOW":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  const getPaymentStyle = (status) => {
    switch (status) {
      case "PAID":
      case "COLLECTED":
        return "text-green-600";

      case "FAILED":
        return "text-red-600";

      case "REFUNDED":
        return "text-blue-600";

      default:
        return "text-orange-600";
    }
  };

  const cancelBooking = async (booking) => {
    const reason = window.prompt(
      "Reason for cancellation?"
    );

    if (!reason) return;

    try {
      setCancelling(true);

      await api.patch(
        `/bookings/${booking._id}/cancel`,
        {
          cancellationReason: reason,
        }
      );

      setSelectedBooking(null);

      await fetchBookings();
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Unable to cancel booking."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2
          className="animate-spin text-black dark:text-white"
          size={24}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">
          My Bookings
        </h1>

        <p className="mt-1 text-sm text-black dark:text-white">
          Manage your service bookings.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* EMPTY */}

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-gray-50 p-12 text-center dark:bg-[#303030]">
          <CalendarDays
            size={32}
            className="mx-auto text-black dark:text-white"
          />

          <h2 className="mt-4 font-semibold text-black dark:text-white">
            No bookings yet
          </h2>

          <p className="mt-1 text-sm text-black dark:text-white">
            Your bookings will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]"
            >
              {/* TOP */}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-black dark:text-white">
                    {booking.service?.title ||
                      "Service"}
                  </h2>

                  <p className="mt-1 text-sm text-black dark:text-white">
                    {booking.offering?.name ||
                      "Offering"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              {/* DATE */}

              <div className="mt-5 flex items-center gap-3">
                <CalendarDays
                  size={17}
                  className="text-black dark:text-white"
                />

                <div>
                  <p className="text-xs text-black dark:text-white">
                    Date
                  </p>

                  <p className="text-sm font-medium text-black dark:text-white">
                    {formatDate(
                      booking.startTime
                    )}
                  </p>
                </div>
              </div>

              {/* TIME */}

              <div className="mt-4 flex items-center gap-3">
                <Clock3
                  size={17}
                  className="text-black dark:text-white"
                />

                <div>
                  <p className="text-xs text-black dark:text-white">
                    Time
                  </p>

                  <p className="text-sm font-medium text-black dark:text-white">
                    {formatTime(
                      booking.startTime
                    )}{" "}
                    -{" "}
                    {formatTime(
                      booking.endTime
                    )}
                  </p>
                </div>
              </div>

              {/* BOTTOM */}

              <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-[#181818]">
                <div>
                  <p className="text-xs text-black dark:text-white">
                    Amount
                  </p>

                  <p className="font-semibold text-black dark:text-white">
                    {formatPrice(
                      booking.price,
                      booking.currency
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-black dark:text-white">
                    Payment
                  </p>

                  <p
                    className={`text-sm font-medium ${getPaymentStyle(
                      booking.paymentStatus
                    )}`}
                  >
                    {booking.paymentStatus}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedBooking(
                      booking
                    )
                  }
                  className="flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
                >
                  View Details
                </button>

                {booking.status ===
                  "PENDING" && (
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={() =>
                      cancelBooking(
                        booking
                      )
                    }
                    className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black dark:bg-[#181818] dark:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILS MODAL */}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-[#181818]">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-black dark:text-white">
                Booking Details
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(
                    null
                  )
                }
                className="text-black dark:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-black dark:text-white">
                  Service
                </p>

                <p className="mt-1 font-medium text-black dark:text-white">
                  {selectedBooking.service
                    ?.title}
                </p>
              </div>

              <div>
                <p className="text-xs text-black dark:text-white">
                  Offering
                </p>

                <p className="mt-1 font-medium text-black dark:text-white">
                  {selectedBooking.offering
                    ?.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-black dark:text-white">
                    Date
                  </p>

                  <p className="mt-1 text-sm text-black dark:text-white">
                    {formatDate(
                      selectedBooking.startTime
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-black dark:text-white">
                    Time
                  </p>

                  <p className="mt-1 text-sm text-black dark:text-white">
                    {formatTime(
                      selectedBooking.startTime
                    )}{" "}
                    -{" "}
                    {formatTime(
                      selectedBooking.endTime
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-black dark:text-white">
                  Status
                </p>

                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                    selectedBooking.status
                  )}`}
                >
                  {selectedBooking.status}
                </span>
              </div>

              <div>
                <p className="text-xs text-black dark:text-white">
                  Payment
                </p>

                <p
                  className={`mt-1 text-sm font-medium ${getPaymentStyle(
                    selectedBooking.paymentStatus
                  )}`}
                >
                  {
                    selectedBooking.paymentStatus
                  }
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-[#303030]">
                <div className="flex items-center gap-2">
                  <CreditCard
                    size={17}
                    className="text-black dark:text-white"
                  />

                  <span className="text-sm text-black dark:text-white">
                    {selectedBooking.paymentMode ===
                    "PAY_NOW"
                      ? "Pay Now"
                      : "Pay After"}
                  </span>
                </div>

                <span className="font-semibold text-black dark:text-white">
                  {formatPrice(
                    selectedBooking.price,
                    selectedBooking.currency
                  )}
                </span>
              </div>

              {selectedBooking.cancellationReason && (
                <div className="rounded-lg bg-red-100 p-3">
                  <p className="text-xs font-medium text-red-700">
                    Cancellation Reason
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {
                      selectedBooking.cancellationReason
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;