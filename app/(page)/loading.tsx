"use client";

import { useEffect, useState } from "react";

export default function DashboardLoading() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(isDarkMode);
  }, []);

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className={`h-10 w-64 rounded mb-2 ${isDark ? "bg-gray-800" : "bg-gray-200"}`}></div>
        <div className={`h-5 w-48 rounded ${isDark ? "bg-gray-800" : "bg-gray-200"}`}></div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`p-6 rounded-lg border animate-pulse ${
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-5 w-24 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
              <div className={`w-10 h-10 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
            </div>
            <div className={`h-10 w-20 rounded mb-2 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
            <div className={`h-4 w-32 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1 */}
        <div
          className={`p-6 rounded-lg border animate-pulse ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className={`h-6 w-32 rounded mb-4 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
          <div className={`h-64 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
        </div>

        {/* Chart 2 */}
        <div
          className={`p-6 rounded-lg border animate-pulse ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className={`h-6 w-32 rounded mb-4 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
          <div className={`h-64 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div
        className={`p-6 rounded-lg border animate-pulse ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className={`h-6 w-40 rounded mb-4 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
              <div className="flex-1">
                <div className={`h-4 w-48 rounded mb-2 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
                <div className={`h-3 w-32 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
        <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}
