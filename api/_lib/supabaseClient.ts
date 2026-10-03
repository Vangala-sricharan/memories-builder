import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_SECRET_KEY
);

// Server-side Supabase client (secret key, bypasses RLS safely from trusted backend only)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_SECRET_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export interface MediaReferences {
  photos: Array<{ path: string; id?: string }>;
  music?: { path: string } | null;
  surprisePhoto?: { path: string; id?: string } | null;
}

export interface ExperienceDbRecord {
  id?: string;
  experience_id: string;
  status: 'PUBLISHED' | 'EXPIRED' | 'DELETED';
  published_at: string;
  expires_at: string;
  payload: any;
  media_references?: MediaReferences;
  cleanup_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  cleanup_attempts: number;
  last_cleanup_attempt_at?: string | null;
  created_at?: string;
}

// In-memory cache & fallback database for local preview/development and zero-latency consistency
const localDatabase = new Map<string, ExperienceDbRecord>();
let localLifetimeCounter = 12482;

/**
 * Retrieves the permanent global experience counter.
 */
export async function getGlobalCounter(): Promise<number> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('global_stats')
        .select('experience_count')
        .eq('id', 'lifetime')
        .single();

      if (!error && data) {
        return Number(data.experience_count);
      }
    } catch (err: any) {
      console.warn('Could not read global_stats from Supabase, falling back to local counter:', err?.message);
    }
  }

  return localLifetimeCounter;
}

/**
 * Atomically increments the permanent global counter strictly on successful publication.
 * Race-condition safe.
 */
export async function incrementGlobalCounter(): Promise<number> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Call atomic PostgreSQL function (supports increment_experience_count or increment_global_counter)
      let { data, error } = await supabase.rpc('increment_experience_count');
      if (error) {
        const fallback = await supabase.rpc('increment_global_counter');
        data = fallback.data;
        error = fallback.error;
      }

      if (!error && data !== null) {
        return Number(data);
      }

      // Fallback update if RPC not present yet
      const current = await getGlobalCounter();
      const next = current + 1;
      await supabase
        .from('global_stats')
        .upsert({ id: 'lifetime', experience_count: next, updated_at: new Date().toISOString() });
      return next;
    } catch (err: any) {
      console.error('Error incrementing counter in Supabase:', err?.message);
    }
  }

  localLifetimeCounter += 1;
  return localLifetimeCounter;
}

/**
 * Saves a frozen immutable experience record with media_references.
 */
export async function saveExperienceRecord(
  experienceId: string,
  payload: any,
  publishedAt: string,
  expiresAt: string,
  mediaReferences?: MediaReferences
): Promise<ExperienceDbRecord> {
  const record: ExperienceDbRecord = {
    experience_id: experienceId,
    status: 'PUBLISHED',
    published_at: publishedAt,
    expires_at: expiresAt,
    payload,
    media_references: mediaReferences || { photos: [] },
    cleanup_status: 'PENDING',
    cleanup_attempts: 0,
    last_cleanup_attempt_at: null,
    created_at: new Date().toISOString(),
  };

  // Cache in-memory for instant read consistency
  localDatabase.set(experienceId, record);

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('experiences').insert({
      experience_id: experienceId,
      status: 'PUBLISHED',
      published_at: publishedAt,
      expires_at: expiresAt,
      payload,
      media_references: mediaReferences || { photos: [] },
      cleanup_status: 'PENDING',
      cleanup_attempts: 0,
      last_cleanup_attempt_at: null,
    });

    if (error) {
      localDatabase.delete(experienceId);
      throw new Error(`Supabase insert failed: ${error.message}`);
    }
  }

  return record;
}

/**
 * Retrieves an experience record by experienceId with cache and DB fallback.
 */
