import React, { useEffect } from 'react';
import { Heart, Sparkles, X } from 'lucide-react';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string;
}

export const EasterEggModal: React.FC<EasterEggModalProps> = ({
  isOpen,
  onClose,
  accentColor = '#E50914',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 7000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full p-8 rounded-3xl border shadow-2xl text-center space-y-4 bg-[#0E0E12] animate-scale-in"
        style={{
          borderColor: accentColor,
          boxShadow: `0 20px 60px ${accentColor}40`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Floating Heart & Sparkle Animation */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <Heart className="w-8 h-8 fill-current animate-pulse" style={{ color: accentColor }} />
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 block">
            SECRET DISCOVERY
          </span>
          <h3 className="font-serif italic text-2xl font-bold text-white">
            "Some memories are meant to stay."
          </h3>
          <p className="text-xs font-mono text-neutral-400 pt-1">
            Locked in time. Preserved in emotion.
          </p>
        </div>
      </div>
    </div>
  );
};
