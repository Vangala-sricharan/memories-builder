import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle,
  Heart,
  Palette,
  Gift,
  Lock
} from 'lucide-react';
import { 
  QR_COLOR_PRESETS, 
  QrColorPreset, 
  renderQrCardToCanvas 
} from './qrRenderer';

interface QrCodeGeneratorProps {
  value: string;
  recipientName?: string;
  size?: number;
}

/**
 * Large, visible floral bouquet corner SVG illustration.
 * Positioned on the frame perimeter strictly outside the QR quiet zone.
 */
const FloralCornerBouquet: React.FC<{
  color: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ color, position }) => {
  const rotationClass = {
    'top-left': 'rotate-0 -top-6 -left-6',
    'top-right': 'rotate-90 -top-6 -right-6',
    'bottom-right': 'rotate-180 -bottom-6 -right-6',
    'bottom-left': '-rotate-90 -bottom-6 -left-6',
  }[position];

  return (
    <div
      aria-hidden="true"
      className={`absolute w-16 h-16 sm:w-20 sm:h-20 pointer-events-none transition-transform duration-500 z-10 ${rotationClass}`}
    >
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
        {/* Curving vine stems */}
        <path d="M12 88 C 24 55, 55 24, 88 12" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <path d="M22 84 C 36 60, 60 36, 84 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7" />

        {/* Botanical leaves */}
        <path d="M28 58 C 18 46, 14 34, 22 24 C 32 20, 44 30, 36 44 Z" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="1.8" />
        <path d="M58 28 C 46 18, 34 14, 24 22 C 20 32, 30 44, 44 36 Z" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="1.8" />
        <path d="M46 70 C 38 82, 50 90, 60 82 C 64 72, 56 62, 46 70 Z" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="1.8" />
        <path d="M70 46 C 82 38, 90 50, 82 60 C 72 64, 62 56, 70 46 Z" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="1.8" />

        {/* Prominent blooming rose flower */}
        <circle cx="48" cy="48" r="18" fill={color} fillOpacity="0.9" />
        <circle cx="48" cy="48" r="12" fill="#000000" fillOpacity="0.25" stroke="#FFFFFF" strokeWidth="1.6" />
        <circle cx="48" cy="48" r="5" fill="#FFFFFF" />

        {/* Overlapping rose petals */}
        <path d="M48 24 C 58 24, 66 32, 66 42 C 66 54, 48 68, 48 68 C 48 68, 30 54, 30 42 C 30 32, 38 24, 48 24 Z" stroke="#FFFFFF" strokeWidth="1.4" strokeOpacity="0.7" fill="none" />

        {/* Small floral buds */}
        <circle cx="80" cy="20" r="5" fill={color} />
        <circle cx="20" cy="80" r="5" fill={color} />
      </svg>
    </div>
  );
};

