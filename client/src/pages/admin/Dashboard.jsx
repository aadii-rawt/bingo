import StatCard from "../../components/StatCard";

const Dashboard = () => {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your marketplace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Vendors"
          value="48"
          description="Registered vendors"
        />

        <StatCard
          title="Total Services"
          value="126"
          description="Services on platform"
        />

        <StatCard
          title="Total Bookings"
          value="842"
          description="All bookings"
        />

        <StatCard
          title="Pending Vendors"
          value="7"
          description="Waiting for approval"
        />
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
          <h2 className="font-semibold">
            Pending Vendor Approvals
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Vendors waiting for verification.
          </p>

          <div className="mt-5 flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-[#303030]">
            <div>
              <p className="font-medium">
                7 vendors
              </p>

              <p className="text-xs text-gray-500">
                Need review
              </p>
            </div>

            <button className="rounded-lg bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
              Review
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
          <h2 className="font-semibold">
            Recent Activity
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">
                New vendor registered
              </span>

              <span className="text-xs text-gray-500">
                10 min ago
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm">
                New service created
              </span>

              <span className="text-xs text-gray-500">
                25 min ago
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm">
                Booking completed
              </span>

              <span className="text-xs text-gray-500">
                1 hour ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;