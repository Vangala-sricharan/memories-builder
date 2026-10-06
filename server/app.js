// api/_lib/app.ts
import express from "express";
import crypto2 from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// api/_lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
var isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_SECRET_KEY
);
var supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
}) : null;
var localDatabase = /* @__PURE__ */ new Map();
var localLifetimeCounter = 0;
async function getGlobalCounter() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("global_stats").select("experience_count").eq("id", true).single();
      if (!error && data) {
        const count = Number(data.experience_count);
        localLifetimeCounter = Math.max(localLifetimeCounter, count);
        return count;
      }
    } catch (err) {
      console.warn("Could not read global_stats from Supabase, falling back to local counter:", err?.message);
    }
  }
  return localLifetimeCounter;
}
async function incrementGlobalCounter() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc("increment_experience_count");
      if (!error && data !== null && data !== void 0) {
        const count = Number(data);
        localLifetimeCounter = Math.max(localLifetimeCounter, count);
        return count;
      }
      const current = await getGlobalCounter();
      const next = current + 1;
      const { error: updateError } = await supabase.from("global_stats").update({ experience_count: next, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", true);
      if (!updateError) {
        localLifetimeCounter = Math.max(localLifetimeCounter, next);
        return next;
      }
    } catch (err) {
      console.error("Error incrementing counter in Supabase:", err?.message);
    }
  }
  localLifetimeCounter += 1;
  return localLifetimeCounter;
}
async function saveExperienceRecord(experienceId, payload, publishedAt, expiresAt, mediaReferences) {
  const record = {
    experience_id: experienceId,
    status: "PUBLISHED",
    published_at: publishedAt,
    expires_at: expiresAt,
    payload,
    media_references: mediaReferences || { photos: [] },
    cleanup_status: "PENDING",
    cleanup_attempts: 0,
    last_cleanup_attempt_at: null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  localDatabase.set(experienceId, record);
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("experiences").insert({
      experience_id: experienceId,
      status: "PUBLISHED",
      published_at: publishedAt,
      expires_at: expiresAt,
      payload,
      media_references: mediaReferences || { photos: [] },
      cleanup_status: "PENDING",
      cleanup_attempts: 0,
      last_cleanup_attempt_at: null
    });
    if (error) {
      localDatabase.delete(experienceId);
      throw new Error(`Supabase insert failed: ${error.message}`);
    }
  }
  return record;
}
async function getExperienceRecord(experienceId) {
  if (!experienceId) return null;
  const cached = localDatabase.get(experienceId);
  if (cached && (cached.status === "EXPIRED" || cached.status === "DELETED")) {
    return cached;
  }
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("experiences").select("*").eq("experience_id", experienceId).single();
      if (!error && data) {
        localDatabase.set(experienceId, data);
        return data;
      }
    } catch (err) {
      console.error(`Error querying Supabase for experience ${experienceId}:`, err?.message);
    }
  }
  return cached || null;
}
async function markExperienceExpired(experienceId) {
  const existing = localDatabase.get(experienceId);
  if (existing) {
    existing.status = "EXPIRED";
    localDatabase.set(experienceId, existing);
  }
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("experiences").update({ status: "EXPIRED" }).eq("experience_id", experienceId);
    } catch (err) {
      console.error(`Error marking experience ${experienceId} expired:`, err?.message);
    }
  }
}
async function getExpiredExperiences() {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("experiences").select("*").lte("expires_at", now).neq("cleanup_status", "COMPLETED");
      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.error("Error fetching expired experiences from Supabase:", err?.message);
    }
  }
  const results = [];
  const nowMs = Date.now();
  for (const record of localDatabase.values()) {
    if (new Date(record.expires_at).getTime() <= nowMs && record.cleanup_status !== "COMPLETED") {
      results.push(record);
    }
  }
  return results;
}
async function updateCleanupStatus(experienceId, cleanupStatus, attemptsIncrement = 1) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = localDatabase.get(experienceId);
  if (existing) {
    existing.cleanup_status = cleanupStatus;
    existing.cleanup_attempts = (existing.cleanup_attempts || 0) + attemptsIncrement;
    existing.last_cleanup_attempt_at = now;
    if (cleanupStatus === "COMPLETED") {
      existing.status = "DELETED";
      existing.payload = {};
      existing.media_references = { photos: [] };
    }
    localDatabase.set(experienceId, existing);
  }
  if (isSupabaseConfigured && supabase) {
    try {
      if (cleanupStatus === "COMPLETED") {
        await supabase.from("experiences").update({
          status: "DELETED",
          cleanup_status: "COMPLETED",
          cleanup_attempts: attemptsIncrement,
          last_cleanup_attempt_at: now,
          payload: {},
          media_references: {}
        }).eq("experience_id", experienceId);
      } else {
        await supabase.from("experiences").update({
          cleanup_status: "FAILED",
          cleanup_attempts: attemptsIncrement,
          last_cleanup_attempt_at: now
        }).eq("experience_id", experienceId);
      }
    } catch (err) {
      console.error(`Error updating cleanup status for ${experienceId}:`, err?.message);
    }
  }
}
async function simulateExpireInDb(experienceId) {
  const expiredTime = new Date(Date.now() - 5e3).toISOString();
  const cached = localDatabase.get(experienceId);
  if (cached) {
    cached.status = "EXPIRED";
    cached.expires_at = expiredTime;
    localDatabase.set(experienceId, cached);
  }
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.from("experiences").update({
      status: "EXPIRED",
      expires_at: expiredTime
    }).eq("experience_id", experienceId).select().single();
    if (data) {
      localDatabase.set(experienceId, data);
      return data;
    }
  }
  return cached || getExperienceRecord(experienceId);
}

