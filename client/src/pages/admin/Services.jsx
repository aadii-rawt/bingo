import { useEffect, useState } from "react";
import {
  X,
  Wrench,
  Ban,
  CheckCircle,
} from "lucide-react";

import api from "../../lib/api";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const [suspendModal, setSuspendModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [reason, setReason] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/services");

      setServices(response?.data?.data || []);
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to load services"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openSuspendModal = (service) => {
    setSelectedService(service);
    setReason("");
    setError("");
    setSuspendModal(true);
  };

  const closeSuspendModal = () => {
    if (actionLoading) {
      return;
    }

    setSuspendModal(false);
    setSelectedService(null);
    setReason("");
  };

  const handleSuspend = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError("Suspension reason is required");
      return;
    }

    try {
      setActionLoading(selectedService._id);
      setError("");

      await api.patch(
        `/services/${selectedService._id}/suspend`,
        {
          reason: reason.trim(),
        }
      );

      setSuspendModal(false);
      setSelectedService(null);
      setReason("");

      await fetchServices();
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to suspend service"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Services
          </h1>

          <p className="mt-1 text-sm text-black dark:text-white">
            View and manage all services available on the platform.
          </p>
        </div>

        <div className="rounded-lg bg-gray-100 px-4 py-2 dark:bg-[#303030]">
          <span className="text-sm text-black dark:text-white">
            Total Services: {services.length}
          </span>
        </div>
      </div>

      {error && !suspendModal && (
        <div className="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-black dark:bg-[#303030] dark:text-white">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center dark:border-[#303030] dark:bg-[#181818]">
            <p className="text-sm text-black dark:text-white">
              Loading services...
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center dark:border-[#303030] dark:bg-[#181818]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-[#303030]">
              <Wrench
                size={25}
                className="text-black dark:text-white"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-black dark:text-white">
              No services found
            </h2>

            <p className="mt-2 text-sm text-black dark:text-white">
              There are currently no services available.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const isSuspended =
                service.status === "SUSPENDED";

              return (
                <div
                  key={service._id}
                  className="rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#303030]">
                        <Wrench
                          size={20}
                          className="text-black dark:text-white"
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-black dark:text-white">
                          {service.title}
                        </h2>

                        <p className="mt-1 truncate text-xs text-black dark:text-white">
                          {service.category?.name ||
                            "No category"}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-black dark:bg-[#303030] dark:text-white">
                      {service.status || "DRAFT"}
                    </span>
                  </div>

                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-black dark:text-white">
                    {service.description ||
                      "No description available."}
                  </p>

                  <div className="mt-5 border-t border-gray-100 pt-4 dark:border-[#303030]">
                    <p className="text-xs text-black dark:text-white">
                      Vendor
                    </p>

                    <p className="mt-1 text-sm font-medium text-black dark:text-white">
                      {service.vendor?.name ||
                        service.vendor?.user?.name ||
                        service.vendor?.email ||
                        "Unknown vendor"}
                    </p>
                  </div>

                  {isSuspended && service.suspensionReason && (
                    <div className="mt-4 rounded-lg bg-gray-100 p-3 dark:bg-[#303030]">
                      <p className="text-xs font-medium text-black dark:text-white">
                        Suspension reason
                      </p>

                      <p className="mt-1 text-sm text-black dark:text-white">
                        {service.suspensionReason}
                      </p>
                    </div>
                  )}

                  <div className="mt-5">
                    {isSuspended ? (
                      <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-100 px-4 py-2.5 text-sm font-medium text-black dark:border-[#303030] dark:text-white">
                        <Ban size={16} />
                        Service Suspended
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          openSuspendModal(service)
                        }
                        disabled={
                          actionLoading === service._id
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                      >
                        <Ban size={16} />
                        Suspend Service
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {suspendModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white">
                  Suspend Service
                </h2>

                <p className="mt-1 text-sm text-black dark:text-white">
                  Suspend "{selectedService.title}"
                </p>
              </div>

              <button
                onClick={closeSuspendModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#303030]"
              >
                <X
                  size={18}
                  className="text-black dark:text-white"
                />
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-black dark:bg-[#303030] dark:text-white">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSuspend}
              className="mt-6"
            >
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Reason for suspension
              </label>

              <textarea
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                rows={4}
                placeholder="Enter the reason for suspending this service..."
                className="w-full resize-none rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:placeholder:text-gray-400 dark:focus:border-white"
              />

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={closeSuspendModal}
                  disabled={!!actionLoading}
                  className="flex-1 rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-black dark:border-[#303030] dark:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !!actionLoading || !reason.trim()
                  }
                  className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {actionLoading
                    ? "Suspending..."
                    : "Suspend Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;