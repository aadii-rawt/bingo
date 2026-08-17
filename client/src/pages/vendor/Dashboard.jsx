import StatCard from "../../components/StatCard";

const Dashboard = () => {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your services, availability and bookings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Services"
          value="12"
          description="Active services"
        />

        <StatCard
          title="Offerings"
          value="18"
          description="Active offerings"
        />

        <StatCard
          title="Bookings"
          value="28"
          description="Total bookings"
        />

        <StatCard
          title="Pending"
          value="4"
          description="Need your attention"
        />
      </div>

      <div className="mt-7 rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              Recent Bookings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest customer bookings.
            </p>
          </div>

          <button className="text-sm font-medium">
            View all
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#303030]">
                <th className="pb-3 font-medium">
                  Customer
                </th>
                <th className="pb-3 font-medium">
                  Service
                </th>
                <th className="pb-3 font-medium">
                  Date
                </th>
                <th className="pb-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-gray-100 dark:border-[#303030]">
                <td className="py-4">John Doe</td>
                <td className="py-4">AC Repair</td>
                <td className="py-4">24 Aug</td>
                <td className="py-4">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-[#303030]">
                    Pending
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4">Rahul Sharma</td>
                <td className="py-4">Cleaning</td>
                <td className="py-4">25 Aug</td>
                <td className="py-4">
                  <span className="rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black">
                    Confirmed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;