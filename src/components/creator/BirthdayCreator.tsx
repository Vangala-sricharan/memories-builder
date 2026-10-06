import React, { useState } from 'react';
import { 
  BirthdayExperienceDraft, 
  CreatorStep, 
  UploadedPhoto, 
  UploadedMusic,
  PublishedExperienceSnapshot,
  PublishStatus,
  ExperienceTemplate,
  ExperienceTheme
} from '../../types';
import { TEMPLATES, DEFAULT_CUSTOMIZATION } from '../../utils/themeTokens';
import { CreatorProgress } from './CreatorProgress';
import { TemplateSelectorStep } from './TemplateSelectorStep';
import { BirthdayDetailsForm } from './BirthdayDetailsForm';
import { PhotoUploader } from './PhotoUploader';
import { StoryCurationStep } from './StoryCurationStep';
import { MusicUploader } from './MusicUploader';
import { CustomizationPanel } from './CustomizationPanel';
import { CustomizationStudio } from './CustomizationStudio';
import { FinalReviewScreen } from './FinalReviewScreen';
import { PublishConfirmationModal } from './PublishConfirmationModal';
import { PublishSuccessScreen } from './PublishSuccessScreen';
import { LiveExperiencePreview } from '../experience/LiveExperiencePreview';
import { publishExperience, assertNotPublished } from '../../services/publishService';
import { discardDraft } from '../../services/draftService';
import { useDraftManager } from '../../hooks/useDraftManager';
import { DraftStatusIndicator } from './DraftStatusIndicator';
import { ExitProtectionModal } from './ExitProtectionModal';
import { DraftRecoveryModal } from './DraftRecoveryModal';
import { X, Lock } from 'lucide-react';

interface BirthdayCreatorProps {
  onExit: () => void;
  onOpenPublishedExperience?: (experienceId: string) => void;
}

