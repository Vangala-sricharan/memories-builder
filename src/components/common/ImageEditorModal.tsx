import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UploadedPhoto, ImageEditState } from '../../types';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  X, 
  Crop as CropIcon, 
  Move,
  Maximize2,
  Sparkles,
  Info
} from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  photo: UploadedPhoto | null;
  onApply: (updatedPhoto: UploadedPhoto) => void;
  onCancel: () => void;
  onResetToOriginal?: (photoId: string) => void;
}

type AspectRatioMode = 'free' | '1:1' | '4:3' | '16:9' | '3:4';

const ASPECT_RATIOS: { id: AspectRatioMode; label: string; ratio?: number }[] = [
  { id: 'free', label: 'Free Crop' },
  { id: '1:1', label: '1:1 Square', ratio: 1 },
  { id: '4:3', label: '4:3 Standard', ratio: 4 / 3 },
  { id: '16:9', label: '16:9 Cinema', ratio: 16 / 9 },
  { id: '3:4', label: '3:4 Portrait', ratio: 3 / 4 },
];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  photo,
  onApply,
  onCancel,
  onResetToOriginal,
}) => {
  // Editing state
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('free');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Dragging & resizing state
  const [dragAction, setDragAction] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const stageRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Determine source image (original if available, or current preview)
  const sourceImageSrc = photo?.originalPreviewUrl || photo?.previewUrl || '';

  // Initialize or re-hydrate edit state whenever modal opens or photo changes
  useEffect(() => {
    if (!isOpen || !photo) return;

    if (photo.editState) {
      setRotation(photo.editState.rotation || 0);
      setZoom(photo.editState.zoom || 1);
      setPan(photo.editState.position || { x: 0, y: 0 });
      setCrop(photo.editState.crop || { x: 5, y: 5, width: 90, height: 90 });
      setAspectRatio(photo.editState.aspectRatio || 'free');
    } else {
      setRotation(0);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setCrop({ x: 5, y: 5, width: 90, height: 90 });
      setAspectRatio('free');
    }
    setImageLoaded(false);
  }, [isOpen, photo]);

  // Image load handler
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalDimensions({
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
    });
    setImageLoaded(true);
  };

  // 90° Clockwise Rotation
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Zoom controls
  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(1, Math.min(3, Math.round(newZoom * 100) / 100));
    setZoom(clamped);
    if (clamped === 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  // Reset to default
  const handleReset = () => {
    setRotation(0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCrop({ x: 5, y: 5, width: 90, height: 90 });
    setAspectRatio('free');

    if (photo?.id && onResetToOriginal) {
      onResetToOriginal(photo.id);
    }
  };

  // Change Aspect Ratio
  const handleSelectAspectRatio = (mode: AspectRatioMode) => {
    setAspectRatio(mode);
    const targetDef = ASPECT_RATIOS.find((r) => r.id === mode);
    if (!targetDef?.ratio || !stageRef.current) return;

    const stageRect = stageRef.current.getBoundingClientRect();
    const stageRatio = stageRect.width / stageRect.height;
    const desiredRatio = targetDef.ratio;

    // Calculate new crop box dimensions that fit inside 90% of the stage
    let newW = 80;
    let newH = 80;

    if (desiredRatio >= 1) {
      // Landscape-like crop
      newW = 85;
      newH = Math.min(85, (newW / desiredRatio) * stageRatio);
    } else {
      // Portrait-like crop
      newH = 85;
      newW = Math.min(85, newH * desiredRatio * (1 / stageRatio));
    }

    const newX = Math.max(2, (100 - newW) / 2);
    const newY = Math.max(2, (100 - newH) / 2);

    setCrop({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newW),
      height: Math.round(newH),
    });
  };

  // Pointer drag start on crop box or handles
  const handlePointerDown = (
    e: React.PointerEvent,
    action: 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setDragAction(action);
    setDragStart({ x: e.clientX, y: e.clientY });
    setCropStart({ ...crop });
  };

  // Pointer drag move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragAction || !stageRef.current) return;
    e.preventDefault();

    const stageRect = stageRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.x) / stageRect.width) * 100;
    const dy = ((e.clientY - dragStart.y) / stageRect.height) * 100;

    const minSize = 12; // Minimum crop size percentage

    if (dragAction === 'move') {
      let nextX = cropStart.x + dx;
      let nextY = cropStart.y + dy;

      nextX = Math.max(0, Math.min(100 - cropStart.width, nextX));
      nextY = Math.max(0, Math.min(100 - cropStart.height, nextY));

      setCrop((prev) => ({ ...prev, x: nextX, y: nextY }));
      return;
    }

    // Handle corner and edge resizing
    let nextX = cropStart.x;
    let nextY = cropStart.y;
    let nextW = cropStart.width;
    let nextH = cropStart.height;

    if (dragAction.includes('e')) {
      nextW = Math.max(minSize, Math.min(100 - cropStart.x, cropStart.width + dx));
    }
    if (dragAction.includes('s')) {
      nextH = Math.max(minSize, Math.min(100 - cropStart.y, cropStart.height + dy));
    }
    if (dragAction.includes('w')) {
      const allowedDx = Math.min(dx, cropStart.width - minSize);
      nextX = Math.max(0, cropStart.x + allowedDx);
      nextW = cropStart.width - (nextX - cropStart.x);
    }
    if (dragAction.includes('n')) {
      const allowedDy = Math.min(dy, cropStart.height - minSize);
      nextY = Math.max(0, cropStart.y + allowedDy);
      nextH = cropStart.height - (nextY - cropStart.y);
    }

    setCrop({
      x: Math.max(0, nextX),
      y: Math.max(0, nextY),
      width: Math.min(100 - nextX, nextW),
      height: Math.min(100 - nextY, nextH),
    });
  };

  // Pointer drag end
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragAction) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe ignore
      }
      setDragAction(null);
    }
  };

  // Confirm and Apply Crop + Rotation
  const handleApply = async () => {
    if (!photo || !imageRef.current) return;
    setIsProcessing(true);

    try {
      // 1. Load natural image element
      const srcImg = new Image();
      srcImg.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        srcImg.onload = () => resolve();
        srcImg.onerror = () => reject(new Error('Failed to load image for cropping'));
        srcImg.src = sourceImageSrc;
      });

      const natW = srcImg.naturalWidth || srcImg.width;
      const natH = srcImg.naturalHeight || srcImg.height;

      // 2. Compute rotated dimensions
      const isSwapped = rotation === 90 || rotation === 270;
      const rotW = isSwapped ? natH : natW;
      const rotH = isSwapped ? natW : natH;

      // 3. Render rotated source to offscreen canvas
      const rotCanvas = document.createElement('canvas');
      rotCanvas.width = rotW;
      rotCanvas.height = rotH;
      const rotCtx = rotCanvas.getContext('2d', { alpha: true });
      if (!rotCtx) throw new Error('Could not get canvas context');

      rotCtx.save();
      rotCtx.translate(rotW / 2, rotH / 2);
      rotCtx.rotate((rotation * Math.PI) / 180);
      rotCtx.drawImage(srcImg, -natW / 2, -natH / 2, natW, natH);
      rotCtx.restore();

      // 4. Calculate crop rectangle in rotated pixel coordinates
      // With zoom applied, the effective visible portion scales down
      const effectiveZoom = Math.max(1, zoom);
      const cropPixelWidth = Math.max(50, Math.round(((crop.width / 100) * rotW) / effectiveZoom));
      const cropPixelHeight = Math.max(50, Math.round(((crop.height / 100) * rotH) / effectiveZoom));

      // Calculate source top-left corner on rotated canvas
      let sx = Math.round((crop.x / 100) * rotW);
      let sy = Math.round((crop.y / 100) * rotH);

      // Account for pan offset if zoom > 1
      if (stageRef.current && effectiveZoom > 1) {
        const stageW = stageRef.current.clientWidth || 400;
        const stageH = stageRef.current.clientHeight || 400;
        sx -= Math.round((pan.x / stageW) * (rotW / effectiveZoom));
        sy -= Math.round((pan.y / stageH) * (rotH / effectiveZoom));
      }

      // Clamp sx and sy so crop does not read outside rotated bounds
      sx = Math.max(0, Math.min(rotW - cropPixelWidth, sx));
      sy = Math.max(0, Math.min(rotH - cropPixelHeight, sy));

      // 5. Final output canvas dimensions (capped at 2560px for quality-first target)
      const MAX_OUTPUT = 2560;
      let outW = cropPixelWidth;
      let outH = cropPixelHeight;

      if (outW > MAX_OUTPUT || outH > MAX_OUTPUT) {
        if (outW >= outH) {
          outH = Math.round((outH * MAX_OUTPUT) / outW);
          outW = MAX_OUTPUT;
        } else {
          outW = Math.round((outW * MAX_OUTPUT) / outH);
          outH = MAX_OUTPUT;
        }
      }

      const outCanvas = document.createElement('canvas');
      outCanvas.width = outW;
      outCanvas.height = outH;
      const outCtx = outCanvas.getContext('2d', { alpha: true });
      if (!outCtx) throw new Error('Could not get output canvas context');

      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = 'high';

      // Draw cropped slice from rotated canvas onto output canvas
      outCtx.drawImage(rotCanvas, sx, sy, cropPixelWidth, cropPixelHeight, 0, 0, outW, outH);

      // 6. Convert to high quality WebP (with JPEG fallback)
      const blob = await new Promise<Blob>((resolve, reject) => {
        outCanvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to encode cropped image to blob'));
          },
          'image/webp',
          0.90
        );
      });

      const newPreviewUrl = URL.createObjectURL(blob);
      const newFile = new File([blob], `memory-edited-${photo.id}.webp`, { type: blob.type || 'image/webp' });

      // Save independent editing state
      const editState: ImageEditState = {
        crop,
        rotation,
        zoom,
        position: pan,
        aspectRatio,
      };

      const updatedPhoto: UploadedPhoto = {
        ...photo,
        file: newFile,
        previewUrl: newPreviewUrl,
        originalFile: photo.originalFile || photo.file,
        originalPreviewUrl: photo.originalPreviewUrl || photo.previewUrl,
        editState,
      };

      onApply(updatedPhoto);
    } catch (err) {
      console.error('Failed to crop image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-4xl bg-[#0D0D10] border border-[#25252A] rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col max-h-[95vh] overflow-hidden"
        style={{
          boxShadow: '0 0 50px rgba(229, 9, 20, 0.15), 0 25px 80px rgba(0,0,0,0.95)',
        }}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-[#1E1E24] flex items-center justify-between bg-[#111114]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914]">
              <CropIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E50914]">
                  IMAGE STUDIO
                </span>
                {rotation !== 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/40">
                    {rotation}°
                  </span>
                )}
                {zoom > 1 && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {zoom}x
                  </span>
                )}
              </div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide truncate max-w-[260px] sm:max-w-md">
                {photo.caption || 'CROP & ROTATE MEMORY'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close without saving"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Aspect Ratio Toolbar */}
        <div className="px-5 py-2.5 bg-[#09090C] border-b border-[#1A1A20] flex items-center justify-between gap-2 overflow-x-auto text-xs font-mono scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-neutral-500 uppercase mr-1 hidden sm:inline">Ratio:</span>
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectAspectRatio(r.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  aspectRatio === r.id
                    ? 'bg-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.4)]'
                    : 'bg-[#16161A] text-neutral-400 hover:text-white hover:bg-[#202026]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Rotate Button */}
            <button
              type="button"
              onClick={handleRotate}
              className="px-3 py-1.5 rounded-lg bg-[#18181D] hover:bg-[#23232A] border border-[#2B2B33] text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer hover:border-[#E50914]/50"
              title="Rotate 90 degrees clockwise"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Rotate 90°</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg bg-[#18181D] hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset crop, rotation, and zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Main Interactive Stage */}
        <div className="relative flex-1 bg-[#060608] min-h-[320px] max-h-[55vh] flex items-center justify-center p-4 overflow-hidden">
          {/* Stage Container */}
          <div
            ref={stageRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative max-w-full max-h-full aspect-auto flex items-center justify-center select-none"
            style={{ touchAction: 'none' }}
          >
            {/* The Image being edited */}
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center center',
              }}
            >
              <img
                ref={imageRef}
                src={sourceImageSrc}
                alt="Source preview"
                onLoad={handleImageLoad}
                draggable={false}
                className="max-w-[80vw] sm:max-w-[620px] max-h-[48vh] object-contain rounded-md shadow-2xl block pointer-events-none"
              />
            </div>

            {/* Interactive Crop Box Overlay */}
            {imageLoaded && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                {/* Dark Scrim Mask: 4 outer darkened rectangles */}
                <div
                  className="absolute bg-black/70 backdrop-blur-[1px]"
                  style={{ top: 0, left: 0, right: 0, height: `${crop.y}%` }}
                />
                <div
                  className="absolute bg-black/70 backdrop-blur-[1px]"
                  style={{ bottom: 0, left: 0, right: 0, height: `${100 - (crop.y + crop.height)}%` }}
                />
                <div
                  className="absolute bg-black/70 backdrop-blur-[1px]"
                  style={{
                    top: `${crop.y}%`,
                    bottom: `${100 - (crop.y + crop.height)}%`,
                    left: 0,
                    width: `${crop.x}%`,
                  }}
                />
                <div
                  className="absolute bg-black/70 backdrop-blur-[1px]"
                  style={{
                    top: `${crop.y}%`,
                    bottom: `${100 - (crop.y + crop.height)}%`,
                    right: 0,
                    width: `${100 - (crop.x + crop.width)}%`,
                  }}
                />

                {/* The Active Crop Window */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'move')}
                  className="absolute border-2 border-[#E50914] shadow-[0_0_25px_rgba(229,9,20,0.4)] pointer-events-auto cursor-move transition-shadow"
                  style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.width}%`,
                    height: `${crop.height}%`,
                    boxShadow: dragAction ? '0 0 35px rgba(229,9,20,0.7)' : '0 0 15px rgba(229,9,20,0.3)',
                  }}
                >
                  {/* Rule of Thirds Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-r border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-r border-white" />
                    <div className="border-r border-white" />
                    <div />
                  </div>

                  {/* Corner Resize Handles */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'nw')}
                    className="absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-20"
                  >
                    <div className="w-3.5 h-3.5 bg-white border-2 border-[#E50914] rounded-sm shadow-md" />
                  </div>
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'ne')}
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 flex items-center justify-center cursor-nesw-resize z-20"
                  >
                    <div className="w-3.5 h-3.5 bg-white border-2 border-[#E50914] rounded-sm shadow-md" />
                  </div>
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'sw')}
                    className="absolute -bottom-2.5 -left-2.5 w-6 h-6 flex items-center justify-center cursor-nesw-resize z-20"
                  >
                    <div className="w-3.5 h-3.5 bg-white border-2 border-[#E50914] rounded-sm shadow-md" />
                  </div>
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'se')}
                    className="absolute -bottom-2.5 -right-2.5 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-20"
                  >
                    <div className="w-3.5 h-3.5 bg-white border-2 border-[#E50914] rounded-sm shadow-md" />
                  </div>

                  {/* Edge Resize Handles */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'n')}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 flex items-center justify-center cursor-ns-resize z-20"
                  >
                    <div className="w-6 h-1.5 bg-white border border-[#E50914] rounded-full shadow-sm" />
                  </div>
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 's')}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 flex items-center justify-center cursor-ns-resize z-20"
                  >
                    <div className="w-6 h-1.5 bg-white border border-[#E50914] rounded-full shadow-sm" />
                  </div>
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'w')}
                    className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-8 flex items-center justify-center cursor-ew-resize z-20"
                  >
                    <div className="w-1.5 h-6 bg-white border border-[#E50914] rounded-full shadow-sm" />
                  </div>
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'e')}
                    className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-8 flex items-center justify-center cursor-ew-resize z-20"
                  >
                    <div className="w-1.5 h-6 bg-white border border-[#E50914] rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zoom & Helper Info Bar */}
        <div className="px-5 py-3 bg-[#0B0B0E] border-t border-[#1C1C22] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-neutral-400" />
              <span>Zoom:</span>
            </span>
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.25)}
              disabled={zoom <= 1}
              className="p-1 rounded bg-[#16161A] text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="w-28 sm:w-36 h-1.5 bg-[#1F1F26] accent-[#E50914] rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.25)}
              disabled={zoom >= 3}
              className="p-1 rounded bg-[#16161A] text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-neutral-400 text-[11px] min-w-[32px]">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono hidden md:flex items-center gap-2">
            <Move className="w-3.5 h-3.5 text-neutral-400" />
            <span>Drag inside frame to move · Drag corners to resize</span>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-4 bg-[#111116] border-t border-[#202028] flex items-center justify-between gap-3">
          <div className="text-[11px] text-neutral-400 font-mono truncate">
            {naturalDimensions.width > 0 && (
              <span>Source: {naturalDimensions.width}×{naturalDimensions.height}px</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-mono transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B80000] to-[#E50914] text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(229,9,20,0.5)] hover:shadow-[0_0_30px_rgba(229,9,20,0.8)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Apply Edits</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
