import React, { useState } from 'react';
import { Lock, Unlock, Sparkles } from 'lucide-react';
import { ExperienceTemplate } from '../../types';

interface SurpriseLockViewProps {
  template: ExperienceTemplate;
  tokens: {
    primary: string;
    secondary: string;
    surface: string;
    border: string;
    muted: string;
    glowStrong: string;
  };
  headingFont: string;
  bodyFont: string;
  onUnlocked?: () => void;
}

export const SurpriseLockView: React.FC<SurpriseLockViewProps> = ({
  template,
  tokens,
  headingFont,
  bodyFont,
  onUnlocked,
}) => {
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = () => {
    setUnlocked(true);
    if (onUnlocked) onUnlocked();
  };

  return (
    <div className="relative py-12 px-4 text-center select-none">
      <div className="max-w-lg mx-auto">
        <div
          className="relative rounded-3xl p-6 sm:p-8 border overflow-hidden shadow-2xl transition-all duration-700"
          style={{
            backgroundColor: tokens.surface,
            borderColor: unlocked ? tokens.primary : tokens.border,
          }}
        >
          {/* Ambient light ring */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[60px] pointer-events-none transition-all duration-700 ${
              unlocked ? 'opacity-80 scale-125' : 'opacity-30 scale-100'
            }`}
            style={{ backgroundColor: tokens.primary }}
          />

          <div className="relative z-10 space-y-4">
            <span
              className="text-xs font-mono uppercase tracking-[0.25em] block font-bold"
              style={{ color: tokens.primary }}
            >
              ONE LAST THING...
            </span>

            <div className="flex items-center justify-center gap-3">
              {unlocked ? (
                <div
                  className="w-12 h-12 rounded-full border flex items-center justify-center animate-bounce"
                  style={{
                    backgroundColor: `${tokens.primary}25`,
                    borderColor: tokens.primary,
                    color: tokens.primary,
                  }}
                >
                  <Unlock className="w-6 h-6" />
                </div>
              ) : (
                <div
                  className="w-12 h-12 rounded-full border flex items-center justify-center animate-pulse"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: tokens.secondary,
                  }}
                >
                  <Lock className="w-6 h-6" />
                </div>
              )}
            </div>

            <h4
              className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${headingFont}`}
              style={{ color: tokens.secondary }}
            >
              {unlocked ? 'SURPRISE READY' : '🔒 LOCKED · KEEP GOING'}
            </h4>

            <p
              className={`text-xs sm:text-sm max-w-xs mx-auto leading-relaxed ${bodyFont}`}
              style={{ color: tokens.muted }}
            >
              {unlocked
                ? 'The final surprise has unsealed. Scroll down to experience the premiere.'
                : 'A confidential birthday revelation awaits just ahead.'}
            </p>

            {!unlocked && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleUnlock}
                  className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest uppercase transition-all hover:scale-105 cursor-pointer inline-flex items-center gap-2 border"
                  style={{
                    backgroundColor: `${tokens.primary}20`,
                    borderColor: tokens.primary,
                    color: tokens.primary,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>UNSEAL FINALE</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
