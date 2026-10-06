import React, { useEffect, useRef, useState } from 'react';

type CursorMode = 'default' | 'button' | 'photo' | 'expand' | 'secret' | 'link' | 'text';

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  vx: number;
  vy: number;
  color: string;
}

export const CinematicCursor: React.FC = () => {
  const [isSupportedDesktop, setIsSupportedDesktop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>('default');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const expandLabelRef = useRef<HTMLDivElement | null>(null);

  // Positional and state refs for 60fps RAF loop
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const ringScale = useRef(1);
  const targetRingScale = useRef(1);
  const isHoveringExpand = useRef(false);
  const isHoveringSecret = useRef(false);
  const prefersReducedMotionRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastEmitTime = useRef(0);
  const lastEmitPos = useRef({ x: -100, y: -100 });

  // 1. Precise desktop detection (strictly excludes phones, tablets, pure touch devices)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    const isTouchOnly = 'ontouchstart' in window && !canHover;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = reducedMotionQuery.matches;

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    if (hasFinePointer && !isTouchOnly) {
      setIsSupportedDesktop(true);
      document.body.classList.add('has-cinematic-cursor');
    }

    return () => {
      document.body.classList.remove('has-cinematic-cursor');
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // 2. Event listeners for mouse tracking & interactive element detection
  useEffect(() => {
    if (!isSupportedDesktop) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Ignore simulated touch mouse events
      if (e.pointerType === 'touch') return;

      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
        // Instant sync on first movement into window
        ringPos.current.x = e.clientX;
        ringPos.current.y = e.clientY;
      }

      // Detect element under pointer
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!target) {
        setCursorMode('default');
        targetRingScale.current = 1;
        isHoveringExpand.current = false;
        isHoveringSecret.current = false;
        return;
      }

      // Check for expandable photos / full photo view
      const isExpand = !!target.closest('[data-cursor="expand"], [data-fullscreen-trigger="true"]');
      const isPhoto = isExpand || !!target.closest('[data-cursor="photo"], img, .photo-card, .aspect-video, .aspect-square, .aspect-\\[4\\/3\\]');
      const isSecret = !!target.closest('[data-cursor="secret"], #sec-secret, .secret-card, [data-secret="true"]');
      const isButton = !!target.closest('button, [role="button"], .cursor-pointer');
      const isLink = !!target.closest('a[href]');
      const isText = !!target.closest('input, textarea, [contenteditable="true"]');

      if (isText) {
        setCursorMode('text');
        targetRingScale.current = 0.5;
        isHoveringExpand.current = false;
        isHoveringSecret.current = false;
      } else if (isExpand) {
        setCursorMode('expand');
        targetRingScale.current = 1.65;
        isHoveringExpand.current = true;
        isHoveringSecret.current = false;
      } else if (isPhoto) {
        setCursorMode('photo');
        targetRingScale.current = 1.5;
        isHoveringExpand.current = false;
        isHoveringSecret.current = false;
      } else if (isSecret) {
        setCursorMode('secret');
        targetRingScale.current = 1.45;
        isHoveringExpand.current = false;
        isHoveringSecret.current = true;
      } else if (isButton) {
        setCursorMode('button');
        targetRingScale.current = 1.25;
        isHoveringExpand.current = false;
        isHoveringSecret.current = false;
      } else if (isLink) {
        setCursorMode('link');
        targetRingScale.current = 1.25;
        isHoveringExpand.current = false;
        isHoveringSecret.current = false;
      } else {
        setCursorMode('default');
        targetRingScale.current = 1;
        isHoveringExpand.current = false;
        isHoveringSecret.current = false;
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isSupportedDesktop, isVisible]);

  // 3. Canvas resize observer
  useEffect(() => {
    if (!isSupportedDesktop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isSupportedDesktop]);

  // 4. Animation loop: Spring / Lerp for outer ring + Subtle trailing particles
  useEffect(() => {
    if (!isSupportedDesktop) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    const render = (time: number) => {
      const reducedMotion = prefersReducedMotionRef.current;
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      // Smooth outer ring lerp (inertia tracking)
      const lerpFactor = reducedMotion ? 1 : 0.18;
      ringPos.current.x += (mx - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (my - ringPos.current.y) * lerpFactor;

      // Scale transition
      const scaleLerp = reducedMotion ? 1 : 0.2;
      ringScale.current += (targetRingScale.current - ringScale.current) * scaleLerp;

      // Update Center Dot DOM directly via transform
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }

      // Update Outer Ring DOM directly via transform
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) scale(${ringScale.current})`;
      }

      // Update Expand Label position if visible
      if (expandLabelRef.current) {
        expandLabelRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      // 5. Emit subtle trailing particles if moving
      if (!reducedMotion && isVisible && ctx && canvas) {
        const distMoved = Math.hypot(
          mx - lastEmitPos.current.x,
          my - lastEmitPos.current.y
        );

        if (distMoved > 7 && time - lastEmitTime.current > 30) {
          lastEmitTime.current = time;
          lastEmitPos.current = { x: mx, y: my };

          // Small pool: cap max particles to 7 for guaranteed high performance
          if (particlesRef.current.length < 7) {
            const isSecret = isHoveringSecret.current;
            particlesRef.current.push({
              x: mx,
              y: my,
              size: Math.random() * 2 + 1.5,
              alpha: 0.65,
              maxAlpha: 0.65,
              vx: (Math.random() - 0.5) * 0.4,
              vy: (Math.random() - 0.5) * 0.4,
              color: isSecret ? '234, 179, 8' : '229, 9, 20', // Yellow/Gold for secrets, Crimson for normal
            });
          }
        }

        // Draw and update trailing particles on canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.045; // Fast clean fade (~250ms)
          p.size *= 0.96;

          if (p.alpha <= 0.01) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${p.color}, 0.8)`;
          ctx.fill();
        }
      } else if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSupportedDesktop, isVisible]);

  if (!isSupportedDesktop) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* Canvas for ultra-lightweight 60fps trailing particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9997]"
      />

      {/* Outer Magnetic Ring (Spring / Lerp Follows with Inertia) */}
      <div
        ref={ringRef}
        className={`fixed -top-4 -left-4 w-8 h-8 rounded-full pointer-events-none z-[9998] transition-colors duration-200 flex items-center justify-center ${
          cursorMode === 'photo'
            ? 'border-2 border-[#E50914] shadow-[0_0_18px_rgba(229,9,20,0.6)] bg-[#E50914]/5'
            : cursorMode === 'expand'
            ? 'border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.7)] bg-white/10'
            : cursorMode === 'secret'
            ? 'border-2 border-amber-400 shadow-[0_0_22px_rgba(234,179,8,0.7)] bg-amber-400/10 animate-pulse'
            : cursorMode === 'button'
            ? 'border border-[#E50914] shadow-[0_0_14px_rgba(229,9,20,0.45)] bg-[#E50914]/5'
            : cursorMode === 'link'
            ? 'border border-white/80 shadow-[0_0_12px_rgba(255,255,255,0.3)] bg-white/5'
            : cursorMode === 'text'
            ? 'border border-neutral-600/40 opacity-20'
            : 'border border-[#E50914]/40 shadow-[0_0_10px_rgba(229,9,20,0.2)] bg-transparent'
        }`}
        style={{
          willChange: 'transform',
        }}
      >
        {/* Subtle expand icon inside ring when hovering expandable elements */}
        {cursorMode === 'expand' && (
          <span className="text-[10px] text-white font-mono font-bold leading-none select-none tracking-tighter">
            ⛶
          </span>
        )}
      </div>

      {/* Center Point (Instant Real Cursor Position) */}
      <div
        ref={dotRef}
        className={`fixed -top-1 -left-1 w-2 h-2 rounded-full pointer-events-none z-[9999] transition-all duration-150 ${
          cursorMode === 'text'
            ? 'opacity-0'
            : cursorMode === 'secret'
            ? 'bg-amber-300 shadow-[0_0_10px_#fde047]'
            : cursorMode === 'expand'
            ? 'bg-white shadow-[0_0_10px_#ffffff]'
            : 'bg-white shadow-[0_0_8px_rgba(229,9,20,0.9),0_0_2px_#ffffff]'
        }`}
        style={{
          willChange: 'transform',
        }}
      />
    </div>
  );
};
