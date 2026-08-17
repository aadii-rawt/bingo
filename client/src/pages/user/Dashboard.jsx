import { useEffect, useState } from "react";
import {
    Search,
    CalendarDays,
    Clock3,
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Banknote,
    Loader2,
    X,
} from "lucide-react";

import api from "../../lib/api";

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

const API = {
    services: "/services",

    offerings: (serviceId) =>
        `/offerings/service/${serviceId}`,

    slots: "/availability/slots",

    bookings: "/bookings",

    initiatePayment: "/payments",
};

/*
|--------------------------------------------------------------------------
| WEEKDAYS
|--------------------------------------------------------------------------
*/

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
    if (!date) return "";

    return new Date(
        `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatTime = (date) => {
    if (!date) return "";

    return new Date(
        date
    ).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

const CustomerDashboard = () => {
    /*
    |--------------------------------------------------------------------------
    | SERVICES
    |--------------------------------------------------------------------------
    */

    const [services, setServices] =
        useState([]);

    const [loadingServices, setLoadingServices] =
        useState(true);

    const [search, setSearch] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | SELECTED SERVICE
    |--------------------------------------------------------------------------
    */

    const [selectedService, setSelectedService] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | OFFERINGS
    |--------------------------------------------------------------------------
    */

    const [offerings, setOfferings] =
        useState([]);

    const [selectedOffering, setSelectedOffering] =
        useState(null);

    const [loadingOfferings, setLoadingOfferings] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | DATE
    |--------------------------------------------------------------------------
    */

    const [selectedDate, setSelectedDate] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | SLOTS
    |--------------------------------------------------------------------------
    */

    const [slots, setSlots] =
        useState([]);

    const [selectedSlot, setSelectedSlot] =
        useState(null);

    const [loadingSlots, setLoadingSlots] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | PAYMENT
    |--------------------------------------------------------------------------
    */

    const [paymentMode, setPaymentMode] =
        useState("PAY_NOW");

    /*
    |--------------------------------------------------------------------------
    | BOOKING
    |--------------------------------------------------------------------------
    */

    const [bookingLoading, setBookingLoading] =
        useState(false);

    const [bookingSuccess, setBookingSuccess] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | GENERAL
    |--------------------------------------------------------------------------
    */

    const [error, setError] =
        useState("");

    const [step, setStep] =
        useState("services");

    /*
    |--------------------------------------------------------------------------
    | GET SERVICES
    |--------------------------------------------------------------------------
    */

    const fetchServices = async () => {
        try {
            setLoadingServices(true);
            setError("");

            const response = await api.get(
                API.services
            );

            const data =
                response?.data?.data || [];

            /*
             * Only published services should
             * be visible to customers.
             */

            const published =
                data.filter(
                    (service) =>
                        service.status ===
                        "PUBLISHED"
                );

            setServices(published);
        } catch (error) {
            console.error(error);

            setError(
                error?.response?.data?.message ||
                "Unable to load services."
            );
        } finally {
            setLoadingServices(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchServices();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | SELECT SERVICE
    |--------------------------------------------------------------------------
    */

    const handleSelectService = async (
        service
    ) => {
        try {
            setSelectedService(service);

            setSelectedOffering(null);

            setSelectedDate("");

            setSelectedSlot(null);

            setSlots([]);

            setError("");

            setLoadingOfferings(true);

            /*
             * IMPORTANT:
             *
             * This now matches the backend route:
             *
             * GET /offerings/service/:serviceId
             */

            const response = await api.get(
                API.offerings(service._id)
            );

            const data =
                response?.data?.data || [];

            const activeOfferings =
                data.filter(
                    (offering) =>
                        offering.isActive !== false
                );

            setOfferings(
                activeOfferings
            );

            setStep("offering");
        } catch (error) {
            console.error(error);

            setError(
                error?.response?.data?.message ||
                "Unable to load offerings."
            );
        } finally {
            setLoadingOfferings(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | SELECT OFFERING
    |--------------------------------------------------------------------------
    */

    const handleSelectOffering = (
        offering
    ) => {
        setSelectedOffering(
            offering
        );

        setSelectedDate("");

        setSelectedSlot(null);

        setSlots([]);

        setError("");

        setStep("date");
    };

    /*
    |--------------------------------------------------------------------------
    | GET SLOTS
    |--------------------------------------------------------------------------
    */

    const fetchSlots = async (date) => {
        if (
            !selectedService ||
            !selectedOffering ||
            !date
        ) {
            return;
        }

        try {
            setLoadingSlots(true);
            setError("");
            setSelectedSlot(null);

            const response = await api.get(
                "/availability/slots",
                {
                    params: {
                        service: selectedService._id,
                        offering: selectedOffering._id,
                        startDate: date,
                    },
                }
            );

            console.log(
                "SLOTS RESPONSE:",
                response.data
            );

            // Handle different response structures
            const responseData =
                response?.data?.data;

            const slotData = Array.isArray(
                responseData
            )
                ? responseData
                : Array.isArray(
                    responseData?.slots
                )
                    ? responseData.slots
                    : [];

            const availableSlots =
                slotData.filter((slot) => {
                    const booked = Number(
                        slot.bookedCount || 0
                    );

                    const capacity = Number(
                        slot.capacity || 0
                    );

                    return booked < capacity;
                });

            setSlots(availableSlots);

            setStep("slots");
        } catch (error) {
            console.error(
                "SLOTS ERROR:",
                error
            );

            setError(
                error?.response?.data?.message ||
                "Unable to load slots."
            );
        } finally {
            setLoadingSlots(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DATE CHANGE
    |--------------------------------------------------------------------------
    */

    const handleDateChange = (
        event
    ) => {
        const date =
            event.target.value;

        setSelectedDate(date);

        setSelectedSlot(null);

        setSlots([]);

        if (date) {
            fetchSlots(date);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | SELECT SLOT
    |--------------------------------------------------------------------------
    */

    const handleSelectSlot = (
        slot
    ) => {
        setSelectedSlot(slot);

        setError("");

        setStep("summary");
    };

    /*
    |--------------------------------------------------------------------------
    | CREATE BOOKING
    |--------------------------------------------------------------------------
    */

    const createBooking = async () => {
        if (
            !selectedService ||
            !selectedOffering ||
            !selectedDate ||
            !selectedSlot
        ) {
            setError(
                "Please select all booking details."
            );

            return;
        }

        try {
            setBookingLoading(true);

            setError("");

            /*
             * DO NOT send customer ID.
             *
             * Backend should get customer
             * from authenticate middleware.
             */

            const bookingPayload = {
                service:
                    selectedService._id,

                offering:
                    selectedOffering._id,

                slotKey:
                    selectedSlot.slotKey,

                startTime:
                    selectedSlot.startTime,

                endTime:
                    selectedSlot.endTime,

                paymentMode,

                notes: "",
            };

            const response =
                await api.post(
                    API.bookings,
                    bookingPayload
                );

            const booking =
                response?.data?.data;

            /*
             * PAY AFTER
             */

            if (
                paymentMode ===
                "PAY_AFTER"
            ) {
                setBookingSuccess({
                    type: "BOOKING",
                    booking,
                });

                return;
            }

            /*
             * PAY NOW
             */

            const idempotencyKey =
                `payment_${booking._id}_${Date.now()}`;

            const paymentResponse = await api.post(
                API.initiatePayment,
                {
                    booking: booking._id,
                    idempotencyKey,
                }
            );

            const payment =
                paymentResponse?.data?.data;

            setBookingSuccess({
                type: "PAYMENT",
                booking,
                payment,
            });
        } catch (error) {
            console.error(error);

            setError(
                error?.response?.data?.message ||
                "Unable to create booking."
            );
        } finally {
            setBookingLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | BACK
    |--------------------------------------------------------------------------
    */

    const goBack = () => {
        setError("");

        if (
            step === "offering"
        ) {
            setSelectedService(null);

            setOfferings([]);

            setStep("services");

            return;
        }

        if (step === "date") {
            setSelectedOffering(null);

            setSelectedDate("");

            setStep("offering");

            return;
        }

        if (step === "slots") {
            setSelectedSlot(null);

            setSlots([]);

            setStep("date");

            return;
        }

        if (
            step === "summary"
        ) {
            setSelectedSlot(null);

            setStep("slots");
        }
    };

    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    const resetBooking = () => {
        setSelectedService(null);

        setSelectedOffering(null);

        setSelectedDate("");

        setSelectedSlot(null);

        setOfferings([]);

        setSlots([]);

        setPaymentMode(
            "PAY_NOW"
        );

        setBookingSuccess(null);

        setError("");

        setStep("services");

        fetchServices();
    };

    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const filteredServices =
        services.filter(
            (service) => {
                const query =
                    search
                        .toLowerCase()
                        .trim();

                if (!query) {
                    return true;
                }

                return (
                    service.title
                        ?.toLowerCase()
                        .includes(query) ||
                    service.description
                        ?.toLowerCase()
                        .includes(query)
                );
            }
        );

    /*
    |--------------------------------------------------------------------------
    | SUCCESS SCREEN
    |--------------------------------------------------------------------------
    */

    if (bookingSuccess) {
        return (
            <div className="mx-auto max-w-3xl">
                <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center dark:border-[#303030] dark:bg-[#181818]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-[#303030]">
                        <CheckCircle2
                            size={32}
                            className="text-green-600 dark:text-green-400"
                        />
                    </div>

                    <h1 className="mt-5 text-2xl font-bold text-black dark:text-white">
                        {bookingSuccess.type ===
                            "PAYMENT"
                            ? "Booking created successfully"
                            : "Booking created successfully"}
                    </h1>

                    <p className="mt-2 text-sm text-black dark:text-white">
                        Your booking has been successfully created.
                    </p>

                    <div className="mx-auto mt-6 max-w-md rounded-xl border border-gray-100 p-5 text-left dark:border-[#303030]">
                        <div className="flex justify-between gap-4">
                            <span className="text-sm text-black dark:text-white">
                                Service
                            </span>

                            <span className="text-right text-sm font-medium text-black dark:text-white">
                                {selectedService?.title}
                            </span>
                        </div>

                        <div className="mt-3 flex justify-between gap-4">
                            <span className="text-sm text-black dark:text-white">
                                Offering
                            </span>

                            <span className="text-right text-sm font-medium text-black dark:text-white">
                                {selectedOffering?.name}
                            </span>
                        </div>

                        <div className="mt-3 flex justify-between gap-4">
                            <span className="text-sm text-black dark:text-white">
                                Date
                            </span>

                            <span className="text-right text-sm font-medium text-black dark:text-white">
                                {formatDate(
                                    selectedDate
                                )}
                            </span>
                        </div>

                        <div className="mt-3 flex justify-between gap-4">
                            <span className="text-sm text-black dark:text-white">
                                Time
                            </span>

                            <span className="text-right text-sm font-medium text-black dark:text-white">
                                {formatTime(
                                    selectedSlot?.startTime
                                )}{" "}
                                -{" "}
                                {formatTime(
                                    selectedSlot?.endTime
                                )}
                            </span>
                        </div>

                        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-[#303030]">
                            <div className="flex justify-between">
                                <span className="font-medium text-black dark:text-white">
                                    Total
                                </span>

                                <span className="font-bold text-black dark:text-white">
                                    {formatPrice(
                                        selectedOffering?.price,
                                        selectedOffering?.currency
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={
                            resetBooking
                        }
                        className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
                    >
                        Browse Services
                    </button>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | MAIN
    |--------------------------------------------------------------------------
    */

    return (
        <div className="mx-auto max-w-7xl">
            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h1 className="text-2xl font-bold text-black dark:text-white">
                        {step === "services" &&
                            "Find a Service"}

                        {step === "offering" &&
                            selectedService?.title}

                        {step === "date" &&
                            "Choose a Date"}

                        {step === "slots" &&
                            "Choose a Time"}

                        {step === "summary" &&
                            "Booking Summary"}
                    </h1>

                    <p className="mt-1 text-sm text-black dark:text-white">
                        {step ===
                            "services" &&
                            "Browse services and book a convenient time."}

                        {step ===
                            "offering" &&
                            "Choose the offering that works for you."}

                        {step === "date" &&
                            "Select the date for your appointment."}

                        {step === "slots" &&
                            "Select an available appointment slot."}

                        {step === "summary" &&
                            "Review your booking before confirming."}
                    </p>
                </div>

                {step !==
                    "services" && (
                        <button
                            type="button"
                            onClick={goBack}
                            className="flex items-center gap-2 text-sm font-medium text-black dark:text-white"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                    )}
            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-[#303030] dark:text-red-400">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* STEP INDICATOR */}

            {step !==
                "services" && (
                    <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
                        {[
                            ["offering", "Offering"],
                            ["date", "Date"],
                            ["slots", "Slot"],
                            ["summary", "Summary"],
                        ].map(
                            (
                                [key, label],
                                index
                            ) => {
                                const order = [
                                    "offering",
                                    "date",
                                    "slots",
                                    "summary",
                                ];

                                const current =
                                    order.indexOf(
                                        step
                                    );

                                const item =
                                    order.indexOf(
                                        key
                                    );

                                const active =
                                    current >= item;

                                return (
                                    <div
                                        key={key}
                                        className="flex shrink-0 items-center gap-2"
                                    >
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${active
                                                ? "bg-black text-white dark:bg-white dark:text-black"
                                                : "bg-gray-100 text-black dark:bg-[#303030] dark:text-white"
                                                }`}
                                        >
                                            {index + 1}
                                        </div>

                                        <span className="text-sm text-black dark:text-white">
                                            {label}
                                        </span>

                                        {index <
                                            3 && (
                                                <div className="mx-1 h-px w-6 bg-gray-100 dark:bg-[#303030]" />
                                            )}
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}

            {/* ================================================= */}
            {/* SERVICES */}
            {/* ================================================= */}

            {step ===
                "services" && (
                    <>
                        <div className="relative mt-6">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search services..."
                                className="w-full rounded-xl border border-gray-100 bg-white py-3.5 pl-11 pr-4 text-sm text-black outline-none dark:border-[#303030] dark:bg-[#181818] dark:text-white"
                            />
                        </div>

                        {loadingServices ? (
                            <div className="flex justify-center py-16">
                                <Loader2
                                    size={26}
                                    className="animate-spin text-black dark:text-white"
                                />
                            </div>
                        ) : filteredServices.length ===
                            0 ? (
                            <div className="mt-6 rounded-xl border border-gray-100 bg-white p-10 text-center dark:border-[#303030] dark:bg-[#181818]">
                                <p className="text-sm text-black dark:text-white">
                                    No published services found.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredServices.map(
                                    (service) => (
                                        <button
                                            type="button"
                                            key={service._id}
                                            onClick={() =>
                                                handleSelectService(
                                                    service
                                                )
                                            }
                                            className="overflow-hidden rounded-xl border border-gray-100 bg-white text-left transition hover:border-black dark:border-[#303030] dark:bg-[#181818] dark:hover:border-white"
                                        >
                                            {service.image ? (
                                                <img
                                                    src={
                                                        service.image
                                                    }
                                                    alt={
                                                        service.title
                                                    }
                                                    className="h-44 w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-44 items-center justify-center bg-gray-50 dark:bg-[#303030]">
                                                    <CalendarDays
                                                        size={34}
                                                        className="text-black dark:text-white"
                                                    />
                                                </div>
                                            )}

                                            <div className="p-5">
                                                <h2 className="font-semibold text-black dark:text-white">
                                                    {
                                                        service.title
                                                    }
                                                </h2>

                                                <p className="mt-2 line-clamp-2 text-sm text-black dark:text-white">
                                                    {
                                                        service.description
                                                    }
                                                </p>

                                                <p className="mt-4 text-sm font-medium text-black dark:text-white">
                                                    View offerings →
                                                </p>
                                            </div>
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </>
                )}

            {/* ================================================= */}
            {/* OFFERINGS */}
            {/* ================================================= */}

            {step ===
                "offering" && (
                    <div className="mt-6">
                        <div className="rounded-xl border border-gray-100 bg-white p-5 dark:border-[#303030] dark:bg-[#181818]">
                            <p className="text-xs text-black dark:text-white">
                                Service
                            </p>

                            <h2 className="mt-1 text-xl font-semibold text-black dark:text-white">
                                {selectedService?.title}
                            </h2>
                        </div>

                        {loadingOfferings ? (
                            <div className="flex justify-center py-16">
                                <Loader2
                                    size={26}
                                    className="animate-spin text-black dark:text-white"
                                />
                            </div>
                        ) : offerings.length ===
                            0 ? (
                            <div className="mt-5 rounded-xl border border-gray-100 bg-white p-10 text-center dark:border-[#303030] dark:bg-[#181818]">
                                <p className="text-sm text-black dark:text-white">
                                    No active offerings found for this service.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {offerings.map(
                                    (offering) => (
                                        <button
                                            type="button"
                                            key={
                                                offering._id
                                            }
                                            onClick={() =>
                                                handleSelectOffering(
                                                    offering
                                                )
                                            }
                                            className="rounded-xl border border-gray-100 bg-white p-5 text-left transition hover:border-black dark:border-[#303030] dark:bg-[#181818] dark:hover:border-white"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="font-semibold text-black dark:text-white">
                                                        {
                                                            offering.name
                                                        }
                                                    </h3>

                                                    <div className="mt-2 flex items-center gap-2 text-sm text-black dark:text-white">
                                                        <Clock3
                                                            size={15}
                                                        />

                                                        {
                                                            offering.durationMinutes
                                                        }{" "}
                                                        minutes
                                                    </div>
                                                </div>

                                                <span className="text-lg font-bold text-black dark:text-white">
                                                    {formatPrice(
                                                        offering.price,
                                                        offering.currency
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-5 text-sm font-medium text-black dark:text-white">
                                                Select →
                                            </div>
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}

            {/* ================================================= */}
            {/* DATE */}
            {/* ================================================= */}

            {step === "date" && (
                <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
                    <h2 className="text-lg font-semibold text-black dark:text-white">
                        Select Appointment Date
                    </h2>

                    <p className="mt-1 text-sm text-black dark:text-white">
                        {selectedOffering?.name}
                    </p>

                    <div className="mt-6 max-w-md">
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                            Date
                        </label>

                        <div className="relative">
                            <CalendarDays
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white"
                            />

                            <input
                                type="date"
                                value={
                                    selectedDate
                                }
                                min={
                                    new Date()
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={
                                    handleDateChange
                                }
                                className="w-full rounded-lg border border-gray-100 bg-white py-3 pl-10 pr-3 text-sm text-black dark:border-[#303030] dark:bg-[#181818] dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* SLOTS */}
            {/* ================================================= */}

            {step === "slots" && (
                <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
                    <div>
                        <p className="text-sm text-black dark:text-white">
                            {formatDate(
                                selectedDate
                            )}
                        </p>

                        <h2 className="mt-1 text-xl font-semibold text-black dark:text-white">
                            Available Slots
                        </h2>

                        <p className="mt-1 text-sm text-black dark:text-white">
                            {selectedOffering?.name}
                        </p>
                    </div>

                    {loadingSlots ? (
                        <div className="flex justify-center py-16">
                            <Loader2
                                size={26}
                                className="animate-spin text-black dark:text-white"
                            />
                        </div>
                    ) : slots.length ===
                        0 ? (
                        <div className="mt-6 rounded-lg border border-gray-100 p-8 text-center dark:border-[#303030]">
                            <p className="text-sm text-black dark:text-white">
                                No available slots for this date.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {slots.map(
                                (slot) => (
                                    <button
                                        type="button"
                                        key={
                                            slot.slotKey
                                        }
                                        onClick={() =>
                                            handleSelectSlot(
                                                slot
                                            )
                                        }
                                        className="rounded-lg border border-gray-100 p-4 text-left transition hover:border-black dark:border-[#303030] dark:hover:border-white"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock3
                                                size={17}
                                                className="text-black dark:text-white"
                                            />

                                            <span className="font-medium text-black dark:text-white">
                                                {formatTime(
                                                    slot.startTime
                                                )}{" "}
                                                -{" "}
                                                {formatTime(
                                                    slot.endTime
                                                )}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xs text-black dark:text-white">
                                            {Number(
                                                slot.capacity ||
                                                0
                                            ) -
                                                Number(
                                                    slot.bookedCount ||
                                                    0
                                                )}{" "}
                                            spots available
                                        </p>
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ================================================= */}
            {/* SUMMARY */}
            {/* ================================================= */}

            {step ===
                "summary" && (
                    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
                        {/* DETAILS */}

                        <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
                            <h2 className="text-lg font-semibold text-black dark:text-white">
                                Booking Summary
                            </h2>

                            <div className="mt-6 space-y-5">
                                <div>
                                    <p className="text-xs text-black dark:text-white">
                                        Service
                                    </p>

                                    <p className="mt-1 font-medium text-black dark:text-white">
                                        {selectedService?.title}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-black dark:text-white">
                                        Offering
                                    </p>

                                    <p className="mt-1 font-medium text-black dark:text-white">
                                        {selectedOffering?.name}
                                    </p>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-black dark:text-white">
                                            Date
                                        </p>

                                        <p className="mt-1 font-medium text-black dark:text-white">
                                            {formatDate(
                                                selectedDate
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-black dark:text-white">
                                            Time
                                        </p>

                                        <p className="mt-1 font-medium text-black dark:text-white">
                                            {formatTime(
                                                selectedSlot?.startTime
                                            )}{" "}
                                            -{" "}
                                            {formatTime(
                                                selectedSlot?.endTime
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PAYMENT */}

                        <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
                            <h2 className="text-lg font-semibold text-black dark:text-white">
                                Payment
                            </h2>

                            <div className="mt-5 space-y-3">
                                {/* PAY NOW */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPaymentMode(
                                            "PAY_NOW"
                                        )
                                    }
                                    className={`w-full rounded-lg border p-4 text-left ${paymentMode ===
                                        "PAY_NOW"
                                        ? "border-black dark:border-white"
                                        : "border-gray-100 dark:border-[#303030]"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard
                                            size={19}
                                            className="text-black dark:text-white"
                                        />

                                        <div>
                                            <p className="font-medium text-black dark:text-white">
                                                Pay Now
                                            </p>

                                            <p className="mt-1 text-xs text-black dark:text-white">
                                                Pay for your booking immediately.
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                {/* PAY AFTER */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPaymentMode(
                                            "PAY_AFTER"
                                        )
                                    }
                                    className={`w-full rounded-lg border p-4 text-left ${paymentMode ===
                                        "PAY_AFTER"
                                        ? "border-black dark:border-white"
                                        : "border-gray-100 dark:border-[#303030]"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Banknote
                                            size={19}
                                            className="text-black dark:text-white"
                                        />

                                        <div>
                                            <p className="font-medium text-black dark:text-white">
                                                Pay After
                                            </p>

                                            <p className="mt-1 text-xs text-black dark:text-white">
                                                Pay after the service.
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* TOTAL */}

                            <div className="mt-6 border-t border-gray-100 pt-5 dark:border-[#303030]">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-black dark:text-white">
                                        Total
                                    </span>

                                    <span className="text-xl font-bold text-black dark:text-white">
                                        {formatPrice(
                                            selectedOffering?.price,
                                            selectedOffering?.currency
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* BOOK */}

                            <button
                                type="button"
                                onClick={
                                    createBooking
                                }
                                disabled={
                                    bookingLoading
                                }
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                            >
                                {bookingLoading && (
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />
                                )}

                                {bookingLoading
                                    ? "Processing..."
                                    : paymentMode ===
                                        "PAY_NOW"
                                        ? "Pay & Book"
                                        : "Confirm Booking"}
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default CustomerDashboard;