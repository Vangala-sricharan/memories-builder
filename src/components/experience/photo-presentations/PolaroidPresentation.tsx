import React, { useState } from 'react';
import { UploadedPhoto, ExperienceTheme } from '../../../types';
import { AutoFitImage } from '../../common/AutoFitImage';
import { MapPin, Calendar, ZoomIn, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface PolaroidPresentationProps {
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

// Subtle, organic tilts for authentic physical photo feel
const POLAROID_ANGLES = [-2.2, 1.8, -1.4, 2.5, -1.9, 1.6, -1.1, 2.2, -1.7, 1.3];

export const PolaroidPresentation: React.FC<PolaroidPresentationProps> = ({
  photos,
  tokens,
  headingFont,
  bodyFont,
  heroFocus = 'auto',
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setActivePhotoIndex(index);
  };

  const closeLightbox = () => {
    setActivePhotoIndex(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex + 1) % photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="w-full space-y-8 select-none">
      {/* Visual Guide Header */}
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-2 pb-2 border-b border-white/10">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tokens.primary }} />
          <span className="uppercase tracking-widest text-neutral-300">
            POLAROID MEMORY ALBUM · {photos.length} PRINTS
          </span>
        </span>
        <span className="text-[11px] text-neutral-500 hidden sm:inline">
          Tap any photograph to examine in detail
        </span>
      </div>

      {/* Polaroid Scattered Table / Pinboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 pt-4 pb-8">
        {photos.map((photo, index) => {
          const rotationAngle = POLAROID_ANGLES[index % POLAROID_ANGLES.length];
          const hasLocationOrYear = photo.location || photo.year;

          return (
            <div
              key={photo.id || index}
              className="relative group transition-all duration-300"
              style={{
                perspective: '1000px',
              }}
            >
              {/* Decorative vintage tape strip on top of Polaroid */}
              <div 
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#eae5d8]/70 backdrop-blur-[1px] border border-black/10 shadow-sm z-20 rounded-[1px] pointer-events-none transform -rotate-1 group-hover:opacity-90 transition-opacity"
                style={{
                  clipPath: 'polygon(0 0, 100% 4%, 96% 100%, 4% 96%)',
                }}
              />

              {/* Physical Polaroid Card */}
              <div
                data-cursor="expand"
                onClick={() => openLightbox(index)}
                className="relative bg-[#FAF8F5] text-[#1c1917] p-3.5 sm:p-4 pb-7 sm:pb-8 rounded-[4px] cursor-pointer transition-all duration-300 ease-out transform group-hover:scale-[1.03] group-hover:-translate-y-2.5 group-hover:rotate-0 group-hover:z-30 shadow-[0_16px_36px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4)] group-hover:shadow-[0_28px_56px_rgba(0,0,0,0.85),0_10px_20px_rgba(0,0,0,0.5)] border border-[#e8e4dc]"
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Photo Inset Frame */}
                <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-[#18181b] rounded-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] border border-black/15">
                  <AutoFitImage
                    src={photo.previewUrl}
                    alt={photo.caption || `Memory ${index + 1}`}
                    focalPoint={heroFocus as any}
                    className="group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Glossy Photo Glare Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Quick Expand Icon on Hover */}
                  <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>

                  {/* Stamp badge */}
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white/90">
                    PRINT #{String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Classic Wide Bottom Polaroid Caption Margin */}
                <div className="pt-3 px-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 
                      className="font-serif italic text-sm sm:text-base font-semibold text-[#1c1917] leading-snug line-clamp-2"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {photo.caption || 'Timeless Memory'}
                    </h4>
                  </div>

                  {hasLocationOrYear && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#57534e] pt-1 border-t border-[#e7e3da]">
                      {photo.location ? (
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <MapPin className="w-3 h-3 text-[#78716c] shrink-0" />
                          <span className="truncate">{photo.location}</span>
                        </span>
                      ) : (
                        <span />
                      )}

                      {photo.year && (
                        <span className="flex items-center gap-1 font-semibold text-[#44403c] shrink-0">
                          <Calendar className="w-3 h-3 text-[#78716c]" />
                          <span>{photo.year}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Lightbox View Modal */}
      {activePhotoIndex !== null && photos[activePhotoIndex] && (
        <div 
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-50 border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Controls */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer z-50 shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer z-50 shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Expanded Polaroid Card */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl w-full bg-[#FAF8F5] text-[#1c1917] p-5 sm:p-7 pb-10 sm:pb-12 rounded-lg shadow-2xl border border-white/40 animate-scale-up"
          >
            {/* Top Tape */}
            <div 
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#eae5d8]/80 backdrop-blur-sm border border-black/10 shadow-md rounded-[1px] pointer-events-none"
              style={{ clipPath: 'polygon(0 0, 100% 3%, 97% 100%, 3% 97%)' }}
            />

            {/* Photo Inset */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-black rounded shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] border border-black/20">
              <AutoFitImage
                src={photos[activePhotoIndex].previewUrl}
                alt={photos[activePhotoIndex].caption}
                focalPoint={heroFocus as any}
              />
            </div>

            {/* Large Bottom Inscription Area */}
            <div className="pt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#78716c] pb-1 border-b border-[#e7e3da]">
                <span>POLAROID ARCHIVE · #{activePhotoIndex + 1} OF {photos.length}</span>
                {photos[activePhotoIndex].year && (
                  <span className="font-bold text-[#1c1917]">{photos[activePhotoIndex].year}</span>
                )}
              </div>

              <h3 
                className="text-xl sm:text-2xl font-serif italic font-bold text-[#1c1917] leading-snug"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {photos[activePhotoIndex].caption}
              </h3>

              {photos[activePhotoIndex].location && (
                <p className="text-xs sm:text-sm font-mono text-[#57534e] flex items-center gap-1.5 pt-1">
                  <MapPin className="w-4 h-4 text-[#78716c]" />
                  <span>{photos[activePhotoIndex].location}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
