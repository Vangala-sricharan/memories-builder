/**
 * Counter Service for tracking lifetime published birthday experiences.
 * In Stage 5, this retrieves the real permanent count from the Supabase backend.
 */

const BASE_COUNTER = 0;
let cachedCounter = BASE_COUNTER;

/**
 * Fetches the real lifetime experience count from the backend.
 */
export async function fetchLifetimeExperienceCount(): Promise<number> {
  try {
    const res = await fetch('/api/global-counter');
    if (res.ok) {
      const data = await res.json();
      if (typeof data.count === 'number') {
        cachedCounter = data.count;
        return data.count;
      }
    }
  } catch (err) {
    // Graceful fallback if offline
  }
  return cachedCounter;
}

export function getLifetimeExperienceCount(): number {
  return cachedCounter;
}
