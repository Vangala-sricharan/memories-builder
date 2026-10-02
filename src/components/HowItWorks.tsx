import React from 'react';
import { Sparkles, Layers, Sliders, PlayCircle, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'ADD DETAILS',
      subtitle: 'Who & What to Celebrate',
      desc: 'Enter the recipient’s name, milestone year, your relationship, and a short memory brief or message. The AI engine uses these details to structure the emotional arc of their story.',
      detail: 'Name · Milestone · Story prompts',
    },
    {
      num: '02',
      title: 'ADD MEMORIES',
      subtitle: 'Curate The Visual Journey',
      desc: 'Upload 3 to 20 cherished photographs from your shared archives. Each photo is dynamically framed with subtle motion, cinematic color treatment, and custom location tags.',
      detail: '3 to 20 photographs · Captions & Dates',
    },
    {
      num: '03',
      title: 'CUSTOMIZE',
      subtitle: 'Soundtrack & Direction',
      desc: 'Select your preferred visual direction (Cinema, Memories, or Celebration) and upload your personal MP3 file. The audio syncs precisely with the visual cadence.',
      detail: 'Template selection · Personal MP3 upload',
    },
    {
      num: '04',
      title: 'CREATE EXPERIENCE',
      subtitle: 'The 24-Hour Premiere Link',
      desc: 'Generate a private, unique experience link. Share it with the recipient on their special day. The website launches full-screen with music and particle atmosphere, living for exactly 24 hours.',
      detail: 'Private URL · 24-hour celebration window',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-28 px-6 bg-[#080808] border-t border-[#292929]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914] mb-3">
            <span>The Filmmaking Process</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 [text-wrap:balance]">
            HOW IT WORKS
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
            Four effortless steps from a handful of raw memories to an unforgettable theater-grade premiere.
          </p>
        </div>

        {/* Cinematic Step Progression */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="relative bg-[#0E0E0E] border border-[#242424] hover:border-[#E50914] p-7 rounded-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Step indicator top */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-cinzel text-4xl sm:text-5xl font-black text-neutral-700 group-hover:text-[#E50914] transition-colors duration-300">
                    {step.num}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#292929] group-hover:bg-[#E50914] transition-colors" />
                </div>

                <h3 className="font-cinzel text-xl font-bold text-white mb-1 tracking-wide">
                  {step.title}
                </h3>
                <p className="text-xs text-[#E50914] font-medium mb-3.5">
                  {step.subtitle}
                </p>
                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1F1F1F] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>{step.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
