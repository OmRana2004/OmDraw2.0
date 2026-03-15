"use client";

import { useState, useEffect } from "react";
import {
  Command,
  Trash2,
  Download,
  Upload,
  Share2,
  UserPlus,
  Sun,
  Moon,
  Monitor,
  Check,
  SquarePen,
  Menu
} from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  return (
    <>
      {/* MENU BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center
        h-9 w-9 rounded-xl
        bg-[#ececf4] dark:bg-[#2a2a32]
        hover:bg-[#e6e6ef] dark:hover:bg-[#32323a]
        transition-colors"
      >
        <Menu size={18} className="text-neutral-700 dark:text-neutral-300" />
        <span className="sr-only">Toggle sidebar</span>
      </button>

      {/* SIDEBAR */}
      <div
        className={`fixed top-24 left-4 z-40 transform transition-all duration-300 ${
          open
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-10 pointer-events-none"
        }`}
      >
        <div className="flex flex-col w-72 rounded-xl bg-[#1f1f27] text-gray-200 shadow-xl border border-neutral-700">

          {/* MENU */}
          <div className="overflow-auto py-3 px-3 space-y-1">
            <MenuItem icon={Command} label="Command palette" shortcut="Ctrl+/" />
            <MenuItem icon={Trash2} label="Clear canvas" />
            <MenuItem icon={Download} label="Export Drawing" />
            <MenuItem icon={Upload} label="Import Drawing" />
            <MenuItem icon={Share2} label="Live collaboration" />
            <MenuItem icon={UserPlus} label="Sign up" highlight />
          </div>

          {/* FOOTER */}
          <div className="border-t border-neutral-700 px-4 py-4 space-y-5">

            {/* THEME */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-300">Theme</h3>

              <div className="flex gap-2">
                <ThemeButton
                  icon={Sun}
                  active={theme === "light"}
                  onClick={() => setTheme("light")}
                />

                <ThemeButton
                  icon={Moon}
                  active={theme === "dark"}
                  onClick={() => setTheme("dark")}
                />

                <ThemeButton
                  icon={Monitor}
                  active={theme === "system"}
                  onClick={() => setTheme("system")}
                />
              </div>
            </div>

            {/* CANVAS BACKGROUND */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-300">
                Canvas background
              </h3>

              <div className="flex gap-2">
                <ColorBox color="#ffffff" active />
                <ColorBox color="#f8f9fa" />
                <ColorBox color="#f5faff" />
                <ColorBox color="#fffce8" />
                <ColorBox color="#fdf8f6" />
              </div>

              <div className="flex items-center justify-between bg-neutral-700 rounded-md px-3 py-2">
                <span className="font-mono text-sm text-neutral-200">
                  #ffffff
                </span>

                <button className="p-1.5 rounded hover:bg-neutral-600 transition">
                  <SquarePen size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

function MenuItem({ icon: Icon, label, shortcut, highlight }: any) {
  return (
    <button
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm transition hover:bg-neutral-700 ${
        highlight ? "text-indigo-400 font-semibold" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={16} />
        {label}
      </div>

      {shortcut && (
        <kbd className="text-xs bg-neutral-700 px-1.5 py-0.5 rounded">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

function ThemeButton({ icon: Icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-8 h-7 rounded-md transition ${
        active
          ? "bg-indigo-400 text-black"
          : "bg-neutral-700 hover:bg-neutral-600"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}

function ColorBox({ color, active }: any) {
  return (
    <button
      className={`w-8 h-8 rounded-md border flex items-center justify-center transition hover:scale-105 ${
        active ? "ring-2 ring-white" : ""
      }`}
      style={{ backgroundColor: color }}
    >
      {active && <Check size={14} className="text-black" />}
    </button>
  );
}