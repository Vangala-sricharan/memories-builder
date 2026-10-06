import React, { useState } from 'react';
import { Play, Pause, Volume2, Sparkles, Film, Heart, Maximize2 } from 'lucide-react';
import { sampleBirthdayData } from '../data/sampleBirthdayData';

interface ExperiencePreviewProps {
  onOpenExperienceModal: () => void;
}

export const ExperiencePreview: React.FC<ExperiencePreviewProps> = ({ onOpenExperienceModal }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const data = sampleBirthdayData;
  const currentPhoto = data.memories[activePhotoIndex];

  return (
    <section className="relative py-28 px-6 bg-[#060606] border-t border-[#292929] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#E50914]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914] mb-3">
            <Film className="w-3.5 h-3.5" />
            <span>The Recipient Experience</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 [text-wrap:balance]">
            WHAT THEY RECEIVE
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
            When they tap their private link, their browser enters an intimate full-screen theater.
            Music begins to play, particles gently swirl, and their story unfolds scene by scene.
          </p>
        </div>

        {/* Cinematic Recipient Film Theatre Mockup */}
        <div className="relative bg-[#0A0A0A] border border-[#242424] rounded-2xl overflow-hidden shadow-2xl">
          {/* Top Cinema Letterbox Bar */}
          <div className="bg-[#050505] px-6 py-3 border-b border-[#1A1A1A] flex items-center justify-between text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
              <span className="text-white font-medium">LIVE PREMIERE</span>
              <span>·</span>
              <span>https://birthday.film/p/alex-28-premiere</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-neutral-400">
              <span>AUDIO SYNC ACTIVE</span>
              <span>·</span>
              <span className="text-[#E50914]">EXPIRING IN 23H 59M</span>
            </div>
          </div>

          {/* Main Theatre Scene */}
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-between min-h-[460px] relative">
            {/* Ambient subtle vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800/15 via-[#080808]/90 to-[#050505] pointer-events-none" />

            {/* Top metadata */}
            <div className="relative z-10 flex items-center justify-between text-xs tracking-widest uppercase font-mono text-neutral-400">
              <span className="text-[#E50914]">OCTOBER 12 · 28 YEARS OF RADIANCE</span>
              <span>DIRECTED WITH LOVE</span>
            </div>

            {/* Centerpiece Cinematic Headline */}
            <div className="relative z-10 text-center my-12 space-y-4 max-w-2xl mx-auto">
              <span className="text-[11px] uppercase tracking-[0.4em] text-neutral-400 font-mono">
                A SPECIAL GIFT FOR
              </span>
              <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-white leading-none [text-wrap:balance]">
                HAPPY BIRTHDAY, <br />
                <span className="text-[#E50914]">ALEX</span>
              </h1>
              <p className="text-sm sm:text-base text-neutral-300 font-serif italic max-w-lg mx-auto leading-relaxed pt-2">
                "Some people don't just walk into our lives; they illuminate every path they cross. Here is our salute to your light."
              </p>
            </div>

            {/* Photo Strip Carousel with Interactive Selection */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>SCENE ARCHIVE ({activePhotoIndex + 1} OF {data.memories.length})</span>
                <span className="text-neutral-300">{currentPhoto.caption}</span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {data.memories.map((photo, idx) => (
                  <button
                    key={photo.id}
                    type="button"
                    data-cursor="photo"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`aspect-video rounded-lg border p-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      activePhotoIndex === idx
                        ? 'border-[#E50914] bg-[#1A1A1A] ring-1 ring-[#E50914]'
                        : 'border-[#242424] bg-[#111111] opacity-60 hover:opacity-100 hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                      <span>0{idx + 1}</span>
                      <span className="text-[#E50914]">{photo.year}</span>
                    </div>
                    <div className="text-[11px] font-medium text-white truncate">
                      {photo.location}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Audio Controller Bar */}
            <div className="relative z-10 mt-8 pt-4 border-t border-[#202020] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-[#E50914] hover:bg-[#c90711] text-white flex items-center justify-center transition-colors shadow-lg shadow-[#E50914]/30 cursor-pointer"
                  aria-label={isPlaying ? 'Pause soundtrack simulation' : 'Play soundtrack simulation'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  )}
                </button>
                <div>
                  <div className="text-xs font-semibold text-white">
                    {data.soundtrack.fileName}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    {isPlaying ? 'Playing synced background score...' : 'Click to preview soundtrack'}
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenExperienceModal}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-white text-xs font-medium tracking-wider uppercase rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Launch Fullscreen Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
