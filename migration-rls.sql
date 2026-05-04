-- Migration: Enable RLS + policies for all tables
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/tgytcjecuwrtesyrenzv/sql/new

-- Add image_url column if not present
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS image_url TEXT;

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- =============================================
-- DROP EXISTING POLICIES (clean slate)
-- =============================================

DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;

DROP POLICY IF EXISTS "interests_select" ON interests;
DROP POLICY IF EXISTS "interests_insert" ON interests;
DROP POLICY IF EXISTS "interests_update" ON interests;

DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;

DROP POLICY IF EXISTS "reports_select" ON reports;
DROP POLICY IF EXISTS "reports_insert" ON reports;
DROP POLICY IF EXISTS "reports_update" ON reports;

DROP POLICY IF EXISTS "saved_profiles_select" ON saved_profiles;
DROP POLICY IF EXISTS "saved_profiles_insert" ON saved_profiles;
DROP POLICY IF EXISTS "saved_profiles_delete" ON saved_profiles;

DROP POLICY IF EXISTS "saved_filters_select" ON saved_filters;
DROP POLICY IF EXISTS "saved_filters_insert" ON saved_filters;
DROP POLICY IF EXISTS "saved_filters_delete" ON saved_filters;

-- =============================================
-- PROFILES: anyone can read, owner can write
-- Owner is identified by id = 'user-' || auth.uid()
-- =============================================

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (
    id = 'user-' || auth.uid()::text
  );

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    id = 'user-' || auth.uid()::text
  );

CREATE POLICY "profiles_delete" ON profiles
  FOR DELETE USING (
    id = 'user-' || auth.uid()::text
  );

-- =============================================
-- INTERESTS: authenticated users can read/write
-- =============================================

CREATE POLICY "interests_select" ON interests
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "interests_insert" ON interests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "interests_update" ON interests
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =============================================
-- NOTIFICATIONS: authenticated users can read/write
-- =============================================

CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =============================================
-- REPORTS: anyone can insert, read is authenticated
-- =============================================

CREATE POLICY "reports_select" ON reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "reports_insert" ON reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "reports_update" ON reports
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =============================================
-- SAVED PROFILES: only owner can read/write
-- =============================================

CREATE POLICY "saved_profiles_select" ON saved_profiles
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "saved_profiles_insert" ON saved_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "saved_profiles_delete" ON saved_profiles
  FOR DELETE USING (user_id = auth.uid()::text);

-- =============================================
-- SAVED FILTERS: only owner can read/write
-- =============================================

CREATE POLICY "saved_filters_select" ON saved_filters
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "saved_filters_insert" ON saved_filters
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "saved_filters_delete" ON saved_filters
  FOR DELETE USING (user_id = auth.uid()::text);
