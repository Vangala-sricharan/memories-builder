import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const BUCKET_NAME = 'birthday-media';

// In-memory fallback buffer store for development/preview environments
interface StoredMedia {
  buffer: Buffer;
  contentType: string;
  size: number;
}
const localMediaStore = new Map<string, StoredMedia>();

/**
 * Ensures the private 'birthday-media' bucket exists in Supabase Storage.
 */
async function ensureBucketExists(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!exists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false, // STRICTLY PRIVATE: No unrestricted public access
        fileSizeLimit: 31457280, // 30MB
        allowedMimeTypes: [
          'image/webp',
          'image/jpeg',
          'image/png',
          'image/jpg',
          'audio/mpeg',
          'audio/mp3',
        ],
      });
    }
  } catch (err: any) {
    // Ignore if already created or permission-checked by schema.sql
  }
}

// Check bucket once on server boot
ensureBucketExists().catch(() => {});

/**
 * Uploads browser-optimized media into private Supabase Storage under:
 * birthday-media/experiences/{experienceId}/photos/{randomObjectId}.webp OR
 * birthday-media/experiences/{experienceId}/music/{randomObjectId}.mp3
 * Strictly avoids personal metadata in storage paths.
 */
export async function uploadMediaToSupabaseStorage(
  experienceId: string,
  type: 'image' | 'music',
  buffer: Buffer,
  contentType: string
): Promise<{ path: string; url: string; sizeBytes: number }> {
  const randomObjectId = crypto.randomBytes(8).toString('hex');
  const ext = type === 'music' ? 'mp3' : 'webp';
  const subFolder = type === 'music' ? 'music' : 'photos';
  const path = `experiences/${experienceId}/${subFolder}/${randomObjectId}.${ext}`;

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: '86400', // 24-hour cache
    });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }
  } else {
    // Local fallback store
    localMediaStore.set(path, {
      buffer,
      contentType,
      size: buffer.length,
    });
  }

  // The client receives the server-controlled proxy URL so that media is served under server-side expiration checks
  const mediaUrl = `/api/media/${experienceId}/${subFolder}/${randomObjectId}.${ext}`;

  return {
    path,
    url: mediaUrl,
    sizeBytes: buffer.length,
  };
}

/**
 * Creates a scoped signed upload URL for direct client-to-Supabase upload.
 * The browser uploads directly to private Supabase Storage without passing
 * through Vercel serverless request limits (avoiding HTTP 413).
 */
export async function createSignedMediaUploadUrl(
  experienceId: string,
  type: 'image' | 'music',
  contentType: string = 'audio/mpeg'
): Promise<{ path: string; uploadUrl: string; token: string; mediaUrl: string }> {
  const randomObjectId = crypto.randomBytes(8).toString('hex');
  const ext = type === 'music' ? 'mp3' : 'webp';
  const subFolder = type === 'music' ? 'music' : 'photos';
  const path = `experiences/${experienceId}/${subFolder}/${randomObjectId}.${ext}`;
  const mediaUrl = `/api/media/${experienceId}/${subFolder}/${randomObjectId}.${ext}`;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(path);

    if (error || !data) {
      throw new Error(`Failed to create signed upload URL: ${error?.message || 'Unknown error'}`);
    }

    return {
      path,
      uploadUrl: data.signedUrl,
      token: data.token,
      mediaUrl,
    };
  }

  // Fallback for offline/mock dev
  return {
    path,
    uploadUrl: `/api/upload-media-direct?path=${encodeURIComponent(path)}`,
    token: 'local-token',
    mediaUrl,
  };
}

/**
 * Generates a short-lived signed URL for a private Supabase Storage object.
 * Capped to lifetime window, never permanent.
 */
export async function createSignedMediaUrl(path: string, expiresInSeconds = 3600): Promise<string | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, expiresInSeconds);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (err: any) {
      console.warn(`Could not generate signed URL for ${path}:`, err?.message);
    }
  }
  return null;
}

/**
 * Retrieves media buffer and content type from Supabase Storage (or fallback store).
 */
export async function getMediaFromSupabaseStorage(
  path: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).download(path);

      if (error || !data) {
        return null;
      }

      const arrayBuffer = await data.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        contentType: data.type || 'application/octet-stream',
      };
    } catch (err: any) {
      console.error(`Failed to fetch media from Supabase Storage for path ${path}:`, err?.message);
      return null;
    }
  }

  const stored = localMediaStore.get(path);
  if (!stored) return null;
  return {
    buffer: stored.buffer,
    contentType: stored.contentType,
  };
}

/**
 * Deletes specific media paths from private Supabase Storage (used for rollbacks or targeted cleanup).
 * Idempotent: continuing safely even if files are already missing.
 */
export async function deleteMediaPaths(paths: string[]): Promise<{ deletedCount: number }> {
  if (!paths || paths.length === 0) return { deletedCount: 0 };
  let deletedCount = 0;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: removed } = await supabase.storage.from(BUCKET_NAME).remove(paths);
      deletedCount = removed?.length || paths.length;
    } catch (err: any) {
      console.error('Error deleting specific Supabase Storage paths:', err?.message);
    }
  } else {
    for (const p of paths) {
      if (localMediaStore.has(p)) {
        localMediaStore.delete(p);
        deletedCount++;
      }
    }
  }

  return { deletedCount };
}

/**
 * Deletes all temporary media files for a specific experience:
 * experiences/{experienceId}/photos/... and experiences/{experienceId}/music/...
 * Idempotent: continuing safely even if files are already missing.
 */
export async function deleteExperienceMediaFromSupabaseStorage(
  experienceId: string,
  knownPaths?: string[]
): Promise<{ deletedCount: number }> {
  let deletedCount = 0;

  // 1. If knownPaths provided from media_references, delete them first
  if (knownPaths && knownPaths.length > 0) {
    const res = await deleteMediaPaths(knownPaths);
    deletedCount += res.deletedCount;
  }

  // 2. Also sweep prefix to guarantee no orphaned files remain
  const prefix = `experiences/${experienceId}`;

  if (isSupabaseConfigured && supabase) {
    try {
      // List and delete photos
      const { data: photoFiles } = await supabase.storage
        .from(BUCKET_NAME)
        .list(`${prefix}/photos`);

      const photoPaths = (photoFiles || []).map((f) => `${prefix}/photos/${f.name}`);

      // List and delete music
      const { data: musicFiles } = await supabase.storage
        .from(BUCKET_NAME)
        .list(`${prefix}/music`);

      const musicPaths = (musicFiles || []).map((f) => `${prefix}/music/${f.name}`);

      const remainingPaths = [...photoPaths, ...musicPaths].filter((p) => !knownPaths?.includes(p));

      if (remainingPaths.length > 0) {
        const { data: removed } = await supabase.storage.from(BUCKET_NAME).remove(remainingPaths);
        deletedCount += removed?.length || remainingPaths.length;
      }
    } catch (err: any) {
      console.error(`Error sweeping Supabase Storage objects for ${prefix}:`, err?.message);
    }
  } else {
    for (const key of Array.from(localMediaStore.keys())) {
      if (key.startsWith(prefix)) {
        localMediaStore.delete(key);
        deletedCount++;
      }
    }
  }

  return { deletedCount };
}
