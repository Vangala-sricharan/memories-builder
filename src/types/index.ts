export type ParticleShape = 
  | 'abstract' 
  | 'heart' 
  | 'star' 
  | 'circle' 
  | 'diamond' 
  | 'balloon' 
  | 'galaxy';

export type ExperienceTemplate = 'cinema' | 'memories' | 'celebration' | 'elegance';

export interface ExperienceTheme {
  background: string;
  primary: string;
  secondary: string;
}

export type ExperienceMood = 'emotional' | 'cinematic' | 'energetic' | 'elegant' | 'fun';
export type AccentIntensity = 'subtle' | 'balanced' | 'bold';
export type GlowStyle = 'none' | 'subtle' | 'cinematic';
export type BorderStyle = 'none' | 'thin' | 'cinematic';
export type HeadingStyle = 'classic-serif' | 'modern-editorial' | 'bold-cinematic' | 'luxury';
export type BodyStyle = 'clean' | 'editorial' | 'minimal';
export type MotionEnergy = 'subtle' | 'cinematic' | 'epic';
export type ParticleAtmosphere = 'minimal' | 'cinematic' | 'intense';
export type PhotoPresentationStyle = 'cinematic' | 'editorial' | 'film-strip' | 'polaroid' | 'fullscreen';
export type HeroFocus = 'auto' | 'center' | 'top' | 'bottom' | 'left' | 'right';
export type OccasionType = 'birthday' | 'milestone' | '18th' | '21st' | '25th' | '30th' | '40th' | '50th' | 'other';

export interface CustomSectionTitles {
  innerCircle?: string;
  memories?: string;
  vault?: string;
  surprise?: string;
}

export interface ChapterTitlesConfig {
  chapter1?: string; // Default: 'THE BEGINNING'
  chapterTwo?: string; // Default: 'THE MEMORIES'
  chapter3?: string; // Default: 'THE PEOPLE'
  chapter4?: string; // Default: 'THE VAULT'
  chapter5?: string; // Default: 'THE SURPRISE'
  chapter6?: string; // Default: 'FINALE'
}

export interface CinematicExtras {
  // 1. Secret Reveal
  secretRevealEnabled?: boolean;
  secretPhotoId?: string; // ID of chosen uploaded photo

  // 2. Hidden Message
  hiddenMessageEnabled?: boolean;
  hiddenMessageText?: string;

  // 3. Cinematic Chapter Titles
  chapterTitlesEnabled?: boolean;
  chapters?: ChapterTitlesConfig;

  // 4. Memory Spotlight
  memorySpotlightEnabled?: boolean;
  spotlightPhotoIds?: string[]; // IDs of chosen uploaded photos

  // 5. Surprise Lock
  surpriseLockEnabled?: boolean;

  // 6. Music-Synced Moments
  musicSyncedEnabled?: boolean;

  // 10. Easter Egg
  easterEggEnabled?: boolean; // Default true (brand mark interaction)
}

export interface ExperienceCustomization {
  mood: ExperienceMood;
  accentIntensity: AccentIntensity;
  glowStyle: GlowStyle;
  borderStyle: BorderStyle;
  headingStyle: HeadingStyle;
  bodyStyle: BodyStyle;
  motionEnergy: MotionEnergy;
  particleAtmosphere: ParticleAtmosphere;
  photoStyle: PhotoPresentationStyle;
  heroFocus: HeroFocus;
  occasion: OccasionType;
  customOccasion?: string;
  sectionTitles?: CustomSectionTitles;
}

export type CreatorStep = 
  | 'template'
  | 'details' 
  | 'photos' 
  | 'curate' 
  | 'music' 
  | 'customize' 
  | 'theme'
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
  readonly template?: ExperienceTemplate;
  readonly theme?: ExperienceTheme;
  readonly customization?: ExperienceCustomization;
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
  readonly cinematicExtras?: CinematicExtras;
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
  template: ExperienceTemplate;
  theme: ExperienceTheme;
  customization: ExperienceCustomization;
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
  cinematicExtras?: CinematicExtras;
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
  template?: ExperienceTemplate;
  theme?: ExperienceTheme;
  customization?: ExperienceCustomization;
  cinematicExtras?: CinematicExtras;
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
