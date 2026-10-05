import React, { useState, useEffect } from 'react';
import { DraftSaveStatus } from '../../types';
import { formatTimeAgo } from '../../services/draftService';
import { Check, CloudOff, AlertCircle, RefreshCw, Save } from 'lucide-react';

interface DraftStatusIndicatorProps {
  status: DraftSaveStatus;
  lastSavedAt: string | null;
  onManualSave: () => void;
  isSavingManual?: boolean;
}

export const DraftStatusIndicator: React.FC<DraftStatusIndicatorProps> = ({
  status,
  lastSavedAt,
  onManualSave,
  isSavingManual = false,
}) => {
  const [relativeTime, setRelativeTime] = useState<string>('just now');

  // Update relative time display every 10 seconds
  useEffect(() => {
    if (!lastSavedAt) return;

    const updateLabel = () => {
      setRelativeTime(formatTimeAgo(lastSavedAt));
    };

    updateLabel();
    const interval = setInterval(updateLabel, 10000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  return (
    <div className="flex items-center gap-2 text-xs font-mono select-none">
      {/* Visual Status Pill */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141418] border border-[#26262E] text-neutral-300">
        {status === 'saving' || isSavingManual ? (
          <>
            <RefreshCw className="w-3 h-3 text-[#E50914] animate-spin" />
            <span className="text-white text-[11px]">Saving...</span>
          </>
        ) : status === 'offline' ? (
          <>
            <CloudOff className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300 text-[11px] hidden sm:inline">Offline — saved locally</span>
            <span className="text-amber-300 text-[11px] sm:hidden">Offline ✓</span>
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle className="w-3 h-3 text-[#E50914]" />
            <span className="text-red-400 text-[11px] hidden sm:inline">Save failed — retrying...</span>
            <span className="text-red-400 text-[11px] sm:hidden">Retrying...</span>
          </>
        ) : lastSavedAt ? (
          <>
            <Check className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
            <span className="text-emerald-400 text-[11px] font-medium hidden sm:inline">
              Saved {relativeTime}
            </span>
            <span className="text-emerald-400 text-[11px] sm:hidden">
              Saved ✓
            </span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
            <span className="text-neutral-500 text-[11px]">Autosave ready</span>
          </>
        )}
      </div>

      {/* Manual Save Backup Button */}
      <button
        type="button"
        onClick={onManualSave}
        disabled={status === 'saving' || isSavingManual}
        className="px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1E1E26] border border-[#26262E] hover:border-neutral-500 text-neutral-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
        title="Manual backup save"
      >
        <Save className="w-3 h-3 text-neutral-400" />
        <span className="text-[10px] hidden md:inline">Save Draft</span>
      </button>
    </div>
  );
};
