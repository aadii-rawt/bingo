import {
  Clock3,
  ShieldCheck,
  LogOut,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const VendorPending = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const status = location.state?.status;
  const rejectionReason =
    location.state?.rejectionReason;

  const isRejected = status === "REJECTED";

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black dark:bg-[#181818] dark:text-white">
      <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-5 dark:border-[#303030] dark:bg-[#181818]">
        <h1 className="text-xl font-bold text-black dark:text-white">
          Bookly
        </h1>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-gray-100 px-4 py-2 text-sm text-black hover:bg-gray-50 dark:border-[#303030] dark:text-white dark:hover:bg-[#303030]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-[#303030] dark:bg-[#181818]">
            {isRejected ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-[#303030]">
                  <XCircle
                    size={30}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-black dark:text-white">
                  Your account was rejected
                </h2>

                <p className="mt-3 text-sm leading-6 text-black dark:text-white">
                  Unfortunately, your vendor application was
                  not approved by our admin team.
                </p>

                <div className="mt-7 rounded-xl border border-red-100 bg-red-50 p-5 text-left dark:border-[#303030] dark:bg-[#303030]">
                  <div className="flex gap-3">
                    <XCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                    />

                    <div>
                      <h3 className="text-sm font-semibold text-black dark:text-white">
                        Rejection reason
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-black dark:text-white">
                        {rejectionReason ||
                          "No rejection reason was provided."}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="mt-7 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
                >
                  Back to Login
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 dark:bg-[#303030]">
                  <Clock3
                    size={30}
                    className="text-yellow-600 dark:text-yellow-400"
                  />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-black dark:text-white">
                  Your account is under review
                </h2>

                <p className="mt-3 text-sm leading-6 text-black dark:text-white">
                  Thanks for registering as a vendor on Bookly.
                  Your account has been created successfully
                  and is currently waiting for approval from our
                  admin team.
                </p>

                <div className="mt-7 rounded-xl border border-yellow-100 bg-yellow-50 p-5 text-left dark:border-[#303030] dark:bg-[#303030]">
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={20}
                      className="mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-400"
                    />

                    <div>
                      <h3 className="text-sm font-semibold text-black dark:text-white">
                        What happens next?
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-black dark:text-white">
                        An administrator will review your vendor
                        account. Once your account is approved,
                        you'll be able to access your vendor
                        dashboard and start managing your services.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="mt-7 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorPending;