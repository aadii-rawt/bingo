const StatCard = ({ title, value, description }) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 dark:border-[#303030] dark:bg-[#181818]">
      <p className="text-sm text-gray-500 dark:text-gray-100">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-bold text-black dark:text-white">
        {value}
      </h3>

      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-100">
          {description}
        </p>
      )}
    </div>
  );
};

export default StatCard;