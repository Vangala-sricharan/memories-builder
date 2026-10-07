import React, { useState, useEffect } from 'react';
import { 
  UploadedPhoto, 
  UploadedMusic, 
  ExperienceTemplate, 
  ExperienceTheme,
  ExperienceCustomization,
  CinematicExtras
} from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { PhotoPresentationView } from './photo-presentations/PhotoPresentationView';
import { HeroPhotoFrame } from './photo-presentations/SinglePhotoPresentationFrames';
import { FinalCinematicReveal } from './FinalCinematicReveal';
import { VerticalProgressIndicator, SectionProgressItem } from './VerticalProgressIndicator';
import { CinematicChapterCard } from './CinematicChapterCard';
import { MemorySpotlightView } from './MemorySpotlightView';
import { SecretRevealView } from './SecretRevealView';
import { SurpriseLockView } from './SurpriseLockView';
import { HiddenMessageTrigger } from './HiddenMessageTrigger';
import { EmotionalReactionView } from './EmotionalReactionView';
import { ReplayButton } from './ReplayButton';
import { ThreeDimensionalVault } from './ThreeDimensionalVault';
import { EasterEggModal } from '../common/EasterEggModal';
import { ScrollReveal, ScrollRevealPhoto, ScrollRevealHeading } from '../common/ScrollReveal';
import { FullscreenImageViewer } from '../common/FullscreenImageViewer';
import { 
  TEMPLATES, 
  deriveThemeTokens, 
  getThemeCssVariables, 
  SplitHeading,
  getHeadingFontClass,
  getBodyFontClass
} from '../../utils/themeTokens';
import { 
  Sparkles, 
  Heart, 
  MapPin, 
  RotateCw, 
  Unlock, 
  Film,
  Zap,
  Crown
} from 'lucide-react';
import { getPlayedSecretIds, markSecretPlayed } from '../../utils/secretPlaybackState';

interface BirthdayStoryExperienceProps {
  experienceId?: string;
  template?: ExperienceTemplate;
  theme?: ExperienceTheme;
  customization?: Partial<ExperienceCustomization>;
  cinematicExtras?: CinematicExtras;
  recipientName: string;
  birthdayMessage?: string;
  tagline?: string;
  openingQuote?: string;
  storyNarrative?: string;
  photos: UploadedPhoto[];
  heroPhotoId?: string;
  innerCirclePhotoIds?: string[];
  innerCircleIntro?: string;
  vaultIntro?: string;
  surprisePhoto?: UploadedPhoto | null;
  secretPhotos?: UploadedPhoto[];
  surpriseText?: string;
  finalMessage?: string;
  senderName?: string;
  music?: UploadedMusic | null;
  isStandalone?: boolean;
}

