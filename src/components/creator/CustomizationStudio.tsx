import React, { useState } from 'react';
import { 
  BirthdayExperienceDraft, 
  ExperienceTemplate, 
  ExperienceTheme,
  ExperienceMood,
  AccentIntensity,
  GlowStyle,
  BorderStyle,
  HeadingStyle,
  BodyStyle,
  MotionEnergy,
  ParticleAtmosphere,
  PhotoPresentationStyle,
  HeroFocus,
  OccasionType,
  ExperienceCustomization
} from '../../types';
import { 
  TEMPLATES, 
  DEFAULT_CUSTOMIZATION, 
  QUICK_PRESETS,
  deriveThemeTokens, 
  getThemeCssVariables,
  SplitHeading,
  getHeadingFontClass,
  getBodyFontClass
} from '../../utils/themeTokens';
import { AutoFitImage } from '../common/AutoFitImage';
import { 
  Palette, 
  Sparkles, 
  Eye, 
  RotateCcw, 
  Film, 
  Heart, 
  PartyPopper, 
  Crown, 
  Smile, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Type, 
  Zap, 
  Image as ImageIcon, 
  Sliders, 
  ArrowLeft, 
  ArrowRight,
  Sun,
  Maximize2,
  Box,
  AlertTriangle
} from 'lucide-react';

