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

export default function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const { isDarkMode } = useSidebar();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<CategoryFormData>>();

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const result = await getCategory(params.id);
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
  }, [params.id, router]);

  const handleSubmit = async (data: CategoryFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("status", data.status);

    if (data.image) {
      formData.append("image", data.image);
    }

    const updatePromise = updateCategory(params.id, formData);

    toast.promise(updatePromise, {
      loading: "Updating category...",
      success: (result) => {
        if (result.success) {
          router.push("/category");
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
        />
      )}
    </div>
  );
}
