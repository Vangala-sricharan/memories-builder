import { BirthdayExperienceDraft, PublishedExperienceSnapshot, UploadedPhoto } from '../types';

/**
 * Generates a stable unique identifier for a photo if missing or invalid.
 */
function generateStableId(prefix: string = 'photo'): string {
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}-${time}-${rand}`;
}

/**
 * Normalizes an array of photos, ensuring:
 * 1. Every photo has a stable unique ID
 * 2. Deduplicates ID collisions
 * 3. Does not drop editing or metadata fields
 */
export function normalizePhotosList(
  rawPhotos: unknown,
  existingIds: Set<string>,
  prefix: string = 'photo'
): UploadedPhoto[] {
  if (!Array.isArray(rawPhotos)) return [];

  const validPhotos: UploadedPhoto[] = [];

  for (const raw of rawPhotos) {
    if (!raw || typeof raw !== 'object') continue;

    const p = raw as Partial<UploadedPhoto>;
    let id = typeof p.id === 'string' && p.id.trim() ? p.id.trim() : '';

    // If no ID or already used in this experience, allocate a unique stable ID
    if (!id || existingIds.has(id)) {
      id = generateStableId(prefix);
    }
    existingIds.add(id);

    validPhotos.push({
      id,
      file: p.file,
      originalFile: p.originalFile,
      previewUrl: typeof p.previewUrl === 'string' ? p.previewUrl : '',
      originalPreviewUrl: typeof p.originalPreviewUrl === 'string' ? p.originalPreviewUrl : p.previewUrl,
      caption: typeof p.caption === 'string' ? p.caption : '',
      location: typeof p.location === 'string' ? p.location : undefined,
      year: typeof p.year === 'string' ? p.year : undefined,
      aspect: p.aspect || '4:3',
      editState: p.editState,
    });
  }

  return validPhotos;
}

/**
 * Normalizes a draft's photos and secret photos into the canonical model:
 * - photos: 6 to 25 UploadedPhoto[]
 * - secretPhotos: 0 to 5 UploadedPhoto[]
 * - Legacy surprisePhoto migrated safely if secretPhotos was empty
 * - Strictly NO fallback from normal photos into secretPhotos
 */
export function normalizeDraftData(draft: Partial<BirthdayExperienceDraft>): BirthdayExperienceDraft {
  const existingIds = new Set<string>();

  // 1. Normalize Normal Photos
  const photos = normalizePhotosList(draft.photos, existingIds, 'photo');

  // 2. Normalize Secret Photos (Canonical)
  let rawSecrets: unknown = draft.secretPhotos;

  // Backward compatibility: If no secretPhotos array
  if (!Array.isArray(rawSecrets) || rawSecrets.length === 0) {
    if (draft.surprisePhoto) {
      rawSecrets = [draft.surprisePhoto];
    } else if (draft.cinematicExtras?.secretRevealEnabled && draft.cinematicExtras?.secretPhotoId) {
      const legacyPhoto = photos.find((p) => p.id === draft.cinematicExtras?.secretPhotoId);
      if (legacyPhoto) {
        // Clone with separate stable secret ID to guarantee no duplicate collision
        rawSecrets = [{
          ...legacyPhoto,
          id: `secret-${legacyPhoto.id}`,
          caption: legacyPhoto.caption || 'A Secret Preserved Just For You',
        }];
      }
    }
  }

  let secretPhotos = normalizePhotosList(rawSecrets, existingIds, 'secret');

  // 3. Strict 0 to 5 limit enforcement
  if (secretPhotos.length > 5) {
    console.warn(`[DataModel] Draft contained ${secretPhotos.length} secrets; clamped to maximum 5.`);
    secretPhotos = secretPhotos.slice(0, 5);
  }

  return {
    template: draft.template || 'cinema',
    theme: draft.theme || { background: '#080808', primary: '#E50914', secondary: '#FFFFFF' },
    customization: draft.customization || ({} as any),
    recipientName: draft.recipientName || '',
    relationship: draft.relationship || 'Best Friend',
    customRelationship: draft.customRelationship,
    birthday: draft.birthday || '',
    milestoneAge: draft.milestoneAge,
    senderName: draft.senderName || '',
    birthdayMessage: draft.birthdayMessage || '',
    photos,
    heroPhotoId: draft.heroPhotoId,
    innerCirclePhotoIds: Array.isArray(draft.innerCirclePhotoIds) ? draft.innerCirclePhotoIds : [],
    secretPhotos,
    surprisePhoto: secretPhotos[0] || null, // Kept for legacy accessor compatibility only
    finalMessage: draft.finalMessage || '',
    music: draft.music || null,
    tagline: draft.tagline || 'A Cinematic Birthday Story',
    openingQuote: draft.openingQuote || '“Some people make the world brighter simply by being in it. Here is a film of your light.”',
    storyNarrative: draft.storyNarrative,
    innerCircleIntro: draft.innerCircleIntro,
    vaultIntro: draft.vaultIntro,
    surpriseText: draft.surpriseText,
    particleIntensity: draft.particleIntensity || 'normal',
    cinematicExtras: draft.cinematicExtras,
  };
}

/**
 * Normalizes a published snapshot into the canonical data model:
 * - photos: readonly UploadedPhoto[]
 * - secretPhotos: readonly UploadedPhoto[] (0 to 5)
 * - Safe legacy migration of surprisePhoto
 * - Guarantees unique stable IDs
 */
export function normalizePublishedSnapshot(
  snapshot: Partial<PublishedExperienceSnapshot>
): PublishedExperienceSnapshot {
  const existingIds = new Set<string>();

  const photos = normalizePhotosList(snapshot.photos, existingIds, 'photo');

  let rawSecrets: unknown = snapshot.secretPhotos;
  if (!Array.isArray(rawSecrets) || rawSecrets.length === 0) {
    if (snapshot.surprisePhoto) {
      rawSecrets = [snapshot.surprisePhoto];
    } else if (snapshot.cinematicExtras?.secretRevealEnabled && snapshot.cinematicExtras?.secretPhotoId) {
      const legacyPhoto = photos.find((p) => p.id === snapshot.cinematicExtras?.secretPhotoId);
      if (legacyPhoto) {
        rawSecrets = [{
          ...legacyPhoto,
          id: `secret-${legacyPhoto.id}`,
          caption: legacyPhoto.caption || 'A Secret Preserved Just For You',
        }];
      }
    }
  }

  let secretPhotos = normalizePhotosList(rawSecrets, existingIds, 'secret');
  if (secretPhotos.length > 5) {
    console.warn(`[DataModel] Published experience contained ${secretPhotos.length} secrets; clamped to 5.`);
    secretPhotos = secretPhotos.slice(0, 5);
  }

  return {
    experienceId: snapshot.experienceId || 'exp-preview',
    template: snapshot.template || 'cinema',
    theme: snapshot.theme,
    customization: snapshot.customization,
    recipientName: snapshot.recipientName || '',
    relationship: snapshot.relationship,
    customRelationship: snapshot.customRelationship,
    birthday: snapshot.birthday,
    milestoneAge: snapshot.milestoneAge,
    senderName: snapshot.senderName,
    birthdayMessage: snapshot.birthdayMessage || '',
    photos,
    heroPhotoId: snapshot.heroPhotoId,
    innerCirclePhotoIds: Array.isArray(snapshot.innerCirclePhotoIds) ? snapshot.innerCirclePhotoIds : [],
    secretPhotos,
    surprisePhoto: secretPhotos[0] || null, // Legacy accessor fallback
    finalMessage: snapshot.finalMessage || '',
    music: snapshot.music || null,
    tagline: snapshot.tagline || 'A Cinematic Birthday Story',
    openingQuote: snapshot.openingQuote || '',
    storyNarrative: snapshot.storyNarrative,
    innerCircleIntro: snapshot.innerCircleIntro,
    vaultIntro: snapshot.vaultIntro,
    surpriseText: snapshot.surpriseText,
    particleIntensity: snapshot.particleIntensity || 'normal',
    cinematicExtras: snapshot.cinematicExtras,
    publishedAt: snapshot.publishedAt || new Date().toISOString(),
    expiresAt: snapshot.expiresAt || new Date(Date.now() + 86400000).toISOString(),
    status: snapshot.status || 'PUBLISHED',
  };
}
