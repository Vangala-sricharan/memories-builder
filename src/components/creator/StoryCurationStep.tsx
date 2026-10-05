import React, { useRef, useState } from 'react';
import { UploadedPhoto } from '../../types';
import { AutoFitImage } from '../common/AutoFitImage';
import { 
  Star, 
  Heart, 
  Sparkles, 
  UploadCloud, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ShieldAlert,
  HelpCircle,
  Eye,
  Crop as CropIcon
} from 'lucide-react';
import { ImageEditorModal } from '../common/ImageEditorModal';

interface StoryCurationStepProps {
  photos: UploadedPhoto[];
  onUpdatePhoto?: (photo: UploadedPhoto) => void;
  heroPhotoId?: string;
  onSelectHeroPhoto: (id: string) => void;
  innerCirclePhotoIds: string[];
  onToggleInnerCirclePhoto: (id: string) => void;
  surprisePhoto?: UploadedPhoto | null;
  onUpdateSurprisePhoto: (photo: UploadedPhoto | null) => void;
  onNext: () => void;
  onBack: () => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const StoryCurationStep: React.FC<StoryCurationStepProps> = ({
  photos,
  onUpdatePhoto,
  heroPhotoId,
  onSelectHeroPhoto,
  innerCirclePhotoIds,
  onToggleInnerCirclePhoto,
  surprisePhoto,
  onUpdateSurprisePhoto,
  onNext,
  onBack,
}) => {
  const surpriseInputRef = useRef<HTMLInputElement | null>(null);
  const [surpriseError, setSurpriseError] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<UploadedPhoto | null>(null);
  const [isEditingSurprise, setIsEditingSurprise] = useState<boolean>(false);

  // Default hero to first photo if not set
  const activeHeroId = heroPhotoId || (photos.length > 0 ? photos[0].id : '');

  const handleSurpriseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSurpriseError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        setSurpriseError('Please choose a JPG, JPEG, PNG, or WebP image.');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setSurpriseError('Maximum file size: 15 MB.');
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      onUpdateSurprisePhoto({
        id: `surprise-${Date.now()}`,
        file,
        previewUrl,
        originalFile: file,
        originalPreviewUrl: previewUrl,
        caption: 'A Secret Preserved Just For You',
        aspect: '16:9',
      });
      e.target.value = '';
    }
  };

  const handleApplyEdit = (updatedPhoto: UploadedPhoto) => {
    if (isEditingSurprise) {
      onUpdateSurprisePhoto(updatedPhoto);
    } else if (onUpdatePhoto) {
      onUpdatePhoto(updatedPhoto);
    }
    setEditingPhoto(null);
    setIsEditingSurprise(false);
  };

  const handleResetEdit = (photoId: string) => {
    if (isEditingSurprise && surprisePhoto) {
      onUpdateSurprisePhoto({
        ...surprisePhoto,
        previewUrl: surprisePhoto.originalPreviewUrl || surprisePhoto.previewUrl,
        file: surprisePhoto.originalFile || surprisePhoto.file,
        editState: undefined,
      });
    } else if (onUpdatePhoto) {
      const ph = photos.find((p) => p.id === photoId);
      if (ph) {
        onUpdatePhoto({
          ...ph,
          previewUrl: ph.originalPreviewUrl || ph.previewUrl,
          file: ph.originalFile || ph.file,
          editState: undefined,
        });
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-12">
      {/* Step Header */}
      <div className="text-center">
        <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#E50914] font-semibold">
          STEP 04 OF 08 · CURATE
        </span>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-white mt-1 mb-2 [text-wrap:balance]">
          CURATE THE CINEMATIC STORY
        </h2>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed [text-wrap:balance]">
          Define the dramatic focal points. Choose the central hero portrait, curate the intimate Inner Circle, and optionally seal a confidential surprise reveal.
        </p>
      </div>

      {/* Part 1: Select Hero Image */}
      <div className="bg-[#0F0F0F] border border-[#242424] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#202020]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E50914]">
              <Star className="w-4 h-4 fill-[#E50914]" />
              <span>Section 2: Hero Portrait</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select one photo to be showcased as the grand opening hero frame.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Click any photo below to designate as Hero
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {photos.map((ph, idx) => {
            const isHero = activeHeroId === ph.id;
            return (
              <div
                key={ph.id}
                onClick={() => onSelectHeroPhoto(ph.id)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                  isHero
                    ? 'border-[#E50914] ring-2 ring-[#E50914]/40 scale-105 shadow-xl'
                    : 'border-[#262626] opacity-70 hover:opacity-100 hover:border-neutral-500'
                }`}
              >
                <AutoFitImage src={ph.previewUrl} alt={ph.caption} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-1.5 left-1.5 text-[9px] font-mono px-1 rounded bg-black/80 text-white">
                  #{idx + 1}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingSurprise(false);
                    setEditingPhoto(ph);
                  }}
                  title="Crop or rotate this photo"
                  className="absolute top-1.5 right-1.5 p-1 rounded bg-black/80 hover:bg-[#E50914] text-white transition-colors cursor-pointer z-10"
                >
                  <CropIcon className="w-3 h-3" />
                </button>

                {isHero && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="bg-[#E50914] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Hero
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: Inner Circle Photos */}
      <div className="bg-[#0F0F0F] border border-[#242424] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#202020]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
              <Heart className="w-4 h-4 text-[#E50914] fill-[#E50914]" />
              <span>Section 3: The Inner Circle</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select the intimate subset for the circular constellation formation ({innerCirclePhotoIds.length || Math.min(4, photos.length)} selected).
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Toggle photos in or out
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {photos.map((ph, idx) => {
            const isInner = innerCirclePhotoIds.includes(ph.id);
            return (
              <div
                key={`inner-${ph.id}`}
                onClick={() => onToggleInnerCirclePhoto(ph.id)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                  isInner
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'border-[#262626] opacity-60 hover:opacity-100 hover:border-neutral-500'
                }`}
              >
                <AutoFitImage src={ph.previewUrl} alt={ph.caption} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-1.5 left-1.5 text-[9px] font-mono px-1 rounded bg-black/80 text-white">
                  #{idx + 1}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingSurprise(false);
                    setEditingPhoto(ph);
                  }}
                  title="Crop or rotate this photo"
                  className="absolute top-1.5 right-1.5 p-1 rounded bg-black/80 hover:bg-[#E50914] text-white transition-colors cursor-pointer z-10"
                >
                  <CropIcon className="w-3 h-3" />
                </button>

                <div className="absolute bottom-1.5 right-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isInner ? 'bg-emerald-500 text-black' : 'bg-black/80 text-neutral-500'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 3: Optional Surprise Image */}
      <div className="bg-[#0F0F0F] border border-[#242424] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#202020]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF4D4D]">
              <Sparkles className="w-4 h-4" />
              <span>Section 6: Optional Surprise Moment</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Add a separate confidential photo that is locked until the recipient unlocks it. If omitted, the section disappears completely.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Optional
          </span>
        </div>

        {surpriseError && (
          <div className="p-3 bg-red-950/40 border border-[#E50914] text-xs text-white rounded-xl">
            {surpriseError}
          </div>
        )}

        <input
          ref={surpriseInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleSurpriseUpload}
          className="hidden"
        />

        {!surprisePhoto ? (
          <div
            onClick={() => surpriseInputRef.current?.click()}
            className="border-2 border-dashed border-[#2B2B2B] hover:border-[#E50914] rounded-xl p-8 text-center cursor-pointer transition-all bg-[#0A0A0A] hover:bg-[#121212] group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#2A2A2A] mx-auto flex items-center justify-center text-neutral-400 group-hover:text-[#E50914] mb-3">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-white mb-1">
              Add Optional Surprise Photo
            </div>
            <div className="text-[11px] text-neutral-400">
              Click to choose a secret photograph for the confidential Act VI reveal
            </div>
          </div>
        ) : (
          <div className="bg-[#140808] border border-[#3E1414] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                <AutoFitImage
                  src={surprisePhoto.previewUrl}
                  alt={surprisePhoto.caption}
                />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#E50914] block">
                  SURPRISE ATTACHED
                </span>
                <input
                  type="text"
                  value={surprisePhoto.caption}
                  onChange={(e) =>
                    onUpdateSurprisePhoto({
                      ...surprisePhoto,
                      caption: e.target.value,
                    })
                  }
                  className="bg-[#1C1212] border border-[#3A1E1E] focus:border-[#E50914] rounded px-2.5 py-1 text-xs text-white outline-none w-full sm:w-72 mt-1"
                  placeholder="Caption for surprise reveal..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditingSurprise(true);
                  setEditingPhoto(surprisePhoto);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#251010] hover:bg-[#E50914] text-neutral-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Crop or rotate surprise photo"
              >
                <CropIcon className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Crop / Rotate</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSurprisePhoto(null)}
                className="p-2 rounded-lg bg-[#251010] hover:bg-red-950 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Remove surprise photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="pt-6 border-t border-[#242424] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-[#141414] border border-[#2A2A2A] rounded-xl hover:bg-[#1C1C1C] transition-colors cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Memories</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#E50914] hover:bg-[#c90711] rounded-xl transition-all shadow-lg shadow-[#E50914]/25 hover:shadow-[#E50914]/40 cursor-pointer flex items-center gap-2"
        >
          <span>Continue to Music</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Crop & Rotate Modal for Story Curation */}
      <ImageEditorModal
        isOpen={!!editingPhoto}
        photo={editingPhoto}
        onApply={handleApplyEdit}
        onCancel={() => {
          setEditingPhoto(null);
          setIsEditingSurprise(false);
        }}
        onResetToOriginal={handleResetEdit}
      />
    </div>
  );
};
