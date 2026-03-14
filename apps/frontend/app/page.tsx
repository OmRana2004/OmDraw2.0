"use client";

import {
  Grid,
  ArrowRight,
  Circle,
  Square,
  Triangle,
  Moon,
  Sun,
  Link as LinkIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* Background Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <Circle
          className={`absolute top-20 left-10 w-16 h-16 opacity-60 animate-pulse ${
            isDark ? "text-blue-500" : "text-blue-200"
          }`}
          style={{ animationDuration: "3s" }}
        />
        <Square
          className={`absolute top-32 right-20 w-12 h-12 opacity-50 rotate-12 ${
            isDark ? "text-pink-500" : "text-pink-200"
          }`}
        />
        <Triangle
          className={`absolute bottom-40 left-1/4 w-20 h-20 opacity-40 -rotate-12 ${
            isDark ? "text-green-500" : "text-green-200"
          }`}
        />
        <Circle
          className={`absolute top-1/2 right-10 w-10 h-10 opacity-50 ${
            isDark ? "text-yellow-500" : "text-yellow-200"
          }`}
        />
        <Square
          className={`absolute bottom-20 right-1/3 w-14 h-14 opacity-40 rotate-45 ${
            isDark ? "text-purple-500" : "text-purple-200"
          }`}
        />
        <Circle
          className={`absolute top-1/3 left-1/3 w-8 h-8 opacity-60 ${
            isDark ? "text-orange-500" : "text-orange-200"
          }`}
        />
        <Triangle
          className={`absolute bottom-1/3 right-1/4 w-16 h-16 opacity-30 rotate-45 ${
            isDark ? "text-teal-500" : "text-teal-200"
          }`}
        />
        <Square
          className={`absolute top-1/4 right-1/2 w-10 h-10 opacity-40 -rotate-12 ${
            isDark ? "text-red-500" : "text-red-200"
          }`}
        />
      </div>

      {/* Navbar */}
      <nav
        className={`border-b relative z-10 backdrop-blur-sm transition-colors duration-300 ${
          isDark
            ? "border-gray-800 bg-gray-900/80"
            : "border-gray-200 bg-white/80"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Grid
              className={`w-6 h-6 ${isDark ? "text-white" : "text-gray-900"}`}
            />
            <span
              className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}
            >
              MindDraw
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Navigation Links */}
            <Link
              href="/signup"
              className={`text-sm transition-colors ${
                isDark
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sign Up
            </Link>

            <Link
              href="/signin"
              className={`text-sm transition-colors ${
                isDark
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-32 text-center relative z-10">
        <h1
          className={`text-5xl md:text-6xl font-bold mb-6 transition-colors duration-300 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Spreadsheets with drawing tools
        </h1>
        <p
  className={`text-xl mb-12 max-w-2xl mx-auto transition-colors duration-300 ${
    isDark ? "text-gray-400" : "text-gray-600"
  }`}
>
  A simple way to work with data and visualize ideas
</p>

<div className="flex items-center justify-center gap-4">
  <Link
    href="/signin"
    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
      isDark
        ? "bg-white text-gray-900 hover:bg-gray-100"
        : "bg-gray-900 text-white hover:bg-gray-800"
    }`}
  >
    Login
    <ArrowRight className="w-4 h-4" />
  </Link>

  <Link
     href="/guest/0"
    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
      isDark
        ? "bg-white text-gray-900 hover:bg-gray-100"
        : "bg-gray-900 text-white hover:bg-gray-800"
    }`}
  >
    Guest
    <ArrowRight className="w-4 h-4" />
  </Link>
</div>
      </main>
    </div>
  );
}