import React from 'react';
import { ExperienceTemplate, ExperienceTheme } from '../../types';
import { TEMPLATES, TemplateDefinition, deriveThemeTokens } from '../../utils/themeTokens';
import { Check, Sparkles, Film, Heart, PartyPopper, Crown, ArrowRight } from 'lucide-react';

interface TemplateSelectorStepProps {
  selectedTemplate: ExperienceTemplate;
  onSelectTemplate: (template: ExperienceTemplate) => void;
  onNext: () => void;
  onCancel: () => void;
}

const TEMPLATE_ICONS: Record<ExperienceTemplate, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  cinema: Film,
  memories: Heart,
  celebration: PartyPopper,
  elegance: Crown,
};

export const TemplateSelectorStep: React.FC<TemplateSelectorStepProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onNext,
  onCancel,
}) => {
  const templateList: TemplateDefinition[] = [
    TEMPLATES.cinema,
    TEMPLATES.memories,
    TEMPLATES.celebration,
    TEMPLATES.elegance,
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Step Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#2A2A2A] text-xs font-mono text-[#E50914] uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STEP 01 · EXPERIENCE ARCHITECTURE</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-tight uppercase mb-4 [text-wrap:balance]">
          CHOOSE YOUR VISUAL WORLD
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]">
          Every birthday story deserves its own cinematic language. Select the personality that best honors their story. You can fine-tune every colour in the next step.
        </p>
      </div>

      {/* 4 Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {templateList.map((tpl) => {
          const isSelected = selectedTemplate === tpl.id;
          const Icon = TEMPLATE_ICONS[tpl.id];
          const tokens = deriveThemeTokens(tpl.id, tpl.defaultTheme);

          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.id)}
              className={`group relative rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden border ${
                isSelected
                  ? 'border-[#E50914] ring-2 ring-[#E50914]/40 shadow-2xl shadow-[#E50914]/20 bg-[#121212] -translate-y-1'
                  : 'border-[#262626] bg-[#0E0E0E] hover:border-neutral-500 hover:bg-[#141414] hover:-translate-y-0.5'
              }`}
            >
              {/* Selected Badge in top corner */}
              <div className="absolute top-3 right-3 z-20">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#E50914] text-white shadow-md'
                      : 'bg-black/60 border border-white/20 text-transparent group-hover:border-white/40'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${isSelected ? 'stroke-[2.5]' : 'opacity-0'}`} />
                </div>
              </div>

              {/* Miniature Real Visual Preview Stage */}
              <div
                className="relative h-44 sm:h-48 w-full p-4 flex flex-col justify-between overflow-hidden border-b border-white/5"
                style={{ backgroundColor: tokens.background }}
              >
                {/* Subtle Ambient Radial Glow */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[45px] pointer-events-none"
                  style={{ backgroundColor: tokens.glowStrong }}
                />

                {/* Miniature Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className="text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider"
                    style={{
                      borderColor: tokens.borderHighlight,
                      color: tokens.secondary,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                    }}
                  >
                    {tpl.previewBadges[0]}
                  </span>
                  <Icon
                    className="w-4 h-4 transition-transform group-hover:scale-110"
                    style={{ color: tokens.primary }}
                  />
                </div>

                {/* Miniature Centerpiece / Typography */}
                <div className="relative z-10 my-auto text-center py-2">
                  <div className={`text-base sm:text-lg font-bold leading-tight ${tpl.headingFontClass}`}>
                    <span style={{ color: tokens.primary }}>{tpl.sampleHeading.primary}</span>{' '}
                    <span style={{ color: tokens.secondary }}>{tpl.sampleHeading.secondary}</span>
                  </div>
                  <div
                    className="text-[10px] mt-1 italic font-serif opacity-80"
                    style={{ color: tokens.muted }}
                  >
                    "{tpl.tagline}"
                  </div>
                </div>

                {/* Miniature Bottom Frame Mock */}
                <div className="relative z-10 flex items-center justify-between pt-1">
                  <div
                    className="text-[9px] font-mono tracking-widest uppercase"
                    style={{ color: tokens.primary }}
                  >
                    ● 24H PREMIERE
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                      style={{ backgroundColor: tokens.primary }}
                      title="Primary"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20"
                      style={{ backgroundColor: tokens.secondary }}
                      title="Secondary"
                    />
                  </div>
                </div>
              </div>

              {/* Template Information Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-cinzel text-lg font-bold text-white group-hover:text-white transition-colors">
                      {tpl.name}
                    </h3>
                    <span className="text-[11px] font-mono text-[#E50914] uppercase tracking-wider">
                      {tpl.subtitle}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                    {tpl.description}
                  </p>
                </div>

                {/* Default Palette Indicator */}
                <div className="pt-3 border-t border-[#202020] flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400 font-mono">Palette</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: tpl.defaultTheme.background }}
                      title="Background"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: tpl.defaultTheme.primary }}
                      title="Primary Highlight"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: tpl.defaultTheme.secondary }}
                      title="Secondary Accent"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#242424]">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#333333] hover:bg-[#181818] text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          Exit Studio
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#c90711] text-white text-xs font-bold uppercase tracking-[0.16em] transition-all shadow-xl shadow-[#E50914]/25 hover:shadow-[#E50914]/40 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>CONTINUE WITH {TEMPLATES[selectedTemplate].name}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
