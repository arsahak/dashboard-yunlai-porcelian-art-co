"use client";
import { Blog, updateBlog } from "@/app/actions/blog";
import { useSidebar } from "@/lib/SidebarContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BlogForm, { BlogFormData } from "./BlogForm";

interface BlogEditProps {
  blog: Blog;
}

const BlogEdit = ({ blog }: BlogEditProps) => {
  const router = useRouter();
  const { isDarkMode } = useSidebar();

  const initialData: Partial<BlogFormData> = {
    title: blog.title,
    slug: blog.slug,
    body: blog.body,
    excerpt: blog.excerpt || "",
    author: blog.author,
    category: blog.category || "",
    tags: blog.tags || [],
    status: blog.status,
    featured: blog.featured,
    metaTitle: blog.metaTitle || "",
    metaDescription: blog.metaDescription || "",
    metaKeywords: blog.metaKeywords || "",
    existingImage: blog.featuredImage,
  };

  const handleSubmit = async (data: BlogFormData) => {
    try {
      const formData = new FormData();
      
      // Basic fields
      formData.append("title", data.title);
      formData.append("slug", data.slug);
      formData.append("body", data.body);
      formData.append("author", data.author);
      formData.append("status", data.status);
      formData.append("featured", String(data.featured));
      
      // Optional fields
      if (data.excerpt) formData.append("excerpt", data.excerpt);
      if (data.category) formData.append("category", data.category);
      if (data.metaTitle) formData.append("metaTitle", data.metaTitle);
      if (data.metaDescription) formData.append("metaDescription", data.metaDescription);
      if (data.metaKeywords) formData.append("metaKeywords", data.metaKeywords);
      
      // Tags
      if (data.tags.length > 0) {
        formData.append("tags", data.tags.join(","));
      }
      
      // Featured image (only if new one is uploaded)
      if (data.featuredImage) {
        formData.append("featuredImage", data.featuredImage);
      }

      const response = await updateBlog(blog._id, formData);

      if (response.success) {
        toast.success("Blog updated successfully!");
        router.push("/blogs");
        router.refresh();
      } else {
        toast.error(response.error || "Failed to update blog");
      }
    } catch (error: any) {
      console.error("Error updating blog:", error);
      toast.error("An error occurred while updating the blog");
    }
  };

  const handleCancel = () => {
    router.push("/blogs");
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Edit Blog Post</h1>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          Update blog article details
        </p>
      </div>
      
      <BlogForm 
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={true}
      />
    </div>
  );
};

export default BlogEdit;
