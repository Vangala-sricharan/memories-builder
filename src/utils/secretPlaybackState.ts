/**
 * Utility for managing one-time secret memory playback per experience session.
 * Stores strictly string secret IDs in sessionStorage (no blobs or full images).
 * Includes automatic in-memory fallback when sessionStorage is restricted or disabled.
 */

const memoryStore = new Map<string, Set<string>>();

function getStorageKey(experienceId: string): string {
  const cleanId = experienceId || 'preview';
  return `memories-builder:played-secrets:${cleanId}`;
}

export function getPlayedSecretIds(experienceId: string): Set<string> {
  const key = getStorageKey(experienceId);

  // 1. Try reading from sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return new Set<string>(parsed.filter((id) => typeof id === 'string'));
        }
      }
    } catch {
      // sessionStorage read failed, proceed to memory store
    }
  }

  // 2. In-memory fallback
  if (!memoryStore.has(key)) {
    memoryStore.set(key, new Set<string>());
  }
  return memoryStore.get(key)!;
}

export function isSecretPlayed(experienceId: string, secretPhotoId: string): boolean {
  if (!secretPhotoId) return false;
  const played = getPlayedSecretIds(experienceId);
  return played.has(secretPhotoId);
}

export function markSecretPlayed(experienceId: string, secretPhotoId: string): void {
  if (!secretPhotoId) return;
  const key = getStorageKey(experienceId);

  // 1. Update in-memory fallback
  if (!memoryStore.has(key)) {
    memoryStore.set(key, new Set<string>());
  }
  const memSet = memoryStore.get(key)!;
  memSet.add(secretPhotoId);

  // 2. Update sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const list = Array.from(memSet);
      window.sessionStorage.setItem(key, JSON.stringify(list));
    } catch {
      // Ignore sessionStorage quota / permission errors safely
    }
  }
}

export function resetPlayedSecrets(experienceId: string): void {
  const key = getStorageKey(experienceId);
  memoryStore.delete(key);
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}
