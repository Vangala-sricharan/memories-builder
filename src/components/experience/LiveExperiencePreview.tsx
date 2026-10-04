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
  Edit3,
  Monitor,
  Smartphone,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  ArrowRight
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
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [experienceKey, setExperienceKey] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleRestart = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setExperienceKey((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen text-white relative overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: draft.theme?.background || '#060606' }}
    >
      {/* Global Cinematic Particle Background */}
      <ParticleBackground
        currentShape="abstract"
        intensity={draft.particleIntensity}
        interactive={true}
        template={draft.template || 'cinema'}
        primaryColor={draft.theme?.primary || '#E50914'}
      />

      {/* Floating Studio Return / Premiere Control Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/92 backdrop-blur-md border-b border-[#222222] px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Back to Studio & Restart */}
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToEdit}
              className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#2E2E2E] hover:border-[#E50914] text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#E50914]" />
              <span className="hidden sm:inline">Back to Studio</span>
              <span className="sm:hidden">Edit</span>
            </button>

            <button
              onClick={handleRestart}
              className="px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#2E2E2E] hover:border-neutral-500 text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              title="Restart the cinematic sequence from the opening"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden md:inline">Restart Experience</span>
            </button>
          </div>

          {/* Center: Device Viewport Switcher */}
          <div className="flex items-center bg-[#121212] border border-[#2B2B2B] rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceMode === 'desktop'
                  ? 'bg-[#222222] text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Desktop Wide View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-[#222222] text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Mobile Device View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Right: Audio controller & Publish */}
          <div className="flex items-center gap-2">
            {/* Audio controller in top bar */}
            {draft.music && (
              <div className="flex items-center gap-2 bg-[#121212] border border-[#2B2B2B] px-2.5 py-1 rounded-xl text-xs">
                <button
                  onClick={toggleAudio}
                  className="w-6 h-6 rounded-full bg-[#E50914] hover:bg-[#c90711] text-white flex items-center justify-center transition-colors cursor-pointer"
                  title={isPlayingAudio ? 'Pause music' : 'Play music'}
                >
                  {isPlayingAudio ? (
                    <Pause className="w-3 h-3 fill-white" />
                  ) : (
                    <Play className="w-3 h-3 fill-white ml-0.5" />
                  )}
                </button>

                <div className="max-w-[80px] sm:max-w-[140px] truncate text-[11px] font-medium text-white hidden sm:block">
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
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {onPublishClick && (
              <button
                onClick={onPublishClick}
                className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#c90711] text-xs font-bold uppercase tracking-wider text-white transition-all shadow-lg shadow-[#E50914]/20 cursor-pointer flex items-center gap-1.5"
              >
                <span>Publish</span>
                <span className="hidden sm:inline">24H</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Storyline Stage with Responsive/Device Frame */}
      <main className="relative z-10 pt-20 pb-28">
        {deviceMode === 'mobile' ? (
          <div className="max-w-[420px] mx-auto px-2 py-6">
            {/* Realistic Mobile Device Mockup Frame */}
            <div className="relative rounded-[44px] border-[10px] border-[#1C1C1E] bg-black shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
              {/* Top Speaker / Camera Notch */}
              <div className="h-6 bg-[#1C1C1E] flex items-center justify-center">
                <div className="w-20 h-4 bg-black rounded-full" />
              </div>

              {/* Mobile Viewport Screen */}
              <div className="h-[800px] overflow-y-auto overflow-x-hidden p-2">
                <BirthdayStoryExperience
                  key={`mobile-${experienceKey}`}
                  template={draft.template}
                  theme={draft.theme}
                  customization={draft.customization}
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
              </div>

              {/* Bottom Home Indicator */}
              <div className="h-4 bg-[#1C1C1E] flex items-center justify-center">
                <div className="w-28 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <BirthdayStoryExperience
              key={`desktop-${experienceKey}`}
              template={draft.template}
              theme={draft.theme}
              customization={draft.customization}
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
          </div>
        )}

        {/* End of Preview: "Looks perfect? Publish for 24 hours →" */}
        <div className="pt-16 pb-20 text-center space-y-4 max-w-md mx-auto px-4">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 block font-semibold">
            LOOKS PERFECT?
          </span>
          {onPublishClick && (
            <button
              type="button"
              onClick={onPublishClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#E50914] hover:bg-[#c90711] text-white text-sm sm:text-base font-bold uppercase tracking-wider transition-all shadow-2xl shadow-[#E50914]/30 hover:scale-105 cursor-pointer inline-flex items-center justify-center gap-3"
            >
              <span>Publish for 24 hours</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <p className="text-[11px] font-mono text-neutral-500">
            Once published, the 24-hour countdown begins and the private link is activated.
          </p>
        </div>
      </main>

      {/* Bottom Sticky Premiere Notice */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#121212]/95 border border-[#292929] px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-4 text-xs font-mono text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>PREVIEW MODE · EDITABLE</span>
        </div>
        <span className="text-neutral-600">·</span>
        <button
          onClick={onBackToEdit}
          className="text-[#E50914] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Draft</span>
        </button>
      </div>
    </div>
  );
};
