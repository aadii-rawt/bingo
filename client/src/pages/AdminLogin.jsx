import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../lib/api";

const AdminLogin = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const { data } = await api.post(
                "/auth/login",
                form
            );

            const role = data?.data?.user?.role;
            const accessToken = data?.data?.accessToken;

            localStorage.setItem(
                "accessToken",
                accessToken
            );

            if (role !== "ADMIN") {
                setError("You don't have admin access");
                return;
            }

            navigate("/admin/dashboard");
        } catch (error) {
            setError(
                error?.response?.data?.message ||
                "Unable to login"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-[#181818]">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
                        B
                    </div>

                    <h1 className="mt-5 text-2xl font-bold text-black dark:text-white">
                        Admin Portal
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to manage the marketplace.
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-7 dark:border-[#303030] dark:bg-[#181818]">
                    {error && (
                        <div className="mb-5 rounded-lg bg-gray-100 px-4 py-3 text-sm dark:bg-[#303030]">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Admin Email
                            </label>

                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        email: e.target.value,
                                    })
                                }
                                className="w-full text-black dark:text-white rounded-lg border border-gray-100 bg-white px-4 py-3 outline-none focus:border-white    dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Password
                            </label>

                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border text-black dark:text-white border-gray-100 bg-white px-4 py-3 outline-none focus:border-white    dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full rounded-lg bg-black py-3 font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                        >
                            {loading
                                ? "Signing in..."
                                : "Admin Sign in"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;