export const BirthdayCreator: React.FC<BirthdayCreatorProps> = ({ 
  onExit,
  onOpenPublishedExperience,
}) => {
  const [currentStep, setCurrentStep] = useState<CreatorStep>('template');
  const [previousStep, setPreviousStep] = useState<CreatorStep>('template');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('DRAFT');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedSnapshot, setPublishedSnapshot] = useState<PublishedExperienceSnapshot | null>(null);

  // In-memory draft state with default CINEMA template and default theme
  const [draft, setDraft] = useState<BirthdayExperienceDraft>({
    template: 'cinema',
    theme: { ...TEMPLATES.cinema.defaultTheme },
    customization: { ...DEFAULT_CUSTOMIZATION.cinema },
    recipientName: '',
    relationship: 'Best Friend',
    birthday: '',
    milestoneAge: 28,
    senderName: '',
    birthdayMessage: '',
    photos: [],
    heroPhotoId: undefined,
    innerCirclePhotoIds: [],
    secretPhotos: [],
    surprisePhoto: null,
    finalMessage: 'May the year ahead bring the same unyielding joy and wonder that you bring into the lives of everyone lucky enough to know you.',
    music: null,
    tagline: 'A Cinematic Birthday Story',
    openingQuote: '“Some people make the world brighter simply by being in it. Here is a film of your light.”',
    particleIntensity: 'normal',
  });

  // Draft management, autosave, exit protection, and recovery
  const {
    saveStatus,
    lastSavedAt,
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
  } = useDraftManager({
    draft,
    currentStep,
    publishStatus,
    onRestoreDraft: (restoredDraft, restoredStep) => {
      setDraft(restoredDraft);
      setCurrentStep(restoredStep);
    },
    onExit,
  });

  // Immutability-guarded update function
  const updateDraft = (fields: Partial<BirthdayExperienceDraft>) => {
    try {
      assertNotPublished(publishStatus);
      setDraft((prev) => ({ ...prev, ...fields }));
    } catch (err: any) {
      console.warn('Update blocked by immutability guard:', err.message);
    }
  };

  const handleToggleInnerCirclePhoto = (id: string) => {
    try {
      assertNotPublished(publishStatus);
      setDraft((prev) => {
        const exists = prev.innerCirclePhotoIds.includes(id);
        const updated = exists
          ? prev.innerCirclePhotoIds.filter((item) => item !== id)
          : [...prev.innerCirclePhotoIds, id];
        return { ...prev, innerCirclePhotoIds: updated };
      });
    } catch (err: any) {
      console.warn('Inner circle change blocked by immutability guard:', err.message);
    }
  };

  // Step completion checks
  const isStepCompleted = (step: CreatorStep): boolean => {
    switch (step) {
      case 'template':
        return !!draft.template;
      case 'details':
        return !!draft.recipientName.trim();
      case 'photos':
        return draft.photos.length >= 6 && draft.photos.length <= 25;
      case 'curate':
        return draft.photos.length >= 6;
      case 'music':
        return true; // Music is optional for testing & quiet mode
      case 'customize':
        return isStepCompleted('details') && isStepCompleted('photos');
      case 'theme':
        return isStepCompleted('details') && isStepCompleted('photos');
      case 'review':
        return isStepCompleted('details') && isStepCompleted('photos');
      case 'preview':
        return false;
      case 'published':
        return !!publishedSnapshot;
      default:
        return false;
    }
  };

  // Guard navigation to future steps until predecessors are satisfied
  const canNavigateToStep = (step: CreatorStep): boolean => {
    if (publishStatus === 'PUBLISHED') {
      return step === 'published';
    }
    switch (step) {
      case 'template':
        return true;
      case 'details':
        return true;
      case 'photos':
        return isStepCompleted('details');
      case 'curate':
        return isStepCompleted('details') && isStepCompleted('photos');
      case 'music':
        return isStepCompleted('details') && isStepCompleted('photos');
      case 'customize':
        return isStepCompleted('details') && isStepCompleted('photos');
      case 'theme':
        return isStepCompleted('details') && isStepCompleted('photos');
      case 'review':
        return isStepCompleted('details') && isStepCompleted('photos');
      case 'preview':
        return isStepCompleted('details') && isStepCompleted('photos');
      case 'published':
        return !!publishedSnapshot;
      default:
        return false;
    }
  };

  const handleOpenPreview = () => {
    setPreviousStep(currentStep);
    setCurrentStep('preview');
  };

  // Publish confirmation handler
  const handleConfirmPublish = async () => {
    if (isPublishing) return; // Prevent double publishing
    setIsPublishing(true);
    setPublishError(null);
    setPublishStatus('PUBLISHING');

    try {
      const snapshot = await publishExperience(draft);
      setPublishedSnapshot(snapshot);
      setPublishStatus('PUBLISHED');
      setIsPublishModalOpen(false);
      setCurrentStep('published');
      // Experience published successfully -> clear active draft from local storage
      discardDraft();
    } catch (err: any) {
      setPublishStatus('FAILED');
      setPublishError(err.message || 'Something went wrong while publishing.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Reset to brand new draft (guarantees published snapshot remains independent)
  const handleCreateAnother = () => {
    discardDraft();
    setDraft({
      template: 'cinema',
      theme: { ...TEMPLATES.cinema.defaultTheme },
      customization: { ...DEFAULT_CUSTOMIZATION.cinema },
      recipientName: '',
      relationship: 'Best Friend',
      birthday: '',
      milestoneAge: 28,
      senderName: '',
      birthdayMessage: '',
      photos: [],
      heroPhotoId: undefined,
      innerCirclePhotoIds: [],
      surprisePhoto: null,
      finalMessage: 'May the year ahead bring the same unyielding joy and wonder that you bring into the lives of everyone lucky enough to know you.',
      music: null,
      tagline: 'A Cinematic Birthday Story',
      openingQuote: '“Some people make the world brighter simply by being in it. Here is a film of your light.”',
      particleIntensity: 'normal',
    });
    setPublishedSnapshot(null);
    setPublishStatus('DRAFT');
    setCurrentStep('template');
  };

  // 1. Dedicated Full Preview Mode (Timer NOT started, no editor controls)
  if (currentStep === 'preview') {
    return (
      <LiveExperiencePreview
        draft={draft}
        onBackToEdit={() => setCurrentStep(previousStep || 'review')}
        onPublishClick={() => {
          setCurrentStep('review');
          setIsPublishModalOpen(true);
        }}
      />
    );
  }

  // 2. Publish Success Screen (Opaque link, 24h countdown, immutable snapshot)
  if (currentStep === 'published' && publishedSnapshot) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col relative z-20">
        <header className="h-16 bg-[#0A0A0A] border-b border-[#242424] px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-cinzel text-lg font-bold tracking-[0.2em] text-white">
              BIRTHDAY
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>EXPERIENCE PUBLISHED & LOCKED</span>
            </span>
          </div>

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg border border-[#2B2B2B] hover:bg-[#161616] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <PublishSuccessScreen
            snapshot={publishedSnapshot}
            onOpenExperience={() => {
              if (onOpenPublishedExperience) {
                onOpenPublishedExperience(publishedSnapshot.experienceId);
              } else {
                window.location.hash = `/b/${publishedSnapshot.experienceId}`;
              }
            }}
            onCreateAnother={handleCreateAnother}
            onReturnHome={onExit}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#E50914] flex flex-col relative z-20">
      {/* Studio Top Navigation Bar */}
      <header className="h-16 bg-[#0A0A0A] border-b border-[#242424] px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-lg font-bold tracking-[0.2em] text-white">
            BIRTHDAY
          </span>
          <span className="text-neutral-600">/</span>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            CREATOR STUDIO · {TEMPLATES[draft.template || 'cinema'].name}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Subtle Autosave Status Indicator */}
          <DraftStatusIndicator
            status={saveStatus}
            lastSavedAt={lastSavedAt}
            onManualSave={handleManualSave}
            isSavingManual={isSavingManual}
          />

          <button
            type="button"
            onClick={handleRequestExit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg border border-[#2B2B2B] hover:bg-[#161616] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit to Home</span>
          </button>
        </div>
      </header>

      {/* Step Progress Bar */}
      <CreatorProgress
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        isStepCompleted={isStepCompleted}
        canNavigateToStep={canNavigateToStep}
      />

      {/* Main Form Content Area */}
      <main className="flex-1 overflow-y-auto">
        {currentStep === 'template' && (
          <TemplateSelectorStep
            selectedTemplate={draft.template || 'cinema'}
            onSelectTemplate={(template) => {
              const defaultTheme = TEMPLATES[template].defaultTheme;
              const defaultCust = DEFAULT_CUSTOMIZATION[template];
              updateDraft({ template, theme: defaultTheme, customization: defaultCust });
            }}
            onNext={() => setCurrentStep('details')}
            onCancel={onExit}
          />
        )}

        {currentStep === 'details' && (
          <BirthdayDetailsForm
            draft={draft}
            onUpdate={updateDraft}
            onNext={() => setCurrentStep('photos')}
            onCancel={() => setCurrentStep('template')}
          />
        )}

        {currentStep === 'photos' && (
          <PhotoUploader
            photos={draft.photos}
            onPhotosChange={(photos) => updateDraft({ photos })}
            onNext={() => setCurrentStep('curate')}
            onBack={() => setCurrentStep('details')}
          />
        )}

        {currentStep === 'curate' && (
          <StoryCurationStep
            photos={draft.photos}
            onUpdatePhoto={(updatedPhoto) => {
              const updated = draft.photos.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p));
              updateDraft({ photos: updated });
            }}
            heroPhotoId={draft.heroPhotoId}
            onSelectHeroPhoto={(heroPhotoId) => updateDraft({ heroPhotoId })}
            innerCirclePhotoIds={draft.innerCirclePhotoIds}
            onToggleInnerCirclePhoto={handleToggleInnerCirclePhoto}
            surprisePhoto={draft.secretPhotos?.[0] || draft.surprisePhoto}
            secretPhotos={draft.secretPhotos || []}
            onUpdateSecretPhotos={(secretPhotos) => {
              updateDraft({
                secretPhotos,
                surprisePhoto: secretPhotos[0] || null,
              });
            }}
            onUpdateSurprisePhoto={(surprisePhoto) => {
              updateDraft({
                secretPhotos: draft.secretPhotos && draft.secretPhotos.length > 1 ? draft.secretPhotos : (surprisePhoto ? [surprisePhoto] : []),
                surprisePhoto,
              });
            }}
            onNext={() => setCurrentStep('music')}
            onBack={() => setCurrentStep('photos')}
          />
        )}

        {currentStep === 'music' && (
          <MusicUploader
            music={draft.music}
            onMusicChange={(music) => updateDraft({ music })}
            onNext={() => setCurrentStep('customize')}
            onBack={() => setCurrentStep('curate')}
          />
        )}

        {currentStep === 'customize' && (
          <CustomizationPanel
            draft={draft}
            onUpdate={updateDraft}
            onPreview={handleOpenPreview}
            onNext={() => setCurrentStep('theme')}
            onBack={() => setCurrentStep('music')}
          />
        )}

        {currentStep === 'theme' && (
          <CustomizationStudio
            draft={draft}
            onUpdate={updateDraft}
            onPreview={handleOpenPreview}
            onNext={() => setCurrentStep('review')}
            onBack={() => setCurrentStep('customize')}
          />
        )}

        {currentStep === 'review' && (
          <FinalReviewScreen
            draft={draft}
            onPreview={handleOpenPreview}
            onPublishClick={() => setIsPublishModalOpen(true)}
            onBackToEdit={() => setCurrentStep('theme')}
          />
        )}
      </main>

      {/* Publish Confirmation Modal */}
      <PublishConfirmationModal
        isOpen={isPublishModalOpen}
        draft={draft}
        isPublishing={isPublishing}
        publishError={publishError}
        onConfirm={handleConfirmPublish}
        onCancel={() => {
          if (!isPublishing) {
            setIsPublishModalOpen(false);
            setPublishError(null);
          }
        }}
        onRetry={handleConfirmPublish}
      />

      {/* Exit Protection Modal */}
      <ExitProtectionModal
        isOpen={isExitModalOpen}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
        onCancel={() => setIsExitModalOpen(false)}
        isSaving={isSavingManual}
      />

      {/* Draft Recovery Modal */}
      <DraftRecoveryModal
        isOpen={isRecoveryModalOpen}
        summary={existingDraftSummary}
        onContinueDraft={handleContinueDraft}
        onDiscardDraft={handleDiscardDraft}
        isLoading={isLoadingDraft}
      />
    </div>
  );
};
