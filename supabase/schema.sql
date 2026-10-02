-- ==========================================================
-- BIRTHDAY WEBSITE BUILDER — SUPABASE SCHEMA (STAGE 5)
-- Ephemeral 24-hour birthday experiences + Permanent global counter
-- ==========================================================

-- 1. Permanent Global Counter Table
-- Only the total number of created experiences survives permanently.
CREATE TABLE IF NOT EXISTS global_stats (
    id TEXT PRIMARY KEY,
    experience_count BIGINT NOT NULL DEFAULT 12482,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial count if not already present
INSERT INTO global_stats (id, experience_count)
VALUES ('lifetime', 12482)
ON CONFLICT (id) DO NOTHING;

-- Atomic increment function to prevent race conditions
CREATE OR REPLACE FUNCTION increment_global_counter()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_count BIGINT;
BEGIN
    UPDATE global_stats
    SET experience_count = experience_count + 1,
        updated_at = NOW()
    WHERE id = 'lifetime'
    RETURNING experience_count INTO new_count;

    RETURN new_count;
END;
$$;

-- 2. Temporary Experiences Table
-- All personal data, media references, and story configurations are stored here.
-- This data is automatically expired after 24 hours and physically deleted by the cleanup job.
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED', 'EXPIRED', 'DELETED')),
    published_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    payload JSONB NOT NULL,
    cleanup_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (cleanup_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_experiences_experience_id ON experiences(experience_id);
CREATE INDEX IF NOT EXISTS idx_experiences_expires_at ON experiences(expires_at);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_cleanup ON experiences(cleanup_status, expires_at);

-- 3. Row-Level Security (RLS)
-- Server-only access via SUPABASE_SERVICE_ROLE_KEY; direct public access is prohibited.
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Allow public read of the global counter only
CREATE POLICY "Public read global counter"
    ON global_stats
    FOR SELECT
    USING (true);

-- Disallow public client writes to prevent tampering
CREATE POLICY "Service role full access on experiences"
    ON experiences
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 4. Supabase Storage Bucket: 'birthday-media' (PRIVATE)
-- Used for temporary storage of browser-optimized photos and uploaded MP3 audio.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'birthday-media',
    'birthday-media',
    false, -- STRICTLY PRIVATE: No unrestricted public access
    31457280, -- 30MB max file size limit
    ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/jpg', 'audio/mpeg', 'audio/mp3']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 31457280;

-- Private bucket policy: Only service_role (backend) can read, insert, and delete
CREATE POLICY "Service role full access on birthday-media bucket"
    ON storage.objects
    FOR ALL
    USING (bucket_id = 'birthday-media' AND auth.role() = 'service_role')
    WITH CHECK (bucket_id = 'birthday-media' AND auth.role() = 'service_role');
