"use client";

import { useState } from "react";
import Canvas from "@/components/canvas/Canvas";
import Toolbar from "@/components/canvas/Toolbar";
import Sidebar from "@/components/canvas/Sidebar";

export default function CanvasPage() {
  const [tool, setTool] = useState("rectangle");

  return (
    <div className="w-screen h-screen">
      <Toolbar setTool={setTool} />
      <Canvas tool={tool} />
      <Sidebar />
    </div>
  );
}