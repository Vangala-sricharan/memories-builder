import { 
  BirthdayExperienceDraft, 
  CreatorStep, 
  UploadedPhoto, 
  UploadedMusic, 
  SavedDraftSummary 
} from '../types';

const DB_NAME = 'MemoriesBuilderDraftDB';
const DB_VERSION = 1;
const STORE_DRAFTS = 'drafts';
const STORE_MEDIA = 'media';
const ACTIVE_DRAFT_KEY = 'active_creator_draft';
const LOCAL_STORAGE_BACKUP_KEY = 'memories_draft_backup_meta';

// In-memory cache for ultra-fast access
let memoryDraftCache: {
  draft: BirthdayExperienceDraft;
  currentStep: CreatorStep;
  updatedAt: string;
  createdAt: string;
  draftId: string;
  version: number;
} | null = null;

/**
 * Initializes and returns an IndexedDB connection with stores for drafts and media.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        db.createObjectStore(STORE_DRAFTS, { keyPath: 'draftId' });
      }
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/**
 * Stores a blob/file safely into the media store.
 */
async function storeMediaBlob(db: IDBDatabase, key: string, blob: Blob | File): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.put({ key, blob, updatedAt: new Date().toISOString() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieves a blob/file from the media store.
 */
async function getMediaBlob(db: IDBDatabase, key: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_MEDIA, 'readonly');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result ? req.result.blob : null);
      };
      req.onerror = () => resolve(null);
    } catch (err) {
      resolve(null);
    }
  });
}

/**
 * Removes a blob from the media store.
 */
async function deleteMediaBlob(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch (err) {
      resolve();
    }
  });
}

/**
 * Saves complete builder state into IndexedDB (and localStorage metadata backup).
 */
export async function saveDraft(
  draft: BirthdayExperienceDraft,
  currentStep: CreatorStep,
  draftId: string = ACTIVE_DRAFT_KEY
): Promise<{ success: boolean; updatedAt: string; error?: string }> {
  const now = new Date().toISOString();

  try {
    let db: IDBDatabase | null = null;
    try {
      db = await openDatabase();
    } catch (err) {
      // IndexedDB unavailable; fallback strictly to memory & localStorage
      console.warn('IndexedDB unavailable, falling back to lightweight local storage', err);
    }

    // 1. Process and save media files to IndexedDB if available
    const serializedPhotos = await Promise.all(
      draft.photos.map(async (photo) => {
        let hasStoredBlob = false;

        if (db && photo.file) {
          try {
            await storeMediaBlob(db, `photo_${photo.id}`, photo.file);
            hasStoredBlob = true;
          } catch (e) {
            console.warn('Failed to store photo blob in IndexedDB:', e);
          }
        }

        if (db && photo.originalFile) {
          try {
            await storeMediaBlob(db, `photo_orig_${photo.id}`, photo.originalFile);
          } catch (e) {
            console.warn('Failed to store original photo blob in IndexedDB:', e);
          }
        }

        return {
          id: photo.id,
          caption: photo.caption,
          location: photo.location,
          year: photo.year,
          aspect: photo.aspect,
          editState: photo.editState,
          previewUrl: photo.previewUrl && photo.previewUrl.startsWith('data:') ? photo.previewUrl : '',
          originalPreviewUrl: photo.originalPreviewUrl && photo.originalPreviewUrl.startsWith('data:') ? photo.originalPreviewUrl : '',
          hasStoredBlob,
        };
      })
    );

    // 2. Process surprise photo
    let serializedSurprise = null;
    if (draft.surprisePhoto) {
      let hasStoredBlob = false;
      if (db && draft.surprisePhoto.file) {
        try {
          await storeMediaBlob(db, `surprise_${draft.surprisePhoto.id}`, draft.surprisePhoto.file);
          hasStoredBlob = true;
        } catch (e) {
          console.warn('Failed to store surprise blob in IndexedDB:', e);
        }
      }
      serializedSurprise = {
        id: draft.surprisePhoto.id,
        caption: draft.surprisePhoto.caption,
        aspect: draft.surprisePhoto.aspect,
        editState: draft.surprisePhoto.editState,
        previewUrl: draft.surprisePhoto.previewUrl?.startsWith('data:') ? draft.surprisePhoto.previewUrl : '',
        originalPreviewUrl: draft.surprisePhoto.originalPreviewUrl?.startsWith('data:') ? draft.surprisePhoto.originalPreviewUrl : '',
        hasStoredBlob,
      };
    }

    // 3. Process uploaded music
    let serializedMusic = null;
    if (draft.music) {
      if (db && draft.music.file) {
        try {
          await storeMediaBlob(db, `music_${draftId}`, draft.music.file);
        } catch (e) {
          console.warn('Failed to store music blob in IndexedDB:', e);
        }
      }
      serializedMusic = {
        fileName: draft.music.fileName,
        fileSizeFormatted: draft.music.fileSizeFormatted,
        duration: draft.music.duration,
        url: draft.music.url?.startsWith('data:') ? draft.music.url : '',
        isSample: draft.music.isSample,
      };
    }

    // 4. Construct complete draft payload
    const draftPayload = {
      draftId,
      version: 1,
      createdAt: memoryDraftCache?.createdAt || now,
      updatedAt: now,
      currentStep,
      draftData: {
        ...draft,
        photos: serializedPhotos,
        surprisePhoto: serializedSurprise,
        music: serializedMusic,
      },
    };

    // 5. Save to IndexedDB
    if (db) {
      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db!.transaction(STORE_DRAFTS, 'readwrite');
          const store = tx.objectStore(STORE_DRAFTS);
          const req = store.put(draftPayload);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (err) {
          reject(err);
        }
      });
    }

    // 6. Save in memory cache
    memoryDraftCache = {
      draft,
      currentStep,
      updatedAt: now,
      createdAt: memoryDraftCache?.createdAt || now,
      draftId,
      version: 1,
    };

    // 7. Save metadata backup to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const summary: SavedDraftSummary = {
        draftId,
        version: 1,
        createdAt: draftPayload.createdAt,
        updatedAt: now,
        currentStep,
        recipientName: draft.recipientName || '',
        template: draft.template,
        photoCount: draft.photos.length,
        hasMusic: !!draft.music,
      };
      window.localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(summary));
    }

    return { success: true, updatedAt: now };
  } catch (err: any) {
    console.error('Error saving draft:', err);
    return { success: false, updatedAt: now, error: err.message || 'Unknown save error' };
  }
}

