import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  User,
  ShieldCheck,
} from "lucide-react";

import api from "../../lib/api";

const ApprovedVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApprovedVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/vendors");

      setVendors(response?.data?.data || []);
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to load approved vendors"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedVendors();
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Approved Vendors
          </h1>

          <p className="mt-1 text-sm text-black dark:text-white">
            View all vendors currently approved on the platform.
          </p>
        </div>

        <div className="rounded-lg bg-gray-100 px-4 py-2 dark:bg-[#303030]">
          <span className="text-sm text-black dark:text-white">
            Total: {vendors.length}
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-black dark:bg-[#303030] dark:text-white">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center dark:border-[#303030] dark:bg-[#181818]">
            <p className="text-sm text-black dark:text-white">
              Loading approved vendors...
            </p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center dark:border-[#303030] dark:bg-[#181818]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-[#303030]">
              <User
                size={25}
                className="text-black dark:text-white"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-black dark:text-white">
              No approved vendors
            </h2>

            <p className="mt-2 text-sm text-black dark:text-white">
              There are currently no approved vendors.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {vendors.map((vendor) => (
              <div
                key={vendor._id}
                className="rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-[#303030]">
                      <User
                        size={21}
                        className="text-black dark:text-white"
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold text-black dark:text-white">
                        {vendor.name ||
                          vendor.user?.name ||
                          "Unknown Vendor"}
                      </h2>

                      <div className="mt-1 flex items-center gap-2">
                        <ShieldCheck
                          size={14}
                          className="text-black dark:text-white"
                        />

                        <span className="text-xs text-black dark:text-white">
                          APPROVED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail
                      size={17}
                      className="text-black dark:text-white"
                    />

                    <span className="text-sm text-black dark:text-white">
                      {vendor.email ||
                        vendor.user?.email ||
                        "No email"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone
                      size={17}
                      className="text-black dark:text-white"
                    />

                    <span className="text-sm text-black dark:text-white">
                      {vendor.contact?.phone ||
                        "No mobile"}
                    </span>
                  </div>

                  {(vendor.businessName ||
                    vendor.business?.name) && (
                    <div className="flex items-center gap-3">
                      <Building2
                        size={17}
                        className="text-black dark:text-white"
                      />

                      <span className="text-sm text-black dark:text-white">
                        {vendor.businessName ||
                          vendor.business?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedVendors;