import { useEffect, useRef } from 'react';

const COLORS = ['#a3e635', '#4d7c0f', '#2a78d6', '#eb6834', '#e0a615', '#8a6ad6'];

/**
 * Canvas confetti for milestone moments. Deliberately short (about 1.6s) and
 * skipped entirely under prefers-reduced-motion.
 */
export default function Confetti({ fire, pieces = 90, onDone }) {
  const canvasRef = useRef(null);
  const raf = useRef();

  useEffect(() => {
    if (!fire) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone?.();
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = (canvas.width = canvas.offsetWidth * dpr);
    const h = (canvas.height = canvas.offsetHeight * dpr);
    ctx.scale(dpr, dpr);

    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;

    const parts = Array.from({ length: pieces }, () => ({
      x: cw / 2 + (Math.random() - 0.5) * cw * 0.35,
      y: ch * 0.42 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 11 - 4,
      size: 4 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
    }));

    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, cw, ch);

      for (const p of parts) {
        p.vy += 0.28; // gravity
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / 1600);

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (elapsed < 1700) raf.current = requestAnimationFrame(tick);
      else {
        ctx.clearRect(0, 0, cw, ch);
        onDone?.();
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [fire, pieces, onDone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    />
  );
}
