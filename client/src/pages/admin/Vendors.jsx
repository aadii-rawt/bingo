import { useEffect, useState } from "react";
import {
    Check,
    X,
    Mail,
    Phone,
    Building2,
    User,
} from "lucide-react";

import api from "../../lib/api";

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    const fetchPendingVendors = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("vendors/pending");

            setVendors(response?.data?.data || []);
        } catch (error) {
            setError(
                error?.response?.data?.message ||
                "Unable to load pending vendors"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingVendors();
    }, []);

    const handleApprove = async (status, id) => {
        try {
            setActionLoading(id);
            setError("");

            await api.patch(`/vendors/${id}/status`, {
                status,
            });

            setVendors((current) =>
                current.filter((vendor) => vendor._id !== id)
            );
        } catch (error) {
            setError(
                error?.response?.data?.message ||
                "Unable to approve vendor"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (status, id) => {
        const reason = window.prompt(
            "Enter rejection reason"
        );

        if (reason === null) {
            return;
        }

        try {
            setActionLoading(id);
            setError("");

            await api.patch(`/vendors/${id}/status`, {
                status,
                reason,
            });

            setVendors((current) =>
                current.filter((vendor) => vendor._id !== id)
            );
        } catch (error) {
            setError(
                error?.response?.data?.message ||
                "Unable to reject vendor"
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
                        Vendors
                    </h1>

                    <p className="mt-1 text-sm text-black dark:text-white">
                        Review and manage vendor applications.
                    </p>
                </div>

                <div className="rounded-lg bg-gray-100 px-4 py-2 dark:bg-[#303030]">
                    <span className="text-sm text-black dark:text-white">
                        Pending: {vendors.length}
                    </span>
                </div>
            </div>

            {error && (
                <div className="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-black dark:bg-[#303030] dark:text-white">
                    {error}
                </div>
            )}

            <div className="mt-6">
                {loading ? (
                    <div className="rounded-xl border border-gray-100 bg-white p-8 text-center dark:border-[#303030] dark:bg-[#181818]">
                        <p className="text-sm text-black dark:text-white">
                            Loading pending vendors...
                        </p>
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="rounded-xl border border-gray-100 bg-white p-10 text-center dark:border-[#303030] dark:bg-[#181818]">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-[#303030]">
                            <Check
                                size={25}
                                className="text-black dark:text-white"
                            />
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-black dark:text-white">
                            No pending vendors
                        </h2>

                        <p className="mt-2 text-sm text-black dark:text-white">
                            There are currently no vendor applications
                            waiting for approval.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {vendors.map((vendor) => (
                            <div
                                key={vendor._id}
                                className="rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center justify-between w-full gap-4">
                                        <div className="flex items-center gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-[#303030]">
                                                <User
                                                    size={21}
                                                    className="text-black dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <h2 className="font-semibold text-black dark:text-white">
                                                    {vendor.name ||
                                                        vendor.user?.name ||
                                                        "Unknown Vendor"}
                                                </h2>
                                            </div>

                                        </div>
                                        <span className="mt-1 text-amber-500 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs  dark:bg-[#303030]">
                                            PENDING
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail
                                            size={17}
                                            className="text-black dark:text-white"
                                        />

                                        <span className="text-sm text-black dark:text-white">
                                            {vendor.email ||
                                                vendor.user?.email ||
                                                "No email"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Phone
                                            size={17}
                                            className="text-black dark:text-white"
                                        />

                                        <span className="text-sm text-black dark:text-white">
                                            {vendor.contact?.phone ||
                                                "No mobile"}
                                        </span>
                                    </div>

                                    {(vendor.businessName ||
                                        vendor.business?.name) && (
                                            <div className="flex items-center gap-3">
                                                <Building2
                                                    size={17}
                                                    className="text-black dark:text-white"
                                                />

                                                <span className="text-sm text-black dark:text-white">
                                                    {vendor.businessName ||
                                                        vendor.business?.name}
                                                </span>
                                            </div>
                                        )}
                                </div>

                                <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5 dark:border-[#303030]">
                                    <button
                                        disabled={
                                            actionLoading === vendor._id
                                        }
                                        onClick={() =>
                                            handleApprove("APPROVED", vendor._id)
                                        }
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                                    >
                                        <Check size={17} />

                                        {actionLoading === vendor._id
                                            ? "Processing..."
                                            : "Approve"}
                                    </button>

                                    <button
                                        disabled={
                                            actionLoading === vendor._id
                                        }
                                        onClick={() =>
                                            handleReject("REJECTED", vendor._id)
                                        }
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-100 px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50 dark:border-[#303030] dark:text-white"
                                    >
                                        <X size={17} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Vendors;