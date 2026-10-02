import { 
  getExpiredExperiences, 
  updateCleanupStatus 
} from './supabaseClient';
import { deleteExperienceMediaFromSupabaseStorage } from './supabaseStorage';

let isCleanupRunning = false;

/**
 * Scheduled cleanup job:
 * 1. Identifies expired experiences (where current time >= expires_at).
 * 2. Deletes associated private Supabase Storage media files under experiences/{experienceId}/.
 * 3. Purges temporary metadata and personal information.
 * 4. Strictly preserves the permanent global lifetime counter.
 */
export async function runCleanupJob(): Promise<{
  cleanedCount: number;
  errors: string[];
}> {
  if (isCleanupRunning) {
    return { cleanedCount: 0, errors: ['Cleanup job already in progress'] };
  }

  isCleanupRunning = true;
  let cleanedCount = 0;
  const errors: string[] = [];

  try {
    const expiredList = await getExpiredExperiences();

    for (const exp of expiredList) {
      try {
        const knownPaths: string[] = [];
        if (exp.media_references?.photos) {
          exp.media_references.photos.forEach((p) => {
            if (p.path) knownPaths.push(p.path);
          });
        }
        if (exp.media_references?.music?.path) {
          knownPaths.push(exp.media_references.music.path);
        }
        if (exp.media_references?.surprisePhoto?.path) {
          knownPaths.push(exp.media_references.surprisePhoto.path);
        }

        // Step 1: Remove all media files from private Supabase Storage
        await deleteExperienceMediaFromSupabaseStorage(exp.experience_id, knownPaths);

        // Step 2: Mark as deleted and purge sensitive payload in Supabase
        await updateCleanupStatus(exp.experience_id, 'COMPLETED', (exp.cleanup_attempts || 0) + 1);
        cleanedCount++;
      } catch (err: any) {
        errors.push(`Failed cleaning ${exp.experience_id}: ${err?.message}`);
        await updateCleanupStatus(exp.experience_id, 'FAILED', (exp.cleanup_attempts || 0) + 1);
      }
    }
  } catch (err: any) {
    errors.push(`Cleanup query failure: ${err?.message}`);
  } finally {
    isCleanupRunning = false;
  }

  return { cleanedCount, errors };
}

/**
 * Initializes background cleanup schedule (runs every 5 minutes).
 */
export function startCleanupScheduler(intervalMs = 300000) {
  // Run once shortly after startup (after 10s)
  setTimeout(() => {
    runCleanupJob().catch((err) => console.error('Initial cleanup run error:', err));
  }, 10000);

  // Then recurring
  return setInterval(() => {
    runCleanupJob().catch((err) => console.error('Scheduled cleanup error:', err));
  }, intervalMs);
}
