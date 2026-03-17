import rough from "roughjs";

export type Shape = {
  type:
    | "rectangle"
    | "circle"
    | "line"
    | "diamond"
    | "arrow"
    | "pencil"
    | "text";

  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;

  points?: { x: number; y: number }[];

  textValue?: string;
  width?: number;
  height?: number;
};

export function drawShapes(
  canvas: HTMLCanvasElement,
  elements: Shape[],
  isDark: boolean
) {
  const rc = rough.canvas(canvas);
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const strokeColor = isDark ? "#f9fafb" : "#111827";

  elements.forEach((el) => {
    const options = {
      roughness: 0,
      bowing: 0,
      strokeWidth: 2,
      seed: 1,
      stroke: strokeColor,
    };

    // RECTANGLE
    if (el.type === "rectangle" && el.x1 !== undefined) {
      const x = el.x1;
      const y = el.y1!;
      const w = el.x2! - el.x1!;
      const h = el.y2! - el.y1!;

      const r = Math.min(20, Math.abs(w) / 4, Math.abs(h) / 4);

      const path = `
        M ${x + r} ${y}
        L ${x + w - r} ${y}
        Q ${x + w} ${y} ${x + w} ${y + r}
        L ${x + w} ${y + h - r}
        Q ${x + w} ${y + h} ${x + w - r} ${y + h}
        L ${x + r} ${y + h}
        Q ${x} ${y + h} ${x} ${y + h - r}
        L ${x} ${y + r}
        Q ${x} ${y} ${x + r} ${y}
        Z
      `;

      rc.path(path, options);
    }

    // CIRCLE
    if (el.type === "circle" && el.x1 !== undefined) {
      const radius = Math.sqrt(
        (el.x2! - el.x1!) ** 2 + (el.y2! - el.y1!) ** 2
      );

      rc.circle(el.x1, el.y1!, radius * 2, options);
    }

    // LINE
    if (el.type === "line" && el.x1 !== undefined) {
      rc.line(el.x1, el.y1!, el.x2!, el.y2!, options);
    }

    // DIAMOND
    if (el.type === "diamond" && el.x1 !== undefined) {
      const midX = (el.x1 + el.x2!) / 2;
      const midY = (el.y1! + el.y2!) / 2;

      rc.polygon(
        [
          [midX, el.y1!],
          [el.x2!, midY],
          [midX, el.y2!],
          [el.x1, midY],
        ],
        options
      );
    }

    // ARROW
    if (el.type === "arrow" && el.x1 !== undefined) {
      rc.line(el.x1, el.y1!, el.x2!, el.y2!, options);

      const headLength = 12;
      const angle = Math.atan2(el.y2! - el.y1!, el.x2! - el.x1!);

      const arrow1 = [
        el.x2! - headLength * Math.cos(angle - Math.PI / 6),
        el.y2! - headLength * Math.sin(angle - Math.PI / 6),
      ];

      const arrow2 = [
        el.x2! - headLength * Math.cos(angle + Math.PI / 6),
        el.y2! - headLength * Math.sin(angle + Math.PI / 6),
      ];

      rc.line(el.x2!, el.y2!, arrow1[0], arrow1[1], options);
      rc.line(el.x2!, el.y2!, arrow2[0], arrow2[1], options);
    }

    // PENCIL
    if (el.type === "pencil" && el.points) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = strokeColor;

      el.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });

      ctx.stroke();
    }

    // TEXT
    if (el.type === "text" && el.x1 !== undefined && el.textValue !== undefined) {
      const textColor = isDark ? "#f59e0b" : "#d97706";

      ctx.font = "28px Caveat, cursive";
      ctx.fillStyle = textColor;
      ctx.textBaseline = "top";

      ctx.fillText(el.textValue, el.x1, el.y1!);

      const metrics = ctx.measureText(el.textValue);
      el.width = metrics.width;
      el.height = 28;
    }
  });
}