/**
 * Loads a saved draft, reconstructing Blobs and preview URLs.
 */
export async function loadDraft(
  draftId: string = ACTIVE_DRAFT_KEY
): Promise<{ draft: BirthdayExperienceDraft; currentStep: CreatorStep; updatedAt: string; draftId: string } | null> {
  try {
    let db: IDBDatabase | null = null;
    try {
      db = await openDatabase();
    } catch (err) {
      // IndexedDB unavailable
    }

    let rawRecord: any = null;

    if (db) {
      rawRecord = await new Promise((resolve) => {
        try {
          const tx = db!.transaction(STORE_DRAFTS, 'readonly');
          const store = tx.objectStore(STORE_DRAFTS);
          const req = store.get(draftId);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }

    // Check memory cache fallback if DB had no record
    if (!rawRecord && memoryDraftCache && memoryDraftCache.draftId === draftId) {
      return {
        draft: memoryDraftCache.draft,
        currentStep: memoryDraftCache.currentStep,
        updatedAt: memoryDraftCache.updatedAt,
        draftId,
      };
    }

    if (!rawRecord || !rawRecord.draftData) {
      return null;
    }

    const { draftData, currentStep, updatedAt, createdAt } = rawRecord;

    // 1. Rehydrate photos and Blobs
    const restoredPhotos: UploadedPhoto[] = await Promise.all(
      (draftData.photos || []).map(async (p: any, idx: number) => {
        let file: File | undefined = undefined;
        let originalFile: File | undefined = undefined;
        let previewUrl = p.previewUrl || '';
        let originalPreviewUrl = p.originalPreviewUrl || '';

        if (db) {
          const blob = await getMediaBlob(db, `photo_${p.id}`);
          if (blob) {
            file = new File([blob], `memory-${p.id}.webp`, { type: blob.type || 'image/webp' });
            previewUrl = URL.createObjectURL(blob);
          }

          const origBlob = await getMediaBlob(db, `photo_orig_${p.id}`);
          if (origBlob) {
            originalFile = new File([origBlob], `memory-orig-${p.id}.webp`, { type: origBlob.type || 'image/webp' });
            originalPreviewUrl = URL.createObjectURL(origBlob);
          } else if (file) {
            originalFile = file;
            originalPreviewUrl = previewUrl;
          }
        }

        // If previewUrl is still empty (e.g. lost blob), use placeholder or fallback
        if (!previewUrl) {
          previewUrl = p.previewUrl || '';
        }

        return {
          id: p.id || `restored-photo-${idx}`,
          file,
          originalFile,
          previewUrl,
          originalPreviewUrl: originalPreviewUrl || previewUrl,
          caption: p.caption || '',
          location: p.location,
          year: p.year,
          aspect: p.aspect || '4:3',
          editState: p.editState,
        };
      })
    );

    // 2. Rehydrate surprise photo
    let restoredSurprise: UploadedPhoto | null = null;
    if (draftData.surprisePhoto) {
      const sp = draftData.surprisePhoto;
      let file: File | undefined = undefined;
      let originalFile: File | undefined = undefined;
      let previewUrl = sp.previewUrl || '';
      let originalPreviewUrl = sp.originalPreviewUrl || '';

      if (db) {
        const blob = await getMediaBlob(db, `surprise_${sp.id}`);
        if (blob) {
          file = new File([blob], `surprise-${sp.id}.webp`, { type: blob.type || 'image/webp' });
          previewUrl = URL.createObjectURL(blob);
          originalPreviewUrl = previewUrl;
          originalFile = file;
        }
      }

      restoredSurprise = {
        id: sp.id,
        file,
        originalFile,
        previewUrl,
        originalPreviewUrl,
        caption: sp.caption || '',
        aspect: sp.aspect || '16:9',
        editState: sp.editState,
      };
    }

    // 3. Rehydrate music
    let restoredMusic: UploadedMusic | null = null;
    if (draftData.music) {
      const m = draftData.music;
      let file: File | undefined = undefined;
      let url = m.url || '';

      if (db && !m.isSample) {
        const blob = await getMediaBlob(db, `music_${draftId}`);
        if (blob) {
          file = new File([blob], m.fileName || 'soundtrack.mp3', { type: blob.type || 'audio/mpeg' });
          url = URL.createObjectURL(blob);
        }
      }

      restoredMusic = {
        file,
        url,
        fileName: m.fileName || 'Soundtrack',
        fileSizeFormatted: m.fileSizeFormatted,
        duration: m.duration,
        isSample: m.isSample,
      };
    }

    // 4. Build complete restored draft
    const fullDraft: BirthdayExperienceDraft = {
      ...draftData,
      photos: restoredPhotos,
      surprisePhoto: restoredSurprise,
      music: restoredMusic,
    };

    // Update memory cache
    memoryDraftCache = {
      draft: fullDraft,
      currentStep,
      updatedAt,
      createdAt,
      draftId,
      version: 1,
    };

    return {
      draft: fullDraft,
      currentStep: currentStep || 'template',
      updatedAt,
      draftId,
    };
  } catch (err) {
    console.error('Failed to load draft from storage:', err);
    return null;
  }
}

/**
 * Synchronous / fast check if an existing draft is available to resume.
 */
export async function getSavedDraftSummary(
  draftId: string = ACTIVE_DRAFT_KEY
): Promise<SavedDraftSummary | null> {
  // 1. Quick check localStorage backup first for instant evaluation
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.draftId === draftId) {
          // Check if it has meaningful content
          if (parsed.photoCount > 0 || (parsed.recipientName && parsed.recipientName.trim().length > 0)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  // 2. Check IndexedDB record
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_DRAFTS, 'readonly');
        const store = tx.objectStore(STORE_DRAFTS);
        const req = store.get(draftId);
        req.onsuccess = () => {
          if (!req.result || !req.result.draftData) {
            resolve(null);
            return;
          }
          const data = req.result;
          const draft = data.draftData;
          const photoCount = (draft.photos || []).length;
          const hasContent = photoCount > 0 || (draft.recipientName && draft.recipientName.trim().length > 0);

          if (!hasContent) {
            resolve(null);
            return;
          }

          resolve({
            draftId,
            version: data.version || 1,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            currentStep: data.currentStep || 'template',
            recipientName: draft.recipientName || '',
            template: draft.template || 'cinema',
            photoCount,
            hasMusic: !!draft.music,
          });
        };
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  } catch (err) {
    return null;
  }
}

/**
 * Permanently discards the draft from IndexedDB, media store, and localStorage.
 */
export async function discardDraft(draftId: string = ACTIVE_DRAFT_KEY): Promise<boolean> {
  memoryDraftCache = null;

  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(LOCAL_STORAGE_BACKUP_KEY);
  }

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_DRAFTS, 'readwrite');
        const store = tx.objectStore(STORE_DRAFTS);
        const req = store.delete(draftId);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
    return true;
  } catch (e) {
    return true;
  }
}

/**
 * Formats timestamps into human-readable relative duration.
 * e.g., "just now", "45 seconds ago", "3 minutes ago", "2 hours ago"
 */
export function formatTimeAgo(timestampStr: string | number | undefined): string {
  if (!timestampStr) return 'just now';

  const then = typeof timestampStr === 'number' ? timestampStr : new Date(timestampStr).getTime();
  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSeconds < 5) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes === 1) return '1 minute ago';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}
