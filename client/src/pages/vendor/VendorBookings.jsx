import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Check,
  X,
  Loader2,
  MoreHorizontal,
  CreditCard,
} from "lucide-react";

import api from "../../lib/api";

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [activeTab, setActiveTab] =
    useState("ALL");

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH BOOKINGS
  |--------------------------------------------------------------------------
  */

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/bookings/vendor"
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

  useEffect(() => {
    fetchBookings();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FORMATTERS
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

  /*
  |--------------------------------------------------------------------------
  | STATUS STYLE
  |--------------------------------------------------------------------------
  */

  const getStatusStyle = (
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

  /*
  |--------------------------------------------------------------------------
  | PAYMENT STYLE
  |--------------------------------------------------------------------------
  */

  const getPaymentStyle = (
    status
  ) => {
    switch (status) {
      case "PAID":
      case "COLLECTED":
        return "text-green-600";

      case "FAILED":
        return "text-red-600";

      case "REFUNDED":
        return "text-blue-600";

      default:
        return "text-yellow-600";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | BOOKING ACTION
  |--------------------------------------------------------------------------
  */

  const bookingAction = async (
    booking,
    action
  ) => {
    try {
      setActionLoading(true);
      setError("");

      let endpoint = "";

      let body = {};

      switch (action) {
        case "accept":
          endpoint = `/bookings/${booking._id}/confirm`;
          break;

        case "reject":
          endpoint = `/bookings/${booking._id}/reject`;

          body = {
            reason:
              window.prompt(
                "Reason for rejection?"
              ) || "",
          };

          if (!body.reason) {
            setActionLoading(false);
            return;
          }

          break;

        case "complete":
          endpoint = `/bookings/${booking._id}/complete`;
          break;

        case "no_show":
          endpoint = `/bookings/${booking._id}/no-show`;
          break;

        default:
          return;
      }

      await api.patch(
        endpoint,
        body
      );

      setSelectedBooking(null);

      await fetchBookings();
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Unable to update booking."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | COLLECT PAYMENT
  |--------------------------------------------------------------------------
  */

  const collectPayment = async (
    booking
  ) => {
    const confirmed =
      window.confirm(
        `Collect ${formatPrice(
          booking.price,
          booking.currency
        )} from the customer?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await api.post(
        `/payments/collect/${booking._id}`,
        {
          paymentMethod: "CASH",
        }
      );

      setSelectedBooking(null);

      await fetchBookings();
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Unable to collect payment."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredBookings =
    activeTab === "ALL"
      ? bookings
      : bookings.filter(
          (booking) =>
            booking.status ===
            activeTab
        );

  /*
  |--------------------------------------------------------------------------
  | TABS
  |--------------------------------------------------------------------------
  */

  const tabs = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
    "NO_SHOW",
  ];

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2
          size={25}
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
          Bookings
        </h1>

        <p className="mt-1 text-sm text-black dark:text-white">
          Manage your customer bookings.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABS */}

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() =>
              setActiveTab(tab)
            }
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
              activeTab === tab
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-50 text-black dark:bg-[#303030] dark:text-white"
            }`}
          >
            {tab.replace(
              "_",
              " "
            )}
          </button>
        ))}
      </div>

      {/* BOOKINGS */}

      {filteredBookings.length ===
      0 ? (
        <div className="mt-6 rounded-2xl bg-gray-50 p-12 text-center dark:bg-[#303030]">
          <CalendarDays
            size={32}
            className="mx-auto text-black dark:text-white"
          />

          <h2 className="mt-4 font-semibold text-black dark:text-white">
            No bookings
          </h2>

          <p className="mt-1 text-sm text-black dark:text-white">
            There are no bookings in this category.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {filteredBookings.map(
            (booking) => (
              <div
                key={
                  booking._id
                }
                className="rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]"
              >
                {/* TOP */}

                <div className="flex items-start justify-between gap-4">
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

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      booking.status
                    )}`}
                  >
                    {
                      booking.status
                    }
                  </span>
                </div>

                {/* CUSTOMER */}

                <div className="mt-5">
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
                      "Customer"}
                  </p>
                </div>

                {/* DATE / TIME */}

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <CalendarDays
                      size={17}
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

                  <div className="flex gap-3">
                    <Clock3
                      size={17}
                      className="mt-0.5 text-black dark:text-white"
                    />

                    <div>
                      <p className="text-xs text-black dark:text-white">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-medium text-black dark:text-white">
                        {formatTime(
                          booking.startTime
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PAYMENT */}

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-black dark:text-white">
                      Payment
                    </p>

                    <p
                      className={`mt-1 text-sm font-medium ${getPaymentStyle(
                        booking.paymentStatus
                      )}`}
                    >
                      {
                        booking.paymentStatus
                      }
                    </p>
                  </div>

                  <div className="text-right">
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

                {/* ACTIONS */}

                <div className="mt-5 border-t border-gray-200 pt-4 dark:border-[#181818]">
                  {/* PENDING */}

                  {booking.status ===
                    "PENDING" && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          bookingAction(
                            booking,
                            "accept"
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                      >
                        <Check
                          size={16}
                        />
                        Accept
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          bookingAction(
                            booking,
                            "reject"
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50 dark:bg-[#181818] dark:text-white"
                      >
                        <X
                          size={16}
                        />
                        Reject
                      </button>
                    </div>
                  )}

                  {/* CONFIRMED */}

                  {booking.status ===
                    "CONFIRMED" && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          bookingAction(
                            booking,
                            "complete"
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                      >
                        <Check
                          size={16}
                        />
                        Complete
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          bookingAction(
                            booking,
                            "no_show"
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50 dark:bg-[#181818] dark:text-white"
                      >
                        No Show
                      </button>
                    </div>
                  )}

                  {/* PAY AFTER */}

                  {booking.paymentMode ===
                    "PAY_AFTER" &&
                    booking.paymentStatus !==
                      "COLLECTED" &&
                    booking.status !==
                      "CANCELLED" &&
                    booking.status !==
                      "REJECTED" && (
                      <button
                        type="button"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          collectPayment(
                            booking
                          )
                        }
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                      >
                        <CreditCard
                          size={16}
                        />
                        Collect Payment
                      </button>
                    )}

                  {/* VIEW */}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedBooking(
                        booking
                      )
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black dark:bg-[#181818] dark:text-white"
                  >
                    <MoreHorizontal
                      size={16}
                    />
                    View Details
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ================================================= */}
      {/* DETAILS MODAL */}
      {/* ================================================= */}

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
                  Customer
                </p>

                <p className="mt-1 font-medium text-black dark:text-white">
                  {selectedBooking
                    .customer
                    ?.name ||
                    selectedBooking
                      .customer
                      ?.email ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-black dark:text-white">
                  Service
                </p>

                <p className="mt-1 font-medium text-black dark:text-white">
                  {selectedBooking
                    .service
                    ?.title ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-black dark:text-white">
                  Offering
                </p>

                <p className="mt-1 font-medium text-black dark:text-white">
                  {selectedBooking
                    .offering
                    ?.name ||
                    "-"}
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

              <div className="flex justify-between rounded-lg bg-gray-50 p-4 dark:bg-[#303030]">
                <div>
                  <p className="text-xs text-black dark:text-white">
                    Booking Status
                  </p>

                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      selectedBooking.status
                    )}`}
                  >
                    {
                      selectedBooking.status
                    }
                  </span>
                </div>

                <div className="text-right">
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
              </div>

              {selectedBooking.cancellationReason && (
                <div className="rounded-lg bg-red-100 p-3">
                  <p className="text-xs font-medium text-red-700">
                    Reason
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {
                      selectedBooking.cancellationReason
                    }
                  </p>
                </div>
              )}

              {/* MODAL ACTIONS */}

              {selectedBooking.status ===
                "PENDING" && (
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      bookingAction(
                        selectedBooking,
                        "accept"
                      )
                    }
                    className="flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
                  >
                    Accept
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      bookingAction(
                        selectedBooking,
                        "reject"
                      )
                    }
                    className="flex-1 rounded-lg bg-gray-50 px-4 py-2.5 text-sm font-medium text-black dark:bg-[#303030] dark:text-white"
                  >
                    Reject
                  </button>
                </div>
              )}

              {selectedBooking.status ===
                "CONFIRMED" && (
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      bookingAction(
                        selectedBooking,
                        "complete"
                      )
                    }
                    className="flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
                  >
                    Complete
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      bookingAction(
                        selectedBooking,
                        "no_show"
                      )
                    }
                    className="flex-1 rounded-lg bg-gray-50 px-4 py-2.5 text-sm font-medium text-black dark:bg-[#303030] dark:text-white"
                  >
                    No Show
                  </button>
                </div>
              )}

              {selectedBooking.paymentMode ===
                "PAY_AFTER" &&
                selectedBooking.paymentStatus !==
                  "COLLECTED" &&
                selectedBooking.status !==
                  "CANCELLED" &&
                selectedBooking.status !==
                  "REJECTED" && (
                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      collectPayment(
                        selectedBooking
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white"
                  >
                    <CreditCard
                      size={16}
                    />
                    Collect Payment
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorBookings;