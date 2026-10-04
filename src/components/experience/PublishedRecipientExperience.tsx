import React, { useState, useEffect, useRef } from 'react';
import { PublishedExperienceSnapshot } from '../../types';
import { ParticleBackground } from '../ParticleBackground';
import { BirthdayStoryExperience } from './BirthdayStoryExperience';
import { ExpiredExperienceView } from './ExpiredExperienceView';
import { isExperienceExpired, simulateExpireExperience } from '../../services/publishService';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Clock, 
  Share2, 
  Check, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface PublishedRecipientExperienceProps {
  snapshot: PublishedExperienceSnapshot;
  onReturnHome?: () => void;
  onCreateNew?: () => void;
}

export const PublishedRecipientExperience: React.FC<PublishedRecipientExperienceProps> = ({
  snapshot: initialSnapshot,
  onReturnHome,
  onCreateNew,
}) => {
  const [snapshot, setSnapshot] = useState<PublishedExperienceSnapshot>(initialSnapshot);
  const [isExpired, setIsExpired] = useState<boolean>(() => isExperienceExpired(initialSnapshot));
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Monitor expiration periodically
  useEffect(() => {
    const checkExpiry = () => {
      if (isExperienceExpired(snapshot)) {
        setIsExpired(true);
      }
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 5000);
    return () => clearInterval(interval);
  }, [snapshot]);

  // Audio setup
  useEffect(() => {
    if (snapshot.music?.url && !isExpired) {
      const audio = new Audio(snapshot.music.url);
      audioRef.current = audio;
      audio.volume = 0.85;

      const handleEnded = () => setIsPlayingAudio(false);
      audio.addEventListener('ended', handleEnded);

      // Attempt soft autoplay
      audio.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {
        setIsPlayingAudio(false);
      });

      return () => {
        audio.pause();
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [snapshot.music?.url, isExpired]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {});
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Developer simulation helper to trigger expired state
  const handleSimulateExpiration = async () => {
    const expired = await simulateExpireExperience(snapshot.experienceId);
    if (expired) {
      setSnapshot(expired);
      setIsExpired(true);
    }
  };

  // If expired, strictly render the expiration view (no photos, no audio, no messages revealed)
  if (isExpired) {
    return (
      <ExpiredExperienceView
        onReturnHome={onReturnHome}
        onCreateNew={onCreateNew}
      />
    );
  }

  return (
    <div
      className="min-h-screen text-white relative overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: snapshot.theme?.background || '#070707' }}
    >
      {/* Global Particle Atmosphere */}
      <ParticleBackground
        currentShape="abstract"
        intensity={snapshot.particleIntensity || 'normal'}
        interactive={true}
        template={snapshot.template || 'cinema'}
        primaryColor={snapshot.theme?.primary || '#E50914'}
      />

      {/* Floating Recipient Top Navigation (Completely clean, zero editor controls) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/85 backdrop-blur-md border-b border-[#222222] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-base sm:text-lg font-bold tracking-[0.25em] text-white">
              BIRTHDAY
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#E50914] font-semibold">
              PREMIERE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio controller */}
            {snapshot.music && (
              <div className="flex items-center gap-2 bg-[#141414] border border-[#2B2B2B] px-3 py-1.5 rounded-full text-xs">
                <button
                  onClick={toggleAudio}
                  aria-label={isPlayingAudio ? 'Pause Music' : 'Play Music'}
                  className="w-6 h-6 rounded-full bg-[#E50914] hover:bg-[#c90711] text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-3 h-3 fill-white" />
                  ) : (
                    <Play className="w-3 h-3 fill-white ml-0.5" />
                  )}
                </button>

                <span className="hidden sm:inline text-[11px] font-mono text-neutral-300 max-w-[120px] truncate">
                  {snapshot.music.fileName}
                </span>

                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="text-neutral-400 hover:text-white cursor-pointer ml-1"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Discreet share / copy link button */}
            <button
              onClick={handleCopyLink}
              title="Copy private premiere link"
              className="px-3 py-1.5 rounded-full bg-[#141414] border border-[#2B2B2B] text-xs font-mono text-neutral-300 hover:text-white hover:border-[#E50914] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#E50914]" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main 7-Act Storyline Flow */}
      <main className="relative z-10 pt-24 pb-28 max-w-6xl mx-auto">
        <BirthdayStoryExperience
          template={snapshot.template}
          theme={snapshot.theme}
          customization={snapshot.customization}
          recipientName={snapshot.recipientName}
          birthdayMessage={snapshot.birthdayMessage}
          tagline={snapshot.tagline}
          openingQuote={snapshot.openingQuote}
          storyNarrative={snapshot.storyNarrative}
          photos={snapshot.photos as any}
          heroPhotoId={snapshot.heroPhotoId}
          innerCirclePhotoIds={snapshot.innerCirclePhotoIds as any}
          innerCircleIntro={snapshot.innerCircleIntro}
          vaultIntro={snapshot.vaultIntro}
          surprisePhoto={snapshot.surprisePhoto}
          surpriseText={snapshot.surpriseText}
          finalMessage={snapshot.finalMessage}
          senderName={snapshot.senderName}
          music={snapshot.music}
          isStandalone={true}
        />
      </main>

      {/* Floating discreet bottom indicator */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        {/* Developer simulation tool for testing expiration */}
        <button
          onClick={handleSimulateExpiration}
          title="Test Expiration State (Stage 4 QA helper)"
          className="text-[10px] font-mono text-neutral-600 hover:text-neutral-300 bg-[#0E0E0E]/80 border border-neutral-800 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
        >
          [Dev: Simulate Expiration]
        </button>

        {onReturnHome && (
          <button
            onClick={onReturnHome}
            className="text-[11px] font-mono text-neutral-400 hover:text-white bg-[#121212]/90 border border-[#262626] px-3 py-1.5 rounded-full shadow-lg transition-colors cursor-pointer"
          >
            Studio Home
          </button>
        )}
      </div>
    </div>
  );
};
