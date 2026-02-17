import { Router } from 'express';
import db from '../db.js';
import { INVITE_CODE, ADMIN_NAME } from '../data/config.js';

const router = Router();

/**
 * POST /api/auth/join
 * Single endpoint for both first-time registration and returning logins.
 * Requires: { name, inviteCode }
 */
router.post('/join', (req, res) => {
  const { name, inviteCode } = req.body;

  if (!name || !inviteCode) {
    return res.status(400).json({ error: 'Name and group code are required' });
  }

  const trimmedName = String(name).trim();
  if (trimmedName.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  if (String(inviteCode).trim() !== INVITE_CODE) {
    return res.status(401).json({ error: 'Incorrect group code' });
  }

  const isAdmin = trimmedName.toLowerCase() === ADMIN_NAME.toLowerCase() ? 1 : 0;

  // Create user if they don't exist, otherwise just fetch them
  db.prepare(
    'INSERT INTO users (name, is_admin) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET is_admin = excluded.is_admin WHERE LOWER(name) = LOWER(?)'
  ).run(trimmedName, isAdmin, trimmedName);

  const user = db.prepare('SELECT * FROM users WHERE LOWER(name) = LOWER(?)').get(trimmedName) as any;

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
  const user = db.prepare('SELECT id, name, is_admin FROM users WHERE id = ?').get(req.session.userId) as any;
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json({ id: user.id, name: user.name, isAdmin: !!user.is_admin });
});

export default router;
