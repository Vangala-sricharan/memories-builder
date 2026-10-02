export type ParticleShape = 
  | 'abstract' 
  | 'heart' 
  | 'star' 
  | 'circle' 
  | 'diamond' 
  | 'balloon' 
  | 'galaxy';

export type CreatorStep = 
  | 'details' 
  | 'photos' 
  | 'curate' 
  | 'music' 
  | 'customize' 
  | 'review'
  | 'preview'
  | 'published';

export type PublishStatus = 
  | 'DRAFT' 
  | 'PREVIEW' 
  | 'PUBLISHING' 
  | 'PUBLISHED' 
  | 'EXPIRED' 
  | 'FAILED';

export interface PublishedExperienceSnapshot {
  readonly experienceId: string;
  readonly recipientName: string;
  readonly relationship?: string;
  readonly customRelationship?: string;
  readonly birthday?: string;
  readonly milestoneAge?: number;
  readonly senderName?: string;
  readonly birthdayMessage: string;
  readonly photos: readonly UploadedPhoto[];
  readonly heroPhotoId?: string;
  readonly innerCirclePhotoIds: readonly string[];
  readonly surprisePhoto: UploadedPhoto | null;
  readonly finalMessage: string;
  readonly music: UploadedMusic | null;
  readonly tagline: string;
  readonly openingQuote: string;
  readonly storyNarrative?: string;
  readonly innerCircleIntro?: string;
  readonly vaultIntro?: string;
  readonly surpriseText?: string;
  readonly particleIntensity: 'subtle' | 'normal' | 'vibrant';
  readonly publishedAt: string; // ISO 8601 UTC
  readonly expiresAt: string;   // ISO 8601 UTC
  readonly status: 'PUBLISHED' | 'EXPIRED';
}

export interface UploadedPhoto {
  id: string;
  file?: File;
  previewUrl: string;
  caption: string;
  location?: string;
  year?: string;
  aspect?: '16:9' | '4:3' | '1:1';
}

export interface UploadedMusic {
  file?: File;
  url: string;
  fileName: string;
  fileSizeFormatted?: string;
  duration?: number;
  isSample?: boolean;
}

export interface BirthdayExperienceDraft {
  recipientName: string;
  relationship: string;
  customRelationship?: string;
  birthday: string;
  milestoneAge?: number;
  senderName: string;
  birthdayMessage: string;
  photos: UploadedPhoto[];
  heroPhotoId?: string; // ID of the photo selected as hero
  innerCirclePhotoIds: string[]; // IDs of photos selected for the Inner Circle
  surprisePhoto?: UploadedPhoto | null; // Optional surprise photo
  finalMessage: string;
  music: UploadedMusic | null;
  tagline: string;
  openingQuote: string;
  storyNarrative?: string;
  innerCircleIntro?: string;
  vaultIntro?: string;
  surpriseText?: string;
  particleIntensity: 'subtle' | 'normal' | 'vibrant';
}

export interface PhotoMemory {
  id: string;
  caption: string;
  year?: string;
  location?: string;
  accentColor?: string;
  aspect?: '16:9' | '4:3' | '1:1';
  url?: string;
}

export interface BirthdayExperienceData {
  recipientName: string;
  milestoneAge: number;
  date: string;
  tagline: string;
  openingQuote: string;
  personalNarrative: string;
  soundtrack: {
    fileName: string;
    duration: string;
    artistOrNote: string;
    url?: string;
  };
  memories: PhotoMemory[];
  heroMemoryId?: string;
  innerCircleMemoryIds?: string[];
  surpriseMemory?: PhotoMemory | null;
  finalMessage?: string;
}