// api/_lib/supabaseStorage.ts
import crypto from "crypto";
var BUCKET_NAME = "birthday-media";
var localMediaStore = /* @__PURE__ */ new Map();
async function ensureBucketExists() {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        // STRICTLY PRIVATE: No unrestricted public access
        fileSizeLimit: 31457280,
        // 30MB
        allowedMimeTypes: [
          "image/webp",
          "image/jpeg",
          "image/png",
          "image/jpg",
          "audio/mpeg",
          "audio/mp3"
        ]
      });
    }
  } catch (err) {
  }
}
ensureBucketExists().catch(() => {
});
async function uploadMediaToSupabaseStorage(experienceId, type, buffer, contentType) {
  const randomObjectId = crypto.randomBytes(8).toString("hex");
  const ext = type === "music" ? "mp3" : "webp";
  const subFolder = type === "music" ? "music" : "photos";
  const path = `experiences/${experienceId}/${subFolder}/${randomObjectId}.${ext}`;
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: "86400"
      // 24-hour cache
    });
    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }
  } else {
    localMediaStore.set(path, {
      buffer,
      contentType,
      size: buffer.length
    });
  }
  const mediaUrl = `/api/media/${experienceId}/${subFolder}/${randomObjectId}.${ext}`;
  return {
    path,
    url: mediaUrl,
    sizeBytes: buffer.length
  };
}
async function createSignedMediaUploadUrl(experienceId, type, contentType = "audio/mpeg") {
  const randomObjectId = crypto.randomBytes(8).toString("hex");
  const ext = type === "music" ? "mp3" : "webp";
  const subFolder = type === "music" ? "music" : "photos";
  const path = `experiences/${experienceId}/${subFolder}/${randomObjectId}.${ext}`;
  const mediaUrl = `/api/media/${experienceId}/${subFolder}/${randomObjectId}.${ext}`;
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUploadUrl(path);
    if (error || !data) {
      throw new Error(`Failed to create signed upload URL: ${error?.message || "Unknown error"}`);
    }
    return {
      path,
      uploadUrl: data.signedUrl,
      token: data.token,
      mediaUrl
    };
  }
  return {
    path,
    uploadUrl: `/api/upload-media-direct?path=${encodeURIComponent(path)}`,
    token: "local-token",
    mediaUrl
  };
}
async function createSignedMediaUrl(path, expiresInSeconds = 3600) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, expiresInSeconds);
      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (err) {
      console.warn(`Could not generate signed URL for ${path}:`, err?.message);
    }
  }
  return null;
}
async function getMediaFromSupabaseStorage(path) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).download(path);
      if (error || !data) {
        return null;
      }
      const arrayBuffer = await data.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        contentType: data.type || "application/octet-stream"
      };
    } catch (err) {
      console.error(`Failed to fetch media from Supabase Storage for path ${path}:`, err?.message);
      return null;
    }
  }
  const stored = localMediaStore.get(path);
  if (!stored) return null;
  return {
    buffer: stored.buffer,
    contentType: stored.contentType
  };
}
async function deleteMediaPaths(paths) {
  if (!paths || paths.length === 0) return { deletedCount: 0 };
  let deletedCount = 0;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: removed } = await supabase.storage.from(BUCKET_NAME).remove(paths);
      deletedCount = removed?.length || paths.length;
    } catch (err) {
      console.error("Error deleting specific Supabase Storage paths:", err?.message);
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
async function deleteExperienceMediaFromSupabaseStorage(experienceId, knownPaths) {
  let deletedCount = 0;
  if (knownPaths && knownPaths.length > 0) {
    const res = await deleteMediaPaths(knownPaths);
    deletedCount += res.deletedCount;
  }
  const prefix = `experiences/${experienceId}`;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: photoFiles } = await supabase.storage.from(BUCKET_NAME).list(`${prefix}/photos`);
      const photoPaths = (photoFiles || []).map((f) => `${prefix}/photos/${f.name}`);
      const { data: musicFiles } = await supabase.storage.from(BUCKET_NAME).list(`${prefix}/music`);
      const musicPaths = (musicFiles || []).map((f) => `${prefix}/music/${f.name}`);
      const remainingPaths = [...photoPaths, ...musicPaths].filter((p) => !knownPaths?.includes(p));
      if (remainingPaths.length > 0) {
        const { data: removed } = await supabase.storage.from(BUCKET_NAME).remove(remainingPaths);
        deletedCount += removed?.length || remainingPaths.length;
      }
    } catch (err) {
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

// api/_lib/rateLimiter.ts
var rateLimitMap = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 36e5);
    if (entry.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}, 6e5);
