"use client";
import { createBlog } from "@/app/actions/blog";
import { useSidebar } from "@/lib/SidebarContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BlogForm, { BlogFormData } from "./BlogForm";

const BlogAdd = () => {
  const router = useRouter();
  const { isDarkMode } = useSidebar();

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
      
      // Featured image
      if (data.featuredImage) {
        formData.append("featuredImage", data.featuredImage);
      }

      const response = await createBlog(formData);

      if (response.success) {
        toast.success("Blog created successfully!");
        router.push("/blogs");
        router.refresh();
      } else {
        toast.error(response.error || "Failed to create blog");
      }
    } catch (error: any) {
      console.error("Error creating blog:", error);
      toast.error("An error occurred while creating the blog");
    }
  };

  const handleCancel = () => {
    router.push("/blogs");
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Add New Blog Post</h1>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          Create a new blog article
        </p>
      </div>
      
      <BlogForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
};

export default BlogAdd;
