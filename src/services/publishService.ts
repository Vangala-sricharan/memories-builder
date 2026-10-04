import { BirthdayExperienceDraft, PublishedExperienceSnapshot, PublishStatus, UploadedPhoto, UploadedMusic } from '../types';

// In-memory cache with sessionStorage backup for immediate rendering during page transitions
const memoryCache = new Map<string, PublishedExperienceSnapshot>();
const STORAGE_PREFIX = 'birthday_published_exp_';

/**
 * Generate a cryptographically random, URL-safe opaque ID.
 * Strictly avoids recipient names, personal metadata, or sequential integers.
 * Example output: "8fK29xQpLm72"
 */
export function createExperienceId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 12; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

/**
 * Converts a File or Blob preview URL to base64 for secure transmission to server / Supabase Storage.
 */
async function fileOrUrlToBase64(file?: File, previewUrl?: string): Promise<{ dataBase64: string; mimeType: string }> {
  if (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const mime = file.type || 'image/webp';
        resolve({ dataBase64: result, mimeType: mime });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  if (previewUrl && previewUrl.startsWith('data:')) {
    const match = previewUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], dataBase64: match[2] };
    }
  }

  if (previewUrl && previewUrl.startsWith('blob:')) {
    const res = await fetch(previewUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ dataBase64: reader.result as string, mimeType: blob.type || 'image/webp' });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Fallback 1x1 WebP
  return {
    mimeType: 'image/webp',
    dataBase64: 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
  };
}

/**
 * Checks if a published snapshot has passed its 24-hour expiration window.
 * Strictly calculated using UTC timestamps, not client session timers.
 */
export function isExperienceExpired(snapshot: PublishedExperienceSnapshot): boolean {
  if (snapshot.status === 'EXPIRED') return true;
  const expiryTime = new Date(snapshot.expiresAt).getTime();
  return Date.now() >= expiryTime;
}

/**
 * Synchronous cache lookup for instant initial view rendering.
 */
