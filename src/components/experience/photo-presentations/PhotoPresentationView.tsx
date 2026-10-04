import React from 'react';
import { UploadedPhoto, PhotoPresentationStyle, ExperienceTemplate } from '../../../types';
import { PolaroidPresentation } from './PolaroidPresentation';
import { FilmStripPresentation } from './FilmStripPresentation';
import { FullscreenPresentation } from './FullscreenPresentation';
import { AutoFitImage } from '../../common/AutoFitImage';
import { MapPin, Calendar, Film } from 'lucide-react';

interface PhotoPresentationViewProps {
  photoStyle: PhotoPresentationStyle;
  template: ExperienceTemplate;
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
  activeMemoryIndex: number;
  onSelectMemory: (index: number) => void;
  glowStyle?: string;
  borderStyle?: string;
}

export const PhotoPresentationView: React.FC<PhotoPresentationViewProps> = ({
  photoStyle,
  template,
  photos,
  tokens,
  headingFont,
  bodyFont,
  heroFocus = 'auto',
  activeMemoryIndex,
  onSelectMemory,
  glowStyle = 'cinematic',
  borderStyle = 'cinematic',
}) => {
  if (photos.length === 0) return null;

  // 1. POLAROID MODE
  if (photoStyle === 'polaroid') {
    return (
      <PolaroidPresentation
        photos={photos}
        tokens={tokens}
        headingFont={headingFont}
        bodyFont={bodyFont}
        heroFocus={heroFocus}
      />
    );
  }

  // 2. FILM STRIP MODE
  if (photoStyle === 'film-strip') {
    return (
      <FilmStripPresentation
        photos={photos}
        tokens={tokens}
        headingFont={headingFont}
        bodyFont={bodyFont}
        heroFocus={heroFocus}
      />
    );
  }

  // 3. FULLSCREEN MODE
  if (photoStyle === 'fullscreen') {
    return (
      <FullscreenPresentation
        photos={photos}
        tokens={tokens}
        headingFont={headingFont}
        bodyFont={bodyFont}
        heroFocus={heroFocus}
      />
    );
  }

  // 4. CINEMATIC / EDITORIAL (DEFAULT) MODE
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {photos.map((photo, index) => {
        const isActive = activeMemoryIndex === index;
        return (
          <div
            key={photo.id || index}
            onClick={() => onSelectMemory(index)}
            className={`border p-5 transition-all duration-300 group cursor-pointer ${
              template === 'memories'
                ? 'rounded-3xl'
                : template === 'elegance'
                ? 'rounded-lg border-white/10'
                : 'rounded-2xl'
            }`}
            style={{
              backgroundColor: tokens.surface,
              borderColor: isActive ? tokens.primary : borderStyle === 'none' ? 'transparent' : tokens.border,
              boxShadow: isActive && glowStyle !== 'none' ? `0 20px 40px ${tokens.primary}20` : undefined,
            }}
          >
            <div
              className={`overflow-hidden bg-black mb-4 relative aspect-[16/10] ${
                template === 'memories' ? 'rounded-2xl' : template === 'elegance' ? 'rounded-sm' : 'rounded-xl'
              }`}
            >
              <AutoFitImage
                src={photo.previewUrl}
                alt={photo.caption}
                focalPoint={heroFocus as any}
                className="group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-mono border"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  borderColor: tokens.border,
                  color: tokens.secondary,
                }}
              >
                MEMORY #{String(index + 1).padStart(2, '0')}
              </div>
            </div>

            <div className="space-y-1">
              <div
                className="flex items-center justify-between text-xs font-mono"
                style={{ color: tokens.muted }}
              >
                <span style={{ color: tokens.primary }}>
                  {photo.year || 'TIMELINE'}
                </span>
                {photo.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" style={{ color: tokens.primary }} />
                    {photo.location}
                  </span>
                )}
              </div>
              <h3
                className={`text-base sm:text-lg font-bold transition-colors ${headingFont}`}
                style={{ color: isActive ? tokens.primary : tokens.secondary }}
              >
                {photo.caption}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
