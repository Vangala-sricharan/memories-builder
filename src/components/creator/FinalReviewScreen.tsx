import React, { useState } from 'react';
import { BirthdayExperienceDraft, UploadedPhoto } from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Sparkles, 
  Film, 
  Star, 
  Heart, 
  Layers, 
  Box, 
  Unlock, 
  Music, 
  ArrowLeft, 
  ArrowRight,
  Info,
  Calendar,
  User,
  ShieldAlert
} from 'lucide-react';

interface FinalReviewScreenProps {
  draft: BirthdayExperienceDraft;
  onPreview: () => void;
  onPublishClick: () => void;
  onBackToEdit: () => void;
}

export const FinalReviewScreen: React.FC<FinalReviewScreenProps> = ({
  draft,
  onPreview,
  onPublishClick,
  onBackToEdit,
}) => {
  // Determine hero photo
  const heroPhoto = draft.photos.find((p) => p.id === draft.heroPhotoId) || draft.photos[0];
  const isHeroDefaulted = !draft.heroPhotoId && draft.photos.length > 0;

  // Determine inner circle photos
  const innerCirclePhotos = draft.innerCirclePhotoIds && draft.innerCirclePhotoIds.length > 0
    ? draft.photos.filter((p) => draft.innerCirclePhotoIds.includes(p.id))
    : draft.photos.slice(0, Math.min(4, draft.photos.length));
  const isInnerCircleDefaulted = (!draft.innerCirclePhotoIds || draft.innerCirclePhotoIds.length === 0) && draft.photos.length > 0;

  // Validation checks
  const hasRecipient = !!draft.recipientName && draft.recipientName.trim().length > 0;
  const hasMinPhotos = draft.photos.length >= 3;
  const canPublish = hasRecipient && hasMinPhotos;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#E50914] font-semibold">
          STEP 08 OF 08 · FINAL CHECKPOINT
        </span>
        <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          FINAL PRE-PUBLISH REVIEW
        </h2>
        <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Verify all 7 acts of your cinematic experience before publishing. Once confirmed, this experience becomes an immutable 24-hour premiere.
        </p>
      </div>

      {/* Warnings & Notices Bar */}
      <div className="space-y-3">
        {!canPublish && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block mb-0.5">Publishing Blocked</span>
              {!hasRecipient && <p>• Recipient name is missing. Please add a recipient name.</p>}
              {!hasMinPhotos && <p>• At least 3 photos are required (currently {draft.photos.length} uploaded).</p>}
            </div>
          </div>
        )}

        {canPublish && (isHeroDefaulted || isInnerCircleDefaulted || !draft.music || !draft.surprisePhoto) && (
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#2B2B2B] text-xs text-neutral-400 space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold uppercase tracking-wider text-[11px]">
              <Info className="w-4 h-4 text-[#E50914]" />
              <span>Review Guidance (Optional Items)</span>
            </div>
            {isHeroDefaulted && (
              <p className="pl-6 text-neutral-400">
                • <strong>Hero Spotlight:</strong> No hero frame explicitly chosen; the first uploaded photo will be prominently featured.
              </p>
            )}
            {isInnerCircleDefaulted && (
              <p className="pl-6 text-neutral-400">
                • <strong>Inner Circle:</strong> No custom selection; the first {Math.min(4, draft.photos.length)} photos will form the orbital constellation.
              </p>
            )}
            {!draft.music && (
              <p className="pl-6 text-neutral-400">
                • <strong>Soundtrack:</strong> No MP3 uploaded. The premiere will play in quiet cinematic mode.
              </p>
            )}
            {!draft.surprisePhoto && (
              <p className="pl-6 text-neutral-400">
                • <strong>Secret Surprise:</strong> No surprise memory attached. Act VI will be seamlessly skipped.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Checklist Grid */}
      <div className="bg-[#101010] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#E50914]" />
            <span className="font-cinzel text-lg font-bold text-white tracking-wide">
              FINAL CHECK
            </span>
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            {canPublish ? 'READY FOR LOCK & PUBLISH' : 'ACTION REQUIRED'}
          </span>
        </div>

        {/* Check item list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* 1. Recipient Details */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-white/10">
              <User className="w-4 h-4 text-[#E50914]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Recipient & Dedication</span>
                <span className="text-emerald-400 font-mono text-[11px]">✓ Verified</span>
              </div>
              <p className="text-neutral-400 truncate mt-0.5">
                {draft.recipientName} {draft.milestoneAge ? `· ${draft.milestoneAge}th Milestone` : ''}
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-1">
                Relation: {draft.relationship === 'Other' ? draft.customRelationship : draft.relationship}
              </p>
            </div>
          </div>

          {/* 2. Hero Spotlight */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
              {heroPhoto ? (
                <AutoFitImage src={heroPhoto.previewUrl} alt="Hero" />
              ) : (
                <Star className="w-4 h-4 text-[#E50914]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Hero Spotlight (Act II)</span>
                <span className="text-emerald-400 font-mono text-[11px]">✓ Assigned</span>
              </div>
              <p className="text-neutral-400 truncate mt-0.5">
                {heroPhoto?.caption || 'Photo #1'}
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-1">
                2.39:1 Anamorphic Framing
              </p>
            </div>
          </div>

          {/* 3. Inner Circle */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-white/10">
              <Heart className="w-4 h-4 text-[#E50914]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Inner Circle (Act III)</span>
                <span className="text-emerald-400 font-mono text-[11px]">✓ Curated</span>
              </div>
              <p className="text-neutral-400 mt-0.5">
                {innerCirclePhotos.length} Cherished Memories in Orbit
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-1">
                Orbital constellation active
              </p>
            </div>
          </div>

          {/* 4. Memory Sequence & Vault */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-white/10">
              <Layers className="w-4 h-4 text-[#E50914]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">All Memories & 3D Vault</span>
                <span className="text-emerald-400 font-mono text-[11px]">✓ {draft.photos.length} Photos</span>
              </div>
              <p className="text-neutral-400 mt-0.5">
                Full chronological sequence + 3D archival sanctuary
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-1">
                Quality optimized in browser
              </p>
            </div>
          </div>

          {/* 5. Secret Surprise */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-white/10">
              <Unlock className="w-4 h-4 text-[#E50914]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Secret Surprise (Act VI)</span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  {draft.surprisePhoto ? '✓ 1 Attached' : 'Skipped'}
                </span>
              </div>
              <p className="text-neutral-400 truncate mt-0.5">
                {draft.surprisePhoto ? draft.surprisePhoto.caption : 'No confidential photo (Optional)'}
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-1">
                {draft.surprisePhoto ? 'Locked until recipient unlocks' : 'Act VI smoothly bypassed'}
              </p>
            </div>
          </div>

          {/* 6. Soundtrack */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-white/10">
              <Music className="w-4 h-4 text-[#E50914]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Audio Soundtrack</span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  {draft.music ? '✓ Attached' : 'Quiet Mode'}
                </span>
              </div>
              <p className="text-neutral-400 truncate mt-0.5">
                {draft.music?.fileName || 'No music attached (Optional)'}
              </p>
              <p className="text-[11px] text-neutral-500 font-mono mt-1">
                {draft.music ? 'Autoplay with mute control' : 'Pure visual immersion'}
              </p>
            </div>
          </div>

          {/* 7. Final Birthday Wish */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-white/10">
              <Sparkles className="w-4 h-4 text-[#E50914]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Epilogue Dedication (Act VII)</span>
                <span className="text-emerald-400 font-mono text-[11px]">✓ Ready</span>
              </div>
              <p className="text-neutral-300 font-serif italic line-clamp-2 mt-1">
                "{draft.finalMessage}"
              </p>
              {draft.senderName && (
                <p className="text-[11px] text-[#E50914] font-mono mt-1 uppercase">
                  Presented with love by {draft.senderName}
                </p>
              )}
            </div>
          </div>

          {/* 8. Visual Template & Colour Palette */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] flex items-start gap-3.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/15 shadow-inner"
              style={{ backgroundColor: draft.theme?.background || '#080808' }}
            >
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: draft.theme?.primary || '#E50914' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  {(draft.template || 'cinema').toUpperCase()} · {(draft.customization?.photoStyle || 'cinematic').toUpperCase()}
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">✓ Styled</span>
              </div>
              <p className="text-neutral-400 truncate mt-0.5 flex items-center gap-1.5 font-mono text-[11px]">
                <span>Photo: {(draft.customization?.photoStyle || 'cinematic').toUpperCase()}</span>
                <span>·</span>
                <span style={{ color: draft.theme?.primary || '#E50914' }}>Primary</span>
                <span>·</span>
                <span style={{ color: draft.theme?.secondary || '#FFFFFF' }}>Secondary</span>
              </p>
              <p className="text-[10px] text-neutral-500 font-mono mt-1">
                Visual language, photo mode & palette locked to premiere
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Narrative Snapshot Accordion/Card */}
      <div className="bg-[#0D0D0D] border border-[#222222] rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            CINEMATIC STORYLINE FLOW
          </span>
          <span className="text-xs font-mono text-[#E50914] font-bold">
            7 ACTS PREPARED
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 text-[10px] font-mono text-neutral-400 no-scrollbar">
          <span className="px-2.5 py-1 rounded bg-[#181818] border border-white/10 shrink-0 text-white">I · WISH</span>
          <span className="text-neutral-600">→</span>
          <span className="px-2.5 py-1 rounded bg-[#181818] border border-white/10 shrink-0 text-white">II · HERO</span>
          <span className="text-neutral-600">→</span>
          <span className="px-2.5 py-1 rounded bg-[#181818] border border-white/10 shrink-0 text-white">III · CIRCLE</span>
          <span className="text-neutral-600">→</span>
          <span className="px-2.5 py-1 rounded bg-[#181818] border border-white/10 shrink-0 text-white">IV · MEMORIES</span>
          <span className="text-neutral-600">→</span>
          <span className="px-2.5 py-1 rounded bg-[#181818] border border-white/10 shrink-0 text-white">V · 3D VAULT</span>
          <span className="text-neutral-600">→</span>
          <span className="px-2.5 py-1 rounded bg-[#181818] border border-white/10 shrink-0 text-white">VI · SURPRISE</span>
          <span className="text-neutral-600">→</span>
          <span className="px-2.5 py-1 rounded bg-[#181818] border border-white/10 shrink-0 text-white">VII · EPILOGUE</span>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="pt-6 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToEdit}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#2B2B2B] bg-[#141414] hover:bg-[#1C1C1C] text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AI Story</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Full Preview Button */}
          <button
            type="button"
            onClick={onPreview}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#3A3A3A] bg-[#1C1C1C] hover:bg-[#262626] text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center justify-center gap-2 hover:border-[#E50914]"
          >
            <Eye className="w-4 h-4 text-[#E50914]" />
            <span>Full Cinematic Preview</span>
          </button>

          {/* Prominent Publish Button */}
          <button
            type="button"
            onClick={onPublishClick}
            disabled={!canPublish}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#E50914] hover:bg-[#c90711] disabled:opacity-40 disabled:hover:bg-[#E50914] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#E50914]/30 hover:shadow-[#E50914]/50 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>Publish Birthday Experience</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
