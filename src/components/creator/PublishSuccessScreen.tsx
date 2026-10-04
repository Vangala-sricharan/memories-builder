import React, { useState, useEffect } from 'react';
import { PublishedExperienceSnapshot } from '../../types';
import { QrCodeGenerator } from '../common/QrCodeGenerator';
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
  Mail,
  MessageCircle,
  Instagram,
  PlusCircle,
  Home
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
  const [instagramNotice, setInstagramNotice] = useState(false);

  // Construct opaque share URL
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2800);
    }
  };

  // Web Share API handler
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Happy Birthday, ${snapshot.recipientName}!`,
          text: `A 24-hour cinematic memory film created for ${snapshot.recipientName}.`,
          url: shareUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const message = `A special 24-hour cinematic birthday premiere has been released for ${snapshot.recipientName}: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Email share
  const handleEmailShare = () => {
    const subject = 'A Birthday Memory For You';
    const body = `Happy Birthday! I created a private, cinematic 24-hour memory experience for you.\n\nWatch your premiere here:\n${shareUrl}\n\nNote: This experience is live for 24 hours only.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Instagram share
  const handleInstagramShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `A Birthday Premiere for ${snapshot.recipientName}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback
      }
    }
    // Fallback: Copy link and instruct user
    handleCopy();
    setInstagramNotice(true);
    setTimeout(() => setInstagramNotice(false), 4000);
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

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 animate-fade-in text-center space-y-8 select-none">
      {/* 1. Success Announcement */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono uppercase tracking-widest shadow-xl">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PREMIERE OFFICIALLY LIVE</span>
        </div>

        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white uppercase tracking-tight [text-wrap:balance]">
          YOUR MEMORY IS LIVE
        </h1>

        <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-[#E50914] font-semibold">
          24 HOURS OF MEMORIES
        </p>

        <p className="text-sm sm:text-base text-neutral-300 max-w-md mx-auto leading-relaxed pt-1">
          The cinematic story for <strong className="text-white">{snapshot.recipientName}</strong> is now live and locked in its immutable 24-hour window.
        </p>
      </div>

      {/* 2. Primary Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={onOpenExperience}
          className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#E50914] hover:bg-[#c90711] text-white text-sm font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#E50914]/30 hover:scale-105 cursor-pointer flex items-center justify-center gap-2.5"
        >
          <span>OPEN EXPERIENCE</span>
          <ExternalLink className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#181818] border border-[#2D2D2D] hover:border-neutral-400 text-white text-sm font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#E50914]" />
              <span>COPY LINK</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#181818] border border-[#2D2D2D] hover:border-neutral-400 text-white text-sm font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4 text-[#E50914]" />
          <span>SHARE</span>
        </button>
      </div>

      {/* 3. Private Link Card with Scannable QR Code */}
      <div className="bg-[#101010] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E50914]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="uppercase tracking-wider">YOUR PRIVATE BIRTHDAY LINK</span>
          <span className="text-[#E50914] flex items-center gap-1 font-semibold">
            <Lock className="w-3 h-3" />
            <span>IMMUTABLE 24H SNAPSHOT</span>
          </span>
        </div>

        {/* Link Input Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#080808] border border-[#242424] rounded-2xl p-2.5">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-mono text-white outline-none select-all truncate"
          />

          <button
            type="button"
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#E50914] hover:bg-[#c90711] text-white shadow-md shadow-[#E50914]/20'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Scannable Decorated QR Code Section */}
        <div className="pt-6 flex flex-col items-center justify-center border-t border-[#1F1F1F]">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-[0.25em] mb-4 block font-semibold">
            SCAN OR SHARE
          </span>
          <QrCodeGenerator 
            value={shareUrl} 
            recipientName={snapshot.recipientName}
            size={360} 
          />
        </div>
      </div>

      {/* 4. Direct Social Sharing Row */}
      <div className="bg-[#101010] border border-[#262626] rounded-2xl p-4 sm:p-5 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block text-left">
          DIRECT SHARING
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="p-3 rounded-xl bg-[#141414] border border-[#262626] hover:border-emerald-500/50 hover:bg-[#181818] transition-all flex items-center justify-center gap-2 text-xs font-mono text-neutral-200 hover:text-white cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          {/* Instagram */}
          <button
            type="button"
            onClick={handleInstagramShare}
            className="p-3 rounded-xl bg-[#141414] border border-[#262626] hover:border-pink-500/50 hover:bg-[#181818] transition-all flex items-center justify-center gap-2 text-xs font-mono text-neutral-200 hover:text-white cursor-pointer"
          >
            <Instagram className="w-4 h-4 text-pink-400" />
            <span>Instagram</span>
          </button>

          {/* Email */}
          <button
            type="button"
            onClick={handleEmailShare}
            className="p-3 rounded-xl bg-[#141414] border border-[#262626] hover:border-blue-500/50 hover:bg-[#181818] transition-all flex items-center justify-center gap-2 text-xs font-mono text-neutral-200 hover:text-white cursor-pointer"
          >
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Email</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-3 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#E50914]/50 hover:bg-[#181818] transition-all flex items-center justify-center gap-2 text-xs font-mono text-neutral-200 hover:text-white cursor-pointer"
          >
            <Copy className="w-4 h-4 text-[#E50914]" />
            <span>Copy Link</span>
          </button>
        </div>

        {instagramNotice && (
          <p className="text-[11px] font-mono text-pink-400 pt-1 text-center animate-fade-in">
            Link copied! Paste into Instagram Direct Message or your Story sticker.
          </p>
        )}
      </div>

      {/* 5. 24-Hour Expiration Indicator */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 sm:p-5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3 text-neutral-400">
          <Clock className="w-4 h-4 text-[#E50914]" />
          <span>Active Window:</span>
          <span className="text-white font-bold">{timeRemaining || '24h 00m remaining'}</span>
        </div>

        <span className="text-[11px] text-neutral-500 hidden sm:inline">
          Automatic self-deletion after 24 hours
        </span>
      </div>

      {/* 6. Return / Create Another Navigation */}
      <div className="pt-4 flex items-center justify-center gap-4 text-xs font-mono">
        <button
          type="button"
          onClick={onCreateAnother}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create Another Story</span>
        </button>

        <span className="text-neutral-600">·</span>

        <button
          type="button"
          onClick={onReturnHome}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </button>
      </div>
    </div>
  );
};
