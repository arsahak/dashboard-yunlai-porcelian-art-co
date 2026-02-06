"use client";
import { deleteProduct, getProducts, Product } from "@/app/actions/product";
import { useSidebar } from "@/lib/SidebarContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FaBox,
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { MdInventory } from "react-icons/md";

interface ProductManagementProps {
  initialProducts: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const ProductManagement = ({
  initialProducts,
  pagination: initialPagination,
}: ProductManagementProps) => {
  const { isDarkMode } = useSidebar();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(initialPagination || {
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });

  // Memoized stats calculation - only recalculate when products change
  const stats = useMemo(() => {
    const active = products.filter((p) => p.status === "active").length;
    const lowStock = products.filter((p) => p.stock <= 10 && p.stock > 0).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    return {
      total: pagination.total || products.length,
      active,
      lowStock,
      outOfStock,
    };
  }, [products, pagination.total]);

  // Memoize utility functions to prevent recreation on every render
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);

  const getStockStatus = useCallback((stock: number) => {
    if (stock === 0) {
      return { label: "Out of Stock", color: "text-red-600 bg-red-100" };
    } else if (stock <= 10) {
      return { label: "Low Stock", color: "text-yellow-600 bg-yellow-100" };
    } else {
      return { label: "In Stock", color: "text-green-600 bg-green-100" };
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      active: isDarkMode
        ? "bg-green-900 text-green-300"
        : "bg-green-100 text-green-800",
      draft: isDarkMode
        ? "bg-gray-700 text-gray-300"
        : "bg-gray-100 text-gray-800",
      archived: isDarkMode
        ? "bg-red-900 text-red-300"
        : "bg-red-100 text-red-800",
    };
    return colors[status] || "";
  }, [isDarkMode]);

  // Debounced search to prevent API spam
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce API call by 500ms
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      const response = await getProducts(1, 20, term);
      if (response.success && response.data) {
        setProducts(response.data as Product[]);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
      setLoading(false);
    }, 500);
  }, []);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handlePageChange = useCallback(async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    
    setLoading(true);
    const response = await getProducts(
      newPage,
      pagination.limit,
      searchTerm,
      filterStatus !== "all" ? { status: filterStatus } : undefined
    );
    
    if (response.success && response.data) {
      setProducts(response.data as Product[]);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      // Scroll to top of the table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setLoading(false);
  }, [pagination.pages, pagination.limit, searchTerm, filterStatus]);

  const handleStatusFilter = useCallback(async (status: string) => {
    setFilterStatus(status);
    setLoading(true);
    const response = await getProducts(
      1,
      pagination.limit,
      searchTerm,
      status !== "all" ? { status } : undefined
    );
    if (response.success && response.data) {
      setProducts(response.data as Product[]);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    }
    setLoading(false);
  }, [pagination.limit, searchTerm]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const response = await deleteProduct(id);
      if (response.success) {
        toast.success("Product deleted successfully");
        // Refresh list
        setProducts(products.filter((p) => p._id !== id));
        router.refresh();
      } else {
        toast.error(response.error || "Failed to delete product");
      }
    }
  }, [products, router]);

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Products</h1>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          Manage your product inventory
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
              placeholder="Search products..."
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
            value={filterStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Add Product Button */}
        <Link
          href="/products/add-product"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
        >
          <FaPlus /> Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FaBox className="text-blue-500 text-3xl" />
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
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
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
                Low Stock
              </p>
              <p className="text-2xl font-bold text-yellow-500">{stats.lowStock}</p>
            </div>
            <MdInventory className="text-yellow-500 text-3xl" />
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
                Out of Stock
              </p>
              <p className="text-2xl font-bold text-red-500">{stats.outOfStock}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-lg font-bold">!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div
        className={`rounded-lg shadow-sm border overflow-hidden ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <div className="space-y-3 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className="flex-1 space-y-2">
                      <div className={`h-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '40%' }} />
                      <div className={`h-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '60%' }} />
                    </div>
                    <div className={`h-8 w-20 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className={`h-8 w-16 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    <div className={`h-8 w-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
          <table className="w-full">
            <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Category
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
              {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">No products found.</td>
                  </tr>
              )}
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                const primaryImage = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url;
                const categoryName = product.category && typeof product.category === 'object' ? (product.category as any).name : (product.category || "Uncategorized");

                return (
                  <tr
                    key={product._id}
                    className={
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 overflow-hidden relative">
                           {primaryImage && (
                              <img 
                                src={primaryImage} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                           )}
                           {!primaryImage && <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{product.name}</div>
                          {product.featured && (
                            <span className="text-xs text-yellow-500">
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`font-mono text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">
                          {formatCurrency(product.price)}
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div
                            className={`text-sm line-through ${
                              isDarkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {formatCurrency(product.compareAtPrice)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{product.stock}</div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${stockStatus.color}`}
                        >
                          {stockStatus.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }
                      >
                        {categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/products/edit-product/${product._id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total products)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? "border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  : "border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || loading}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode
                  ? "border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  : "border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