interface CustomizationStudioProps {
  draft: BirthdayExperienceDraft;
  onUpdate: (fields: Partial<BirthdayExperienceDraft>) => void;
  onPreview: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const CustomizationStudio: React.FC<CustomizationStudioProps> = ({
  draft,
  onUpdate,
  onPreview,
  onNext,
  onBack,
}) => {
  const currentTemplate = draft.template || 'cinema';
  const currentTheme = draft.theme || TEMPLATES.cinema.defaultTheme;
  const customization = draft.customization || DEFAULT_CUSTOMIZATION[currentTemplate];

  const samplePhoto = (draft.photos && draft.photos.length > 0 && draft.photos[0].previewUrl)
    ? draft.photos[0]
    : {
        id: 'sample-moment',
        previewUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
        caption: 'Signature Memory',
        location: 'Golden Coast',
        year: '2024',
      };

  // Accordion active sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    mood: true,
    colors: true,
    accentGlow: false,
    typography: false,
    motionParticles: false,
    photoStyle: false,
    sectionTitles: false,
  });

  // Reset confirmation modal state
  const [showResetModal, setShowResetModal] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateCustomization = (updates: Partial<ExperienceCustomization>) => {
    onUpdate({
      customization: {
        ...customization,
        ...updates,
      },
    });
  };

  const handleSelectTemplate = (tpl: ExperienceTemplate) => {
    const defTheme = TEMPLATES[tpl].defaultTheme;
    const defCust = DEFAULT_CUSTOMIZATION[tpl];
    onUpdate({
      template: tpl,
      theme: defTheme,
      customization: defCust,
    });
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = QUICK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onUpdate({
      // Presets MUST NOT change the selected template
      theme: preset.theme,
      customization: {
        ...preset.customization,
        // Retain creator's personal section titles if entered
        sectionTitles: customization.sectionTitles,
        occasion: customization.occasion,
        customOccasion: customization.customOccasion,
      },
    });
  };

  const handleResetToTemplateDefault = () => {
    const defTheme = TEMPLATES[currentTemplate].defaultTheme;
    const defCust = DEFAULT_CUSTOMIZATION[currentTemplate];
    onUpdate({
      theme: defTheme,
      customization: {
        ...defCust,
        sectionTitles: customization.sectionTitles,
        occasion: customization.occasion,
        customOccasion: customization.customOccasion,
      },
    });
  };

  const handleConfirmResetAll = () => {
    const defTheme = TEMPLATES[currentTemplate].defaultTheme;
    const defCust = DEFAULT_CUSTOMIZATION[currentTemplate];
    onUpdate({
      theme: defTheme,
      customization: defCust,
    });
    setShowResetModal(false);
  };

  const tokens = deriveThemeTokens(currentTemplate, currentTheme, customization);

  const MOOD_OPTIONS: Array<{
    id: ExperienceMood;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'emotional',
      title: 'EMOTIONAL',
      description: 'Heartfelt, nostalgic, and deeply personal storytelling.',
      icon: Heart,
    },
    {
      id: 'cinematic',
      title: 'CINEMATIC',
      description: 'Theatrical grandeur, dramatic pacing, and deep contrast.',
      icon: Film,
    },
    {
      id: 'energetic',
      title: 'ENERGETIC',
      description: 'Dynamic momentum, upbeat rhythm, and high-impact motion.',
      icon: Zap,
    },
    {
      id: 'elegant',
      title: 'ELEGANT',
      description: 'Refined minimalism, serene spacing, and luxury grace.',
      icon: Crown,
    },
    {
      id: 'fun',
      title: 'FUN',
      description: 'Playful, joyful, affectionate, and full of smiles.',
      icon: Smile,
    },
  ];

  const HEADING_OPTIONS: Array<{ id: HeadingStyle; label: string; sample: string; fontClass: string }> = [
    { id: 'bold-cinematic', label: 'Bold Cinematic', sample: 'MOVIE POSTER DISPLAY', fontClass: 'font-cinzel font-black uppercase' },
    { id: 'classic-serif', label: 'Classic Serif', sample: 'Timeless Literary Elegance', fontClass: 'font-serif font-bold' },
    { id: 'modern-editorial', label: 'Modern Editorial', sample: 'CONTEMPORARY IMPACT', fontClass: 'font-sans font-black uppercase tracking-tight' },
    { id: 'luxury', label: 'Luxury Display', sample: 'REFINED HAUTE SALON', fontClass: 'font-cinzel font-light tracking-[0.24em] uppercase' },
  ];

  const BODY_OPTIONS: Array<{ id: BodyStyle; label: string; sample: string }> = [
    { id: 'clean', label: 'Clean Sans', sample: 'Effortlessly readable modern sans-serif typography.' },
    { id: 'editorial', label: 'Editorial Serif', sample: 'Warm, literary prose with subtle italic depth.' },
    { id: 'minimal', label: 'Minimal Light', sample: 'Spacious, refined, quiet minimalist styling.' },
  ];

  const PHOTO_STYLES: Array<{ id: PhotoPresentationStyle; label: string; desc: string }> = [
    { id: 'cinematic', label: 'Cinematic Anamorphic', desc: '16:9 widescreen master framing with subtle ambient vignette' },
    { id: 'editorial', label: 'Editorial Magazine', desc: 'Curated portrait spacing with clean gallery mat borders' },
    { id: 'film-strip', label: 'Film Strip', desc: 'Sprocket frame borders and classic 35mm film reel markers' },
    { id: 'polaroid', label: 'Nostalgic Polaroid', desc: 'Classic white photographic card with candid keepsake charm' },
    { id: 'fullscreen', label: 'Expansive Fullscreen', desc: 'Edge-to-edge immersive view with dramatic depth glow' },
  ];

  const OCCASIONS: Array<{ id: OccasionType; label: string }> = [
    { id: 'birthday', label: 'Standard Birthday' },
    { id: 'milestone', label: 'Milestone Year' },
    { id: '18th', label: '18th Birthday' },
    { id: '21st', label: '21st Birthday' },
    { id: '25th', label: '25th Quarter Century' },
    { id: '30th', label: '30th Milestone' },
    { id: '40th', label: '40th Milestone' },
    { id: '50th', label: '50th Jubilee' },
    { id: 'other', label: 'Custom Occasion...' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in text-white">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#242424]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#2A2A2A] text-xs font-mono text-[#E50914] uppercase tracking-widest mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>STEP 07 · THE CREATIVE STUDIO</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            DIRECT YOUR EXPERIENCE
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Customise the visual world, emotional mood, colour palette, typography, and motion energy of {draft.recipientName || 'their'}'s premiere.
          </p>
        </div>

        {/* Global Reset Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleResetToTemplateDefault}
            className="px-3.5 py-2 rounded-xl bg-[#141414] border border-[#2B2B2B] hover:border-neutral-500 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            title="Reset colours and controls to template defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET CUSTOMIZATION</span>
          </button>
        </div>
      </div>

      {/* Quick Curated Director Presets */}
      <div className="bg-[#101010] border border-[#242424] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Curated Director Presets</span>
          </span>
          <span className="text-[11px] text-neutral-500">Tap to apply complete aesthetic</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {QUICK_PRESETS.map((preset) => {
            const isActive =
              draft.template === preset.template &&
              customization.mood === preset.customization.mood &&
              currentTheme.primary.toLowerCase() === preset.theme.primary.toLowerCase();

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-[#E50914] bg-[#1A1A1A] ring-1 ring-[#E50914]/50 shadow-md'
                    : 'border-[#262626] bg-[#141414] hover:border-neutral-500 hover:bg-[#181818]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-white truncate">
                      {preset.name}
                    </span>
                    {isActive && <Check className="w-3 h-3 text-[#E50914] shrink-0" />}
                  </div>
                  <span className="text-[9px] font-mono text-neutral-400 block truncate">
                    {preset.subtitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.theme.background }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.theme.primary }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.theme.secondary }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION A: TEMPLATE                                      */}
      {/* ======================================================== */}
      <div className="bg-[#101010] border border-[#242424] rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-[#E50914]">
              A
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-white">VISUAL TEMPLATE</h3>
              <p className="text-xs text-neutral-400">Controls the fundamental visual personality and architectural foundation.</p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#E50914] uppercase tracking-wider font-semibold">
            {TEMPLATES[currentTemplate].name} ACTIVE
          </span>
        </div>

        <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['cinema', 'memories', 'celebration', 'elegance'] as ExperienceTemplate[]).map((tpl) => {
            const isSelected = currentTemplate === tpl;
            const def = TEMPLATES[tpl];
            return (
              <button
                key={tpl}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50 shadow-lg'
                    : 'border-[#262626] bg-[#121212] hover:border-neutral-500 hover:bg-[#161616]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-cinzel font-bold text-sm text-white">
                    {def.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#E50914]" />}
                </div>
                <span className="text-[11px] text-neutral-400 font-mono block">
                  {def.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION B: MOOD                                          */}
      {/* ======================================================== */}
      <div className="bg-[#101010] border border-[#242424] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('mood')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#141414] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-[#E50914]">
              B
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-white">HOW SHOULD THIS EXPERIENCE FEEL?</h3>
              <p className="text-xs text-neutral-400">Sets the emotional tone for AI storytelling, transitions, and energy.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#E50914] uppercase tracking-wider font-semibold">
              {customization.mood.toUpperCase()}
            </span>
            {openSections.mood ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </div>
        </button>

        {openSections.mood && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#1C1C1C]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3">
              {MOOD_OPTIONS.map((moodOpt) => {
                const isSelected = customization.mood === moodOpt.id;
                const Icon = moodOpt.icon;
                return (
                  <button
                    key={moodOpt.id}
                    type="button"
                    onClick={() => updateCustomization({ mood: moodOpt.id })}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50 shadow-md'
                        : 'border-[#242424] bg-[#121212] hover:border-neutral-500 hover:bg-[#161616]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#E50914]' : 'text-neutral-400'}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#E50914]" />}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider block text-white mb-1">
                        {moodOpt.title}
                      </span>
                      <p className="text-[11px] text-neutral-400 leading-snug">
                        {moodOpt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION C: COLOURS                                       */}
      {/* ======================================================== */}
      <div className="bg-[#101010] border border-[#242424] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('colors')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#141414] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-[#E50914]">
              C
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-white">COLOUR PALETTE</h3>
              <p className="text-xs text-neutral-400">Controls background canvas, primary split highlights, and secondary typography.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: currentTheme.background }} />
              <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: currentTheme.primary }} />
              <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: currentTheme.secondary }} />
            </div>
            {openSections.colors ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </div>
        </button>

        {openSections.colors && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#1C1C1C] space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
              {/* Background Colour */}
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white block">
                  1. Background Colour
                </span>
                <div className="flex items-center gap-3">
                  <label className="relative w-11 h-11 rounded-lg border border-white/20 overflow-hidden cursor-pointer shrink-0">
                    <input
                      type="color"
                      value={currentTheme.background.startsWith('#') && currentTheme.background.length === 7 ? currentTheme.background : '#080808'}
                      onChange={(e) => onUpdate({ theme: { ...currentTheme, background: e.target.value } })}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: currentTheme.background }} />
                  </label>
                  <input
                    type="text"
                    value={currentTheme.background}
                    maxLength={7}
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      if (!val.startsWith('#')) val = '#' + val;
                      onUpdate({ theme: { ...currentTheme, background: val } });
                    }}
                    className="w-full bg-[#1A1A1A] border border-[#2C2C2C] focus:border-[#E50914] rounded-lg px-3 py-2 text-xs font-mono text-white uppercase"
                  />
                </div>
              </div>

              {/* Primary Text Colour */}
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white block">
                  2. Primary Text Colour
                </span>
                <div className="flex items-center gap-3">
                  <label className="relative w-11 h-11 rounded-lg border border-white/20 overflow-hidden cursor-pointer shrink-0">
                    <input
                      type="color"
                      value={currentTheme.primary.startsWith('#') && currentTheme.primary.length === 7 ? currentTheme.primary : '#E50914'}
                      onChange={(e) => onUpdate({ theme: { ...currentTheme, primary: e.target.value } })}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: currentTheme.primary }} />
                  </label>
                  <input
                    type="text"
                    value={currentTheme.primary}
                    maxLength={7}
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      if (!val.startsWith('#')) val = '#' + val;
                      onUpdate({ theme: { ...currentTheme, primary: val } });
                    }}
                    className="w-full bg-[#1A1A1A] border border-[#2C2C2C] focus:border-[#E50914] rounded-lg px-3 py-2 text-xs font-mono text-white uppercase"
                  />
                </div>
              </div>

              {/* Secondary Text Colour */}
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-white block">
                  3. Secondary Text Colour
                </span>
                <div className="flex items-center gap-3">
                  <label className="relative w-11 h-11 rounded-lg border border-white/20 overflow-hidden cursor-pointer shrink-0">
                    <input
                      type="color"
                      value={currentTheme.secondary.startsWith('#') && currentTheme.secondary.length === 7 ? currentTheme.secondary : '#FFFFFF'}
                      onChange={(e) => onUpdate({ theme: { ...currentTheme, secondary: e.target.value } })}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: currentTheme.secondary }} />
                  </label>
                  <input
                    type="text"
                    value={currentTheme.secondary}
                    maxLength={7}
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      if (!val.startsWith('#')) val = '#' + val;
                      onUpdate({ theme: { ...currentTheme, secondary: val } });
                    }}
                    className="w-full bg-[#1A1A1A] border border-[#2C2C2C] focus:border-[#E50914] rounded-lg px-3 py-2 text-xs font-mono text-white uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION D: ACCENT, GLOW & BORDERS                        */}
      {/* ======================================================== */}
      <div className="bg-[#101010] border border-[#242424] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('accentGlow')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#141414] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-[#E50914]">
              D
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-white">ACCENT INTENSITY, GLOW & BORDERS</h3>
              <p className="text-xs text-neutral-400">Controls highlight strength, ambient lighting, and frame border weight.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#E50914] uppercase tracking-wider font-semibold">
              {customization.accentIntensity} · {customization.glowStyle} GLOW
            </span>
            {openSections.accentGlow ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </div>
        </button>

        {openSections.accentGlow && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#1C1C1C] space-y-6 pt-3">
            {/* Accent Intensity */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                ACCENT INTENSITY
              </span>
              <div className="grid grid-cols-3 gap-3">
                {(['subtle', 'balanced', 'bold'] as AccentIntensity[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateCustomization({ accentIntensity: level })}
                    className={`py-2.5 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                      customization.accentIntensity === level
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50 text-white font-bold'
                        : 'border-[#262626] bg-[#121212] hover:border-neutral-500 text-neutral-400'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider">{level}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Glow Style */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                GLOW STYLE
              </span>
              <div className="grid grid-cols-3 gap-3">
                {(['none', 'subtle', 'cinematic'] as GlowStyle[]).map((glow) => (
                  <button
                    key={glow}
                    type="button"
                    onClick={() => updateCustomization({ glowStyle: glow })}
                    className={`py-2.5 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                      customization.glowStyle === glow
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50 text-white font-bold'
                        : 'border-[#262626] bg-[#121212] hover:border-neutral-500 text-neutral-400'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider">{glow}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Border Style */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                BORDER STYLE
              </span>
              <div className="grid grid-cols-3 gap-3">
                {(['none', 'thin', 'cinematic'] as BorderStyle[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => updateCustomization({ borderStyle: b })}
                    className={`py-2.5 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                      customization.borderStyle === b
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50 text-white font-bold'
                        : 'border-[#262626] bg-[#121212] hover:border-neutral-500 text-neutral-400'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider">{b}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION E: TYPOGRAPHY                                    */}
      {/* ======================================================== */}
      <div className="bg-[#101010] border border-[#242424] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('typography')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#141414] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-[#E50914]">
              E
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-white">TYPOGRAPHY PRESETS</h3>
              <p className="text-xs text-neutral-400">Curated heading typography and body prose styling.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#E50914] uppercase tracking-wider font-semibold">
              {customization.headingStyle}
            </span>
            {openSections.typography ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </div>
        </button>

        {openSections.typography && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#1C1C1C] space-y-6 pt-3">
            {/* Heading Style */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                HEADING STYLE
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HEADING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateCustomization({ headingStyle: opt.id })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      customization.headingStyle === opt.id
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50'
                        : 'border-[#262626] bg-[#121212] hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-[#E50914] uppercase">{opt.label}</span>
                      {customization.headingStyle === opt.id && <Check className="w-3.5 h-3.5 text-[#E50914]" />}
                    </div>
                    <span className={`text-base text-white block ${opt.fontClass}`}>
                      {opt.sample}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Body Style */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                BODY PROSE STYLE
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BODY_OPTIONS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => updateCustomization({ bodyStyle: b.id })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      customization.bodyStyle === b.id
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50'
                        : 'border-[#262626] bg-[#121212] hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{b.label}</span>
                      {customization.bodyStyle === b.id && <Check className="w-3 h-3 text-[#E50914]" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {b.sample}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION F: MOTION & PARTICLES                            */}
      {/* ======================================================== */}
      <div className="bg-[#101010] border border-[#242424] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('motionParticles')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#141414] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-[#E50914]">
              F
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-white">MOTION ENERGY & PARTICLES</h3>
              <p className="text-xs text-neutral-400">Controls animation velocity, 3D vault rotation speed, and particle density.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#E50914] uppercase tracking-wider font-semibold">
              {customization.motionEnergy} MOTION · {customization.particleAtmosphere} PARTICLES
            </span>
            {openSections.motionParticles ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </div>
        </button>

        {openSections.motionParticles && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#1C1C1C] space-y-6 pt-3">
            {/* Motion Energy */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                ANIMATION ENERGY
              </span>
              <div className="grid grid-cols-3 gap-3">
                {(['subtle', 'cinematic', 'epic'] as MotionEnergy[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateCustomization({ motionEnergy: m })}
                    className={`py-2.5 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                      customization.motionEnergy === m
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50 text-white font-bold'
                        : 'border-[#262626] bg-[#121212] hover:border-neutral-500 text-neutral-400'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Particle Atmosphere */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                PARTICLE ATMOSPHERE
              </span>
              <div className="grid grid-cols-3 gap-3">
                {(['minimal', 'cinematic', 'intense'] as ParticleAtmosphere[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateCustomization({ particleAtmosphere: p })}
                    className={`py-2.5 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                      customization.particleAtmosphere === p
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50 text-white font-bold'
                        : 'border-[#262626] bg-[#121212] hover:border-neutral-500 text-neutral-400'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider">{p}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION G: PHOTO STYLE & HERO FOCUS                      */}
      {/* ======================================================== */}
      <div className="bg-[#101010] border border-[#242424] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('photoStyle')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#141414] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-[#E50914]">
              G
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-white">PHOTO PRESENTATION & HERO FOCUS</h3>
              <p className="text-xs text-neutral-400">Controls frame presentation styling and hero focal alignment.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#E50914] uppercase tracking-wider font-semibold">
              {customization.photoStyle} · FOCUS: {customization.heroFocus}
            </span>
            {openSections.photoStyle ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </div>
        </button>

        {openSections.photoStyle && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#1C1C1C] space-y-6 pt-3">
            {/* Photo Presentation Style */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                PHOTO PRESENTATION STYLE
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PHOTO_STYLES.map((styleOpt) => (
                  <button
                    key={styleOpt.id}
                    type="button"
                    onClick={() => updateCustomization({ photoStyle: styleOpt.id })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      customization.photoStyle === styleOpt.id
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50'
                        : 'border-[#262626] bg-[#121212] hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{styleOpt.label}</span>
                      {customization.photoStyle === styleOpt.id && <Check className="w-3.5 h-3.5 text-[#E50914]" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug">
                      {styleOpt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Style Demonstration Frame */}
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#242424] space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span className="uppercase tracking-wider flex items-center gap-1.5 text-neutral-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>ACTIVE PRESENTATION PREVIEW · {customization.photoStyle.toUpperCase()}</span>
                </span>
                <span className="text-[10px] text-neutral-500">Live Render</span>
              </div>

              {/* Dynamic mini preview according to photoStyle */}
              <div className="flex justify-center p-3 sm:p-5 bg-[#050505] rounded-xl border border-white/5 overflow-hidden">
                {customization.photoStyle === 'polaroid' ? (
                  <div className="relative bg-[#FAF8F5] text-[#1c1917] p-3 pb-6 rounded-[2px] shadow-2xl border border-[#e8e4dc] max-w-[240px] w-full transform -rotate-1">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-black rounded-[2px] mb-2 border border-black/15 shadow-inner">
                      <AutoFitImage src={samplePhoto.previewUrl} alt={samplePhoto.caption} focalPoint={customization.heroFocus} />
                    </div>
                    <div 
                      className="font-serif italic font-bold text-xs text-[#1c1917] truncate leading-tight"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {samplePhoto.caption}
                    </div>
                    <div className="text-[9px] font-mono text-[#78716c] truncate mt-0.5">
                      {samplePhoto.location || 'Instant Polaroid'}
                    </div>
                  </div>
                ) : customization.photoStyle === 'film-strip' ? (
                  <div className="bg-[#090909] border border-[#282828] rounded-xl p-2.5 max-w-[290px] w-full shadow-2xl space-y-1.5">
                    <div className="h-3 bg-[#0E0E0E] px-2 flex items-center gap-2 overflow-hidden select-none">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={`ms-top-${i}`} className="w-2.5 h-1.5 rounded-[1px] bg-[#1a1a1a] border border-[#333] shrink-0" />
                      ))}
                    </div>
                    <div className="aspect-[16/10] w-full overflow-hidden bg-black rounded relative">
                      <AutoFitImage src={samplePhoto.previewUrl} alt={samplePhoto.caption} focalPoint={customization.heroFocus} />
                      <div className="absolute top-1 left-1 text-[8px] font-mono px-1 py-0.5 rounded bg-black/75 text-white">
                        ▸ 35MM · 01A
                      </div>
                    </div>
                    <div className="h-3 bg-[#0E0E0E] px-2 flex items-center gap-2 overflow-hidden select-none">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={`ms-bot-${i}`} className="w-2.5 h-1.5 rounded-[1px] bg-[#1a1a1a] border border-[#333] shrink-0" />
                      ))}
                    </div>
                  </div>
                ) : customization.photoStyle === 'fullscreen' ? (
                  <div className="relative aspect-[21/9] w-full max-w-[360px] rounded-xl overflow-hidden bg-black border border-white/20 shadow-2xl">
                    <AutoFitImage src={samplePhoto.previewUrl} alt={samplePhoto.caption} focalPoint={customization.heroFocus} enableBackdropGlow={true} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 text-left">
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                        {samplePhoto.caption}
                      </div>
                      <div className="text-[9px] font-mono text-neutral-300">
                        IMMERSIVE FULLSCREEN MOMENT
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[16/10] w-full max-w-[280px] rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg">
                    <AutoFitImage src={samplePhoto.previewUrl} alt={samplePhoto.caption} focalPoint={customization.heroFocus} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 text-left text-xs font-semibold text-white truncate">
                      {samplePhoto.caption}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Focal Alignment */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                HERO IMAGE FOCAL ALIGNMENT
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {(['auto', 'center', 'top', 'bottom', 'left', 'right'] as HeroFocus[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => updateCustomization({ heroFocus: f })}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      customization.heroFocus === f
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50 text-white font-bold'
                        : 'border-[#262626] bg-[#121212] hover:border-neutral-500 text-neutral-400'
                    }`}
                  >
                    <span className="text-xs uppercase">{f}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION H: OCCASION & SECTION TITLES                     */}
      {/* ======================================================== */}
      <div className="bg-[#101010] border border-[#242424] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('sectionTitles')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#141414] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#181818] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-[#E50914]">
              H
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-white">OCCASION & SECTION TITLES</h3>
              <p className="text-xs text-neutral-400">Customise the event occasion and section headings across the experience.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#E50914] uppercase tracking-wider font-semibold">
              {customization.occasion.toUpperCase()}
            </span>
            {openSections.sectionTitles ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </div>
        </button>

        {openSections.sectionTitles && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#1C1C1C] space-y-6 pt-3">
            {/* Occasion Selection */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                WHAT ARE YOU CELEBRATING?
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => updateCustomization({ occasion: occ.id })}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      customization.occasion === occ.id
                        ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50 text-white font-bold'
                        : 'border-[#262626] bg-[#121212] hover:border-neutral-500 text-neutral-400'
                    }`}
                  >
                    <span className="text-xs">{occ.label}</span>
                  </button>
                ))}
              </div>

              {customization.occasion === 'other' && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="e.g. Silver Jubilee, Friendship Day, Graduation..."
                    value={customization.customOccasion || ''}
                    onChange={(e) => updateCustomization({ customOccasion: e.target.value })}
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500"
                  />
                </div>
              )}
            </div>

            {/* Custom Section Titles */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                CUSTOM SECTION TITLES (OPTIONAL)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                    Inner Circle (Act III)
                  </label>
                  <input
                    type="text"
                    placeholder="Default: THE INNER CIRCLE"
                    value={customization.sectionTitles?.innerCircle || ''}
                    onChange={(e) => updateCustomization({
                      sectionTitles: { ...customization.sectionTitles, innerCircle: e.target.value },
                    })}
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                    Memory Sequence (Act IV)
                  </label>
                  <input
                    type="text"
                    placeholder="Default: THE MEMORY SEQUENCE"
                    value={customization.sectionTitles?.memories || ''}
                    onChange={(e) => updateCustomization({
                      sectionTitles: { ...customization.sectionTitles, memories: e.target.value },
                    })}
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                    3D Photo Vault (Act V)
                  </label>
                  <input
                    type="text"
                    placeholder="Default: THE 3D PHOTO VAULT"
                    value={customization.sectionTitles?.vault || ''}
                    onChange={(e) => updateCustomization({
                      sectionTitles: { ...customization.sectionTitles, vault: e.target.value },
                    })}
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                    Surprise Reveal (Act VI)
                  </label>
                  <input
                    type="text"
                    placeholder="Default: A SPECIAL SURPRISE MOMENT"
                    value={customization.sectionTitles?.surprise || ''}
                    onChange={(e) => updateCustomization({
                      sectionTitles: { ...customization.sectionTitles, surprise: e.target.value },
                    })}
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#E50914] rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* LIVE COMPACT PREVIEW STAGE                               */}
      {/* ======================================================== */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#E50914]" />
            <span>LIVE DIRECTOR STAGE PREVIEW</span>
          </span>
          <button
            type="button"
            onClick={onPreview}
            className="text-[#E50914] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Launch Fullscreen Preview</span>
            <span>→</span>
          </button>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-10 border transition-all duration-300 relative overflow-hidden shadow-2xl"
          style={{
            backgroundColor: tokens.background,
            borderColor: tokens.border,
            color: tokens.body,
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          {customization.glowStyle !== 'none' && (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[90px] pointer-events-none"
              style={{ backgroundColor: tokens.glowStrong }}
            />
          )}

          <div className="relative z-10 max-w-xl mx-auto text-center space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border"
              style={{
                borderColor: tokens.borderHighlight,
                backgroundColor: tokens.surface,
                color: tokens.secondary,
              }}
            >
              <span>{TEMPLATES[currentTemplate].name}</span>
              <span>·</span>
              <span style={{ color: tokens.primary }}>{customization.mood.toUpperCase()} MOOD</span>
            </div>

            <div className={`text-3xl sm:text-5xl font-black ${getHeadingFontClass(customization.headingStyle, currentTemplate)}`}>
              <span style={{ color: tokens.primary }}>HAPPY</span>{' '}
              <span style={{ color: tokens.secondary }}>BIRTHDAY,</span>
              <br />
              <span style={{ color: tokens.primary }}>{draft.recipientName || 'Alex'}</span>
            </div>

            <p
              className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${getBodyFontClass(customization.bodyStyle)}`}
              style={{ color: tokens.body }}
            >
              "Some people make the world brighter simply by being in it. Here is an immutable 24-hour film of your light."
            </p>

            {/* Dynamic Photo Presentation Visual Preview */}
            <div className="pt-2 pb-1 flex justify-center">
              {customization.photoStyle === 'polaroid' ? (
                <div className="bg-[#FAF8F5] text-[#1c1917] p-2.5 pb-5 rounded-[2px] shadow-2xl border border-[#e8e4dc] max-w-[200px] w-full transform -rotate-1">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-black rounded-[1px] mb-1.5 border border-black/15 shadow-inner">
                    <AutoFitImage src={samplePhoto.previewUrl} alt={samplePhoto.caption} focalPoint={customization.heroFocus} />
                  </div>
                  <div 
                    className="font-serif italic font-bold text-[11px] text-[#1c1917] truncate leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {samplePhoto.caption}
                  </div>
                </div>
              ) : customization.photoStyle === 'film-strip' ? (
                <div className="bg-[#090909] border border-[#282828] rounded-lg p-2 max-w-[220px] w-full shadow-2xl space-y-1">
                  <div className="h-2.5 bg-[#0E0E0E] px-1 flex items-center gap-1.5 overflow-hidden">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={`bp-top-${i}`} className="w-2 h-1 rounded-[1px] bg-[#1a1a1a] border border-[#333] shrink-0" />
                    ))}
                  </div>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-black rounded relative">
                    <AutoFitImage src={samplePhoto.previewUrl} alt={samplePhoto.caption} focalPoint={customization.heroFocus} />
                    <div className="absolute top-1 left-1 text-[7px] font-mono px-1 py-0.5 rounded bg-black/75 text-white">
                      ▸ 35MM · 01A
                    </div>
                  </div>
                  <div className="h-2.5 bg-[#0E0E0E] px-1 flex items-center gap-1.5 overflow-hidden">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={`bp-bot-${i}`} className="w-2 h-1 rounded-[1px] bg-[#1a1a1a] border border-[#333] shrink-0" />
                    ))}
                  </div>
                </div>
              ) : customization.photoStyle === 'fullscreen' ? (
                <div className="relative aspect-[21/9] w-full max-w-[280px] rounded-xl overflow-hidden bg-black border border-white/20 shadow-2xl">
                  <AutoFitImage src={samplePhoto.previewUrl} alt={samplePhoto.caption} focalPoint={customization.heroFocus} enableBackdropGlow={true} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <div className="text-[10px] font-bold text-white uppercase tracking-wider truncate">
                      {samplePhoto.caption}
                    </div>
                    <div className="text-[8px] font-mono text-neutral-300">
                      IMMERSIVE VIEWPORT
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[16/10] w-full max-w-[220px] rounded-lg overflow-hidden bg-black border border-white/10 shadow-lg">
                  <AutoFitImage src={samplePhoto.previewUrl} alt={samplePhoto.caption} focalPoint={customization.heroFocus} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-1.5 left-2 right-2 text-left text-[11px] font-semibold text-white truncate">
                    {samplePhoto.caption}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono">
              <span
                className="px-2.5 py-1 rounded-lg border text-[11px]"
                style={{
                  backgroundColor: tokens.surface,
                  borderColor: tokens.borderHighlight,
                  color: tokens.primary,
                }}
              >
                {customization.accentIntensity.toUpperCase()} ACCENT
              </span>
              <span
                className="px-2.5 py-1 rounded-lg border text-[11px]"
                style={{
                  backgroundColor: tokens.surface,
                  borderColor: tokens.border,
                  color: tokens.secondary,
                }}
              >
                {customization.motionEnergy.toUpperCase()} MOTION
              </span>
              <span
                className="px-2.5 py-1 rounded-lg border text-[11px]"
                style={{
                  backgroundColor: tokens.surface,
                  borderColor: tokens.border,
                  color: tokens.secondary,
                }}
              >
                {customization.photoStyle.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* COMPACT CUSTOMIZATION SUMMARY                            */}
      {/* ======================================================== */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-white font-bold uppercase">{TEMPLATES[currentTemplate].name}</span>
          <span>·</span>
          <span>{customization.mood.toUpperCase()}</span>
          <span>·</span>
          <span>{customization.headingStyle}</span>
          <span>·</span>
          <span>{customization.motionEnergy} MOTION</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500">PALETTE</span>
          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: currentTheme.background }} title={currentTheme.background} />
          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: currentTheme.primary }} title={currentTheme.primary} />
          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: currentTheme.secondary }} title={currentTheme.secondary} />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#242424]">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#333333] hover:bg-[#181818] text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AI Story</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onPreview}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1C1C1C] border border-[#333333] hover:border-[#E50914] text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-[#E50914]" />
            <span>Full Preview</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#c90711] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all shadow-xl shadow-[#E50914]/25 hover:shadow-[#E50914]/40 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Proceed to Final Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reset All Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2E2E2E] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-cinzel text-lg font-bold text-white">Reset All Customization?</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              This will restore all visual customization (colours, mood, typography, motion, and photo presentation) to the template defaults. Your photos, messages, and recipient details will be completely preserved.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-[#1A1A1A] border border-[#2B2B2B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetAll}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
