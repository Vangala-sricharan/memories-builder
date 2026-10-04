import React from 'react';
import { RotateCcw, ArrowUp } from 'lucide-react';
import { ExperienceTemplate } from '../../types';

interface ReplayButtonProps {
  template: ExperienceTemplate;
  tokens: {
    primary: string;
    secondary: string;
    glowStrong: string;
  };
  onReplay: () => void;
}

export const ReplayButton: React.FC<ReplayButtonProps> = ({
  template,
  tokens,
  onReplay,
}) => {
  return (
    <div className="py-6 text-center">
      <button
        type="button"
        onClick={onReplay}
        className="group px-8 py-4 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-[0.25em] uppercase transition-all shadow-2xl hover:scale-105 cursor-pointer inline-flex items-center gap-2.5"
        style={{
          backgroundColor: tokens.primary,
          color: '#FFFFFF',
          boxShadow: `0 10px 30px ${tokens.glowStrong}`,
        }}
      >
        <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-500" />
        <span>REPLAY EXPERIENCE</span>
      </button>
    </div>
  );
};
