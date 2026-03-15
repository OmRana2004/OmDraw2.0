export type Tool =
  | "select"
  | "pan"
  | "rectangle"
  | "line"
  | "pencil"
  | "eraser";

export type Shape =
  | {
      id: string;
      type: "rectangle";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      id: string;
      type: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };