-- Maktub Production Database Setup
-- Run this in the Supabase SQL Editor for the PRODUCTION project

-- =============================================
-- CREATE TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 99),
  height TEXT DEFAULT '',
  residence TEXT DEFAULT '',
  relocate TEXT DEFAULT '',
  education TEXT DEFAULT '',
  profession TEXT DEFAULT '',
  legal_status TEXT DEFAULT '',
  marital_status TEXT DEFAULT '',
  children TEXT DEFAULT 'None',
  ethnicity TEXT DEFAULT '',
  religious_sect TEXT DEFAULT '',
  languages TEXT[] DEFAULT '{}',
  looking_for JSONB DEFAULT '{}',
  comments TEXT DEFAULT '',
  about_me TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  phone_verified BOOLEAN DEFAULT false,
  admin_verified BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_profile_id TEXT NOT NULL,
  to_profile_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(from_profile_id, to_profile_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('interest_received', 'interest_accepted', 'interest_declined')),
  from_profile_id TEXT NOT NULL,
  to_profile_id TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  reporter_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'removed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, profile_id)
);

CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

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
-- PROFILES: anyone can read, authenticated users can write
-- (profile ID uses Firebase UID, not Supabase anon UID)
-- =============================================

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_delete" ON profiles
  FOR DELETE USING (auth.uid() IS NOT NULL);

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
-- REPORTS: authenticated users can read/write
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
