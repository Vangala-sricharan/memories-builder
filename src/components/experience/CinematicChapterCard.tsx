import React from 'react';
import { ExperienceTemplate } from '../../types';

interface CinematicChapterCardProps {
  number: string; // e.g. "01 / 06"
  act: string;    // e.g. "ACT I"
  title: string;  // e.g. "THE BEGINNING"
  template: ExperienceTemplate;
  tokens: {
    primary: string;
    secondary: string;
    muted: string;
    border: string;
  };
  headingFont: string;
}

export const CinematicChapterCard: React.FC<CinematicChapterCardProps> = ({
  number,
  act,
  title,
  template,
  tokens,
  headingFont,
}) => {
  return (
    <div className="relative py-12 sm:py-16 text-center overflow-hidden pointer-events-none select-none">
      {/* Subtle ambient beam */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-28 rounded-full blur-[70px] pointer-events-none opacity-40"
        style={{ backgroundColor: tokens.primary }}
      />

      <div className="relative z-10 max-w-xl mx-auto px-4 space-y-3">
        {/* Chapter counter & Act badge */}
        <div className="flex items-center justify-center gap-3 text-xs font-mono tracking-[0.3em] uppercase">
          <span style={{ color: tokens.primary }} className="font-bold">
            {number}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span style={{ color: tokens.muted }}>
            {act}
          </span>
        </div>

        {/* Big cinematic title */}
        <h3
          className={`text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight ${headingFont}`}
          style={{
            color: tokens.secondary,
            textShadow: template === 'cinema' ? `0 0 25px ${tokens.primary}60` : undefined,
          }}
        >
          {title}
        </h3>

        {/* Elegant divider line */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div
            className="w-12 h-px"
            style={{ backgroundColor: tokens.border }}
          />
          <div
            className="w-1.5 h-1.5 rotate-45"
            style={{ backgroundColor: tokens.primary }}
          />
          <div
            className="w-12 h-px"
            style={{ backgroundColor: tokens.border }}
          />
        </div>
      </div>
    </div>
  );
};
