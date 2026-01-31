"use client";

import { Category, deleteCategory, getCategories } from "@/app/actions/category";
import { useSidebar } from "@/lib/SidebarContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaPlus, FaSearch, FaTrash } from "react-icons/fa";

interface CategoryManagementProps {
  initialCategories: Category[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const CategoryManagement = ({
  initialCategories,
  pagination: initialPagination,
}: CategoryManagementProps) => {
  const { isDarkMode } = useSidebar();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);

  // Stats calculation
  const totalCategories = initialPagination?.total || categories.length;
  const activeCategories = categories.filter((c) => c.status === "active").length;
  const inactiveCategories = categories.filter((c) => c.status === "inactive").length;
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setLoading(true);
    const response = await getCategories({ search: term, status: statusFilter !== "all" ? statusFilter : undefined });
    if (response.success && response.data) {
      setCategories(response.data);
    }
    setLoading(false);
  };

  const handleFilter = async (status: string) => {
    setStatusFilter(status);
    setLoading(true);
    const response = await getCategories({ 
      search: searchTerm || undefined, 
      status: status !== "all" ? status : undefined 
    });
    if (response.success && response.data) {
      setCategories(response.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const deletePromise = deleteCategory(id);

    toast.promise(deletePromise, {
      loading: "Deleting category...",
      success: (result) => {
        if (result.success) {
          setCategories(categories.filter((c) => c._id !== id));
          router.refresh();
          return "Category deleted successfully";
        }
        throw new Error(result.error || "Failed to delete");
      },
      error: (err) => err.message || "Failed to delete category",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: isDarkMode
        ? "bg-green-900 text-green-300"
        : "bg-green-100 text-green-800",
      inactive: isDarkMode
        ? "bg-gray-700 text-gray-300"
        : "bg-gray-100 text-gray-800",
    };
    return colors[status] || "";
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Category Management</h1>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          Manage product categories with images and descriptions
        </p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FaSearch
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Add Button */}
        <button
          onClick={() => router.push("/category/create-category")}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total Categories
              </p>
              <p className="text-2xl font-bold text-blue-500">{totalCategories}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FaPlus className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Active
              </p>
              <p className="text-2xl font-bold text-green-500">{activeCategories}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-lg font-bold">✓</span>
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Inactive
              </p>
              <p className="text-2xl font-bold text-gray-500">{inactiveCategories}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600 text-lg font-bold">−</span>
            </div>
          </div>
        </div>
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total Products
              </p>
              <p className="text-2xl font-bold text-purple-500">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 text-lg font-bold">📦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div
        className={`rounded-lg shadow-sm border overflow-hidden ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center">Loading categories...</div>
          ) : (
            <table className="w-full">
              <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDarkMode ? "divide-gray-700" : "divide-gray-200"
                }`}
              >
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      No categories found.
                    </td>
                  </tr>
                )}
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className={
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden relative">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                              {category.title[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{category.title}</div>
                          {category.isOrphan && (
                            <span className="text-xs text-yellow-500">
                              ⚠ Orphan
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`text-sm max-w-xs truncate ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {category.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isDarkMode
                            ? "bg-purple-900 text-purple-300"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {category.productCount || 0} products
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          category.status
                        )}`}
                      >
                        {category.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(`/category/edit-category/${category._id}`)
                          }
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(category._id, category.title)
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Summary */}
      {!loading && categories.length > 0 && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          Showing {categories.length} of {totalCategories} categories
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
