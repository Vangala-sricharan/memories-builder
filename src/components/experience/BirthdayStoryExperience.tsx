import React, { useState, useEffect } from 'react';
import { UploadedPhoto, UploadedMusic } from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { 
  Sparkles, 
  Heart, 
  MapPin, 
  Calendar, 
  Eye, 
  Lock, 
  Unlock, 
  RotateCw, 
  Volume2, 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight,
  Compass
} from 'lucide-react';

interface BirthdayStoryExperienceProps {
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
  surpriseText?: string;
  finalMessage?: string;
  senderName?: string;
  music?: UploadedMusic | null;
  isStandalone?: boolean;
}

export const BirthdayStoryExperience: React.FC<BirthdayStoryExperienceProps> = ({
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
  surpriseText,
  finalMessage = 'May the year ahead bring the same unyielding joy and wonder that you bring into the lives of everyone lucky enough to know you.',
  senderName,
  music,
  isStandalone = false,
}) => {
  // Determine Hero Photo: selected photo or first uploaded photo
  const heroPhoto = photos.find((p) => p.id === heroPhotoId) || photos[0];

  // Determine Inner Circle photos: explicitly chosen IDs or first 3-4 photos
  const innerCirclePhotos = innerCirclePhotoIds.length > 0
    ? photos.filter((p) => innerCirclePhotoIds.includes(p.id))
    : photos.slice(0, Math.min(4, photos.length));

  // 3D Vault interactive rotation angle
  const [vaultRotation, setVaultRotation] = useState(0);
  const [isVaultAutoSpinning, setIsVaultAutoSpinning] = useState(true);

  // Surprise Image reveal state
  const [surpriseRevealed, setSurpriseRevealed] = useState(false);

  // Selected photo viewer index in Memory Sequence
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);

  // Auto-spin for the 3D Photo Vault
  useEffect(() => {
    if (!isVaultAutoSpinning) return;
    const interval = setInterval(() => {
      setVaultRotation((prev) => (prev + 0.4) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isVaultAutoSpinning]);

  const totalVaultCards = photos.length;
  const radius = Math.max(260, Math.min(440, photos.length * 45));

  return (
    <div className="w-full space-y-24 sm:space-y-32 text-white">
      {/* ======================================================== */}
      {/* 1. SECTION 1 — BIRTHDAY WISH / OPENING                  */}
      {/* ======================================================== */}
      <section className="relative text-center py-16 sm:py-24 px-4 overflow-hidden">
        {/* Subtle radial ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#E50914]/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#2B2B2B]">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-300">
              ACT I · PROLOGUE
            </span>
          </div>

          <p className="text-xs uppercase tracking-[0.35em] text-[#E50914] font-semibold">
            {tagline}
          </p>

          <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight uppercase leading-[1.08] [text-wrap:balance]">
            HAPPY BIRTHDAY, <br />
            <span className="text-[#E50914]">{recipientName}</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-300 font-serif italic max-w-xl mx-auto leading-relaxed pt-2">
            {openingQuote}
          </p>

          {birthdayMessage && (
            <div className="pt-4 max-w-lg mx-auto">
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans bg-[#121212]/80 border border-[#242424] rounded-xl p-4 sm:p-5 shadow-lg">
                "{birthdayMessage}"
              </p>
            </div>
          )}

          {senderName && (
            <div className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase pt-2">
              PRESENTED WITH LOVE BY {senderName}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. SECTION 2 — HERO IMAGE                               */}
      {/* ======================================================== */}
      {heroPhoto && (
        <section className="relative px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full" />
                <span>ACT II · HERO SPOTLIGHT</span>
              </span>
              <span className="text-neutral-400">2.39:1 CINEMATIC MASTER</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[#2B2B2B] bg-[#0A0A0A] shadow-2xl group">
              {/* Image Frame */}
              <div className="relative aspect-[16/9] w-full max-h-[580px] bg-black flex items-center justify-center overflow-hidden">
                <AutoFitImage
                  src={heroPhoto.previewUrl}
                  alt={heroPhoto.caption}
                  enableBackdropGlow={true}
                  className="group-hover:scale-[1.02] transition-transform duration-700"
                />

                {/* Ambient Scrims */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

                {/* Hero Caption Overlay */}
                <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E50914] block mb-1">
                      THE DEFINITIVE PORTRAIT
                    </span>
                    <h3 className="font-cinzel text-xl sm:text-3xl font-bold text-white tracking-wide">
                      {heroPhoto.caption}
                    </h3>
                    {heroPhoto.location && (
                      <p className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                        <span>{heroPhoto.location}</span>
                        {heroPhoto.year && <span>· {heroPhoto.year}</span>}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-xs text-neutral-400 bg-black/80 px-3 py-1 rounded-full border border-white/10 self-start sm:self-auto">
                    HERO FRAME
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 3. SECTION 3 — INNER CIRCLE                             */}
      {/* ======================================================== */}
      {innerCirclePhotos.length > 0 && (
        <section className="relative px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#E50914] font-semibold block mb-2">
                ACT III · INTIMATE CONNECTIONS
              </span>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mb-3">
                THE INNER CIRCLE
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
                {innerCircleIntro || 'A curated constellation of the most cherished milestones and closest companions.'}
              </p>
            </div>

            {/* Circular Composition Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {innerCirclePhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="bg-[#121212] border border-[#262626] hover:border-[#E50914] rounded-2xl p-4 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-black mb-3 relative">
                    <AutoFitImage
                      src={photo.previewUrl}
                      alt={photo.caption}
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-black/80 text-[10px] font-mono px-2 py-0.5 rounded text-white border border-white/15">
                      CIRCLE #{idx + 1}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-white truncate mb-1">
                    {photo.caption}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono truncate">
                    {photo.location || photo.year || 'Timeless Memory'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 4. SECTION 4 — ALL IMAGES / MEMORY SEQUENCE             */}
      {/* ======================================================== */}
      <section className="relative px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#E50914] font-semibold block mb-2">
              ACT IV · THE COMPLETE ARCHIVE
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              THE MEMORY SEQUENCE
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Every chapter, laughter, and wild adventure preserved in sequence ({photos.length} total photographs).
            </p>

            {storyNarrative && (
              <div className="mt-4 max-w-xl mx-auto p-4 rounded-xl bg-[#141414]/90 border border-[#262626]">
                <p className="text-xs sm:text-sm text-neutral-300 font-serif italic leading-relaxed">
                  "{storyNarrative}"
                </p>
              </div>
            )}
          </div>

          {/* Staggered Editorial Memory Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setActiveMemoryIndex(index)}
                className={`bg-[#111111] border rounded-2xl p-5 transition-all duration-300 group cursor-pointer ${
                  activeMemoryIndex === index
                    ? 'border-[#E50914] shadow-2xl shadow-[#E50914]/15'
                    : 'border-[#242424] hover:border-neutral-500'
                }`}
              >
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-black mb-4 relative">
                  <AutoFitImage
                    src={photo.previewUrl}
                    alt={photo.caption}
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-white border border-white/20">
                    MEMORY #{String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span className="text-[#E50914]">{photo.year || 'TIMELINE'}</span>
                    {photo.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-500" />
                        {photo.location}
                      </span>
                    )}
                  </div>
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-white group-hover:text-[#E50914] transition-colors">
                    {photo.caption}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECTION 5 — 3D PHOTO VAULT                           */}
      {/* ======================================================== */}
      <section className="relative px-4 py-12 overflow-hidden bg-[#0A0A0A]/90 border-y border-[#202020] rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#E50914] font-semibold block mb-2">
              ACT V · THE DIGITAL SANCTUARY
            </span>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white mb-3">
              THE 3D PHOTO VAULT
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
              {vaultIntro || 'First viewed as memories. Now preserved eternally in a rotating 3D archival vault.'}
            </p>

            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setIsVaultAutoSpinning(!isVaultAutoSpinning)}
                className="px-3.5 py-1 rounded-full bg-[#181818] border border-[#2B2B2B] text-xs font-mono text-neutral-300 hover:text-white hover:border-[#E50914] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3 h-3 text-[#E50914]" />
                <span>{isVaultAutoSpinning ? 'Pause Rotation' : 'Resume Rotation'}</span>
              </button>
            </div>
          </div>

          {/* 3D Perspective Vault Stage */}
          <div
            className="relative h-[440px] sm:h-[500px] w-full flex items-center justify-center select-none"
            style={{ perspective: '1200px' }}
          >
            {/* Ambient center spotlight pedestal */}
            <div className="absolute w-64 h-64 bg-[#E50914]/20 rounded-full blur-[90px] pointer-events-none" />

            <div
              className="relative w-48 sm:w-56 h-64 sm:h-72 transition-transform duration-100 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateY(${vaultRotation}deg)`,
              }}
            >
              {photos.map((photo, idx) => {
                const angle = (idx / totalVaultCards) * 360;
                return (
                  <div
                    key={`vault-${photo.id}`}
                    className="absolute inset-0 rounded-2xl overflow-hidden border border-[#3A1414] bg-[#140808] shadow-2xl p-2 flex flex-col justify-between"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <div className="w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-black relative">
                      <AutoFitImage
                        src={photo.previewUrl}
                        alt={photo.caption}
                      />
                      <div className="absolute top-1.5 left-1.5 bg-black/85 text-[9px] font-mono px-1.5 py-0.5 rounded text-white border border-white/10">
                        VAULT #{idx + 1}
                      </div>
                    </div>
                    <div className="p-1">
                      <div className="text-[11px] font-bold text-white truncate">
                        {photo.caption}
                      </div>
                      <div className="text-[9px] text-[#E50914] font-mono">
                        ETERNALLY PRESERVED
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. SECTION 6 — OPTIONAL SURPRISE IMAGE                  */}
      {/* (Only rendered if surprisePhoto is provided)             */}
      {/* ======================================================== */}
      {surprisePhoto && (
        <section className="relative px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#120808] border border-[#3D1414] rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#E50914]/20 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 text-[#FF4D4D] text-xs font-mono uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ACT VI · CONFIDENTIAL REVEAL</span>
                </div>

                <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-white">
                  A SPECIAL SURPRISE MOMENT
                </h2>

                <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                  {surpriseText || 'A secluded memory kept hidden until this very moment.'}
                </p>

                {!surpriseRevealed ? (
                  <div className="py-6">
                    <button
                      onClick={() => setSurpriseRevealed(true)}
                      className="px-8 py-4 rounded-xl bg-[#E50914] hover:bg-[#c90711] text-white text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-xl shadow-[#E50914]/30 hover:scale-105 cursor-pointer inline-flex items-center gap-2"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>UNLOCK SURPRISE MEMORY</span>
                    </button>
                  </div>
                ) : (
                  <div className="animate-fade-in pt-4 max-w-2xl mx-auto space-y-4">
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#E50914] shadow-2xl bg-black">
                      <AutoFitImage
                        src={surprisePhoto.previewUrl}
                        alt={surprisePhoto.caption}
                        enableBackdropGlow={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 right-4 text-left">
                        <span className="text-[10px] font-mono text-[#E50914] uppercase tracking-wider">
                          UNLOCKED SURPRISE
                        </span>
                        <h4 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                          {surprisePhoto.caption}
                        </h4>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 7. SECTION 7 — FINAL BIRTHDAY WISH                      */}
      {/* ======================================================== */}
      <section className="relative text-center py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#E50914]">
            <Heart className="w-4 h-4 fill-[#E50914]" />
            <span>ACT VII · EPILOGUE</span>
          </div>

          <h2 className="font-cinzel text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-tight [text-wrap:balance]">
            HAPPY BIRTHDAY, <br />
            <span className="text-[#E50914]">{recipientName}</span>
          </h2>

          <div className="w-16 h-px bg-neutral-600 mx-auto" />

          <p className="text-base sm:text-lg text-neutral-200 font-serif italic max-w-xl mx-auto leading-relaxed [text-wrap:balance]">
            "{finalMessage}"
          </p>

          {senderName && (
            <div className="pt-4 text-xs font-mono tracking-widest uppercase text-neutral-400">
              WITH ALL OUR LOVE · {senderName}
            </div>
          )}

          <div className="pt-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#E50914]">
              THE END · A 24-HOUR LIFETIME MEMORY
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
