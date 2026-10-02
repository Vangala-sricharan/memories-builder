import React from 'react';
import { ParticleShape } from '../types';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';

interface FinalCTAProps {
  onSelectShape: (shape: ParticleShape) => void;
  onCreateClick: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onSelectShape, onCreateClick }) => {
  return (
    <section 
      onMouseEnter={() => onSelectShape('heart')}
      className="relative py-32 px-6 bg-[#080808] border-t border-[#292929] overflow-hidden text-center"
    >
      {/* Background ambient heart glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#E50914]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914] mb-2">
          <Heart className="w-3.5 h-3.5 fill-[#E50914]" />
          <span>The Definitive Digital Gift</span>
        </div>

        <h2 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight uppercase [text-wrap:balance]">
          MAKE THEIR BIRTHDAY <br />
          <span className="text-[#E50914]">UNFORGETTABLE.</span>
        </h2>

        <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto leading-relaxed [text-wrap:balance]">
          No cardboard cards discarded by morning. Give them a private 24-hour cinematic premiere they will remember for years to come.
        </p>

        <div className="pt-6">
          <button
            onClick={onCreateClick}
            className="px-10 py-5 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white bg-[#E50914] rounded-xl hover:bg-[#c90711] transition-all duration-300 shadow-2xl shadow-[#E50914]/30 hover:shadow-[#E50914]/50 hover:scale-105 cursor-pointer inline-flex items-center gap-3"
          >
            <span>CREATE YOUR EXPERIENCE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-4 text-xs text-neutral-400">
          Takes under 3 minutes · Completely free · Zero sign-up required
        </div>
      </div>
    </section>
  );
};
