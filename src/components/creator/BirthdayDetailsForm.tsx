import React, { useState } from 'react';
import { BirthdayExperienceDraft } from '../../types';
import { User, Calendar, Heart, ArrowRight, ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react';

interface BirthdayDetailsFormProps {
  draft: BirthdayExperienceDraft;
  onUpdate: (fields: Partial<BirthdayExperienceDraft>) => void;
  onNext: () => void;
  onCancel: () => void;
}

const RELATIONSHIP_OPTIONS = [
  'Best Friend',
  'Friend',
  'Partner',
  'Brother',
  'Sister',
  'Cousin',
  'Family',
  'Other',
];

export const BirthdayDetailsForm: React.FC<BirthdayDetailsFormProps> = ({
  draft,
  onUpdate,
  onNext,
  onCancel,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.recipientName.trim()) {
      setError("Enter the birthday person's name.");
      return;
    }
    setError(null);
    onNext();
  };

  const handleDateChange = (dateString: string) => {
    // Calculate approximate milestone age if date chosen
    let calculatedAge = draft.milestoneAge;
    if (dateString) {
      const birthDate = new Date(dateString);
      const today = new Date();
      if (!isNaN(birthDate.getTime())) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age > 0 && age < 125) {
          calculatedAge = age;
        }
      }
    }
    onUpdate({ birthday: dateString, milestoneAge: calculatedAge });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Step Header */}
      <div className="text-center mb-10">
        <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#E50914] font-semibold">
          STEP 01 OF 06
        </span>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mt-1 mb-3 [text-wrap:balance]">
          WHO ARE WE CELEBRATING?
        </h2>
        <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed [text-wrap:balance]">
          Provide basic details about the recipient. These form the core emotional foundation of their private cinematic premiere.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-[#E50914] text-white text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleContinue} className="space-y-7">
        {/* Recipient Name (Required) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
            Recipient Name <span className="text-[#E50914]">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={draft.recipientName}
              onChange={(e) => {
                setError(null);
                onUpdate({ recipientName: e.target.value });
              }}
              placeholder="e.g. Alex Vance, Maya Lin, Lucas..."
              className="w-full bg-[#121212] border border-[#2B2B2B] focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl px-4 py-3.5 text-sm sm:text-base text-white placeholder-neutral-600 transition-all outline-none"
              autoFocus
            />
            <User className="absolute right-4 top-4 w-4 h-4 text-neutral-500" />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5">
            This name will appear on the title card, film marquee, and cinematic chapter headings.
          </p>
        </div>

        {/* Relationship Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
            Your Relationship
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            {RELATIONSHIP_OPTIONS.map((rel) => {
              const isSelected = draft.relationship === rel;
              return (
                <button
                  key={rel}
                  type="button"
                  onClick={() => onUpdate({ relationship: rel })}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E50914] border-[#E50914] text-white shadow-md shadow-[#E50914]/20'
                      : 'bg-[#121212] border-[#292929] text-neutral-400 hover:text-white hover:border-neutral-600'
                  }`}
                >
                  {rel}
                </button>
              );
            })}
          </div>

          {draft.relationship === 'Other' && (
            <input
              type="text"
              value={draft.customRelationship || ''}
              onChange={(e) => onUpdate({ customRelationship: e.target.value })}
              placeholder="Specify relationship (e.g. Mentor, Soulmate, Bandmate)..."
              className="w-full bg-[#121212] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none"
            />
          )}
        </div>

        {/* Birthday Date & Milestone Age */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Birthday Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={draft.birthday}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-[#121212] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl px-4 py-3.5 text-sm text-white transition-all outline-none"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Select their birthday or the celebration date.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Milestone Age (Years)
            </label>
            <input
              type="number"
              min="1"
              max="125"
              value={draft.milestoneAge || ''}
              onChange={(e) => onUpdate({ milestoneAge: Number(e.target.value) || 28 })}
              placeholder="e.g. 28, 30, 50..."
              className="w-full bg-[#121212] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Used in the celebratory milestone acts.
            </p>
          </div>
        </div>

        {/* Sender Name (Optional) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
            Your Name / Sender (Optional)
          </label>
          <input
            type="text"
            value={draft.senderName}
            onChange={(e) => onUpdate({ senderName: e.target.value })}
            placeholder="e.g. With love from Jordan, The Crew, Mom & Dad..."
            className="w-full bg-[#121212] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 outline-none"
          />
        </div>

        {/* Personal Message / Opening Wish */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2 flex items-center justify-between">
            <span>Opening Birthday Wish / Message</span>
            <span className="text-[11px] text-neutral-500 font-normal">Optional</span>
          </label>
          <textarea
            rows={4}
            value={draft.birthdayMessage}
            onChange={(e) => onUpdate({ birthdayMessage: e.target.value })}
            placeholder="Happy birthday to someone who has been part of so many unforgettable moments. Today we celebrate the light and steady warmth you bring into every room you step into..."
            className="w-full bg-[#121212] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl p-4 text-sm text-white placeholder-neutral-600 leading-relaxed outline-none resize-y"
          />
          <p className="text-[11px] text-neutral-500 mt-1">
            This will be featured in the cinematic Act I opening sequence.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-[#242424] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-[#141414] border border-[#2A2A2A] rounded-xl hover:bg-[#1C1C1C] transition-colors cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            className="px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#E50914] hover:bg-[#c90711] rounded-xl transition-all shadow-lg shadow-[#E50914]/25 hover:shadow-[#E50914]/40 cursor-pointer flex items-center gap-2"
          >
            <span>Continue to Memories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
