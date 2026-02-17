import { Router } from 'express';
import db from '../db.js';
import { INVITE_CODE, ADMIN_NAME } from '../data/config.js';

const router = Router();

/**
 * POST /api/auth/join
 * Single endpoint for both registering and logging in.
 * Requires: name + invite_code.
 * If the name is new → creates an account.
 * If the name already exists → logs them in.
 * In both cases the invite_code must match.
 */
router.post('/join', (req, res) => {
  const { name, inviteCode } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!inviteCode) {
    return res.status(400).json({ error: 'Invite code is required' });
  }
  if (inviteCode.trim() !== INVITE_CODE) {
    return res.status(401).json({ error: 'Invalid invite code' });
  }

  const trimmedName = name.trim();
  const isAdmin = trimmedName.toLowerCase() === ADMIN_NAME.toLowerCase() ? 1 : 0;

  // Upsert: create the user if they don't exist, otherwise just fetch
  db.prepare(
    'INSERT INTO users (name, is_admin) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET is_admin = excluded.is_admin WHERE excluded.is_admin = 1'
  ).run(trimmedName, isAdmin);

  const user = db.prepare('SELECT * FROM users WHERE name = ?').get(trimmedName) as any;

  req.session.userId = user.id;
  res.json({ id: user.id, name: user.name, isAdmin: !!user.is_admin });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId) as any;
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json({ id: user.id, name: user.name, isAdmin: !!user.is_admin });
});

export default router;
