import React from 'react';
import { Clock, ShieldAlert, Sparkles, ArrowRight, Heart } from 'lucide-react';

interface ExpiredExperienceViewProps {
  onReturnHome?: () => void;
  onCreateNew?: () => void;
}

export const ExpiredExperienceView: React.FC<ExpiredExperienceViewProps> = ({
  onReturnHome,
  onCreateNew,
}) => {
  return (
    <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E50914]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Ephemeral Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#160A0A] border border-[#3E1414] text-[#FF4D4D] text-xs font-mono uppercase tracking-[0.25em]">
          <Clock className="w-3.5 h-3.5" />
          <span>24-HOUR LIFECYCLE CONCLUDED</span>
        </div>

        {/* Wordmark */}
        <div className="font-cinzel text-xl font-bold tracking-[0.3em] text-neutral-500 uppercase">
          BIRTHDAY PREMIERE
        </div>

        {/* Headline */}
        <h1 className="font-cinzel text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-[1.08] [text-wrap:balance]">
          THIS EXPERIENCE HAS EXPIRED.
        </h1>

        <div className="w-16 h-px bg-neutral-800 mx-auto" />

        {/* Description strictly omitting any personal photos or text */}
        <p className="text-sm sm:text-base text-neutral-400 font-serif italic max-w-md mx-auto leading-relaxed">
          “Every great moment has its season. This private 24-hour birthday premiere has reached its conclusion and left behind no digital footprint.”
        </p>

        <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest pt-2">
          ALL MEDIA & PERSONAL MEMORIES HAVE BEEN SAFELY SEALED
        </p>

        {/* Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          {onCreateNew && (
            <button
              type="button"
              onClick={onCreateNew}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#E50914] hover:bg-[#c90711] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#E50914]/25 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Create A Birthday Experience</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {onReturnHome && (
            <button
              type="button"
              onClick={onReturnHome}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#141414] border border-[#2B2B2B] hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Return Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
