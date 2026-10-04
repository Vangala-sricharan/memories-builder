import React from 'react';
import { UploadedPhoto, ExperienceTemplate, PhotoPresentationStyle } from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { Sparkles, Star, MapPin, Calendar } from 'lucide-react';

interface MemorySpotlightViewProps {
  photo: UploadedPhoto;
  template: ExperienceTemplate;
  photoStyle: PhotoPresentationStyle;
  tokens: {
    primary: string;
    secondary: string;
    surface: string;
    border: string;
    muted: string;
    glowStrong: string;
    body: string;
  };
  headingFont: string;
  bodyFont: string;
  heroFocus?: string;
  glowStyle?: string;
}

export const MemorySpotlightView: React.FC<MemorySpotlightViewProps> = ({
  photo,
  template,
  photoStyle,
  tokens,
  headingFont,
  bodyFont,
  heroFocus = 'auto',
  glowStyle = 'cinematic',
}) => {
  return (
    <section className="relative px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Spotlight Badge */}
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.25em] mb-4">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-lg"
            style={{
              backgroundColor: `${tokens.primary}15`,
              borderColor: tokens.primary,
              color: tokens.primary,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-bold">SPOTLIGHT MEMORY</span>
          </div>

          <span style={{ color: tokens.muted }}>
            SIGNATURE MOMENT
          </span>
        </div>

        {/* Spotlight Frame — Responsive to PhotoPresentationStyle */}
        {photoStyle === 'polaroid' ? (
          <div className="relative max-w-2xl mx-auto py-4">
            {/* Vintage tape accent */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#eae5d8]/85 border border-black/10 shadow-sm z-20 rounded-[2px] pointer-events-none transform -rotate-1"
              style={{ clipPath: 'polygon(0 0, 100% 4%, 96% 100%, 4% 96%)' }}
            />
            
            <div className="bg-[#FAF8F5] text-[#1c1917] p-6 pb-12 rounded-[4px] shadow-[0_30px_70px_rgba(0,0,0,0.9)] border border-[#e8e4dc]">
              <div className="relative aspect-[16/10] overflow-hidden bg-black mb-5 rounded-[2px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]">
                <AutoFitImage
                  src={photo.previewUrl}
                  alt={photo.caption}
                  focalPoint={heroFocus as any}
                  className="transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute top-3 left-3 text-[10px] font-mono px-2.5 py-1 rounded bg-black/75 text-white/95">
                  ✦ SPOTLIGHT
                </div>
              </div>

              <div className="space-y-2 text-left">
                <h4
                  className="text-2xl sm:text-3xl font-serif italic font-black text-[#1c1917]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {photo.caption || 'A moment frozen in time'}
                </h4>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#78716c]">
                  {photo.year && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{photo.year}</span>
                    </span>
                  )}
                  {photo.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{photo.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : photoStyle === 'film-strip' ? (
          <div className="bg-[#090909] border border-[#282828] rounded-2xl overflow-hidden shadow-2xl">
            {/* Film sprocket top */}
            <div className="h-7 bg-[#0E0E0E] border-b border-[#222222] px-4 flex items-center justify-between overflow-hidden">
              <div className="flex items-center gap-3">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={`spot-top-${i}`} className="w-3.5 h-2 rounded-[1px] bg-[#1a1a1a] border border-[#333] shrink-0" />
                ))}
              </div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                70MM SPOTLIGHT FRAME
              </span>
            </div>

            {/* Main Film Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
              <AutoFitImage
                src={photo.previewUrl}
                alt={photo.caption}
                focalPoint={heroFocus as any}
                enableBackdropGlow={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6 text-left">
                <span
                  className="text-xs font-mono uppercase tracking-[0.2em] block mb-1.5 font-bold"
                  style={{ color: tokens.primary }}
                >
                  FEATURED TIMELINE ARCHIVE
                </span>
                <h4
                  className={`text-2xl sm:text-4xl font-bold ${headingFont}`}
                  style={{ color: tokens.secondary }}
                >
                  {photo.caption}
                </h4>
                {(photo.location || photo.year) && (
                  <div className="flex items-center gap-4 text-xs font-mono text-neutral-300 mt-2">
                    {photo.year && <span>{photo.year}</span>}
                    {photo.location && <span>· {photo.location}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Film sprocket bottom */}
            <div className="h-7 bg-[#0E0E0E] border-t border-[#222222] px-4 flex items-center justify-between overflow-hidden">
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                MASTER EXPOSURE
              </span>
              <div className="flex items-center gap-3">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={`spot-bot-${i}`} className="w-3.5 h-2 rounded-[1px] bg-[#1a1a1a] border border-[#333] shrink-0" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Fullscreen / Cinematic Default */
          <div
            className="relative rounded-3xl overflow-hidden border shadow-[0_25px_60px_rgba(0,0,0,0.85)] group"
            style={{
              backgroundColor: tokens.surface,
              borderColor: tokens.border,
            }}
          >
            {glowStyle !== 'none' && (
              <div
                className="absolute inset-0 rounded-3xl blur-[60px] pointer-events-none opacity-40 transition-opacity duration-700 group-hover:opacity-70"
                style={{ backgroundColor: tokens.primary }}
              />
            )}

            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
              <AutoFitImage
                src={photo.previewUrl}
                alt={photo.caption}
                focalPoint={heroFocus as any}
                enableBackdropGlow={true}
                className="transition-transform duration-1000 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" style={{ color: tokens.primary, fill: tokens.primary }} />
                  <span
                    className="text-xs font-mono uppercase tracking-[0.25em] font-bold"
                    style={{ color: tokens.primary }}
                  >
                    MASTER SPOTLIGHT
                  </span>
                </div>

                <h4
                  className={`text-2xl sm:text-4xl md:text-5xl font-black ${headingFont}`}
                  style={{ color: tokens.secondary }}
                >
                  {photo.caption}
                </h4>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-300 pt-1">
                  {photo.year && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{photo.year}</span>
                    </span>
                  )}
                  {photo.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{photo.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
