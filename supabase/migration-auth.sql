-- Run in Supabase SQL Editor to add Supabase Auth support
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