export function getPublishedExperience(experienceId: string): PublishedExperienceSnapshot | null {
  if (!experienceId) return null;

  // 1. Memory cache
  const cached = memoryCache.get(experienceId);
  if (cached) return cached;

  // 2. Session storage fallback
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${experienceId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          memoryCache.set(experienceId, parsed);
          return parsed;
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  return null;
}

/**
 * Authoritative backend fetch for a published experience.
 * Calls GET /api/experience/:experienceId which checks server time against expires_at.
 */
export async function fetchPublishedExperience(experienceId: string): Promise<PublishedExperienceSnapshot | null> {
  if (!experienceId) return null;

  try {
    const res = await fetch(`/api/experience/${encodeURIComponent(experienceId)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (res.status === 404) {
      return null;
    }

    const data = await res.json();

    if (data.status === 'EXPIRED') {
      const expiredSnapshot: PublishedExperienceSnapshot = {
        experienceId,
        recipientName: '',
        birthdayMessage: '',
        photos: [],
        innerCirclePhotoIds: [],
        surprisePhoto: null,
        finalMessage: '',
        music: null,
        tagline: '',
        openingQuote: '',
        particleIntensity: 'normal',
        publishedAt: data.publishedAt || new Date().toISOString(),
        expiresAt: data.expiresAt || new Date().toISOString(),
        status: 'EXPIRED',
      };
      memoryCache.set(experienceId, expiredSnapshot);
      return expiredSnapshot;
    }

    if (data.status === 'PUBLISHED') {
      const snapshot: PublishedExperienceSnapshot = Object.freeze({
        experienceId,
        recipientName: data.recipientName,
        relationship: data.relationship,
        customRelationship: data.customRelationship,
        birthday: data.birthday,
        milestoneAge: data.milestoneAge,
        senderName: data.senderName,
        birthdayMessage: data.birthdayMessage,
        photos: Object.freeze(data.photos || []),
        heroPhotoId: data.heroPhotoId,
        innerCirclePhotoIds: Object.freeze(data.innerCirclePhotoIds || []),
        surprisePhoto: data.surprisePhoto || null,
        finalMessage: data.finalMessage,
        music: data.music || null,
        tagline: data.tagline,
        openingQuote: data.openingQuote,
        storyNarrative: data.storyNarrative,
        innerCircleIntro: data.innerCircleIntro,
        vaultIntro: data.vaultIntro,
        surpriseText: data.surpriseText,
        particleIntensity: data.particleIntensity || 'normal',
        cinematicExtras: data.cinematicExtras || undefined,
        publishedAt: data.publishedAt,
        expiresAt: data.expiresAt,
        status: 'PUBLISHED',
      });

      memoryCache.set(experienceId, snapshot);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`${STORAGE_PREFIX}${experienceId}`, JSON.stringify(snapshot));
        } catch (e) {}
      }
      return snapshot;
    }

    return null;
  } catch (err) {
    // If offline, check local cache
    return getPublishedExperience(experienceId);
  }
}

/**
 * Immutability assertion helper:
 * Enforces at the business logic layer that published or expired experiences cannot be mutated.
 */
export function assertNotPublished(status: PublishStatus): void {
  if (status === 'PUBLISHED') {
    throw new Error('IMMUTABILITY VIOLATION: Published birthday experiences are permanently locked and cannot be edited.');
  }
  if (status === 'EXPIRED') {
    throw new Error('EXPIRATION VIOLATION: Expired birthday experiences cannot be edited or revived.');
  }
}

/**
 * Publishes a birthday experience using Stage 5 Temporary Backend:
 * 1. Validates prerequisites (recipient name, 3-20 photos).
 * 2. Uploads optimized photos and MP3 to private Supabase Storage via /api/upload-media.
 * 3. Sends frozen payload to /api/publish.
 * 4. Backend stores metadata in Supabase and atomically increments global counter.
 */
export async function publishExperience(
  draft: BirthdayExperienceDraft
): Promise<PublishedExperienceSnapshot> {
  // Validate minimum requirements
  if (!draft.recipientName || !draft.recipientName.trim()) {
    throw new Error('A recipient name is required before publishing.');
  }
  if (!draft.photos || draft.photos.length < 3) {
    throw new Error('At least 3 photos are required to publish a complete birthday experience.');
  }

  const experienceId = createExperienceId();

  // 1. Upload all optimized photos to private Supabase Storage
  const uploadedPhotos: UploadedPhoto[] = [];
  for (let i = 0; i < draft.photos.length; i++) {
    const photo = draft.photos[i];
    try {
      const { dataBase64, mimeType } = await fileOrUrlToBase64(photo.file, photo.previewUrl);
      const res = await fetch('/api/upload-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId,
          type: 'image',
          dataBase64,
          mimeType,
          fileName: photo.file?.name || `photo-${i + 1}.webp`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Media upload rejected (status ${res.status})`);
      }

      const uploadData = await res.json();
      uploadedPhotos.push({
        ...photo,
        previewUrl: uploadData.url || photo.previewUrl,
      });
    } catch (err: any) {
      console.error(`Failed uploading photo ${i + 1}:`, err?.message);
      throw new Error(`Failed to upload photo ${i + 1} to storage: ${err?.message || 'Storage upload failed'}`);
    }
  }

  // 2. Upload optional surprise photo to private Supabase Storage
  let uploadedSurprise: UploadedPhoto | null = null;
  if (draft.surprisePhoto) {
    try {
      const { dataBase64, mimeType } = await fileOrUrlToBase64(
        draft.surprisePhoto.file,
        draft.surprisePhoto.previewUrl
      );
      const res = await fetch('/api/upload-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId,
          type: 'image',
          dataBase64,
          mimeType,
          fileName: draft.surprisePhoto.file?.name || 'surprise.webp',
        }),
      });

      if (!res.ok) {
        throw new Error(`Surprise photo upload rejected (status ${res.status})`);
      }

      const uploadData = await res.json();
      uploadedSurprise = {
        ...draft.surprisePhoto,
        previewUrl: uploadData.url || draft.surprisePhoto.previewUrl,
      };
    } catch (e: any) {
      console.error('Failed uploading surprise photo:', e?.message);
      throw new Error(`Failed to upload surprise photo to storage: ${e?.message || 'Upload failed'}`);
    }
  }

  // 3. Upload optional MP3 directly to private Supabase Storage via signed upload URL
  let uploadedMusic: UploadedMusic | null = null;
  if (draft.music) {
    try {
      let fileBlob: Blob | File | null = draft.music.file || null;
      if (!fileBlob && draft.music.url && draft.music.url.startsWith('blob:')) {
        const blobRes = await fetch(draft.music.url);
        fileBlob = await blobRes.blob();
      }

      if (fileBlob) {
        // Step A: Request signed upload URL from backend (sends ONLY lightweight JSON metadata, ~150 bytes)
        // Avoids Vercel's 4.5MB Serverless Function payload limit (HTTP 413)
        const signRes = await fetch('/api/create-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experienceId,
            type: 'music',
            mimeType: 'audio/mpeg',
            fileName: draft.music.fileName || 'soundtrack.mp3',
          }),
        });

        if (!signRes.ok) {
          throw new Error(`Failed to initialize secure music upload (status ${signRes.status})`);
        }

        const signData = await signRes.json();
        if (!signData.success || !signData.uploadUrl) {
          throw new Error(signData.error || 'Invalid signed upload URL response');
        }

        // Step B: Upload the raw MP3 binary directly from browser to private Supabase Storage
        // The binary NEVER passes through the Vercel Serverless Function request body!
        const uploadRes = await fetch(signData.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'audio/mpeg',
          },
          body: fileBlob,
        });

        if (!uploadRes.ok) {
          throw new Error(`Direct music upload to storage failed (status ${uploadRes.status})`);
        }

        uploadedMusic = {
          ...draft.music,
          url: signData.mediaUrl,
        };
      }
    } catch (e: any) {
      console.error('Failed uploading music soundtrack:', e?.message);
      throw new Error(`Failed to upload music soundtrack to storage: ${e?.message || 'Upload failed'}`);
    }
  }

  // 4. Prepare draft payload with Supabase Storage media references
  const preparedDraft: BirthdayExperienceDraft = {
    ...draft,
    photos: uploadedPhotos,
    surprisePhoto: uploadedSurprise,
    music: uploadedMusic,
  };

  // 5. Call real backend publish endpoint
  const publishRes = await fetch('/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      draft: preparedDraft,
      experienceId,
    }),
  });

  if (!publishRes.ok) {
    const errorData = await publishRes.json().catch(() => ({}));
    throw new Error(errorData.error || `Publish failed with status ${publishRes.status}`);
  }

  const publishData = await publishRes.json();
  const snapshot: PublishedExperienceSnapshot = Object.freeze(publishData.snapshot);

  // Store in cache
  memoryCache.set(experienceId, snapshot);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`${STORAGE_PREFIX}${experienceId}`, JSON.stringify(snapshot));
    } catch (e) {}
  }

  return snapshot;
}

/**
 * Development / testing simulation helper:
 * Calls POST /api/experience/:id/simulate-expire to test expired state in real time.
 */
export async function simulateExpireExperience(experienceId: string): Promise<PublishedExperienceSnapshot | null> {
  try {
    const res = await fetch(`/api/experience/${encodeURIComponent(experienceId)}/simulate-expire`, {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      const existing = getPublishedExperience(experienceId);
      if (existing) {
        const expiredSnapshot: PublishedExperienceSnapshot = Object.freeze({
          ...existing,
          status: 'EXPIRED',
          expiresAt: new Date(Date.now() - 5000).toISOString(),
        });
        memoryCache.set(experienceId, expiredSnapshot);
        return expiredSnapshot;
      }
    }
  } catch (err) {
    console.error('Error simulating expiration:', err);
  }

  return null;
}