export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({
  value,
  recipientName,
  size = 400,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<QrColorPreset>(QR_COLOR_PRESETS[0]);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Render on-screen preview whenever URL, preset, or recipientName changes
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;

    // Use device pixel ratio for crisp screen rendering
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 2, 3) : 2;
    const renderDimension = Math.round(size * dpr);

    renderQrCardToCanvas(canvas, {
      url: value,
      preset: selectedPreset,
      recipientName,
      width: renderDimension,
      height: renderDimension,
    });
  }, [value, selectedPreset, recipientName, size]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  // High-Resolution Export Renderer (1400x1400 px)
  const generateHighResCanvas = (): HTMLCanvasElement | null => {
    if (!value || typeof document === 'undefined') return null;
    const exportCanvas = document.createElement('canvas');
    const exportSize = 1400; // Ultra crisp 1400x1400 px target

    renderQrCardToCanvas(exportCanvas, {
      url: value,
      preset: selectedPreset,
      recipientName,
      width: exportSize,
      height: exportSize,
    });

    return exportCanvas;
  };

  // Download complete designed QR card
  const handleDownload = () => {
    const exportCanvas = generateHighResCanvas();
    if (!exportCanvas) return;

    try {
      const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
      const safeName = recipientName
        ? recipientName.toLowerCase().replace(/[^a-z0-9]/g, '-')
        : 'memory';
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `birthday-premiere-qr-${safeName}-${selectedPreset.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2800);
    } catch (err) {
      console.error('Failed to download QR card:', err);
    }
  };

  // Copy complete designed QR card image to clipboard
  const handleCopyImage = async () => {
    const exportCanvas = generateHighResCanvas();
    if (!exportCanvas) return;

    try {
      if (
        typeof window !== 'undefined' &&
        'ClipboardItem' in window &&
        navigator.clipboard &&
        typeof navigator.clipboard.write === 'function'
      ) {
        exportCanvas.toBlob(async (blob) => {
          if (!blob) {
            setCopyFeedback("Image copy isn't supported in this browser. Download the QR instead.");
            setTimeout(() => setCopyFeedback(null), 4000);
            return;
          }

          try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            setCopiedImage(true);
            setCopyFeedback('Complete QR Card copied to clipboard!');
            setTimeout(() => {
              setCopiedImage(false);
              setCopyFeedback(null);
            }, 3000);
          } catch {
            setCopyFeedback("Image copy isn't supported in this browser. Download the QR instead.");
            setTimeout(() => setCopyFeedback(null), 4000);
          }
        }, 'image/png', 1.0);
      } else {
        setCopyFeedback("Image copy isn't supported in this browser. Download the QR instead.");
        setTimeout(() => setCopyFeedback(null), 4000);
      }
    } catch {
      setCopyFeedback("Image copy isn't supported in this browser. Download the QR instead.");
      setTimeout(() => setCopyFeedback(null), 4000);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none animate-fade-in space-y-7">
      
      {/* ======================================================== */}
      {/* 1. BIG PROMINENT SURPRISE ANNOUNCEMENT HEADER            */}
      {/* ======================================================== */}
      <div className="text-center space-y-2 px-4 w-full">
        {/* Big Glowing Surprise Badge */}
        <div 
          className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-2 rounded-full border text-xs sm:text-sm font-mono uppercase tracking-[0.25em] font-extrabold shadow-lg transition-all duration-300"
          style={{
            backgroundColor: `${selectedPreset.accent}18`,
            borderColor: selectedPreset.accent,
            color: selectedPreset.accent,
            boxShadow: `0 0 25px ${selectedPreset.glowColor}`,
          }}
        >
          <Gift className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
          <span>A SPECIAL SURPRISE AWAITS INSIDE</span>
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        {/* Large Recipient Title */}
        <h2 className="font-cinzel text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
          {recipientName ? `FOR ${recipientName}` : 'A CINEMATIC PREMIERE'}
        </h2>

        {/* Mystery Teaser: States a surprise is inside WITHOUT revealing it */}
        <p className="text-xs sm:text-base text-neutral-300 max-w-md mx-auto leading-relaxed font-medium">
          A confidential birthday surprise is sealed within this private experience. Scan the code to unlock what is hidden inside.
        </p>
      </div>

      {/* ======================================================== */}
      {/* 2. CSS-BASED DECORATIVE FRAME WITH HEARTS & FLORALS      */}
      {/* ======================================================== */}
      <div className="relative group w-full flex justify-center items-center px-4">
        {/* Atmospheric Ambient Glow behind Frame */}
        <div 
          className="absolute inset-0 rounded-full blur-[80px] pointer-events-none transition-all duration-700 opacity-70"
          style={{ backgroundColor: selectedPreset.accent }}
        />

        {/* The Romantic Cinematic Decorative Frame */}
        <div 
          className="relative w-full max-w-[380px] sm:max-w-[450px] p-6 sm:p-9 rounded-[38px] border-2 transition-all duration-500 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-visible"
          style={{
            backgroundColor: '#0A0A0C',
            backgroundImage: `radial-gradient(ellipse at 50% 45%, ${selectedPreset.accent}20 0%, rgba(10,10,12,0.95) 70%, #060608 100%)`,
            borderColor: selectedPreset.frameBorder,
            boxShadow: `0 0 40px ${selectedPreset.glowColor}, 0 25px 70px rgba(0,0,0,0.95)`,
          }}
        >
          {/* Inner Hairline Frame Line */}
          <div 
            className="absolute inset-2.5 sm:inset-3 rounded-[32px] border pointer-events-none"
            style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
          />

          {/* 4 Large Corner Botanical Floral Bouquets (OUTSIDE QR SAFE ZONE) */}
          <FloralCornerBouquet color={selectedPreset.accent} position="top-left" />
          <FloralCornerBouquet color={selectedPreset.accent} position="top-right" />
          <FloralCornerBouquet color={selectedPreset.accent} position="bottom-right" />
          <FloralCornerBouquet color={selectedPreset.accent} position="bottom-left" />

          {/* Big Glowing Heart at Top-Center */}
          <div 
            className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center p-2 rounded-full border shadow-xl bg-[#0A0A0C] transition-transform duration-300 group-hover:scale-110"
            style={{
              borderColor: selectedPreset.accent,
              boxShadow: `0 0 16px ${selectedPreset.glowColor}`,
            }}
          >
            <Heart 
              className="w-5 h-5 sm:w-7 sm:h-7 animate-pulse" 
              style={{ color: selectedPreset.accent, fill: selectedPreset.accent }} 
            />
          </div>

          {/* Large Visible Left Floating Heart */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-5 z-20 p-1.5 rounded-full bg-[#0A0A0C] border shadow-lg"
            style={{
              borderColor: selectedPreset.accent,
              boxShadow: `0 0 12px ${selectedPreset.glowColor}`,
            }}
          >
            <Heart 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              style={{ color: selectedPreset.accent, fill: selectedPreset.accent }} 
            />
          </div>

          {/* Large Visible Right Floating Heart */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-5 z-20 p-1.5 rounded-full bg-[#0A0A0C] border shadow-lg"
            style={{
              borderColor: selectedPreset.accent,
              boxShadow: `0 0 12px ${selectedPreset.glowColor}`,
            }}
          >
            <Heart 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              style={{ color: selectedPreset.accent, fill: selectedPreset.accent }} 
            />
          </div>

          {/* Big Heart & Floral Cluster at Bottom-Center */}
          <div 
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-xl bg-[#0A0A0C]"
            style={{
              borderColor: selectedPreset.accent,
              boxShadow: `0 0 16px ${selectedPreset.glowColor}`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <Heart 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              style={{ color: selectedPreset.accent, fill: selectedPreset.accent }} 
            />
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Central Protected QR Plaque with Rigid Quiet Zone */}
          <div 
            className="relative rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300 w-full aspect-square flex items-center justify-center p-2.5 sm:p-3 bg-white"
            style={{
              backgroundColor: selectedPreset.qrLight,
              borderColor: selectedPreset.accent,
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block rounded-xl transition-all duration-300"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          {/* Big Prominent Call-to-Action Text inside Frame */}
          <div className="pt-5 text-center space-y-1.5">
            <h3 className="font-cinzel text-base sm:text-xl font-bold uppercase tracking-wider text-white drop-shadow-md">
              SCAN TO UNLOCK THE SURPRISE
            </h3>
            <p 
              className="text-xs sm:text-sm font-mono tracking-wider font-semibold"
              style={{ color: selectedPreset.accent }}
            >
              POINT CAMERA HERE · 24-HOUR LIFETIME ONLY
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. QR COLOR OPTIONS CONTROLS                             */}
      {/* ======================================================== */}
      <div className="w-full space-y-3 pt-2 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-neutral-300 font-bold">
          <Palette className="w-4 h-4" style={{ color: selectedPreset.accent }} />
          <span>CHOOSE QR COLOR STYLE</span>
        </div>

        {/* 6 Color Preset Swatches */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-w-lg mx-auto px-4">
          {QR_COLOR_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset)}
                className={`py-2.5 px-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181C] shadow-xl scale-105'
                    : 'bg-[#0E0E10] border-[#222226] hover:border-neutral-400 hover:bg-[#151518]'
                }`}
                style={{
                  borderColor: isSelected ? preset.accent : undefined,
                  boxShadow: isSelected ? `0 0 16px ${preset.glowColor}` : undefined,
                }}
                title={preset.tagline}
              >
                {/* Circular Swatch Dot */}
                <div 
                  className="w-5 h-5 rounded-full border shadow-sm transition-transform duration-200"
                  style={{
                    backgroundColor: preset.swatchBg,
                    borderColor: preset.swatchBorder,
                    transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
                <span 
                  className="text-[11px] font-mono tracking-wider font-bold"
                  style={{ color: isSelected ? preset.accent : '#D1D5DB' }}
                >
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. ACTION BUTTONS: DOWNLOAD & COPY QR                    */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md pt-1 px-4">
        {/* DOWNLOAD QR BUTTON */}
        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:w-1/2 py-3.5 px-5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-105 cursor-pointer flex items-center justify-center gap-2 font-mono"
          style={{
            backgroundColor: selectedPreset.accent,
            color: selectedPreset.id === 'white' ? '#000000' : '#FFFFFF',
            boxShadow: `0 8px 24px ${selectedPreset.glowColor}`,
          }}
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>DOWNLOADED!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>DOWNLOAD QR</span>
            </>
          )}
        </button>

        {/* COPY QR BUTTON */}
        <button
          type="button"
          onClick={handleCopyImage}
          className="w-full sm:w-1/2 py-3.5 px-5 rounded-xl bg-[#141418] border border-[#2B2B32] hover:border-neutral-300 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all hover:bg-[#1C1C22] cursor-pointer flex items-center justify-center gap-2 font-mono"
        >
          {copiedImage ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" style={{ color: selectedPreset.accent }} />
              <span>COPY QR</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback Banner */}
      {copyFeedback && (
        <div className="animate-fade-in text-xs font-mono text-neutral-200 bg-[#16161C] border border-[#2B2B36] px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg">
          {copiedImage ? (
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{copyFeedback}</span>
        </div>
      )}
    </div>
  );
};
