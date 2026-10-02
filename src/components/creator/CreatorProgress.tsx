import React from 'react';
import { CreatorStep } from '../../types';
import { Check } from 'lucide-react';

interface CreatorProgressProps {
  currentStep: CreatorStep;
  onStepClick: (step: CreatorStep) => void;
  isStepCompleted: (step: CreatorStep) => boolean;
  canNavigateToStep: (step: CreatorStep) => boolean;
}

const STEPS: { id: CreatorStep; number: string; title: string; subtitle: string }[] = [
  { id: 'details', number: '01', title: 'DETAILS', subtitle: 'Recipient & Date' },
  { id: 'photos', number: '02', title: 'MEMORIES', subtitle: '3–20 Photos' },
  { id: 'curate', number: '03', title: 'CURATE', subtitle: 'Hero & Circle' },
  { id: 'music', number: '04', title: 'SOUNDTRACK', subtitle: 'Personal MP3' },
  { id: 'customize', number: '05', title: 'AI STORY', subtitle: 'Director & Tone' },
  { id: 'review', number: '06', title: 'FINAL REVIEW', subtitle: 'Check & Publish' },
];

export const CreatorProgress: React.FC<CreatorProgressProps> = ({
  currentStep,
  onStepClick,
  isStepCompleted,
  canNavigateToStep,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);
  const safeIndex = currentIndex >= 0 ? currentIndex : STEPS.length - 1;

  return (
    <div className="w-full bg-[#0D0D0D] border-b border-[#242424] px-4 sm:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Step Compact Header */}
        <div className="flex md:hidden items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#E50914] font-bold">
              STEP {STEPS[safeIndex].number} / 06
            </span>
            <span className="text-white text-xs font-semibold uppercase tracking-wider">
              {STEPS[safeIndex].title}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400">
            {STEPS[safeIndex].subtitle}
          </span>
        </div>

        {/* Desktop / Tablet Full Stepper */}
        <div className="hidden md:flex items-center justify-between gap-2 lg:gap-4">
          {STEPS.map((step, idx) => {
            const isCurrent = step.id === currentStep;
            const isCompleted = isStepCompleted(step.id);
            const isClickable = canNavigateToStep(step.id);

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`flex items-center gap-3 text-left transition-all duration-200 py-1 px-2 rounded-lg cursor-pointer ${
                    isClickable ? 'hover:bg-[#161616]' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  {/* Step Number or Check */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30 ring-2 ring-[#E50914]/50'
                        : isCompleted
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                        : 'bg-[#181818] text-neutral-500 border border-[#2A2A2A]'
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      step.number
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex flex-col">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isCurrent
                          ? 'text-white'
                          : isCompleted
                          ? 'text-neutral-300'
                          : 'text-neutral-500'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                      {step.subtitle}
                    </span>
                  </div>
                </button>

                {/* Connecting hairline */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px transition-colors duration-300 ${
                      idx < currentIndex ? 'bg-[#E50914]' : 'bg-[#242424]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
