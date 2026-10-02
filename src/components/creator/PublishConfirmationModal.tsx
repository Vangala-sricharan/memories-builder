import React from 'react';
import { BirthdayExperienceDraft } from '../../types';
import { 
  AlertTriangle, 
  Clock, 
  Lock, 
  Sparkles, 
  X, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw
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

export const PublishConfirmationModal: React.FC<PublishConfirmationModalProps> = ({
  isOpen,
  draft,
  isPublishing,
  publishError,
  onConfirm,
  onCancel,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0F0F0F] border border-[#2D2D2D] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Subtle red ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E50914]/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Close button (only active when not actively publishing) */}
        {!isPublishing && (
          <button
            onClick={onCancel}
            aria-label="Close"
            className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-[#1E1E1E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

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
              <span className="text-neutral-500">Hero Frame:</span>{' '}
              <span className="text-white">Selected</span>
            </div>
            <div>
              <span className="text-neutral-500">Soundtrack:</span>{' '}
              <span className="text-white">{draft.music ? 'Attached' : 'None'}</span>
            </div>
            <div>
              <span className="text-neutral-500">Surprise:</span>{' '}
              <span className="text-white">{draft.surprisePhoto ? '1 Secret' : 'Skipped'}</span>
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
              disabled={isPublishing}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#2E2E2E] text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-[#1A1A1A] transition-colors disabled:opacity-40 cursor-pointer"
            >
              Go Back
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isPublishing}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#c90711] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#E50914]/30 hover:shadow-[#E50914]/50 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing your experience...</span>
                </>
              ) : (
                <>
                  <span>Publish Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
