"use client";

import { createCategory } from "@/app/actions/category";
import CategoryForm, {
    CategoryFormData,
} from "@/component/categoryManagement/CategoryForm";
import { useSidebar } from "@/lib/SidebarContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

// Image validation constants
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function CreateCategoryPage() {
  const { isDarkMode } = useSidebar();
  const router = useRouter();
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

  // Validate form fields
  const validateForm = (data: CategoryFormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Validate title
    if (!data.title || data.title.trim() === "") {
      newErrors.title = "Category title is required";
    } else if (data.title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters";
    } else if (data.title.trim().length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
    }

    // Validate description (optional but if provided, should meet criteria)
    if (data.description && data.description.trim().length > 0) {
      if (data.description.trim().length < 10) {
        newErrors.description = "Description must be at least 10 characters if provided";
      }
    }

    // Validate image if provided
    if (data.image) {
      const imageError = validateImage(data.image);
      if (imageError) {
        newErrors.image = imageError;
      }
    }

    return newErrors;
  };

  const handleSubmit = async (data: CategoryFormData) => {
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

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("status", data.status);

    if (data.image) {
      formData.append("image", data.image);
    }

    const createPromise = createCategory(formData);

    toast.promise(createPromise, {
      loading: "Creating category...",
      success: (result) => {
        if (result.success) {
          router.push("/category");
          return "Category created successfully!";
        }
        throw new Error(result.error || "Failed to create category");
      },
      error: (err) => err.message || "Failed to create category",
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className={`p-2 rounded-lg border ${
            isDarkMode
              ? "border-gray-700 text-gray-300 hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Create Category</h1>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Add a new product category
          </p>
        </div>
      </div>

      <CategoryForm onSubmit={handleSubmit} onCancel={handleCancel} errors={errors} />
    </div>
  );
}
