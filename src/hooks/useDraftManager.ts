import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  BirthdayExperienceDraft, 
  CreatorStep, 
  DraftSaveStatus, 
  SavedDraftSummary,
  PublishStatus
} from '../types';
import { 
  saveDraft, 
  loadDraft, 
  getSavedDraftSummary, 
  discardDraft 
} from '../services/draftService';

interface UseDraftManagerOptions {
  draft: BirthdayExperienceDraft;
  currentStep: CreatorStep;
  publishStatus: PublishStatus;
  onRestoreDraft: (restoredDraft: BirthdayExperienceDraft, step: CreatorStep) => void;
  onExit: () => void;
}

export function useDraftManager({
  draft,
  currentStep,
  publishStatus,
  onRestoreDraft,
  onExit,
}: UseDraftManagerOptions) {
  const [saveStatus, setSaveStatus] = useState<DraftSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [existingDraftSummary, setExistingDraftSummary] = useState<SavedDraftSummary | null>(null);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState<boolean>(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState<boolean>(false);
  const [isSavingManual, setIsSavingManual] = useState<boolean>(false);

  // References to keep latest values in timers & event handlers
  const draftRef = useRef(draft);
  const stepRef = useRef(currentStep);
  const isDirtyRef = useRef(isDirty);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  draftRef.current = draft;
  stepRef.current = currentStep;
  isDirtyRef.current = isDirty;

  // 1. Initial check for existing draft to recover on mount
  useEffect(() => {
    let isCancelled = false;

    async function checkForExistingDraft() {
      try {
        const summary = await getSavedDraftSummary();
        if (isCancelled || !summary) return;

        // Check if there are meaningful memories or details saved
        if (summary.photoCount > 0 || (summary.recipientName && summary.recipientName.trim().length > 0)) {
          setExistingDraftSummary(summary);
          setIsRecoveryModalOpen(true);
        }
      } catch (err) {
        console.warn('Error checking existing draft:', err);
      }
    }

    checkForExistingDraft();
    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Perform safe autosave
  const performSave = useCallback(async (draftToSave: BirthdayExperienceDraft, stepToSave: CreatorStep) => {
    if (publishStatus === 'PUBLISHED') return;

    if (!navigator.onLine) {
      setSaveStatus('offline');
    } else {
      setSaveStatus('saving');
    }

    try {
      const result = await saveDraft(draftToSave, stepToSave);
      if (result.success) {
        setSaveStatus(navigator.onLine ? 'saved' : 'offline');
        setLastSavedAt(result.updatedAt);
        setIsDirty(false);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Failed to autosave draft:', err);
      setSaveStatus('error');
    }
  }, [publishStatus]);

  // 3. Debounced trigger whenever draft or step changes
  useEffect(() => {
    // Skip on first initial render so we don't immediately overwrite with blank template
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (publishStatus === 'PUBLISHED') return;

    setIsDirty(true);
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 1000ms debounce
    saveTimeoutRef.current = setTimeout(() => {
      performSave(draft, currentStep);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [draft, currentStep, performSave, publishStatus]);

  // 4. Periodic safety autosave (every 30 seconds while editing)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirtyRef.current && publishStatus !== 'PUBLISHED') {
        performSave(draftRef.current, stepRef.current);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [performSave, publishStatus]);

  // 5. Browser-level beforeunload protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current && publishStatus !== 'PUBLISHED') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [publishStatus]);

  // 6. Online / Offline network listeners
  useEffect(() => {
    const handleOnline = () => {
      if (isDirtyRef.current) {
        performSave(draftRef.current, stepRef.current);
      } else {
        setSaveStatus('saved');
      }
    };

    const handleOffline = () => {
      setSaveStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [performSave]);

  // 7. Manual save button trigger
  const handleManualSave = async () => {
    setIsSavingManual(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await performSave(draft, currentStep);
    setIsSavingManual(false);
  };

  // 8. Exit handling with unsaved confirmation
  const handleRequestExit = () => {
    if (isDirty && publishStatus !== 'PUBLISHED') {
      setIsExitModalOpen(true);
    } else {
      onExit();
    }
  };

  const handleSaveAndExit = async () => {
    setIsSavingManual(true);
    await performSave(draft, currentStep);
    setIsSavingManual(false);
    setIsExitModalOpen(false);
    onExit();
  };

  const handleExitWithoutSaving = () => {
    setIsExitModalOpen(false);
    onExit();
  };

  // 9. Draft recovery actions
  const handleContinueDraft = async () => {
    setIsLoadingDraft(true);
    try {
      const loaded = await loadDraft();
      if (loaded) {
        onRestoreDraft(loaded.draft, loaded.currentStep);
        setLastSavedAt(loaded.updatedAt);
        setSaveStatus('saved');
        setIsDirty(false);
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    } finally {
      setIsLoadingDraft(false);
      setIsRecoveryModalOpen(false);
    }
  };

  const handleDiscardDraft = async () => {
    setIsLoadingDraft(true);
    try {
      await discardDraft();
      setExistingDraftSummary(null);
    } catch (err) {
      console.warn('Failed to discard draft:', err);
    } finally {
      setIsLoadingDraft(false);
      setIsRecoveryModalOpen(false);
    }
  };

  return {
    saveStatus,
    lastSavedAt,
    isDirty,
    isSavingManual,
    handleManualSave,
    handleRequestExit,
    handleSaveAndExit,
    handleExitWithoutSaving,
    isExitModalOpen,
    setIsExitModalOpen,
    existingDraftSummary,
    isRecoveryModalOpen,
    handleContinueDraft,
    handleDiscardDraft,
    isLoadingDraft,
  };
}
