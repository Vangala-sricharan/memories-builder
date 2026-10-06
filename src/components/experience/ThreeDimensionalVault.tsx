import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { UploadedPhoto, PhotoPresentationStyle, ExperienceTemplate } from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { DerivedThemeTokens } from '../../utils/themeTokens';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Pause,
  Play
} from 'lucide-react';

interface ThreeDimensionalVaultProps {
  photos: UploadedPhoto[];
  photoStyle?: PhotoPresentationStyle;
  template?: ExperienceTemplate;
  heroFocus?: string;
  glowStyle?: string;
  borderStyle?: string;
  tokens: DerivedThemeTokens;
  headingFont: string;
  bodyFont: string;
  vaultIntro?: string;
  onOpenFullscreen?: (photo: UploadedPhoto, index: number) => void;
}

/**
 * Ensures a numeric value is strictly finite and safe for CSS transform strings.
 */
function toFinite(val: unknown, fallback: number = 0): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  return fallback;
}

export const ThreeDimensionalVault: React.FC<ThreeDimensionalVaultProps> = ({
  photos,
  photoStyle = 'cinematic',
  template = 'cinema',
  heroFocus = 'auto',
  glowStyle = 'cinematic',
  borderStyle = 'cinematic',
  tokens,
  headingFont,
  bodyFont,
  vaultIntro,
  onOpenFullscreen,
}) => {
  const totalCards = photos.length;

  // Reduced motion preference check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // UI state for user controls and active card display
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(!prefersReducedMotion);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // High-frequency physics, animation & transform refs (No React render storms)
  const rotationRef = useRef<number>(0);
  const targetRotationRef = useRef<number | null>(null);
  const tiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetTiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const isAutoSpinningRef = useRef<boolean>(isAutoSpinning);
  const resumeTimerRef = useRef<number | null>(null);
  const activeIndexRef = useRef<number>(0);

  // Drag interaction tracking refs
  const dragStartXRef = useRef<number>(0);
  const lastDragXRef = useRef<number>(0);
  const lastDragTimeRef = useRef<number>(0);

  // DOM node refs for direct GPU compositor transform manipulation
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cylinderRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Keep isAutoSpinningRef synchronized
  useEffect(() => {
    isAutoSpinningRef.current = isAutoSpinning;
  }, [isAutoSpinning]);

  // Reduced motion media query listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setIsAutoSpinning(false);
        velocityRef.current = 0;
        targetTiltRef.current = { x: 0, y: 0 };
        tiltRef.current = { x: 0, y: 0 };
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Responsive container observer with debouncing (Zero layout thrashing)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640);
      }
    };
    checkMobile();

    let resizeTimer: number | null = null;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width);
        if (width > 0) {
          if (resizeTimer) window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(() => {
            setContainerWidth((prev) => (Math.abs(prev - width) > 6 ? width : prev));
            checkMobile();
          }, 50);
        }
      }
    });

    observer.observe(el);

    return () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, []);

  // =========================================================================
  // GUARANTEED NO-COLLISION GEOMETRY ALGORITHM (6 to 25 Images)
  //
  // Formula: R = (cardWidth + minGap) / (2 * sin(PI / N))
  //
  // Strict rule: Radius is NEVER clamped downwards independently of cardWidth.
  // When viewport is constrained, cardWidth and minGap scale dynamically,
  // guaranteeing that chord distance between card centers is strictly
  // Chord = 2 * R * sin(PI / N) = cardWidth + minGap > cardWidth at all times.
  // ZERO COLLISION MATHEMATICALLY GUARANTEED.
  // =========================================================================
  const geometry = useMemo(() => {
    const N = Math.max(6, Math.min(25, totalCards || 6));
    const rotationStep = 360 / N;
    const t = Math.max(0, Math.min(1, (N - 6) / 19)); // Normalized progress 0..1 from 6 to 25 cards

    // Base card dimensions and minimum gaps across device categories
    let Wbase: number;
    let gbase: number;
    let perspective: number;

    if (isMobile) {
      // Mobile Viewport (<640px)
      Wbase = Math.round(165 - t * 65); // 165px at 6 cards down to 100px at 25 cards
      gbase = Math.round(20 - t * 10);  // 20px at 6 cards down to 10px at 25 cards
      perspective = Math.round(920 + t * 130); // 920px to 1050px
    } else {
      // Desktop / Tablet Viewport (>=640px)
      Wbase = Math.round(240 - t * 92); // 240px at 6 cards down to 148px at 25 cards
      gbase = Math.round(38 - t * 18);  // 38px at 6 cards down to 20px at 25 cards
      perspective = Math.round(1200 + t * 250); // 1200px to 1450px
    }

    const Hbase = Math.round(Wbase * 1.38);

    // Compute raw unconstrained radius
    const sinHalfTheta = Math.sin(Math.PI / N);
    const rawRadius = (Wbase + gbase) / (2 * sinHalfTheta);

    // Projected horizontal coverage under perspective
    const rawProjectedExtent = 2 * (rawRadius + Wbase * 0.5) * (perspective / (perspective + rawRadius));
    const maxAllowedCoverage = containerWidth * (isMobile ? 0.94 : 0.90);

    // Intelligent card scale factor when viewport is constrained
    const scaleFactor = Math.min(
      1.0,
      Math.max(isMobile ? 0.72 : 0.78, maxAllowedCoverage / Math.max(1, rawProjectedExtent))
    );

    const cardWidth = Math.round(Wbase * scaleFactor);
    const cardHeight = Math.round(Hbase * scaleFactor);
    const minGap = Math.round(gbase * scaleFactor);

    // Unclamped radius strictly derived from scaled dimensions:
    // Guarantees chord between centers is exactly cardWidth + minGap
    const radius = Math.round((cardWidth + minGap) / (2 * sinHalfTheta));

    return {
      N,
      rotationStep,
      cardWidth: toFinite(cardWidth, 160),
      cardHeight: toFinite(cardHeight, 220),
      minGap: toFinite(minGap, 16),
      radius: toFinite(radius, 320),
      perspective: toFinite(perspective, 1200),
    };
  }, [totalCards, isMobile, containerWidth]);

  // Idle rotation angular speed based on card count
  const idleIncrement = useMemo(() => {
    if (geometry.N <= 8) return 0.28;
    if (geometry.N <= 14) return 0.22;
    if (geometry.N <= 20) return 0.18;
    return 0.15;
  }, [geometry.N]);

  // Directly update 3D cylinder transform via GPU compositor (Zero React VDOM updates)
  const updateCylinderTransform = useCallback(() => {
    if (!cylinderRef.current) return;
    const rot = toFinite(rotationRef.current, 0);
    const tx = toFinite(tiltRef.current.x, 0);
    const ty = toFinite(tiltRef.current.y, 0);
    const rad = toFinite(geometry.radius, 300);

    cylinderRef.current.style.transform = 
      `rotateX(${tx}deg) rotateZ(${ty * 0.25}deg) translateZ(-${rad}px) rotateY(${rot}deg)`;
  }, [geometry.radius]);

  // Synchronize active card index only when sector boundary is crossed
  const updateActiveCardIndex = useCallback(() => {
    if (totalCards <= 0) return;
    const rawRot = toFinite(rotationRef.current, 0);
    let closestIdx = 0;
    let minDiff = 9999;
    const step = geometry.rotationStep;

    for (let i = 0; i < totalCards; i++) {
      const cardAngle = i * step;
      let relAngle = ((cardAngle + rawRot) % 360 + 540) % 360 - 180;
      const absDiff = Math.abs(relAngle);
      if (absDiff < minDiff) {
        minDiff = absDiff;
        closestIdx = i;
      }
    }

    if (closestIdx !== activeIndexRef.current) {
      activeIndexRef.current = closestIdx;
      setActiveIndex(closestIdx);
    }
  }, [totalCards, geometry.rotationStep]);

  // Master Animation Loop (Single requestAnimationFrame loop, full cleanup on unmount)
  useEffect(() => {
    // Initial transform sync
    updateCylinderTransform();

    const loop = () => {
      // 1. Smooth Navigation Interpolation (Prev / Next / Dot navigation)
      if (targetRotationRef.current !== null) {
        const target = targetRotationRef.current;
        const current = rotationRef.current;
        const diff = target - current;

        if (Math.abs(diff) > 0.08) {
          rotationRef.current += diff * 0.14;
        } else {
          rotationRef.current = target;
          targetRotationRef.current = null;
        }
      } else if (!isDraggingRef.current) {
        // 2. Drag Release Inertia with smooth friction damping
        if (Math.abs(velocityRef.current) > 0.03) {
          if (!prefersReducedMotion) {
            rotationRef.current = (rotationRef.current + velocityRef.current) % 360;
            velocityRef.current *= 0.94; // Exponential friction damping
          } else {
            velocityRef.current = 0;
          }
        } else if (isAutoSpinningRef.current && !prefersReducedMotion) {
          // 3. Continuous Idle Auto-Rotation
          rotationRef.current = (rotationRef.current + idleIncrement) % 360;
        }
      }

      // 4. Subtle Mouse Tilt Parallax Interpolation
      const currentTilt = tiltRef.current;
      const targetTilt = prefersReducedMotion ? { x: 0, y: 0 } : targetTiltRef.current;
      const nextX = currentTilt.x + (targetTilt.x - currentTilt.x) * 0.08;
      const nextY = currentTilt.y + (targetTilt.y - currentTilt.y) * 0.08;
      tiltRef.current = { x: toFinite(nextX, 0), y: toFinite(nextY, 0) };

      // 5. Apply direct transform to GPU
      updateCylinderTransform();

      // 6. Update active card index when sector threshold is crossed
      updateActiveCardIndex();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [
    geometry,
    idleIncrement,
    prefersReducedMotion,
    updateCylinderTransform,
    updateActiveCardIndex,
  ]);

  // Navigate directly to specific card with smooth shortest-path angular lerp
  const navigateToCard = useCallback((targetIndex: number) => {
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    velocityRef.current = 0;
    const currentRot = rotationRef.current;
    const targetAngle = -targetIndex * geometry.rotationStep;
    // Shortest angular path
    const delta = ((targetAngle - currentRot) % 360 + 540) % 360 - 180;
    targetRotationRef.current = currentRot + delta;
    setIsAutoSpinning(false);
  }, [geometry.rotationStep]);

  const handlePrev = useCallback(() => {
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    velocityRef.current = 0;
    const currentRot = rotationRef.current;
    targetRotationRef.current = currentRot + geometry.rotationStep;
    setIsAutoSpinning(false);
  }, [geometry.rotationStep]);

  const handleNext = useCallback(() => {
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    velocityRef.current = 0;
    const currentRot = rotationRef.current;
    targetRotationRef.current = currentRot - geometry.rotationStep;
    setIsAutoSpinning(false);
  }, [geometry.rotationStep]);

  // Pointer move handler (Mouse tilt tracking + smooth drag rotation)
  const handleStagePointerMove = (e: React.PointerEvent) => {
    if (!stageRef.current) return;

    // Mouse tilt tracking (desktop only, disabled when reduced motion is preferred)
    if (!isMobile && !prefersReducedMotion) {
      const rect = stageRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
      targetTiltRef.current = {
        x: -normY * 7,
        y: normX * 7,
      };
    }

    // Interactive Drag / Swipe rotation
    if (isDraggingRef.current) {
      const now = performance.now();
      const deltaX = e.clientX - lastDragXRef.current;
      const dt = Math.max(1, now - lastDragTimeRef.current);

      const sensitivity = isMobile ? 0.42 : 0.34;
      rotationRef.current += deltaX * sensitivity;

      // Exponential moving average for fluid release velocity
      const instVel = (deltaX / dt) * 16 * sensitivity;
      velocityRef.current = velocityRef.current * 0.3 + instVel * 0.7;

      lastDragXRef.current = e.clientX;
      lastDragTimeRef.current = now;

      updateCylinderTransform();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    isDraggingRef.current = true;
    targetRotationRef.current = null;
    velocityRef.current = 0;
    dragStartXRef.current = e.clientX;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = performance.now();
    setIsAutoSpinning(false);

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}

      // Clamp release velocity to safe, cinematic bounds
      velocityRef.current = Math.max(-12, Math.min(12, velocityRef.current));

      // Resume auto-rotation after interaction settles (if not prefers-reduced-motion)
      if (!prefersReducedMotion) {
        resumeTimerRef.current = window.setTimeout(() => {
          setIsAutoSpinning(true);
        }, 2200);
      }
    }
  };

  const handlePointerLeave = () => {
    targetTiltRef.current = { x: 0, y: 0 };
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      velocityRef.current = Math.max(-12, Math.min(12, velocityRef.current));
      if (!prefersReducedMotion) {
        resumeTimerRef.current = window.setTimeout(() => {
          setIsAutoSpinning(true);
        }, 2200);
      }
    }
  };

  const activePhoto = photos[activeIndex] || photos[0];
  const stageHeight = Math.max(isMobile ? 430 : 510, Math.round(geometry.cardHeight + (isMobile ? 190 : 230)));

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-full overflow-hidden relative flex flex-col items-center select-none"
    >
      {/* Vault Header Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-6 z-10">
        {/* Prev Card */}
        <button
          type="button"
          onClick={handlePrev}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          style={{
            backgroundColor: tokens.surfaceHighlight,
            borderColor: tokens.border,
            color: tokens.secondary,
          }}
          title="Previous archive card"
        >
          <ChevronLeft className="w-4 h-4" style={{ color: tokens.primary }} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Auto-spin Toggle */}
        <button
          type="button"
          onClick={() => {
            if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
            setIsAutoSpinning(!isAutoSpinning);
          }}
          className="px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          style={{
            backgroundColor: tokens.surfaceHighlight,
            borderColor: tokens.border,
            color: tokens.secondary,
          }}
        >
          {isAutoSpinning ? (
            <>
              <Pause className="w-3.5 h-3.5" style={{ color: tokens.primary }} />
              <span>Pause Spin</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" style={{ color: tokens.primary }} />
              <span>Resume Spin</span>
            </>
          )}
        </button>

        {/* Next Card */}
        <button
          type="button"
          onClick={handleNext}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          style={{
            backgroundColor: tokens.surfaceHighlight,
            borderColor: tokens.border,
            color: tokens.secondary,
          }}
          title="Next archive card"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" style={{ color: tokens.primary }} />
        </button>
      </div>

      {/* 3D Perspective Stage with Pointer Tilt & Smooth Drag */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="relative w-full max-w-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          height: `${stageHeight}px`,
          perspective: `${geometry.perspective}px`,
          perspectiveOrigin: '50% 50%',
          touchAction: 'pan-y',
        }}
      >
        {/* Atmospheric Ambient Glow behind Carousel */}
        {glowStyle !== 'none' && (
          <div
            className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[110px] pointer-events-none opacity-60"
            style={{ backgroundColor: tokens.glowStrong }}
          />
        )}

        {/* The 3D Rotating Pivot Cylinder (Direct GPU transforms) */}
        <div
          ref={cylinderRef}
          className="relative flex items-center justify-center pointer-events-none"
          style={{
            width: `${geometry.cardWidth}px`,
            height: `${geometry.cardHeight}px`,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          {photos.map((photo, idx) => {
            const angle = idx * geometry.rotationStep;
            const isCardActive = idx === activeIndex;

            // 1. POLAROID 3D VAULT CARD
            if (photoStyle === 'polaroid') {
              return (
                <div
                  key={photo.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToCard(idx);
                  }}
                  className={`absolute inset-0 bg-[#FAF8F5] text-[#1c1917] p-2 pb-3.5 rounded-[4px] border border-[#e8e4dc] flex flex-col justify-between cursor-pointer pointer-events-auto transition-shadow duration-300 ${
                    isCardActive 
                      ? 'shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-2 ring-[#E50914] scale-[1.04]' 
                      : 'shadow-[0_15px_35px_rgba(0,0,0,0.8)] opacity-95 hover:opacity-100'
                  }`}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${geometry.radius}px)`,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="w-full flex-1 overflow-hidden bg-black relative rounded-[2px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] border border-black/15 group">
                    <AutoFitImage
                      src={photo.previewUrl}
                      alt={photo.caption}
                      focalPoint={heroFocus as any}
                    />
                    <div className="absolute top-1.5 left-1.5 text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-white/90">
                      #{idx + 1}
                    </div>

                    {/* Fullscreen Expand Action Button */}
                    {onOpenFullscreen && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFullscreen(photo, idx);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-[#E50914] text-white transition-colors cursor-pointer z-10"
                        title="Expand memory fullscreen"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    )}

                    {isCardActive && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#E50914] text-white text-[8px] font-mono font-bold tracking-wider">
                        FOCUS
                      </div>
                    )}
                  </div>
                  <div className="pt-2 px-1">
                    <div 
                      className="text-[11px] sm:text-xs font-serif italic font-bold text-[#1c1917] truncate leading-tight"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {photo.caption}
                    </div>
                    <div className="text-[9px] font-mono text-[#78716c] uppercase tracking-wider mt-0.5 flex items-center justify-between">
                      <span>{photo.year || 'PERMANENT'}</span>
                      <span className="text-[8px] text-[#a8a29e]">TAP TO FOCUS</span>
                    </div>
                  </div>
                </div>
              );
            }

            // 2. FILM STRIP 3D VAULT CARD
            if (photoStyle === 'film-strip') {
              return (
                <div
                  key={photo.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToCard(idx);
                  }}
                  className={`absolute inset-0 bg-[#0B0B0B] border border-[#2d2d2d] p-1.5 pb-2 rounded-lg flex flex-col justify-between text-neutral-300 cursor-pointer pointer-events-auto transition-shadow duration-300 ${
                    isCardActive
                      ? 'shadow-[0_25px_60px_rgba(229,9,20,0.3)] border-[#E50914] scale-[1.04]'
                      : 'shadow-[0_15px_40px_rgba(0,0,0,0.9)] opacity-95 hover:opacity-100'
                  }`}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${geometry.radius}px)`,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Top sprockets */}
                  <div className="h-2 bg-[#050505] px-1 flex items-center gap-1 overflow-hidden mb-1">
                    {Array.from({ length: 6 }).map((_, h) => (
                      <div key={`v-top-${photo.id}-${h}`} className="w-1.5 h-1 rounded-[1px] bg-[#1a1a1a] border border-[#333] shrink-0" />
                    ))}
                  </div>

                  <div className="w-full flex-1 overflow-hidden bg-black relative rounded-[2px] group">
                    <AutoFitImage
                      src={photo.previewUrl}
                      alt={photo.caption}
                      focalPoint={heroFocus as any}
                    />
                    <div className="absolute top-1 left-1 text-[8px] font-mono px-1 py-0.5 rounded bg-black/80 text-white">
                      ▸ 35MM #{idx + 1}
                    </div>

                    {/* Fullscreen Expand Action Button */}
                    {onOpenFullscreen && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFullscreen(photo, idx);
                        }}
                        className="absolute top-1 right-1 p-1 rounded bg-black/70 hover:bg-[#E50914] text-white transition-colors cursor-pointer z-10"
                        title="Expand memory fullscreen"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    )}

                    {isCardActive && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#E50914] text-white text-[8px] font-mono font-bold tracking-wider">
                        FOCUS
                      </div>
                    )}
                  </div>

                  <div className="px-1 pt-1">
                    <div className="text-[11px] font-bold text-white truncate">
                      {photo.caption}
                    </div>
                    <div className="text-[8px] font-mono text-neutral-400 flex items-center justify-between">
                      <span>CELLULOID ARCHIVE</span>
                      <span className="text-neutral-500">TAP TO FOCUS</span>
                    </div>
                  </div>

                  {/* Bottom sprockets */}
                  <div className="h-2 bg-[#050505] px-1 flex items-center gap-1 overflow-hidden mt-1">
                    {Array.from({ length: 6 }).map((_, h) => (
                      <div key={`v-bot-${photo.id}-${h}`} className="w-1.5 h-1 rounded-[1px] bg-[#1a1a1a] border border-[#333] shrink-0" />
                    ))}
                  </div>
                </div>
              );
            }

            // 3. FULLSCREEN / EDITORIAL / CINEMATIC 3D VAULT CARD
            return (
              <div
                key={photo.id}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToCard(idx);
                }}
                className={`absolute inset-0 border shadow-2xl p-2 flex flex-col justify-between cursor-pointer pointer-events-auto transition-shadow duration-300 ${
                  isCardActive 
                    ? 'ring-2 shadow-[0_25px_60px_rgba(229,9,20,0.35)] scale-[1.04]' 
                    : 'opacity-95 hover:opacity-100'
                } ${
                  photoStyle === 'fullscreen'
                    ? 'rounded-2xl border-2'
                    : template === 'memories'
                    ? 'rounded-3xl'
                    : template === 'elegance'
                    ? 'rounded-none border-white/20'
                    : 'rounded-2xl'
                }`}
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${geometry.radius}px)`,
                  backfaceVisibility: 'hidden',
                  backgroundColor: tokens.surface,
                  borderColor: isCardActive ? tokens.primary : (borderStyle === 'none' ? 'transparent' : tokens.border),
                  boxShadow: isCardActive ? `0 0 35px ${tokens.glowStrong}` : undefined,
                }}
              >
                <div
                  className={`w-full flex-1 overflow-hidden bg-black relative group ${
                    template === 'memories' ? 'rounded-2xl' : template === 'elegance' ? 'rounded-none' : 'rounded-xl'
                  }`}
                >
                  <AutoFitImage
                    src={photo.previewUrl}
                    alt={photo.caption}
                    focalPoint={heroFocus as any}
                  />
                  <div
                    className="absolute top-1.5 left-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.85)',
                      borderColor: tokens.border,
                      color: tokens.secondary,
                    }}
                  >
                    VAULT #{idx + 1}
                  </div>

                  {/* Fullscreen Expand Action Button */}
                  {onOpenFullscreen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenFullscreen(photo, idx);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-[#E50914] text-white transition-colors cursor-pointer z-10"
                      title="Expand memory fullscreen"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  )}

                  {isCardActive && (
                    <div
                      className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider uppercase text-white shadow-md"
                      style={{ backgroundColor: tokens.primary }}
                    >
                      FOCUS
                    </div>
                  )}
                </div>

                <div className="p-1 pt-1.5">
                  <div
                    className="text-[11px] sm:text-xs font-bold truncate"
                    style={{ color: tokens.secondary }}
                  >
                    {photo.caption}
                  </div>
                  <div
                    className="text-[9px] font-mono flex items-center justify-between mt-0.5"
                    style={{ color: tokens.primary }}
                  >
                    <span>ETERNALLY PRESERVED</span>
                    <span className="text-[8px] opacity-70">TAP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Card Reflection Bar & Dot Carousel Navigation */}
      <div className="w-full max-w-md mx-auto px-4 mt-2 flex flex-col items-center text-center space-y-3 z-10">
        {/* Dominant Active Card Caption */}
        {activePhoto && (
          <div className="transition-all duration-300">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E50914] font-semibold block mb-1">
              ARCHIVE MEMORY #{activeIndex + 1} OF {totalCards}
            </span>
            <h4 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md mx-auto">
              {activePhoto.caption || 'Cherished Memory'}
            </h4>
            {activePhoto.location && (
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {activePhoto.location} {activePhoto.year ? `· ${activePhoto.year}` : ''}
              </p>
            )}
          </div>
        )}

        {/* Dot Pagination Selector */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-xs sm:max-w-md mx-auto py-1">
          {photos.map((photo, i) => (
            <button
              key={`dot-${photo.id}`}
              type="button"
              onClick={() => navigateToCard(i)}
              className={`transition-all rounded-full cursor-pointer ${
                i === activeIndex
                  ? 'w-6 h-1.5 bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.6)]'
                  : 'w-1.5 h-1.5 bg-neutral-700 hover:bg-neutral-500'
              }`}
              title={`View memory #${i + 1}`}
            />
          ))}
        </div>

        <p className="text-[10px] text-neutral-500 font-mono">
          Hover to tilt · Drag to spin with momentum · Tap card to focus
        </p>
      </div>
    </div>
  );
};
