import React, { useState, useEffect } from 'react';
import { BirthdayExperienceDraft } from '../../types';
import { 
  AlertTriangle, 
  Clock, 
  Lock, 
  Sparkles, 
  X, 
  ArrowRight,
  RefreshCw,
  Film,
  Layers,
  Heart,
  CheckCircle2
} from 'lucide-react';

interface PublishConfirmationModalProps {
  isOpen: boolean;
  draft: BirthdayExperienceDraft;
  isPublishing: boolean;
  publishError: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

const PUBLISH_STAGES = [
  { id: 'creating', label: 'CREATING YOUR EXPERIENCE', desc: 'Initializing secure 24-hour vault & immutable snapshot' },
  { id: 'story', label: 'CRAFTING THE STORY', desc: 'Formatting narrative milestones, typography & chapter pacing' },
  { id: 'memories', label: 'ARRANGING YOUR MEMORIES', desc: 'Framing photograph presentation & 3D archival vault' },
  { id: 'finalizing', label: 'FINALIZING', desc: 'Sealing cryptographic snapshot & preparing private premiere link' },
  { id: 'ready', label: 'YOUR MEMORY IS READY', desc: 'The 24-hour celebration window is live' },
];

export const PublishConfirmationModal: React.FC<PublishConfirmationModalProps> = ({
  isOpen,
  draft,
  isPublishing,
  publishError,
  onConfirm,
  onCancel,
  onRetry,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Smooth stage progression while publishing
  useEffect(() => {
    if (!isPublishing) {
      setCurrentStageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < PUBLISH_STAGES.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isPublishing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-[#0A0A0A] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Deep red atmospheric glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#E50914]/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Close button (only active when not actively publishing) */}
        {!isPublishing && (
          <button
            onClick={onCancel}
            aria-label="Close"
            className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-[#1E1E1E] transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {isPublishing ? (
          /* ======================================================== */
          /* CINEMATIC PUBLISHING SEQUENCE                           */
          /* ======================================================== */
          <div className="relative z-10 py-8 px-2 text-center space-y-8 animate-fade-in">
            {/* Top Chapter Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#180C0E] border border-[#E50914]/40 text-[#E50914] text-xs font-mono uppercase tracking-[0.25em]">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
              <span>STAGE {currentStageIndex + 1} OF {PUBLISH_STAGES.length}</span>
            </div>

            {/* Stage Title with slow fade and scale */}
            <div className="space-y-2 min-h-[90px] flex flex-col justify-center">
              <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-white uppercase tracking-tight transition-all duration-500 transform scale-100">
                {PUBLISH_STAGES[currentStageIndex].label}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-xs mx-auto transition-opacity duration-500">
                {PUBLISH_STAGES[currentStageIndex].desc}
              </p>
            </div>

            {/* Stepped Progress Track */}
            <div className="space-y-2 max-w-xs mx-auto">
              <div className="flex items-center justify-between gap-1.5">
                {PUBLISH_STAGES.map((stg, i) => (
                  <div
                    key={stg.id}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      i <= currentStageIndex ? 'bg-[#E50914] shadow-[0_0_8px_#E50914]' : 'bg-[#222222]'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>PREPARING</span>
                <span>LOCKING 24H PREMIERE</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-neutral-500 tracking-wider">
              DO NOT CLOSE · PRESERVING IMMUTABLE SNAPSHOT
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* PUBLISH CONFIRMATION DIALOG                              */
          /* ======================================================== */
          <div className="relative z-10 space-y-6">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F1212] border border-[#E50914]/40 text-[#E50914] text-xs font-mono uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>IMMUTABLE 24-HOUR LIFECYCLE</span>
            </div>

            <div>
              <h3 className="font-cinzel text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Ready to Publish?
              </h3>
              <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                This cinematic birthday premiere for <span className="text-white font-semibold">{draft.recipientName}</span> will become viewable through a unique private link for exactly <span className="text-[#E50914] font-semibold">24 hours</span>.
              </p>
            </div>

            {/* Key Immutability Rules Card */}
            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-start gap-3 text-neutral-300">
                <Clock className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                <span>
                  <strong>24-Hour Expiration:</strong> The countdown starts the moment you confirm publish. After 24 hours, the link expires completely.
                </span>
              </div>

              <div className="flex items-start gap-3 text-neutral-300">
                <Lock className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                <span>
                  <strong>Permanent Lock:</strong> Once published, this experience is frozen as an immutable snapshot. Photos, soundtrack, and messages cannot be altered.
                </span>
              </div>
            </div>

            {/* Snapshot Summary Checklist */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-[#111111] rounded-xl border border-[#222222] text-[11px] font-mono text-neutral-400">
              <div>
                <span className="text-neutral-500">Memories:</span>{' '}
                <span className="text-white">{draft.photos.length} Photos</span>
              </div>
              <div>
                <span className="text-neutral-500">Template:</span>{' '}
                <span className="text-white uppercase">{draft.template}</span>
              </div>
              <div>
                <span className="text-neutral-500">Presentation:</span>{' '}
                <span className="text-white uppercase">{draft.customization?.photoStyle || 'cinematic'}</span>
              </div>
              <div>
                <span className="text-neutral-500">Surprise:</span>{' '}
                <span className="text-white">{draft.surprisePhoto ? '1 Secret' : 'None'}</span>
              </div>
            </div>

            {/* Error Notice */}
            {publishError && (
              <div className="p-4 rounded-xl bg-red-950/70 border border-red-600/50 text-red-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{publishError}</span>
                </div>
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-2.5 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-[11px] font-mono uppercase tracking-wider shrink-0 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#2E2E2E] text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#c90711] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#E50914]/30 hover:shadow-[#E50914]/50 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span>Publish for 24 Hours</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
