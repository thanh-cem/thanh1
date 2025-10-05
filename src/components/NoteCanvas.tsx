import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pencil, Eraser, MousePointer2, Download, Folder, Trash2 } from 'lucide-react';

// Resolve CSS variable tokens to concrete HSL color strings for Canvas
const resolveThemeHsl = (varName: string): string => {
  if (typeof window === 'undefined') return '#000000';
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  // Expect raw like: "10 50% 50%" or "10 50% 50% / 1"
  if (!raw) return '#000000';
  const parts = raw.split('/')[0].trim().split(/\s+/); // [H, S%, L%]
  if (parts.length < 3) return '#000000';
  const [h, s, l] = parts;
  // Normalize to comma-separated hsl(h, s, l) for better Canvas support
  return `hsl(${h}, ${s}, ${l})`;
};

// Tokens for UI swatches
const COLOR_SWATCHES = [
  { name: 'tomato-red', token: '--tomato-red' },
  { name: 'tomato-green', token: '--tomato-green' },
  { name: 'tomato-blue', token: '--tomato-blue' },
];

type Tool = 'pen' | 'eraser' | 'cursor';

const NoteCanvas = () => {
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<string>('');
  const colorRef = useRef<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [falling, setFalling] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [savedNotes, setSavedNotes] = useState<Array<{ id: string; createdAt: number; dataUrl: string }>>([]);
  const [stickersOpen, setStickersOpen] = useState(false);
  type StickerInstance = { id: string; key: string; x: number; y: number; scale: number; rot: number; selected?: boolean };
  const [stickers, setStickers] = useState<StickerInstance[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const dropGuardRef = useRef<number>(0);

  // Send flow state
  const [selectedSavedIds, setSelectedSavedIds] = useState<Set<string>>(new Set());
  const [enteringEmail, setEnteringEmail] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Target max size for a sticker (in CSS pixels) when initially added
  const STICKER_DROP_MAX = 90; // target max size in CSS px for initial drop

  // Base path for public assets (Vite/Next handle BASE_URL). Ensures '/foo.png' works under subpaths.
  const BASE = (import.meta as any)?.env?.BASE_URL || '/';
  const resolveStickerSrc = (path: string) => {
    const p = path.startsWith('/') ? path.slice(1) : path;
    return encodeURI(`${BASE}${p}`);
  };

  // Sticker catalog (from public/)
  const STICKER_FILES = [
    { key: 'but', src: '/but.png' },
    { key: 'ca1', src: '/ca1.png' },
    { key: 'ca2', src: '/ca2.png' },
    { key: 'ghe', src: '/ghe.png' },
    { key: 'sao', src: '/sao.png' },
    { key: 'not', src: '/not.png' },
    { key: 'chuoi', src: '/chuoi.png' },
    { key: 'tai', src: '/tai.png' },
  ];
  const stickerImagesRef = useRef<Record<string, HTMLImageElement>>({});
  useEffect(() => {
    // Preload/refresh stickers; if src mapping changes (HMR), update Image src too
    STICKER_FILES.forEach(({ key, src }) => {
      const encoded = resolveStickerSrc(src);
      const existing = stickerImagesRef.current[key];
      if (!existing) {
        const img = new Image();
        img.src = encoded;
        img.onerror = () => console.warn('Sticker failed to load:', encoded);
        stickerImagesRef.current[key] = img;
      } else if (existing.src !== encoded) {
        existing.src = encoded;
      }
    });
  }, [/* run on re-render to pick up src changes */ STICKER_FILES.map(s => s.src).join('|')]);

  // Initialize pen color from theme on mount; Resize canvases to container
  useEffect(() => {
    // Set initial resolved color
    const initial = resolveThemeHsl(COLOR_SWATCHES[0].token);
    setColor(initial);
    colorRef.current = initial;

    const bgCanvas = bgCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;
    const container = containerRef.current;
    if (!bgCanvas || !drawCanvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.min(rect.width - 32, 700); // padding consideration
      const height = Math.max(300, Math.min(480, (rect.width - 32) * 0.6));

      // Size background canvas
      bgCanvas.style.width = `${width}px`;
      bgCanvas.style.height = `${height}px`;
      bgCanvas.width = Math.floor(width * dpr);
      bgCanvas.height = Math.floor(height * dpr);

      // Size drawing canvas
      drawCanvas.style.width = `${width}px`;
      drawCanvas.style.height = `${height}px`;
      drawCanvas.width = Math.floor(width * dpr);
      drawCanvas.height = Math.floor(height * dpr);

      const bgCtx = bgCanvas.getContext('2d');
      if (bgCtx) {
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawPaperBackground(bgCtx, width, height);
      }
      // Set transform on drawing context as well so CSS pixel coords align
      const drawCtx = drawCanvas.getContext('2d');
      if (drawCtx) {
        drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resize();
    const obs = new ResizeObserver(resize);
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // Keep colorRef in sync so handlers see latest immediately
  useEffect(() => {
    if (color) colorRef.current = color;
  }, [color]);

  // Load saved notes on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('noteCanvas:saved');
      if (raw) setSavedNotes(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist saved notes
  useEffect(() => {
    try {
      localStorage.setItem('noteCanvas:saved', JSON.stringify(savedNotes));
    } catch {}
  }, [savedNotes]);

  // Draw paper background with subtle guide lines (drawn on background canvas only)
  const drawPaperBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#f3f1ec';
    ctx.fillRect(0, 0, width, height);
    // guide lines
    ctx.strokeStyle = 'rgba(37,47,80,0.10)';
    ctx.lineWidth = 1;
    const lineGap = 28;
    for (let y = 28; y < height; y += lineGap) {
      ctx.beginPath();
      ctx.moveTo(12, y);
      ctx.lineTo(width - 12, y);
      ctx.stroke();
    }
  };

  const getCtx = () => drawCanvasRef.current?.getContext('2d') ?? null;

  const pointerPos = (e: PointerEvent | React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'cursor') return; // no drawing
    // When starting to draw, unselect any selected sticker
    setStickers((prev) => prev.map((s) => (s.selected ? { ...s, selected: false } : s)));
    const ctx = getCtx();
    const canvas = drawCanvasRef.current;
    if (!ctx || !canvas) return;

    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);

    const { x, y } = pointerPos(e);
    // Apply current tool/color immediately at stroke start
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? 18 : 4;
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = colorRef.current || '#000000';
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? 18 : 4;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = colorRef.current || '#000000';
    }

    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endStroke = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const ctx = getCtx();
    if (ctx) ctx.closePath();
    if (e) {
      const canvas = drawCanvasRef.current;
      if (canvas) canvas.releasePointerCapture(e.pointerId);
    }
  };

  // Click to drop the note & reset
  const onCanvasClick = () => {
    if (tool !== 'cursor') return; // only when in cursor mode
    // Autosave current note before the fall animation
    saveCurrent();
    setFalling(true);
  };

  const handleAnimationEnd = () => {
    // After falling, reset canvas to new blank note
    const drawCanvas = drawCanvasRef.current;
    if (drawCanvas) {
      const ctx = drawCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    }
    // Clear drawn strokes and sticker instances
    setFalling(false);
    setStickers([]);
  };

  // Notify CursorTrail about tool changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('note-tool-changed', { detail: tool }));
  }, [tool]);

  // Auto-unselect stickers when switching away from cursor to pen/eraser
  useEffect(() => {
    if (tool !== 'cursor') {
      setStickers((prev) => prev.map((s) => (s.selected ? { ...s, selected: false } : s)));
    }
  }, [tool]);

  // Helper: add sticker instance at canvas position, auto-fit to STICKER_DROP_MAX using natural size
  const addStickerAt = (key: string, x: number, y: number, defaultScale = 0.5) => {
    const img = stickerImagesRef.current[key];
    const id = crypto.randomUUID();
    const computeFit = (nw: number, nh: number) => {
      const maxDim = Math.max(nw, nh) || 1;
      const s = Math.min(1, STICKER_DROP_MAX / maxDim);
      return Math.max(0.2, Math.min(1.0, s));
    };

    let scale = defaultScale;
    if (img && img.complete && img.naturalWidth && img.naturalHeight) {
      scale = computeFit(img.naturalWidth, img.naturalHeight);
    }

    setStickers((prev) => [
      { id, key, x, y, scale, rot: 0, selected: true },
      ...prev.map((s) => ({ ...s, selected: false })),
    ]);

    // If the image wasn't loaded yet, update this instance's scale when it loads
    if (img && !img.complete) {
      const onLoad = () => {
        const fitted = computeFit(img.naturalWidth, img.naturalHeight);
        setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, scale: fitted } : s)));
        img.removeEventListener('load', onLoad);
      };
      img.addEventListener('load', onLoad, { once: true });
    }
  };

  // Compose bg + draw onto a temp canvas and return dataURL
  const composeToDataUrl = (): string | null => {
    const bg = bgCanvasRef.current;
    const fg = drawCanvasRef.current;
    if (!bg || !fg) return null;

    // Use CSS pixel size for export to avoid DPR scaling artifacts
    const width = bg.clientWidth;
    const height = bg.clientHeight;
    if (!width || !height) return null;

    const temp = document.createElement('canvas');
    temp.width = width;
    temp.height = height;
    const tctx = temp.getContext('2d');
    if (!tctx) return null;

    // Draw scaled from device pixels to CSS pixels
    tctx.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, width, height);
    // Draw ink layer
    tctx.drawImage(fg, 0, 0, fg.width, fg.height, 0, 0, width, height);
    // Draw stickers on top (with rotation around center)
    const scaleX = width / (fg.clientWidth || width);
    const scaleY = height / (fg.clientHeight || height);
    stickers.forEach((s) => {
      const img = stickerImagesRef.current[s.key];
      if (!img || !img.complete) return;
      const baseW = img.naturalWidth;
      const baseH = img.naturalHeight;
      const drawW = baseW * s.scale * scaleX;
      const drawH = baseH * s.scale * scaleY;
      const cx = s.x * scaleX;
      const cy = s.y * scaleY;
      try {
        tctx.save();
        tctx.translate(cx, cy);
        tctx.rotate((s.rot || 0) * Math.PI / 180);
        tctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        tctx.restore();
      } catch {}
    });

    return temp.toDataURL('image/png');
  };

  const downloadDataUrl = (dataUrl: string, filename = 'note.png') => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const exportCurrent = () => {
    const dataUrl = composeToDataUrl();
    if (dataUrl) downloadDataUrl(dataUrl);
  };

  const saveCurrent = () => {
    const dataUrl = composeToDataUrl();
    if (!dataUrl) return;
    const note = { id: crypto.randomUUID(), createdAt: Date.now(), dataUrl };
    setSavedNotes((prev) => [note, ...prev].slice(0, 50)); // cap to 50
  };

  const exportSaved = (id: string) => {
    const n = savedNotes.find((s) => s.id === id);
    if (n) downloadDataUrl(n.dataUrl, `note-${id.slice(0,6)}.png`);
  };

  const deleteSaved = (id: string) => {
    setSavedNotes((prev) => prev.filter((n) => n.id !== id));
    setSelectedSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Send selected saved notes via Netlify Function
  const sendSelectedNotes = async () => {
    if (selectedSavedIds.size === 0) {
      alert('Select at least one saved note to send.');
      return;
    }
    if (!enteringEmail) {
      setEnteringEmail(true);
      return;
    }
    const email = sendEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email.');
      return;
    }
    try {
      setSending(true);
      const images = savedNotes.filter(n => selectedSavedIds.has(n.id)).map(n => n.dataUrl);
      const res = await fetch('/.netlify/functions/send-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, images }),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error('Send failed:', txt);
        alert('Failed to send. Please try again later.');
        return;
      }
      alert('Sent! Check your inbox.');
      setEnteringEmail(false);
      setSendEmail('');
      setSelectedSavedIds(new Set());
    } catch (e) {
      console.error(e);
      alert('Unexpected error.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Title Bar (glued spine) with toolbar */}
      <div className="w-full max-w-[740px] px-4">
        <div className="sketchy rounded-t-[var(--radius)] border-b-0 overflow-hidden">
          <div className="w-full min-h-12 bg-[#252f50] flex flex-wrap items-center gap-2 px-3 py-2">
            <Button
              size="sm"
              variant={tool === 'pen' ? 'default' : 'outline'}
              className={cn('sketchy', tool === 'pen' ? 'bg-[hsl(var(--tomato-red))] text-white' : 'bg-white/10 text-white border-white/40')}
              onClick={() => setTool('pen')}
            >
              <Pencil className="w-4 h-4 mr-1" /> Pen
            </Button>
            <Button
              size="sm"
              variant={tool === 'eraser' ? 'default' : 'outline'}
              className={cn('sketchy', tool === 'eraser' ? 'bg-[hsl(var(--tomato-green))] text-white' : 'bg-white/10 text-white border-white/40')}
              onClick={() => setTool('eraser')}
            >
              <Eraser className="w-4 h-4 mr-1" /> Eraser
            </Button>
            <Button
              size="sm"
              variant={tool === 'cursor' ? 'default' : 'outline'}
              className={cn('sketchy', tool === 'cursor' ? 'bg-[hsl(var(--tomato-blue))] text-white' : 'bg-white/10 text-white border-white/40')}
              onClick={() => setTool('cursor')}
            >
              <MousePointer2 className="w-4 h-4 mr-1" /> Cursor
            </Button>

            {/* Color swatches */}
            <div className="ml-2 flex items-center gap-2 bg-white/10 rounded-full px-2 py-1 border border-white/40">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c.name}
                  aria-label={`color-${c.name}`}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-bouncy',
                    color === resolveThemeHsl(c.token) ? 'scale-110 border-white' : 'border-white/40'
                  )}
                  style={{ backgroundColor: `hsl(var(${c.token}))` as string }}
                  onClick={() => {
                    const next = resolveThemeHsl(c.token);
                    colorRef.current = next; // immediate for handlers
                    setColor(next);
                  }}
                />
              ))}
            </div>

            {/* Spacer */}
            <div className="grow" />

            {/* Stickers toggle */}
            <Button
              size="sm"
              variant="outline"
              className="sketchy bg-white/10 text-white border-white/40"
              onClick={() => setStickersOpen((v) => !v)}
              title="Stickers"
            >
              Stickers
            </Button>

            {/* Export current */}
            <Button
              size="sm"
              variant="outline"
              className="sketchy bg-white/10 text-white border-white/40"
              onClick={exportCurrent}
              title="Export as PNG"
            >
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>
      </div>

      {/* Paper stack */}
      <div className="w-full max-w-[740px] px-4 -mt-1">
        <div
          ref={containerRef}
          className={cn(
            'relative sketchy shadow-crayon rounded-b-[var(--radius)] overflow-hidden transition-bouncy bg-[#f3f1ec]',
            falling && 'animate-note-fall'
          )}
          onAnimationEnd={handleAnimationEnd}
          onDragEnter={(e) => {
            e.preventDefault();
          }}
          onDragOver={(e) => {
            // allow drop from sticker panel
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            e.preventDefault();
            const now = performance.now();
            if (now - dropGuardRef.current < 250) return; // debounce duplicate drop events
            dropGuardRef.current = now;
            const dt = e.dataTransfer;
            const key = dt?.getData('application/x-sticker-key') || dt?.getData('text/plain') || dt?.getData('text');
            if (!key) return;
            const el = drawCanvasRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addStickerAt(key, x, y);
          }}
        >
          {/* Background canvas with guide lines */}
          <canvas
            ref={bgCanvasRef}
            className="block w-full h-full"
            aria-hidden="true"
          />
          {/* Foreground drawing canvas */}
          <canvas
            ref={drawCanvasRef}
            className="block w-full h-full cursor-crosshair absolute inset-0"
            style={{ backgroundColor: 'transparent' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endStroke}
            onPointerLeave={endStroke}
            onClick={onCanvasClick}
          />

          {/* Stickers overlay (HTML layer) - ignore pointer events so panel can be dragged */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {stickers.map((s) => (
              <div
                key={s.id}
                className={cn('group absolute select-none', s.selected && 'outline outline-2 outline-[hsl(var(--tomato-blue))]')}
                style={{ left: 0, top: 0, transform: `translate(${s.x}px, ${s.y}px) translate(-50%, -50%)` }}
              >
                <img
                  src={resolveStickerSrc(STICKER_FILES.find(f => f.key === s.key)?.src || '')}
                  draggable={false}
                  className="pointer-events-auto"
                  style={{ transform: `rotate(${s.rot || 0}deg) scale(${s.scale})`, transformOrigin: 'center center' }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setStickers((prev) => prev.map(x => ({ ...x, selected: x.id === s.id })));
                    setDraggingId(s.id);
                    const startX = e.clientX; const startY = e.clientY;
                    const init = { x: s.x, y: s.y };
                    const move = (ev: PointerEvent) => {
                      setStickers((prev) => prev.map(x => x.id === s.id ? { ...x, x: init.x + (ev.clientX - startX), y: init.y + (ev.clientY - startY) } : x));
                    };
                    const up = () => {
                      setDraggingId(null);
                      window.removeEventListener('pointermove', move);
                      window.removeEventListener('pointerup', up);
                    };
                    window.addEventListener('pointermove', move);
                    window.addEventListener('pointerup', up, { once: true });
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setStickers((prev) => prev.map(x => ({ ...x, selected: x.id === s.id })));
                  }}
                />
                {s.selected && (
                  <div
                    className="absolute -top-5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[hsl(var(--tomato-blue))] cursor-crosshair pointer-events-auto"
                    onPointerDown={(e) => {
                      e.preventDefault(); e.stopPropagation();
                      const startRot = s.rot || 0;
                      const rect = (e.currentTarget.parentElement as HTMLDivElement).getBoundingClientRect();
                      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                      const angleAt = (cx: number, cy: number, px: number, py: number) => Math.atan2(py - cy, px - cx) * 180 / Math.PI;
                      const startAngle = angleAt(center.x, center.y, e.clientX, e.clientY);
                      const move = (ev: PointerEvent) => {
                        const curr = angleAt(center.x, center.y, ev.clientX, ev.clientY);
                        const delta = curr - startAngle;
                        setStickers((prev) => prev.map(x => x.id === s.id ? { ...x, rot: startRot + delta } : x));
                      };
                      const up = () => {
                        window.removeEventListener('pointermove', move);
                        window.removeEventListener('pointerup', up);
                      };
                      window.addEventListener('pointermove', move);
                      window.addEventListener('pointerup', up, { once: true });
                    }}
                    title="Rotate"
                  />
                )}
                {s.selected && (
                  <div
                    className="absolute bottom-[-6px] right-[-6px] w-4 h-4 bg-[hsl(var(--tomato-blue))] rounded-sm cursor-nwse-resize pointer-events-auto"
                    onPointerDown={(e) => {
                      e.preventDefault(); e.stopPropagation();
                      setResizingId(s.id);
                      const startX = e.clientX; const startY = e.clientY;
                      const startScale = s.scale;
                      const move = (ev: PointerEvent) => {
                        const delta = Math.max(Math.abs(ev.clientX - startX), Math.abs(ev.clientY - startY));
                        const next = Math.max(0.2, Math.min(3, startScale + delta / 200));
                        setStickers((prev) => prev.map(x => x.id === s.id ? { ...x, scale: next } : x));
                      };
                      const up = () => {
                        setResizingId(null);
                        window.removeEventListener('pointermove', move);
                        window.removeEventListener('pointerup', up);
                      };
                      window.addEventListener('pointermove', move);
                      window.addEventListener('pointerup', up, { once: true });
                    }}
                  />
                )}
                {s.selected && (
                  <button
                    className="absolute -top-2 -right-2 text-[#252f50] text-sm leading-none pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setStickers((prev) => prev.filter(x => x.id !== s.id));
                    }}
                    aria-label="delete-sticker"
                    title="Delete"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Stickers vertical panel */}
          {stickersOpen && (
            <div className="absolute right-2 top-2 bottom-2 w-20 sketchy bg-white/90 shadow-crayon rounded-md p-2 overflow-y-auto pointer-events-auto z-20">
              <div className="flex flex-col gap-2">
                {STICKER_FILES.map(({ key, src }) => (
                  <img
                    key={key}
                    src={resolveStickerSrc(src)}
                    draggable
                    onDragStart={(e) => {
                      if (!e.dataTransfer) return;
                      e.dataTransfer.setData('application/x-sticker-key', key);
                      e.dataTransfer.setData('text/plain', key);
                      e.dataTransfer.setData('text', key);
                      e.dataTransfer.effectAllowed = 'copy';
                      // show actual image during drag
                      const target = e.currentTarget as HTMLImageElement;
                      if (target) {
                        const w = Math.min(120, target.naturalWidth);
                        const h = Math.min(120, target.naturalHeight);
                        e.dataTransfer.setDragImage(target, w / 2, h / 2);
                      }
                    }}
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      const placeholder = resolveStickerSrc('/placeholder.svg');
                      if (el && el.src.indexOf('placeholder.svg') === -1) {
                        el.src = placeholder;
                      }
                    }}
                    onDoubleClick={(e) => {
                      // Quick add on double click
                      const el = drawCanvasRef.current;
                      if (!el) return;
                      const rect = el.getBoundingClientRect();
                      const cx = rect.width / 2; const cy = rect.height / 2;
                      setStickers((prev) => [{ id: crypto.randomUUID(), key, x: cx, y: cy, scale: 0.7, rot: 0, selected: true }, ...prev.map(x => ({ ...x, selected: false }))]);
                    }}
                    className="w-full h-auto cursor-grab active:cursor-grabbing select-none"
                    alt={key}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls row under canvas */}
      <div className="w-full max-w-[740px] px-4 mt-3 flex items-center gap-3">
        <button
          className="px-3 py-1 sketchy bg-card/70 shadow-crayon text-sm"
          onClick={() => setGalleryOpen((v) => !v)}
          title="Show saved notes"
        >
          Saved Notes ({savedNotes.length})
        </button>
        <div className="grow" />
        {enteringEmail && (
          <input
            className="sketchy px-2 py-1 text-sm w-56"
            placeholder="Your email"
            value={sendEmail}
            onChange={(e) => setSendEmail(e.target.value)}
          />
        )}
        <Button
          size="sm"
          variant="outline"
          className="sketchy"
          disabled={sending}
          onClick={sendSelectedNotes}
          title={enteringEmail ? 'Send selected notes' : 'Select notes then click to send'}
        >
          {sending ? 'Sending…' : enteringEmail ? 'Send' : 'Send Notes'}
        </Button>
      </div>

      {/* Saved Notes Gallery */}
      <div className="w-full max-w-[740px] px-4 mt-3">
        {galleryOpen && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            {savedNotes.length === 0 && (
              <div className="col-span-full text-center text-crayon-text/70 py-6">No saved notes yet.</div>
            )}
            {savedNotes.map((n) => {
              const selected = selectedSavedIds.has(n.id);
              return (
                <div
                  key={n.id}
                  className={cn(
                    'relative sketchy bg-card/70 shadow-crayon rounded-md overflow-hidden cursor-pointer',
                    selected && 'ring-2 ring-[hsl(var(--tomato-blue))]'
                  )}
                  onClick={() => {
                    setSelectedSavedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(n.id)) next.delete(n.id); else next.add(n.id);
                      return next;
                    });
                  }}
                  onDoubleClick={() => {
                    setSelectedSavedIds((prev) => {
                      const next = new Set(prev);
                      next.delete(n.id);
                      return next;
                    });
                  }}
                >
                  <img src={n.dataUrl} alt="Saved note" className="block w-full aspect-[5/3] object-cover" />
                  <div className="absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded-md bg-white/80 text-[hsl(var(--tomato-blue))]">
                    {selected ? 'Selected' : 'Click to select'}
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <button
                      className="text-sm px-2 py-1 sketchy hover-wiggle"
                      onClick={(e) => { e.stopPropagation(); exportSaved(n.id); }}
                      title="Export PNG"
                    >
                      <Download className="w-4 h-4 inline mr-1" /> Export
                    </button>
                    <button
                      className="text-sm px-2 py-1 sketchy hover-wiggle text-tomato-red"
                      onClick={(e) => { e.stopPropagation(); deleteSaved(n.id); }}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCanvas;
