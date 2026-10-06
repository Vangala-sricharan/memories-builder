import React, { useState, useRef, useEffect } from 'react';
import { UploadedPhoto } from '../../../types';
import { AutoFitImage } from '../../common/AutoFitImage';
import { Film, Play, Pause, ChevronLeft, ChevronRight, MapPin, Calendar, Maximize2 } from 'lucide-react';

interface FilmStripPresentationProps {
  photos: UploadedPhoto[];
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
}

export const FilmStripPresentation: React.FC<FilmStripPresentationProps> = ({
  photos,
  tokens,
  headingFont,
  bodyFont,
  heroFocus = 'auto',
}) => {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [isPlayingReel, setIsPlayingReel] = useState(false);
  const stripScrollRef = useRef<HTMLDivElement>(null);

  // Auto reel advance when isPlayingReel is on
  useEffect(() => {
    if (!isPlayingReel || photos.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedFrameIndex((prev) => {
        const next = (prev + 1) % photos.length;
        scrollToFrame(next);
        return next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlayingReel, photos.length]);

  const scrollToFrame = (index: number) => {
    if (stripScrollRef.current) {
      const container = stripScrollRef.current;
      const card = container.children[index] as HTMLElement;
      if (card) {
        const scrollLeft = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  };

  const handleSelectFrame = (index: number) => {
    setSelectedFrameIndex(index);
    scrollToFrame(index);
  };

  const handleNext = () => {
    const next = (selectedFrameIndex + 1) % photos.length;
    handleSelectFrame(next);
  };

  const handlePrev = () => {
    const prev = (selectedFrameIndex - 1 + photos.length) % photos.length;
    handleSelectFrame(prev);
  };

  const currentPhoto = photos[selectedFrameIndex] || photos[0];

  return (
    <div className="w-full space-y-8 select-none">
      {/* Film Slate Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2 pb-3 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161616] border border-white/10">
            <Film className="w-3.5 h-3.5" style={{ color: tokens.primary }} />
            <span className="font-bold text-white uppercase tracking-wider">35MM CELLULOID STRIP</span>
          </div>
          <span className="text-neutral-500 hidden sm:inline">|</span>
          <span className="text-neutral-400 font-mono hidden sm:inline">
            REEL 01 · {photos.length} TOTAL FRAMES · 24 FPS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Autoplay Film Projector Toggle */}
          <button
            type="button"
            onClick={() => setIsPlayingReel(!isPlayingReel)}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: isPlayingReel ? tokens.primary : '#141414',
              borderColor: tokens.border,
              color: isPlayingReel ? '#FFFFFF' : tokens.secondary,
            }}
          >
            {isPlayingReel ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingReel ? 'Pause Reel' : 'Play Reel'}</span>
          </button>

          {/* Stepper Buttons */}
          <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-[#141414]">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Previous Frame"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-[11px] font-mono text-neutral-400 border-x border-white/10">
              {String(selectedFrameIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Next Frame"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Keyframe Director's Projection Screen */}
      {currentPhoto && (
        <div 
          className="relative rounded-2xl overflow-hidden border shadow-2xl bg-black transition-all duration-500"
          style={{
            borderColor: tokens.border,
          }}
        >
          {/* Top Film Sprocket Track for Keyframe */}
          <div className="h-6 sm:h-7 bg-[#090909] border-b border-[#222222] px-3 flex items-center justify-between overflow-hidden">
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={`top-hole-${i}`} 
                  className="w-3 sm:w-3.5 h-2 rounded-[2px] bg-[#1a1a1a] border border-[#333333] shrink-0 shadow-inner"
                />
              ))}
            </div>
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 shrink-0 uppercase pl-2">
              KODAK VISION3 500T · 5219
            </span>
          </div>

          {/* Projected Main Anamorphic Frame */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[520px] w-full overflow-hidden bg-black group">
            <AutoFitImage
              src={currentPhoto.previewUrl}
              alt={currentPhoto.caption}
              focalPoint={heroFocus as any}
              className="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />

            {/* Cinematic Scrims */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

            {/* Projection Technical Metadata Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-black/75 border border-white/10 text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: tokens.primary }} />
                <span>FRAME {String(selectedFrameIndex + 1).padStart(2, '0')}A</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-black/75 border border-white/10 text-neutral-300">
                SCENE 04 · TAKE {selectedFrameIndex + 1}
              </span>
            </div>

            {/* Frame Caption & Details */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1 max-w-xl">
                <h3 
                  className={`text-xl sm:text-3xl font-black text-white tracking-wide uppercase drop-shadow-md ${headingFont}`}
                >
                  {currentPhoto.caption}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-300">
                  {currentPhoto.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" style={{ color: tokens.primary }} />
                      <span>{currentPhoto.location}</span>
                    </span>
                  )}
                  {currentPhoto.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" style={{ color: tokens.primary }} />
                      <span>{currentPhoto.year}</span>
                    </span>
                  )}
                </div>
              </div>

              <span
                className="font-mono text-xs px-3 py-1 rounded-full border self-start sm:self-auto uppercase tracking-wider"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  borderColor: tokens.border,
                  color: tokens.secondary,
                }}
              >
                PROJECTION ACTIVE
              </span>
            </div>
          </div>

          {/* Bottom Film Sprocket Track for Keyframe */}
          <div className="h-6 sm:h-7 bg-[#090909] border-t border-[#222222] px-3 flex items-center justify-between overflow-hidden">
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 shrink-0 uppercase pr-2">
              EASTMAN SAFETY FILM · 2026
            </span>
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={`bot-hole-${i}`} 
                  className="w-3 sm:w-3.5 h-2 rounded-[2px] bg-[#1a1a1a] border border-[#333333] shrink-0 shadow-inner"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Cinematic Celluloid Film Reel Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1">
          <span className="uppercase tracking-wider">CONTINUOUS FILM NEGATIVE STRIP</span>
          <span>Click any cell to project</span>
        </div>

        {/* Outer Film Strip Container */}
        <div 
          className="relative bg-[#070707] border-y-2 border-[#262626] py-3 shadow-2xl rounded-xl overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(to bottom, #0d0d0d, #050505)',
          }}
        >
          {/* Continuous Top Sprocket Holes Track */}
          <div className="h-4 bg-[#0A0A0A] border-b border-[#202020] px-4 flex items-center gap-4 overflow-hidden select-none">
            {Array.from({ length: 60 }).map((_, i) => (
              <div 
                key={`strip-top-${i}`} 
                className="w-3 h-2 rounded-[1.5px] bg-[#171717] border border-[#303030] shrink-0" 
              />
            ))}
          </div>

          {/* Horizontally Scrollable Frames */}
          <div
            ref={stripScrollRef}
            className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-3 px-4 scrollbar-none snap-x snap-mandatory"
            style={{ scrollBehavior: 'smooth' }}
          >
            {photos.map((photo, index) => {
              const isSelected = selectedFrameIndex === index;

              return (
                <div
                  key={photo.id || index}
                  data-cursor="photo"
                  onClick={() => handleSelectFrame(index)}
                  className={`shrink-0 w-44 sm:w-56 cursor-pointer snap-center group transition-all duration-300 relative border ${
                    isSelected
                      ? 'ring-2 shadow-2xl scale-[1.03] z-20'
                      : 'opacity-70 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                  style={{
                    borderColor: isSelected ? tokens.primary : '#282828',
                    backgroundColor: '#0E0E0E',
                    boxShadow: isSelected ? `0 0 15px ${tokens.primary}40` : undefined,
                  }}
                >
                  {/* Vertical Film Edge Separator Indicator */}
                  <div className="h-5 bg-[#000000] border-b border-[#202020] px-2 flex items-center justify-between text-[9px] font-mono text-neutral-400">
                    <span style={{ color: isSelected ? tokens.primary : undefined }}>
                      ▸ {String(index + 1).padStart(2, '0')}A
                    </span>
                    <span className="text-[8px] text-neutral-600">35MM</span>
                  </div>

                  {/* Cell Frame Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                    <AutoFitImage
                      src={photo.previewUrl}
                      alt={photo.caption}
                      focalPoint={heroFocus as any}
                    />

                    {/* Active highlight border glow */}
                    {isSelected && (
                      <div 
                        className="absolute inset-0 border-2 pointer-events-none"
                        style={{ borderColor: tokens.primary }}
                      />
                    )}
                  </div>

                  {/* Bottom Cell Label */}
                  <div className="p-2 bg-[#0C0C0C] border-t border-[#202020]">
                    <p className="text-xs font-semibold text-white truncate">
                      {photo.caption}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400 truncate mt-0.5">
                      {photo.location || photo.year || `FRAME ${index + 1}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continuous Bottom Sprocket Holes Track */}
          <div className="h-4 bg-[#0A0A0A] border-t border-[#202020] px-4 flex items-center gap-4 overflow-hidden select-none">
            {Array.from({ length: 60 }).map((_, i) => (
              <div 
                key={`strip-bot-${i}`} 
                className="w-3 h-2 rounded-[1.5px] bg-[#171717] border border-[#303030] shrink-0" 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
