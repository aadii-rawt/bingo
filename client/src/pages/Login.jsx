import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../lib/api";

const Login = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

            const { data } = await api.post(
                "/auth/login",
                form
            );

            const user = data?.data?.user;
            const accessToken = data?.data?.accessToken;
            console.log(user);
            

            localStorage.setItem(
                "accessToken",
                accessToken
            );

            if (!user) {
                throw new Error("Invalid login response");
            }

            if (user.role === "VENDOR") {
                console.log("this is vendor");
                
                if (
                    user.status === "PENDING" ||
                    user.status === "REJECTED"
                ) {
                    navigate("/vendor/pending", {
                        state: {
                            status: user.status,
                            rejectionReason: user.rejectionReason || "",
                        },
                    });

                    return;
                }

                if (user.status === "ACTIVE") {
                    navigate("/vendor/dashboard");
                    return;
                }
            }

            if (user.role === "ADMIN") {
                navigate("/admin/dashboard");
                return;
            }

            navigate("/user/dashboard");
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
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#181818]">
            <div className="hidden w-1/2 items-center justify-center bg-black p-12 text-white lg:flex dark:bg-[#303030]">
                <div className="max-w-md">
                    <p className="text-sm text-gray-100">
                        BOOKLY
                    </p>

                    <h1 className="mt-4 text-5xl font-bold">
                        Find the right service for your needs.
                    </h1>

                    <p className="mt-5 text-gray-100">
                        Discover trusted professionals, compare
                        services and book your preferred time slot.
                    </p>
                </div>
            </div>

            <div className="flex flex-1 items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-black dark:text-white">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Login to your account.
                        </p>
                    </div>

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
                                Email
                            </label>

                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full rounded-lg text-black dark:text-white border border-gray-100 bg-white px-4 py-3 text-sm outline-none focus:border-white dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                Password
                            </label>

                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full rounded-lg text-black dark:text-white border border-gray-100 bg-white px-4 py-3 text-sm outline-none focus:border-white dark:border-[#303030] dark:bg-[#181818]"
                                required
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full rounded-lg bg-black py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-medium text-black dark:text-white"
                        >
                            Create account
                        </Link>
                    </div>


                    <div className="mt-8 border-t border-gray-100 pt-6 text-center dark:border-[#303030] flex gap-5">

                        <Link to="/vendor/signup" className="text-xs text-gray-500 hover:text-black dark:hover:text-white">
                            Become a Vendor
                        </Link>
                        <Link
                            to="/admin/login"
                            className="text-xs text-gray-500 hover:text-black dark:hover:text-white"
                        >
                            Admin Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;