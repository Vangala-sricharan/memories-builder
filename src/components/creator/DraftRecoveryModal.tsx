import React from 'react';
import { SavedDraftSummary } from '../../types';
import { formatTimeAgo } from '../../services/draftService';
import { Sparkles, ArrowRight, Trash2, Clock, Image, Layers, User } from 'lucide-react';
import { TEMPLATES } from '../../utils/themeTokens';

interface DraftRecoveryModalProps {
  isOpen: boolean;
  summary: SavedDraftSummary | null;
  onContinueDraft: () => void;
  onDiscardDraft: () => void;
  isLoading?: boolean;
}

export const DraftRecoveryModal: React.FC<DraftRecoveryModalProps> = ({
  isOpen,
  summary,
  onContinueDraft,
  onDiscardDraft,
  isLoading = false,
}) => {
  if (!isOpen || !summary) return null;

  const templateName = TEMPLATES[summary.template || 'cinema']?.name || 'Cinematic Premiere';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-md bg-[#0D0D10] border border-[#2B2B33] rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-center space-y-6"
        style={{
          boxShadow: '0 0 50px rgba(229, 9, 20, 0.18), 0 25px 80px rgba(0,0,0,0.95)',
        }}
      >
        {/* Top Wave Icon Accent */}
        <div className="w-14 h-14 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 mx-auto flex items-center justify-center text-[#E50914] shadow-lg">
          <span className="text-2xl animate-bounce">👋</span>
        </div>

        {/* Header Text */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E50914] font-semibold block">
            UNFINISHED PREMIERE FOUND
          </span>
          <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-wide">
            WELCOME BACK
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xs mx-auto">
            We found an automatically saved draft from your previous session.
          </p>
        </div>

        {/* Draft Metadata Card */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-[#23232B] text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#202028]">
            <span className="text-neutral-400 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Last saved:</span>
            </span>
            <span className="text-white font-mono font-medium">
              {formatTimeAgo(summary.updatedAt)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-[#0C0C0F] border border-[#1E1E26]">
              <span className="text-[10px] text-neutral-500 font-mono uppercase block mb-0.5">Recipient</span>
              <span className="text-white font-medium truncate block">
                {summary.recipientName || 'Untitled'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#0C0C0F] border border-[#1E1E26]">
              <span className="text-[10px] text-neutral-500 font-mono uppercase block mb-0.5">Template</span>
              <span className="text-[#E50914] font-medium truncate block font-cinzel">
                {templateName}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1 pt-1">
            <span className="flex items-center gap-1">
              <Image className="w-3 h-3 text-neutral-500" />
              <span>{summary.photoCount} Memories Preserved</span>
            </span>
            <span className="uppercase text-[#E50914]/80">
              Step: {summary.currentStep}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          {/* Continue Draft */}
          <button
            type="button"
            onClick={onContinueDraft}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#B80000] to-[#E50914] text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(229,9,20,0.5)] hover:shadow-[0_0_30px_rgba(229,9,20,0.8)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>CONTINUE DRAFT</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Discard Draft */}
          <button
            type="button"
            onClick={onDiscardDraft}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#18181D] hover:bg-red-950/40 border border-[#2A2A33] hover:border-red-600/40 text-neutral-400 hover:text-red-400 text-xs font-mono tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>DISCARD DRAFT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
