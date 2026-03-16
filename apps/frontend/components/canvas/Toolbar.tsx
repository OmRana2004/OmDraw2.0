"use client";

import { useState } from "react";
import {
  MousePointer,
  Hand,
  Square,
  Circle,
  Diamond,
  Minus,
  Pencil,
  ArrowRight,
  Type,
  Eraser,
  Menu,
  Share2
} from "lucide-react";

export default function Toolbar({ setTool }: any) {
  const [activeTool, setActiveTool] = useState<number | null>(null);

  const tools = [
    { icon: MousePointer, type: "select" },
    { icon: Hand, type: "hand" },
    { icon: Square, type: "rectangle" },
    { icon: Circle, type: "circle" },
    { icon: Diamond, type: "diamond" },
    { icon: Minus, type: "line" },
    { icon: Pencil, type: "pencil" },
    { icon: ArrowRight, type: "arrow" },
    { icon: Type, type: "text" },
    { icon: Eraser, type: "eraser" }
  ];

  return (
    <div className="fixed top-4 left-4 right-4 flex items-center justify-between z-50">

      {/* LEFT MENU BUTTON */}
      <button className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300">
        <Menu size={18} />
      </button>

      {/* CENTER TOOLBAR */}
      <div className="flex items-center gap-1 p-2 rounded-md shadow-md bg-[#ececf4] dark:bg-[#1f1f25]">
        {tools.map(({ icon: Icon, type }, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveTool(i);
              setTool(type);
            }}
            className={`flex items-center justify-center w-9 h-9 rounded-md transition
            ${
              activeTool === i
                ? "bg-indigo-400 text-white"
                : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {/* SHARE BUTTON */}
      <button
        className="flex items-center justify-center w-10 h-10 rounded-sm
        bg-indigo-500 text-white
        hover:bg-indigo-600
        transition"
      >
        <Share2 size={14} />
      </button>

    </div>
  );
}