import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Clock3,
  IndianRupee,
  Package,
} from "lucide-react";

import api from "../../lib/api";

const Offerings = () => {
  const [offerings, setOfferings] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState(null);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    service: "",
    name: "",
    durationMinutes: "",
    price: "",
    currency: "INR",
  });

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/offerings");

      setOfferings(response?.data?.data || []);
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to load offerings"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get("/services");

      setServices(response?.data?.data || []);
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to load services"
      );
    }
  };

  useEffect(() => {
    fetchOfferings();
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingOffering(null);

    setForm({
      service: "",
      name: "",
      durationMinutes: "",
      price: "",
      currency: "INR",
    });

    setError("");
    setModalOpen(true);
  };

  const openEditModal = (offering) => {
    setEditingOffering(offering);

    setForm({
      service:
        offering.service?._id ||
        offering.service ||
        "",
      name: offering.name || "",
      durationMinutes:
        offering.durationMinutes || "",
      price: offering.price || "",
      currency: offering.currency || "INR",
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingOffering(null);

    setForm({
      service: "",
      name: "",
      durationMinutes: "",
      price: "",
      currency: "INR",
    });

    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.service) {
      setError("Please select a service");
      return;
    }

    if (!form.name.trim()) {
      setError("Offering name is required");
      return;
    }

    if (!form.durationMinutes) {
      setError("Duration is required");
      return;
    }

    if (Number(form.durationMinutes) < 1) {
      setError("Duration must be at least 1 minute");
      return;
    }

    if (form.price === "") {
      setError("Price is required");
      return;
    }

    if (Number(form.price) < 0) {
      setError("Price cannot be negative");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        service: form.service,
        name: form.name.trim(),
        durationMinutes: Number(
          form.durationMinutes
        ),
        price: Number(form.price),
        currency: form.currency,
      };

      if (editingOffering) {
        await api.patch(
          `/offerings/${editingOffering._id}`,
          payload
        );
      } else {
        await api.post("/offerings", payload);
      }

      closeModal();

      await fetchOfferings();
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to save offering"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this offering?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      await api.delete(`/offerings/${id}`);

      setOfferings((current) =>
        current.filter(
          (offering) => offering._id !== id
        )
      );
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to delete offering"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (offering) => {
    try {
      setActionLoading(offering._id);
      setError("");

      await api.patch(
        `/offerings/${offering._id}`,
        {
          isActive: !offering.isActive,
        }
      );

      await fetchOfferings();
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to update offering"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Offerings
          </h1>

          <p className="mt-1 text-sm text-black dark:text-white">
            Manage the different packages and pricing you
            offer for your services.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          <Plus size={17} />
          Create Offering
        </button>
      </div>

      {/* Error */}
      {error && !modalOpen && (
        <div className="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-black dark:bg-[#303030] dark:text-white">
          {error}
        </div>
      )}

      {/* Offerings */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center dark:border-[#303030] dark:bg-[#181818]">
            <p className="text-sm text-black dark:text-white">
              Loading offerings...
            </p>
          </div>
        ) : offerings.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center dark:border-[#303030] dark:bg-[#181818]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-[#303030]">
              <Package
                size={25}
                className="text-black dark:text-white"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-black dark:text-white">
              No offerings yet
            </h2>

            <p className="mt-2 text-sm text-black dark:text-white">
              Create an offering for one of your services.
            </p>

            <button
              onClick={openCreateModal}
              className="mt-5 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Create Offering
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {offerings.map((offering) => (
              <div
                key={offering._id}
                className="rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-black dark:text-white">
                      {offering.name}
                    </h2>

                    <p className="mt-1 truncate text-sm text-black dark:text-white">
                      {offering.service?.title ||
                        "Service"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      offering.isActive
                        ? "bg-green-50 text-green-700 dark:bg-[#303030] dark:text-green-400"
                        : "bg-gray-100 text-black dark:bg-[#303030] dark:text-white"
                    }`}
                  >
                    {offering.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {/* Price */}
                <div className="mt-6">
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {offering.currency === "INR"
                      ? "₹"
                      : offering.currency}{" "}
                    {offering.price}
                  </p>
                </div>

                {/* Duration */}
                <div className="mt-4 flex items-center gap-2">
                  <Clock3
                    size={17}
                    className="text-black dark:text-white"
                  />

                  <span className="text-sm text-black dark:text-white">
                    {offering.durationMinutes} minutes
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-2 border-t border-gray-100 pt-5 dark:border-[#303030]">
                  <button
                    onClick={() =>
                      openEditModal(offering)
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-medium text-black dark:border-[#303030] dark:text-white"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleToggleActive(offering)
                    }
                    disabled={
                      actionLoading === offering._id
                    }
                    className="rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-medium text-black disabled:opacity-50 dark:border-[#303030] dark:text-white"
                  >
                    {offering.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(offering._id)
                    }
                    disabled={
                      actionLoading === offering._id
                    }
                    className="flex items-center justify-center rounded-lg border border-gray-100 px-3 py-2.5 text-black disabled:opacity-50 dark:border-[#303030] dark:text-white"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white">
                  {editingOffering
                    ? "Edit Offering"
                    : "Create Offering"}
                </h2>

                <p className="mt-1 text-sm text-black dark:text-white">
                  {editingOffering
                    ? "Update your offering details."
                    : "Create a package for one of your services."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#303030]"
              >
                <X
                  size={18}
                  className="text-black dark:text-white"
                />
              </button>
            </div>

            {/* Modal Error */}
            {error && (
              <div className="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-black dark:bg-[#303030] dark:text-white">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              {/* Service */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Service
                </label>

                <select
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:focus:border-white"
                >
                  <option value="">
                    Select service
                  </option>

                  {services.map((service) => (
                    <option
                      key={service._id}
                      value={service._id}
                    >
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Offering Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Offering Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Basic AC Repair"
                  className="w-full rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:placeholder:text-gray-400 dark:focus:border-white"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Duration
                </label>

                <div className="relative">
                  <Clock3
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white"
                  />

                  <input
                    type="number"
                    name="durationMinutes"
                    min="1"
                    value={form.durationMinutes}
                    onChange={handleChange}
                    placeholder="60"
                    className="w-full rounded-lg border border-gray-100 bg-white py-3 pl-11 pr-20 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:placeholder:text-gray-400 dark:focus:border-white"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-black dark:text-white">
                    minutes
                  </span>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Price
                </label>

                <div className="relative">
                  <IndianRupee
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white"
                  />

                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="800"
                    className="w-full rounded-lg border border-gray-100 bg-white py-3 pl-11 pr-4 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:placeholder:text-gray-400 dark:focus:border-white"
                  />
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Currency
                </label>

                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:focus:border-white"
                >
                  <option value="INR">INR</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-black dark:border-[#303030] dark:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {saving
                    ? "Saving..."
                    : editingOffering
                    ? "Update Offering"
                    : "Create Offering"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offerings;