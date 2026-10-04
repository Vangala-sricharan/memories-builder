import React from 'react';
import { UploadedPhoto, PhotoPresentationStyle, ExperienceTemplate } from '../../../types';
import { AutoFitImage } from '../../common/AutoFitImage';
import { MapPin, Calendar, Film, Star, Sparkles } from 'lucide-react';

interface HeroPhotoFrameProps {
  photo: UploadedPhoto;
  photoStyle: PhotoPresentationStyle;
  template: ExperienceTemplate;
  tokens: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
    muted: string;
    body: string;
  };
  headingFont: string;
  bodyFont: string;
  heroFocus?: string;
  glowStyle?: string;
  borderStyle?: string;
}

export const HeroPhotoFrame: React.FC<HeroPhotoFrameProps> = ({
  photo,
  photoStyle,
  template,
  tokens,
  headingFont,
  bodyFont,
  heroFocus = 'auto',
  glowStyle = 'cinematic',
  borderStyle = 'cinematic',
}) => {
  // 1. POLAROID HERO PRESENTATION
  if (photoStyle === 'polaroid') {
    return (
      <div className="relative max-w-3xl mx-auto py-4 select-none">
        {/* Top vintage masking tape accent */}
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#eae5d8]/80 backdrop-blur-sm border border-black/10 shadow-md z-20 rounded-[1px] pointer-events-none transform -rotate-1"
          style={{ clipPath: 'polygon(0 0, 100% 3%, 97% 100%, 3% 97%)' }}
        />

        {/* Physical Polaroid Card */}
        <div 
          className="relative bg-[#FAF8F5] text-[#1c1917] p-5 sm:p-7 pb-10 sm:pb-12 rounded-[4px] shadow-[0_25px_60px_rgba(0,0,0,0.85),0_8px_24px_rgba(0,0,0,0.5)] border border-[#e8e4dc] transform -rotate-1 hover:rotate-0 transition-transform duration-500"
        >
          {/* Photo Inset Frame */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] max-h-[500px] w-full overflow-hidden bg-[#121212] rounded-[2px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] border border-black/20">
            <AutoFitImage
              src={photo.previewUrl}
              alt={photo.caption}
              focalPoint={heroFocus as any}
              enableBackdropGlow={true}
              className="hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />

            <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white/90 border border-white/10">
              COLLECTOR'S POLAROID · HERO KEYFRAME
            </div>
          </div>

          {/* Large Bottom Margin with Handwritten / Classic Inscription */}
          <div className="pt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#78716c] pb-1.5 border-b border-[#e7e3da]">
              <span className="uppercase tracking-widest font-semibold text-[#44403c]">
                SIGNATURE HERO PORTRAIT
              </span>
              {photo.year && (
                <span className="font-bold text-[#1c1917]">{photo.year}</span>
              )}
            </div>

            <h3 
              className="text-2xl sm:text-4xl font-serif italic font-bold text-[#1c1917] leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {photo.caption}
            </h3>

            {photo.location && (
              <p className="text-xs sm:text-sm font-mono text-[#57534e] flex items-center gap-1.5 pt-1">
                <MapPin className="w-4 h-4 text-[#78716c]" />
                <span>{photo.location}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. FILM STRIP HERO PRESENTATION
  if (photoStyle === 'film-strip') {
    return (
      <div 
        className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden border shadow-2xl bg-black select-none"
        style={{ borderColor: tokens.border }}
      >
        {/* Top 35mm Sprocket Track */}
        <div className="h-7 bg-[#080808] border-b border-[#222222] px-4 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-4 overflow-hidden">
            {Array.from({ length: 26 }).map((_, i) => (
              <div 
                key={`hero-top-${i}`} 
                className="w-3.5 h-2 rounded-[2px] bg-[#1a1a1a] border border-[#333333] shrink-0 shadow-inner"
              />
            ))}
          </div>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 shrink-0 uppercase pl-3">
            70MM MASTER · 24 FPS
          </span>
        </div>

        {/* Master Film Image Frame */}
        <div className="relative aspect-[16/9] sm:aspect-[2.39/1] max-h-[520px] w-full overflow-hidden bg-black group">
          <AutoFitImage
            src={photo.previewUrl}
            alt={photo.caption}
            focalPoint={heroFocus as any}
            className="group-hover:scale-[1.02] transition-transform duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

          {/* Film Stamp Overlays */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-neutral-300">
            <span className="px-2.5 py-1 rounded bg-black/80 border border-white/10 text-white flex items-center gap-2">
              <Film className="w-3 h-3" style={{ color: tokens.primary }} />
              <span>KEYFRAME 01 · MASTER CUT</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-black/80 border border-white/10">
              SAFETY FILM · KODAK 500T
            </span>
          </div>

          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span
                className="text-[10px] font-mono uppercase tracking-[0.25em] block mb-1"
                style={{ color: tokens.primary }}
              >
                CINEMATOGRAPHY LEAD
              </span>
              <h3 
                className={`text-2xl sm:text-4xl font-black text-white tracking-wide uppercase drop-shadow-md ${headingFont}`}
              >
                {photo.caption}
              </h3>
              {photo.location && (
                <p className="text-xs font-mono text-neutral-300 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" style={{ color: tokens.primary }} />
                  <span>{photo.location}</span>
                  {photo.year && <span>· {photo.year}</span>}
                </p>
              )}
            </div>

            <span
              className="font-mono text-xs px-3 py-1 rounded-full border self-start sm:self-auto"
              style={{
                backgroundColor: 'rgba(0,0,0,0.85)',
                borderColor: tokens.border,
                color: tokens.secondary,
              }}
            >
              ANAMORPHIC FRAME
            </span>
          </div>
        </div>

        {/* Bottom 35mm Sprocket Track */}
        <div className="h-7 bg-[#080808] border-t border-[#222222] px-4 flex items-center justify-between overflow-hidden">
          <span className="text-[10px] font-mono tracking-widest text-neutral-400 shrink-0 uppercase pr-3">
            MEMORIES PREMIERE REEL
          </span>
          <div className="flex items-center gap-4 overflow-hidden">
            {Array.from({ length: 26 }).map((_, i) => (
              <div 
                key={`hero-bot-${i}`} 
                className="w-3.5 h-2 rounded-[2px] bg-[#1a1a1a] border border-[#333333] shrink-0 shadow-inner"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. FULLSCREEN HERO PRESENTATION
  if (photoStyle === 'fullscreen') {
    return (
      <div 
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl border bg-black select-none h-[65vh] sm:h-[75vh] max-h-[750px] flex flex-col justify-end"
        style={{ borderColor: tokens.border }}
      >
        <div className="absolute inset-0 z-0">
          <AutoFitImage
            src={photo.previewUrl}
            alt={photo.caption}
            focalPoint={heroFocus as any}
            enableBackdropGlow={true}
            className="w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-[3000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/70 pointer-events-none" />
        </div>

        {/* Top badge */}
        <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
          <span 
            className="text-[11px] font-mono uppercase tracking-[0.25em] px-3 py-1 rounded-full border backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderColor: tokens.border,
              color: tokens.secondary,
            }}
          >
            IMMERSIVE HERO VIEWPORT
          </span>
        </div>

        {/* Fullscreen Overlay Narrative */}
        <div className="relative z-10 p-6 sm:p-12 space-y-3 max-w-3xl">
          <span 
            className="text-xs font-mono uppercase tracking-[0.3em] font-semibold block"
            style={{ color: tokens.primary }}
          >
            CENTRAL MONUMENT
          </span>
          <h2 
            className={`text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-xl ${headingFont}`}
          >
            {photo.caption}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-300 pt-1">
            {photo.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" style={{ color: tokens.primary }} />
                <span>{photo.location}</span>
              </span>
            )}
            {photo.year && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" style={{ color: tokens.primary }} />
                <span>{photo.year}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. DEFAULT CINEMATIC / EDITORIAL HERO
  return (
    <div
      className={`relative overflow-hidden border shadow-2xl group transition-all duration-300 ${
        template === 'memories'
          ? 'rounded-3xl p-3 sm:p-4'
          : template === 'elegance'
          ? 'rounded-none border-white/15'
          : 'rounded-2xl'
      }`}
      style={{
        backgroundColor: tokens.surface,
        borderColor: borderStyle === 'none' ? 'transparent' : tokens.border,
      }}
    >
      <div
        className={`relative w-full overflow-hidden bg-black flex items-center justify-center aspect-[16/9] max-h-[580px] ${
          template === 'memories' ? 'rounded-2xl' : template === 'elegance' ? 'rounded-none' : 'rounded-xl'
        }`}
      >
        <AutoFitImage
          src={photo.previewUrl}
          alt={photo.caption}
          focalPoint={heroFocus as any}
          enableBackdropGlow={glowStyle !== 'none'}
          className="group-hover:scale-[1.02] transition-transform duration-700"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

        <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span
              className="text-[10px] font-mono uppercase tracking-[0.2em] block mb-1"
              style={{ color: tokens.primary }}
            >
              THE DEFINITIVE PORTRAIT
            </span>
            <h3
              className={`text-xl sm:text-3xl font-bold tracking-wide ${headingFont}`}
              style={{ color: tokens.secondary }}
            >
              {photo.caption}
            </h3>
            {photo.location && (
              <p
                className="text-xs font-mono flex items-center gap-1.5 mt-1"
                style={{ color: tokens.muted }}
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: tokens.primary }} />
                <span>{photo.location}</span>
                {photo.year && <span>· {photo.year}</span>}
              </p>
            )}
          </div>
          <span
            className="font-mono text-xs px-3 py-1 rounded-full border self-start sm:self-auto"
            style={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              borderColor: tokens.border,
              color: tokens.secondary,
            }}
          >
            HERO FRAME
          </span>
        </div>
      </div>
    </div>
  );
};
