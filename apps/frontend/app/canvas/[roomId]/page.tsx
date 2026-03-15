import Canvas from "@/components/canvas/Canvas";
import Toolbar from "@/components/canvas/Toolbar";
import Sidebar from "@/components/canvas/Sidebar";

export default function CanvasPage() {
  return (
    <div className="w-screen h-screen">
      <Toolbar />
      <Canvas />
      <Sidebar />
    </div>
  );
}