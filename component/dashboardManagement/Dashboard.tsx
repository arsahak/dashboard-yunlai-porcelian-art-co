"use client";
import { DashboardStats } from "@/app/actions/dashboard";
import { useSidebar } from "@/lib/SidebarContext";
import {
    FaBlog,
    FaBoxOpen,
    FaCheckCircle,
    FaClipboardList,
    FaPen,
    FaShoppingBag
} from "react-icons/fa";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface DashboardProps {
  stats: DashboardStats;
  userName?: string;
}

const Dashboard = ({ stats, userName }: DashboardProps) => {
  const { isDarkMode } = useSidebar();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-4 rounded-lg shadow-lg border ${
            isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <p className="font-bold">{label || payload[0].name}</p>
          <p className="text-sm">
            Count: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, icon, color, subText }: any) => (
    <div
      className={`p-6 rounded-xl border shadow-sm flex items-start justify-between ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div>
        <p className={`text-sm font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          {title}
        </p>
        <h3 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          {value}
        </h3>
        {subText && (
          <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            {subText}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userName || "Admin"}! 👋
        </h1>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.products.total}
          icon={<FaBoxOpen className="text-2xl text-blue-600" />}
          color="bg-blue-100 dark:bg-blue-900/30"
          subText={`${stats.products.byStatus.active} Active Now`}
        />
        <StatCard
          title="Total Blog Posts"
          value={stats.blogs.total}
          icon={<FaBlog className="text-2xl text-purple-600" />}
          color="bg-purple-100 dark:bg-purple-900/30"
          subText={`${stats.blogs.byStatus.published} Published`}
        />
        <StatCard
          title="Active Products"
          value={stats.products.byStatus.active}
          icon={<FaCheckCircle className="text-2xl text-green-600" />}
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Draft Items"
          value={stats.products.byStatus.draft + stats.blogs.byStatus.draft}
          icon={<FaPen className="text-2xl text-yellow-600" />}
          color="bg-yellow-100 dark:bg-yellow-900/30"
          subText="Products & Blogs"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Product Status Chart */}
        <div className={`p-6 rounded-xl border shadow-sm ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaShoppingBag className="text-blue-500" /> Product Status
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.products.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.products.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {stats.products.chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </span>
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Blog Status Chart */}
        <div className={`p-6 rounded-xl border shadow-sm ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaClipboardList className="text-purple-500" /> Blog Content
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.blogs.chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDarkMode ? "#9ca3af" : "#4b5563"} 
                  tick={{ fill: isDarkMode ? "#9ca3af" : "#4b5563" }}
                />
                <YAxis 
                  stroke={isDarkMode ? "#9ca3af" : "#4b5563"} 
                  tick={{ fill: isDarkMode ? "#9ca3af" : "#4b5563" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? "#374151" : "#f3f4f6" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.blogs.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {stats.blogs.chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </span>
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;