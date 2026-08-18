import { useEffect, useState } from "react";
import {
  CreditCard,
  CalendarDays,
  Loader2,
  X,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
} from "lucide-react";

import api from "../../lib/api";

const MyPayments = () => {
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedPayment, setSelectedPayment] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH PAYMENTS
  |--------------------------------------------------------------------------
  */

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/payments/my"
      );

      const data =
        response?.data?.data || [];

      setPayments(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Unable to load payments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FORMAT PRICE
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

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

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

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | PAYMENT STATUS
  |--------------------------------------------------------------------------
  */

  const getStatus = (status) => {
    switch (status) {
      case "SUCCESS":
        return {
          label: "Success",
          className:
            "bg-green-100 text-green-700",
          icon: CheckCircle2,
        };

      case "FAILED":
        return {
          label: "Failed",
          className:
            "bg-red-100 text-red-700",
          icon: XCircle,
        };

      case "REFUNDED":
        return {
          label: "Refunded",
          className:
            "bg-blue-100 text-blue-700",
          icon: RotateCcw,
        };

      default:
        return {
          label: "Initiated",
          className:
            "bg-orange-100 text-orange-700",
          icon: Clock3,
        };
    }
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
          size={25}
          className="animate-spin text-black dark:text-white"
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-6xl">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Payments
        </h1>

        <p className="mt-1 text-sm text-black dark:text-white">
          View your payment history and transaction details.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* EMPTY */}

      {payments.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-gray-50 p-12 text-center dark:bg-[#303030]">
          <CreditCard
            size={34}
            className="mx-auto text-black dark:text-white"
          />

          <h2 className="mt-4 font-semibold text-black dark:text-white">
            No payments yet
          </h2>

          <p className="mt-1 text-sm text-black dark:text-white">
            Your payment transactions will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {payments.map(
            (payment) => {
              const status =
                getStatus(
                  payment.status
                );

              const StatusIcon =
                status.icon;

              return (
                <div
                  key={
                    payment._id
                  }
                  className="rounded-2xl bg-gray-50 p-5 dark:bg-[#303030]"
                >
                  {/* TOP */}

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-[#181818]">
                        <CreditCard
                          size={20}
                          className="text-black dark:text-white"
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-black dark:text-white">
                          {payment
                            .booking
                            ?.offering
                            ?.name ||
                            payment
                              .booking
                              ?.service
                              ?.title ||
                            "Booking Payment"}
                        </h2>

                        <p className="mt-1 text-xs text-black dark:text-white">
                          {formatDate(
                            payment.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}

                    <div
                      className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      <StatusIcon
                        size={13}
                      />

                      {
                        status.label
                      }
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-black dark:text-white">
                        Amount
                      </p>

                      <p className="mt-1 font-semibold text-black dark:text-white">
                        {formatPrice(
                          payment.amount,
                          payment.currency
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-black dark:text-white">
                        Payment Mode
                      </p>

                      <p className="mt-1 text-sm font-medium text-black dark:text-white">
                        {payment.mode ===
                        "PAY_NOW"
                          ? "Pay Now"
                          : "Pay After"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-black dark:text-white">
                        Paid At
                      </p>

                      <p className="mt-1 text-sm font-medium text-black dark:text-white">
                        {payment.paidAt
                          ? formatDateTime(
                              payment.paidAt
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* BOTTOM */}

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPayment(
                          payment
                        )
                      }
                      className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* ================================================= */}
      {/* PAYMENT DETAILS MODAL */}
      {/* ================================================= */}

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-[#181818]">
            {/* HEADER */}

            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-black dark:text-white">
                Payment Details
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(
                    null
                  )
                }
                className="text-black dark:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* DETAILS */}

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black dark:text-white">
                  Amount
                </span>

                <span className="font-semibold text-black dark:text-white">
                  {formatPrice(
                    selectedPayment.amount,
                    selectedPayment.currency
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-black dark:text-white">
                  Status
                </span>

                <span className="text-sm font-medium text-black dark:text-white">
                  {
                    selectedPayment.status
                  }
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-black dark:text-white">
                  Payment Mode
                </span>

                <span className="text-sm font-medium text-black dark:text-white">
                  {selectedPayment.mode ===
                  "PAY_NOW"
                    ? "Pay Now"
                    : "Pay After"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-black dark:text-white">
                  Created
                </span>

                <span className="text-right text-sm font-medium text-black dark:text-white">
                  {formatDateTime(
                    selectedPayment.createdAt
                  )}
                </span>
              </div>

              {selectedPayment.paidAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black dark:text-white">
                    Paid At
                  </span>

                  <span className="text-right text-sm font-medium text-black dark:text-white">
                    {formatDateTime(
                      selectedPayment.paidAt
                    )}
                  </span>
                </div>
              )}

              {selectedPayment.providerReference && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-[#303030]">
                  <p className="text-xs text-black dark:text-white">
                    Transaction Reference
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-black dark:text-white">
                    {
                      selectedPayment.providerReference
                    }
                  </p>
                </div>
              )}

              {selectedPayment.failureReason && (
                <div className="rounded-lg bg-red-100 p-4">
                  <p className="text-xs font-medium text-red-700">
                    Failure Reason
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {
                      selectedPayment.failureReason
                    }
                  </p>
                </div>
              )}

              {selectedPayment.booking && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-[#303030]">
                  <p className="text-xs text-black dark:text-white">
                    Booking
                  </p>

                  <p className="mt-1 text-sm font-medium text-black dark:text-white">
                    {selectedPayment
                      .booking
                      ?.offering
                      ?.name ||
                      selectedPayment
                        .booking
                        ?.service
                        ?.title ||
                      "Booking"}
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

export default MyPayments;