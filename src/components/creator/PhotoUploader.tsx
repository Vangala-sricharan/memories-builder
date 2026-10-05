import React, { useRef, useState } from 'react';
import { UploadedPhoto } from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { optimizeImageBatch, formatBytes, OptimizationStats } from '../../utils/imageOptimizer';
import { 
  UploadCloud, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  Plus,
  RefreshCw,
  Zap,
  ShieldCheck,
  Crop as CropIcon
} from 'lucide-react';
import { ImageEditorModal } from '../common/ImageEditorModal';

interface PhotoUploaderProps {
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_RAW_FILE_SIZE_BYTES = 40 * 1024 * 1024; // Allow raw uploads up to 40MB for browser optimizer

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onPhotosChange,
  onNext,
  onBack,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState({
    current: 0,
    total: 0,
    fileName: '',
  });
  const [lastStats, setLastStats] = useState<OptimizationStats | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<UploadedPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleApplyPhotoEdit = (updatedPhoto: UploadedPhoto) => {
    onPhotosChange(
      photos.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p))
    );
    setEditingPhoto(null);
  };

  const handleResetPhotoToOriginal = (photoId: string) => {
    onPhotosChange(
      photos.map((p) => {
        if (p.id !== photoId) return p;
        return {
          ...p,
          previewUrl: p.originalPreviewUrl || p.previewUrl,
          file: p.originalFile || p.file,
          editState: undefined,
        };
      })
    );
  };

  const processFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const incoming = Array.from(files);

    if (photos.length + incoming.length > 20) {
      setErrorMessage('You can add up to 20 photos.');
      return;
    }

    const validFiles: File[] = [];

    for (const file of incoming) {
      // Validate file type
      const isAllowed = ALLOWED_TYPES.includes(file.type.toLowerCase()) || 
        /\.(jpe?g|png|webp)$/i.test(file.name);

      if (!isAllowed) {
        setErrorMessage('Please choose a JPG, JPEG, PNG, or WebP image.');
        return;
      }

      if (file.size > MAX_RAW_FILE_SIZE_BYTES) {
        setErrorMessage(`Photo "${file.name}" exceeds the maximum upload limit.`);
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Run browser-side quality-first optimization pipeline
    setIsOptimizing(true);
    setOptimizationProgress({ current: 1, total: validFiles.length, fileName: validFiles[0].name });

    try {
      const { results, stats } = await optimizeImageBatch(
        validFiles,
        (current, total, fileName) => {
          setOptimizationProgress({ current, total, fileName });
        }
      );

      setLastStats(stats);

      const newPhotos: UploadedPhoto[] = results.map((res, i) => {
        const nameWithoutExt = res.file.name.replace(/\.[^/.]+$/, '').replace(/_optimized$/, '').replace(/[-_]/g, ' ');
        return {
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          file: res.file,
          previewUrl: res.previewUrl,
          originalFile: res.file,
          originalPreviewUrl: res.previewUrl,
          caption: nameWithoutExt,
          year: `${new Date().getFullYear()}`,
          aspect: '4:3',
        };
      });

      onPhotosChange([...photos, ...newPhotos]);
    } catch (err: any) {
      setErrorMessage('An issue occurred during optimization. Some files may have used fallback encoding.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (id: string) => {
    const photoToRemove = photos.find((p) => p.id === id);
    if (photoToRemove && photoToRemove.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove.previewUrl);
    }
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onPhotosChange(updated);
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onPhotosChange(
      photos.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  const handleLocationChange = (id: string, location: string) => {
    onPhotosChange(
      photos.map((p) => (p.id === id ? { ...p, location } : p))
    );
  };

  const handleLoadSampleMemories = () => {
    setErrorMessage(null);
    const sampleCanvas1 = createSampleMemoryCanvas('The Summit at Sunrise', '#221111', '#551111');
    const sampleCanvas2 = createSampleMemoryCanvas('Highway 1 Roadtrip', '#111827', '#1F2937');
    const sampleCanvas3 = createSampleMemoryCanvas('Lantern Festival in Kyoto', '#1C1917', '#441917');
    const sampleCanvas4 = createSampleMemoryCanvas('Rooftop Birthday Surprise', '#09090B', '#27272A');

    const sampleSet: UploadedPhoto[] = [
      {
        id: 'sample-1',
        previewUrl: sampleCanvas1,
        originalPreviewUrl: sampleCanvas1,
        caption: 'Sunrise over Mount Rainier · 14,411 ft',
        location: 'Wilderness Ridge',
        year: '2023',
      },
      {
        id: 'sample-2',
        previewUrl: sampleCanvas2,
        originalPreviewUrl: sampleCanvas2,
        caption: 'The spontaneous detour down Pacific Coast Highway',
        location: 'Big Sur, California',
        year: '2024',
      },
      {
        id: 'sample-3',
        previewUrl: sampleCanvas3,
        originalPreviewUrl: sampleCanvas3,
        caption: 'Night market exploration under warm paper lanterns',
        location: 'Kyoto, Japan',
        year: '2025',
      },
      {
        id: 'sample-4',
        previewUrl: sampleCanvas4,
        originalPreviewUrl: sampleCanvas4,
        caption: 'Surprise celebration dinner surrounded by lifelong friends',
        location: 'Brooklyn, New York',
        year: '2026',
      },
    ];

    onPhotosChange(sampleSet);
  };

  const handleContinue = () => {
    if (photos.length < 3) {
      setErrorMessage('Add at least 3 photos to continue.');
      return;
    }
    if (photos.length > 20) {
      setErrorMessage('You can add up to 20 photos.');
      return;
    }
    setErrorMessage(null);
    onNext();
  };

  const isCountValid = photos.length >= 3 && photos.length <= 20;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Step Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#E50914] font-semibold">
          STEP 03 OF 08 · MEMORIES
        </span>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mt-1 mb-2 [text-wrap:balance]">
          CURATE THEIR MEMORIES
        </h2>
        <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed [text-wrap:balance]">
          Upload between 3 and 20 photographs. Automatically optimized for 4K clarity, cinematic depth, and ultra-fast loading.
        </p>

        {/* Counter Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#2B2B2B]">
          <span
            className={`w-2 h-2 rounded-full ${
              isCountValid ? 'bg-emerald-400' : 'bg-[#E50914]'
            }`}
          />
          <span className="text-xs font-mono text-white">
            {photos.length} / 20 PHOTOS ADDED
          </span>
          <span className="text-neutral-500 text-xs">·</span>
          <span className="text-neutral-400 text-xs font-mono">
            {photos.length < 3 ? `Need ${3 - photos.length} more` : 'Minimum reached'}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-[#E50914] text-white text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Optimization Progress Overlay */}
      {isOptimizing && (
        <div className="mb-8 p-6 bg-[#121212] border border-[#E50914]/50 rounded-2xl shadow-2xl animate-fade-in space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E50914] animate-spin" />
              <span>Optimizing {optimizationProgress.current} of {optimizationProgress.total} memories...</span>
            </span>
            <span className="text-[#E50914] font-bold">
              {Math.round((optimizationProgress.current / optimizationProgress.total) * 100)}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B0000] to-[#E50914] transition-all duration-300 rounded-full"
              style={{
                width: `${(optimizationProgress.current / optimizationProgress.total) * 100}%`,
              }}
            />
          </div>

          <div className="text-[11px] text-neutral-400 font-mono truncate">
            Processing: {optimizationProgress.fileName}
          </div>
        </div>
      )}

      {/* Optimization Statistics Badge (When Complete) */}
      {lastStats && !isOptimizing && (
        <div className="mb-6 p-3.5 bg-[#0F140F] border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs font-mono text-emerald-400 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Memories optimized at 2560px quality · Saved {lastStats.percentageSaved}% storage</span>
          </div>
          <span className="text-neutral-400 text-[11px] hidden sm:inline">
            {formatBytes(lastStats.totalOriginalBytes)} → {formatBytes(lastStats.totalOptimizedBytes)}
          </span>
        </div>
      )}

      {/* Cinematic Drag and Drop Zone */}
      {photos.length < 20 && !isOptimizing && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer mb-8 group ${
            dragActive
              ? 'border-[#E50914] bg-[#E50914]/10'
              : 'border-[#2E2E2E] bg-[#0E0E0E] hover:border-neutral-500 hover:bg-[#121212]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#181818] border border-[#2E2E2E] mx-auto flex items-center justify-center text-neutral-400 group-hover:text-[#E50914] group-hover:scale-110 transition-all mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="font-cinzel text-xl font-bold text-white mb-2 tracking-wide">
            DROP YOUR MEMORIES HERE
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-4">
            Drag and drop images, or click anywhere to browse your files.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-neutral-400 font-mono">
            <span>JPG · PNG · WEBP</span>
            <span>·</span>
            <span className="text-[#E50914]">3 TO 20 PHOTOS</span>
            <span>·</span>
            <span>AUTO-ENCODED AT 2560PX</span>
          </div>

          {/* Quick preset loader */}
          <div className="mt-5 pt-4 border-t border-[#1F1F1F]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSampleMemories();
              }}
              className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
            >
              Or load 4 high-contrast cinematic sample memories to test immediately
            </button>
          </div>
        </div>
      )}

      {/* Grid of uploaded photos with reordering & caption controls */}
      {photos.length > 0 && (
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono uppercase tracking-wider">
              TIMELINE SEQUENCE ({photos.length} PHOTOS)
            </span>
            <span className="text-neutral-500">
              Use arrows to reorder timeline sequence
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="bg-[#121212] border border-[#262626] rounded-xl overflow-hidden flex flex-col justify-between group hover:border-[#E50914] transition-all duration-300"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
                  <AutoFitImage
                    src={photo.previewUrl}
                    alt={photo.caption}
                    className="group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top order tag & action buttons */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                    <span className="font-mono text-xs font-bold bg-black/80 text-white px-2 py-0.5 rounded border border-white/20">
                      #{String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Edit / Crop Photo */}
                      <button
                        type="button"
                        onClick={() => setEditingPhoto(photo)}
                        title="Crop or rotate photo"
                        className="p-1 rounded bg-black/70 hover:bg-[#E50914] text-white transition-colors cursor-pointer"
                      >
                        <CropIcon className="w-3.5 h-3.5" />
                      </button>

                      {/* Move earlier */}
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(index, 'up')}
                        disabled={index === 0}
                        title="Move earlier in timeline"
                        className="p-1 rounded bg-black/70 hover:bg-[#E50914] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move later */}
                      <button
                        type="button"
                        onClick={() => handleMovePhoto(index, 'down')}
                        disabled={index === photos.length - 1}
                        title="Move later in timeline"
                        className="p-1 rounded bg-black/70 hover:bg-[#E50914] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        title="Remove photo"
                        className="p-1 rounded bg-black/70 hover:bg-red-600 text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Hover Center Quick Edit Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-[1px] z-10 pointer-events-none">
                    <button
                      type="button"
                      onClick={() => setEditingPhoto(photo)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B80000] to-[#E50914] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,9,20,0.6)] transition-transform hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer"
                    >
                      <CropIcon className="w-3.5 h-3.5" />
                      <span>{photo.editState ? 'Re-edit Crop' : 'Crop & Rotate'}</span>
                    </button>
                  </div>

                  {/* Edited state badge */}
                  {photo.editState && (
                    <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded bg-[#E50914]/90 text-white text-[9px] font-mono font-bold flex items-center gap-1 shadow-md">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Edited {photo.editState.rotation > 0 ? `(${photo.editState.rotation}°)` : ''}</span>
                    </div>
                  )}
                </div>

                {/* Caption / Note input & edit action */}
                <div className="p-3 bg-[#0F0F0F] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setEditingPhoto(photo)}
                      className="text-neutral-400 hover:text-[#E50914] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CropIcon className="w-3 h-3 text-[#E50914]" />
                      <span>{photo.editState ? 'Edit Crop & Angle' : 'Crop / Rotate'}</span>
                    </button>
                    {photo.editState && (
                      <button
                        type="button"
                        onClick={() => handleResetPhotoToOriginal(photo.id)}
                        className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer text-[10px]"
                        title="Reset this photo to original orientation and crop"
                      >
                        Reset Original
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                    placeholder="Memory title or caption..."
                    className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-[#E50914] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 outline-none"
                  />
                  <input
                    type="text"
                    value={photo.location || ''}
                    onChange={(e) => handleLocationChange(photo.id, e.target.value)}
                    placeholder="Location / Date (optional)..."
                    className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-[#E50914] rounded-lg px-2.5 py-1 text-[11px] text-neutral-300 placeholder-neutral-600 outline-none"
                  />
                </div>
              </div>
            ))}

            {/* Add more button tile if under 20 */}
            {photos.length < 20 && !isOptimizing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/3] rounded-xl border border-dashed border-[#2E2E2E] bg-[#0E0E0E] hover:border-[#E50914] hover:bg-[#141414] text-neutral-400 hover:text-white flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-6 h-6 text-[#E50914]" />
                <span className="text-xs font-medium">Add Photo ({photos.length}/20)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="pt-6 border-t border-[#242424] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-[#141414] border border-[#2A2A2A] rounded-xl hover:bg-[#1C1C1C] transition-colors cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Details</span>
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={isOptimizing}
          className="px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#E50914] hover:bg-[#c90711] disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-[#E50914]/25 hover:shadow-[#E50914]/40 cursor-pointer flex items-center gap-2"
        >
          <span>Curate Story</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Image Crop & Rotate Modal */}
      <ImageEditorModal
        isOpen={!!editingPhoto}
        photo={editingPhoto}
        onApply={handleApplyPhotoEdit}
        onCancel={() => setEditingPhoto(null)}
        onResetToOriginal={handleResetPhotoToOriginal}
      />
    </div>
  );
};

function createSampleMemoryCanvas(title: string, colorA: string, colorB: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 800, 600);
  grad.addColorStop(0, colorA);
  grad.addColorStop(1, colorB);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);

  // Subtle grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 800; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 600);
    ctx.stroke();
  }
  for (let y = 0; y < 600; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(800, y);
    ctx.stroke();
  }

  // Golden hour orb
  const rad = ctx.createRadialGradient(400, 260, 20, 400, 260, 260);
  rad.addColorStop(0, 'rgba(229, 9, 20, 0.25)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rad;
  ctx.beginPath();
  ctx.arc(400, 260, 260, 0, Math.PI * 2);
  ctx.fill();

  // Typography
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 400, 310);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '14px monospace';
  ctx.fillText('CINEMATIC 35MM FRAME · OPTIMIZED WEBP', 400, 350);

  return canvas.toDataURL('image/webp', 0.88);
}
