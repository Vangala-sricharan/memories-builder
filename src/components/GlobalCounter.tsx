import React, { useEffect, useState } from 'react';
import { Globe2, Sparkles, Heart } from 'lucide-react';
import { fetchLifetimeExperienceCount, getLifetimeExperienceCount } from '../services/counterService';

export const GlobalCounter: React.FC = () => {
  const [targetCount, setTargetCount] = useState<number>(getLifetimeExperienceCount());
  const [count, setCount] = useState<number>(targetCount - 82);

  useEffect(() => {
    fetchLifetimeExperienceCount().then((live) => {
      setTargetCount(live);
    });
  }, []);

  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();
    const startVal = Math.max(12400, targetCount - 82);

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(startVal + (targetCount - startVal) * ease);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [targetCount]);

  return (
    <section className="relative py-20 px-6 bg-[#0B0B0B] border-t border-[#292929]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Subtle Live Beacon */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#242424] text-[11px] text-neutral-400 mb-6 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIFETIME NETWORK REGISTER</span>
        </div>

        {/* Huge Counter Number */}
        <div className="font-cinzel text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white mb-2 tabular-nums">
          {count.toLocaleString()}
        </div>

        <div className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-[#E50914] mb-3">
          BIRTHDAY EXPERIENCES CREATED
        </div>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
          Over twelve thousand unforgettable 24-hour celebrations premiered worldwide, each leaving behind no digital residue—only pure memories.
        </p>
      </div>
    </section>
  );
};
