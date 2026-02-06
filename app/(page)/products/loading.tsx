"use client";

import { useEffect, useState } from "react";

export default function ProductsLoading() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(isDarkMode);
  }, []);

  return (
    <div
      className={`min-h-screen p-6 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header Skeleton */}
      <div className="mb-6 animate-pulse">
        <div
          className={`h-8 w-48 rounded mb-2 ${
            isDark ? "bg-gray-800" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`h-4 w-64 rounded ${
            isDark ? "bg-gray-800" : "bg-gray-200"
          }`}
        ></div>
      </div>

      {/* Search and Filter Skeleton */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 animate-pulse">
        <div
          className={`h-10 flex-1 max-w-md rounded-lg ${
            isDark ? "bg-gray-800" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`h-10 w-40 rounded-lg ${
            isDark ? "bg-gray-800" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`h-10 w-40 rounded-lg ${
            isDark ? "bg-blue-600" : "bg-blue-500"
          }`}
        ></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`p-4 rounded-lg border animate-pulse ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div
                  className={`h-4 w-24 rounded mb-2 ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`h-8 w-16 rounded ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
              </div>
              <div
                className={`w-12 h-12 rounded-full ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div
        className={`rounded-lg shadow-sm border overflow-hidden ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Table Header */}
        <div
          className={`px-6 py-3 ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
        >
          <div className="flex gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-4 rounded ${
                  i === 1 ? "w-32" : i === 6 ? "w-20" : "w-24"
                } ${isDark ? "bg-gray-600" : "bg-gray-300"}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Table Rows - 5 skeleton rows */}
        <div>
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className={`px-6 py-4 border-t ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4 animate-pulse">
                {/* Image skeleton */}
                <div
                  className={`w-12 h-12 rounded ${
                    isDark ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>
                {/* Content skeletons */}
                <div className="flex-1 flex gap-4">
                  <div
                    className={`h-4 w-32 rounded ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-4 w-24 rounded ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-4 w-20 rounded ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-4 w-16 rounded ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`h-4 w-24 rounded ${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-t animate-pulse ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div
            className={`h-4 w-40 rounded ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
          <div className="flex gap-2">
            <div
              className={`h-10 w-24 rounded-lg ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`h-10 w-24 rounded-lg ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            ></div>
          </div>
        </div>
      </div>

      {/* Loading indicator at bottom */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? "bg-blue-500" : "bg-blue-600"
            }`}
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? "bg-blue-500" : "bg-blue-600"
            }`}
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              isDark ? "bg-blue-500" : "bg-blue-600"
            }`}
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
        <p
          className={`mt-2 text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Loading products...
        </p>
      </div>
    </div>
  );
}
