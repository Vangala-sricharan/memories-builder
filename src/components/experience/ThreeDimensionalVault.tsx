import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { UploadedPhoto, PhotoPresentationStyle, ExperienceTemplate } from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { DerivedThemeTokens } from '../../utils/themeTokens';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Sparkles,
  Layers,
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
}) => {
  const totalCards = photos.length;

  // Rotation state
  const [vaultRotation, setVaultRotation] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // Drag interaction state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [rotationAtDragStart, setRotationAtDragStart] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // 1. DYNAMIC VAULT ALGORITHM:
  // Dynamically calculate card scale, radius, depth, and perspective based on photoCount & viewport
  const geometry = useMemo(() => {
    const N = Math.max(3, Math.min(20, totalCards));
    const rotationStep = 360 / N;

    let cardWidth = 220;
    let cardHeight = 300;
    let radius = 380;
    let perspective = 1200;

    if (isMobile) {
      // Mobile viewport (under 640px)
      if (N <= 6) {
        // Low photo count (3-6)
        cardWidth = 185;
        cardHeight = 250;
        radius = 210;
        perspective = 900;
      } else if (N <= 12) {
        // Medium photo count (7-12)
        cardWidth = 160;
        cardHeight = 225;
        radius = 260;
        perspective = 950;
      } else {
        // High photo count (13-20)
        cardWidth = 140;
        cardHeight = 200;
        radius = 295;
        perspective = 1000;
      }
    } else {
      // Desktop / Tablet viewport (640px+)
      if (N <= 6) {
        // Low photo count (3-6): dramatic large cards, spacious presentation
        cardWidth = 260;
        cardHeight = 350;
        radius = 340;
        perspective = 1200;
      } else if (N <= 12) {
        // Medium photo count (7-12): slightly tighter cards & radius
        cardWidth = 225;
        cardHeight = 310;
        radius = 400;
        perspective = 1300;
      } else {
        // High photo count (13-20): controlled card scaling, optimized depth
        cardWidth = 190;
        cardHeight = 270;
        radius = 450;
        perspective = 1400;
      }
    }

    // Safety: ensure radius fits cleanly within the container without pushing cards out
    const maxAllowedRadius = Math.max(180, (containerWidth * 0.44));
    if (radius > maxAllowedRadius) {
      radius = Math.round(maxAllowedRadius);
    }

    return {
      N,
      rotationStep,
      cardWidth,
      cardHeight,
      radius,
      perspective,
    };
  }, [totalCards, isMobile, containerWidth]);

  // Rotation speed derived from photo count (smoother for more photos)
  const rotationIncrement = useMemo(() => {
    if (geometry.N <= 6) return 0.35;
    if (geometry.N <= 12) return 0.28;
    return 0.22;
  }, [geometry.N]);

  // Auto-spin animation loop
  useEffect(() => {
    if (!isAutoSpinning || isDragging) return;

    const interval = setInterval(() => {
      setVaultRotation((prev) => (prev + rotationIncrement) % 360);
    }, 40);

    return () => clearInterval(interval);
  }, [isAutoSpinning, isDragging, rotationIncrement]);

  // Determine Active Card (the card closest to 0 degrees / camera)
  const activeIndex = useMemo(() => {
    if (totalCards === 0) return 0;

    let closestIdx = 0;
    let minDiff = 9999;

    for (let i = 0; i < totalCards; i++) {
      const cardAngle = i * geometry.rotationStep;
      // Normalize angle relative to current rotation to [-180, 180]
      let relAngle = ((cardAngle + vaultRotation) % 360 + 540) % 360 - 180;
      const absDiff = Math.abs(relAngle);
      if (absDiff < minDiff) {
        minDiff = absDiff;
        closestIdx = i;
      }
    }

    return closestIdx;
  }, [totalCards, geometry.rotationStep, vaultRotation]);

  // Navigate to specific card
  const navigateToCard = useCallback((targetIndex: number) => {
    const targetAngle = -targetIndex * geometry.rotationStep;
    setVaultRotation(targetAngle);
    // Briefly pause auto-spin so user can examine chosen card
    setIsAutoSpinning(false);
  }, [geometry.rotationStep]);

  // Next / Previous step controls
  const handlePrev = () => {
    setVaultRotation((prev) => prev + geometry.rotationStep);
    setIsAutoSpinning(false);
  };

  const handleNext = () => {
    setVaultRotation((prev) => prev - geometry.rotationStep);
    setIsAutoSpinning(false);
  };

  // Drag / Swipe handling
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setRotationAtDragStart(vaultRotation);
    setIsAutoSpinning(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    // Map horizontal drag pixels to rotation degrees
    const sensitivity = isMobile ? 0.45 : 0.35;
    setVaultRotation(rotationAtDragStart + deltaX * sensitivity);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe ignore
      }
      setIsDragging(false);
    }
  };

  const activePhoto = photos[activeIndex] || photos[0];

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-full overflow-hidden relative flex flex-col items-center"
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

      {/* 3D Perspective Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full max-w-full h-[460px] sm:h-[530px] flex items-center justify-center select-none overflow-hidden cursor-grab active:cursor-grabbing"
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

        {/* The 3D Rotating Pivot Cylinder */}
        <div
          className="relative flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            width: `${geometry.cardWidth}px`,
            height: `${geometry.cardHeight}px`,
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${geometry.radius}px) rotateY(${vaultRotation}deg)`,
          }}
        >
          {photos.map((photo, idx) => {
            const angle = idx * geometry.rotationStep;
            const isCardActive = idx === activeIndex;

            // Calculate relative angle to viewer to fade cards in the back
            let relAngle = ((angle + vaultRotation) % 360 + 540) % 360 - 180;
            const absRelAngle = Math.abs(relAngle);
            const isFacingAway = absRelAngle > 105;

            // 1. POLAROID 3D VAULT CARD
            if (photoStyle === 'polaroid') {
              return (
                <div
                  key={`vault-card-${photo.id}`}
                  onClick={() => navigateToCard(idx)}
                  className={`absolute inset-0 bg-[#FAF8F5] text-[#1c1917] p-2 pb-3.5 rounded-[4px] border border-[#e8e4dc] flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                    isCardActive 
                      ? 'shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-2 ring-[#E50914] scale-[1.03]' 
                      : 'shadow-[0_15px_35px_rgba(0,0,0,0.8)] opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${geometry.radius}px)`,
                    backfaceVisibility: 'hidden',
                    opacity: isFacingAway ? 0.15 : 1,
                  }}
                >
                  <div className="w-full flex-1 overflow-hidden bg-black relative rounded-[2px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] border border-black/15">
                    <AutoFitImage
                      src={photo.previewUrl}
                      alt={photo.caption}
                      focalPoint={heroFocus as any}
                    />
                    <div className="absolute top-1.5 left-1.5 text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-white/90">
                      #{idx + 1}
                    </div>
                    {isCardActive && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#E50914] text-white text-[8px] font-mono font-bold tracking-wider">
                        ACTIVE
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
                  key={`vault-card-${photo.id}`}
                  onClick={() => navigateToCard(idx)}
                  className={`absolute inset-0 bg-[#0B0B0B] border border-[#2d2d2d] p-1.5 pb-2 rounded-lg flex flex-col justify-between text-neutral-300 cursor-pointer transition-all duration-300 ${
                    isCardActive
                      ? 'shadow-[0_25px_60px_rgba(229,9,20,0.3)] border-[#E50914] scale-[1.03]'
                      : 'shadow-[0_15px_40px_rgba(0,0,0,0.9)] opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${geometry.radius}px)`,
                    backfaceVisibility: 'hidden',
                    opacity: isFacingAway ? 0.15 : 1,
                  }}
                >
                  {/* Top sprockets */}
                  <div className="h-2.5 bg-[#050505] px-2 flex items-center gap-1.5 overflow-hidden mb-1">
                    {Array.from({ length: 6 }).map((_, h) => (
                      <div key={`v-top-${h}`} className="w-2 h-1 rounded-[1px] bg-[#1a1a1a] border border-[#333] shrink-0" />
                    ))}
                  </div>

                  <div className="w-full flex-1 overflow-hidden bg-black relative rounded-[2px]">
                    <AutoFitImage
                      src={photo.previewUrl}
                      alt={photo.caption}
                      focalPoint={heroFocus as any}
                    />
                    <div className="absolute top-1 left-1 text-[8px] font-mono px-1 py-0.5 rounded bg-black/80 text-white">
                      ▸ 35MM #{idx + 1}
                    </div>
                    {isCardActive && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#E50914] text-white text-[8px] font-mono font-bold tracking-wider">
                        ACTIVE
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
                  <div className="h-2.5 bg-[#050505] px-2 flex items-center gap-1.5 overflow-hidden mt-1">
                    {Array.from({ length: 6 }).map((_, h) => (
                      <div key={`v-bot-${h}`} className="w-2 h-1 rounded-[1px] bg-[#1a1a1a] border border-[#333] shrink-0" />
                    ))}
                  </div>
                </div>
              );
            }

            // 3. FULLSCREEN / EDITORIAL / CINEMATIC 3D VAULT CARD
            return (
              <div
                key={`vault-card-${photo.id}`}
                onClick={() => navigateToCard(idx)}
                className={`absolute inset-0 border shadow-2xl p-2 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                  isCardActive 
                    ? 'ring-2 shadow-[0_25px_60px_rgba(229,9,20,0.35)] scale-[1.03]' 
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
                  className={`w-full flex-1 overflow-hidden bg-black relative ${
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
        <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-xs mx-auto py-1">
          {photos.map((_, i) => (
            <button
              key={`dot-${i}`}
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
          Drag horizontally or tap any card to rotate the vault
        </p>
      </div>
    </div>
  );
};
