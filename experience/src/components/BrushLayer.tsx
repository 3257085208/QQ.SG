import { useEffect, useRef } from "react";

type Mark = { x: number; y: number; age: number; size: number; angle: number };

export function BrushLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const parent = canvas.parentElement;
    if (parent === null) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const surface: HTMLCanvasElement = canvas;
    const host: HTMLElement = parent;
    const brush: CanvasRenderingContext2D = context;

    const marks: Mark[] = [];
    let ratio = 1;
    let width = 0;
    let height = 0;
    let previous: { x: number; y: number } | null = null;
    let frame = 0;

    function resize() {
      const rect = host.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio, 2);
      width = rect.width;
      height = rect.height;
      surface.width = Math.floor(width * ratio);
      surface.height = Math.floor(height * ratio);
      surface.style.width = `${width}px`;
      surface.style.height = `${height}px`;
      brush.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function addPoint(x: number, y: number) {
      if (!previous) {
        previous = { x, y };
        return;
      }
      const distance = Math.hypot(x - previous.x, y - previous.y);
      if (distance < 4) return;
      marks.push({ x, y, age: 0, size: 32 + Math.random() * 44, angle: Math.atan2(y - previous.y, x - previous.x) });
      previous = { x, y };
      while (marks.length > 80) marks.shift();
    }

    function paint() {
      brush.clearRect(0, 0, width, height);
      marks.forEach((mark, index) => {
        const opacity = Math.max(0, 1 - mark.age / 34);
        brush.save();
        brush.globalAlpha = opacity * 0.74;
        brush.translate(mark.x, mark.y);
        brush.rotate(mark.angle);
        for (let fiber = -4; fiber <= 4; fiber += 1) {
          const wobble = Math.sin(index * 1.8 + fiber) * 3;
          brush.strokeStyle = fiber === -3 || fiber === 3 ? "#d5ff00" : "#20221d";
          brush.lineWidth = fiber === -3 || fiber === 3 ? 2 : 1;
          brush.beginPath();
          brush.moveTo(-mark.size * 0.45, fiber * 4 + wobble);
          brush.quadraticCurveTo(0, fiber * 4 - wobble, mark.size * 0.45, fiber * 4 + wobble);
          brush.stroke();
        }
        brush.globalAlpha = opacity * 0.2;
        brush.fillStyle = "#d5ff00";
        brush.beginPath();
        brush.ellipse(0, 0, mark.size * 0.45, mark.size * 0.14, 0, 0, Math.PI * 2);
        brush.fill();
        brush.restore();
        mark.age += 1;
      });
      for (let index = marks.length - 1; index >= 0; index -= 1) {
        if (marks[index].age > 36) marks.splice(index, 1);
      }
      frame = window.requestAnimationFrame(paint);
    }

    function onPointerMove(event: PointerEvent) {
      const rect = host.getBoundingClientRect();
      addPoint(event.clientX - rect.left, event.clientY - rect.top);
    }

    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", () => { previous = null; }, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    resize();
    paint();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas className="brush-layer" ref={canvasRef} aria-hidden="true" />;
}
