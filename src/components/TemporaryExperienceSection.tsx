import React, { useEffect, useState } from 'react';
import { Clock, ShieldAlert, Sparkles, Flame, EyeOff } from 'lucide-react';

export const TemporaryExperienceSection: React.FC = () => {
  // Live ticking visual simulation of the 24-hour countdown
  const [secondsRemaining, setSecondsRemaining] = useState(23 * 3600 + 58 * 60 + 42);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 24 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <section id="ephemeral-24h" className="relative py-28 px-6 bg-[#090909] border-t border-[#292929]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Philosophical Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914]">
              <Clock className="w-3.5 h-3.5" />
              <span>The Ephemeral Principle</span>
            </div>

            <h2 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight [text-wrap:balance]">
              YOUR MOMENT. <br />
              YOUR STORY. <br />
              <span className="text-[#E50914]">24 HOURS.</span>
            </h2>

            <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed [text-wrap:balance]">
              Create a cinematic birthday experience, share it with someone special,
              and let the moment live for 24 hours.
            </p>

            <p className="text-sm text-neutral-400 leading-relaxed [text-wrap:balance]">
              The magic of a birthday exists on the day itself. Just like blowing out real candles, an ephemeral digital premiere makes every second feel precious. When the 24-hour clock completes its revolution, the website, media, and private link vanish forever, leaving only the memory.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#222222]">
              <div>
                <div className="text-xs uppercase tracking-wider text-neutral-400 mb-1">
                  Zero Permanent Footprint
                </div>
                <div className="text-xs text-neutral-400">
                  Total automatic cleanup after the premiere window closes.
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-neutral-400 mb-1">
                  Intimate & Exclusive
                </div>
                <div className="text-xs text-neutral-400">
                  Only accessible through the unique link you hand to them.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual 24-Hour Countdown Monolith */}
          <div className="lg:col-span-5">
            <div className="bg-[#121212] border border-[#2B2B2B] rounded-2xl p-7 relative overflow-hidden shadow-2xl">
              {/* Top status indicator */}
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-6 pb-4 border-b border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
                  <span className="text-white">PREMIERE CLOCK</span>
                </div>
                <span className="text-[#E50914] font-semibold">TICKING</span>
              </div>

              {/* Huge Monospace Digital Countdown */}
              <div className="text-center my-6">
                <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 font-mono mb-2">
                  TIME REMAINING BEFORE EXPIRATION
                </div>
                <div className="font-mono text-4xl sm:text-5xl font-bold tracking-widest text-white tabular-nums">
                  <span className="text-white">{pad(hours)}</span>
                  <span className="text-[#E50914] animate-pulse">:</span>
                  <span className="text-white">{pad(minutes)}</span>
                  <span className="text-[#E50914] animate-pulse">:</span>
                  <span className="text-[#E50914]">{pad(seconds)}</span>
                </div>
                <div className="flex justify-center gap-10 text-[11px] font-mono text-neutral-400 mt-2">
                  <span>HRS</span>
                  <span>MIN</span>
                  <span>SEC</span>
                </div>
              </div>

              {/* Visual Progress Bar of the 24 hours */}
              <div className="space-y-2 mt-8 pt-4 border-t border-[#202020]">
                <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                  <span>Daybreak Premiere</span>
                  <span className="text-[#E50914]">99.8% Remaining</span>
                  <span>Midnight Sunset</span>
                </div>
                <div className="w-full h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B0000] to-[#E50914] rounded-full transition-all duration-1000"
                    style={{ width: `${(secondsRemaining / (24 * 3600)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Ephemeral Guarantee notice */}
              <div className="mt-6 p-3 bg-[#0A0A0A] border border-[#222222] rounded-xl flex items-center gap-3 text-xs text-neutral-400">
                <EyeOff className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>At 00:00:00, the experience turns into a final commemorative screen.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
