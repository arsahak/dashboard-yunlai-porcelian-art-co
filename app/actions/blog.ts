"use server";

import { auth } from "@/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  author: string;
  category?: string;
  tags: string[];
  featuredImage?: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { name: string; email: string };
}

export interface BlogResponse {
  success: boolean;
  message?: string;
  data?: Blog | Blog[];
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Helper to get headers for JSON requests
async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await auth();
  const token = session?.accessToken;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Helper to get headers for Multipart requests
async function getMultipartAuthHeaders(): Promise<HeadersInit> {
  const session = await auth();
  const token = session?.accessToken;

  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (e) {
      console.error(`JSON Parse Error for ${response.url}.`);
      throw new Error(`Invalid JSON response from server (Status ${response.status})`);
    }
  } else {
    const text = await response.text();
    console.error(`Non-JSON response from ${response.url}:`, text.substring(0, 200));
    throw new Error(`Server returned non-JSON response (Status ${response.status})`);
  }
}

// Get blogs with pagination and filters
export async function getBlogs(
  page: number = 1,
  limit: number = 20,
  search: string = "",
  filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
  }
): Promise<BlogResponse> {
  try {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.featured !== undefined && {
        featured: String(filters.featured),
      }),
    });

    const response = await fetch(`${API_URL}/api/blogs?${params}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to fetch blogs",
      };
    }

    return {
      success: true,
      data: data.data,
      pagination: data.pagination,
    };
  } catch (error: any) {
    console.error("Get blogs error:", error);
    return {
      success: false,
      error: error.message || "An error occurred while fetching blogs",
    };
  }
}

// Get single blog by ID
export async function getBlogById(id: string): Promise<BlogResponse> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/blogs/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to fetch blog",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error: any) {
    console.error("Get blog by ID error:", error);
    return {
      success: false,
      error: error.message || "An error occurred while fetching blog",
    };
  }
}

// Create blog
export async function createBlog(formData: FormData): Promise<BlogResponse> {
  try {
    const headers = await getMultipartAuthHeaders();

    const response = await fetch(`${API_URL}/api/blogs`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      console.error("Create blog failed:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      return {
        success: false,
        error: data.message || data.error || `Failed to create blog (${response.status})`,
      };
    }

    return {
      success: true,
      message: data.message || "Blog created successfully",
      data: data.data,
    };
  } catch (error: any) {
    console.error("Create blog error:", {
      message: error.message,
      stack: error.stack,
      error,
    });
    return {
      success: false,
      error: error.message || "An error occurred while creating blog",
    };
  }
}

// Update blog
export async function updateBlog(
  id: string,
  formData: FormData
): Promise<BlogResponse> {
  try {
    const headers = await getMultipartAuthHeaders();

    const response = await fetch(`${API_URL}/api/blogs/${id}`, {
      method: "PUT",
      headers,
      body: formData,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to update blog",
      };
    }

    return {
      success: true,
      message: data.message || "Blog updated successfully",
      data: data.data,
    };
  } catch (error: any) {
    console.error("Update blog error:", error);
    return {
      success: false,
      error: error.message || "An error occurred while updating blog",
    };
  }
}

// Delete blog
export async function deleteBlog(id: string): Promise<BlogResponse> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/blogs/${id}`, {
      method: "DELETE",
      headers,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to delete blog",
      };
    }

    return {
      success: true,
      message: data.message || "Blog deleted successfully",
    };
  } catch (error: any) {
    console.error("Delete blog error:", error);
    return {
      success: false,
      error: error.message || "An error occurred while deleting blog",
    };
  }
}
