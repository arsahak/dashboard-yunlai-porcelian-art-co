"use client";
import { Blog } from "@/app/actions/blog";
import { useSidebar } from "@/lib/SidebarContext";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaCalendar, FaEdit, FaFolder, FaStar, FaTag, FaUser } from "react-icons/fa";

interface BlogDetailsProps {
  blog: Blog;
}

const BlogDetails = ({ blog }: BlogDetailsProps) => {
  const { isDarkMode } = useSidebar();
  const router = useRouter();

  if (!blog) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-4">Blog Not Found</h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blog Details</h1>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            View blog post information
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FaArrowLeft /> Back
          </button>
          <button
            onClick={() => router.push(`/blogs/edit-blog/${blog._id}`)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaEdit /> Edit Blog
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image */}
          {blog.featuredImage && (
            <div
              className={`rounded-lg border overflow-hidden ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Blog Header */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  blog.status === "published"
                    ? "bg-green-100 text-green-800"
                    : blog.status === "draft"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {blog.status.toUpperCase()}
              </span>
              {blog.featured && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  <FaStar /> Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <FaUser />
                <span>{blog.author}</span>
              </div>
              <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <FaCalendar />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
            </div>

            {blog.excerpt && (
              <p className={`mt-4 text-lg italic ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                {blog.excerpt}
              </p>
            )}
          </div>

          {/* Blog Content */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-2xl font-semibold mb-4">Content</h2>
            <div
              className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}
              dangerouslySetInnerHTML={{ __html: blog.body }}
            />
          </div>

          {/* SEO Information */}
          {(blog.metaTitle || blog.metaDescription || blog.metaKeywords) && (
            <div
              className={`p-6 rounded-lg border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4">SEO Information</h2>
              <div className="space-y-3">
                {blog.metaTitle && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Meta Title:
                    </label>
                    <p className="mt-1">{blog.metaTitle}</p>
                  </div>
                )}
                {blog.metaDescription && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Meta Description:
                    </label>
                    <p className="mt-1">{blog.metaDescription}</p>
                  </div>
                )}
                {blog.metaKeywords && (
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Meta Keywords:
                    </label>
                    <p className="mt-1">{blog.metaKeywords}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Blog Info */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Blog Information</h2>
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Slug:
                </label>
                <p className="mt-1 font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {blog.slug}
                </p>
              </div>

              {blog.category && (
                <div className="flex items-start gap-2">
                  <FaFolder className="mt-1 text-purple-500" />
                  <div className="flex-1">
                    <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Category:
                    </label>
                    <p className="mt-1">{blog.category}</p>
                  </div>
                </div>
              )}

              {blog.tags && blog.tags.length > 0 && (
                <div className="flex items-start gap-2">
                  <FaTag className="mt-1 text-blue-500" />
                  <div className="flex-1">
                    <label className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Tags:
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {blog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Metadata</h2>
            <div className="space-y-3 text-sm">
              {blog.createdAt && (
                <div>
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Created: </span>
                  <span className="font-medium">{formatDate(blog.createdAt)}</span>
                </div>
              )}
              {blog.updatedAt && (
                <div>
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Updated: </span>
                  <span className="font-medium">{formatDate(blog.updatedAt)}</span>
                </div>
              )}
              {blog.publishedAt && (
                <div>
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Published: </span>
                  <span className="font-medium">{formatDate(blog.publishedAt)}</span>
                </div>
              )}
              {blog.createdBy && (
                <div>
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Created By: </span>
                  <span className="font-medium">{blog.createdBy.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
