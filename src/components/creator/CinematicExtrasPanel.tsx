import React, { useState } from 'react';
import { 
  CinematicExtras, 
  UploadedPhoto, 
  ExperienceTemplate,
  ChapterTitlesConfig
} from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { 
  Sparkles, 
  Film, 
  Lock, 
  Eye, 
  Mail, 
  Music, 
  Star, 
  Type, 
  Smile, 
  Check, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface CinematicExtrasPanelProps {
  cinematicExtras?: CinematicExtras;
  photos: UploadedPhoto[];
  recipientName: string;
  relationship: string;
  hasSurprisePhoto: boolean;
  hasMusic: boolean;
  template: ExperienceTemplate;
  onUpdate: (extras: CinematicExtras) => void;
  onUpdatePhotoCaption?: (photoId: string, caption: string) => void;
}

export const CinematicExtrasPanel: React.FC<CinematicExtrasPanelProps> = ({
  cinematicExtras,
  photos,
  recipientName,
  relationship,
  hasSurprisePhoto,
  hasMusic,
  template,
  onUpdate,
  onUpdatePhotoCaption,
}) => {
  const extras: CinematicExtras = {
    secretRevealEnabled: false,
    hiddenMessageEnabled: false,
    chapterTitlesEnabled: true,
    memorySpotlightEnabled: false,
    surpriseLockEnabled: hasSurprisePhoto,
    musicSyncedEnabled: hasMusic,
    easterEggEnabled: true,
    chapters: {
      chapter1: 'THE BEGINNING',
      chapterTwo: 'THE MEMORIES',
      chapter3: 'THE PEOPLE',
      chapter4: 'THE VAULT',
      chapter5: 'THE SURPRISE',
      chapter6: 'FINALE',
    },
    ...cinematicExtras,
  };

  const [expandedSection, setExpandedSection] = useState<string | null>('chapters');
  const [aiGeneratingCaptionFor, setAiGeneratingCaptionFor] = useState<string | null>(null);
  const [aiSuggestingHiddenMsg, setAiSuggestingHiddenMsg] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const updateField = <K extends keyof CinematicExtras>(key: K, val: CinematicExtras[K]) => {
    onUpdate({
      ...extras,
      [key]: val,
    });
  };

  const updateChapterTitle = (chapterKey: keyof ChapterTitlesConfig, val: string) => {
    onUpdate({
      ...extras,
      chapters: {
        ...(extras.chapters || {}),
        [chapterKey]: val,
      },
    });
  };

  // Quick AI Suggestion for Hidden Message
  const handleAiSuggestHiddenMessage = () => {
    setAiSuggestingHiddenMsg(true);
    setTimeout(() => {
      const suggestions = [
        `No matter how many miles or years pass, you'll always have a home in my heart.`,
        `Thank you for being the person who makes every ordinary day feel like an adventure.`,
        `I secretly kept all these photos because I knew one day we'd look back and smile like this.`,
        `The world is genuinely brighter, warmer, and kinder with you in it. Happy Birthday.`,
      ];
      const randomMsg = suggestions[Math.floor(Math.random() * suggestions.length)];
      updateField('hiddenMessageText', randomMsg);
      setAiSuggestingHiddenMsg(false);
    }, 450);
  };

  // Quick AI Caption Generator for a single photo
  const handleAiSuggestCaption = (photoId: string, currentCaption: string) => {
    if (!onUpdatePhotoCaption) return;
    setAiGeneratingCaptionFor(photoId);

    setTimeout(() => {
      const ideas = [
        `The moment everything felt effortless and golden.`,
        `Laughing so hard we couldn't even catch our breath.`,
        `One of those quiet adventures that ended up meaning everything.`,
        `Pure, unfiltered happiness captured in a single frame.`,
        `That night under the city lights that we promised never to forget.`,
      ];
      const suggestion = ideas[Math.floor(Math.random() * ideas.length)];
      onUpdatePhotoCaption(photoId, suggestion);
      setAiGeneratingCaptionFor(null);
    }, 400);
  };

  // Auto-Select Spotlight Photo
  const handleAutoSelectSpotlight = () => {
    if (photos.length === 0) return;
    // Pick the middle or highest index photo
    const chosenIndex = Math.min(2, photos.length - 1);
    const chosenId = photos[chosenIndex].id;
    updateField('spotlightPhotoIds', [chosenId]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-[#E50914]" />
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-white">
            CINEMATIC EXTRAS (V1.5)
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
          OPTIONAL STORYTELLING ENHANCEMENTS
        </span>
      </div>

      {/* 1. SECRET REVEAL */}
      <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-mono uppercase font-bold text-white">1. SECRET REVEAL</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              One photo stays secret until visitor reaches the designated point.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!extras.secretRevealEnabled}
              onChange={(e) => updateField('secretRevealEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#2B2B30] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E50914]" />
          </label>
        </div>

        {extras.secretRevealEnabled && (
          <div className="pt-3 mt-3 border-t border-[#222226] space-y-2 animate-fade-in">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              CHOOSE PHOTO TO HIDE AS SECRET:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
              {photos.map((p) => {
                const isSelected = extras.secretPhotoId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateField('secretPhotoId', p.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      isSelected ? 'border-[#E50914] ring-2 ring-[#E50914]' : 'border-[#333] hover:border-white/50'
                    }`}
                  >
                    <AutoFitImage src={p.previewUrl} alt={p.caption} />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#E50914]/40 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. HIDDEN MESSAGE */}
      <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-mono uppercase font-bold text-white">2. HIDDEN MESSAGE</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Interactive "THERE'S SOMETHING ELSE..." trigger revealing a private note.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!extras.hiddenMessageEnabled}
              onChange={(e) => updateField('hiddenMessageEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#2B2B30] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E50914]" />
          </label>
        </div>

        {extras.hiddenMessageEnabled && (
          <div className="pt-3 mt-3 border-t border-[#222226] space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span>YOUR PRIVATE HIDDEN MESSAGE:</span>
              <button
                type="button"
                onClick={handleAiSuggestHiddenMessage}
                disabled={aiSuggestingHiddenMsg}
                className="text-[#E50914] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{aiSuggestingHiddenMsg ? 'Suggesting...' : 'AI Suggest'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={extras.hiddenMessageText || ''}
              onChange={(e) => updateField('hiddenMessageText', e.target.value)}
              placeholder="Write a private note they can uncover..."
              className="w-full bg-[#18181C] border border-[#2B2B30] focus:border-[#E50914] rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* 3. CINEMATIC CHAPTER TITLES */}
      <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-mono uppercase font-bold text-white">3. CHAPTER TITLES</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Editorial chapter transitions between major story acts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleSection('chapters')}
              className="text-neutral-400 hover:text-white p-1"
            >
              {expandedSection === 'chapters' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={extras.chapterTitlesEnabled !== false}
                onChange={(e) => updateField('chapterTitlesEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#2B2B30] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E50914]" />
            </label>
          </div>
        </div>

        {extras.chapterTitlesEnabled !== false && expandedSection === 'chapters' && (
          <div className="pt-3 mt-3 border-t border-[#222226] space-y-2.5 animate-fade-in">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              CUSTOMIZE CHAPTER HEADINGS (OPTIONAL):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-0.5">CHAPTER 01</label>
                <input
                  type="text"
                  value={extras.chapters?.chapter1 || 'THE BEGINNING'}
                  onChange={(e) => updateChapterTitle('chapter1', e.target.value)}
                  className="w-full bg-[#18181C] border border-[#2B2B30] focus:border-[#E50914] rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-0.5">CHAPTER 02</label>
                <input
                  type="text"
                  value={extras.chapters?.chapterTwo || 'THE MEMORIES'}
                  onChange={(e) => updateChapterTitle('chapterTwo', e.target.value)}
                  className="w-full bg-[#18181C] border border-[#2B2B30] focus:border-[#E50914] rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-0.5">CHAPTER 03</label>
                <input
                  type="text"
                  value={extras.chapters?.chapter3 || 'THE PEOPLE'}
                  onChange={(e) => updateChapterTitle('chapter3', e.target.value)}
                  className="w-full bg-[#18181C] border border-[#2B2B30] focus:border-[#E50914] rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-400 block mb-0.5">CHAPTER 04</label>
                <input
                  type="text"
                  value={extras.chapters?.chapter4 || 'THE VAULT'}
                  onChange={(e) => updateChapterTitle('chapter4', e.target.value)}
                  className="w-full bg-[#18181C] border border-[#2B2B30] focus:border-[#E50914] rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MEMORY SPOTLIGHT */}
      <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-mono uppercase font-bold text-white">4. MEMORY SPOTLIGHT</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              One signature memory becomes a dominant cinematic centerpiece.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!extras.memorySpotlightEnabled}
              onChange={(e) => updateField('memorySpotlightEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#2B2B30] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E50914]" />
          </label>
        </div>

        {extras.memorySpotlightEnabled && (
          <div className="pt-3 mt-3 border-t border-[#222226] space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span>SELECT SPOTLIGHT PHOTO:</span>
              <button
                type="button"
                onClick={handleAutoSelectSpotlight}
                className="text-[#E50914] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto Select</span>
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
              {photos.map((p) => {
                const isSelected = extras.spotlightPhotoIds?.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateField('spotlightPhotoIds', [p.id])}
                    className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      isSelected ? 'border-[#E50914] ring-2 ring-[#E50914]' : 'border-[#333] hover:border-white/50'
                    }`}
                  >
                    <AutoFitImage src={p.previewUrl} alt={p.caption} />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#E50914]/40 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. SURPRISE LOCK */}
      <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-mono uppercase font-bold text-white">5. SURPRISE LOCK</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Visual storytelling lock ("ONE LAST THING... 🔒 LOCKED") before the finale.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={extras.surpriseLockEnabled !== false}
              onChange={(e) => updateField('surpriseLockEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#2B2B30] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E50914]" />
          </label>
        </div>
      </div>

      {/* 6. MUSIC-SYNCED MOMENTS */}
      <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-mono uppercase font-bold text-white">6. MUSIC-SYNCED MOMENTS</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Synchronizes chapter reveals, spotlight swells, and surprise unlocks with soundtrack.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!extras.musicSyncedEnabled}
              onChange={(e) => updateField('musicSyncedEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#2B2B30] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E50914]" />
          </label>
        </div>
      </div>

      {/* 7. MEMORY CAPTIONS QUICK EDITOR */}
      <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-mono uppercase font-bold text-white">7. MEMORY CAPTIONS</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Edit individual memory captions with AI suggestions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleSection('captions')}
            className="text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>{expandedSection === 'captions' ? 'Hide' : 'Configure'}</span>
            {expandedSection === 'captions' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {expandedSection === 'captions' && (
          <div className="pt-3 mt-3 border-t border-[#222226] space-y-3 animate-fade-in max-h-56 overflow-y-auto pr-1">
            {photos.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 bg-[#18181C] p-2 rounded-xl border border-[#26262B]">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black">
                  <AutoFitImage src={p.previewUrl} alt={p.caption} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>PHOTO #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleAiSuggestCaption(p.id, p.caption)}
                      disabled={aiGeneratingCaptionFor === p.id}
                      className="text-[#E50914] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{aiGeneratingCaptionFor === p.id ? 'Thinking...' : 'AI Suggest'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={p.caption}
                    onChange={(e) => onUpdatePhotoCaption && onUpdatePhotoCaption(p.id, e.target.value)}
                    placeholder="Add a memory caption..."
                    className="w-full bg-[#101012] border border-[#333] focus:border-[#E50914] rounded-lg px-2 py-1 text-xs text-white outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8. HIDDEN EASTER EGG */}
      <div className="bg-[#121214] border border-[#222226] rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-mono uppercase font-bold text-white">8. HIDDEN EASTER EGG</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Triple-clicking the brand heart reveals a secret message.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={extras.easterEggEnabled !== false}
              onChange={(e) => updateField('easterEggEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#2B2B30] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E50914]" />
          </label>
        </div>
      </div>
    </div>
  );
};
