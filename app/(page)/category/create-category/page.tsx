"use client";

import { createCategory } from "@/app/actions/category";
import CategoryForm, {
  CategoryFormData,
} from "@/component/categoryManagement/CategoryForm";
import { useSidebar } from "@/lib/SidebarContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

export default function CreateCategoryPage() {
  const { isDarkMode } = useSidebar();
  const router = useRouter();

  const handleSubmit = async (data: CategoryFormData) => {
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

      <CategoryForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