function checkRateLimit(ip, action, maxRequests, windowMs) {
  const key = `${action}:${ip || "unknown"}`;
  const now = Date.now();
  let entry = rateLimitMap.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(key, entry);
  }
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1e3);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }
  entry.timestamps.push(now);
  return { allowed: true };
}

// api/_lib/cleanupWorker.ts
var isCleanupRunning = false;
async function runCleanupJob() {
  if (isCleanupRunning) {
    return { cleanedCount: 0, errors: ["Cleanup job already in progress"] };
  }
  isCleanupRunning = true;
  let cleanedCount = 0;
  const errors = [];
  try {
    const expiredList = await getExpiredExperiences();
    for (const exp of expiredList) {
      try {
        const knownPaths = [];
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
        await deleteExperienceMediaFromSupabaseStorage(exp.experience_id, knownPaths);
        await updateCleanupStatus(exp.experience_id, "COMPLETED", (exp.cleanup_attempts || 0) + 1);
        cleanedCount++;
      } catch (err) {
        errors.push(`Failed cleaning ${exp.experience_id}: ${err?.message}`);
        await updateCleanupStatus(exp.experience_id, "FAILED", (exp.cleanup_attempts || 0) + 1);
      }
    }
  } catch (err) {
    errors.push(`Cleanup query failure: ${err?.message}`);
  } finally {
    isCleanupRunning = false;
  }
  return { cleanedCount, errors };
}
function startCleanupScheduler(intervalMs = 3e5) {
  if (process.env.VERCEL) {
    return null;
  }
  const timer = setTimeout(() => {
    runCleanupJob().catch((err) => console.error("Initial cleanup run error:", err));
  }, 1e4);
  if (timer.unref) timer.unref();
  const interval = setInterval(() => {
    runCleanupJob().catch((err) => console.error("Scheduled cleanup error:", err));
  }, intervalMs);
  if (interval.unref) interval.unref();
  return interval;
}

