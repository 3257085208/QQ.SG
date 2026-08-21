import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

type BrushMark = {
  x: number;
  y: number;
  length: number;
  width: number;
  angle: number;
  opacity: number;
  seed: number;
  born: number;
  life: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function wobble(seed: number, index: number) {
  return Math.sin(seed * 17.17 + index * 4.31) * .5 + .5;
}

function drawBrushMark(context: CanvasRenderingContext2D, mark: BrushMark, fade: number) {
  const alpha = mark.opacity * fade;
  if (alpha <= .005) return;

  const length = mark.length * (.92 + wobble(mark.seed, 2) * .12);
  const width = mark.width * (.9 + wobble(mark.seed, 3) * .16);
  const edge = (index: number) => (wobble(mark.seed, index) - .5) * width * .32;

  context.save();
  context.translate(mark.x, mark.y);
  context.rotate(mark.angle);
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = alpha;
  context.fillStyle = "#e1ddd0";
  context.beginPath();
  context.moveTo(-length * .62, edge(1) - width * .12);
  context.bezierCurveTo(-length * .4, -width * .72 + edge(2), -length * .08, -width * .54 + edge(3), length * .23, -width * .38 + edge(4));
  context.bezierCurveTo(length * .54, -width * .2 + edge(5), length * .67, width * .12 + edge(6), length * .48, width * .38 + edge(7));
  context.bezierCurveTo(length * .18, width * .62 + edge(8), -length * .2, width * .54 + edge(9), -length * .53, width * .3 + edge(10));
  context.bezierCurveTo(-length * .7, width * .16 + edge(11), -length * .72, -width * .03 + edge(12), -length * .62, edge(1) - width * .12);
  context.closePath();
  context.fill();

  context.globalCompositeOperation = "destination-out";
  context.globalAlpha = .12 * fade;
  context.lineCap = "butt";
  const bristleCount = 3 + Math.floor(wobble(mark.seed, 13) * 3);
  for (let index = 0; index < bristleCount; index += 1) {
    const offset = (index - (bristleCount - 1) / 2) * width * .18;
    const start = -length * (.48 + wobble(mark.seed, index + 20) * .12);
    const end = length * (.36 + wobble(mark.seed, index + 30) * .22);
    context.beginPath();
    context.moveTo(start, offset - width * .05);
    context.quadraticCurveTo((start + end) * .36, offset + edge(index + 40) * .2, end, offset + edge(index + 50) * .15);
    context.lineWidth = Math.max(1, width * (.025 + wobble(mark.seed, index + 60) * .025));
    context.strokeStyle = "#000";
    context.stroke();
  }

  context.globalCompositeOperation = "source-over";
  context.globalAlpha = alpha * .18;
  context.strokeStyle = "#f0ece0";
  context.lineWidth = Math.max(.7, width * .018);
  context.beginPath();
  context.moveTo(-length * .5, edge(70) - width * .22);
  context.quadraticCurveTo(-length * .02, edge(71), length * .5, edge(72) + width * .12);
  context.stroke();
  context.restore();
}

export function HeroInkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas?.closest<HTMLElement>(".intro-stage");
    const intro = stage?.closest<HTMLElement>(".intro");
    if (!canvas || !stage || !intro || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const marks: BrushMark[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let progress = 0;
    let lastPoint: Point | null = null;
    let lastMoveAt = 0;

    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
    };

    const updateProgress = () => {
      const total = Math.max(1, intro.offsetHeight - stage.clientHeight);
      progress = clamp(-intro.getBoundingClientRect().top / total, 0, 1);
    };

    const render = (now: number) => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      for (let index = marks.length - 1; index >= 0; index -= 1) {
        const mark = marks[index];
        const age = now - mark.born;
        if (age >= mark.life) {
          marks.splice(index, 1);
          continue;
        }
        const normalized = age / mark.life;
        const fade = normalized < .14
          ? normalized / .14
          : Math.pow(1 - (normalized - .14) / .86, 1.35);
        drawBrushMark(context, mark, clamp(fade, 0, 1));
      }
      if (marks.length) frame = window.requestAnimationFrame(render);
    };

    const wake = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      updateProgress();
      const bounds = canvas.getBoundingClientRect();
      const next = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      const now = performance.now();
      if (!lastPoint) {
        lastPoint = next;
        lastMoveAt = now;
        return;
      }

      const dx = next.x - lastPoint.x;
      const dy = next.y - lastPoint.y;
      const distance = Math.hypot(dx, dy);
      const elapsed = Math.max(8, now - lastMoveAt);
      const speed = distance / elapsed;
      lastPoint = next;
      lastMoveAt = now;

      if (progress >= .52 || distance < 1.5 || speed < .02) return;
      const phaseFade = progress <= .25 ? 1 : clamp(1 - (progress - .25) / .27, 0, 1);
      if (phaseFade <= .01) return;

      const angle = Math.atan2(dy, dx);
      const normalX = -Math.sin(angle);
      const normalY = Math.cos(angle);
      const fast = clamp(speed / 1.6, 0, 1);
      const steps = Math.max(1, Math.ceil(distance / 12));
      const density = speed < .45 ? 3 : 2;
      for (let step = 1; step <= steps; step += 1) {
        const ratio = step / steps;
        const centerX = next.x - dx * (1 - ratio);
        const centerY = next.y - dy * (1 - ratio);
        for (let layer = 0; layer < density; layer += 1) {
          const spread = (layer - (density - 1) / 2) * (24 - fast * 10);
          marks.push({
            x: centerX + normalX * spread,
            y: centerY + normalY * spread,
            length: 34 + fast * 68 + Math.random() * 15,
            width: 38 - fast * 17 + Math.random() * 9,
            angle: angle + (Math.random() - .5) * (.12 + fast * .08),
            opacity: (.42 + (1 - fast) * .16) * phaseFade,
            seed: Math.random() * 1000,
            born: now,
            life: 1000 + Math.random() * 700
          });
        }
      }
      if (marks.length > 620) marks.splice(0, marks.length - 620);
      wake();
    };

    const resetPointer = () => {
      lastPoint = null;
    };

    resize();
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    resizeObserver?.observe(stage);
    stage.addEventListener("pointermove", handlePointerMove, { passive: true });
    stage.addEventListener("pointerleave", resetPointer, { passive: true });
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("resize", resize);
      marks.length = 0;
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-ink-canvas" aria-hidden="true" />;
}
