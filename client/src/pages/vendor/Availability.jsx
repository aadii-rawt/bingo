import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  CalendarDays,
  Clock3,
  X,
  Pencil,
} from "lucide-react";

import api from "../../lib/api";

const weekdays = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const createDefaultAvailability = () => {
  return weekdays.map((day) => ({
    weekday: day.value,
    enabled: false,
    ruleId: null,
    windows: [
      {
        start: "09:00",
        end: "18:00",
      },
    ],
    capacity: 1,
  }));
};

const Availability = () => {
  const [services, setServices] = useState([]);

  const [selectedService, setSelectedService] =
    useState("");

  const [availability, setAvailability] = useState(
    createDefaultAvailability()
  );

  const [exceptions, setExceptions] = useState([]);

  const [exceptionForm, setExceptionForm] = useState({
    date: "",
    type: "CLOSED",
    start: "09:00",
    end: "18:00",
    reason: "",
  });

  const [editingExceptionId, setEditingExceptionId] =
    useState(null);

  const [loadingServices, setLoadingServices] =
    useState(true);

  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [loadingExceptions, setLoadingExceptions] =
    useState(false);

  const [savingAvailability, setSavingAvailability] =
    useState(false);

  const [savingException, setSavingException] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // SERVICES
  // =====================================================

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      setError("");

      const response = await api.get("/services");

      setServices(response?.data?.data || []);
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to load services"
      );
    } finally {
      setLoadingServices(false);
    }
  };

  // =====================================================
  // LOAD AVAILABILITY
  // =====================================================

  const fetchAvailability = async (serviceId) => {
    try {
      setLoadingAvailability(true);
      setError("");

      const response = await api.get(
        `/availability/rules/service/${serviceId}`
      );

      const rules = response?.data?.data || [];

      const defaultAvailability =
        createDefaultAvailability();

      rules.forEach((rule) => {
        const index =
          defaultAvailability.findIndex(
            (day) =>
              day.weekday === rule.weekday
          );

        if (index === -1) {
          return;
        }

        defaultAvailability[index] = {
          weekday: rule.weekday,
          enabled: true,
          ruleId: rule._id,
          windows:
            rule.windows?.length > 0
              ? rule.windows.map((window) => ({
                  start: window.start,
                  end: window.end,
                }))
              : [
                  {
                    start: "09:00",
                    end: "18:00",
                  },
                ],
          capacity: rule.capacity || 1,
        };
      });

      setAvailability(
        defaultAvailability
      );
    } catch (error) {
      setAvailability(
        createDefaultAvailability()
      );

      setError(
        error?.response?.data?.message ||
          "Unable to load availability"
      );
    } finally {
      setLoadingAvailability(false);
    }
  };

  // =====================================================
  // LOAD EXCEPTIONS
  // =====================================================

  const fetchExceptions = async (serviceId) => {
    try {
      setLoadingExceptions(true);
      setError("");

      const response = await api.get(
        `/availability/exceptions/service/${serviceId}`
      );

      setExceptions(
        response?.data?.data || []
      );
    } catch (error) {
      setExceptions([]);

      setError(
        error?.response?.data?.message ||
          "Unable to load exceptions"
      );
    } finally {
      setLoadingExceptions(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchServices();
  }, []);

  // =====================================================
  // SERVICE CHANGE
  // =====================================================

  const handleServiceChange = async (
    serviceId
  ) => {
    setSelectedService(serviceId);

    setError("");
    setSuccess("");

    setExceptions([]);

    setEditingExceptionId(null);

    setExceptionForm({
      date: "",
      type: "CLOSED",
      start: "09:00",
      end: "18:00",
      reason: "",
    });

    if (!serviceId) {
      setAvailability(
        createDefaultAvailability()
      );

      return;
    }

    await Promise.all([
      fetchAvailability(serviceId),
      fetchExceptions(serviceId),
    ]);
  };

  // =====================================================
  // AVAILABILITY
  // =====================================================

  const toggleDay = (weekday) => {
    setAvailability((current) =>
      current.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              enabled: !day.enabled,
            }
          : day
      )
    );
  };

  const updateCapacity = (
    weekday,
    value
  ) => {
    setAvailability((current) =>
      current.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              capacity:
                value === ""
                  ? ""
                  : Number(value),
            }
          : day
      )
    );
  };

  const updateWindow = (
    weekday,
    windowIndex,
    field,
    value
  ) => {
    setAvailability((current) =>
      current.map((day) => {
        if (day.weekday !== weekday) {
          return day;
        }

        const windows = [...day.windows];

        windows[windowIndex] = {
          ...windows[windowIndex],
          [field]: value,
        };

        return {
          ...day,
          windows,
        };
      })
    );
  };

  const addWindow = (weekday) => {
    setAvailability((current) =>
      current.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              windows: [
                ...day.windows,
                {
                  start: "09:00",
                  end: "18:00",
                },
              ],
            }
          : day
      )
    );
  };

  const removeWindow = (
    weekday,
    windowIndex
  ) => {
    setAvailability((current) =>
      current.map((day) => {
        if (day.weekday !== weekday) {
          return day;
        }

        if (day.windows.length <= 1) {
          return day;
        }

        return {
          ...day,
          windows: day.windows.filter(
            (_, index) =>
              index !== windowIndex
          ),
        };
      })
    );
  };

  // =====================================================
  // SAVE AVAILABILITY
  // =====================================================

  const saveAvailability = async () => {
    if (!selectedService) {
      setError(
        "Please select a service first."
      );
      return;
    }

    for (const day of availability) {
      if (!day.enabled) {
        continue;
      }

      if (
        !day.capacity ||
        Number(day.capacity) < 1
      ) {
        setError(
          `${
            weekdays.find(
              (item) =>
                item.value === day.weekday
            )?.label
          }: capacity must be at least 1.`
        );

        return;
      }

      for (const window of day.windows) {
        if (
          !window.start ||
          !window.end
        ) {
          setError(
            "Start and end time are required."
          );

          return;
        }

        if (
          window.start >= window.end
        ) {
          setError(
            "End time must be after start time."
          );

          return;
        }
      }
    }

    try {
      setSavingAvailability(true);
      setError("");
      setSuccess("");

      for (const day of availability) {
        // -----------------------------
        // DISABLED DAY
        // -----------------------------

        if (!day.enabled) {
          if (day.ruleId) {
            await api.delete(
              `/availability/rules/${day.ruleId}`
            );
          }

          continue;
        }

        const payload = {
          service: selectedService,
          weekday: day.weekday,
          windows: day.windows,
          capacity: Number(
            day.capacity
          ),
        };

        // -----------------------------
        // UPDATE
        // -----------------------------

        if (day.ruleId) {
          await api.patch(
            `/availability/rules/${day.ruleId}`,
            payload
          );
        }

        // -----------------------------
        // CREATE
        // -----------------------------

        else {
          await api.post(
            "/availability/rules",
            payload
          );
        }
      }

      // IMPORTANT:
      // Reload from backend

      await fetchAvailability(
        selectedService
      );

      setSuccess(
        "Availability saved successfully."
      );
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to save availability."
      );
    } finally {
      setSavingAvailability(false);
    }
  };

  // =====================================================
  // EXCEPTION FORM
  // =====================================================

  const resetExceptionForm = () => {
    setExceptionForm({
      date: "",
      type: "CLOSED",
      start: "09:00",
      end: "18:00",
      reason: "",
    });

    setEditingExceptionId(null);
  };

  const handleExceptionChange = (
    field,
    value
  ) => {
    setExceptionForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // =====================================================
  // CREATE / UPDATE EXCEPTION
  // =====================================================

  const saveException = async () => {
    if (!selectedService) {
      setError(
        "Please select a service first."
      );
      return;
    }

    if (!exceptionForm.date) {
      setError(
        "Please select a date."
      );
      return;
    }

    if (
      exceptionForm.type === "OPEN" &&
      exceptionForm.start >=
        exceptionForm.end
    ) {
      setError(
        "Exception end time must be after start time."
      );
      return;
    }

    try {
      setSavingException(true);
      setError("");
      setSuccess("");

      const payload = {
        service: selectedService,

        date: exceptionForm.date,

        type: exceptionForm.type,

        windows:
          exceptionForm.type === "OPEN"
            ? [
                {
                  start:
                    exceptionForm.start,
                  end:
                    exceptionForm.end,
                },
              ]
            : [],

        reason:
          exceptionForm.reason.trim(),
      };

      // UPDATE

      if (editingExceptionId) {
        await api.patch(
          `/availability/exceptions/${editingExceptionId}`,
          payload
        );

        setSuccess(
          "Exception updated successfully."
        );
      }

      // CREATE

      else {
        await api.post(
          "/availability/exceptions",
          payload
        );

        setSuccess(
          "Exception created successfully."
        );
      }

      resetExceptionForm();

      // IMPORTANT:
      // Reload from backend

      await fetchExceptions(
        selectedService
      );
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to save exception."
      );
    } finally {
      setSavingException(false);
    }
  };

  // =====================================================
  // EDIT EXCEPTION
  // =====================================================

  const editException = (
    exception
  ) => {
    const firstWindow =
      exception.windows?.[0];

    setEditingExceptionId(
      exception._id
    );

    setExceptionForm({
      date: exception.date || "",

      type:
        exception.type || "CLOSED",

      start:
        firstWindow?.start ||
        "09:00",

      end:
        firstWindow?.end ||
        "18:00",

      reason:
        exception.reason || "",
    });

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE EXCEPTION
  // =====================================================

  const deleteException = async (
    exceptionId
  ) => {
    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/availability/exceptions/${exceptionId}`
      );

      await fetchExceptions(
        selectedService
      );

      setSuccess(
        "Exception deleted successfully."
      );
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to delete exception."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingServices) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-8 text-center dark:border-[#303030] dark:bg-[#181818]">
        <p className="text-sm text-black dark:text-white">
          Loading services...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Availability
        </h1>

        <p className="mt-1 text-sm text-black dark:text-white">
          Manage your weekly schedule and date-specific
          availability.
        </p>
      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-[#303030] dark:text-red-400">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* SUCCESS */}
      {/* ================================================= */}

      {success && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-[#303030] dark:text-green-400">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* SERVICE */}
      {/* ================================================= */}

      <section className="mt-6 rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Select Service
        </h2>

        <p className="mt-1 text-sm text-black dark:text-white">
          Configure availability separately for each
          service.
        </p>

        <select
          value={selectedService}
          onChange={(e) =>
            handleServiceChange(
              e.target.value
            )
          }
          className="mt-5 w-full rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none dark:border-[#303030] dark:bg-[#181818] dark:text-white"
        >
          <option value="">
            Select service
          </option>

          {services.map((service) => (
            <option
              key={service._id}
              value={service._id}
            >
              {service.title}
            </option>
          ))}
        </select>
      </section>

      {/* ================================================= */}
      {/* WEEKLY AVAILABILITY */}
      {/* ================================================= */}

      {selectedService && (
        <section className="mt-6 rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Weekly Availability
              </h2>

              <p className="mt-1 text-sm text-black dark:text-white">
                Your regular working hours for this service.
              </p>
            </div>

            {loadingAvailability && (
              <span className="text-sm text-black dark:text-white">
                Loading...
              </span>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {availability.map((day) => {
              const dayName =
                weekdays.find(
                  (item) =>
                    item.value === day.weekday
                )?.label;

              return (
                <div
                  key={day.weekday}
                  className="rounded-xl border border-gray-100 p-5 dark:border-[#303030]"
                >
                  {/* DAY HEADER */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          toggleDay(
                            day.weekday
                          )
                        }
                        className={`relative h-6 w-11 rounded-full ${
                          day.enabled
                            ? "bg-black dark:bg-white"
                            : "bg-gray-100 dark:bg-[#303030]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full ${
                            day.enabled
                              ? "left-6 bg-white dark:bg-black"
                              : "left-1 bg-black dark:bg-white"
                          }`}
                        />
                      </button>

                      <span className="font-medium text-black dark:text-white">
                        {dayName}
                      </span>

                      {!day.enabled && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-black dark:bg-[#303030] dark:text-white">
                          Closed
                        </span>
                      )}
                    </div>

                    {day.enabled && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-black dark:text-white">
                          Capacity
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={
                            day.capacity
                          }
                          onChange={(e) =>
                            updateCapacity(
                              day.weekday,
                              e.target.value
                            )
                          }
                          className="w-20 rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm text-black dark:border-[#303030] dark:bg-[#181818] dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* WINDOWS */}

                  {day.enabled && (
                    <div className="mt-5 space-y-3">
                      {day.windows.map(
                        (
                          window,
                          index
                        ) => (
                          <div
                            key={index}
                            className="flex items-center gap-3"
                          >
                            <div className="relative flex-1">
                              <Clock3
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white"
                              />

                              <input
                                type="time"
                                value={
                                  window.start
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateWindow(
                                    day.weekday,
                                    index,
                                    "start",
                                    e.target
                                      .value
                                  )
                                }
                                className="w-full rounded-lg border border-gray-100 bg-white py-3 pl-9 pr-3 text-sm text-black dark:border-[#303030] dark:bg-[#181818] dark:text-white"
                              />
                            </div>

                            <span className="text-sm text-black dark:text-white">
                              to
                            </span>

                            <div className="relative flex-1">
                              <Clock3
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white"
                              />

                              <input
                                type="time"
                                value={
                                  window.end
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateWindow(
                                    day.weekday,
                                    index,
                                    "end",
                                    e.target
                                      .value
                                  )
                                }
                                className="w-full rounded-lg border border-gray-100 bg-white py-3 pl-9 pr-3 text-sm text-black dark:border-[#303030] dark:bg-[#181818] dark:text-white"
                              />
                            </div>

                            <button
                              type="button"
                              disabled={
                                day.windows
                                  .length ===
                                1
                              }
                              onClick={() =>
                                removeWindow(
                                  day.weekday,
                                  index
                                )
                              }
                              className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-100 text-black disabled:opacity-30 dark:border-[#303030] dark:text-white"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          addWindow(
                            day.weekday
                          )
                        }
                        className="flex items-center gap-2 text-sm font-medium text-black dark:text-white"
                      >
                        <Plus size={16} />
                        Add time window
                      </button>
                    </div>
                  )}

                  {!day.enabled && (
                    <p className="mt-4 text-sm text-black dark:text-white">
                      You are unavailable on{" "}
                      {dayName}.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-100 pt-6 dark:border-[#303030]">
            <button
              type="button"
              onClick={saveAvailability}
              disabled={
                savingAvailability ||
                loadingAvailability
              }
              className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              <Save size={16} />

              {savingAvailability
                ? "Saving..."
                : "Save Availability"}
            </button>
          </div>
        </section>
      )}

      {/* ================================================= */}
      {/* SAVED AVAILABILITY SUMMARY */}
      {/* ================================================= */}

      {selectedService && (
        <section className="mt-6 rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Current Availability
            </h2>

            <p className="mt-1 text-sm text-black dark:text-white">
              This is the availability currently saved for
              this service.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availability.map((day) => {
              const dayName =
                weekdays.find(
                  (item) =>
                    item.value === day.weekday
                )?.label;

              return (
                <div
                  key={day.weekday}
                  className="rounded-lg border border-gray-100 p-4 dark:border-[#303030]"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-black dark:text-white">
                      {dayName}
                    </p>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        day.enabled
                          ? "bg-green-50 text-green-700 dark:bg-[#303030] dark:text-green-400"
                          : "bg-gray-100 text-black dark:bg-[#303030] dark:text-white"
                      }`}
                    >
                      {day.enabled
                        ? "Available"
                        : "Closed"}
                    </span>
                  </div>

                  {day.enabled && (
                    <>
                      <div className="mt-3 space-y-2">
                        {day.windows.map(
                          (
                            window,
                            index
                          ) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-[#303030]"
                            >
                              <span className="text-sm text-black dark:text-white">
                                {window.start}
                              </span>

                              <span className="text-xs text-black dark:text-white">
                                to
                              </span>

                              <span className="text-sm text-black dark:text-white">
                                {window.end}
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      <p className="mt-3 text-xs text-black dark:text-white">
                        Capacity:{" "}
                        {day.capacity}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================================================= */}
      {/* EXCEPTIONS */}
      {/* ================================================= */}

      {selectedService && (
        <section className="mt-6 rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Availability Exceptions
            </h2>

            <p className="mt-1 text-sm text-black dark:text-white">
              Override your normal schedule for a specific
              date.
            </p>
          </div>

          {/* FORM */}

          <div className="mt-6 rounded-xl border border-gray-100 p-5 dark:border-[#303030]">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-black dark:text-white">
                {editingExceptionId
                  ? "Edit Exception"
                  : "Add Exception"}
              </h3>

              {editingExceptionId && (
                <button
                  type="button"
                  onClick={
                    resetExceptionForm
                  }
                  className="text-sm text-black dark:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* DATE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Date
                </label>

                <input
                  type="date"
                  value={
                    exceptionForm.date
                  }
                  onChange={(e) =>
                    handleExceptionChange(
                      "date",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-100 bg-white px-3 py-3 text-sm text-black dark:border-[#303030] dark:bg-[#181818] dark:text-white"
                />
              </div>

              {/* TYPE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Type
                </label>

                <select
                  value={
                    exceptionForm.type
                  }
                  onChange={(e) =>
                    handleExceptionChange(
                      "type",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-100 bg-white px-3 py-3 text-sm text-black dark:border-[#303030] dark:bg-[#181818] dark:text-white"
                >
                  <option value="CLOSED">
                    Closed
                  </option>

                  <option value="OPEN">
                    Open
                  </option>
                </select>
              </div>

              {/* START */}

              {exceptionForm.type ===
                "OPEN" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Start
                  </label>

                  <input
                    type="time"
                    value={
                      exceptionForm.start
                    }
                    onChange={(e) =>
                      handleExceptionChange(
                        "start",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-100 bg-white px-3 py-3 text-sm text-black dark:border-[#303030] dark:bg-[#181818] dark:text-white"
                  />
                </div>
              )}

              {/* END */}

              {exceptionForm.type ===
                "OPEN" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    End
                  </label>

                  <input
                    type="time"
                    value={
                      exceptionForm.end
                    }
                    onChange={(e) =>
                      handleExceptionChange(
                        "end",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-100 bg-white px-3 py-3 text-sm text-black dark:border-[#303030] dark:bg-[#181818] dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* REASON */}

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Reason
              </label>

              <input
                type="text"
                value={
                  exceptionForm.reason
                }
                onChange={(e) =>
                  handleExceptionChange(
                    "reason",
                    e.target.value
                  )
                }
                placeholder="e.g. Holiday, personal work, special hours"
                className="w-full rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-400 dark:border-[#303030] dark:bg-[#181818] dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={saveException}
              disabled={savingException}
              className="mt-5 flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {editingExceptionId ? (
                <Pencil size={16} />
              ) : (
                <Plus size={16} />
              )}

              {savingException
                ? "Saving..."
                : editingExceptionId
                ? "Update Exception"
                : "Add Exception"}
            </button>
          </div>

          {/* EXCEPTION LIST */}

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-black dark:text-white">
                Saved Exceptions
              </h3>

              {loadingExceptions && (
                <span className="text-sm text-black dark:text-white">
                  Loading...
                </span>
              )}
            </div>

            {exceptions.length === 0 &&
              !loadingExceptions && (
                <div className="mt-4 rounded-lg border border-dashed border-gray-100 p-8 text-center dark:border-[#303030]">
                  <p className="text-sm text-black dark:text-white">
                    No availability exceptions added.
                  </p>
                </div>
              )}

            {exceptions.length > 0 && (
              <div className="mt-4 space-y-3">
                {exceptions.map(
                  (exception) => (
                    <div
                      key={exception._id}
                      className="flex flex-col gap-4 rounded-xl border border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#303030]"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-black dark:text-white">
                            {exception.date}
                          </p>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              exception.type ===
                              "CLOSED"
                                ? "bg-red-50 text-red-700 dark:bg-[#303030] dark:text-red-400"
                                : "bg-green-50 text-green-700 dark:bg-[#303030] dark:text-green-400"
                            }`}
                          >
                            {exception.type}
                          </span>
                        </div>

                        {exception.type ===
                          "OPEN" &&
                          exception.windows
                            ?.length >
                            0 && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-black dark:text-white">
                              <Clock3
                                size={
                                  15
                                }
                              />

                              {exception.windows
                                .map(
                                  (
                                    window
                                  ) =>
                                    `${window.start} - ${window.end}`
                                )
                                .join(
                                  ", "
                                )}
                            </div>
                          )}

                        {exception.reason && (
                          <p className="mt-2 text-sm text-black dark:text-white">
                            {exception.reason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            editException(
                              exception
                            )
                          }
                          className="flex h-9 items-center gap-2 rounded-lg border border-gray-100 px-3 text-sm text-black dark:border-[#303030] dark:text-white"
                        >
                          <Pencil
                            size={14}
                          />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteException(
                              exception._id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 text-black dark:border-[#303030] dark:text-white"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Availability;