import React from 'react';
import { 
  Sparkles, 
  Film, 
  Heart, 
  Star, 
  Layers, 
  Box, 
  Unlock, 
  Compass, 
  ArrowRight,
  Eye
} from 'lucide-react';

interface StoryJourneyShowcaseProps {
  onOpenExperienceModal: () => void;
  onStartCreating: () => void;
}

export const StoryJourneyShowcase: React.FC<StoryJourneyShowcaseProps> = ({
  onOpenExperienceModal,
  onStartCreating,
}) => {
  const acts = [
    {
      act: 'ACT I',
      title: 'OPENING WISH',
      subtitle: 'The Prologue & Greeting',
      desc: 'Cinematic title cards introduce the recipient with a personalized opening dedication, setting an emotional, theater-quality tone.',
      icon: Film,
      highlight: 'Personalized Title Cards',
    },
    {
      act: 'ACT II',
      title: 'HERO SPOTLIGHT',
      subtitle: 'The Definitive Portrait',
      desc: 'One key hero photograph chosen by the creator is showcased in full-width 2.39:1 widescreen anamorphic framing with subtle depth.',
      icon: Star,
      highlight: 'Full Widescreen Presence',
    },
    {
      act: 'ACT III',
      title: 'THE INNER CIRCLE',
      subtitle: 'Intimate Connections',
      desc: 'An intimate circular constellation of the closest friends, family, and landmark milestones celebrating your deepest bonds.',
      icon: Heart,
      highlight: 'Orbital Constellation',
    },
    {
      act: 'ACT IV',
      title: 'MEMORY SEQUENCE',
      subtitle: 'All Uploaded Memories',
      desc: 'Every single uploaded photograph is seamlessly paced into an editorial narrative timeline with date stamps and location coordinates.',
      icon: Layers,
      highlight: 'Every Photo Preserved',
    },
    {
      act: 'ACT V',
      title: '3D PHOTO VAULT',
      subtitle: 'The Digital Sanctuary',
      desc: 'All memories are preserved inside a rotating 3D archival vault with subtle red illumination, floating panels, and perspective depth.',
      icon: Box,
      highlight: 'Signature 3D Archive',
    },
    {
      act: 'ACT VI',
      title: 'OPTIONAL SURPRISE',
      subtitle: 'Confidential Reveal',
      desc: 'A secret photograph locked in suspense until the recipient taps to unlock it. If omitted, the experience transitions seamlessly without it.',
      icon: Unlock,
      highlight: 'Encrypted Reveal',
    },
    {
      act: 'ACT VII',
      title: 'FINAL BIRTHDAY WISH',
      subtitle: 'The Epilogue & Toast',
      desc: 'An emotional closing dedication and slow cinematic fade-out set against particles gently morphing into a final celebratory heart.',
      icon: Sparkles,
      highlight: 'Emotional Epilogue',
    },
  ];

  return (
    <section id="journey" className="relative py-28 px-6 bg-[#080808]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914] mb-3">
            <Film className="w-3.5 h-3.5" />
            <span>The Cinematic Narrative</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 [text-wrap:balance]">
            THE 7-ACT STORY JOURNEY
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
            A fixed, theater-grade storytelling architecture that transforms a handful of memories into an immersive motion picture gift.
          </p>
        </div>

        {/* Act Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {acts.map((item, idx) => {
            const Icon = item.icon;
            const isFullSpan = idx === acts.length - 1; // ACT VII
            return (
              <div
                key={item.act}
                className={`bg-[#0F0F0F] border border-[#242424] hover:border-[#E50914] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group ${
                  isFullSpan ? 'md:col-span-2 lg:col-span-3 bg-gradient-to-r from-[#140808] via-[#0F0F0F] to-[#140808] border-[#381616]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#E50914] tracking-wider">
                      {item.act}
                    </span>
                    <div className="p-2 rounded-lg bg-[#181818] group-hover:bg-[#E50914] group-hover:text-white text-neutral-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-cinzel text-xl font-bold text-white mb-1 tracking-wide">
                    {item.title}
                  </h3>
                  <div className="text-xs text-[#E50914] font-medium mb-3">
                    {item.subtitle}
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1F1F1F] flex items-center justify-between text-[11px] font-mono text-neutral-500">
                  <span>{item.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Bar */}
        <div className="bg-[#121212] border border-[#292929] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white mb-1">
              Ready to orchestrate their premiere?
            </div>
            <div className="text-xs text-neutral-400">
              Input recipient details, upload 3–20 photos, and upload your personal MP3 soundtrack.
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenExperienceModal}
              className="px-4 py-2.5 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] border border-[#2E2E2E] text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#E50914]" />
              <span>Watch Demo Premiere</span>
            </button>

            <button
              onClick={onStartCreating}
              className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c90711] text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-lg shadow-[#E50914]/25 hover:shadow-[#E50914]/40 flex items-center gap-2 cursor-pointer"
            >
              <span>Build Experience</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
