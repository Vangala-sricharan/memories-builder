import React, { useState } from 'react';
import { 
  User, 
  Film, 
  Play, 
  Volume2, 
  Clock, 
  CheckCircle2, 
  Sliders,
  Eye,
  Star,
  Heart,
  Box
} from 'lucide-react';

interface CreatorTeaserProps {
  onOpenFullExperience?: () => void;
  onStartCreating?: () => void;
}

export const CreatorTeaser: React.FC<CreatorTeaserProps> = ({ 
  onOpenFullExperience, 
  onStartCreating 
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'curate' | 'soundtrack'>('details');
  const [recipientName, setRecipientName] = useState('Alex Vance');
  const [milestoneAge, setMilestoneAge] = useState(28);

  const samplePhotos = [
    { title: 'The Coastal Sunset Walk', location: 'Big Sur, CA', year: '2023' },
    { title: 'The Rooftop Surprise', location: 'Brooklyn, NY', year: '2024' },
    { title: 'Summit at Sunrise', location: 'Mount Rainier', year: '2025' },
    { title: 'First Day in Tokyo', location: 'Shibuya', year: '2025' },
  ];

  return (
    <section id="creator-teaser" className="relative py-28 px-6 border-t border-[#292929] bg-[#0A0A0A]/60">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914] mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>Architecture Preview</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 [text-wrap:balance]">
            THE CREATOR STUDIO
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed [text-wrap:balance]">
            An effortless orchestration studio. Curate 3–20 memories, select the hero portrait, attach your chosen soundtrack, and let the 7-act cinematic premiere come to life.
          </p>
        </div>

        {/* Studio Canvas Mockup */}
        <div className="bg-[#0F0F0F] border border-[#292929] rounded-2xl overflow-hidden shadow-2xl">
          {/* Top Mockup Bar */}
          <div className="h-12 bg-[#141414] border-b border-[#292929] px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
              <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
              <span className="ml-3 text-xs font-mono text-neutral-400">
                director-session · {recipientName.toLowerCase().replace(/\s+/g, '_')}_premiere.proj
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {onStartCreating && (
                <button
                  onClick={onStartCreating}
                  className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-[#E50914] rounded-md hover:bg-[#c90711] transition-all shadow-md shadow-[#E50914]/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Open Creator Studio</span>
                </button>
              )}

              <button
                onClick={() => onOpenFullExperience && onOpenFullExperience()}
                className="px-3 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-[#1C1C1C] border border-[#2E2E2E] rounded-md hover:bg-[#252525] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Simulation</span>
              </button>
            </div>
          </div>

          {/* Main Studio Body Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Controls & Parameters (5 cols) */}
            <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-[#292929] bg-[#0C0C0C] space-y-6">
              {/* Parameter tabs */}
              <div className="flex items-center gap-1 p-1 bg-[#141414] rounded-xl border border-[#292929]">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'details'
                      ? 'bg-[#292929] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  01 Details
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'photos'
                      ? 'bg-[#292929] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  02 Photos
                </button>
                <button
                  onClick={() => setActiveTab('curate')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'curate'
                      ? 'bg-[#292929] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  03 Story
                </button>
                <button
                  onClick={() => setActiveTab('soundtrack')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'soundtrack'
                      ? 'bg-[#292929] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  04 Audio
                </button>
              </div>

              {/* Tab 1: Details */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1.5">
                      Recipient Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#E50914] transition-colors"
                        placeholder="e.g. Alex Vance"
                      />
                      <User className="absolute right-3 top-3 w-4 h-4 text-neutral-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1.5">
                        Milestone Age
                      </label>
                      <input
                        type="number"
                        value={milestoneAge}
                        onChange={(e) => setMilestoneAge(Number(e.target.value))}
                        className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1.5">
                        Relationship
                      </label>
                      <div className="w-full bg-[#141414] border border-[#292929] rounded-lg px-3.5 py-2.5 text-sm text-white">
                        Best Friend
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#141414] border border-[#242424] rounded-xl text-xs text-neutral-400">
                    <span className="text-white font-semibold block mb-1">
                      7-Act Cinematic Storytelling Sequence
                    </span>
                    Opening Wish → Hero Image → Inner Circle → Memory Sequence → 3D Photo Vault → Optional Surprise → Final Wish.
                  </div>
                </div>
              )}

              {/* Tab 2: Photos */}
              {activeTab === 'photos' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Curated Memories (4 of 20 slots loaded)</span>
                    <span className="text-[#E50914] font-medium">3–20 Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {samplePhotos.map((photo, i) => (
                      <div
                        key={i}
                        className="group relative bg-[#141414] border border-[#292929] rounded-lg p-2.5 hover:border-neutral-500 transition-colors"
                      >
                        <div className="aspect-video w-full bg-[#1c1c1c] rounded flex items-center justify-center mb-2 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                          <Film className="w-5 h-5 text-neutral-600" />
                          <span className="absolute bottom-1 left-2 text-[10px] font-mono text-neutral-300 z-20">
                            0{i + 1} // {photo.year}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-white truncate">{photo.title}</div>
                        <div className="text-[10px] text-neutral-500 truncate">{photo.location}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Curate Story */}
              {activeTab === 'curate' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#141414] border border-[#262626] rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Star className="w-3.5 h-3.5 text-[#E50914] fill-[#E50914]" />
                      <span>Hero Portrait: Photo #01</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      The designated widescreen anchor for Act II.
                    </p>
                  </div>

                  <div className="p-3 bg-[#141414] border border-[#262626] rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      <span>Inner Circle: 4 Selected Photos</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Curated constellation for the circular intimate act.
                    </p>
                  </div>

                  <div className="p-3 bg-[#141414] border border-[#262626] rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Box className="w-3.5 h-3.5 text-[#E50914]" />
                      <span>3D Photo Vault: All 4 Photos</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Rotating 3D perspective archive preserving every memory.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Soundtrack */}
              {activeTab === 'soundtrack' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                      Uploaded Personal MP3
                    </label>
                    <p className="text-[11px] text-neutral-500 mb-3">
                      No stock libraries. You supply the exact meaningful song.
                    </p>
                  </div>

                  <div className="p-4 bg-[#141414] border border-[#292929] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center text-[#E50914]">
                        <Volume2 className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">
                          Ludovico_Einaudi_Nuvole_Bianche.mp3
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                          <span>05:58</span>
                          <span>·</span>
                          <span>320 kbps</span>
                          <span>·</span>
                          <span className="text-emerald-400">Synchronized</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Live Viewport / Director Monitor (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-b from-[#111111] to-[#0A0A0A] relative overflow-hidden">
              {/* Anamorphic Letterbox effect */}
              <div className="relative aspect-video w-full bg-[#080808] border border-[#292929] rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between p-6">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800/40 via-black to-[#080808] -z-10" />

                {/* Top film watermark */}
                <div className="flex items-center justify-between text-[10px] tracking-widest uppercase font-mono text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                    <span>PREMIERE MONITOR // 7-ACT STORY EXPERIENCE</span>
                  </div>
                  <span>24:00:00 EXPIRY CYCLE</span>
                </div>

                {/* Hero Center Display in Monitor */}
                <div className="text-center my-auto py-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#E50914] mb-2 font-medium">
                    ACT I · PROLOGUE
                  </p>
                  <h3 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-white tracking-wide mb-2">
                    HAPPY BIRTHDAY, {recipientName.toUpperCase()}
                  </h3>
                  <p className="text-xs text-neutral-400 font-serif italic max-w-md mx-auto">
                    "A journey through 28 years of laughter, light, and timeless memories."
                  </p>
                </div>

                {/* Bottom monitor audio/timeline strip */}
                <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800 pt-3">
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-[#E50914] fill-[#E50914]" />
                    <span className="font-mono">Nuvole Bianche · 01:24 / 05:58</span>
                  </div>
                  <span className="text-neutral-500">1080p Cinematic Render</span>
                </div>
              </div>

              {/* Bottom Quick Feature Strip */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#292929] text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E50914]" />
                  <span>Ephemerality: 24-hour self-destruct</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-white" />
                  <span>Includes signature 3D Photo Vault</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
