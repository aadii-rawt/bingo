import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Wrench,
  Ban,
} from "lucide-react";

import api from "../../lib/api";

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    status: "DRAFT",
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/services");

      setServices(response?.data?.data || []);
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to load services"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      setCategories(response?.data?.data || []);
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to load categories"
      );
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);

    setForm({
      title: "",
      description: "",
      category: "",
      status: "DRAFT",
    });

    setError("");
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);

    setForm({
      title: service.title || "",
      description: service.description || "",
      category:
        service.category?._id ||
        service.category ||
        "",
      status: service.status || "DRAFT",
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingService(null);

    setForm({
      title: "",
      description: "",
      category: "",
      status: "DRAFT",
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

    if (!form.title.trim()) {
      setError("Service title is required");
      return;
    }

    if (!form.category) {
      setError("Please select a category");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        status: form.status,
      };

      if (editingService) {
        await api.patch(
          `/services/${editingService._id}`,
          payload
        );
      } else {
        await api.post("/services", payload);
      }

      closeModal();
      await fetchServices();
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to save service"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/services/${id}`);

      setServices((current) =>
        current.filter(
          (service) => service._id !== id
        )
      );
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to delete service"
      );
    }
  };

  const getStatusClass = (status) => {
    if (status === "PUBLISHED") {
      return "bg-green-50 text-green-700 dark:bg-[#303030] dark:text-green-400";
    }

    if (status === "SUSPENDED") {
      return "bg-red-50 text-red-700 dark:bg-[#303030] dark:text-red-400";
    }

    return "bg-yellow-50 text-yellow-700 dark:bg-[#303030] dark:text-yellow-400";
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            My Services
          </h1>

          <p className="mt-1 text-sm text-black dark:text-white">
            Create and manage the services you offer.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          <Plus size={17} />
          Create Service
        </button>
      </div>

      {/* Error */}
      {error && !modalOpen && (
        <div className="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-black dark:bg-[#303030] dark:text-white">
          {error}
        </div>
      )}

      {/* Services */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center dark:border-[#303030] dark:bg-[#181818]">
            <p className="text-sm text-black dark:text-white">
              Loading services...
            </p>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center dark:border-[#303030] dark:bg-[#181818]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-[#303030]">
              <Wrench
                size={25}
                className="text-black dark:text-white"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-black dark:text-white">
              No services yet
            </h2>

            <p className="mt-2 text-sm text-black dark:text-white">
              Create your first service to start offering
              services to customers.
            </p>

            <button
              onClick={openCreateModal}
              className="mt-5 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Create Service
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const isSuspended =
                service.status === "SUSPENDED";

              return (
                <div
                  key={service._id}
                  className="rounded-xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]"
                >
                  {/* Service header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#303030]">
                        <Wrench
                          size={20}
                          className="text-black dark:text-white"
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-black dark:text-white">
                          {service.title}
                        </h2>

                        <p className="mt-1 truncate text-xs text-black dark:text-white">
                          {service.category?.name ||
                            "No category"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        service.status
                      )}`}
                    >
                      {service.status || "DRAFT"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-black dark:text-white">
                    {service.description ||
                      "No description available."}
                  </p>

                  {/* Suspension reason */}
                  {isSuspended &&
                    service.suspensionReason && (
                      <div className="mt-4 rounded-lg bg-gray-100 p-3 dark:bg-[#303030]">
                        <div className="flex gap-2">
                          <Ban
                            size={16}
                            className="mt-0.5 shrink-0 text-black dark:text-white"
                          />

                          <div>
                            <p className="text-xs font-semibold text-black dark:text-white">
                              Service suspended
                            </p>

                            <p className="mt-1 text-sm text-black dark:text-white">
                              {service.suspensionReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Actions */}
                  <div className="mt-5 flex gap-2 border-t border-gray-100 pt-5 dark:border-[#303030]">
                    <button
                      onClick={() =>
                        openEditModal(service)
                      }
                      disabled={isSuspended}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#303030] dark:text-white"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(service._id)
                      }
                      disabled={isSuspended}
                      className="flex items-center justify-center rounded-lg border border-gray-100 px-3 py-2.5 text-black disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#303030] dark:text-white"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white">
                  {editingService
                    ? "Edit Service"
                    : "Create Service"}
                </h2>

                <p className="mt-1 text-sm text-black dark:text-white">
                  {editingService
                    ? "Update your service details."
                    : "Add a new service to your profile."}
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

            {/* Modal error */}
            {error && (
              <div className="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-black dark:bg-[#303030] dark:text-white">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Service Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. AC Repair"
                  className="w-full rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:placeholder:text-gray-400 dark:focus:border-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:focus:border-white"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the service you provide..."
                  className="w-full resize-none rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:placeholder:text-gray-400 dark:focus:border-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Service Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={
                    editingService?.status ===
                    "SUSPENDED"
                  }
                  className="w-full rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:focus:border-white"
                >
                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="PUBLISHED">
                    Published
                  </option>

                  {editingService?.status ===
                    "SUSPENDED" && (
                    <option value="SUSPENDED">
                      Suspended
                    </option>
                  )}
                </select>

                {editingService?.status ===
                  "SUSPENDED" && (
                  <p className="mt-2 text-xs text-black dark:text-white">
                    This service was suspended by an
                    administrator and cannot be changed
                    until the suspension is removed.
                  </p>
                )}

                {editingService?.status !==
                  "SUSPENDED" && (
                  <p className="mt-2 text-xs text-black dark:text-white">
                    Draft services are not visible to
                    customers. Published services can be
                    shown to customers.
                  </p>
                )}
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
                    : editingService
                    ? "Update Service"
                    : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;