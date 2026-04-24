import { useEffect, useRef, useCallback } from "react";

interface Point {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  closest?: Point[];
  circle?: { active: number; color: string };
}

export function InteractiveMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const pointsRef = useRef<Point[]>([]);

  // Radius of the clear circle in the center (behind logo + text)
  const VOID_RADIUS = 280;

  const initPoints = useCallback((width: number, height: number) => {
    const points: Point[] = [];
    const spacingX = width / 24;
    const spacingY = height / 18;
    const cx = width / 2;
    const cy = height / 2;

    for (let x = 0; x < width + spacingX; x += spacingX) {
      for (let y = 0; y < height + spacingY; y += spacingY) {
        const px = x + Math.random() * spacingX * 0.5;
        const py = y + Math.random() * spacingY * 0.5;

        // Skip points inside the center void circle
        const distToCenter = Math.hypot(px - cx, py - cy);
        if (distToCenter < VOID_RADIUS - 20) continue;

        points.push({
          x: px,
          y: py,
          originX: px,
          originY: py,
          vx: 0,
          vy: 0,
          circle: {
            active: 0,
            color: Math.random() > 0.5
              ? `rgba(45, 212, 191, `  // teal
              : `rgba(96, 165, 250, `, // blue accent
          },
        });
      }
    }

    // Find closest neighbors for each point
    for (let i = 0; i < points.length; i++) {
      const sorted = points
        .filter((_, j) => j !== i)
        .sort((a, b) => {
          const dA = Math.hypot(a.x - points[i].x, a.y - points[i].y);
          const dB = Math.hypot(b.x - points[i].x, b.y - points[i].y);
          return dA - dB;
        });
      points[i].closest = sorted.slice(0, 5);
    }

    return points;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      pointsRef.current = initPoints(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;
      const points = pointsRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (const p of points) {
        const dx = mx - p.originX;
        const dy = my - p.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 280;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 35;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 0.04;
          p.vy += Math.sin(angle) * force * 0.04;
          p.circle!.active = Math.min(1, (1 - dist / maxDist) * 1.5);
        } else {
          p.circle!.active *= 0.96;
        }

        // Spring back to origin
        p.vx += (p.originX - p.x) * 0.03;
        p.vy += (p.originY - p.y) * 0.03;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw ALL connections — bright and visible
      for (const p of points) {
        if (!p.closest) continue;
        for (const neighbor of p.closest) {
          const d = Math.hypot(p.x - neighbor.x, p.y - neighbor.y);
          const maxLineDist = 220;
          if (d < maxLineDist) {
            // Fade lines near the void edge
            const midX = (p.x + neighbor.x) / 2;
            const midY = (p.y + neighbor.y) / 2;
            const distToVoid = Math.hypot(midX - cx, midY - cy);
            const voidFade = Math.min(1, Math.max(0, (distToVoid - VOID_RADIUS + 40) / 40));

            // Base visibility is high (0.15), cursor hover boosts it further
            const baseAlpha = 0.15;
            const hoverBoost = p.circle!.active * 0.6;
            const alpha = (baseAlpha + hoverBoost) * (1 - d / maxLineDist) * voidFade;
            if (alpha < 0.005) continue;

            ctx.beginPath();
            ctx.strokeStyle = `rgba(45, 212, 191, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(neighbor.x, neighbor.y);
            ctx.stroke();
          }
        }
      }

      // Draw ALL points — bright and visible
      for (const p of points) {
        const distToVoid = Math.hypot(p.x - cx, p.y - cy);
        const voidFade = Math.min(1, Math.max(0, (distToVoid - VOID_RADIUS + 40) / 40));

        // Base visibility is high, cursor hover boosts it
        const baseAlpha = 0.2;
        const hoverAlpha = p.circle!.active * 0.8;
        const alpha = (baseAlpha + hoverAlpha) * voidFade;
        if (alpha < 0.005) continue;

        const radius = 2 + p.circle!.active * 3;

        // Glow on hover
        if (p.circle!.active > 0.1 && voidFade > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius + 10, 0, Math.PI * 2);
          ctx.fillStyle = p.circle!.color + `${alpha * 0.2})`;
          ctx.fill();
        }

        // Core dot — always visible
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.circle!.color + `${alpha})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [initPoints]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
