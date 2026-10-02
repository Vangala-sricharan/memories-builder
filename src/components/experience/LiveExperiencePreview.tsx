import React, { useState, useEffect, useRef } from 'react';
import { BirthdayExperienceDraft } from '../../types';
import { ParticleBackground } from '../ParticleBackground';
import { BirthdayStoryExperience } from './BirthdayStoryExperience';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Edit3
} from 'lucide-react';

interface LiveExperiencePreviewProps {
  draft: BirthdayExperienceDraft;
  onBackToEdit: () => void;
  onPublishClick?: () => void;
}

export const LiveExperiencePreview: React.FC<LiveExperiencePreviewProps> = ({
  draft,
  onBackToEdit,
  onPublishClick,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio if available in draft
  useEffect(() => {
    if (draft.music?.url) {
      const audio = new Audio(draft.music.url);
      audioRef.current = audio;
      audio.volume = 0.85;

      const handleEnded = () => {
        setIsPlayingAudio(false);
      };

      audio.addEventListener('ended', handleEnded);

      // Attempt soft autoplay preview
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
  }, [draft.music?.url]);

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

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-[#E50914] relative overflow-x-hidden">
      {/* Global Cinematic Particle Background */}
      <ParticleBackground
        currentShape="abstract"
        intensity={draft.particleIntensity}
        interactive={true}
      />

      {/* Floating Studio Return / Premiere Control Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/90 backdrop-blur-md border-b border-[#222222] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToEdit}
              className="px-3.5 py-1.5 rounded-lg bg-[#181818] border border-[#2E2E2E] hover:border-[#E50914] text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Back to Studio</span>
            </button>

            <span className="hidden sm:inline-flex items-center gap-2 text-xs font-mono text-neutral-400 border-l border-[#292929] pl-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>PREVIEW MODE · TIMER NOT STARTED · EDITABLE</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio controller in top bar */}
            {draft.music && (
              <div className="flex items-center gap-3 bg-[#121212] border border-[#2B2B2B] px-3 py-1.5 rounded-xl text-xs">
                <button
                  onClick={toggleAudio}
                  className="w-7 h-7 rounded-full bg-[#E50914] hover:bg-[#c90711] text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  )}
                </button>

                <div className="max-w-[120px] sm:max-w-[180px] truncate text-[11px] font-medium text-white">
                  {draft.music.fileName}
                </div>

                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            )}

            {onPublishClick && (
              <button
                onClick={onPublishClick}
                className="px-4 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#c90711] text-xs font-bold uppercase tracking-wider text-white transition-all shadow-lg shadow-[#E50914]/20 cursor-pointer hidden md:flex items-center gap-1.5"
              >
                <span>Publish</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main 7-Act Storyline Flow */}
      <main className="relative z-10 pt-24 pb-28 max-w-6xl mx-auto">
        <BirthdayStoryExperience
          recipientName={draft.recipientName || 'Alex'}
          birthdayMessage={draft.birthdayMessage}
          tagline={draft.tagline}
          openingQuote={draft.openingQuote}
          storyNarrative={draft.storyNarrative}
          photos={draft.photos}
          heroPhotoId={draft.heroPhotoId}
          innerCirclePhotoIds={draft.innerCirclePhotoIds}
          innerCircleIntro={draft.innerCircleIntro}
          vaultIntro={draft.vaultIntro}
          surprisePhoto={draft.surprisePhoto}
          surpriseText={draft.surpriseText}
          finalMessage={draft.finalMessage}
          senderName={draft.senderName}
          music={draft.music}
        />
      </main>

      {/* Bottom Sticky Premiere Notice */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#121212]/95 border border-[#292929] px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-4 text-xs font-mono text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>PREVIEW ONLY · 24-HOUR TIMER STARTS AT PUBLISH</span>
        </div>
        <span className="text-neutral-600">·</span>
        <button
          onClick={onBackToEdit}
          className="text-[#E50914] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Back to Edit</span>
        </button>
      </div>
    </div>
  );
};
