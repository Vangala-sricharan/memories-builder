import React, { useState, useEffect } from 'react';
import { UploadedPhoto } from '../../../types';
import { AutoFitImage } from '../../common/AutoFitImage';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Play, 
  Pause, 
  Maximize2,
  Sparkles,
  Layers
} from 'lucide-react';

interface FullscreenPresentationProps {
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

export const FullscreenPresentation: React.FC<FullscreenPresentationProps> = ({
  photos,
  tokens,
  headingFont,
  bodyFont,
  heroFocus = 'auto',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Auto transition for immersive cinematic mode
  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, photos.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const currentPhoto = photos[currentIndex] || photos[0];

  return (
    <div className="w-full space-y-6 select-none">
      {/* Immersive Viewport Stage */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl border bg-black transition-all duration-700 h-[72vh] sm:h-[82vh] max-h-[820px] flex flex-col justify-between"
        style={{
          borderColor: tokens.border,
        }}
      >
        {/* Full Viewport Background Image with Ken Burns drift */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AutoFitImage
            key={`fullscreen-${currentPhoto.id || currentIndex}`}
            src={currentPhoto.previewUrl}
            alt={currentPhoto.caption}
            focalPoint={heroFocus as any}
            enableBackdropGlow={true}
            className="w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-[3000ms] ease-out"
          />

          {/* Cinematic Directional Overlay Gradients for High Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/50 pointer-events-none" />
        </div>

        {/* Top Floating Cinema HUD Bar */}
        <div className="relative z-20 p-4 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span 
              className="text-[11px] font-mono uppercase tracking-[0.25em] px-3 py-1 rounded-full border backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(0,0,0,0.65)',
                borderColor: tokens.border,
                color: tokens.secondary,
              }}
            >
              FULLSCREEN PANORAMA · ACT IV
            </span>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 backdrop-blur-md px-2.5 py-1 rounded-md bg-black/40 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: tokens.primary }} />
              <span>FRAME {String(currentIndex + 1).padStart(2, '0')} OF {String(photos.length).padStart(2, '0')}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto Play / Slideshow Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="px-3.5 py-1.5 rounded-full border text-xs font-mono backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: isAutoPlaying ? tokens.primary : 'rgba(0,0,0,0.65)',
                borderColor: tokens.border,
                color: isAutoPlaying ? '#FFFFFF' : tokens.secondary,
              }}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAutoPlaying ? 'Auto Advancing' : 'Play Slideshow'}</span>
            </button>
          </div>
        </div>

        {/* Left & Right Cinematic Arrows */}
        {photos.length > 1 && (
          <div className="relative z-20 px-4 sm:px-8 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all pointer-events-auto cursor-pointer shadow-2xl hover:scale-110 active:scale-95"
              title="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all pointer-events-auto cursor-pointer shadow-2xl hover:scale-110 active:scale-95"
              title="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Bottom Heroic Story Narrative Scrim */}
        <div className="relative z-20 p-5 sm:p-10 space-y-4 max-w-4xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs font-mono text-neutral-300">
              {currentPhoto.year && (
                <span className="flex items-center gap-1 font-bold" style={{ color: tokens.primary }}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentPhoto.year}</span>
                </span>
              )}
              {currentPhoto.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{currentPhoto.location}</span>
                </span>
              )}
            </div>

            <h2 
              className={`text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-xl ${headingFont}`}
            >
              {currentPhoto.caption}
            </h2>
          </div>

          {/* Interactive Thumbnails Scrubber Strip */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {photos.map((photo, idx) => {
              const isSelected = currentIndex === idx;
              return (
                <button
                  key={photo.id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`shrink-0 h-12 sm:h-14 aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'scale-110 ring-2 z-10 shadow-lg'
                      : 'opacity-50 hover:opacity-90'
                  }`}
                  style={{
                    borderColor: isSelected ? tokens.primary : 'rgba(255,255,255,0.2)',
                    boxShadow: isSelected ? `0 0 12px ${tokens.primary}50` : undefined,
                  }}
                >
                  <AutoFitImage
                    src={photo.previewUrl}
                    alt={photo.caption}
                    focalPoint={heroFocus as any}
                  />
                  {isSelected && (
                    <div 
                      className="absolute inset-0 bg-white/10 pointer-events-none"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
