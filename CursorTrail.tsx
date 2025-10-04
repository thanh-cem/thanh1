import { useEffect, useRef } from 'react';

const CursorTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointsRef = useRef<Array<{ x: number; y: number; t: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setSize();
    window.addEventListener('resize', setSize);

    const onMove = (e: MouseEvent) => {
      pointsRef.current.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      // keep only last N points for performance
      if (pointsRef.current.length > 60) pointsRef.current.shift();
    };

    window.addEventListener('mousemove', onMove);

    const render = () => {
      const now = performance.now();
      // Clear frame; we rely on point aging for fade
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pts = pointsRef.current;
      // drop very old points
      const maxAge = 800; // ms
      while (pts.length && now - pts[0].t > maxAge) {
        pts.shift();
      }

      if (pts.length >= 2) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const r = 37, g = 47, b = 80; // #252f50
        // Draw each segment with a few jittered strokes for a pencil feel
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          const age = now - p1.t;
          const life = Math.max(0, 1 - age / maxAge);
          const baseW = 0.8 + life * 2.8; // 0.8px to ~3.6px
          const alpha = 0.10 + life * 0.45; // softer pencil alpha

          // Layer 2-3 strokes with tiny jitter
          const layers = 2 + ((i % 2) & 1); // 2 or 3 layers alternating for variety
          for (let j = 0; j < layers; j++) {
            const jx = (Math.random() - 0.5) * 0.8; // ±0.4px
            const jy = (Math.random() - 0.5) * 0.8;
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = baseW * (1 - j * 0.18);
            ctx.beginPath();
            ctx.moveTo(p0.x + jx, p0.y + jy);
            ctx.lineTo(p1.x + jx, p1.y + jy);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', setSize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
    />
  );
};

export default CursorTrail;
