"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [isDark, setIsDark] = useState(false);

  // Detect system theme preference
  useEffect(() => {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(isDarkMode);
  }, []);

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="text-center">
        {/* Animated Logo/Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer rotating ring */}
          <div
            className={`absolute inset-0 rounded-full border-4 border-t-transparent ${
              isDark ? "border-blue-500" : "border-blue-600"
            } animate-spin`}
          ></div>
          
          {/* Middle rotating ring (opposite direction) */}
          <div
            className={`absolute inset-2 rounded-full border-4 border-b-transparent ${
              isDark ? "border-purple-500" : "border-purple-600"
            } animate-spin-reverse`}
            style={{ animationDuration: "1.5s" }}
          ></div>
          
          {/* Inner pulsing circle */}
          <div
            className={`absolute inset-4 rounded-full ${
              isDark ? "bg-blue-600" : "bg-blue-500"
            } animate-pulse`}
          ></div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h2
          className={`text-2xl font-bold mb-2 ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Loading
          <span className="inline-flex ml-1">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
              .
            </span>
            <span
              className="animate-bounce"
              style={{ animationDelay: "150ms" }}
            >
              .
            </span>
            <span
              className="animate-bounce"
              style={{ animationDelay: "300ms" }}
            >
              .
            </span>
          </span>
        </h2>

        {/* Subtitle */}
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Please wait while we prepare your dashboard
        </p>

        {/* Progress bar */}
        <div
          className={`mt-6 w-64 h-1 mx-auto rounded-full overflow-hidden ${
            isDark ? "bg-gray-800" : "bg-gray-200"
          }`}
        >
          <div
            className={`h-full ${
              isDark
                ? "bg-gradient-to-r from-blue-500 to-purple-500"
                : "bg-gradient-to-r from-blue-600 to-purple-600"
            } animate-loading-bar`}
          ></div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-spin-reverse {
          animation: spin-reverse 1s linear infinite;
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
