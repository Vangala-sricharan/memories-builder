import React, { useState } from 'react';
import { Mail, Sparkles, X, Heart, Lock } from 'lucide-react';
import { ExperienceTemplate } from '../../types';

interface HiddenMessageTriggerProps {
  messageText: string;
  senderName?: string;
  template: ExperienceTemplate;
  tokens: {
    primary: string;
    secondary: string;
    surface: string;
    border: string;
    muted: string;
    glowStrong: string;
    body: string;
  };
  headingFont: string;
  bodyFont: string;
}

export const HiddenMessageTrigger: React.FC<HiddenMessageTriggerProps> = ({
  messageText,
  senderName,
  template,
  tokens,
  headingFont,
  bodyFont,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative py-8 px-4 text-center">
      <div className="max-w-xl mx-auto">
        {!isOpen ? (
          /* Subtle Interactive Trigger Button */
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full border shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: tokens.surface,
              borderColor: tokens.primary,
            }}
          >
            {/* Ambient pulse */}
            <span
              className="absolute inset-0 rounded-full blur-[14px] opacity-40 group-hover:opacity-75 transition-opacity"
              style={{ backgroundColor: tokens.primary }}
            />

            <span className="relative z-10 flex items-center gap-2.5">
              <Mail className="w-4 h-4" style={{ color: tokens.primary }} />
              <span
                className="text-xs sm:text-sm font-mono tracking-[0.2em] uppercase font-bold text-white"
              >
                THERE'S SOMETHING ELSE...
              </span>
              <Sparkles className="w-3.5 h-3.5" style={{ color: tokens.primary }} />
            </span>
          </button>
        ) : (
          /* Revealed Personal Message Card */
          <div
            className="relative rounded-3xl p-6 sm:p-10 border shadow-2xl animate-fade-in text-center space-y-4"
            style={{
              backgroundColor: tokens.surface,
              borderColor: tokens.primary,
              boxShadow: `0 20px 60px ${tokens.glowStrong}40`,
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Close hidden message"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em]" style={{ color: tokens.primary }}>
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>PRIVATE NOTE</span>
            </div>

            <p
              className={`text-base sm:text-xl md:text-2xl leading-relaxed italic ${bodyFont}`}
              style={{ color: tokens.secondary }}
            >
              "{messageText}"
            </p>

            {senderName && (
              <div className="pt-2 text-xs font-mono tracking-widest uppercase" style={{ color: tokens.muted }}>
                FROM · <span style={{ color: tokens.primary }}>{senderName}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
