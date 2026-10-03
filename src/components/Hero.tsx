import React, { useEffect, useState } from 'react';
import { ParticleShape } from '../types';
import { Play, Sparkles, Heart, Film, ArrowRight } from 'lucide-react';
import { ParticleMorphController } from './ParticleMorphController';

interface HeroProps {
  currentShape: ParticleShape;
  onSelectShape: (shape: ParticleShape) => void;
  onCreateClick: () => void;
  onExploreJourney: () => void;
  onPreviewLiveExperience: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentShape,
  onSelectShape,
  onCreateClick,
  onExploreJourney,
  onPreviewLiveExperience,
}) => {
  const [autoHeartTriggered, setAutoHeartTriggered] = useState(false);

  // Automatically trigger subtle Heart formation after initial greeting, then back to abstract field
  useEffect(() => {
    const timer1 = setTimeout(() => {
      onSelectShape('heart');
      setAutoHeartTriggered(true);
    }, 2800);

    const morphTimer = setTimeout(() => {
      // gently morph back to abstract field if still on heart
      onSelectShape('abstract');
    }, 8500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(morphTimer);
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center text-center px-6 pt-28 pb-16 overflow-hidden">
      {/* Subtle radial glow center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E50914]/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Small Eyebrow */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#292929] mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-ping" />
          <span className="text-[11px] md:text-xs font-semibold tracking-[0.2em] uppercase text-neutral-300">
            CINEMATIC BIRTHDAY & ANNIVERSARY WEBSITE BUILDER
          </span>
        </div>

        {/* Main Cinematic Headline */}
        <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6 max-w-3xl [text-wrap:balance]">
          THE CINEMATIC{' '}
          <span className="relative text-[#E50914] inline-block">
            BIRTHDAY WEBSITE BUILDER
            <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-transparent via-[#E50914] to-transparent opacity-60" />
          </span>{' '}
          FOR TIMELESS MOMENTS
        </h1>

        {/* Supporting text */}
        <p className="text-base sm:text-lg md:text-xl text-[#D6D6D6] font-normal leading-relaxed max-w-2xl mb-10 [text-wrap:balance]">
          Create personalized birthday websites and anniversary websites with photos, stories, and music. Turn your birthday memories into an immersive, cinematic birthday experience that lives for 24 hours.
        </p>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-14">
          <button
            onClick={onCreateClick}
            className="w-full sm:w-auto px-8 py-4 text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-white bg-[#E50914] rounded-xl hover:bg-[#c90711] transition-all duration-300 shadow-xl shadow-[#E50914]/25 hover:shadow-[#E50914]/40 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <span>CREATE A BIRTHDAY EXPERIENCE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreJourney}
            className="w-full sm:w-auto px-8 py-4 text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-white bg-[#141414] border border-[#292929] rounded-xl hover:border-neutral-500 hover:bg-[#1A1A1A] transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <Film className="w-4 h-4 text-[#E50914]" />
            <span>EXPLORE THE JOURNEY</span>
          </button>
        </div>

        {/* Interactive Shape Morphing Demonstration Bar */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Live Cinematic Particle Engine & Morph System</span>
          </div>

          <ParticleMorphController
            currentShape={currentShape}
            onSelectShape={onSelectShape}
            compact={false}
          />

          <p className="text-xs text-neutral-400 mt-1">
            Click any formation above to watch particles physically reorganize in 3D space
          </p>
        </div>
      </div>
    </section>
  );
};
