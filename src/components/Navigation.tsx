import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface NavigationProps {
  onOpenCreate?: () => void;
  onExploreTemplates?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  onOpenCreate,
  onExploreTemplates,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/85 backdrop-blur-md border-b border-[#292929]">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="font-cinzel text-xl md:text-2xl font-bold tracking-[0.25em] text-white hover:text-white/90 transition-colors uppercase select-none"
        >
          MEMORIES BUILDER
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wider uppercase text-neutral-300">
          <button
            onClick={() => handleNavClick('#creator-teaser')}
            className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            Create
          </button>
          <button
            onClick={() => handleNavClick('#journey')}
            className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            The Journey
          </button>
          <button
            onClick={() => handleNavClick('#how-it-works')}
            className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('#ephemeral-24h')}
            className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            24 Hours
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onOpenCreate) {
                onOpenCreate();
              } else {
                handleNavClick('#creator-teaser');
              }
            }}
            className="relative group px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-white bg-[#E50914] rounded-lg hover:bg-[#c90711] transition-all duration-200 shadow-lg shadow-[#E50914]/20 hover:shadow-[#E50914]/40 cursor-pointer whitespace-nowrap"
          >
            <span className="flex items-center gap-1.5">
              Get Started
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg border border-[#292929] hover:bg-[#141414] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F0F0F] border-b border-[#292929] px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm uppercase tracking-wider text-neutral-300">
            <button
              onClick={() => handleNavClick('#creator-teaser')}
              className="text-left py-2 hover:text-[#E50914] transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => handleNavClick('#journey')}
              className="text-left py-2 hover:text-[#E50914] transition-colors"
            >
              The Journey
            </button>
            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="text-left py-2 hover:text-[#E50914] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('#ephemeral-24h')}
              className="text-left py-2 hover:text-[#E50914] transition-colors"
            >
              24-Hour Premiere
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
