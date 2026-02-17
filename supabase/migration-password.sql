-- Run in Supabase SQL Editor for custom auth (name + password, no email)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
