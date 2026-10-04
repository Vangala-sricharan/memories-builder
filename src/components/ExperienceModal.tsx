import React, { useEffect } from 'react';
import { sampleBirthdayData } from '../data/sampleBirthdayData';
import { BirthdayStoryExperience } from './experience/BirthdayStoryExperience';
import { X } from 'lucide-react';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Convert sample data memories to UploadedPhoto format
  const samplePhotos = sampleBirthdayData.memories.map((m) => ({
    id: m.id,
    previewUrl: createSampleMemoryDataUrl(m.caption),
    caption: m.caption,
    location: m.location,
    year: m.year,
    aspect: m.aspect,
  }));

  const sampleSurprise = sampleBirthdayData.surpriseMemory ? {
    id: sampleBirthdayData.surpriseMemory.id,
    previewUrl: createSampleMemoryDataUrl('The Secret Reunion Toast'),
    caption: sampleBirthdayData.surpriseMemory.caption,
    location: sampleBirthdayData.surpriseMemory.location,
    year: sampleBirthdayData.surpriseMemory.year,
    aspect: sampleBirthdayData.surpriseMemory.aspect,
  } : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl animate-fade-in overflow-y-auto">
      {/* Top Modal Controls Bar */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-auto max-w-7xl mx-auto">
        <div className="flex items-center gap-2 bg-[#121212]/90 border border-[#292929] px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
          <span className="text-xs font-mono uppercase text-white tracking-widest">
            THEATRE MODE // FIXED 7-ACT STORY PREMIERE
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close Premiere"
          className="p-2.5 rounded-full bg-[#1C1C1C] border border-[#2E2E2E] text-white hover:bg-[#E50914] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Theatrical Container */}
      <div className="w-full max-w-5xl my-auto pt-16 pb-8">
        <div className="relative">
          <BirthdayStoryExperience
            recipientName={sampleBirthdayData.recipientName}
            birthdayMessage={sampleBirthdayData.personalNarrative}
            tagline={sampleBirthdayData.tagline}
            openingQuote={sampleBirthdayData.openingQuote}
            photos={samplePhotos}
            heroPhotoId={sampleBirthdayData.heroMemoryId}
            innerCirclePhotoIds={sampleBirthdayData.innerCircleMemoryIds}
            surprisePhoto={sampleSurprise}
            finalMessage={sampleBirthdayData.finalMessage}
            senderName="Jordan & The Crew"
            cinematicExtras={{
              chapterTitlesEnabled: true,
              memorySpotlightEnabled: true,
              spotlightPhotoIds: [samplePhotos[1]?.id || 'sample-2'],
              secretRevealEnabled: false,
              surpriseLockEnabled: true,
              hiddenMessageEnabled: true,
              hiddenMessageText: "You are the heart and anchor of our entire circle. Happy Birthday!",
              easterEggEnabled: true,
            }}
            isStandalone={true}
          />
        </div>

        {/* Bottom floating theater bar */}
        <div className="mt-8 flex items-center justify-between text-xs text-neutral-400 px-4">
          <div>
            <span>Press <kbd className="px-1.5 py-0.5 bg-[#1F1F1F] rounded text-white text-[10px]">ESC</kbd> to return</span>
          </div>
          <div className="font-mono text-[11px] text-[#E50914]">
            24-HOUR EPHEMERAL PREMIERE SIMULATION
          </div>
        </div>
      </div>
    </div>
  );
};

// Generates simple clean styled canvas images for the demo modal
function createSampleMemoryDataUrl(title: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 800, 600);
  grad.addColorStop(0, '#1c0a0a');
  grad.addColorStop(1, '#080808');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);

  // Subtle grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 800; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 600);
    ctx.stroke();
  }

  // Red glow center
  const rad = ctx.createRadialGradient(400, 300, 10, 400, 300, 280);
  rad.addColorStop(0, 'rgba(229, 9, 20, 0.3)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rad;
  ctx.beginPath();
  ctx.arc(400, 300, 280, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 400, 310);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '13px monospace';
  ctx.fillText('CINEMATIC 35MM FRAME · PRESERVED STILL', 400, 350);

  return canvas.toDataURL('image/jpeg', 0.85);
}
