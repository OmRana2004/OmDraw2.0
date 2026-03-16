"use client";

import { useRef, useEffect, useState } from "react";
import { drawShapes, Shape } from "./draw";

export default function Canvas({ tool }: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [elements, setElements] = useState<Shape[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // canvas resize
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

  // redraw shapes
  useEffect(() => {
    if (!canvasRef.current) return;

    drawShapes(canvasRef.current, elements);
    drawSelection(canvasRef.current, elements, selectedIndex);
  }, [elements, selectedIndex]);

  // delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedIndex !== null) {
        setElements((prev) => prev.filter((_, i) => i !== selectedIndex));
        setSelectedIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  // cursor system
  const getCursor = () => {
    switch (tool) {
      case "hand":
        return "grab";

      case "eraser":
        return "none";

      case "rectangle":
      case "circle":
      case "diamond":
      case "line":
      case "arrow":
      case "pencil":
        return "crosshair";

      default:
        return "default";
    }
  };

  // hit detection
  const isInsideShape = (el: Shape, x: number, y: number) => {
    if (el.type === "pencil" && el.points) {
      return el.points.some(
        (p) => Math.abs(p.x - x) < 6 && Math.abs(p.y - y) < 6
      );
    }

    if (
      el.x1 === undefined ||
      el.x2 === undefined ||
      el.y1 === undefined ||
      el.y2 === undefined
    )
      return false;

    const minX = Math.min(el.x1, el.x2);
    const maxX = Math.max(el.x1, el.x2);
    const minY = Math.min(el.y1, el.y2);
    const maxY = Math.max(el.y1, el.y2);

    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  };

  const handleMouseDown = (e: any) => {
    const { offsetX, offsetY } = e.nativeEvent;

    // select tool
    if (tool === "select") {
      const index = elements.findIndex((el) =>
        isInsideShape(el, offsetX, offsetY)
      );

      if (index !== -1) {
        setSelectedIndex(index);
        setDragging(true);
      } else {
        setSelectedIndex(null);
      }

      return;
    }

    // eraser
    if (tool === "eraser") {
      setElements((prev) =>
        prev.filter((el) => !isInsideShape(el, offsetX, offsetY))
      );
      return;
    }

    // pencil
    if (tool === "pencil") {
      setElements((prev) => [
        ...prev,
        {
          type: "pencil",
          points: [{ x: offsetX, y: offsetY }],
        },
      ]);

      setDrawing(true);
      return;
    }

    if (tool === "hand") return;

    // shapes
    setElements((prev) => [
      ...prev,
      {
        type: tool,
        x1: offsetX,
        y1: offsetY,
        x2: offsetX,
        y2: offsetY,
      },
    ]);

    setDrawing(true);
  };

  const handleMouseMove = (e: any) => {
    const { offsetX, offsetY } = e.nativeEvent;

    setMousePos({ x: offsetX, y: offsetY });

    // pencil drawing
    if (drawing && tool === "pencil") {
      setElements((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];

        last.points?.push({ x: offsetX, y: offsetY });

        return updated;
      });

      return;
    }

    // shape drawing
    if (drawing) {
      setElements((prev) => {
        const updated = [...prev];
        const index = updated.length - 1;

        updated[index] = {
          ...updated[index],
          x2: offsetX,
          y2: offsetY,
        };

        return updated;
      });
    }

    // drag shape
    if (dragging && selectedIndex !== null) {
      setElements((prev) => {
        const updated = [...prev];
        const el = updated[selectedIndex];

        if (
          el.x1 === undefined ||
          el.x2 === undefined ||
          el.y1 === undefined ||
          el.y2 === undefined
        )
          return prev;

        const width = el.x2 - el.x1;
        const height = el.y2 - el.y1;

        updated[selectedIndex] = {
          ...el,
          x1: offsetX,
          y1: offsetY,
          x2: offsetX + width,
          y2: offsetY + height,
        };

        return updated;
      });
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
    setDragging(false);
  };

  return (
    <div className="w-screen h-screen relative">
      <canvas
        ref={canvasRef}
        style={{ cursor: getCursor() }}
        className="w-full h-full bg-white dark:bg-neutral-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {tool === "eraser" && (
        <div
          style={{
            position: "absolute",
            left: mousePos.x - 8,
            top: mousePos.y - 8,
            width: 16,
            height: 16,
            background: "black",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

function drawSelection(
  canvas: HTMLCanvasElement,
  elements: Shape[],
  selectedIndex: number | null
) {
  if (selectedIndex === null) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const el = elements[selectedIndex];

  if (
    el.x1 === undefined ||
    el.x2 === undefined ||
    el.y1 === undefined ||
    el.y2 === undefined
  )
    return;

  const x = Math.min(el.x1, el.x2);
  const y = Math.min(el.y1, el.y2);
  const w = Math.abs(el.x2 - el.x1);
  const h = Math.abs(el.y2 - el.y1);

  ctx.save();

  ctx.strokeStyle = "#4F46E5";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(x, y, w, h);

  ctx.setLineDash([]);

  const handles = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ];

  handles.forEach(([hx, hy]) => {
    ctx.fillStyle = "#4F46E5";
    ctx.fillRect(hx - 4, hy - 4, 8, 8);
  });

  ctx.restore();
}