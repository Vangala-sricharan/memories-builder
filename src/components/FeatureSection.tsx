import React from 'react';
import { UserCheck, Images, Music2, Wand2, ArrowUpRight } from 'lucide-react';

export const FeatureSection: React.FC = () => {
  const features = [
    {
      index: '01',
      title: 'PERSONALIZED',
      subtitle: 'Your birthday story, your way.',
      description:
        'Every detail is bespoke to the recipient. Input their milestone year, intimate memories, personal jokes, and heartfelt wishes to mold a bespoke digital world tailored strictly for them.',
      icon: UserCheck,
      highlight: 'Tailored strictly for one person',
    },
    {
      index: '02',
      title: 'YOUR MEMORIES',
      subtitle: 'Bring 3–20 photos into the experience.',
      description:
        'Select between 3 and 20 milestone photographs. Our engine frames each shot with filmic aspect ratios, custom color grading, and ambient motion, preserving moments in museum-grade clarity.',
      icon: Images,
      highlight: '3 to 20 high-fidelity stills',
    },
    {
      index: '03',
      title: 'YOUR MUSIC',
      subtitle: 'Use your own favorite MP3.',
      description:
        'No stock generic background loops or canned elevator songs. Upload your own cherished MP3 audio track — that one meaningful song that defines your friendship or memory.',
      icon: Music2,
      highlight: 'Zero stock music · 100% personal audio',
    },
    {
      index: '04',
      title: 'AI STORYTELLING',
      subtitle: 'Let AI transform your details into cinematic birthday content.',
      description:
        'Provide raw memories, funny anecdotes, and heartfelt dates. Advanced AI orchestration weaves them into poetic chapter acts, screen titles, and emotionally resonant opening narrations.',
      icon: Wand2,
      highlight: 'Poetic, human-crafted narrative tone',
    },
  ];

  return (
    <section className="relative py-28 px-6 bg-[#0B0B0B] border-t border-[#292929]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914] mb-3">
            <span>The Four Pillars</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 [text-wrap:balance]">
            CINEMATIC BY DESIGN
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
            Engineered from the ground up to replace generic paper birthday cards and bland social messages with an unforgettable, theater-quality digital birthday gift. Build a custom birthday website and online birthday surprise website that celebrates your shared milestones.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.index}
                className="group relative bg-[#121212] border border-[#242424] hover:border-neutral-500 rounded-2xl p-8 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-cinzel text-3xl font-extrabold text-[#E50914]/80 group-hover:text-[#E50914] transition-colors">
                      {feat.index}
                    </span>
                    <div className="p-3 rounded-xl bg-[#1C1C1C] text-neutral-300 group-hover:bg-[#E50914] group-hover:text-white transition-colors duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-cinzel text-2xl font-bold text-white mb-1.5 tracking-wide">
                    {feat.title}
                  </h3>
                  <p className="text-sm font-medium text-[#E50914] mb-4">
                    {feat.subtitle}
                  </p>
                  <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#222222] flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono">{feat.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
