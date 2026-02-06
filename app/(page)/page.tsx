import { getDashboardStats } from "@/app/actions/dashboard";
import { auth } from "@/auth";
import Dashboard from "@/component/dashboardManagement/Dashboard";
import { Suspense } from "react";
import DashboardLoading from "./loading";

export const metadata = {
  title: "Yunlai Porcelain Art Co.",
  description: "Beautiful collection of Yunlai porcelain art",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-USA",
    },
  },
  openGraph: {
    images: "/opengraph-image.png",
  },
};

async function DashboardData() {
  const session = await auth();
  const userName = session?.user?.name || "User";

  try {
    const response = await getDashboardStats();

    // Default empty stats if fetch fails or no data
    const defaultStats = {
      products: {
        total: 0,
        byStatus: { active: 0, draft: 0, archived: 0 },
        chartData: []
      },
      blogs: {
        total: 0,
        byStatus: { published: 0, draft: 0, archived: 0 },
        chartData: []
      }
    };

    const stats = response.success && response.data ? response.data : defaultStats;

    return (
      <Dashboard
        stats={stats}
        userName={userName}
      />
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardData />
    </Suspense>
  );
}
