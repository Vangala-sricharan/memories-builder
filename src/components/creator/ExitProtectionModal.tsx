import React from 'react';
import { ShieldAlert, Save, ArrowRight, X } from 'lucide-react';

interface ExitProtectionModalProps {
  isOpen: boolean;
  onSaveAndExit: () => void;
  onExitWithoutSaving: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const ExitProtectionModal: React.FC<ExitProtectionModalProps> = ({
  isOpen,
  onSaveAndExit,
  onExitWithoutSaving,
  onCancel,
  isSaving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-md bg-[#0D0D10] border border-[#2B2B33] rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-center space-y-6"
        style={{
          boxShadow: '0 0 45px rgba(229, 9, 20, 0.15), 0 25px 80px rgba(0,0,0,0.95)',
        }}
      >
        {/* Subtle Icon Accent */}
        <div className="w-14 h-14 rounded-2xl bg-[#E50914]/10 border border-[#E50914]/30 mx-auto flex items-center justify-center text-[#E50914] shadow-lg">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#E50914] font-semibold block">
            UNSAVED PROGRESS DETECTED
          </span>
          <h3 className="font-cinzel text-2xl font-bold text-white tracking-wide">
            SAVE YOUR PROGRESS?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xs mx-auto">
            Your experience has unsaved changes. Choose how you would like to proceed before leaving the builder.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Save Draft & Exit */}
          <button
            type="button"
            onClick={onSaveAndExit}
            disabled={isSaving}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#B80000] to-[#E50914] text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:shadow-[0_0_30px_rgba(229,9,20,0.7)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Draft...' : 'SAVE DRAFT & EXIT'}</span>
          </button>

          {/* Exit Without Saving */}
          <button
            type="button"
            onClick={onExitWithoutSaving}
            disabled={isSaving}
            className="w-full py-3 px-4 rounded-xl bg-[#18181D] hover:bg-neutral-800 border border-[#2A2A33] text-neutral-300 hover:text-white text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer"
          >
            EXIT WITHOUT SAVING
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full py-2.5 px-4 text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
          >
            CANCEL (CONTINUE EDITING)
          </button>
        </div>
      </div>
    </div>
  );
};
