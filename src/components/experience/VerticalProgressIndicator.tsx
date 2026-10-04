import React from 'react';

export interface SectionProgressItem {
  id: string;
  name: string;
  act: string;
}

interface VerticalProgressIndicatorProps {
  sections: SectionProgressItem[];
  activeSectionIndex: number;
  onSelectSection: (index: number) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export const VerticalProgressIndicator: React.FC<VerticalProgressIndicatorProps> = ({
  sections,
  activeSectionIndex,
  onSelectSection,
  primaryColor = '#E50914',
  secondaryColor = '#FFFFFF',
}) => {
  if (sections.length === 0) return null;

  const total = sections.length;
  const currentNum = String(Math.min(activeSectionIndex + 1, total)).padStart(2, '0');
  const totalNum = String(total).padStart(2, '0');
  const activeSection = sections[activeSectionIndex] || sections[0];

  return (
    <>
      {/* Desktop Floating Right Indicator */}
      <aside 
        aria-label="Story Progression"
        className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3 select-none pointer-events-auto"
      >
        {/* Current / Total Number Tag */}
        <div className="flex flex-col items-end text-right font-mono text-[11px] leading-tight pr-0.5">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white text-xs">{currentNum}</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-500">{totalNum}</span>
          </div>
          <span 
            className="text-[9px] uppercase tracking-[0.2em] font-semibold mt-0.5"
            style={{ color: primaryColor }}
          >
            {activeSection.name}
          </span>
        </div>

        {/* Thin Vertical Progress Line with Step Nodes */}
        <div className="relative flex flex-col items-center py-2 pr-1">
          {/* Continuous background track */}
          <div className="w-[1.5px] h-40 bg-neutral-800/80 rounded-full relative flex flex-col justify-between py-1">
            {/* Active filled line portion */}
            <div
              className="absolute top-0 left-0 w-full rounded-full transition-all duration-500 ease-out"
              style={{
                height: `${(activeSectionIndex / (total - 1 || 1)) * 100}%`,
                backgroundColor: primaryColor,
                boxShadow: `0 0 10px ${primaryColor}`,
              }}
            />

            {/* Individual Section Nodes */}
            {sections.map((sec, idx) => {
              const isActive = activeSectionIndex === idx;
              const isPast = activeSectionIndex >= idx;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSelectSection(idx)}
                  className="group relative -left-[3.5px] w-2 h-2 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center"
                  style={{
                    backgroundColor: isActive ? primaryColor : isPast ? secondaryColor : '#333333',
                    boxShadow: isActive ? `0 0 10px ${primaryColor}` : undefined,
                    transform: isActive ? 'scale(1.4)' : 'scale(1)',
                  }}
                  title={`${sec.act}: ${sec.name}`}
                >
                  {/* Floating tooltip on hover */}
                  <span className="absolute right-6 px-2 py-0.5 rounded bg-black/85 border border-white/10 text-[9px] font-mono text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                    {sec.act} · {sec.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile Subtle Compact Bottom-Right Pill */}
      <div 
        className="fixed bottom-3 right-3 z-30 lg:hidden px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 font-mono text-[10px] text-neutral-400 flex items-center gap-1.5 shadow-xl select-none"
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
        <span className="font-bold text-white">{currentNum}/{totalNum}</span>
        <span className="text-[9px] uppercase tracking-wider" style={{ color: primaryColor }}>
          {activeSection.name}
        </span>
      </div>
    </>
  );
};
