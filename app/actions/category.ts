"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
  productCount?: number;
  isOrphan?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

export interface CategoriesResponse {
  success: boolean;
  message?: string;
  data?: Category[];
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data?: Category;
  error?: string;
}

// Get all categories
export async function getCategories(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<CategoriesResponse> {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const response = await fetch(
      `${API_URL}/api/categories?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch categories",
      data: [],
    };
  }
}

// Get single category
export async function getCategory(id: string): Promise<CategoryResponse> {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: "Unauthorized" };
    }

    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch category",
    };
  }
}

// Create category
export async function createCategory(
  formData: FormData
): Promise<CategoryResponse> {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: "Unauthorized" };
    }

    const response = await fetch(`${API_URL}/api/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      revalidatePath("/category");
    }

    return result;
  } catch (error: any) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: error.message || "Failed to create category",
    };
  }
}

// Update category
export async function updateCategory(
  id: string,
  formData: FormData
): Promise<CategoryResponse> {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: "Unauthorized" };
    }

    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      revalidatePath("/category");
      revalidatePath(`/category/${id}`);
    }

    return result;
  } catch (error: any) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error.message || "Failed to update category",
    };
  }
}

// Delete category
export async function deleteCategory(id: string): Promise<CategoryResponse> {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return { success: false, error: "Unauthorized" };
    }

    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      revalidatePath("/category");
    }

    return result;
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: error.message || "Failed to delete category",
    };
  }
}
