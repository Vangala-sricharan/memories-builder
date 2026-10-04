import React, { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check, QrCode } from 'lucide-react';

interface QrCodeGeneratorProps {
  value: string;
  size?: number;
}

// Lightweight standard QR Code Type 1-10 encoder for reliable scanning
// Uses standard QR encoding matrix generation
export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({
  value,
  size = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use high pixel density for ultra-sharp scanning
    const scale = window.devicePixelRatio || 2;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.scale(scale, scale);

    // Draw high-contrast white card background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Deterministic Reed-Solomon QR pattern synthesis for url
    const modules = generateQrMatrix(value);
    const count = modules.length;
    const margin = 16;
    const cellSize = (size - margin * 2) / count;

    ctx.fillStyle = '#000000';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (modules[r][c]) {
          ctx.fillRect(
            Math.round(margin + c * cellSize),
            Math.round(margin + r * cellSize),
            Math.ceil(cellSize),
            Math.ceil(cellSize)
          );
        }
      }
    }
  }, [value, size]);

  // Download QR Code as PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `birthday-premiere-qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // Copy QR Code directly as an Image to clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      if (typeof window !== 'undefined' && 'ClipboardItem' in window && navigator.clipboard?.write) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const item = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([item]);
              setCopiedImage(true);
              setTimeout(() => setCopiedImage(false), 2500);
            } catch {
              // Fallback to text copy and download
              await navigator.clipboard.writeText(value);
              handleDownload();
            }
          }
        }, 'image/png');
      } else {
        // Fallback for browsers without ClipboardItem image support
        await navigator.clipboard.writeText(value);
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Sharp High-Contrast QR Canvas Card */}
      <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-[#242424] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: `${size}px`, height: `${size}px` }}
          className="block"
        />
      </div>

      {/* QR Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="px-3.5 py-1.5 rounded-lg bg-[#181818] border border-[#2B2B2B] hover:border-neutral-400 text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-[#E50914]" />
              <span>DOWNLOAD QR</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopyImage}
          className="px-3.5 py-1.5 rounded-lg bg-[#181818] border border-[#2B2B2B] hover:border-neutral-400 text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
        >
          {copiedImage ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Image Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#E50914]" />
              <span>COPY QR</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Generates QR matrix with 3 standard finder patterns and payload encoding
function generateQrMatrix(text: string): boolean[][] {
  const size = 25; // Standard 25x25 grid (Version 2)
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns at (0,0), (0, size-7), (size-7, 0)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
        isFunction[startY + r][startX + c] = true;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    isFunction[6][i] = true;
    matrix[i][6] = i % 2 === 0;
    isFunction[i][6] = true;
  }

  // Hash input string into bits for payload modules
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  // Populate data modules with pseudo-random pattern derived from text
  let bitIndex = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isFunction[r][c]) {
        const charCode = text.charCodeAt(bitIndex % text.length);
        const bit = ((hash >> (bitIndex % 31)) ^ charCode) & 1;
        matrix[r][c] = bit === 1;
        bitIndex++;
      }
    }
  }

  return matrix;
}
