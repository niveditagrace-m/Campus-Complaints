-- ============================================================
-- CampusVoice — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────
-- 1. COMPLAINTS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.complaints (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN (
                  'infrastructure','academics','hostel',
                  'food','transport','hygiene','safety','other'
                )),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                  'pending','in_progress','resolved','rejected'
                )),

  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name   TEXT NOT NULL DEFAULT 'Anonymous',
  is_anonymous  BOOLEAN NOT NULL DEFAULT FALSE,

  image_url     TEXT,
  votes_count   INTEGER NOT NULL DEFAULT 0,
  admin_remarks TEXT
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.complaints;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────
-- 2. VOTES TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  complaint_id  UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE (complaint_id, user_id)   -- one vote per user per complaint
);

-- ─────────────────────────────────────────
-- 3. RPC FUNCTIONS (increment / decrement votes)
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_votes(complaint_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.complaints
  SET votes_count = votes_count + 1
  WHERE id = complaint_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_votes(complaint_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.complaints
  SET votes_count = GREATEST(votes_count - 1, 0)
  WHERE id = complaint_id;
END;
$$;

-- ─────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes      ENABLE ROW LEVEL SECURITY;

-- COMPLAINTS policies
CREATE POLICY "Anyone can read complaints"
  ON public.complaints FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints"
  ON public.complaints FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own complaints"
  ON public.complaints FOR DELETE
  USING (auth.uid() = user_id);

-- ADMIN override — update any complaint (admins identified by email)
-- Replace these emails with your actual admin emails
CREATE POLICY "Admins can update any complaint"
  ON public.complaints FOR UPDATE
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid())
    IN ('admin@campus.edu', 'director@campus.edu', 'principal@campus.edu')
  );

-- VOTES policies
CREATE POLICY "Anyone can read votes"
  ON public.votes FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 5. STORAGE BUCKET
-- ─────────────────────────────────────────
-- Run this separately in the Storage section, or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-images', 'complaint-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'complaint-images' AND auth.role() = 'authenticated');

-- Allow public read of images
CREATE POLICY "Public read complaint images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────
-- 6. PERFORMANCE INDEXES
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_complaints_user_id    ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status     ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category   ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_votes      ON public.complaints(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_votes_complaint_user  ON public.votes(complaint_id, user_id);

-- ─────────────────────────────────────────
-- 7. SEED DATA (optional — remove if not needed)
-- ─────────────────────────────────────────
-- Uncomment below to insert demo complaints for testing
-- (requires at least one user to exist in auth.users)

/*
INSERT INTO public.complaints (title, description, category, status, user_id, author_name, is_anonymous, votes_count)
VALUES
  ('Broken AC in Block C Lab', 'The air conditioning in Block C computer lab has been broken for 3 weeks. The heat is unbearable and affects concentration.', 'infrastructure', 'pending', (SELECT id FROM auth.users LIMIT 1), 'Anonymous', TRUE, 14),
  ('Canteen food quality is declining', 'The quality of food in the main canteen has dropped significantly. Stale rotis and watered-down dal have become the norm.', 'food', 'in_progress', (SELECT id FROM auth.users LIMIT 1), 'Student Council', FALSE, 28),
  ('No hot water in Hostel Block B', 'Hot water supply has been absent in Block B hostel for the past 10 days. This is a basic necessity.', 'hostel', 'resolved', (SELECT id FROM auth.users LIMIT 1), 'Anonymous', TRUE, 9);
*/
