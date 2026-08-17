import { useEffect, useState } from "react";
import { Plus, X, Folder, Pencil, Trash2 } from "lucide-react";

import api from "../../lib/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");

      setCategories(response?.data?.data || []);
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }

    if (!form.slug.trim()) {
      setError("Category slug is required");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post("/categories", {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
      });

      setForm({
        name: "",
        slug: "",
      });

      setModalOpen(false);

      await fetchCategories();
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to create category"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/categories/${id}`);

      setCategories((current) =>
        current.filter(
          (category) => category._id !== id
        )
      );
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Unable to delete category"
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Categories
          </h1>

          <p className="mt-1 text-sm text-black dark:text-white">
            Manage service categories.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          <Plus size={17} />
          Create Category
        </button>
      </div>

      {error && !modalOpen && (
        <div className="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-black dark:bg-[#303030] dark:text-white">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center dark:border-[#303030] dark:bg-[#181818]">
            <p className="text-sm text-black dark:text-white">
              Loading categories...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center dark:border-[#303030] dark:bg-[#181818]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-[#303030]">
              <Folder
                size={25}
                className="text-black dark:text-white"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-black dark:text-white">
              No categories found
            </h2>

            <p className="mt-2 text-sm text-black dark:text-white">
              Create your first category to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="rounded-xl border border-gray-100 bg-white p-5 dark:border-[#303030] dark:bg-[#181818]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#303030]">
                      <Folder
                        size={19}
                        className="text-black dark:text-white"
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold text-black dark:text-white">
                        {category.name}
                      </h2>

                      <p className="mt-1 text-xs text-black dark:text-white">
                        {category.slug}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm text-black dark:border-[#303030] dark:text-white"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(category._id)
                    }
                    className="flex items-center justify-center rounded-lg border border-gray-100 px-3 py-2 text-black dark:border-[#303030] dark:text-white"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#303030] dark:bg-[#181818]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-white">
                  Create Category
                </h2>

                <p className="mt-1 text-sm text-black dark:text-white">
                  Add a new service category.
                </p>
              </div>

              <button
                onClick={() => {
                  setModalOpen(false);
                  setError("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#303030]"
              >
                <X
                  size={18}
                  className="text-black dark:text-white"
                />
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-sm text-black dark:bg-[#303030] dark:text-white">
                {error}
              </div>
            )}

            <form
              onSubmit={handleCreate}
              className="mt-6 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Category Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Home Cleaning"
                  className="w-full rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:placeholder:text-gray-400 dark:focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Slug
                </label>

                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="e.g. home-cleaning"
                  className="w-full rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black dark:border-[#303030] dark:bg-[#181818] dark:text-white dark:placeholder:text-gray-400 dark:focus:border-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setError("");
                  }}
                  className="flex-1 rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-black dark:border-[#303030] dark:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {creating
                    ? "Creating..."
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;