export const BirthdayStoryExperience: React.FC<BirthdayStoryExperienceProps> = ({
  template = 'cinema',
  theme,
  customization,
  cinematicExtras,
  recipientName = 'Alex',
  birthdayMessage = 'Happy birthday to someone who makes every year richer, brighter, and completely unforgettable.',
  tagline = 'A Cinematic Birthday Story',
  openingQuote = '“Some people make the world brighter simply by being in it. Here is a film of your light.”',
  storyNarrative,
  photos = [],
  heroPhotoId,
  innerCirclePhotoIds = [],
  innerCircleIntro,
  vaultIntro,
  surprisePhoto,
  secretPhotos = [],
  surpriseText,
  finalMessage = 'May the year ahead bring the same unyielding joy and wonder that you bring into the lives of everyone lucky enough to know you.',
  senderName,
  music,
  isStandalone = false,
  experienceId,
}) => {
  // Determine Hero Photo: selected photo or first uploaded photo
  const heroPhoto = photos.find((p) => p.id === heroPhotoId) || photos[0];

  // Determine Inner Circle photos: explicitly chosen IDs or first 3-4 photos
  const innerCirclePhotos = innerCirclePhotoIds.length > 0
    ? photos.filter((p) => innerCirclePhotoIds.includes(p.id))
    : photos.slice(0, Math.min(4, photos.length));

  // Selected photo viewer index in Memory Sequence
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);

  // Standalone experience initialization: ensure scroll position starts at top
  useEffect(() => {
    if (!isStandalone || typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetToTop = () => {
      const html = document.documentElement;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      html.scrollTop = 0;
      document.body.scrollTop = 0;
      html.style.scrollBehavior = prevBehavior;
    };

    resetToTop();

    const raf = requestAnimationFrame(resetToTop);
    const timer = setTimeout(resetToTop, 50);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [isStandalone, experienceId]);

  // Fullscreen high-resolution photo viewer modal state
  const [fullscreenViewer, setFullscreenViewer] = useState<{ photo: UploadedPhoto; index: number } | null>(null);

  // Customization derived properties
  const mood = customization?.mood || (template === 'memories' ? 'emotional' : template === 'celebration' ? 'energetic' : template === 'elegance' ? 'elegant' : 'cinematic');
  const motionEnergy = customization?.motionEnergy || 'cinematic';
  const photoStyle = customization?.photoStyle || (template === 'memories' ? 'editorial' : 'cinematic');
  const heroFocus = customization?.heroFocus || 'auto';
  const glowStyle = customization?.glowStyle || (template === 'cinema' || template === 'celebration' ? 'cinematic' : 'subtle');
  const borderStyle = customization?.borderStyle || (template === 'cinema' || template === 'celebration' ? 'cinematic' : 'thin');
  const occasion = customization?.occasion || 'birthday';
  const customOccasion = customization?.customOccasion;

  // Custom section titles with sensible defaults
  const innerCircleTitle = customization?.sectionTitles?.innerCircle?.trim() || 'THE INNER CIRCLE';
  const memoriesTitle = customization?.sectionTitles?.memories?.trim() || 'THE MEMORY SEQUENCE';
  const vaultTitle = customization?.sectionTitles?.vault?.trim() || 'THE 3D PHOTO VAULT';
  const surpriseTitle = customization?.sectionTitles?.surprise?.trim() || 'A SPECIAL SURPRISE MOMENT';

  // Compute theme tokens and CSS variables
  const currentTemplateDef = TEMPLATES[template] || TEMPLATES.cinema;
  const tokens = deriveThemeTokens(template, theme, customization);
  const cssVariables = getThemeCssVariables(tokens);

  // Typography font classes
  const headingFont = getHeadingFontClass(customization?.headingStyle, template);
  const bodyFont = getBodyFontClass(customization?.bodyStyle);

  // Split title helper for custom section titles
  const splitWords = (text: string): { primary: string; secondary: string } => {
    const parts = text.trim().split(' ');
    if (parts.length <= 1) return { primary: parts[0] || '', secondary: '' };
    const mid = Math.ceil(parts.length / 2);
    return {
      primary: parts.slice(0, mid).join(' '),
      secondary: parts.slice(mid).join(' '),
    };
  };

  const innerCircleSplit = splitWords(innerCircleTitle);
  const memoriesSplit = splitWords(memoriesTitle);
  const vaultSplit = splitWords(vaultTitle);

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Short Cinematic Opening State
  const [openingPhase, setOpeningPhase] = useState<'dark' | 'light' | 'reveal' | 'ready'>(
    prefersReducedMotion ? 'ready' : 'dark'
  );

  // Active section for Vertical Progress Indicator
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Opening sequence timer
  useEffect(() => {
    if (prefersReducedMotion) return;
    const t1 = setTimeout(() => setOpeningPhase('light'), 150);
    const t2 = setTimeout(() => setOpeningPhase('reveal'), 650);
    const t3 = setTimeout(() => setOpeningPhase('ready'), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [prefersReducedMotion]);

  // Cinematic Extras configurations & state
  const chapters = cinematicExtras?.chapters || {
    chapter1: 'THE BEGINNING',
    chapterTwo: 'THE MEMORIES',
    chapter3: 'THE PEOPLE',
    chapter4: 'THE VAULT',
    chapter5: 'THE SURPRISE',
    chapter6: 'FINALE',
  };
  const showChapters = cinematicExtras?.chapterTitlesEnabled !== false;

  // Spotlight photo (Feature 4 - strictly from normal memories collection)
  const spotlightPhoto = cinematicExtras?.memorySpotlightEnabled
    ? photos.find((p) => cinematicExtras.spotlightPhotoIds?.includes(p.id)) || (photos.length > 1 ? photos[1] : photos[0] || null)
    : null;

  // Canonical Secret Memories Resolution (0 to 5)
  // STRICT RULE: Normal photos are NEVER automatically copied into secrets!
  // If no secretPhotos exist, there is NO secret experience.
  const canonicalSecretPhotos: UploadedPhoto[] = React.useMemo(() => {
    let raw = secretPhotos;
    if ((!raw || raw.length === 0) && surprisePhoto) {
      raw = [surprisePhoto];
    }
    if (!Array.isArray(raw)) return [];

    const valid = raw.filter((p): p is UploadedPhoto => {
      if (!p || typeof p !== 'object') return false;
      if (!p.id || typeof p.id !== 'string') {
        console.warn('[DataModel] Invalid secret photo without stable ID; safely skipping.');
        return false;
      }
      return true;
    });

    if (valid.length > 5) {
      console.warn(`[DataModel] Experience contained ${valid.length} secrets; clamped to maximum 5.`);
      return valid.slice(0, 5);
    }
    return valid;
  }, [secretPhotos, surprisePhoto]);

  const hasSecrets = canonicalSecretPhotos.length > 0;

  // Session-scoped one-time secret playback state
  const sessionExpId = experienceId || 'preview-experience';
  const [playedSecretIds, setPlayedSecretIds] = useState<Set<string>>(() => {
    return getPlayedSecretIds(sessionExpId);
  });

  const handleSecretRevealed = React.useCallback((secretId: string) => {
    markSecretPlayed(sessionExpId, secretId);
    setPlayedSecretIds((prev) => {
      const next = new Set(prev);
      next.add(secretId);
      return next;
    });
  }, [sessionExpId]);

  // Surprise Lock state: only rendered if secrets exist
  const showSurpriseLock = cinematicExtras?.surpriseLockEnabled !== false && hasSecrets;

  // Easter Egg state (Feature 10)
  const [easterEggOpen, setEasterEggOpen] = useState(false);
  const [brandClickCount, setBrandClickCount] = useState(0);

  const handleBrandClick = () => {
    if (cinematicExtras?.easterEggEnabled === false) return;
    setBrandClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setEasterEggOpen(true);
        return 0;
      }
      setTimeout(() => setBrandClickCount(0), 2000);
      return next;
    });
  };

  // Replay handler (Feature 7)
  const handleReplay = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveMemoryIndex(0);
  };

  // Section list definition for vertical progress indicator
  const sectionList: SectionProgressItem[] = [
    { id: 'sec-opening', name: 'OPENING', act: 'ACT I' },
    { id: 'sec-hero', name: 'SPOTLIGHT', act: 'ACT II' },
    { id: 'sec-memories', name: 'MEMORIES', act: 'ACT III' },
    ...(innerCirclePhotos.length > 0 ? [{ id: 'sec-circle', name: 'PEOPLE', act: 'ACT IV' }] : []),
    { id: 'sec-vault', name: '3D VAULT', act: 'ACT V' },
    ...(hasSecrets ? [{ id: 'sec-secret', name: 'SECRET', act: 'ACT VI' }] : []),
    { id: 'sec-finale', name: 'FINALE', act: 'EPILOGUE' },
  ];

  // Scroll to section handler
  const handleScrollToSection = (idx: number) => {
    const sec = sectionList[idx];
    if (sec) {
      const el = document.getElementById(sec.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // IntersectionObserver to track active section for vertical progress
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionList.findIndex((s) => s.id === entry.target.id);
            if (index !== -1) {
              setActiveSectionIndex(index);
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    sectionList.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionList]);

  // Occasion label
  const occasionLabel = occasion === 'other' && customOccasion
    ? customOccasion.toUpperCase()
    : occasion === 'milestone'
    ? 'MILESTONE PREMIERE'
    : occasion.startsWith('18') || occasion.startsWith('21') || occasion.startsWith('25') || occasion.startsWith('30') || occasion.startsWith('40') || occasion.startsWith('50')
    ? `${occasion.toUpperCase()} PREMIERE`
    : '24-HOUR BIRTHDAY PREMIERE';

  return (
    <div
      style={cssVariables}
      className={`w-full space-y-24 sm:space-y-32 transition-colors duration-300 relative ${bodyFont}`}
    >
      {/* Short Cinematic Opening Curtain */}
      {openingPhase !== 'ready' && (
        <div
          onClick={() => setOpeningPhase('ready')}
          className={`fixed inset-0 z-50 bg-[#040404] flex flex-col items-center justify-center p-6 text-center transition-opacity duration-700 select-none cursor-pointer ${
            openingPhase === 'dark' ? 'opacity-100' : 'opacity-95'
          }`}
        >
          {/* Subtle Ambient Red Glow */}
          <div
            className={`w-72 h-72 rounded-full transition-all duration-1000 pointer-events-none blur-[90px] ${
              openingPhase === 'light' || openingPhase === 'reveal' ? 'opacity-35 scale-110' : 'opacity-0 scale-75'
            }`}
            style={{ backgroundColor: tokens.primary }}
          />

          <div className="relative z-10 max-w-md space-y-4">
            <span
              className={`text-[10px] font-mono uppercase tracking-[0.35em] block transition-all duration-700 ${
                openingPhase === 'reveal' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{ color: tokens.primary }}
            >
              24-HOUR BIRTHDAY PREMIERE
            </span>

            <h2
              className={`text-2xl sm:text-4xl font-black uppercase tracking-tight text-white transition-all duration-700 ${headingFont} ${
                openingPhase === 'reveal' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              FOR {recipientName}
            </h2>

            <p
              className={`text-xs sm:text-sm text-neutral-400 italic transition-all duration-700 ${bodyFont} ${
                openingPhase === 'reveal' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              "{openingQuote || 'Tonight, your story premieres.'}"
            </p>

            <div
              className={`pt-4 transition-all duration-700 ${
                openingPhase === 'reveal' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpeningPhase('ready')}
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono tracking-wider text-white transition-colors cursor-pointer"
              >
                ENTER PREMIERE ↓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Progress Indicator (Reference-Inspired) */}
      <VerticalProgressIndicator
        sections={sectionList}
        activeSectionIndex={activeSectionIndex}
        onSelectSection={handleScrollToSection}
        primaryColor={tokens.primary}
        secondaryColor={tokens.secondary}
      />

      {/* ======================================================== */}
      {/* 1. SECTION 1 — BIRTHDAY WISH / OPENING                  */}
      {/* ======================================================== */}
      <section id="sec-opening" className="relative text-center py-16 sm:py-24 px-4 overflow-hidden">
        {/* Ambient template-colored radial glow */}
        {glowStyle !== 'none' && (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-10 transition-all duration-700 ${
              glowStyle === 'subtle' ? 'w-[400px] h-[400px] blur-[80px]' : 'w-[650px] h-[650px] blur-[150px]'
            }`}
            style={{ backgroundColor: tokens.glowStrong }}
          />
        )}

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Act Badge & Occasion (Triple-click for Easter egg) */}
          <ScrollReveal variant="heading" staggerIndex={0}>
            <div
              onClick={handleBrandClick}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer hover:scale-105"
              style={{
                backgroundColor: tokens.surface,
                borderColor: tokens.border,
              }}
              title="Memories Builder Premiere"
            >
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: tokens.primary }}
              />
              <span
                className="text-[11px] font-mono uppercase tracking-[0.25em]"
                style={{ color: tokens.secondary }}
              >
                ACT I · {occasionLabel} · {mood.toUpperCase()}
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="text" staggerIndex={1}>
            <p
              className="text-xs uppercase tracking-[0.35em] font-semibold"
              style={{ color: tokens.primary }}
            >
              {tagline}
            </p>
          </ScrollReveal>

          {/* Semantic Split Heading */}
          <ScrollReveal variant="heading" staggerIndex={2}>
            <div className="space-y-2">
              <SplitHeading
                primaryPart="HAPPY"
                secondaryPart="BIRTHDAY,"
                as="h1"
                className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase [text-wrap:balance] ${headingFont}`}
              />
              <div
                className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase [text-wrap:balance] ${headingFont}`}
                style={{ color: tokens.primary }}
              >
                {recipientName}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="text" staggerIndex={3}>
            <p
              className={`text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed pt-2 ${bodyFont}`}
              style={{ color: tokens.body }}
            >
              {openingQuote}
            </p>
          </ScrollReveal>

          {birthdayMessage && (
            <ScrollReveal variant="default" staggerIndex={4}>
              <div className="pt-4 max-w-lg mx-auto">
                <div
                  className={`text-xs sm:text-sm leading-relaxed p-4 sm:p-5 rounded-2xl border shadow-lg ${
                    borderStyle === 'none' ? 'border-transparent' : ''
                  }`}
                  style={{
                    backgroundColor: tokens.surface,
                    borderColor: borderStyle === 'none' ? 'transparent' : tokens.border,
                    color: tokens.body,
                  }}
                >
                  "{birthdayMessage}"
                </div>
              </div>
            </ScrollReveal>
          )}

          {senderName && (
            <ScrollReveal variant="text" staggerIndex={5}>
              <div
                className="text-[11px] font-mono tracking-widest uppercase pt-2"
                style={{ color: tokens.muted }}
              >
                PRESENTED WITH LOVE BY <span style={{ color: tokens.primary }}>{senderName}</span>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. SECTION 2 — HERO IMAGE                               */}
      {/* ======================================================== */}
      {showChapters && heroPhoto && (
        <ScrollReveal variant="heading">
          <CinematicChapterCard
            number="01 / 06"
            act="ACT I"
            title={chapters.chapter1 || 'THE BEGINNING'}
            template={template}
            tokens={tokens}
            headingFont={headingFont}
          />
        </ScrollReveal>
      )}

      {heroPhoto && (
        <section id="sec-hero" className="relative px-4">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal variant="text">
              <div className="flex items-center justify-between text-xs font-mono mb-3 uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tokens.primary }}
                  />
                  <span style={{ color: tokens.secondary }}>
                    ACT II · {template === 'memories' ? 'SIGNATURE MEMORY' : template === 'elegance' ? 'PORTFOLIO HIGHLIGHT' : 'HERO SPOTLIGHT'}
                  </span>
                </span>
                <span style={{ color: tokens.muted }}>
                  STYLE: {photoStyle.toUpperCase()} · FOCUS: {heroFocus.toUpperCase()}
                </span>
              </div>
            </ScrollReveal>

            <ScrollRevealPhoto>
              <HeroPhotoFrame
                photo={heroPhoto}
                photoStyle={photoStyle}
                template={template}
                tokens={tokens}
                headingFont={headingFont}
                bodyFont={bodyFont}
                heroFocus={heroFocus}
                glowStyle={glowStyle}
                borderStyle={borderStyle}
                onOpenFullscreen={() => setFullscreenViewer({ photo: heroPhoto, index: 0 })}
              />
            </ScrollRevealPhoto>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* CHAPTER 02 — THE MEMORIES                                */}
      {/* ======================================================== */}
      {showChapters && (
        <ScrollReveal variant="heading">
          <CinematicChapterCard
            number="02 / 06"
            act="ACT II"
            title={chapters.chapterTwo || 'THE MEMORIES'}
            template={template}
            tokens={tokens}
            headingFont={headingFont}
          />
        </ScrollReveal>
      )}

      {/* ======================================================== */}
      {/* 2. SECTION: MEMORIES ARCHIVE                            */}
      {/* ======================================================== */}
      <section id="sec-memories" className="relative px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal variant="heading">
            <div className="text-center mb-12">
              <span
                className="text-xs font-mono tracking-[0.25em] uppercase font-semibold block mb-2"
                style={{ color: tokens.primary }}
              >
                ACT II · {template === 'memories' ? 'CHRONICLES' : template === 'celebration' ? 'HIGHLIGHT REEL' : 'THE COMPLETE ARCHIVE'}
              </span>
              <SplitHeading
                primaryPart={memoriesSplit.primary}
                secondaryPart={memoriesSplit.secondary}
                as="h2"
                className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 ${headingFont}`}
              />
              <p
                className="text-xs sm:text-sm max-w-lg mx-auto leading-relaxed"
                style={{ color: tokens.muted }}
              >
                Every chapter, laughter, and wild adventure preserved in sequence ({photos.length} total photographs).
              </p>

              {storyNarrative && (
                <div
                  className="mt-4 max-w-xl mx-auto p-4 sm:p-5 rounded-2xl border shadow-lg"
                  style={{
                    backgroundColor: tokens.surface,
                    borderColor: borderStyle === 'none' ? 'transparent' : tokens.border,
                  }}
                >
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${bodyFont}`}
                    style={{ color: tokens.body }}
                  >
                    "{storyNarrative}"
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Active Photo Presentation Component */}
          <ScrollRevealPhoto>
            <PhotoPresentationView
              photoStyle={photoStyle}
              template={template}
              photos={photos}
              tokens={tokens}
              headingFont={headingFont}
              bodyFont={bodyFont}
              heroFocus={heroFocus}
              activeMemoryIndex={activeMemoryIndex}
              onSelectMemory={setActiveMemoryIndex}
              glowStyle={glowStyle}
              borderStyle={borderStyle}
            />
          </ScrollRevealPhoto>
        </div>
      </section>

      {/* Memory Spotlight (Feature 4) */}
      {spotlightPhoto && (
        <MemorySpotlightView
          photo={spotlightPhoto}
          template={template}
          photoStyle={photoStyle}
          tokens={tokens}
          headingFont={headingFont}
          bodyFont={bodyFont}
          heroFocus={heroFocus}
          glowStyle={glowStyle}
        />
      )}

      {/* ======================================================== */}
      {/* CHAPTER 03 — THE PEOPLE                                 */}
      {/* ======================================================== */}
      {showChapters && innerCirclePhotos.length > 0 && (
        <ScrollReveal variant="heading">
          <CinematicChapterCard
            number="03 / 06"
            act="ACT III"
            title={chapters.chapter3 || 'THE PEOPLE'}
            template={template}
            tokens={tokens}
            headingFont={headingFont}
          />
        </ScrollReveal>
      )}

      {/* ======================================================== */}
      {/* 3. SECTION: INNER CIRCLE                                */}
      {/* ======================================================== */}
      {innerCirclePhotos.length > 0 && (
        <section id="sec-circle" className="relative px-4">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal variant="heading">
              <div className="text-center mb-10">
                <span
                  className="text-xs font-mono tracking-[0.25em] uppercase font-semibold block mb-2"
                  style={{ color: tokens.primary }}
                >
                  ACT III · {template === 'celebration' ? 'THE CREW' : template === 'elegance' ? 'PRIVATE COLLECTION' : 'INTIMATE CONNECTIONS'}
                </span>
                <SplitHeading
                  primaryPart={innerCircleSplit.primary}
                  secondaryPart={innerCircleSplit.secondary}
                  as="h2"
                  className={`text-3xl sm:text-4xl font-bold mb-3 ${headingFont}`}
                />
                <p
                  className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${bodyFont}`}
                  style={{ color: tokens.body }}
                >
                  {innerCircleIntro || 'A curated constellation of the most cherished milestones and closest companions.'}
                </p>
              </div>
            </ScrollReveal>

            {/* Circular / Gallery Composition Grid */}
            {photoStyle === 'polaroid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
                {innerCirclePhotos.map((photo, idx) => {
                  const angles = [-2.2, 1.8, -1.5, 2.4, -1.8, 1.6];
                  const angle = angles[idx % angles.length];
                  return (
                    <ScrollRevealPhoto
                      key={photo.id}
                      staggerIndex={idx}
                      className="cursor-pointer"
                    >
                      <div
                        onClick={() => setFullscreenViewer({ photo, index: idx })}
                        className="relative group transition-all duration-300"
                      >
                        {/* Mini top tape */}
                        <div 
                          className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#eae5d8]/80 border border-black/10 shadow-xs z-10 rounded-[1px] pointer-events-none transform -rotate-1"
                          style={{ clipPath: 'polygon(0 0, 100% 4%, 96% 100%, 4% 96%)' }}
                        />
                        <div
                          className="bg-[#FAF8F5] text-[#1c1917] p-3 pb-6 rounded-[3px] shadow-[0_12px_28px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)] border border-[#e8e4dc] transition-all duration-300 group-hover:scale-105 group-hover:rotate-0 group-hover:z-20 group-hover:shadow-2xl"
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          <div className="aspect-square overflow-hidden bg-black mb-2.5 relative rounded-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border border-black/15">
                            <AutoFitImage
                              src={photo.previewUrl}
                              alt={photo.caption}
                              focalPoint={heroFocus as any}
                              className="group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-1.5 left-1.5 text-[8px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-white/90">
                              CIRCLE #{idx + 1}
                            </div>
                          </div>
                          <div 
                            className="font-serif italic text-xs font-bold text-[#1c1917] truncate leading-tight"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            {photo.caption}
                          </div>
                          <div className="text-[10px] font-mono text-[#78716c] truncate mt-0.5">
                            {photo.location || photo.year || 'Cherished Memory'}
                          </div>
                        </div>
                      </div>
                    </ScrollRevealPhoto>
                  );
                })}
              </div>
            ) : photoStyle === 'film-strip' ? (
              <div className="bg-[#090909] border-y-2 border-[#262626] rounded-xl p-3 shadow-2xl space-y-2">
                <div className="h-3.5 bg-[#0C0C0C] border-b border-[#202020] px-3 flex items-center gap-3 overflow-hidden select-none">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={`ic-top-${i}`} className="w-2.5 h-1.5 rounded-[1px] bg-[#161616] border border-[#303030] shrink-0" />
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-1">
                  {innerCirclePhotos.map((photo, idx) => (
                    <ScrollRevealPhoto
                      key={photo.id}
                      staggerIndex={idx}
                      className="cursor-pointer"
                    >
                      <div
                        onClick={() => setFullscreenViewer({ photo, index: idx })}
                        className="border border-[#282828] bg-[#101010] p-2 rounded-lg group hover:border-[#E50914] transition-all"
                      >
                        <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 mb-1 px-1">
                          <span style={{ color: tokens.primary }}>▸ 35MM · C{idx + 1}</span>
                          <span>CIRCLE</span>
                        </div>
                        <div className="aspect-[4/3] overflow-hidden bg-black rounded relative mb-2">
                          <AutoFitImage
                            src={photo.previewUrl}
                            alt={photo.caption}
                            focalPoint={heroFocus as any}
                            className="group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="text-xs font-semibold text-white truncate px-1">
                          {photo.caption}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 truncate px-1">
                          {photo.location || photo.year || 'Key Frame'}
                        </div>
                      </div>
                    </ScrollRevealPhoto>
                  ))}
                </div>
                <div className="h-3.5 bg-[#0C0C0C] border-t border-[#202020] px-3 flex items-center gap-3 overflow-hidden select-none">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={`ic-bot-${i}`} className="w-2.5 h-1.5 rounded-[1px] bg-[#161616] border border-[#303030] shrink-0" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {innerCirclePhotos.map((photo, idx) => (
                  <ScrollRevealPhoto
                    key={photo.id}
                    staggerIndex={idx}
                    className="cursor-pointer"
                  >
                    <div
                      onClick={() => setFullscreenViewer({ photo, index: idx })}
                      className={`border p-4 transition-all duration-300 group hover:-translate-y-1 shadow-lg ${
                        photoStyle === 'fullscreen'
                          ? 'rounded-2xl border-2'
                          : template === 'memories'
                          ? 'rounded-3xl'
                          : template === 'elegance'
                          ? 'rounded-lg border-white/10'
                          : 'rounded-2xl'
                      }`}
                      style={{
                        backgroundColor: tokens.surface,
                        borderColor: borderStyle === 'none' ? 'transparent' : tokens.border,
                      }}
                    >
                      <div
                        className={`aspect-square overflow-hidden bg-black mb-3 relative ${
                          template === 'memories' ? 'rounded-2xl' : template === 'elegance' ? 'rounded-sm' : 'rounded-xl'
                        }`}
                      >
                        <AutoFitImage
                          src={photo.previewUrl}
                          alt={photo.caption}
                          focalPoint={heroFocus as any}
                          className="group-hover:scale-105 transition-transform duration-500"
                        />
                        <div
                          className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded border"
                          style={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            borderColor: tokens.border,
                            color: tokens.secondary,
                          }}
                        >
                          CIRCLE #{idx + 1}
                        </div>
                      </div>

                      <div
                        className="text-sm font-semibold truncate mb-1"
                        style={{ color: tokens.secondary }}
                      >
                        {photo.caption}
                      </div>
                      <div
                        className="text-[11px] font-mono truncate"
                        style={{ color: tokens.muted }}
                      >
                        {photo.location || photo.year || 'Timeless Memory'}
                      </div>
                    </div>
                  </ScrollRevealPhoto>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* CHAPTER 04 — THE VAULT                                  */}
      {/* ======================================================== */}
      {showChapters && (
        <ScrollReveal variant="heading">
          <CinematicChapterCard
            number="04 / 06"
            act="ACT IV"
            title={chapters.chapter4 || 'THE VAULT'}
            template={template}
            tokens={tokens}
            headingFont={headingFont}
          />
        </ScrollReveal>
      )}

      {/* ======================================================== */}
      {/* 5. SECTION 5 — 3D PHOTO VAULT                           */}
      {/* ======================================================== */}
      <section
        id="sec-vault"
        className="relative px-4 py-14 overflow-hidden border-y rounded-3xl"
        style={{
          backgroundColor: tokens.surface,
          borderColor: borderStyle === 'none' ? 'transparent' : tokens.border,
        }}
      >
        <div className="max-w-6xl mx-auto">
          <ScrollReveal variant="heading">
            <div className="text-center mb-10">
              <span
                className="text-xs font-mono tracking-[0.25em] uppercase font-semibold block mb-2"
                style={{ color: tokens.primary }}
              >
                ACT V · {template === 'memories' ? 'ARCHIVAL CAROUSEL' : template === 'elegance' ? 'SALON GALLERY' : 'THE DIGITAL SANCTUARY'}
              </span>
              <SplitHeading
                primaryPart={vaultSplit.primary}
                secondaryPart={vaultSplit.secondary}
                as="h2"
                className={`text-3xl sm:text-5xl font-black mb-3 ${headingFont}`}
              />
              <p
                className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${bodyFont}`}
                style={{ color: tokens.body }}
              >
                {vaultIntro || 'First viewed as memories. Now preserved eternally in a rotating 3D archival vault.'}
              </p>
            </div>
          </ScrollReveal>

          {/* Dynamic 3D Vault with Adaptive Geometry for 6 to 25 Photos & Fullscreen Expand */}
          <ScrollReveal variant="vault">
            <ThreeDimensionalVault
              photos={photos}
              photoStyle={photoStyle}
              template={template}
              heroFocus={heroFocus}
              glowStyle={glowStyle}
              borderStyle={borderStyle}
              tokens={tokens}
              headingFont={headingFont}
              bodyFont={bodyFont}
              vaultIntro={vaultIntro}
              onOpenFullscreen={(photo, idx) => setFullscreenViewer({ photo, index: idx })}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Chapter 05 — THE SECRET ARCHIVE */}
      {showChapters && hasSecrets && (
        <ScrollReveal variant="heading">
          <CinematicChapterCard
            number="05 / 06"
            act="ACT VI"
            title={chapters.chapter5 || 'THE SECRET ARCHIVE'}
            template={template}
            tokens={tokens}
            headingFont={headingFont}
          />
        </ScrollReveal>
      )}

      {/* Canonical Secret Memories (0 to 5) - Strictly owns secret reveal */}
      {hasSecrets && (
        <div id="sec-secret" className="space-y-8">
          {canonicalSecretPhotos.map((secret) => (
            <ScrollReveal key={secret.id} once={true}>
              <SecretRevealView
                photo={secret}
                template={template}
                photoStyle={photoStyle}
                tokens={tokens}
                headingFont={headingFont}
                bodyFont={bodyFont}
                heroFocus={heroFocus}
                glowStyle={glowStyle}
                isInitiallyRevealed={playedSecretIds.has(secret.id)}
                onRevealed={() => handleSecretRevealed(secret.id)}
              />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Surprise Lock (Feature 5) */}
      {showSurpriseLock && (
        <ScrollReveal once={true}>
          <SurpriseLockView
            template={template}
            tokens={tokens}
            headingFont={headingFont}
            bodyFont={bodyFont}
          />
        </ScrollReveal>
      )}

      {/* ======================================================== */}
      {/* CHAPTER 06 — FINALE                                     */}
      {/* ======================================================== */}
      {showChapters && (
        <ScrollReveal variant="heading">
          <CinematicChapterCard
            number="06 / 06"
            act={hasSecrets ? 'ACT VII' : 'ACT VI'}
            title={chapters.chapter6 || 'FINALE'}
            template={template}
            tokens={tokens}
            headingFont={headingFont}
          />
        </ScrollReveal>
      )}

      {/* ======================================================== */}
      {/* 7. SECTION 7 — REFERENCE-INSPIRED FINAL CINEMATIC REVEAL */}
      {/* ======================================================== */}
      <ScrollReveal variant="heading">
        <section id="sec-finale" className="relative w-full">
          <FinalCinematicReveal
            recipientName={recipientName}
            finalMessage={finalMessage}
            senderName={senderName}
            template={template}
            tokens={tokens}
            headingFont={headingFont}
            bodyFont={bodyFont}
            heroFocus={heroFocus}
            glowStyle={glowStyle}
          />
        </section>
      </ScrollReveal>

      {/* Hidden Message (Feature 2) */}
      {cinematicExtras?.hiddenMessageEnabled && cinematicExtras.hiddenMessageText && (
        <HiddenMessageTrigger
          messageText={cinematicExtras.hiddenMessageText}
          senderName={senderName}
          template={template}
          tokens={tokens}
          headingFont={headingFont}
          bodyFont={bodyFont}
        />
      )}

      {/* Emotional Reaction (Feature 8) */}
      <EmotionalReactionView
        template={template}
        tokens={tokens}
        headingFont={headingFont}
      />

      {/* Replay Experience Button (Feature 7) */}
      <ReplayButton
        template={template}
        tokens={tokens}
        onReplay={handleReplay}
      />

      {/* Hidden Easter Egg Modal (Feature 10) */}
      <EasterEggModal
        isOpen={easterEggOpen}
        onClose={() => setEasterEggOpen(false)}
        accentColor={tokens.primary}
      />

      {/* High-Resolution Fullscreen Image Viewer with Scroll State Preservation */}
      <FullscreenImageViewer
        isOpen={!!fullscreenViewer}
        photo={fullscreenViewer?.photo || null}
        currentIndex={fullscreenViewer?.index}
        totalCount={photos.length}
        onClose={() => setFullscreenViewer(null)}
      />
    </div>
  );
};
