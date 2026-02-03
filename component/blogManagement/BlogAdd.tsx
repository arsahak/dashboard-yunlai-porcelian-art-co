"use client";
import { createBlog } from "@/app/actions/blog";
import { useSidebar } from "@/lib/SidebarContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import BlogForm, { BlogFormData } from "./BlogForm";

// Validation error interface
export interface BlogValidationErrors {
  title?: string;
  slug?: string;
  author?: string;
  body?: string;
  category?: string;
  featuredImage?: string;
  excerpt?: string;
}

// Image validation constants
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const BlogAdd = () => {
  const router = useRouter();
  const { isDarkMode } = useSidebar();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate image file
  const validateImage = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      return `Image exceeds maximum size of 1MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }
    
    // Check file format
    if (!ALLOWED_IMAGE_FORMATS.includes(file.type)) {
      return `Invalid image format. Allowed: JPG, JPEG, PNG, WEBP`;
    }
    
    return null;
  };

  // Validate all form fields
  const validateForm = (data: BlogFormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Validate title
    if (!data.title || data.title.trim() === "") {
      newErrors.title = "Blog title is required";
    } else if (data.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (data.title.trim().length > 200) {
      newErrors.title = "Title must not exceed 200 characters";
    }

    // Validate slug
    if (!data.slug || data.slug.trim() === "") {
      newErrors.slug = "Slug is required";
    } else if (data.slug.trim().length < 3) {
      newErrors.slug = "Slug must be at least 3 characters";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      newErrors.slug = "Slug must be lowercase letters, numbers, and hyphens only";
    }

    // Validate author
    if (!data.author || data.author.trim() === "") {
      newErrors.author = "Author name is required";
    } else if (data.author.trim().length < 2) {
      newErrors.author = "Author name must be at least 2 characters";
    }

    // Validate body content
    if (!data.body || data.body.trim() === "" || data.body === "<p></p>") {
      newErrors.body = "Blog content is required";
    } else if (data.body.trim().length < 50) {
      newErrors.body = "Content must be at least 50 characters";
    }

    // Validate category
    if (!data.category || data.category.trim() === "") {
      newErrors.category = "Category is required";
    }

    // Validate excerpt (optional but if provided, should meet criteria)
    if (data.excerpt && data.excerpt.trim().length > 0) {
      if (data.excerpt.trim().length < 10) {
        newErrors.excerpt = "Excerpt must be at least 10 characters if provided";
      }
    }

    // Validate featured image if provided
    if (data.featuredImage) {
      const imageError = validateImage(data.featuredImage);
      if (imageError) {
        newErrors.featuredImage = imageError;
      }
    }

    return newErrors;
  };

  const handleSubmit = async (data: BlogFormData) => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const validationErrors = validateForm(data);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Show first error as toast
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      
      return;
    }

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
        const errorMsg = response.error || "Failed to create blog";
        toast.error(errorMsg);
        
        // Parse error to map to fields if possible
        const newErrors: Record<string, string> = {};
        const lowerError = errorMsg.toLowerCase();
        
        if (lowerError.includes("slug") || lowerError.includes("url") || lowerError.includes("already exists")) {
          newErrors.slug = "This slug is already in use. Please choose a different one.";
        }
        if (lowerError.includes("title")) {
          newErrors.title = "Please check the title.";
        }
        if (lowerError.includes("author")) {
          newErrors.author = "Author name is invalid.";
        }
        
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        }
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
      
      <BlogForm onSubmit={handleSubmit} onCancel={handleCancel} errors={errors} />
    </div>
  );
};

export default BlogAdd;
