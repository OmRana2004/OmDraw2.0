"use client";

import { useRef, useEffect, useState } from "react";
import { drawShapes, Shape } from "./draw";

export default function Canvas({ tool }: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [elements, setElements] = useState<Shape[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [resizing, setResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<number | null>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);

  const [erasing, setErasing] = useState(false);

  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  /* ---------------- Canvas Resize ---------------- */

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

  /* ---------------- Clear Canvas Listener ---------------- */

  useEffect(() => {
    const handleClearCanvas = () => {
      setElements([]);
      setSelectedIndex(null);
    };

    window.addEventListener("clear-canvas", handleClearCanvas);

    return () => {
      window.removeEventListener("clear-canvas", handleClearCanvas);
    };
  }, []);

  /* ---------------- Redraw Canvas ---------------- */

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);

    drawShapes(canvas, elements, isDark);
    drawSelection(canvas, elements, selectedIndex, isDark);

    ctx.restore();
  }, [elements, selectedIndex, pan]);

  /* ---------------- Delete Key ---------------- */

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

  /* ---------------- Cursor ---------------- */

  const getCursor = () => {
    switch (tool) {
      case "hand":
        return panning ? "grabbing" : "grab";
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

  /* ---------------- Hit Detection ---------------- */

  const isInsideShape = (el: Shape, x: number, y: number) => {
    if (el.type === "pencil" && el.points) {
      return el.points.some(
        (p) => Math.abs(p.x - x) < 14 && Math.abs(p.y - y) < 14
      );
    }

    if (el.type === "circle") {
      const radius = Math.sqrt(
        (el.x2! - el.x1!) ** 2 + (el.y2! - el.y1!) ** 2
      );

      const dist = Math.sqrt((x - el.x1!) ** 2 + (y - el.y1!) ** 2);

      return dist <= radius + 8;
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

    return x >= minX - 6 && x <= maxX + 6 && y >= minY - 6 && y <= maxY + 6;
  };

  /* ---------------- Resize Handles ---------------- */

  const getHandleAtPosition = (el: Shape, x: number, y: number) => {
    if (
      el.x1 === undefined ||
      el.x2 === undefined ||
      el.y1 === undefined ||
      el.y2 === undefined
    )
      return null;

    const handles = [
      { x: el.x1, y: el.y1 },
      { x: el.x2, y: el.y1 },
      { x: el.x1, y: el.y2 },
      { x: el.x2, y: el.y2 },
    ];

    const hitArea = 14;

    for (let i = 0; i < handles.length; i++) {
      const h = handles[i];

      if (
        x >= h.x - hitArea &&
        x <= h.x + hitArea &&
        y >= h.y - hitArea &&
        y <= h.y + hitArea
      ) {
        return i;
      }
    }

    return null;
  };

  /* ---------------- Mouse Down ---------------- */

  const handleMouseDown = (e: any) => {
    const { offsetX, offsetY } = e.nativeEvent;

    const x = offsetX - pan.x;
    const y = offsetY - pan.y;

    if (tool === "hand") {
      setPanning(true);
      return;
    }

    if (tool === "eraser") {
      setErasing(true);
      setElements((prev) => prev.filter((el) => !isInsideShape(el, x, y)));
      return;
    }

    if (tool === "pencil") {
      setElements((prev) => [
        ...prev,
        { type: "pencil", points: [{ x, y }] },
      ]);
      setDrawing(true);
      return;
    }

    if (tool === "select") {
      const reversed = [...elements].reverse();
      const index = reversed.findIndex((el) => isInsideShape(el, x, y));

      if (index !== -1) {
        const realIndex = elements.length - 1 - index;
        const el = elements[realIndex];

        const handle = getHandleAtPosition(el, x, y);

        if (handle !== null) {
          setSelectedIndex(realIndex);
          setResizeHandle(handle);
          setResizing(true);
          return;
        }

        setDragOffset({
          x: x - el.x1!,
          y: y - el.y1!,
        });

        setSelectedIndex(realIndex);
        setDragging(true);
      } else {
        setSelectedIndex(null);
      }

      return;
    }

    setElements((prev) => [
      ...prev,
      { type: tool, x1: x, y1: y, x2: x, y2: y },
    ]);

    setDrawing(true);
  };

  /* ---------------- Mouse Move ---------------- */

  const handleMouseMove = (e: any) => {
    const { offsetX, offsetY, movementX, movementY } = e.nativeEvent;

    setMousePos({ x: offsetX, y: offsetY });

    const x = offsetX - pan.x;
    const y = offsetY - pan.y;

    if (panning) {
      setPan((prev) => ({
        x: prev.x + movementX,
        y: prev.y + movementY,
      }));
      return;
    }

    if (erasing) {
      setElements((prev) => prev.filter((el) => !isInsideShape(el, x, y)));
      return;
    }

    if (drawing && tool === "pencil") {
      setElements((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].points?.push({ x, y });
        return updated;
      });
      return;
    }

    if (drawing) {
      setElements((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          x2: x,
          y2: y,
        };
        return updated;
      });
    }

    if (resizing && selectedIndex !== null) {
      setElements((prev) => {
        const updated = [...prev];
        const el = updated[selectedIndex];

        switch (resizeHandle) {
          case 0:
            el.x1 = x;
            el.y1 = y;
            break;
          case 1:
            el.x2 = x;
            el.y1 = y;
            break;
          case 2:
            el.x1 = x;
            el.y2 = y;
            break;
          case 3:
            el.x2 = x;
            el.y2 = y;
            break;
        }

        return updated;
      });

      return;
    }

    if (dragging && selectedIndex !== null) {
      setElements((prev) => {
        const updated = [...prev];
        const el = updated[selectedIndex];

        const width = el.x2! - el.x1!;
        const height = el.y2! - el.y1!;

        const newX = x - dragOffset.x;
        const newY = y - dragOffset.y;

        updated[selectedIndex] = {
          ...el,
          x1: newX,
          y1: newY,
          x2: newX + width,
          y2: newY + height,
        };

        return updated;
      });
    }
  };

  /* ---------------- Mouse Up ---------------- */

  const handleMouseUp = () => {
    setDrawing(false);
    setDragging(false);
    setResizing(false);
    setResizeHandle(null);
    setPanning(false);
    setErasing(false);
  };

  /* ---------------- UI ---------------- */

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
            left: mousePos.x - 14,
            top: mousePos.y - 14,
            width: 16,
            height: 16,
            background: isDark ? "white" : "black",
            border: isDark ? "2px solid black" : "2px solid white",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Selection Box ---------------- */

function drawSelection(
  canvas: HTMLCanvasElement,
  elements: Shape[],
  selectedIndex: number | null,
  isDark: boolean
) {
  if (selectedIndex === null) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const el = elements[selectedIndex];

  const x = Math.min(el.x1!, el.x2!);
  const y = Math.min(el.y1!, el.y2!);
  const w = Math.abs(el.x2! - el.x1!);
  const h = Math.abs(el.y2! - el.y1!);

  ctx.save();

  ctx.strokeStyle = "#6366F1";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  const size = 10;

  const handles = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
  ];

  handles.forEach(([hx, hy]) => {
    ctx.fillStyle = isDark ? "#1f2937" : "#ffffff";
    ctx.strokeStyle = "#6366F1";

    ctx.beginPath();
    ctx.rect(hx - size / 2, hy - size / 2, size, size);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}