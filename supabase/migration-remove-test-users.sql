-- Remove test users only. Keeps real users (e.g. Niff).
-- Run in Supabase SQL Editor.

DELETE FROM users
WHERE name IN ('CookieTest', 'CookieTest2', 'CookieTest3', 'JWTTest1');
