-- Run this in Supabase SQL Editor to create the schema
-- Dashboard → SQL Editor → New Query → Paste & Run

-- Users (invite-code based, not Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  is_admin INTEGER DEFAULT 0 CHECK (is_admin IN (0, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itinerary items
CREATE TABLE IF NOT EXISTS itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id INTEGER NOT NULL DEFAULT 1,
  day INTEGER NOT NULL,
  time TEXT NOT NULL,
  activity TEXT NOT NULL,
  location TEXT NOT NULL,
  cost_eur REAL DEFAULT 0,
  notes TEXT
);

-- Activities (suggestions/pins)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  proposed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cost_eur REAL DEFAULT 0,
  link TEXT
);

-- Votes on activities
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
  UNIQUE(activity_id, user_id)
);

-- Comments on activities
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_itinerary_trip ON itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip ON activities(trip_id);
CREATE INDEX IF NOT EXISTS idx_votes_activity ON votes(activity_id);
CREATE INDEX IF NOT EXISTS idx_comments_activity ON comments(activity_id);

