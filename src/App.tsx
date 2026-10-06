import React, { useState, useEffect } from 'react';
import { ParticleShape } from './types';
import { ParticleBackground } from './components/ParticleBackground';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { CreatorTeaser } from './components/CreatorTeaser';
import { StoryJourneyShowcase } from './components/StoryJourneyShowcase';
import { FeatureSection } from './components/FeatureSection';
import { HowItWorks } from './components/HowItWorks';
import { ExperiencePreview } from './components/ExperiencePreview';
import { TemporaryExperienceSection } from './components/TemporaryExperienceSection';
import { NoAccountSection } from './components/NoAccountSection';
import { GlobalCounter } from './components/GlobalCounter';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { ExperienceModal } from './components/ExperienceModal';
import { BirthdayCreator } from './components/creator/BirthdayCreator';
import { PublishedRecipientExperience } from './components/experience/PublishedRecipientExperience';
import { getPublishedExperience, fetchPublishedExperience } from './services/publishService';
import { PublishedExperienceSnapshot } from './types';
import { AlertCircle, ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { ScrollReveal } from './components/common/ScrollReveal';

function getExperienceIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  // Match pathname /b/:id
  const match = window.location.pathname.match(/^\/b\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  // Match hash route fallback #b/:id or #/b/:id
  const hashMatch = window.location.hash.match(/^#\/?b\/([a-zA-Z0-9_-]+)/);
  if (hashMatch) return hashMatch[1];

  // Match query param fallback ?b=:id
  const params = new URLSearchParams(window.location.search);
  const qId = params.get('b');
  if (qId) return qId;

  return null;
}

export default function App() {
  const [currentShape, setCurrentShape] = useState<ParticleShape>('abstract');
  const [modalOpen, setModalOpen] = useState(false);

  // Dedicated Creator Studio View State
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // Published Experience URL Route State
  const [activeExperienceId, setActiveExperienceId] = useState<string | null>(getExperienceIdFromLocation());
  const [loadedSnapshot, setLoadedSnapshot] = useState<PublishedExperienceSnapshot | null>(() => {
    const id = getExperienceIdFromLocation();
    return id ? getPublishedExperience(id) : null;
  });
  const [isLoadingExperience, setIsLoadingExperience] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      const id = getExperienceIdFromLocation();
      setActiveExperienceId(id);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (!activeExperienceId) {
      setLoadedSnapshot(null);
      setLoadError(false);
      return;
    }

    const cached = getPublishedExperience(activeExperienceId);
    if (cached) {
      setLoadedSnapshot(cached);
    }

    setIsLoadingExperience(!cached);
    fetchPublishedExperience(activeExperienceId).then((snapshot) => {
      if (snapshot) {
        setLoadedSnapshot(snapshot);
        setLoadError(false);
      } else {
        if (!cached) {
          setLoadError(true);
        }
      }
      setIsLoadingExperience(false);
    }).catch(() => {
      if (!cached) {
        setLoadError(true);
      }
      setIsLoadingExperience(false);
    });
  }, [activeExperienceId]);

  const navigateToHome = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    setActiveExperienceId(null);
    setIsCreatorOpen(false);
  };

  const navigateToCreator = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    setActiveExperienceId(null);
    setIsCreatorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPublished = (id: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/b/${id}`);
    }
    setActiveExperienceId(id);
    setIsCreatorOpen(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenCreator = () => {
    setIsCreatorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenExperience = () => {
    setModalOpen(true);
  };

  // Helper to render current route/mode content
  const renderContent = () => {
    // 1. If viewing a published experience route (/b/:experienceId)
    if (activeExperienceId) {
      if (isLoadingExperience && !loadedSnapshot) {
        return (
          <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6 relative">
            <div className="max-w-md w-full text-center space-y-4 bg-[#121212] border border-[#2B2B2B] rounded-3xl p-8 shadow-2xl animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <h2 className="font-cinzel text-xl font-bold uppercase tracking-wider text-white">
                RETRIEVING PREMIERE
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Verifying 24-hour lifetime and loading archival memories...
              </p>
            </div>
          </div>
        );
      }

      if (loadedSnapshot) {
        return (
          <PublishedRecipientExperience
            snapshot={loadedSnapshot}
            onReturnHome={navigateToHome}
            onCreateNew={navigateToCreator}
          />
        );
      }

      // Opaque link not found (e.g. invalid random id or purged)
      return (
        <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6 relative">
          <div className="max-w-md w-full text-center space-y-6 bg-[#121212] border border-[#2B2B2B] rounded-3xl p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/40 text-[#E50914] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#E50914] font-semibold">
                PREMIERE NOT FOUND
              </span>
              <h1 className="font-cinzel text-2xl font-bold text-white uppercase">
                EXPERIENCE UNAVAILABLE
              </h1>
              <p className="text-xs text-neutral-400 leading-relaxed">
                This private link is invalid or may have concluded its 24-hour lifetime.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={navigateToHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#2D2D2D] hover:bg-[#1C1C1C] text-xs font-semibold uppercase tracking-wider text-neutral-300 transition-colors cursor-pointer"
              >
                Return Home
              </button>
              <button
                onClick={navigateToCreator}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c90711] text-xs font-bold uppercase tracking-wider text-white transition-all shadow-lg shadow-[#E50914]/20 cursor-pointer"
              >
                Create Experience
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. If Creator Studio is active, render the dedicated studio workspace
    if (isCreatorOpen) {
      return (
        <BirthdayCreator
          onExit={() => setIsCreatorOpen(false)}
          onOpenPublishedExperience={navigateToPublished}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#080808] text-white selection:bg-[#E50914] selection:text-white relative">
        {/* Global Cinematic Interactive Particle System with 3D Shape Morphing */}
        <ParticleBackground
          currentShape={currentShape}
          intensity="normal"
          interactive={true}
        />

        {/* Main Top Navigation */}
        <Navigation
          onOpenCreate={() => handleOpenCreator()}
          onExploreTemplates={() => scrollToSection('journey')}
        />

        {/* Main Landing Page Flow */}
        <main className="relative z-10">
          {/* Hero Section with Live Morphing Particle Atmosphere */}
          <Hero
            currentShape={currentShape}
            onSelectShape={setCurrentShape}
            onCreateClick={() => handleOpenCreator()}
            onExploreJourney={() => scrollToSection('journey')}
            onPreviewLiveExperience={handleOpenExperience}
          />

          {/* Creator Studio Teaser */}
          <ScrollReveal variant="default">
            <CreatorTeaser
              onOpenFullExperience={handleOpenExperience}
              onStartCreating={handleOpenCreator}
            />
          </ScrollReveal>

          {/* The 7-Act Story Journey Architecture */}
          <ScrollReveal variant="heading">
            <StoryJourneyShowcase
              onOpenExperienceModal={handleOpenExperience}
              onStartCreating={handleOpenCreator}
            />
          </ScrollReveal>

          {/* Four Feature Pillars */}
          <ScrollReveal variant="default">
            <FeatureSection />
          </ScrollReveal>

          {/* How It Works (4-Step Progression) */}
          <ScrollReveal variant="default">
            <HowItWorks />
          </ScrollReveal>

          {/* Recipient Experience Preview */}
          <ScrollReveal variant="photo">
            <ExperiencePreview onOpenExperienceModal={handleOpenExperience} />
          </ScrollReveal>

          {/* 24-Hour Ephemeral Concept */}
          <ScrollReveal variant="default">
            <TemporaryExperienceSection />
          </ScrollReveal>

          {/* Frictionless / No-Account Architecture */}
          <ScrollReveal variant="default">
            <NoAccountSection />
          </ScrollReveal>

          {/* Global Lifetime Count Concept */}
          <ScrollReveal variant="default">
            <GlobalCounter />
          </ScrollReveal>

          {/* Final Cinematic Call to Action */}
          <ScrollReveal variant="heading">
            <FinalCTA
              onSelectShape={setCurrentShape}
              onCreateClick={handleOpenCreator}
            />
          </ScrollReveal>
        </main>

        {/* Clean Quiet Footer */}
        <Footer />

        {/* Full-Screen Premiere Modal for Live 7-Act Story Simulation */}
        <ExperienceModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    );
  };

  return renderContent();
}
