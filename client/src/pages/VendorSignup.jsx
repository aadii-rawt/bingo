import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

const VendorSignup = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        address : "",
        businessName: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await api.post("/auth/register/vendor", form);

            setSuccess(
                "Account created successfully. Your account is waiting for admin approval."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            setError(
                error?.response?.data?.message ||
                "Unable to create vendor account"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-5 py-10 dark:bg-[#181818]">
            <div className="mx-auto max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white dark:text-white">
                        Become a Vendor
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Create your vendor account and start offering
                        services.
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-7 dark:border-[#303030] dark:bg-[#181818]">
                    {error && (
                        <div className="mb-5 rounded-lg text-red-500  bg-gray-100 px-4 py-3 text-sm dark:bg-[#303030]">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 rounded-lg text-green-500 bg-gray-100 px-4 py-3 text-sm dark:bg-[#303030]">
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white dark:text-white">
                                Name
                            </label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full rounded-lg border text-white dark:text-white border-gray-100 bg-white px-4 py-3 text-sm outline-none focus:border-white dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white dark:text-white">
                                Business Name
                            </label>

                            <input
                                name="businessName"
                                value={form.businessName}
                                onChange={handleChange}
                                className="w-full rounded-lg text-white dark:text-white border border-gray-100 bg-white px-4 py-3 text-sm outline-none focus:border-white dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white dark:text-white">
                                Email
                            </label>

                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full rounded-lg text-white dark:text-white border border-gray-100 bg-white px-4 py-3 text-sm outline-none focus:border-white dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white dark:text-white">
                                Phone
                            </label>

                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                maxLength={10}
                                className="w-full rounded-lg text-white dark:text-white border border-gray-100 bg-white px-4 py-3 text-sm outline-none focus:border-white dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white dark:text-white">
                                Address
                            </label>

                            <input
                                name="address"
                                value={form.addresss}
                                onChange={handleChange}
                                type="text"
                                className="w-full rounded-lg text-white dark:text-white border border-gray-100 bg-white px-4 py-3 text-sm outline-none focus:border-white dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white dark:text-white">
                                Document
                            </label>

                            <input
                                name="address"
                                type="file"
                                className="w-full rounded-lg text-white dark:text-white border border-gray-100 bg-white px-4 py-3 text-sm outline-none focus:border-white dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white dark:text-white">
                                Password
                            </label>

                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full rounded-lg text-white dark:text-white border border-gray-100 bg-white px-4 py-3 text-sm outline-none focus:border-white dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full rounded-lg bg-black py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                        >
                            {loading
                                ? "Creating account..."
                                : "Create Vendor Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-black dark:text-white"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorSignup;