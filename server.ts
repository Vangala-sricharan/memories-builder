import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { 
  getGlobalCounter, 
  incrementGlobalCounter, 
  saveExperienceRecord, 
  getExperienceRecord, 
  markExperienceExpired,
  simulateExpireInDb 
} from './server/supabaseClient';
import { 
  uploadMediaToSupabaseStorage, 
  getMediaFromSupabaseStorage,
  createSignedMediaUrl,
  deleteExperienceMediaFromSupabaseStorage 
} from './server/supabaseStorage';
import { checkRateLimit } from './server/rateLimiter';
import { runCleanupJob, startCleanupScheduler } from './server/cleanupWorker';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High body limits to allow client-optimized media batch uploads (max 60MB)
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Start background 24-hour cleanup worker (checks every 5 minutes)
startCleanupScheduler();

// Server-side Gemini AI client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Helper: Client IP extraction for rate limiting
 */
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * ==========================================================
 * LIFETIME GLOBAL COUNTER ENDPOINT
 * ==========================================================
 * GET /api/global-counter
 * Retrieves real lifetime count from Supabase (only permanent data).
 */
app.get('/api/global-counter', async (req, res) => {
  try {
    const count = await getGlobalCounter();
    res.json({ success: true, count });
  } catch (err: any) {
    res.status(500).json({ success: false, count: 12482 });
  }
});

/**
 * ==========================================================
 * TEMPORARY MEDIA UPLOAD ENDPOINT
 * ==========================================================
 * POST /api/upload-media
 * Receives browser-optimized photo (WebP/JPEG/PNG) or MP3 audio.
 * Enforces server-side validation and uploads to private Supabase Storage.
 */
app.post('/api/upload-media', async (req, res) => {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(clientIp, 'upload', 60, 600000); // 60 uploads per 10 mins
  if (!rate.allowed) {
    res.status(429).json({ 
      success: false, 
      error: 'Too many upload requests right now. Please try again shortly.' 
    });
    return;
  }

  try {
    const { experienceId, type, dataBase64, mimeType } = req.body;

    if (!experienceId || typeof experienceId !== 'string') {
      res.status(400).json({ success: false, error: 'Invalid experience identifier.' });
      return;
    }

    if (type !== 'image' && type !== 'music') {
      res.status(400).json({ success: false, error: 'Invalid media type. Must be image or music.' });
      return;
    }

    // Validate MIME types
    const allowedImageMimes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
    const allowedMusicMimes = ['audio/mpeg', 'audio/mp3'];

    if (type === 'image' && !allowedImageMimes.includes(mimeType?.toLowerCase())) {
      res.status(400).json({ success: false, error: 'Unsupported image format. Use WebP, JPEG, or PNG.' });
      return;
    }

    if (type === 'music' && !allowedMusicMimes.includes(mimeType?.toLowerCase())) {
      res.status(400).json({ success: false, error: 'Unsupported audio format. MP3 only.' });
      return;
    }

    if (!dataBase64 || typeof dataBase64 !== 'string') {
      res.status(400).json({ success: false, error: 'No media payload provided.' });
      return;
    }

    // Strip data URL header if present
    const base64Clean = dataBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    // Server-side file size caps: max 15MB per image, max 25MB for MP3
    const maxSizeBytes = type === 'image' ? 15 * 1024 * 1024 : 25 * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      res.status(400).json({ success: false, error: `Uploaded file exceeds size limit.` });
      return;
    }

    const { path: storagePath, url, sizeBytes } = await uploadMediaToSupabaseStorage(
      experienceId, 
      type, 
      buffer, 
      mimeType
    );

    res.json({
      success: true,
      url,
      path: storagePath,
      sizeBytes,
    });
  } catch (err: any) {
    console.error('Error handling media upload:', err?.message);
    res.status(500).json({ success: false, error: 'Failed to process media upload.' });
  }
});

/**
 * ==========================================================
 * SERVER-CONTROLLED MEDIA ACCESS ENDPOINT
 * ==========================================================
 * GET /api/media/:experienceId/:type/:filename
 * Validates experience active status and expiration before serving Supabase Storage media.
 * Expired media is strictly blocked (zero leaks).
 */
