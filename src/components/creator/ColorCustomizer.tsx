import React, { useState } from 'react';
import { ExperienceTemplate, ExperienceTheme } from '../../types';
import { TEMPLATES, deriveThemeTokens, SplitHeading } from '../../utils/themeTokens';
import { Palette, RotateCcw, Sparkles, Eye, Check } from 'lucide-react';

interface ColorCustomizerProps {
  template: ExperienceTemplate;
  theme: ExperienceTheme;
  recipientName?: string;
  onUpdateTheme: (theme: Partial<ExperienceTheme>) => void;
  onResetToDefault: () => void;
  onPreview?: () => void;
}

export const ColorCustomizer: React.FC<ColorCustomizerProps> = ({
  template,
  theme,
  recipientName = 'Alex',
  onUpdateTheme,
  onResetToDefault,
  onPreview,
}) => {
  const currentTemplateDef = TEMPLATES[template] || TEMPLATES.cinema;
  const tokens = deriveThemeTokens(template, theme);

  // Quick preset suggestions tailored for each template
  const PRESETS: Record<ExperienceTemplate, Array<{ label: string; theme: ExperienceTheme }>> = {
    cinema: [
      {
        label: 'Classic Red & White',
        theme: { background: '#080808', primary: '#E50914', secondary: '#FFFFFF' },
      },
      {
        label: 'Golden Hour Premiere',
        theme: { background: '#0A0806', primary: '#F59E0B', secondary: '#FEF3C7' },
      },
      {
        label: 'Noir Cyan Spotlight',
        theme: { background: '#050709', primary: '#06B6D4', secondary: '#F0FDFA' },
      },
      {
        label: 'Royal Velvet Film',
        theme: { background: '#09050B', primary: '#A855F7', secondary: '#FAF5FF' },
      },
    ],
    memories: [
      {
        label: 'Warm Sepia Archive',
        theme: { background: '#0C0A09', primary: '#F59E0B', secondary: '#F5F5F4' },
      },
      {
        label: 'Rose Quartz Keepsake',
        theme: { background: '#0D080A', primary: '#FB7185', secondary: '#FFF1F2' },
      },
      {
        label: 'Vintage Amber Glow',
        theme: { background: '#0B0907', primary: '#D97706', secondary: '#FEF3C7' },
      },
      {
        label: 'Emerald Milestone',
        theme: { background: '#060B08', primary: '#10B981', secondary: '#ECFDF5' },
      },
    ],
    celebration: [
      {
        label: 'Vibrant Crimson Night',
        theme: { background: '#09090B', primary: '#EF4444', secondary: '#FFFFFF' },
      },
      {
        label: 'Electric Neon Violet',
        theme: { background: '#090610', primary: '#8B5CF6', secondary: '#FFFFFF' },
      },
      {
        label: 'Sunset Sparkle Burst',
        theme: { background: '#0B0606', primary: '#F97316', secondary: '#FFF7ED' },
      },
      {
        label: 'Cyber Pink Celebration',
        theme: { background: '#0B0509', primary: '#EC4899', secondary: '#FDF2F8' },
      },
    ],
    elegance: [
      {
        label: 'Champagne & Obsidian',
        theme: { background: '#050505', primary: '#D4AF37', secondary: '#F3F4F6' },
      },
      {
        label: 'Platinum & Moonstone',
        theme: { background: '#060608', primary: '#94A3B8', secondary: '#FFFFFF' },
      },
      {
        label: 'Fine Ivory & Bronze',
        theme: { background: '#080705', primary: '#CA8A04', secondary: '#FAFAF9' },
      },
      {
        label: 'Midnight Sapphire',
        theme: { background: '#04060A', primary: '#38BDF8', secondary: '#F0F9FF' },
      },
    ],
  };

  const handleHexChange = (key: keyof ExperienceTheme, val: string) => {
    let clean = val.trim();
    if (!clean.startsWith('#')) {
      clean = '#' + clean;
    }
    // Update immediately if valid or partial hex
    onUpdateTheme({ [key]: clean });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title & Reset header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#E50914] uppercase tracking-widest mb-1">
            <Palette className="w-3.5 h-3.5" />
            <span>CUSTOMISE YOUR COLOURS</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
            EXPERIENCE PALETTE & TYPOGRAPHY
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Active Visual Template: <span className="text-white font-semibold">{currentTemplateDef.name}</span> ({currentTemplateDef.subtitle})
          </p>
        </div>

        <button
          type="button"
          onClick={onResetToDefault}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161616] border border-[#2B2B2B] hover:border-neutral-500 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to {currentTemplateDef.name} Defaults</span>
        </button>
      </div>

      {/* Main 3 Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Background Colour */}
        <div className="bg-[#121212] border border-[#242424] hover:border-neutral-600 rounded-2xl p-5 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              1. Background Colour
            </span>
            <span className="text-[10px] font-mono text-neutral-400 uppercase">
              Main canvas
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Color Swatch & Native Picker */}
            <label className="relative w-12 h-12 rounded-xl border border-white/20 overflow-hidden cursor-pointer shrink-0 shadow-inner group">
              <input
                type="color"
                value={theme.background.startsWith('#') && theme.background.length === 7 ? theme.background : '#080808'}
                onChange={(e) => onUpdateTheme({ background: e.target.value })}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <div
                className="w-full h-full transition-transform group-hover:scale-105"
                style={{ backgroundColor: theme.background }}
              />
            </label>

            {/* Hex Input */}
            <div className="flex-1">
              <input
                type="text"
                value={theme.background}
                maxLength={7}
                onChange={(e) => handleHexChange('background', e.target.value)}
                placeholder="#080808"
                className="w-full bg-[#181818] border border-[#2C2C2C] focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white uppercase tracking-wider"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">
                Controls depth & atmosphere
              </span>
            </div>
          </div>
        </div>

        {/* 2. Primary Text Colour */}
        <div className="bg-[#121212] border border-[#242424] hover:border-neutral-600 rounded-2xl p-5 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              2. Primary Text Colour
            </span>
            <span className="text-[10px] font-mono text-[#E50914] uppercase">
              Hero split & accents
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Color Swatch & Native Picker */}
            <label className="relative w-12 h-12 rounded-xl border border-white/20 overflow-hidden cursor-pointer shrink-0 shadow-inner group">
              <input
                type="color"
                value={theme.primary.startsWith('#') && theme.primary.length === 7 ? theme.primary : '#E50914'}
                onChange={(e) => onUpdateTheme({ primary: e.target.value })}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <div
                className="w-full h-full transition-transform group-hover:scale-105"
                style={{ backgroundColor: theme.primary }}
              />
            </label>

            {/* Hex Input */}
            <div className="flex-1">
              <input
                type="text"
                value={theme.primary}
                maxLength={7}
                onChange={(e) => handleHexChange('primary', e.target.value)}
                placeholder="#E50914"
                className="w-full bg-[#181818] border border-[#2C2C2C] focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white uppercase tracking-wider"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">
                First word in split titles
              </span>
            </div>
          </div>
        </div>

        {/* 3. Secondary Text Colour */}
        <div className="bg-[#121212] border border-[#242424] hover:border-neutral-600 rounded-2xl p-5 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              3. Secondary Text Colour
            </span>
            <span className="text-[10px] font-mono text-neutral-300 uppercase">
              Emphasis & titles
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Color Swatch & Native Picker */}
            <label className="relative w-12 h-12 rounded-xl border border-white/20 overflow-hidden cursor-pointer shrink-0 shadow-inner group">
              <input
                type="color"
                value={theme.secondary.startsWith('#') && theme.secondary.length === 7 ? theme.secondary : '#FFFFFF'}
                onChange={(e) => onUpdateTheme({ secondary: e.target.value })}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <div
                className="w-full h-full transition-transform group-hover:scale-105"
                style={{ backgroundColor: theme.secondary }}
              />
            </label>

            {/* Hex Input */}
            <div className="flex-1">
              <input
                type="text"
                value={theme.secondary}
                maxLength={7}
                onChange={(e) => handleHexChange('secondary', e.target.value)}
                placeholder="#FFFFFF"
                className="w-full bg-[#181818] border border-[#2C2C2C] focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white uppercase tracking-wider"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">
                Second word in split titles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Suggestions for Active Template */}
      <div className="bg-[#0E0E0E] border border-[#202020] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Curated {currentTemplateDef.name} Palettes</span>
          </span>
          <span className="text-[10px] text-neutral-500">Click to apply instantly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS[template]?.map((preset, idx) => {
            const isMatch =
              theme.background.toLowerCase() === preset.theme.background.toLowerCase() &&
              theme.primary.toLowerCase() === preset.theme.primary.toLowerCase() &&
              theme.secondary.toLowerCase() === preset.theme.secondary.toLowerCase();

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onUpdateTheme(preset.theme)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isMatch
                    ? 'border-[#E50914] bg-[#161616] ring-1 ring-[#E50914]/50'
                    : 'border-[#242424] bg-[#121212] hover:border-neutral-500 hover:bg-[#161616]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-white truncate pr-1">
                    {preset.label}
                  </span>
                  {isMatch && <Check className="w-3.5 h-3.5 text-[#E50914] shrink-0" />}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.theme.background }}
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.theme.primary }}
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.theme.secondary }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview Window */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#E50914]" />
            <span>LIVE PALETTE & SPLIT HEADING PREVIEW</span>
          </span>
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="text-[#E50914] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Launch Fullscreen Preview</span>
              <span>→</span>
            </button>
          )}
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
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[80px] pointer-events-none"
            style={{ backgroundColor: tokens.glowStrong }}
          />

          <div className="relative z-10 max-w-xl mx-auto text-center space-y-4">
            {/* Template Tag */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border"
              style={{
                borderColor: tokens.borderHighlight,
                backgroundColor: tokens.surface,
                color: tokens.secondary,
              }}
            >
              <span>{currentTemplateDef.name}</span>
              <span>·</span>
              <span style={{ color: tokens.primary }}>ACT I · PROLOGUE</span>
            </div>

            {/* Split Heading Demo */}
            <div className={`text-3xl sm:text-5xl font-black ${currentTemplateDef.headingFontClass}`}>
              <span style={{ color: tokens.primary }}>HAPPY</span>{' '}
              <span style={{ color: tokens.secondary }}>BIRTHDAY,</span>
              <br />
              <span style={{ color: tokens.primary }}>{recipientName}</span>
            </div>

            {/* Derived Supporting Text Demo */}
            <p
              className="text-xs sm:text-sm font-serif italic max-w-md mx-auto leading-relaxed"
              style={{ color: tokens.body }}
            >
              "Some people make the world brighter simply by being in it. Here is an immutable 24-hour film of your light."
            </p>

            {/* Sample Split Secondary Heading */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono">
              <span
                className="px-2.5 py-1 rounded-lg border text-[11px]"
                style={{
                  backgroundColor: tokens.surface,
                  borderColor: tokens.borderHighlight,
                  color: tokens.primary,
                }}
              >
                Primary Accent
              </span>
              <span
                className="px-2.5 py-1 rounded-lg border text-[11px]"
                style={{
                  backgroundColor: tokens.surface,
                  borderColor: tokens.border,
                  color: tokens.secondary,
                }}
              >
                Secondary Text
              </span>
              <span
                className="text-[11px]"
                style={{ color: tokens.muted }}
              >
                Derived Body & Muted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