// api/_lib/app.ts
dotenv.config();
var app = express();
console.log(`[INIT] SUPABASE_URL_PRESENT=${Boolean(process.env.SUPABASE_URL)}`);
console.log(`[INIT] SUPABASE_SECRET_KEY_PRESENT=${Boolean(process.env.SUPABASE_SECRET_KEY)}`);
console.log(`[INIT] GEMINI_API_KEY_PRESENT=${Boolean(process.env.GEMINI_API_KEY)}`);
var jsonParser = express.json({ limit: "60mb" });
var urlencodedParser = express.urlencoded({ limit: "60mb", extended: true });
app.use((req, res, next) => {
  if (req.body !== void 0 && typeof req.body === "object") {
    return next();
  }
  jsonParser(req, res, (err) => {
    if (err) return next(err);
    urlencodedParser(req, res, next);
  });
});
startCleanupScheduler();
function getAiClient() {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } catch {
    return null;
  }
}
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}
var apiRouter = express.Router();
apiRouter.get(["/diagnostic", "/health"], (req, res) => {
  res.json({
    status: "healthy",
    SUPABASE_URL_PRESENT: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SECRET_KEY_PRESENT: Boolean(process.env.SUPABASE_SECRET_KEY),
    GEMINI_API_KEY_PRESENT: Boolean(process.env.GEMINI_API_KEY),
    isSupabaseConfigured,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
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
apiRouter.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
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
var handleGlobalCounter = async (req, res) => {
  try {
    const count = await getGlobalCounter();
    res.json({ success: true, count });
  } catch (err) {
    console.error("Error fetching global counter:", err?.message);
    res.status(500).json({ success: false, error: "Failed to retrieve counter", count: 0 });
  }
};
apiRouter.get("/global-counter", handleGlobalCounter);
apiRouter.post("/global-counter", handleGlobalCounter);
apiRouter.post("/upload-media", async (req, res) => {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(clientIp, "upload", 60, 6e5);
  if (!rate.allowed) {
    res.status(429).json({
      success: false,
      error: "Too many upload requests right now. Please try again shortly."
    });
    return;
  }
  try {
    const { experienceId, type, dataBase64, mimeType } = req.body || {};
    if (!experienceId || typeof experienceId !== "string") {
      res.status(400).json({ success: false, error: "Invalid experience identifier." });
      return;
    }
    if (type !== "image" && type !== "music") {
      res.status(400).json({ success: false, error: "Invalid media type. Must be image or music." });
      return;
    }
    const allowedImageMimes = ["image/webp", "image/jpeg", "image/jpg", "image/png"];
    const allowedMusicMimes = ["audio/mpeg", "audio/mp3"];
    if (type === "image" && !allowedImageMimes.includes(mimeType?.toLowerCase())) {
      res.status(400).json({ success: false, error: "Unsupported image format. Use WebP, JPEG, or PNG." });
      return;
    }
    if (type === "music" && !allowedMusicMimes.includes(mimeType?.toLowerCase())) {
      res.status(400).json({ success: false, error: "Unsupported audio format. MP3 only." });
      return;
    }
    if (!dataBase64 || typeof dataBase64 !== "string") {
      res.status(400).json({ success: false, error: "No media payload provided." });
      return;
    }
    const base64Clean = dataBase64.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Clean, "base64");
    const maxSizeBytes = type === "image" ? 15 * 1024 * 1024 : 25 * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      res.status(400).json({ success: false, error: "Uploaded file exceeds size limit." });
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
      sizeBytes
    });
  } catch (err) {
    console.error("Error handling media upload:", err?.message);
    res.status(500).json({ success: false, error: "Failed to process media upload." });
  }
});
var handleCreateUploadUrl = async (req, res) => {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(clientIp, "upload", 60, 6e5);
  if (!rate.allowed) {
    res.status(429).json({
      success: false,
      error: "Too many upload URL requests right now. Please try again shortly."
    });
    return;
  }
  try {
    const { experienceId, type = "music", mimeType = "audio/mpeg" } = req.body || {};
    if (!experienceId || typeof experienceId !== "string") {
      res.status(400).json({ success: false, error: "Invalid experience identifier." });
      return;
    }
    if (type !== "music" && type !== "image") {
      res.status(400).json({ success: false, error: "Invalid media type. Must be music or image." });
      return;
    }
    if (type === "music") {
      const allowedMusicMimes = ["audio/mpeg", "audio/mp3"];
      if (mimeType && !allowedMusicMimes.includes(mimeType.toLowerCase())) {
        res.status(400).json({ success: false, error: "Unsupported audio format. MP3 only." });
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
      mediaUrl
    });
  } catch (err) {
    console.error("Error generating signed upload URL:", err?.message);
    res.status(500).json({ success: false, error: "Failed to initialize secure upload." });
  }
};
apiRouter.post("/create-upload-url", handleCreateUploadUrl);
apiRouter.post("/signed-upload-url", handleCreateUploadUrl);
apiRouter.get("/media/:experienceId/:type/:filename", async (req, res) => {
  const { experienceId, type, filename } = req.params;
  try {
    const storagePath = `experiences/${experienceId}/${type}/${filename}`;
    const exp = await getExperienceRecord(experienceId);
    if (!exp) {
      res.status(404).send("Media not found.");
      return;
    }
    const isExpired = Date.now() >= new Date(exp.expires_at).getTime() || exp.status === "EXPIRED" || exp.status === "DELETED";
    if (isExpired) {
      res.status(410).send("This birthday media has expired.");
      return;
    }
    const media = await getMediaFromSupabaseStorage(storagePath);
    if (!media) {
      res.status(404).send("Media object not found.");
      return;
    }
    res.setHeader("Content-Type", media.contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(media.buffer);
  } catch (err) {
    res.status(500).send("Failed to serve media.");
  }
});
apiRouter.post("/publish", async (req, res) => {
  const clientIp = getClientIp(req);
  const isLocalDev = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "::ffff:127.0.0.1";
  const limit = isLocalDev ? 100 : 15;
  const rate = checkRateLimit(clientIp, "publish", limit, 36e5);
  if (!rate.allowed) {
    res.status(429).json({
      success: false,
      error: "Too many publish requests. Please wait a short while before creating another experience."
    });
    return;
  }
  try {
    const { draft, experienceId: requestedId } = req.body || {};
    if (!draft || !draft.recipientName || !draft.recipientName.trim()) {
      res.status(400).json({ success: false, error: "A recipient name is required to publish." });
      return;
    }
    if (!draft.photos || !Array.isArray(draft.photos) || draft.photos.length < 6 || draft.photos.length > 25) {
      res.status(400).json({ success: false, error: "A minimum of 6 and maximum of 25 photos are required." });
      return;
    }
    const experienceId = requestedId && /^[a-zA-Z0-9_-]{8,16}$/.test(requestedId) ? requestedId : crypto2.randomBytes(8).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
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
        snapshot: existingExp.payload
      });
      return;
    }
    const now = /* @__PURE__ */ new Date();
    const publishedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1e3).toISOString();
    const snapshot = {
      experienceId,
      template: draft.template || "cinema",
      theme: {
        background: draft.theme?.background || "#080808",
        primary: draft.theme?.primary || "#E50914",
        secondary: draft.theme?.secondary || "#FFFFFF"
      },
      customization: draft.customization || void 0,
      recipientName: draft.recipientName.trim(),
      relationship: draft.relationship,
      customRelationship: draft.customRelationship,
      birthday: draft.birthday,
      milestoneAge: draft.milestoneAge,
      senderName: draft.senderName ? draft.senderName.trim() : void 0,
      birthdayMessage: draft.birthdayMessage || "Happy Birthday!",
      photos: draft.photos.map((p) => ({
        id: p.id,
        previewUrl: p.previewUrl,
        caption: p.caption,
        location: p.location,
        year: p.year,
        aspect: p.aspect,
        editState: p.editState
      })),
      heroPhotoId: draft.heroPhotoId || draft.photos[0]?.id,
      innerCirclePhotoIds: draft.innerCirclePhotoIds && draft.innerCirclePhotoIds.length > 0 ? draft.innerCirclePhotoIds : draft.photos.slice(0, Math.min(4, draft.photos.length)).map((p) => p.id),
      surprisePhoto: draft.surprisePhoto ? {
        id: draft.surprisePhoto.id,
        previewUrl: draft.surprisePhoto.previewUrl,
        caption: draft.surprisePhoto.caption,
        location: draft.surprisePhoto.location,
        year: draft.surprisePhoto.year,
        editState: draft.surprisePhoto.editState
      } : null,
      secretPhotos: Array.isArray(draft.secretPhotos) ? draft.secretPhotos.slice(0, 5).map((p) => ({
        id: p.id,
        previewUrl: p.previewUrl,
        caption: p.caption,
        location: p.location,
        year: p.year,
        aspect: p.aspect,
        editState: p.editState
      })) : [],
      finalMessage: draft.finalMessage || "Wishing you a magnificent year ahead.",
      music: draft.music ? {
        url: draft.music.url,
        fileName: draft.music.fileName,
        fileSizeFormatted: draft.music.fileSizeFormatted
      } : null,
      tagline: draft.tagline || "A Cinematic Birthday Story",
      openingQuote: draft.openingQuote || "\u201CSome people make the world brighter simply by being in it.\u201D",
      storyNarrative: draft.storyNarrative,
      innerCircleIntro: draft.innerCircleIntro,
      vaultIntro: draft.vaultIntro,
      surpriseText: draft.surpriseText,
      particleIntensity: draft.particleIntensity || "normal",
      cinematicExtras: draft.cinematicExtras || void 0,
      publishedAt,
      expiresAt,
      status: "PUBLISHED"
    };
    const mediaReferences = {
      photos: draft.photos.map((p) => {
        const match = p.previewUrl?.match(/(experiences\/[^\s"']+)/);
        const path = match ? match[1] : `experiences/${experienceId}/photos/${p.id}.webp`;
        return { id: p.id, path };
      }),
      music: draft.music?.url ? {
        path: draft.music.url.includes("experiences/") ? draft.music.url.slice(draft.music.url.indexOf("experiences/")) : `experiences/${experienceId}/music/soundtrack.mp3`
      } : null,
      surprisePhoto: draft.surprisePhoto?.previewUrl ? {
        id: draft.surprisePhoto.id,
        path: draft.surprisePhoto.previewUrl.includes("experiences/") ? draft.surprisePhoto.previewUrl.slice(draft.surprisePhoto.previewUrl.indexOf("experiences/")) : `experiences/${experienceId}/photos/surprise.webp`
      } : null
    };
    try {
      await saveExperienceRecord(experienceId, snapshot, publishedAt, expiresAt, mediaReferences);
    } catch (dbErr) {
      const pathsToClean = mediaReferences.photos.map((p) => p.path);
      if (mediaReferences.music?.path) pathsToClean.push(mediaReferences.music.path);
      if (mediaReferences.surprisePhoto?.path) pathsToClean.push(mediaReferences.surprisePhoto.path);
      await deleteExperienceMediaFromSupabaseStorage(experienceId, pathsToClean).catch(() => {
      });
      throw dbErr;
    }
    const newCount = await incrementGlobalCounter();
    res.json({
      success: true,
      experienceId,
      publishedAt,
      expiresAt,
      url: `/b/${experienceId}`,
      lifetimeCount: newCount,
      snapshot
    });
  } catch (err) {
    console.error("Error during publish:", err?.message);
    res.status(500).json({ success: false, error: err?.message || "Failed to publish experience." });
  }
});
apiRouter.get("/experience/:experienceId", async (req, res) => {
  const { experienceId } = req.params;
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(clientIp, "read", 120, 6e4);
  if (!rate.allowed) {
    res.status(429).json({ error: "Too many requests. Please try again shortly." });
    return;
  }
  try {
    const record = await getExperienceRecord(experienceId);
    if (!record || record.status === "DELETED") {
      res.status(404).json({ error: "This birthday experience could not be found." });
      return;
    }
    const now = Date.now();
    const expiryTime = new Date(record.expires_at).getTime();
    if (now >= expiryTime || record.status === "EXPIRED") {
      await markExperienceExpired(experienceId);
      res.json({
        status: "EXPIRED",
        message: "This birthday experience has expired."
      });
      return;
    }
    let enrichedPhotos = record.payload.photos || [];
    try {
      enrichedPhotos = await Promise.all(
        enrichedPhotos.map(async (p) => {
          const match = p.previewUrl?.match(/(experiences\/[^\s"']+)/);
          if (match) {
            const signed = await createSignedMediaUrl(match[1], 3600);
            if (signed) return { ...p, previewUrl: signed };
          }
          return p;
        })
      );
    } catch {
    }
    let enrichedMusic = record.payload.music;
    if (enrichedMusic?.url) {
      try {
        const match = enrichedMusic.url.match(/(experiences\/[^\s"']+)/);
        if (match) {
          const signed = await createSignedMediaUrl(match[1], 3600);
          if (signed) enrichedMusic = { ...enrichedMusic, url: signed };
        }
      } catch {
      }
    }
    let enrichedSurprise = record.payload.surprisePhoto;
    if (enrichedSurprise?.previewUrl) {
      try {
        const match = enrichedSurprise.previewUrl.match(/(experiences\/[^\s"']+)/);
        if (match) {
          const signed = await createSignedMediaUrl(match[1], 3600);
          if (signed) enrichedSurprise = { ...enrichedSurprise, previewUrl: signed };
        }
      } catch {
      }
    }
    res.json({
      status: "PUBLISHED",
      ...record.payload,
      photos: enrichedPhotos,
      music: enrichedMusic,
      surprisePhoto: enrichedSurprise,
      publishedAt: record.published_at,
      expiresAt: record.expires_at
    });
  } catch (err) {
    console.error("Error fetching public experience:", err?.message);
    res.status(500).json({ error: "We couldn't open this birthday experience right now." });
  }
});
apiRouter.post("/experience/:experienceId/simulate-expire", async (req, res) => {
  const { experienceId } = req.params;
  try {
    const expired = await simulateExpireInDb(experienceId);
    res.json({ success: true, status: "EXPIRED", record: expired });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
apiRouter.post("/cron/cleanup", async (req, res) => {
  try {
    const result = await runCleanupJob();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
function getCinematicFallback(req) {
  const name = req.recipientName || "Alex";
  const age = req.milestoneAge ? `${req.milestoneAge}th` : "";
  const rel = req.relationship === "Other" ? req.customRelationship : req.relationship;
  const openingWish = req.creatorMessage && req.creatorMessage.trim().length > 10 ? req.creatorMessage.trim() : `Happy Birthday, ${name}! Today is a tribute to every laugh, journey, and quiet adventure that makes you irreplaceable.`;
  const intro = req.milestoneAge ? `${req.milestoneAge} Orbits Around The Sun` : "A Tribute to Unforgettable Moments";
  const story = req.creatorMessage && req.creatorMessage.trim().length > 15 ? req.creatorMessage : `From early dawn departures to late-night conversations under starlit skies, your steady light and relentless kindness continue to inspire everyone lucky enough to share this journey with you.`;
  const innerCircleIntro = rel ? `An intimate circle of those who know your light best\u2014celebrating our cherished bond as ${rel.toLowerCase()}.` : `A sacred constellation of the memories and people closest to your heart.`;
  const vaultIntro = "Some moments are too precious for ordinary days. Here they are preserved eternally in the 3D vault.";
  const surpriseText = req.hasSurprisePhoto ? "A confidential memory unlocked exclusively for your eyes." : void 0;
  const finalWish = `May the year ahead bring the same unyielding joy, laughter, and courage that you give to the world every single day. Happy ${age} Birthday, ${name}.`;
  return {
    openingWish,
    intro,
    story,
    photoCaptions: Array.from({ length: req.photoCount || 3 }).map((_, i) => `Chapter ${i + 1} Memory`),
    innerCircleIntro,
    vaultIntro,
    surpriseText,
    finalWish
  };
}
var handleGenerateBirthdayContent = async (req, res) => {
  const {
    recipientName = "Alex",
    relationship,
    customRelationship,
    milestoneAge,
    birthdayDate,
    senderName,
    creatorMessage,
    photoCount = 3,
    hasSurprisePhoto = false,
    template = "cinema"
  } = req.body || {};
  const templateTones = {
    cinema: "cinematic, dramatic, emotionally powerful, movie-poster theater premiere tone",
    memories: "warm, intimate, nostalgic, deeply personal photographic memoir tone",
    celebration: "joyful, energetic, exciting, premium celebratory birthday night tone",
    elegance: "refined, timeless, sophisticated, luxury editorial magazine tone"
  };
  const activeTone = templateTones[template] || templateTones.cinema;
  const actualRel = relationship === "Other" ? customRelationship : relationship;
  const aiClient = getAiClient();
  if (!aiClient) {
    console.log("[AI] GEMINI_API_KEY not configured, serving cinematic fallback story");
    return res.json({
      success: true,
      content: getCinematicFallback(req.body),
      fallbackUsed: true
    });
  }
  try {
    const prompt = `
You are the master cinematic storyteller and narrative director for "Itzfizz Celebrations" \u2014 an ultra-premium, deeply moving personalized birthday tribute platform.

Aesthetic Direction: ${activeTone}.

Craft an emotionally captivating, cinematic 7-act birthday tribute script for:
- Recipient Name: ${recipientName}
${actualRel ? `- Relationship to creator: ${actualRel}` : ""}
${milestoneAge ? `- Milestone Birthday Age: ${milestoneAge}th birthday` : ""}
${birthdayDate ? `- Birthday Date: ${birthdayDate}` : ""}
${senderName ? `- From: ${senderName}` : ""}
${creatorMessage ? `- Personal memories & tone shared by creator: "${creatorMessage}"` : ""}
- Photo Count: Exactly ${photoCount} memory moments in the gallery
- Has Private Surprise Photo: ${hasSurprisePhoto ? "Yes" : "No"}

Requirements:
1. "openingWish": A deeply touching, theater-grade birthday statement (25-40 words).
2. "intro": A poetic milestone subtitle (e.g. "30 Orbits of Laughter, Wisdom, and Light").
3. "story": A rich 3-sentence cinematic reflection on who they are, how they illuminate every room, and what their journey represents.
4. "photoCaptions": An array of EXACTLY ${photoCount} distinct, warm, evocative 1-sentence captions suitable for each chapter in the photo story.
5. "innerCircleIntro": A warm, 1-2 sentence salute to their closest bonds and the people who make life richer.
6. "vaultIntro": A 1-sentence poetic intro to the 3D memory vault where time stands still.
7. "surpriseText": ${hasSurprisePhoto ? "A single mysterious, playful, and affectionate teaser line to unlock the confidential surprise memory." : "A final tender toast."}
8. "finalWish": An unforgettable emotional epilogue and birthday salute.

Tone: Warm, luxurious, profoundly emotional, heartfelt, authentic. Avoid generic birthday clich\xE9s.
`;
    const response = await aiClient.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            openingWish: { type: Type.STRING },
            intro: { type: Type.STRING },
            story: { type: Type.STRING },
            photoCaptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            innerCircleIntro: { type: Type.STRING },
            vaultIntro: { type: Type.STRING },
            surpriseText: { type: Type.STRING },
            finalWish: { type: Type.STRING }
          },
          required: [
            "openingWish",
            "intro",
            "story",
            "photoCaptions",
            "innerCircleIntro",
            "vaultIntro",
            "finalWish"
          ]
        }
      }
    });
    let cleanJson = (response.text || "").trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    const parsed = JSON.parse(cleanJson || "{}");
    res.json({ success: true, content: parsed });
  } catch (error) {
    console.error("Error generating AI birthday content (falling back):", error?.status || error?.code || "", error?.message);
    res.json({
      success: true,
      content: getCinematicFallback(req.body),
      fallbackUsed: true
    });
  }
};
apiRouter.post("/ai/generate-birthday-content", handleGenerateBirthdayContent);
apiRouter.post("/generate-birthday-content", handleGenerateBirthdayContent);
var handleRegenerateSection = async (req, res) => {
  const {
    section,
    recipientName = "Alex",
    relationship,
    customRelationship,
    milestoneAge,
    creatorMessage,
    senderName,
    currentValue
  } = req.body || {};
  const actualRel = relationship === "Other" ? customRelationship : relationship;
  const aiClient = getAiClient();
  if (!aiClient) {
    return res.json({
      success: true,
      text: currentValue || `Happy Birthday to ${recipientName}!`
    });
  }
  try {
    const prompt = `
You are rewriting a single section of a cinematic birthday experience for ${recipientName} (${actualRel || "cherished friend"}${milestoneAge ? `, celebrating ${milestoneAge}th milestone` : ""}).
${senderName ? `From: ${senderName}.` : ""}
${creatorMessage ? `Creator's memory note: "${creatorMessage}".` : ""}
${currentValue ? `Current draft to improve upon: "${currentValue}".` : ""}

Target Section: "${section}".
Rewrite this section with fresh phrasing, theater-grade emotional resonance, and cinematic warmth.

Return ONLY a JSON object with a single string property "text".
`;
    const response = await aiClient.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING }
          },
          required: ["text"]
        }
      }
    });
    const parsed = JSON.parse(response.text?.trim() || '{"text": ""}');
    res.json({ success: true, text: parsed.text });
  } catch (error) {
    console.error("Error regenerating section:", error?.message);
    res.json({
      success: true,
      text: currentValue || `Happy Birthday to ${recipientName}!`
    });
  }
};
apiRouter.post("/ai/regenerate-section", handleRegenerateSection);
apiRouter.post("/regenerate-section", handleRegenerateSection);
app.use("/api", apiRouter);
app.use("/", apiRouter);
var app_default = app;
export {
  app,
  app_default as default
};
