import React from 'react';
import { Film, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-[#1C1C1C] py-14 px-6 text-xs text-neutral-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand & Mission */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="font-cinzel text-xl font-bold tracking-[0.25em] text-white">
            MEMORIES BUILDER
          </div>
          <p className="text-neutral-400 max-w-sm text-center md:text-left text-xs leading-relaxed">
            The cinematic birthday website builder & anniversary website builder. Turning cherished photos into personalized birthday memory websites and digital birthday gifts.
          </p>
        </div>

        {/* Quiet Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-300">
          <a href="#creator-teaser" className="hover:text-white transition-colors">
            Studio
          </a>
          <a href="#journey" className="hover:text-white transition-colors">
            The Journey
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#ephemeral-24h" className="hover:text-white transition-colors">
            24-Hour Ephemerality
          </a>
        </div>

        {/* Rights & Disclaimer */}
        <div className="flex flex-col items-center md:items-end gap-1 text-[11px] text-neutral-400 font-mono">
          <div>STAGE 1 · CINEMATIC PROTOTYPE</div>
          <div className="flex items-center gap-1">
            <span>Crafted for human connection</span>
            <Heart className="w-3 h-3 text-[#E50914] fill-[#E50914]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