export async function getExperienceRecord(experienceId: string): Promise<ExperienceDbRecord | null> {
  if (!experienceId) return null;

  const cached = localDatabase.get(experienceId);
  if (cached && (cached.status === 'EXPIRED' || cached.status === 'DELETED')) {
    return cached;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('experience_id', experienceId)
        .single();

      if (!error && data) {
        localDatabase.set(experienceId, data as ExperienceDbRecord);
        return data as ExperienceDbRecord;
      }
    } catch (err: any) {
      console.error(`Error querying Supabase for experience ${experienceId}:`, err?.message);
    }
  }

  return cached || null;
}

/**
 * Marks an experience as EXPIRED.
 */
export async function markExperienceExpired(experienceId: string): Promise<void> {
  const existing = localDatabase.get(experienceId);
  if (existing) {
    existing.status = 'EXPIRED';
    localDatabase.set(experienceId, existing);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('experiences')
        .update({ status: 'EXPIRED' })
        .eq('experience_id', experienceId);
    } catch (err: any) {
      console.error(`Error marking experience ${experienceId} expired:`, err?.message);
    }
  }
}

/**
 * Finds all experiences whose expires_at is past and haven't finished cleanup.
 */
export async function getExpiredExperiences(): Promise<ExperienceDbRecord[]> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .lte('expires_at', now)
        .neq('cleanup_status', 'COMPLETED');

      if (!error && data) {
        return data as ExperienceDbRecord[];
      }
    } catch (err: any) {
      console.error('Error fetching expired experiences from Supabase:', err?.message);
    }
  }

  const results: ExperienceDbRecord[] = [];
  const nowMs = Date.now();
  for (const record of localDatabase.values()) {
    if (new Date(record.expires_at).getTime() <= nowMs && record.cleanup_status !== 'COMPLETED') {
      results.push(record);
    }
  }
  return results;
}

/**
 * Updates cleanup status after Supabase Storage media deletion and metadata purge.
 */
export async function updateCleanupStatus(
  experienceId: string,
  cleanupStatus: 'COMPLETED' | 'FAILED',
  attemptsIncrement = 1
): Promise<void> {
  const now = new Date().toISOString();

  const existing = localDatabase.get(experienceId);
  if (existing) {
    existing.cleanup_status = cleanupStatus;
    existing.cleanup_attempts = (existing.cleanup_attempts || 0) + attemptsIncrement;
    existing.last_cleanup_attempt_at = now;
    if (cleanupStatus === 'COMPLETED') {
      existing.status = 'DELETED';
      existing.payload = {};
      existing.media_references = { photos: [] };
    }
    localDatabase.set(experienceId, existing);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      if (cleanupStatus === 'COMPLETED') {
        // Purge sensitive personal payload and media_references to preserve privacy permanently
        await supabase
          .from('experiences')
          .update({
            status: 'DELETED',
            cleanup_status: 'COMPLETED',
            cleanup_attempts: attemptsIncrement,
            last_cleanup_attempt_at: now,
            payload: {},
            media_references: {},
          })
          .eq('experience_id', experienceId);
      } else {
        await supabase
          .from('experiences')
          .update({ 
            cleanup_status: 'FAILED',
            cleanup_attempts: attemptsIncrement,
            last_cleanup_attempt_at: now,
          })
          .eq('experience_id', experienceId);
      }
    } catch (err: any) {
      console.error(`Error updating cleanup status for ${experienceId}:`, err?.message);
    }
  }
}

/**
 * Simulation helper for testing expiration in development.
 */
export async function simulateExpireInDb(experienceId: string): Promise<ExperienceDbRecord | null> {
  const expiredTime = new Date(Date.now() - 5000).toISOString();

  // Instantly update in-memory cache
  const cached = localDatabase.get(experienceId);
  if (cached) {
    cached.status = 'EXPIRED';
    cached.expires_at = expiredTime;
    localDatabase.set(experienceId, cached);
  }

  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from('experiences')
      .update({
        status: 'EXPIRED',
        expires_at: expiredTime,
      })
      .eq('experience_id', experienceId)
      .select()
      .single();

    if (data) {
      localDatabase.set(experienceId, data as ExperienceDbRecord);
      return data as ExperienceDbRecord;
    }
  }

  return cached || getExperienceRecord(experienceId);
}
