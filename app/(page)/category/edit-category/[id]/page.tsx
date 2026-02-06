"use client";

import { getCategory, updateCategory } from "@/app/actions/category";
import CategoryForm, {
  CategoryFormData,
} from "@/component/categoryManagement/CategoryForm";
import { useSidebar } from "@/lib/SidebarContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

// Image validation constants
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Wrapper component to handle async params
function EditCategoryContent({ categoryId }: { categoryId: string }) {
  const { isDarkMode } = useSidebar();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<CategoryFormData>>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const result = await getCategory(categoryId);
        if (result.success && result.data) {
          setInitialData({
            title: result.data.title,
            description: result.data.description || "",
            status: result.data.status,
            existingImage: result.data.image,
          });
        } else {
          toast.error("Category not found");
          router.push("/category");
        }
      } catch (error) {
        toast.error("Error loading category");
        router.push("/category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, router]);

  // Validate image file
  const validateImage = (file: File): string | null => {
    if (file.size > MAX_IMAGE_SIZE) {
      return `Image exceeds maximum size of 1MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }
    if (!ALLOWED_IMAGE_FORMATS.includes(file.type)) {
      return `Invalid image format. Allowed: JPG, JPEG, PNG, WEBP`;
    }
    return null;
  };

  // Validate form fields
  const validateForm = (data: CategoryFormData): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!data.title || data.title.trim() === "") {
      newErrors.title = "Category title is required";
    } else if (data.title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters";
    } else if (data.title.trim().length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
    }
    if (data.description && data.description.trim().length > 0) {
      if (data.description.trim().length < 10) {
        newErrors.description = "Description must be at least 10 characters if provided";
      }
    }
    if (data.image) {
      const imageError = validateImage(data.image);
      if (imageError) {
        newErrors.image = imageError;
      }
    }
    return newErrors;
  };

  const handleSubmit = async (data: CategoryFormData) => {
    setErrors({});
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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

    const updatePromise = updateCategory(categoryId, formData);

    toast.promise(updatePromise, {
      loading: "Updating category...",
      success: (result) => {
        if (result.success) {
          router.push("/category");
          router.refresh();
          return "Category updated successfully!";
        }
        throw new Error(result.error || "Failed to update category");
      },
      error: (err) => err.message || "Failed to update category",
    });
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen p-6 flex items-center justify-center ${
          isDarkMode
            ? "bg-gray-900 text-gray-100"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading category...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Edit Category</h1>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Update category information
          </p>
        </div>
      </div>

      {initialData && (
        <CategoryForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit
          errors={errors}
        />
      )}
    </div>
  );
}

// Main async export to handle Next.js 15 async params
export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCategoryContent categoryId={id} />;
}
