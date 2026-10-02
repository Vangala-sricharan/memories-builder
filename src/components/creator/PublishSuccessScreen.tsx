import React, { useState, useEffect } from 'react';
import { PublishedExperienceSnapshot } from '../../types';
import { 
  Check, 
  Copy, 
  ExternalLink, 
  Clock, 
  Lock, 
  Sparkles, 
  Heart, 
  Share2, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

interface PublishSuccessScreenProps {
  snapshot: PublishedExperienceSnapshot;
  onOpenExperience: () => void;
  onCreateAnother: () => void;
  onReturnHome: () => void;
}

export const PublishSuccessScreen: React.FC<PublishSuccessScreenProps> = ({
  snapshot,
  onOpenExperience,
  onCreateAnother,
  onReturnHome,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Construct opaque share URL: origin + '/b/' + experienceId
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/b/${snapshot.experienceId}`
    : `https://birthday.premiere/b/${snapshot.experienceId}`;

  // Copy handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2800);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2800);
    }
  };

  // Expiration countdown calculation
  useEffect(() => {
    const updateTime = () => {
      const expiry = new Date(snapshot.expiresAt).getTime();
      const diff = expiry - Date.now();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s remaining`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [snapshot.expiresAt]);

  const formattedExpiresAt = new Date(snapshot.expiresAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 animate-fade-in text-center space-y-8">
      {/* Success Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono uppercase tracking-widest shadow-xl">
        <Sparkles className="w-3.5 h-3.5" />
        <span>PREMIERE OFFICIALLY PUBLISHED</span>
      </div>

      {/* Main Announcement */}
      <div className="space-y-3">
        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white uppercase tracking-tight [text-wrap:balance]">
          Your Birthday Experience Is Ready.
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 max-w-md mx-auto leading-relaxed">
          The cinematic story for <strong className="text-white">{snapshot.recipientName}</strong> is now live and locked in its immutable 24-hour window.
        </p>
      </div>

      {/* Private Link Card */}
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 shadow-2xl text-left space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E50914]/10 rounded-full blur-[70px] pointer-events-none" />

        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="uppercase tracking-wider">YOUR PRIVATE BIRTHDAY LINK</span>
          <span className="text-[#E50914] flex items-center gap-1 font-semibold">
            <Lock className="w-3 h-3" />
            <span>ENCRYPTED & OPAQUE</span>
          </span>
        </div>

        {/* Link Input & Copy Button Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#090909] border border-[#2A2A2A] rounded-2xl p-2.5">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-mono text-white outline-none select-all truncate"
          />

          <button
            type="button"
            onClick={handleCopy}
            className={`px-5 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#E50914] hover:bg-[#c90711] text-white shadow-lg shadow-[#E50914]/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Expiration Meta Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#222222] text-xs font-mono">
          <div className="flex items-center gap-2.5 text-neutral-300">
            <Clock className="w-4 h-4 text-[#E50914] shrink-0" />
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">Available for 24 Hours</div>
              <div className="font-bold text-white">{timeRemaining || '24 hours active'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-[#E50914] shrink-0" />
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">Expires At (Local)</div>
              <div className="text-white truncate">{formattedExpiresAt}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          type="button"
          onClick={onOpenExperience}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#E50914] hover:bg-[#c90711] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#E50914]/30 hover:shadow-[#E50914]/50 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
        >
          <span>Open Experience</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onCreateAnother}
          className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#161616] border border-[#2D2D2D] hover:border-neutral-500 text-neutral-300 hover:text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-[#E50914]" />
          <span>Create Another Experience</span>
        </button>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onReturnHome}
          className="text-xs font-mono text-neutral-400 hover:text-white underline cursor-pointer"
        >
          Return to Studio Home
        </button>
      </div>
    </div>
  );
};
