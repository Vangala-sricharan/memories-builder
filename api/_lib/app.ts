import express from 'express';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { 
  getGlobalCounter, 
  incrementGlobalCounter, 
  saveExperienceRecord, 
  getExperienceRecord, 
  markExperienceExpired,
  simulateExpireInDb,
  isSupabaseConfigured
} from './supabaseClient';
import { 
  uploadMediaToSupabaseStorage, 
  createSignedMediaUploadUrl,
  getMediaFromSupabaseStorage,
  createSignedMediaUrl,
  deleteExperienceMediaFromSupabaseStorage 
} from './supabaseStorage';
import { checkRateLimit } from './rateLimiter';
import { runCleanupJob, startCleanupScheduler } from './cleanupWorker';

dotenv.config();

export const app = express();

// Diagnostic logging for serverless initialization (safe: zero secret leakage)
console.log(`[INIT] SUPABASE_URL_PRESENT=${Boolean(process.env.SUPABASE_URL)}`);
console.log(`[INIT] SUPABASE_SECRET_KEY_PRESENT=${Boolean(process.env.SUPABASE_SECRET_KEY)}`);
console.log(`[INIT] GEMINI_API_KEY_PRESENT=${Boolean(process.env.GEMINI_API_KEY)}`);

/**
 * CONDITIONAL BODY PARSER:
 * In Vercel serverless environments (@vercel/node), Vercel pre-consumes the incoming HTTP stream
 * and populates `req.body`. Re-invoking express.json() on an already-consumed stream causes
 * `InternalServerError: stream is not readable`, producing HTTP 500 errors.
 * This middleware checks if `req.body` is already parsed before invoking body-parser.
 */
const jsonParser = express.json({ limit: '60mb' });
const urlencodedParser = express.urlencoded({ limit: '60mb', extended: true });

app.use((req, res, next) => {
  if (req.body !== undefined && typeof req.body === 'object') {
    return next();
  }
  jsonParser(req, res, (err) => {
    if (err) return next(err);
    urlencodedParser(req, res, next);
  });
});

// Start background 24-hour cleanup worker (auto-disabled on Vercel where Cron is preferred)
startCleanupScheduler();

// Safe lazy/resilient Gemini AI client initialization
function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch {
    return null;
  }
}

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

// Dedicated API Router to handle endpoints seamlessly with or without /api prefix
const apiRouter = express.Router();

/**
 * SAFE DIAGNOSTIC HEALTH CHECK
 * GET /diagnostic and GET /api/diagnostic
 * Confirms environment variable readiness without exposing sensitive keys.
 */
apiRouter.get(['/diagnostic', '/health'], (req, res) => {
  res.json({
    status: 'healthy',
    SUPABASE_URL_PRESENT: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SECRET_KEY_PRESENT: Boolean(process.env.SUPABASE_SECRET_KEY),
    GEMINI_API_KEY_PRESENT: Boolean(process.env.GEMINI_API_KEY),
    isSupabaseConfigured,
    timestamp: new Date().toISOString(),
  });
});

/**
 * PUBLIC SEARCH ENGINE CRAWLER DIRECTIVES
 * GET /robots.txt
 */
apiRouter.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`# Robots.txt for Memories Builder
# Allow legitimate search crawlers to crawl the public homepage

User-agent: *
Allow: /$

# Disallow private and transient routes
Disallow: /api/
Disallow: /b/
Disallow: /create/
Disallow: /studio/
Disallow: /preview/

Sitemap: https://memories-builder.vercel.app/sitemap.xml
`);
});

/**
 * PUBLIC SITEMAP
 * GET /sitemap.xml
 */
apiRouter.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://memories-builder.vercel.app/</loc>
    <lastmod>2026-10-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

/**
 * LIFETIME GLOBAL COUNTER ENDPOINT
 * GET /global-counter and POST /global-counter
 * Supports both GET and POST requests gracefully.
 */
const handleGlobalCounter = async (req: express.Request, res: express.Response) => {
  try {
    const count = await getGlobalCounter();
    res.json({ success: true, count });
  } catch (err: any) {
    console.error('Error fetching global counter:', err?.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve counter', count: 0 });
  }
};

apiRouter.get('/global-counter', handleGlobalCounter);
apiRouter.post('/global-counter', handleGlobalCounter);

/**
 * TEMPORARY MEDIA UPLOAD ENDPOINT
 * POST /upload-media
 * Receives browser-optimized photo (WebP/JPEG/PNG) or MP3 audio.
 * Enforces server-side validation and uploads to private Supabase Storage bucket: birthday-media.
 */
apiRouter.post('/upload-media', async (req, res) => {
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
    const { experienceId, type, dataBase64, mimeType } = req.body || {};

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
      res.status(400).json({ success: false, error: 'Uploaded file exceeds size limit.' });
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
 * SECURE DIRECT-TO-STORAGE SIGNED UPLOAD URL ENDPOINT
 * POST /create-upload-url and POST /signed-upload-url
 * Provides a cryptographically signed upload URL for direct browser-to-Supabase upload.
 * Avoids Vercel's 4.5MB Serverless Function payload limit (HTTP 413 FUNCTION_PAYLOAD_TOO_LARGE)
 * while keeping the 'birthday-media' bucket strictly private and never exposing SUPABASE_SECRET_KEY.
 */
const handleCreateUploadUrl = async (req: express.Request, res: express.Response) => {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(clientIp, 'upload', 60, 600000); // 60 per 10 mins
  if (!rate.allowed) {
    res.status(429).json({ 
      success: false, 
      error: 'Too many upload URL requests right now. Please try again shortly.' 
    });
    return;
  }

  try {
    const { experienceId, type = 'music', mimeType = 'audio/mpeg' } = req.body || {};

    if (!experienceId || typeof experienceId !== 'string') {
      res.status(400).json({ success: false, error: 'Invalid experience identifier.' });
      return;
    }

    if (type !== 'music' && type !== 'image') {
      res.status(400).json({ success: false, error: 'Invalid media type. Must be music or image.' });
      return;
    }

    if (type === 'music') {
      const allowedMusicMimes = ['audio/mpeg', 'audio/mp3'];
      if (mimeType && !allowedMusicMimes.includes(mimeType.toLowerCase())) {
        res.status(400).json({ success: false, error: 'Unsupported audio format. MP3 only.' });
        return;
      }
    }

    const { path: storagePath, uploadUrl, token, mediaUrl } = await createSignedMediaUploadUrl(
      experienceId,
      type,
      mimeType
    );

    res.json({
      success: true,
      uploadUrl,
      path: storagePath,
      token,
      mediaUrl,
    });
  } catch (err: any) {
    console.error('Error generating signed upload URL:', err?.message);
    res.status(500).json({ success: false, error: 'Failed to initialize secure upload.' });
  }
};

apiRouter.post('/create-upload-url', handleCreateUploadUrl);
apiRouter.post('/signed-upload-url', handleCreateUploadUrl);

/**
 * SERVER-CONTROLLED MEDIA ACCESS ENDPOINT
 * GET /media/:experienceId/:type/:filename
 */
apiRouter.get('/media/:experienceId/:type/:filename', async (req, res) => {
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
 * REAL PUBLISH ENDPOINT
 * POST /publish
 */
apiRouter.post('/publish', async (req, res) => {
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
    const { draft, experienceId: requestedId } = req.body || {};

    if (!draft || !draft.recipientName || !draft.recipientName.trim()) {
      res.status(400).json({ success: false, error: 'A recipient name is required to publish.' });
      return;
    }

    if (!draft.photos || !Array.isArray(draft.photos) || draft.photos.length < 6 || draft.photos.length > 25) {
      res.status(400).json({ success: false, error: 'A minimum of 6 and maximum of 25 photos are required.' });
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
      template: draft.template || 'cinema',
      theme: {
        background: draft.theme?.background || '#080808',
        primary: draft.theme?.primary || '#E50914',
        secondary: draft.theme?.secondary || '#FFFFFF',
      },
      customization: draft.customization || undefined,
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
        editState: p.editState,
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
        editState: draft.surprisePhoto.editState,
      } : null,
      secretPhotos: Array.isArray(draft.secretPhotos) ? draft.secretPhotos.slice(0, 5).map((p: any) => ({
        id: p.id,
        previewUrl: p.previewUrl,
        caption: p.caption,
        location: p.location,
        year: p.year,
        aspect: p.aspect,
        editState: p.editState,
      })) : [],
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
      cinematicExtras: draft.cinematicExtras || undefined,
      publishedAt,
      expiresAt,
      status: 'PUBLISHED',
    };

    // Structured media_references for Supabase PostgreSQL
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
 * GET PUBLIC EXPERIENCE ENDPOINT
 * GET /experience/:experienceId
 */
apiRouter.get('/experience/:experienceId', async (req, res) => {
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

    // Enrichment with short-lived Supabase Storage signed URLs while active
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
 * POST /experience/:experienceId/simulate-expire
 */
apiRouter.post('/experience/:experienceId/simulate-expire', async (req, res) => {
  const { experienceId } = req.params;
  try {
    const expired = await simulateExpireInDb(experienceId);
    res.json({ success: true, status: 'EXPIRED', record: expired });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * POST /cron/cleanup
 */
apiRouter.post('/cron/cleanup', async (req, res) => {
  try {
    const result = await runCleanupJob();
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

/**
 * Helper: Cinematic fallback generator when AI API key is missing or fails
 */
function getCinematicFallback(req: any) {
  const name = req.recipientName || 'Alex';
  const age = req.milestoneAge ? `${req.milestoneAge}th` : '';
  const rel = req.relationship === 'Other' ? req.customRelationship : req.relationship;

  const openingWish = req.creatorMessage && req.creatorMessage.trim().length > 10
    ? req.creatorMessage.trim()
    : `Happy Birthday, ${name}! Today is a tribute to every laugh, journey, and quiet adventure that makes you irreplaceable.`;

  const intro = req.milestoneAge
    ? `${req.milestoneAge} Orbits Around The Sun`
    : 'A Tribute to Unforgettable Moments';

  const story = req.creatorMessage && req.creatorMessage.trim().length > 15
    ? req.creatorMessage
    : `From early dawn departures to late-night conversations under starlit skies, your steady light and relentless kindness continue to inspire everyone lucky enough to share this journey with you.`;

  const innerCircleIntro = rel
    ? `An intimate circle of those who know your light best—celebrating our cherished bond as ${rel.toLowerCase()}.`
    : `A sacred constellation of the memories and people closest to your heart.`;

  const vaultIntro = 'Some moments are too precious for ordinary days. Here they are preserved eternally in the 3D vault.';

  const surpriseText = req.hasSurprisePhoto
    ? 'A confidential memory unlocked exclusively for your eyes.'
    : undefined;

  const finalWish = `May the year ahead bring the same unyielding joy, laughter, and courage that you give to the world every single day. Happy ${age} Birthday, ${name}.`;

  return {
    openingWish,
    intro,
    story,
    photoCaptions: Array.from({ length: req.photoCount || 3 }).map((_, i) => `Chapter ${i + 1} Memory`),
    innerCircleIntro,
    vaultIntro,
    surpriseText,
    finalWish,
  };
}

/**
 * GENERATE BIRTHDAY CONTENT ENDPOINT
 * Handles both POST /ai/generate-birthday-content and POST /generate-birthday-content
 */
const handleGenerateBirthdayContent = async (req: express.Request, res: express.Response) => {
  const { 
    recipientName = 'Alex', 
    relationship, 
    customRelationship, 
    milestoneAge, 
    birthdayDate, 
    senderName, 
    creatorMessage,
    photoCount = 3,
    hasSurprisePhoto = false,
    template = 'cinema'
  } = req.body || {};

  const templateTones: Record<string, string> = {
    cinema: 'cinematic, dramatic, emotionally powerful, movie-poster theater premiere tone',
    memories: 'warm, intimate, nostalgic, deeply personal photographic memoir tone',
    celebration: 'joyful, energetic, exciting, premium celebratory birthday night tone',
    elegance: 'refined, timeless, sophisticated, luxury editorial magazine tone',
  };
  const activeTone = templateTones[template] || templateTones.cinema;

  const actualRel = relationship === 'Other' ? customRelationship : relationship;
  const aiClient = getAiClient();

  // If Gemini API is not configured, seamlessly return high-fidelity cinematic fallback
  if (!aiClient) {
    console.log('[AI] GEMINI_API_KEY not configured, serving cinematic fallback story');
    return res.json({ 
      success: true, 
      content: getCinematicFallback(req.body),
      fallbackUsed: true 
    });
  }

  try {
    const prompt = `
You are the master cinematic storyteller and narrative director for "Itzfizz Celebrations" — an ultra-premium, deeply moving personalized birthday tribute platform.

Aesthetic Direction: ${activeTone}.

Craft an emotionally captivating, cinematic 7-act birthday tribute script for:
- Recipient Name: ${recipientName}
${actualRel ? `- Relationship to creator: ${actualRel}` : ''}
${milestoneAge ? `- Milestone Birthday Age: ${milestoneAge}th birthday` : ''}
${birthdayDate ? `- Birthday Date: ${birthdayDate}` : ''}
${senderName ? `- From: ${senderName}` : ''}
${creatorMessage ? `- Personal memories & tone shared by creator: "${creatorMessage}"` : ''}
- Photo Count: Exactly ${photoCount} memory moments in the gallery
- Has Private Surprise Photo: ${hasSurprisePhoto ? 'Yes' : 'No'}

Requirements:
1. "openingWish": A deeply touching, theater-grade birthday statement (25-40 words).
2. "intro": A poetic milestone subtitle (e.g. "30 Orbits of Laughter, Wisdom, and Light").
3. "story": A rich 3-sentence cinematic reflection on who they are, how they illuminate every room, and what their journey represents.
4. "photoCaptions": An array of EXACTLY ${photoCount} distinct, warm, evocative 1-sentence captions suitable for each chapter in the photo story.
5. "innerCircleIntro": A warm, 1-2 sentence salute to their closest bonds and the people who make life richer.
6. "vaultIntro": A 1-sentence poetic intro to the 3D memory vault where time stands still.
7. "surpriseText": ${hasSurprisePhoto ? 'A single mysterious, playful, and affectionate teaser line to unlock the confidential surprise memory.' : 'A final tender toast.'}
8. "finalWish": An unforgettable emotional epilogue and birthday salute.

Tone: Warm, luxurious, profoundly emotional, heartfelt, authentic. Avoid generic birthday clichés.
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            openingWish: { type: Type.STRING },
            intro: { type: Type.STRING },
            story: { type: Type.STRING },
            photoCaptions: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            innerCircleIntro: { type: Type.STRING },
            vaultIntro: { type: Type.STRING },
            surpriseText: { type: Type.STRING },
            finalWish: { type: Type.STRING },
          },
          required: [
            'openingWish',
            'intro',
            'story',
            'photoCaptions',
            'innerCircleIntro',
            'vaultIntro',
            'finalWish'
          ],
        },
      },
    });

    let cleanJson = (response.text || '').trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    const parsed = JSON.parse(cleanJson || '{}');
    res.json({ success: true, content: parsed });
  } catch (error: any) {
    console.error('Error generating AI birthday content (falling back):', error?.status || error?.code || '', error?.message);
    // Graceful degradation: return safe fallback rather than breaking creator workflow with 500
    res.json({ 
      success: true, 
      content: getCinematicFallback(req.body),
      fallbackUsed: true 
    });
  }
};

apiRouter.post('/ai/generate-birthday-content', handleGenerateBirthdayContent);
apiRouter.post('/generate-birthday-content', handleGenerateBirthdayContent);

/**
 * REGENERATE SECTION ENDPOINT
 * Handles both POST /ai/regenerate-section and POST /regenerate-section
 */
const handleRegenerateSection = async (req: express.Request, res: express.Response) => {
  const { 
    section, 
    recipientName = 'Alex', 
    relationship, 
    customRelationship, 
    milestoneAge, 
    creatorMessage, 
    senderName,
    currentValue 
  } = req.body || {};

  const actualRel = relationship === 'Other' ? customRelationship : relationship;
  const aiClient = getAiClient();

  if (!aiClient) {
    return res.json({ 
      success: true, 
      text: currentValue || `Happy Birthday to ${recipientName}!` 
    });
  }

  try {
    const prompt = `
You are rewriting a single section of a cinematic birthday experience for ${recipientName} (${actualRel || 'cherished friend'}${milestoneAge ? `, celebrating ${milestoneAge}th milestone` : ''}).
${senderName ? `From: ${senderName}.` : ''}
${creatorMessage ? `Creator's memory note: "${creatorMessage}".` : ''}
${currentValue ? `Current draft to improve upon: "${currentValue}".` : ''}

Target Section: "${section}".
Rewrite this section with fresh phrasing, theater-grade emotional resonance, and cinematic warmth.

Return ONLY a JSON object with a single string property "text".
`;

    const response = await aiClient.models.generateContent({
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
    res.json({ 
      success: true, 
      text: currentValue || `Happy Birthday to ${recipientName}!` 
    });
  }
};

apiRouter.post('/ai/regenerate-section', handleRegenerateSection);
apiRouter.post('/regenerate-section', handleRegenerateSection);

// Mount the apiRouter on BOTH '/api' and '/' so routes match under any Vercel serverless routing configuration
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
