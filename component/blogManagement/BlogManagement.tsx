"use client";
import { Blog, deleteBlog, getBlogs } from "@/app/actions/blog";
import { useSidebar } from "@/lib/SidebarContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FaEdit,
  FaEye,
  FaNewspaper,
  FaPlus,
  FaSearch,
  FaStar,
  FaTrash,
} from "react-icons/fa";

interface BlogManagementProps {
  initialBlogs: Blog[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const BlogManagement = ({
  initialBlogs,
  pagination: initialPagination,
}: BlogManagementProps) => {
  const { isDarkMode } = useSidebar();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(initialPagination || {
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });

  // Memoized stats calculation
  const stats = useMemo(() => {
    const published = blogs.filter((b) => b.status === "published").length;
    const draft = blogs.filter((b) => b.status === "draft").length;
    const featured = blogs.filter((b) => b.featured).length;
    return {
      total: pagination.total || blogs.length,
      published,
      draft,
      featured,
    };
  }, [blogs, pagination.total]);

  const getStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      published: isDarkMode
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

  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      const response = await getBlogs(1, pagination.limit, term);
      if (response.success && response.data) {
        setBlogs(response.data as Blog[]);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
      setLoading(false);
    }, 500);
  }, [pagination.limit]);
  
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusFilter = useCallback(async (status: string) => {
    setFilterStatus(status);
    setLoading(true);
    const response = await getBlogs(
      1,
      pagination.limit,
      searchTerm,
      status !== "all" ? { status } : undefined
    );
    if (response.success && response.data) {
      setBlogs(response.data as Blog[]);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    }
    setLoading(false);
  }, [pagination.limit, searchTerm]);

  const handlePageChange = useCallback(async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    
    setLoading(true);
    const response = await getBlogs(
      newPage,
      pagination.limit,
      searchTerm,
      filterStatus !== "all" ? { status: filterStatus } : undefined
    );
    
    if (response.success && response.data) {
      setBlogs(response.data as Blog[]);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setLoading(false);
  }, [pagination.pages, pagination.limit, searchTerm, filterStatus]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      const response = await deleteBlog(id);
      if (response.success) {
        toast.success("Blog deleted successfully");
        setBlogs(blogs.filter((b) => b._id !== id));
        router.refresh();
      } else {
        toast.error(response.error || "Failed to delete blog");
      }
    }
  }, [blogs, router]);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  }, []);

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Blog Posts</h1>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          Manage your blog articles and publications
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
              placeholder="Search blogs..."
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
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Add Blog Button */}
        <Link
          href="/blogs/add-blog"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
        >
          <FaPlus /> Add Blog Post
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
                Total Blogs
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FaNewspaper className="text-blue-500 text-3xl" />
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
                Published
              </p>
              <p className="text-2xl font-bold text-green-500">{stats.published}</p>
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
                Drafts
              </p>
              <p className="text-2xl font-bold text-yellow-500">{stats.draft}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 text-lg font-bold">✎</span>
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
                Featured
              </p>
              <p className="text-2xl font-bold text-purple-500">{stats.featured}</p>
            </div>
            <FaStar className="text-purple-500 text-3xl" />
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div
        className={`rounded-lg shadow-sm border overflow-hidden ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center">Loading blogs...</div>
          ) : (
            <table className="w-full">
              <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Published
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
                {blogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      No blogs found.
                    </td>
                  </tr>
                )}
                {blogs.map((blog) => (
                  <tr
                    key={blog._id}
                    className={
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {blog.featuredImage && (
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 overflow-hidden relative mr-3">
                            <img
                              src={blog.featuredImage}
                              alt={blog.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{blog.title}</div>
                          {blog.featured && (
                            <span className="text-xs text-yellow-500">
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                        {blog.author}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                        {blog.category || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          blog.status
                        )}`}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                        {formatDate(blog.publishedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blogs/${blog._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/blogs/edit-blog/${blog._id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total blogs)
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

export default BlogManagement;
