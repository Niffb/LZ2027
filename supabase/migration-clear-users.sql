-- Run in Supabase SQL Editor to remove all existing users (fresh start).
-- WARNING: This deletes all users. Run only when you want to clear the table.
-- FKs (votes.user_id, comments.user_id, activities.proposed_by) use ON DELETE SET NULL
-- so dependent rows are updated automatically.

DELETE FROM users;