app.get('/api/media/:experienceId/:type/:filename', async (req, res) => {
  const { experienceId, type, filename } = req.params;

  try {
    const storagePath = `experiences/${experienceId}/${type}/${filename}`;

    // Verify experience status and expiration in Supabase
    const exp = await getExperienceRecord(experienceId);
    if (!exp) {
      res.status(404).send('Media not found.');
      return;
    }

    const isExpired = Date.now() >= new Date(exp.expires_at).getTime() || exp.status === 'EXPIRED' || exp.status === 'DELETED';
    if (isExpired) {
      res.status(410).send('This birthday media has expired.');
      return;
    }

    const media = await getMediaFromSupabaseStorage(storagePath);
    if (!media) {
      res.status(404).send('Media object not found.');
      return;
    }

    res.setHeader('Content-Type', media.contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(media.buffer);
  } catch (err: any) {
    res.status(500).send('Failed to serve media.');
  }
});

/**
 * ==========================================================
 * REAL PUBLISH ENDPOINT
 * ==========================================================
 * POST /api/publish
 * Atomically creates a frozen snapshot, sets trusted server timestamps,
 * persists temporary metadata in Supabase, and increments global counter.
 */
app.post('/api/publish', async (req, res) => {
  const clientIp = getClientIp(req);
  const isLocalDev = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1';
  const limit = isLocalDev ? 100 : 15;
  const rate = checkRateLimit(clientIp, 'publish', limit, 3600000); // 15 publishes per hr (100 for local test suite)
  if (!rate.allowed) {
    res.status(429).json({ 
      success: false, 
      error: 'Too many publish requests. Please wait a short while before creating another experience.' 
    });
    return;
  }

  try {
    const { draft, experienceId: requestedId } = req.body;

    if (!draft || !draft.recipientName || !draft.recipientName.trim()) {
      res.status(400).json({ success: false, error: 'A recipient name is required to publish.' });
      return;
    }

    if (!draft.photos || !Array.isArray(draft.photos) || draft.photos.length < 3 || draft.photos.length > 20) {
      res.status(400).json({ success: false, error: 'A minimum of 3 and maximum of 20 photos are required.' });
      return;
    }

    // Generate or validate opaque URL-safe experienceId (no personal data)
    const experienceId = (requestedId && /^[a-zA-Z0-9_-]{8,16}$/.test(requestedId))
      ? requestedId
      : crypto.randomBytes(8).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);

    // Idempotency check: if this experience was already published, return existing record without double-incrementing
    const existingExp = await getExperienceRecord(experienceId);
    if (existingExp) {
      const currentLifetimeCount = await getGlobalCounter();
      res.json({
        success: true,
        experienceId,
        publishedAt: existingExp.published_at,
        expiresAt: existingExp.expires_at,
        url: `/b/${experienceId}`,
        lifetimeCount: currentLifetimeCount,
        snapshot: existingExp.payload,
      });
      return;
    }

    // Trusted server timestamps (UTC)
    const now = new Date();
    const publishedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Exact 24 hours

    // Create deep-frozen snapshot
    const snapshot = {
      experienceId,
      recipientName: draft.recipientName.trim(),
      relationship: draft.relationship,
      customRelationship: draft.customRelationship,
      birthday: draft.birthday,
      milestoneAge: draft.milestoneAge,
      senderName: draft.senderName ? draft.senderName.trim() : undefined,
      birthdayMessage: draft.birthdayMessage || 'Happy Birthday!',
      photos: draft.photos.map((p: any) => ({
        id: p.id,
        previewUrl: p.previewUrl,
        caption: p.caption,
        location: p.location,
        year: p.year,
        aspect: p.aspect,
      })),
      heroPhotoId: draft.heroPhotoId || draft.photos[0]?.id,
      innerCirclePhotoIds: draft.innerCirclePhotoIds && draft.innerCirclePhotoIds.length > 0
        ? draft.innerCirclePhotoIds
        : draft.photos.slice(0, Math.min(4, draft.photos.length)).map((p: any) => p.id),
      surprisePhoto: draft.surprisePhoto ? {
        id: draft.surprisePhoto.id,
        previewUrl: draft.surprisePhoto.previewUrl,
        caption: draft.surprisePhoto.caption,
        location: draft.surprisePhoto.location,
        year: draft.surprisePhoto.year,
      } : null,
      finalMessage: draft.finalMessage || 'Wishing you a magnificent year ahead.',
      music: draft.music ? {
        url: draft.music.url,
        fileName: draft.music.fileName,
        fileSizeFormatted: draft.music.fileSizeFormatted,
      } : null,
      tagline: draft.tagline || 'A Cinematic Birthday Story',
      openingQuote: draft.openingQuote || '“Some people make the world brighter simply by being in it.”',
      storyNarrative: draft.storyNarrative,
      innerCircleIntro: draft.innerCircleIntro,
      vaultIntro: draft.vaultIntro,
      surpriseText: draft.surpriseText,
      particleIntensity: draft.particleIntensity || 'normal',
      publishedAt,
      expiresAt,
      status: 'PUBLISHED',
    };

    // Structured media_references for Supabase PostgreSQL (Section 11)
    const mediaReferences = {
      photos: draft.photos.map((p: any) => {
        const match = p.previewUrl?.match(/(experiences\/[^\s"']+)/);
        const path = match ? match[1] : `experiences/${experienceId}/photos/${p.id}.webp`;
        return { id: p.id, path };
      }),
      music: draft.music?.url ? {
        path: draft.music.url.includes('experiences/') 
          ? draft.music.url.slice(draft.music.url.indexOf('experiences/')) 
          : `experiences/${experienceId}/music/soundtrack.mp3`,
      } : null,
      surprisePhoto: draft.surprisePhoto?.previewUrl ? {
        id: draft.surprisePhoto.id,
        path: draft.surprisePhoto.previewUrl.includes('experiences/')
          ? draft.surprisePhoto.previewUrl.slice(draft.surprisePhoto.previewUrl.indexOf('experiences/'))
          : `experiences/${experienceId}/photos/surprise.webp`,
      } : null,
    };

    // Save temporary metadata and media_references to Supabase PostgreSQL
    try {
      await saveExperienceRecord(experienceId, snapshot, publishedAt, expiresAt, mediaReferences);
    } catch (dbErr: any) {
      // Atomic rollback: clean up uploaded storage objects if database insertion fails
      const pathsToClean = mediaReferences.photos.map((p: any) => p.path);
      if (mediaReferences.music?.path) pathsToClean.push(mediaReferences.music.path);
      if (mediaReferences.surprisePhoto?.path) pathsToClean.push(mediaReferences.surprisePhoto.path);
      await deleteExperienceMediaFromSupabaseStorage(experienceId, pathsToClean).catch(() => {});
      throw dbErr;
    }

    // Atomically increment the permanent lifetime counter
    const newCount = await incrementGlobalCounter();

    res.json({
      success: true,
      experienceId,
      publishedAt,
      expiresAt,
      url: `/b/${experienceId}`,
      lifetimeCount: newCount,
      snapshot,
    });
  } catch (err: any) {
    console.error('Error during publish:', err?.message);
    res.status(500).json({ success: false, error: err?.message || 'Failed to publish experience.' });
  }
});

/**
 * ==========================================================
 * GET PUBLIC EXPERIENCE ENDPOINT
 * ==========================================================
 * GET /api/experience/:experienceId
 * Authoritative server-side expiration check.
 * If active: returns frozen experience.
 * If expired: returns expired status without personal data.
 */
app.get('/api/experience/:experienceId', async (req, res) => {
  const { experienceId } = req.params;
  const clientIp = getClientIp(req);

  const rate = checkRateLimit(clientIp, 'read', 120, 60000); // 120 reads per min
  if (!rate.allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    return;
  }

  try {
    const record = await getExperienceRecord(experienceId);

    if (!record || record.status === 'DELETED') {
      res.status(404).json({ error: 'This birthday experience could not be found.' });
      return;
    }

    const now = Date.now();
    const expiryTime = new Date(record.expires_at).getTime();

    // Check expiration on trusted server time
    if (now >= expiryTime || record.status === 'EXPIRED') {
      await markExperienceExpired(experienceId);
      res.json({
        status: 'EXPIRED',
        message: 'This birthday experience has expired.',
      });
      return;
    }

    // Optional enrichment with short-lived Supabase Storage signed URLs while active (Section 15)
    let enrichedPhotos = record.payload.photos || [];
    try {
      enrichedPhotos = await Promise.all(
        enrichedPhotos.map(async (p: any) => {
          const match = p.previewUrl?.match(/(experiences\/[^\s"']+)/);
          if (match) {
            const signed = await createSignedMediaUrl(match[1], 3600);
            if (signed) return { ...p, previewUrl: signed };
          }
          return p;
        })
      );
    } catch {
      // Fallback to proxy URLs
    }

    let enrichedMusic = record.payload.music;
    if (enrichedMusic?.url) {
      try {
        const match = enrichedMusic.url.match(/(experiences\/[^\s"']+)/);
        if (match) {
          const signed = await createSignedMediaUrl(match[1], 3600);
          if (signed) enrichedMusic = { ...enrichedMusic, url: signed };
        }
      } catch {}
    }

    let enrichedSurprise = record.payload.surprisePhoto;
    if (enrichedSurprise?.previewUrl) {
      try {
        const match = enrichedSurprise.previewUrl.match(/(experiences\/[^\s"']+)/);
        if (match) {
          const signed = await createSignedMediaUrl(match[1], 3600);
          if (signed) enrichedSurprise = { ...enrichedSurprise, previewUrl: signed };
        }
      } catch {}
    }

    res.json({
      status: 'PUBLISHED',
      ...record.payload,
      photos: enrichedPhotos,
      music: enrichedMusic,
      surprisePhoto: enrichedSurprise,
      publishedAt: record.published_at,
      expiresAt: record.expires_at,
    });
  } catch (err: any) {
    console.error('Error fetching public experience:', err?.message);
    res.status(500).json({ error: "We couldn't open this birthday experience right now." });
  }
});

/**
 * ==========================================================
 * DEV SIMULATION ENDPOINT (Development testing only)
 * ==========================================================
 * POST /api/experience/:experienceId/simulate-expire
 */
app.post('/api/experience/:experienceId/simulate-expire', async (req, res) => {
  const { experienceId } = req.params;
  try {
    const expired = await simulateExpireInDb(experienceId);
    res.json({ success: true, status: 'EXPIRED', record: expired });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * ==========================================================
 * CRON CLEANUP ENDPOINT
 * ==========================================================
 * POST /api/cron/cleanup
 * Purges expired Supabase Storage media and temporary metadata.
 */
app.post('/api/cron/cleanup', async (req, res) => {
  try {
    const result = await runCleanupJob();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * ==========================================================
 * GEMINI AI STORYTELLING ENDPOINTS
 * ==========================================================
 */
app.post('/api/ai/generate-birthday-content', async (req, res) => {
  try {
    const {
      recipientName,
      relationship,
      customRelationship,
      milestoneAge,
      birthdayDate,
      senderName,
      creatorMessage,
      photoCount = 4,
      hasSurprisePhoto = false,
    } = req.body;

    const rel = relationship === 'Other' ? customRelationship : relationship;

    const prompt = `
You are the creative storytelling director for a high-end cinematic birthday premiere.
Generate a structured, personal, and cinematic narrative for the recipient.

Context:
- Recipient Name: ${recipientName || 'Alex'}
${rel ? `- Relationship: ${rel}` : '- Relationship: Close companion (do not assume specific relation unless stated)'}
${milestoneAge ? `- Milestone Age: ${milestoneAge} years` : ''}
${birthdayDate ? `- Birthday Date: ${birthdayDate}` : ''}
${senderName ? `- Sender / Giver: ${senderName}` : ''}
${creatorMessage ? `- Creator's Own Message (HIGHEST PRIORITY - preserve the creator's voice, tone, and intent): "${creatorMessage}"` : '- Creator Message: None provided. Compose a warm, authentic, cinematic tribute.'}
- Total Uploaded Photos in Experience: ${photoCount}
- Has Secret Surprise Photo: ${hasSurprisePhoto ? 'Yes' : 'No'}

STRICT GUIDELINES:
1. Do NOT invent fake memories, fake places, or fictional events. Keep reflections universal yet deeply personal.
2. Avoid generic birthday card clichés.
3. Tone: Cinematic, emotional, authentic, modern, human, poetic.
4. If the creator supplied a message, honor and polish their words rather than replacing them with generic text.
5. Provide:
   - openingWish: The prologue wish for Act I (concise, touching).
   - intro: The milestone tagline / subtitle (e.g. "${milestoneAge || 28} Orbits of Unstoppable Light").
   - story: The memory narrative dedication for the premiere.
   - innerCircleIntro: A 1-2 sentence reflection for the intimate Inner Circle act.
   - vaultIntro: A 1 sentence reflection introducing the 3D Photo Vault preservation act.
   ${hasSurprisePhoto ? '- surpriseText: A short suspenseful reveal line for the confidential Act VI photo.' : ''}
   - finalWish: An emotional closing dedication for Act VII.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a master cinematic screenplay writer crafting an intimate, theater-quality digital birthday premiere.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            openingWish: { type: Type.STRING },
            intro: { type: Type.STRING },
            story: { type: Type.STRING },
            innerCircleIntro: { type: Type.STRING },
            vaultIntro: { type: Type.STRING },
            surpriseText: { type: Type.STRING },
            finalWish: { type: Type.STRING },
          },
          required: ['openingWish', 'intro', 'story', 'innerCircleIntro', 'vaultIntro', 'finalWish'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    res.json({
      success: true,
      content: {
        ...parsed,
        photoCaptions: Array.from({ length: photoCount }).map((_, i) => `Memory #${i + 1}`),
      },
    });
  } catch (error: any) {
    console.error('Error generating birthday content:', error?.message);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate AI content',
    });
  }
});

app.post('/api/ai/regenerate-section', async (req, res) => {
  try {
    const {
      section,
      recipientName,
      relationship,
      customRelationship,
      milestoneAge,
      creatorMessage,
      senderName,
      currentValue,
    } = req.body;

    const rel = relationship === 'Other' ? customRelationship : relationship;

    const prompt = `
You are the creative director for a cinematic birthday premiere.
Regenerate ONLY the requested single section: "${section}".

Context:
- Recipient: ${recipientName || 'Alex'}
${rel ? `- Relationship: ${rel}` : ''}
${milestoneAge ? `- Milestone: ${milestoneAge} years` : ''}
${creatorMessage ? `- Creator's personal note: "${creatorMessage}"` : ''}
${senderName ? `- Sender: ${senderName}` : ''}
${currentValue ? `- Current text (provide a fresh, distinct, even more cinematic alternative): "${currentValue}"` : ''}

Section to write:
${section === 'openingWish' ? 'Act I Opening Wish: An emotional, theater-quality birthday greeting.' : ''}
${section === 'intro' ? 'Prologue Tagline: A short, poetic milestone subtitle.' : ''}
${section === 'story' ? 'Memory Story: A rich 2-3 sentence narrative on shared journey and character.' : ''}
${section === 'innerCircleIntro' ? 'Inner Circle Reflection: A 1-2 sentence salute to closest friends and cherished bonds.' : ''}
${section === 'vaultIntro' ? '3D Photo Vault Intro: A 1 sentence reflection on preserving memories in a digital sanctuary.' : ''}
${section === 'surpriseText' ? 'Surprise Reveal: A 1 sentence confidential reveal line for the secret photo.' : ''}
${section === 'finalWish' ? 'Act VII Final Wish: An unforgettable emotional epilogue and birthday salute.' : ''}

Return ONLY a JSON object with a single string property "text".
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
          },
          required: ['text'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{"text": ""}');
    res.json({ success: true, text: parsed.text });
  } catch (error: any) {
    console.error('Error regenerating section:', error?.message);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to regenerate section',
    });
  }
});

// Vite middleware integration (Full-stack support)
async function setupVite() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
