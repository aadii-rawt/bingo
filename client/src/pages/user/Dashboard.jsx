import {
  Search,
  ArrowRight,
  Star,
} from "lucide-react";

const services = [
  {
    id: 1,
    title: "AC Repair",
    category: "Home Repair",
    price: "₹999",
  },
  {
    id: 2,
    title: "Home Cleaning",
    category: "Cleaning",
    price: "₹499",
  },
  {
    id: 3,
    title: "Plumbing Service",
    category: "Plumbing",
    price: "₹799",
  },
  {
    id: 4,
    title: "Electrician",
    category: "Electrical",
    price: "₹599",
  },
];

const Dashboard = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-2xl bg-black px-6 py-10 text-white dark:bg-[#303030] md:px-10">
        <div className="max-w-2xl">
          <p className="text-sm text-gray-100">
            Find trusted professionals
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            What service do you need today?
          </h1>

          <p className="mt-3 text-sm text-gray-100">
            Discover services, choose a time slot and book
            professionals near you.
          </p>

          <div className="mt-7 flex max-w-xl items-center gap-3 rounded-xl bg-white p-2">
            <Search
              size={20}
              className="ml-2 text-gray-500"
            />

            <input
              type="text"
              placeholder="Search for a service..."
              className="flex-1 bg-transparent px-2 py-3 text-sm text-black outline-none"
            />

            <button className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white">
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Popular Services
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Services people are booking right now.
            </p>
          </div>

          <button className="flex items-center gap-1 text-sm font-medium">
            View all
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-[#303030] dark:bg-[#181818]"
            >
              <div className="flex h-40 items-center justify-center bg-gray-100 dark:bg-[#303030]">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZUS9xWEp0su_m7foqj5vW1tUe73KWkwC8jOYlYon5SseZ2ciRoPTB-3M6&s=10" alt="" />
              </div>

              <div className="p-4">
                <p className="text-xs text-gray-500 dark:text-gray-100">
                  {service.category}
                </p>

                <h3 className="mt-1 font-semibold">
                  {service.title}
                </h3>

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">
                    {service.price}
                  </span>

                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Star
                      size={14}
                      fill="currentColor"
                    />
                    4.8
                  </span>
                </div>

                <button className="mt-4 w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black">
                  View Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;