import React, { useState } from 'react';
import { Heart, Sparkles, Smile, Check } from 'lucide-react';
import { ExperienceTemplate } from '../../types';

interface EmotionalReactionViewProps {
  template: ExperienceTemplate;
  tokens: {
    primary: string;
    secondary: string;
    surface: string;
    border: string;
    muted: string;
  };
  headingFont: string;
}

type ReactionType = 'loved' | 'beautiful' | 'emotional';

export const EmotionalReactionView: React.FC<EmotionalReactionViewProps> = ({
  template,
  tokens,
  headingFont,
}) => {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);

  const reactions: { id: ReactionType; emoji: string; label: string; reply: string }[] = [
    { id: 'loved', emoji: '❤️', label: 'Loved it', reply: 'That means a lot. A lifetime memory preserved forever.' },
    { id: 'beautiful', emoji: '✨', label: 'Beautiful', reply: 'Crafted with absolute love and care.' },
    { id: 'emotional', emoji: '🥹', label: 'Emotional', reply: 'Some moments are truly meant to be held close.' },
  ];

  const activeReactionObj = reactions.find((r) => r.id === selectedReaction);

  return (
    <div className="relative py-8 px-4 text-center select-none">
      <div className="max-w-md mx-auto space-y-3.5">
        <span
          className="text-xs font-mono uppercase tracking-[0.25em] font-semibold block"
          style={{ color: tokens.muted }}
        >
          HOW DID THAT FEEL?
        </span>

        {!selectedReaction ? (
          <div className="flex items-center justify-center gap-3">
            {reactions.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedReaction(r.id)}
                className="px-4 py-2.5 rounded-full border text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 shadow-lg"
                style={{
                  backgroundColor: tokens.surface,
                  borderColor: tokens.border,
                  color: tokens.secondary,
                }}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="animate-fade-in p-4 rounded-2xl border space-y-1.5" style={{ backgroundColor: tokens.surface, borderColor: tokens.primary }}>
            <div className="text-xl">{activeReactionObj?.emoji}</div>
            <p className="text-xs sm:text-sm italic" style={{ color: tokens.secondary }}>
              "{activeReactionObj?.reply}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
