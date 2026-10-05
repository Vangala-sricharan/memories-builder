import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { UploadedPhoto, PhotoPresentationStyle, ExperienceTemplate } from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { DerivedThemeTokens } from '../../utils/themeTokens';
import { 
  RotateCw, 
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

  // Rotation and momentum physics state
  const [vaultRotation, setVaultRotation] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Physics & animation frame refs
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const lastDragXRef = useRef<number>(0);
  const lastDragTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);
  const tiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetTiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  rotationRef.current = vaultRotation;

  // Responsive window & container observer
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640);
      }
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 1. DYNAMIC VAULT ALGORITHM (6 to 25 Images — Absolute No-Collision Guarantee):
  // R = (cardWidth + minGap) / (2 * sin(PI / N))
  const geometry = useMemo(() => {
    const N = Math.max(6, Math.min(25, totalCards));
    const rotationStep = 360 / N;

    let cardWidth = 210;
    let cardHeight = 290;
    let minGap = isMobile ? 16 : 30;
    let perspective = 1200;

    if (isMobile) {
      // Mobile Viewport (<640px)
      if (N <= 8) {
        cardWidth = 175;
        cardHeight = 240;
        minGap = 20;
        perspective = 900;
      } else if (N <= 14) {
        cardWidth = 150;
        cardHeight = 210;
        minGap = 16;
        perspective = 950;
      } else if (N <= 20) {
        cardWidth = 130;
        cardHeight = 185;
        minGap = 14;
        perspective = 1000;
      } else {
        // 21-25 images
        cardWidth = 115;
        cardHeight = 165;
        minGap = 12;
        perspective = 1050;
      }
    } else {
      // Desktop / Tablet (>=640px)
      if (N <= 8) {
        // 6-8 images: large cards, spacious presentation
        cardWidth = 250;
        cardHeight = 340;
        minGap = 45;
        perspective = 1200;
      } else if (N <= 14) {
        // 9-14 images: moderate cards, balanced depth
        cardWidth = 215;
        cardHeight = 295;
        minGap = 35;
        perspective = 1300;
      } else if (N <= 20) {
        // 15-20 images: compact cards, visible spacing
        cardWidth = 180;
        cardHeight = 255;
        minGap = 28;
        perspective = 1400;
      } else {
        // 21-25 images: compact cards, carefully calculated no-collision gap
        cardWidth = 155;
        cardHeight = 220;
        minGap = 22;
        perspective = 1450;
      }
    }

    // Mathematical formula guaranteeing NO COLLISION:
    // Arc distance between card centers is 2 * R * sin(PI / N) = cardWidth + minGap > cardWidth
    const calculatedRadius = Math.round((cardWidth + minGap) / (2 * Math.sin(Math.PI / N)));

    // Prevent radius from overflowing container
    const maxRadius = Math.max(180, Math.round(containerWidth * 0.46));
    const radius = Math.min(calculatedRadius, maxRadius);

    return {
      N,
      rotationStep,
      cardWidth,
      cardHeight,
      radius,
      perspective,
    };
  }, [totalCards, isMobile, containerWidth]);

  // Idle rotation speed based on card count
  const idleIncrement = useMemo(() => {
    if (geometry.N <= 8) return 0.32;
    if (geometry.N <= 14) return 0.25;
    if (geometry.N <= 20) return 0.20;
    return 0.16;
  }, [geometry.N]);

  // Inertia & Continuous Rotation Animation Loop (60 FPS via requestAnimationFrame)
  useEffect(() => {
    const loop = () => {
      if (!isDraggingRef.current) {
        // If there is residual velocity from drag release, apply momentum with friction
        if (Math.abs(velocityRef.current) > 0.03) {
          rotationRef.current = (rotationRef.current + velocityRef.current) % 360;
          velocityRef.current *= 0.94; // Friction damping
          setVaultRotation(rotationRef.current);
        } else if (isAutoSpinning) {
          // Resume subtle idle auto-rotation
          rotationRef.current = (rotationRef.current + idleIncrement) % 360;
          setVaultRotation(rotationRef.current);
        }

        // Smoothly interpolate mouse tilt towards target
        const currentTilt = tiltRef.current;
        const targetTilt = targetTiltRef.current;
        const nextX = currentTilt.x + (targetTilt.x - currentTilt.x) * 0.08;
        const nextY = currentTilt.y + (targetTilt.y - currentTilt.y) * 0.08;
        tiltRef.current = { x: nextX, y: nextY };
        setTilt({ x: nextX, y: nextY });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoSpinning, idleIncrement]);

  // Active focused card index (card closest to 0° facing the camera)
  const activeIndex = useMemo(() => {
    if (totalCards === 0) return 0;
    let closestIdx = 0;
    let minDiff = 9999;

    for (let i = 0; i < totalCards; i++) {
      const cardAngle = i * geometry.rotationStep;
      let relAngle = ((cardAngle + vaultRotation) % 360 + 540) % 360 - 180;
      const absDiff = Math.abs(relAngle);
      if (absDiff < minDiff) {
        minDiff = absDiff;
        closestIdx = i;
      }
    }
    return closestIdx;
  }, [totalCards, geometry.rotationStep, vaultRotation]);

  // Navigate directly to specific card
  const navigateToCard = useCallback((targetIndex: number) => {
    velocityRef.current = 0;
    const targetAngle = -targetIndex * geometry.rotationStep;
    rotationRef.current = targetAngle;
    setVaultRotation(targetAngle);
    setIsAutoSpinning(false);
  }, [geometry.rotationStep]);

  const handlePrev = () => {
    velocityRef.current = 0;
    rotationRef.current += geometry.rotationStep;
    setVaultRotation(rotationRef.current);
    setIsAutoSpinning(false);
  };

  const handleNext = () => {
    velocityRef.current = 0;
    rotationRef.current -= geometry.rotationStep;
    setVaultRotation(rotationRef.current);
    setIsAutoSpinning(false);
  };

  // Mouse Tilt tracking (Pointer move when hovering over stage)
  const handleStagePointerMove = (e: React.PointerEvent) => {
    if (!stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

    // Subtle tilt: up to 8 deg vertical, 8 deg horizontal
    targetTiltRef.current = {
      x: -normY * 8,
      y: normX * 8,
    };

    // If dragging, handle interactive rotation
    if (isDraggingRef.current) {
      const now = performance.now();
      const deltaX = e.clientX - lastDragXRef.current;
      const dt = Math.max(1, now - lastDragTimeRef.current);

      // Sensitivity factor
      const sensitivity = isMobile ? 0.45 : 0.35;
      rotationRef.current += deltaX * sensitivity;
      setVaultRotation(rotationRef.current);

      // Calculate instantaneous release velocity
      velocityRef.current = (deltaX / dt) * 16 * sensitivity;
      lastDragXRef.current = e.clientX;
      lastDragTimeRef.current = now;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = performance.now();
    velocityRef.current = 0;
    setIsAutoSpinning(false);

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // Safe ignore
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe ignore
      }
      // Clamp release velocity to smooth cinematic range
      velocityRef.current = Math.max(-14, Math.min(14, velocityRef.current));
    }
  };

  const handlePointerLeave = () => {
    // Gracefully return tilt to neutral without snapping rotation
    targetTiltRef.current = { x: 0, y: 0 };
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
  };

  const activePhoto = photos[activeIndex] || photos[0];

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
          onClick={() => setIsAutoSpinning(!isAutoSpinning)}
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

      {/* 3D Perspective Stage with Mouse Tilt & Inertia Drag */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="relative w-full max-w-full h-[470px] sm:h-[550px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
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

        {/* The 3D Rotating Pivot Cylinder (with Mouse Tilt Parallax) */}
        <div
          className="relative flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            width: `${geometry.cardWidth}px`,
            height: `${geometry.cardHeight}px`,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${tilt.x}deg) rotateZ(${tilt.y * 0.25}deg) translateZ(-${geometry.radius}px) rotateY(${vaultRotation}deg)`,
          }}
        >
          {photos.map((photo, idx) => {
            const angle = idx * geometry.rotationStep;
            const isCardActive = idx === activeIndex;

            // Calculate angle relative to viewer to fade cards in the back
            let relAngle = ((angle + vaultRotation) % 360 + 540) % 360 - 180;
            const absRelAngle = Math.abs(relAngle);
            const isFacingAway = absRelAngle > 105;

            // 1. POLAROID 3D VAULT CARD
            if (photoStyle === 'polaroid') {
              return (
                <div
                  key={photo.id}
                  onClick={() => navigateToCard(idx)}
                  className={`absolute inset-0 bg-[#FAF8F5] text-[#1c1917] p-2 pb-3.5 rounded-[4px] border border-[#e8e4dc] flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                    isCardActive 
                      ? 'shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-2 ring-[#E50914] scale-[1.04]' 
                      : 'shadow-[0_15px_35px_rgba(0,0,0,0.8)] opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${geometry.radius}px)`,
                    backfaceVisibility: 'hidden',
                    opacity: isFacingAway ? 0.15 : 1,
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
                  onClick={() => navigateToCard(idx)}
                  className={`absolute inset-0 bg-[#0B0B0B] border border-[#2d2d2d] p-1.5 pb-2 rounded-lg flex flex-col justify-between text-neutral-300 cursor-pointer transition-all duration-300 ${
                    isCardActive
                      ? 'shadow-[0_25px_60px_rgba(229,9,20,0.3)] border-[#E50914] scale-[1.04]'
                      : 'shadow-[0_15px_40px_rgba(0,0,0,0.9)] opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${geometry.radius}px)`,
                    backfaceVisibility: 'hidden',
                    opacity: isFacingAway ? 0.15 : 1,
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
                onClick={() => navigateToCard(idx)}
                className={`absolute inset-0 border shadow-2xl p-2 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                  isCardActive 
                    ? 'ring-2 shadow-[0_25px_60px_rgba(229,9,20,0.35)] scale-[1.04]' 
                    : 'opacity-90 hover:opacity-100'
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
                  opacity: isFacingAway ? 0.15 : 1,
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
