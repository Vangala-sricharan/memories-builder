import React from 'react';
import { ShieldCheck, UserX, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export const NoAccountSection: React.FC = () => {
  const steps = [
    { label: 'CREATE', detail: 'Input details & memories' },
    { label: 'PREVIEW', detail: 'Inspect the cinema scene' },
    { label: 'CUSTOMIZE', detail: 'Audio & visual tweaks' },
    { label: 'PUBLISH', detail: 'Instant render in seconds' },
    { label: 'GET URL', detail: 'Hand to recipient' },
  ];

  return (
    <section className="relative py-24 px-6 bg-[#080808] border-t border-[#292929]">
      <div className="max-w-5xl mx-auto text-center">
        {/* Section Header */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914] mb-3">
          <UserX className="w-3.5 h-3.5" />
          <span>Frictionless Freedom</span>
        </div>

        <h2 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 [text-wrap:balance]">
          NO LOGINS. NO PASSWORDS. NO PROFILES.
        </h2>

        <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-14 [text-wrap:balance]">
          A genuine gift shouldn't require filling out account registrations, email verifications, or password managers. Start building instantly, preview the result, and publish directly to a private link.
        </p>

        {/* Visual Workflow Chain */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {steps.map((st, i) => (
            <div
              key={st.label}
              className="bg-[#111111] border border-[#242424] hover:border-[#E50914] rounded-xl p-4 transition-all duration-300 flex flex-col justify-between items-center text-center group"
            >
              <div className="text-[11px] font-mono text-neutral-400 mb-2">
                0{i + 1}
              </div>

              <div className="font-cinzel text-base font-bold text-white group-hover:text-[#E50914] transition-colors mb-1">
                {st.label}
              </div>

              <div className="text-[11px] text-neutral-400">
                {st.detail}
              </div>

              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-neutral-600">
                  {/* subtle separator */}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 inline-flex items-center gap-6 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            No marketing emails
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            No stored credit cards
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Immediate creation
          </span>
        </div>
      </div>
    </section>
  );
};
