"use client";

import { useRef, useEffect } from "react";

export default function Canvas({ background = "plain" }: { background?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const gridClass =
    background === "grid"
      ? "bg-[linear-gradient(#444_1px,transparent_1px),linear-gradient(90deg,#444_1px,transparent_1px)] bg-[size:20px_20px]"
      : "bg-white dark:bg-neutral-900";

  return (
    <div className={`w-screen h-screen relative ${gridClass}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}