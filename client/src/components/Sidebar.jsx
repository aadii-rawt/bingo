import {
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  User,
  Briefcase,
  Package,
  Clock3,
  Users,
  FolderTree,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const icons = {
  dashboard: LayoutDashboard,
  bookings: CalendarDays,
  payments: CreditCard,
  profile: User,
  services: Briefcase,
  offerings: Package,
  availability: Clock3,
  vendors: Users,
  categories: FolderTree,
};

const Sidebar = ({
  title,
  links,
  open,
  onClose,
}) => {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 bg-white transition-transform duration-200 dark:border-[#303030] dark:bg-[#181818] ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5 dark:border-[#303030]">
          <div>
            <h1 className="text-xl font-bold text-black dark:text-white italic ">
              BINGO
            </h1>

            <p className="text-xs text-gray-500 dark:text-gray-100">
              {title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-[#303030] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const Icon = icons[link.icon];

            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path.endsWith("/dashboard")}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-gray-500 hover:bg-gray-50 hover:text-black dark:text-gray-100 dark:hover:bg-[#303030] dark:hover:text-white"
                  }`
                }
              >
                <Icon size={18} />

                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4 dark:border-[#303030] text-xs">
          <p>Build with 🤍 by <a href="https://aadii.site/" className="underline"> aadii rawt</a></p>
          </div>
      </aside>
    </>
  );
};

export default Sidebar;