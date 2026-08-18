import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import api from "../lib/api";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name ||
      !form.email ||
      !form.password
    ) {
      setError(
        "Please fill all the required fields."
      );
      return;
    }


    try {
      setLoading(true);

      const response = await api.post(
        "/auth/register/customer",
        {
          name: form.name,
          email: form.email
            
            .toLowerCase(),
          mobile: form.mobile,
          password: form.password,
        }
      );

      setSuccess(
        response?.data?.message ||
          "Account created successfully."
      );

      setForm({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-black">
      <div className="w-full max-w-md">
        {/* HEADER */}

        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-black dark:text-white">
            Create your customer account to book services.
          </p>
        </div>

        {/* CARD */}

        <div className="mt-8 rounded-2xl bg-gray-50 p-6 dark:bg-[#303030]">
          {error && (
            <div className="mb-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-lg bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black dark:bg-[#181818] dark:text-white dark:placeholder:text-white"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full rounded-lg bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black dark:bg-[#181818] dark:text-white dark:placeholder:text-white"
              />
            </div>

          

            {/* PASSWORD */}

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full rounded-lg bg-white px-4 py-3 pr-12 text-sm text-black outline-none placeholder:text-black dark:bg-[#181818] dark:text-white dark:placeholder:text-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
            >
              {loading ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* LOGIN */}

          <p className="mt-6 text-center text-sm text-black dark:text-white">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;