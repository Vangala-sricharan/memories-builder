import React, { useState, useEffect, useRef } from 'react';
import { BirthdayExperienceDraft } from '../../types';
import { 
  generateBirthdayContent, 
  regenerateSection, 
  RegenerableSection 
} from '../../services/aiService';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Type, 
  Quote, 
  Heart,
  Eye,
  RefreshCw,
  Box,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Sliders,
  FileText,
  Users
} from 'lucide-react';

interface CustomizationPanelProps {
  draft: BirthdayExperienceDraft;
  onUpdate: (fields: Partial<BirthdayExperienceDraft>) => void;
  onPreview: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  draft,
  onUpdate,
  onPreview,
  onNext,
  onBack,
}) => {
  // Track which section is currently regenerating
  const [activeRegeneratingSection, setActiveRegeneratingSection] = useState<RegenerableSection | null>(null);
  const [isInitialAiGenerating, setIsInitialAiGenerating] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const hasTriggeredInitialRef = useRef(false);

  // Automatically trigger initial AI storytelling generation if fields are empty
  useEffect(() => {
    if (hasTriggeredInitialRef.current) return;

    const needsInitialGeneration = 
      !draft.tagline || 
      draft.tagline === 'A Cinematic Birthday Story' ||
      !draft.storyNarrative;

    if (needsInitialGeneration) {
      hasTriggeredInitialRef.current = true;
      runInitialAiGeneration();
    }
  }, []);

  const runInitialAiGeneration = async () => {
    setIsInitialAiGenerating(true);
    setAiNotice(null);

    try {
      const generated = await generateBirthdayContent({
        recipientName: draft.recipientName,
        relationship: draft.relationship,
        customRelationship: draft.customRelationship,
        milestoneAge: draft.milestoneAge,
        birthdayDate: draft.birthday,
        senderName: draft.senderName,
        creatorMessage: draft.birthdayMessage,
        photoCount: draft.photos.length,
        hasSurprisePhoto: !!draft.surprisePhoto,
      });

      // Update fields while honoring creator-authored messages
      onUpdate({
        birthdayMessage: draft.birthdayMessage && draft.birthdayMessage.trim().length > 10
          ? draft.birthdayMessage
          : generated.openingWish,
        tagline: generated.intro || draft.tagline,
        openingQuote: generated.story ? `“${generated.story.slice(0, 110)}...”` : draft.openingQuote,
        storyNarrative: generated.story,
        innerCircleIntro: generated.innerCircleIntro,
        vaultIntro: generated.vaultIntro,
        surpriseText: generated.surpriseText,
        finalMessage: generated.finalWish || draft.finalMessage,
      });
    } catch (err) {
      setAiNotice("AI couldn't generate initial content right now. You can write it yourself or regenerate any section below.");
    } finally {
      setIsInitialAiGenerating(false);
    }
  };

  const handleRegenerate = async (section: RegenerableSection) => {
    if (activeRegeneratingSection) return; // Prevent duplicate simultaneous requests
    setActiveRegeneratingSection(section);
    setAiNotice(null);

    try {
      let currentValue = '';
      if (section === 'openingWish') currentValue = draft.birthdayMessage;
      if (section === 'intro') currentValue = draft.tagline;
      if (section === 'story') currentValue = draft.storyNarrative || draft.openingQuote;
      if (section === 'innerCircleIntro') currentValue = draft.innerCircleIntro || '';
      if (section === 'vaultIntro') currentValue = draft.vaultIntro || '';
      if (section === 'surpriseText') currentValue = draft.surpriseText || '';
      if (section === 'finalWish') currentValue = draft.finalMessage;

      const newText = await regenerateSection({
        section,
        recipientName: draft.recipientName,
        relationship: draft.relationship,
        customRelationship: draft.customRelationship,
        milestoneAge: draft.milestoneAge,
        creatorMessage: draft.birthdayMessage,
        senderName: draft.senderName,
        currentValue,
      });

      if (section === 'openingWish') onUpdate({ birthdayMessage: newText });
      if (section === 'intro') onUpdate({ tagline: newText });
      if (section === 'story') onUpdate({ storyNarrative: newText, openingQuote: `“${newText}”` });
      if (section === 'innerCircleIntro') onUpdate({ innerCircleIntro: newText });
      if (section === 'vaultIntro') onUpdate({ vaultIntro: newText });
      if (section === 'surpriseText') onUpdate({ surpriseText: newText });
      if (section === 'finalWish') onUpdate({ finalMessage: newText });
    } catch (err) {
      setAiNotice("AI couldn't generate this section right now. You can write it yourself or try again.");
    } finally {
      setActiveRegeneratingSection(null);
    }
  };

  const getRegenerationLoadingText = (section: RegenerableSection) => {
    switch (section) {
      case 'openingWish': return 'Crafting the opening wish...';
      case 'intro': return 'Composing milestone tagline...';
      case 'innerCircleIntro': return 'Composing Inner Circle reflection...';
      case 'story': return 'Shaping the narrative story...';
      case 'vaultIntro': return 'Weaving the vault reflection...';
      case 'surpriseText': return 'Formulating the reveal line...';
      case 'finalWish': return 'Writing the final wish...';
      default: return 'Generating with Gemini AI...';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Step Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#E50914] font-semibold">
          STEP 05 OF 06
        </span>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mt-1 mb-2 [text-wrap:balance]">
          AI CREATIVE DIRECTOR
        </h2>
        <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed [text-wrap:balance]">
          Gemini AI has structured a personalized cinematic narrative. Review and edit any line manually, or regenerate individual sections.
        </p>
      </div>

      {/* Global AI Loading Banner */}
      {isInitialAiGenerating && (
        <div className="mb-8 p-4 bg-[#140808] border border-[#E50914]/40 rounded-2xl flex items-center justify-between text-xs font-mono text-neutral-300 animate-fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#E50914] animate-spin" />
            <span>Gemini AI is crafting the opening, story narrative, and vault reflections...</span>
          </div>
          <span className="text-[#E50914] text-[11px] font-bold">AUTOMATIC</span>
        </div>
      )}

      {/* Notice / Failure Fallback Notification */}
      {aiNotice && (
        <div className="mb-6 p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
            <span>{aiNotice}</span>
          </div>
          <button
            onClick={() => setAiNotice(null)}
            className="text-[11px] font-mono text-neutral-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-8">
        {/* Story Snapshot Card */}
        <div className="bg-[#121212] border border-[#2B2B2B] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#242424]">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              7-ACT PREMIERE DRAFT SUMMARY
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                GEMINI AI ACTIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-neutral-500 mb-1">Recipient</div>
              <div className="text-white font-bold truncate">{draft.recipientName}</div>
            </div>
            <div>
              <div className="text-neutral-500 mb-1">Total Memories</div>
              <div className="text-white font-medium">{draft.photos.length} Photographs</div>
            </div>
            <div>
              <div className="text-neutral-500 mb-1">Soundtrack</div>
              <div className="text-white font-medium truncate">{draft.music?.fileName || 'Attached'}</div>
            </div>
            <div>
              <div className="text-neutral-500 mb-1">Surprise Moment</div>
              <div className="text-white font-medium">
                {draft.surprisePhoto ? '1 Secret Photo Attached' : 'None (Skipped)'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Act I Opening Wish */}
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E50914]">
              <Type className="w-4 h-4" />
              <span>Act I · Opening Birthday Wish</span>
            </div>

            <button
              type="button"
              onClick={() => handleRegenerate('openingWish')}
              disabled={!!activeRegeneratingSection || isInitialAiGenerating}
              className="text-xs text-neutral-400 hover:text-white disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer bg-[#181818] border border-[#2B2B2B] px-2.5 py-1 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${activeRegeneratingSection === 'openingWish' ? 'animate-spin text-[#E50914]' : ''}`} />
              <span>{activeRegeneratingSection === 'openingWish' ? getRegenerationLoadingText('openingWish') : 'Regenerate Wish'}</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={draft.birthdayMessage}
            onChange={(e) => onUpdate({ birthdayMessage: e.target.value })}
            placeholder="Opening birthday wish..."
            className="w-full bg-[#141414] border border-[#2A2A2A] focus:border-[#E50914] rounded-xl p-4 text-sm text-white outline-none resize-none leading-relaxed"
          />
          <p className="text-[11px] text-neutral-500">
            Displays right after the opening title card in Act I.
          </p>
        </div>

        {/* Section 2: Prologue Tagline */}
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
              <Sparkles className="w-4 h-4 text-[#E50914]" />
              <span>Act I · Milestone Tagline</span>
            </div>

            <button
              type="button"
              onClick={() => handleRegenerate('intro')}
              disabled={!!activeRegeneratingSection || isInitialAiGenerating}
              className="text-xs text-neutral-400 hover:text-white disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer bg-[#181818] border border-[#2B2B2B] px-2.5 py-1 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${activeRegeneratingSection === 'intro' ? 'animate-spin text-[#E50914]' : ''}`} />
              <span>{activeRegeneratingSection === 'intro' ? getRegenerationLoadingText('intro') : 'Regenerate Tagline'}</span>
            </button>
          </div>

          <input
            type="text"
            value={draft.tagline}
            onChange={(e) => onUpdate({ tagline: e.target.value })}
            placeholder="e.g. Twenty-Eight Orbits of Unstoppable Light"
            className="w-full bg-[#141414] border border-[#2A2A2A] focus:border-[#E50914] rounded-xl px-4 py-3 text-sm text-white outline-none"
          />
        </div>

        {/* Section: Act III Inner Circle Reflection */}
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
              <Users className="w-4 h-4 text-[#E50914]" />
              <span>Act III · Inner Circle Reflection</span>
            </div>

            <button
              type="button"
              onClick={() => handleRegenerate('innerCircleIntro')}
              disabled={!!activeRegeneratingSection || isInitialAiGenerating}
              className="text-xs text-neutral-400 hover:text-white disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer bg-[#181818] border border-[#2B2B2B] px-2.5 py-1 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${activeRegeneratingSection === 'innerCircleIntro' ? 'animate-spin text-[#E50914]' : ''}`} />
              <span>{activeRegeneratingSection === 'innerCircleIntro' ? getRegenerationLoadingText('innerCircleIntro') : 'Regenerate Circle Text'}</span>
            </button>
          </div>

          <textarea
            rows={2}
            value={draft.innerCircleIntro || ''}
            onChange={(e) => onUpdate({ innerCircleIntro: e.target.value })}
            placeholder="A tribute to those who know your light best..."
            className="w-full bg-[#141414] border border-[#2A2A2A] focus:border-[#E50914] rounded-xl p-4 text-sm text-white outline-none resize-none leading-relaxed"
          />
          <p className="text-[11px] text-neutral-500">
            Introduces the curated constellation of inner circle memories in Act III.
          </p>
        </div>

        {/* Section 3: Memory Narrative / Dedication */}
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
              <Quote className="w-4 h-4 text-[#E50914]" />
              <span>Act IV · Memory Narrative & Dedication</span>
            </div>

            <button
              type="button"
              onClick={() => handleRegenerate('story')}
              disabled={!!activeRegeneratingSection || isInitialAiGenerating}
              className="text-xs text-neutral-400 hover:text-white disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer bg-[#181818] border border-[#2B2B2B] px-2.5 py-1 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${activeRegeneratingSection === 'story' ? 'animate-spin text-[#E50914]' : ''}`} />
              <span>{activeRegeneratingSection === 'story' ? getRegenerationLoadingText('story') : 'Regenerate Story'}</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={draft.openingQuote}
            onChange={(e) => onUpdate({ openingQuote: e.target.value })}
            placeholder="Narrative quote..."
            className="w-full bg-[#141414] border border-[#2A2A2A] focus:border-[#E50914] rounded-xl p-4 text-sm text-white font-serif italic outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Section 4: 3D Photo Vault Intro Reflection */}
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
              <Box className="w-4 h-4 text-[#E50914]" />
              <span>Act V · 3D Photo Vault Intro</span>
            </div>

            <button
              type="button"
              onClick={() => handleRegenerate('vaultIntro')}
              disabled={!!activeRegeneratingSection || isInitialAiGenerating}
              className="text-xs text-neutral-400 hover:text-white disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer bg-[#181818] border border-[#2B2B2B] px-2.5 py-1 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${activeRegeneratingSection === 'vaultIntro' ? 'animate-spin text-[#E50914]' : ''}`} />
              <span>{activeRegeneratingSection === 'vaultIntro' ? getRegenerationLoadingText('vaultIntro') : 'Regenerate Vault Text'}</span>
            </button>
          </div>

          <input
            type="text"
            value={draft.vaultIntro || 'Some moments are too precious for ordinary days. Here they are preserved eternally in the 3D vault.'}
            onChange={(e) => onUpdate({ vaultIntro: e.target.value })}
            placeholder="Vault reflection sentence..."
            className="w-full bg-[#141414] border border-[#2A2A2A] focus:border-[#E50914] rounded-xl px-4 py-3 text-sm text-white outline-none"
          />
        </div>

        {/* Section 5: Surprise Reveal Text (Only if surprise photo attached) */}
        {draft.surprisePhoto && (
          <div className="bg-[#140808] border border-[#3E1414] rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF4D4D]">
                <Unlock className="w-4 h-4" />
                <span>Act VI · Secret Surprise Reveal Line</span>
              </div>

              <button
                type="button"
                onClick={() => handleRegenerate('surpriseText')}
                disabled={!!activeRegeneratingSection || isInitialAiGenerating}
                className="text-xs text-neutral-400 hover:text-white disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer bg-[#200D0D] border border-[#3D1414] px-2.5 py-1 rounded-lg"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${activeRegeneratingSection === 'surpriseText' ? 'animate-spin text-[#E50914]' : ''}`} />
                <span>{activeRegeneratingSection === 'surpriseText' ? getRegenerationLoadingText('surpriseText') : 'Regenerate Reveal'}</span>
              </button>
            </div>

            <input
              type="text"
              value={draft.surpriseText || draft.surprisePhoto.caption || 'A confidential memory unlocked exclusively for your eyes.'}
              onChange={(e) => onUpdate({ surpriseText: e.target.value })}
              placeholder="Surprise reveal text..."
              className="w-full bg-[#1A0C0C] border border-[#3A1818] focus:border-[#E50914] rounded-xl px-4 py-3 text-sm text-white outline-none"
            />
          </div>
        )}

        {/* Section 6: Final Birthday Wish / Epilogue */}
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E50914]">
              <Heart className="w-4 h-4 fill-[#E50914]" />
              <span>Act VII · Final Birthday Wish & Epilogue</span>
            </div>

            <button
              type="button"
              onClick={() => handleRegenerate('finalWish')}
              disabled={!!activeRegeneratingSection || isInitialAiGenerating}
              className="text-xs text-neutral-400 hover:text-white disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer bg-[#181818] border border-[#2B2B2B] px-2.5 py-1 rounded-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${activeRegeneratingSection === 'finalWish' ? 'animate-spin text-[#E50914]' : ''}`} />
              <span>{activeRegeneratingSection === 'finalWish' ? getRegenerationLoadingText('finalWish') : 'Regenerate Epilogue'}</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={draft.finalMessage}
            onChange={(e) => onUpdate({ finalMessage: e.target.value })}
            placeholder="Final birthday closing wish..."
            className="w-full bg-[#141414] border border-[#2A2A2A] focus:border-[#E50914] rounded-xl p-4 text-sm text-white font-serif italic outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Particle Atmosphere Settings */}
        <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-300">
              <Sliders className="w-4 h-4 text-[#E50914]" />
              <span>Particle Environment Intensity</span>
            </div>
            <span className="text-xs font-mono text-neutral-400 capitalize">
              Current: {draft.particleIntensity}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['subtle', 'normal', 'vibrant'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onUpdate({ particleIntensity: lvl })}
                className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                  draft.particleIntensity === lvl
                    ? 'bg-[#E50914] border-[#E50914] text-white shadow-lg shadow-[#E50914]/20'
                    : 'bg-[#141414] border-[#2A2A2A] text-neutral-400 hover:text-white hover:border-neutral-600'
                }`}
              >
                <div className="text-xs font-semibold capitalize mb-0.5">{lvl}</div>
                <div className="text-[10px] text-neutral-400">
                  {lvl === 'subtle' ? 'Quiet cinematic aura' : lvl === 'normal' ? 'Balanced 3D field' : 'Radiant particles'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-10 pt-6 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-[#141414] border border-[#2A2A2A] rounded-xl hover:bg-[#1C1C1C] transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Music</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onPreview}
            className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-[#1C1C1C] border border-[#333333] hover:border-[#E50914] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-[#E50914]" />
            <span>Full Preview</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#E50914] hover:bg-[#c90711] rounded-xl transition-all shadow-xl shadow-[#E50914]/30 hover:shadow-[#E50914]/50 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>Proceed to Final Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
