import React from 'react';
import { BirthdayExperienceDraft, ExperienceTemplate, ExperienceTheme } from '../../types';
import { TEMPLATES, TemplateDefinition } from '../../utils/themeTokens';
import { ColorCustomizer } from './ColorCustomizer';
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';

interface ThemeCustomizationStepProps {
  draft: BirthdayExperienceDraft;
  onUpdate: (fields: Partial<BirthdayExperienceDraft>) => void;
  onPreview: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const ThemeCustomizationStep: React.FC<ThemeCustomizationStepProps> = ({
  draft,
  onUpdate,
  onPreview,
  onNext,
  onBack,
}) => {
  const currentTemplate = draft.template || 'cinema';
  const currentTheme = draft.theme || TEMPLATES.cinema.defaultTheme;

  const handleSelectTemplate = (tpl: ExperienceTemplate) => {
    // If switching template, apply that template's default colors
    const defTheme = TEMPLATES[tpl].defaultTheme;
    onUpdate({
      template: tpl,
      theme: defTheme,
    });
  };

  const handleUpdateTheme = (themeUpdates: Partial<ExperienceTheme>) => {
    onUpdate({
      theme: {
        ...currentTheme,
        ...themeUpdates,
      },
    });
  };

  const handleResetToDefault = () => {
    const defTheme = TEMPLATES[currentTemplate].defaultTheme;
    onUpdate({
      theme: defTheme,
    });
  };

  const templateList: TemplateDefinition[] = [
    TEMPLATES.cinema,
    TEMPLATES.memories,
    TEMPLATES.celebration,
    TEMPLATES.elegance,
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fade-in">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#2A2A2A] text-xs font-mono text-[#E50914] uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STEP 07 · COLOUR & PALETTE CUSTOMIZATION</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-tight uppercase [text-wrap:balance]">
          CUSTOMISE YOUR EXPERIENCE
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]">
          Switch visual template personalities and personalize your background, primary highlight, and secondary typography colours.
        </p>
      </div>

      {/* Quick Visual Template Switcher Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="uppercase tracking-wider">VISUAL TEMPLATE SELECTION</span>
          <span className="text-[11px] text-neutral-500">Click to switch template</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {templateList.map((tpl) => {
            const isSelected = currentTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#E50914] bg-[#141414] ring-1 ring-[#E50914]/50 shadow-lg shadow-[#E50914]/15'
                    : 'border-[#242424] bg-[#0E0E0E] hover:border-neutral-500 hover:bg-[#121212]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-cinzel font-bold text-sm text-white">
                    {tpl.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#E50914]" />}
                </div>
                <span className="text-[11px] text-neutral-400 font-mono block">
                  {tpl.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Three Main Color Controls & Live Preview */}
      <ColorCustomizer
        template={currentTemplate}
        theme={currentTheme}
        recipientName={draft.recipientName || 'Alex'}
        onUpdateTheme={handleUpdateTheme}
        onResetToDefault={handleResetToDefault}
        onPreview={onPreview}
      />

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#242424]">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#333333] hover:bg-[#181818] text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AI Story</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#c90711] text-white text-xs font-bold uppercase tracking-[0.16em] transition-all shadow-xl shadow-[#E50914]/25 hover:shadow-[#E50914]/40 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>CONTINUE TO FINAL REVIEW</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
