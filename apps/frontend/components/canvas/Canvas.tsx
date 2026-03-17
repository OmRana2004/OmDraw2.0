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

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);

  const [erasing, setErasing] = useState(false);

  const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

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

  /* ---------------- Redraw ---------------- */

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

  /* ---------------- Delete ---------------- */

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

  /* ---------------- Utils ---------------- */

  const isInsideShape = (el: Shape, x: number, y: number) => {
    if (el.type === "text" && el.width && el.height) {
      return (
        x >= el.x1! &&
        x <= el.x1! + el.width &&
        y >= el.y1! &&
        y <= el.y1! + el.height
      );
    }

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

    return (
      x >= Math.min(el.x1, el.x2) &&
      x <= Math.max(el.x1, el.x2) &&
      y >= Math.min(el.y1, el.y2) &&
      y <= Math.max(el.y1, el.y2)
    );
  };

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

    const size = 10;

    for (let i = 0; i < handles.length; i++) {
      const h = handles[i];

      if (
        x >= h.x - size &&
        x <= h.x + size &&
        y >= h.y - size &&
        y <= h.y + size
      ) {
        return i;
      }
    }

    return null;
  };

  /* ---------------- Mouse Down ---------------- */

  const handleMouseDown = (e: any) => {
    const x = e.nativeEvent.offsetX - pan.x;
    const y = e.nativeEvent.offsetY - pan.y;

    if (tool === "hand") return setPanning(true);

    if (tool === "eraser") {
      setErasing(true);
      setElements((prev) => prev.filter((el) => !isInsideShape(el, x, y)));
      return;
    }

    if (tool === "text") {
      setElements((prev) => [
        ...prev,
        { type: "text", x1: x, y1: y, textValue: "" },
      ]);
      setEditingTextIndex(elements.length);
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

        setDragOffset({ x: x - el.x1!, y: y - el.y1! });
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
    const x = e.nativeEvent.offsetX - pan.x;
    const y = e.nativeEvent.offsetY - pan.y;

    if (panning) {
      setPan((prev) => ({
        x: prev.x + e.nativeEvent.movementX,
        y: prev.y + e.nativeEvent.movementY,
      }));
      return;
    }

    if (erasing) {
      setElements((prev) => prev.filter((el) => !isInsideShape(el, x, y)));
      return;
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
        className="w-full h-full bg-white dark:bg-neutral-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {editingTextIndex !== null && elements[editingTextIndex] && (
  (() => {
    const el = elements[editingTextIndex];

    return (
      <textarea
        ref={inputRef}
        value={el.textValue || ""}
        onChange={(e) => {
          const val = e.target.value;

          setElements((prev) => {
            const updated = [...prev];
            if (!updated[editingTextIndex]) return prev;

            updated[editingTextIndex].textValue = val;
            return updated;
          });
        }}
        onBlur={() => setEditingTextIndex(null)}
        style={{
          position: "absolute",
          left: (el.x1 ?? 0) + pan.x,
          top: (el.y1 ?? 0) + pan.y,
          font: "28px Caveat, cursive",
          background: "transparent",
          outline: "none",
          border: "1px dashed #6366F1",
        }}
      />
    );
  })()
)}
    </div>
  );
}

/* ---------------- Selection ---------------- */

function drawSelection(
  canvas: HTMLCanvasElement,
  elements: Shape[],
  selectedIndex: number | null,
  isDark: boolean
) {
  // ✅ FIX 1: index + element check
  if (selectedIndex === null || !elements[selectedIndex]) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const el = elements[selectedIndex];

  // ✅ FIX 2: coordinate safety check
  if (
    el.x1 === undefined ||
    el.y1 === undefined ||
    el.x2 === undefined ||
    el.y2 === undefined
  ) return;

  const x = Math.min(el.x1, el.x2);
  const y = Math.min(el.y1, el.y2);
  const w = Math.abs(el.x2 - el.x1);
  const h = Math.abs(el.y2 - el.y1);

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
}