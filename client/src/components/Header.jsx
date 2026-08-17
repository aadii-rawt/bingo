import {
  Bell,
  Menu,
  LogOut,
  UserCircle,
} from "lucide-react";

const Header = ({
  user,
  onMenuClick,
  onLogout,
}) => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-5 dark:border-[#303030] dark:bg-[#181818]">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-[#303030] lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block">
        <h2 className="text-sm font-medium text-black dark:text-white">
          Welcome back
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-[#303030]">
          <Bell size={19} />
        </button>

        <div className="flex items-center gap-3 border-l border-gray-100 pl-3 dark:border-[#303030]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-medium text-white dark:bg-white dark:text-black">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-black dark:text-white">
              {user?.name || "User"}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-100">
              {user?.role || "Customer"}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="ml-2 rounded-lg p-2 text-gray-500 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-[#303030]"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;