"use server";

import { auth } from "@/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface DashboardStats {
  products: {
    total: number;
    byStatus: {
      active: number;
      draft: number;
      archived: number;
    };
    chartData: {
      name: string;
      value: number;
      color: string;
    }[];
  };
  blogs: {
    total: number;
    byStatus: {
      published: number;
      draft: number;
      archived: number;
    };
    chartData: {
      name: string;
      value: number;
      color: string;
    }[];
  };
}

interface DashboardResponse {
  success: boolean;
  data?: DashboardStats;
  message?: string;
}

export async function getDashboardStats(): Promise<DashboardResponse> {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(`${API_URL}/api/dashboard/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      next: { revalidate: 60 }, // Revalidate every minute
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch dashboard stats");
    }

    return data;
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return {
      success: false,
      message: error.message || "Failed to connect to the server",
    };
  }
}