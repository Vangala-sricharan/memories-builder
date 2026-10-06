import React, { useState } from 'react';
import { UploadedPhoto, ExperienceTemplate, PhotoPresentationStyle } from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { Sparkles, Eye, Lock, Unlock, Heart } from 'lucide-react';

interface SecretRevealViewProps {
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
  isInitiallyRevealed?: boolean;
  onRevealed?: () => void;
}

export const SecretRevealView: React.FC<SecretRevealViewProps> = ({
  photo,
  template,
  photoStyle,
  tokens,
  headingFont,
  bodyFont,
  heroFocus = 'auto',
  glowStyle = 'cinematic',
  isInitiallyRevealed = false,
  onRevealed,
}) => {
  const [isRevealed, setIsRevealed] = useState(isInitiallyRevealed);

  React.useEffect(() => {
    if (isInitiallyRevealed) {
      setIsRevealed(true);
    }
  }, [isInitiallyRevealed]);

  const handleReveal = () => {
    setIsRevealed(true);
    if (onRevealed) onRevealed();
  };

  return (
    <section className="relative px-4 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative rounded-3xl p-6 sm:p-12 border text-center overflow-hidden shadow-2xl transition-all duration-700"
          style={{
            backgroundColor: tokens.surface,
            borderColor: isRevealed ? tokens.primary : tokens.border,
          }}
        >
          {/* Ambient Glow */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[90px] pointer-events-none transition-opacity duration-1000 ${
              isRevealed ? 'opacity-80' : 'opacity-30'
            }`}
            style={{ backgroundColor: tokens.primary }}
          />

          {!isRevealed ? (
            /* Locked / Teaser State */
            <div className="relative z-10 space-y-6 py-6 sm:py-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono uppercase tracking-[0.25em] font-bold"
                style={{
                  backgroundColor: `${tokens.primary}15`,
                  borderColor: tokens.primary,
                  color: tokens.primary,
                }}
              >
                <Lock className="w-3.5 h-3.5 animate-pulse" />
                <span>SECRET REVEAL</span>
              </div>

              <div className="space-y-2">
                <h3
                  className={`text-3xl sm:text-5xl font-black uppercase tracking-tight ${headingFont}`}
                  style={{ color: tokens.secondary }}
                >
                  A MEMORY IS WAITING...
                </h3>
                <p
                  className={`text-sm sm:text-base max-w-md mx-auto ${bodyFont}`}
                  style={{ color: tokens.muted }}
                >
                  KEEP GOING · A private moment sealed until now
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReveal}
                  className="px-8 py-4 rounded-xl text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-xl hover:scale-105 cursor-pointer inline-flex items-center gap-2.5 font-mono"
                  style={{
                    backgroundColor: tokens.primary,
                    color: '#FFFFFF',
                    boxShadow: `0 10px 30px ${tokens.glowStrong}`,
                  }}
                >
                  <Unlock className="w-4 h-4" />
                  <span>REVEAL SECRET MEMORY</span>
                </button>
              </div>
            </div>
          ) : (
            /* Revealed State */
            <div className="relative z-10 space-y-6 animate-fade-in">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono uppercase tracking-[0.25em] font-bold"
                style={{
                  backgroundColor: `${tokens.primary}20`,
                  borderColor: tokens.primary,
                  color: tokens.primary,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>SECRET UNLOCKED</span>
              </div>

              {/* Photo Display adhering to photoStyle */}
              {photoStyle === 'polaroid' ? (
                <div className="max-w-md mx-auto pt-2 pb-6">
                  <div className="bg-[#FAF8F5] text-[#1c1917] p-4 pb-8 rounded-[3px] shadow-[0_25px_50px_rgba(0,0,0,0.85)] border border-[#e8e4dc]">
                    <div className="aspect-[4/3] overflow-hidden bg-black mb-3 relative rounded-[2px]">
                      <AutoFitImage
                        src={photo.previewUrl}
                        alt={photo.caption}
                        focalPoint={heroFocus as any}
                      />
                    </div>
                    <h4
                      className="text-lg sm:text-xl font-serif italic font-bold text-[#1c1917] text-left"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {photo.caption || 'A secret chapter'}
                    </h4>
                  </div>
                </div>
              ) : photoStyle === 'film-strip' ? (
                <div className="bg-[#090909] border border-[#282828] rounded-xl overflow-hidden shadow-2xl max-w-2xl mx-auto">
                  <div className="h-6 bg-[#0E0E0E] border-b border-[#222222] px-3 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-neutral-400">70MM ARCHIVE · SECRET</span>
                  </div>
                  <div className="relative aspect-[16/9] w-full bg-black">
                    <AutoFitImage
                      src={photo.previewUrl}
                      alt={photo.caption}
                      focalPoint={heroFocus as any}
                    />
                  </div>
                  <div className="p-4 text-left">
                    <h4 className={`text-lg sm:text-xl font-bold ${headingFont}`} style={{ color: tokens.secondary }}>
                      {photo.caption}
                    </h4>
                  </div>
                </div>
              ) : (
                <div
                  className="relative aspect-[16/9] w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border shadow-2xl bg-black"
                  style={{ borderColor: tokens.primary }}
                >
                  <AutoFitImage
                    src={photo.previewUrl}
                    alt={photo.caption}
                    focalPoint={heroFocus as any}
                    enableBackdropGlow={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 text-left">
                    <h4
                      className={`text-xl sm:text-3xl font-black ${headingFont}`}
                      style={{ color: tokens.secondary }}
                    >
                      {photo.caption}
                    </h4>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
