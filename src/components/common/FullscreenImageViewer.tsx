import React, { useEffect, useRef } from 'react';
import { UploadedPhoto } from '../../types';
import { X, Calendar, MapPin, Maximize2, Sparkles } from 'lucide-react';
import { setFullscreenActive } from '../../hooks/useScrollDirection';

interface FullscreenImageViewerProps {
  photo: UploadedPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  photo,
  isOpen,
  onClose,
  currentIndex,
  totalCount,
}) => {
  const previousScrollYRef = useRef<number>(0);

  // Preserve scroll position & prevent body scrolling when open, and pause scroll reveals
  useEffect(() => {
    if (!isOpen) return;

    setFullscreenActive(true);

    if (typeof window !== 'undefined') {
      previousScrollYRef.current = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        // Explicitly restore previous scroll position
        window.scrollTo({
          top: previousScrollYRef.current,
          behavior: 'instant' as ScrollBehavior,
        });
        setFullscreenActive(false);
      };
    } else {
      return () => {
        setFullscreenActive(false);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !photo) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div 
        className="w-full h-16 px-4 sm:px-8 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914]">
            <Maximize2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E50914] font-semibold block">
              FULLSCREEN ARCHIVE
            </span>
            <span className="text-xs font-mono text-neutral-400">
              {currentIndex !== undefined && totalCount !== undefined
                ? `Memory #${currentIndex + 1} of ${totalCount}`
                : 'Cinematic High-Resolution Frame'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">ESC</kbd> to exit
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-[#E50914] text-white transition-colors cursor-pointer shadow-lg"
            title="Close viewer (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage (Contain: No cropping!) */}
      <div 
        className="relative flex-1 w-full max-w-7xl px-4 sm:px-8 py-2 flex items-center justify-center overflow-hidden"
        onClick={(e) => {
          // If user clicked the dark backdrop around the image, close
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <img
          src={photo.previewUrl}
          alt={photo.caption || 'Expanded memory'}
          className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-[0_25px_80px_rgba(0,0,0,0.95)] border border-white/10 transition-transform duration-300"
          onClick={(e) => e.stopPropagation()} // Clicking actual image does NOT close
        />
      </div>

      {/* Bottom Info Bar */}
      <div 
        className="w-full max-w-4xl px-4 sm:px-8 py-4 mb-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left z-10 bg-gradient-to-t from-black/90 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white tracking-wide">
            {photo.caption || 'Archived Memory'}
          </h3>
          {(photo.location || photo.year) && (
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-mono text-neutral-400">
              {photo.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>{photo.location}</span>
                </span>
              )}
              {photo.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{photo.year}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-neutral-900/80 hover:bg-[#E50914] text-white text-xs font-mono transition-colors border border-white/10 cursor-pointer"
        >
          Return to Experience
        </button>
      </div>
    </div>
  );
};
