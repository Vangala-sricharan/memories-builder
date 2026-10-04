import React, { useState, useEffect, useRef } from 'react';
import { UploadedPhoto, ExperienceTemplate } from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { Sparkles, RotateCcw, Heart, Lock } from 'lucide-react';

interface FinalCinematicRevealProps {
  recipientName: string;
  surprisePhoto?: UploadedPhoto | null;
  surpriseText?: string;
  finalMessage?: string;
  senderName?: string;
  template?: ExperienceTemplate;
  tokens: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
    muted: string;
    body: string;
    glowStrong: string;
  };
  headingFont: string;
  bodyFont: string;
  heroFocus?: string;
  glowStyle?: string;
}

export const FinalCinematicReveal: React.FC<FinalCinematicRevealProps> = ({
  recipientName,
  surprisePhoto,
  surpriseText,
  finalMessage,
  senderName,
  template = 'cinema',
  tokens,
  headingFont,
  bodyFont,
  heroFocus = 'auto',
  glowStyle = 'cinematic',
}) => {
  // Reveal steps: 0 = dark, 1 = "AND FINALLY...", 2 = "HAPPY", 3 = "BIRTHDAY", 4 = Name, 5 = Surprise, 6 = Message
  const [revealStep, setRevealStep] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Trigger reveal sequence when entered viewport
  useEffect(() => {
    if (prefersReducedMotion) {
      setRevealStep(6);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted, prefersReducedMotion]);

  // Sequential choreographed timeline
  useEffect(() => {
    if (!hasStarted || prefersReducedMotion) return;

    const t1 = setTimeout(() => setRevealStep(1), 500);   // STEP 1: "AND FINALLY..."
    const t2 = setTimeout(() => setRevealStep(2), 1700);  // STEP 2: "HAPPY"
    const t3 = setTimeout(() => setRevealStep(3), 2900);  // STEP 3: "BIRTHDAY"
    const t4 = setTimeout(() => setRevealStep(4), 4100);  // STEP 4: RECIPIENT NAME
    const t5 = setTimeout(() => setRevealStep(5), 5500);  // STEP 5: SURPRISE IMAGE
    const t6 = setTimeout(() => setRevealStep(6), 6900);  // STEP 6: FINAL MESSAGE

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [hasStarted, prefersReducedMotion]);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealStep(0);
    setHasStarted(false);
    setTimeout(() => {
      setHasStarted(true);
    }, 100);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[92vh] sm:min-h-screen flex flex-col justify-between items-center py-8 sm:py-12 px-4 select-none overflow-hidden"
      style={{
        backgroundColor: '#050505',
        backgroundImage: `radial-gradient(ellipse at 50% 45%, ${tokens.primary}22 0%, rgba(5,5,5,0.92) 65%, #030303 100%)`,
      }}
    >
      {/* Deep Red Atmospheric Radial Glow (Reference-Inspired) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-1000"
        style={{
          width: 'clamp(320px, 70vw, 750px)',
          height: 'clamp(320px, 70vw, 750px)',
          backgroundColor: tokens.primary,
          filter: 'blur(140px)',
          opacity: revealStep >= 1 ? (glowStyle === 'bold' ? 0.35 : glowStyle === 'subtle' ? 0.18 : 0.26) : 0.08,
        }}
      />

      {/* Top Replay & Climax Chapter Header */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-xs font-mono">
        <span 
          className="text-[10px] tracking-[0.25em] uppercase font-semibold transition-opacity duration-700"
          style={{ 
            color: tokens.primary,
            opacity: revealStep >= 1 ? 1 : 0.2
          }}
        >
          THE GRAND FINALE
        </span>

        {revealStep >= 4 && (
          <button
            type="button"
            onClick={handleReplay}
            className="px-2.5 py-1 rounded-full border border-white/10 hover:border-white/30 text-[10px] font-mono text-neutral-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer bg-black/40 backdrop-blur-sm"
            title="Replay Climax Reveal"
          >
            <RotateCcw className="w-3 h-3 text-[#E50914]" />
            <span>Replay Climax</span>
          </button>
        )}
      </div>

      {/* Main Climax Editorial Typography Stage (Single-Screen Composition) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center items-center text-center py-2 space-y-4 sm:space-y-6">
        
        {/* STEP 1: "AND FINALLY..." */}
        <div
          className={`transition-all duration-1000 transform ${
            revealStep >= 1
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <span
            className="text-xs sm:text-sm md:text-base font-mono uppercase tracking-[0.35em] sm:tracking-[0.45em] font-bold block"
            style={{ 
              color: tokens.primary,
              textShadow: `0 0 20px ${tokens.primary}60`,
            }}
          >
            A N D &nbsp; F I N A L L Y . . .
          </span>
        </div>

        {/* STEP 2 & 3: "HAPPY" & "BIRTHDAY" (Massive Editorial Display Typography) */}
        <div className="space-y-0 sm:space-y-1 w-full overflow-hidden">
          {/* STEP 2: "HAPPY" */}
          <div
            className={`transition-all duration-1000 transform ${
              revealStep >= 2
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4'
            }`}
          >
            <h1
              className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-none text-white drop-shadow-2xl ${headingFont}`}
              style={{
                textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 0 40px rgba(255,255,255,0.15)',
              }}
            >
              HAPPY
            </h1>
          </div>

          {/* STEP 3: "BIRTHDAY" */}
          <div
            className={`transition-all duration-1000 transform ${
              revealStep >= 3
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4'
            }`}
          >
            <h1
              className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-none drop-shadow-2xl ${headingFont}`}
              style={{
                color: tokens.primary,
                textShadow: `0 4px 30px rgba(0,0,0,0.9), 0 0 50px ${tokens.primary}50`,
              }}
            >
              BIRTHDAY
            </h1>
          </div>
        </div>

        {/* STEP 4: RECIPIENT NAME (Emotional Focal Point) */}
        <div
          className={`w-full px-2 transition-all duration-1000 transform ${
            revealStep >= 4
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          <div
            className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-tight [text-wrap:balance] break-words text-white ${headingFont}`}
            style={{
              textShadow: `0 0 40px ${tokens.primary}40, 0 4px 20px rgba(0,0,0,0.9)`,
            }}
          >
            {recipientName}
          </div>
        </div>

        {/* STEP 5: SURPRISE IMAGE (Below Name in Single-Screen Viewport) */}
        {surprisePhoto && (
          <div
            className={`w-full max-w-sm sm:max-w-md pt-1 transition-all duration-1000 transform ${
              revealStep >= 5
                ? 'opacity-100 scale-100 translate-y-0 blur-0'
                : 'opacity-0 scale-90 translate-y-5 blur-sm'
            }`}
          >
            <div 
              className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-2 p-1 bg-black/90 group"
              style={{ borderColor: tokens.primary }}
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black">
                <AutoFitImage
                  src={surprisePhoto.previewUrl}
                  alt={surprisePhoto.caption || 'Secret Surprise'}
                  focalPoint={heroFocus as any}
                  enableBackdropGlow={true}
                  className="transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-2.5 left-3 right-3 text-left">
                  <span 
                    className="text-[9px] font-mono uppercase tracking-widest block font-bold"
                    style={{ color: tokens.primary }}
                  >
                    CONFIDENTIAL SURPRISE REVEALED
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">
                    {surprisePhoto.caption || surpriseText || 'The Secret Chapter'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: FINAL MESSAGE (Subtle Inscription) */}
        {finalMessage && (
          <div
            className={`max-w-lg mx-auto pt-2 px-4 transition-all duration-1000 transform ${
              revealStep >= 6
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3'
            }`}
          >
            <p 
              className={`text-xs sm:text-sm md:text-base leading-relaxed text-neutral-300 italic [text-wrap:balance] ${bodyFont}`}
            >
              "{finalMessage}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Credit */}
      <div 
        className={`relative z-10 text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 text-center transition-opacity duration-1000 ${
          revealStep >= 4 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {senderName ? (
          <span>
            PRESENTED WITH LOVE BY <span style={{ color: tokens.primary }}>{senderName}</span>
          </span>
        ) : (
          <span style={{ color: tokens.muted }}>
            IMMUTABLE 24-HOUR CINEMATIC MEMORY
          </span>
        )}
      </div>
    </section>
  );
};
