import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { INVITE_CODE, ADMIN_NAME } from '../data/config.js';

const router = Router();

const nameMatch = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * POST /api/auth/signup
 * name, password, inviteCode
 */
router.post('/signup', async (req, res) => {
  const supabase = (req as any).db;
  const { name, password, inviteCode } = req.body;

  if (!name?.trim() || !password || !inviteCode?.trim()) {
    return res.status(400).json({ error: 'Name, password and group code are required' });
  }
  const trimmedName = name.trim();
  if (trimmedName.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (String(inviteCode).trim() !== INVITE_CODE) {
    return res.status(401).json({ error: 'Incorrect group code' });
  }

  const { data: existing, error: lookupErr } = await supabase
    .from('users')
    .select('id, password_hash')
    .ilike('name', trimmedName)
    .maybeSingle();

  if (lookupErr) {
    console.error('Signup lookup error:', lookupErr.message);
    if (lookupErr.message.includes('password_hash')) {
      return res.status(500).json({ error: 'Database missing password_hash column. Run: ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT; in Supabase SQL Editor.' });
    }
    return res.status(500).json({ error: lookupErr.message });
  }

  if (existing) {
    if (!existing.password_hash && String(inviteCode).trim() === INVITE_CODE) {
      const passwordHash = await bcrypt.hash(password, 10);
      const isAdmin = nameMatch(trimmedName, ADMIN_NAME) ? 1 : 0;
      await supabase.from('users').update({ password_hash: passwordHash, is_admin: isAdmin }).eq('id', existing.id);
      const { data: u } = await supabase.from('users').select('id, name, is_admin').eq('id', existing.id).single();
      req.session.userId = u.id;
      return res.json({ id: u.id, name: u.name, isAdmin: !!u.is_admin });
    }
    return res.status(400).json({ error: 'Name already taken. Sign in instead.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const isAdmin = nameMatch(trimmedName, ADMIN_NAME) ? 1 : 0;

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name: trimmedName, password_hash: passwordHash, is_admin: isAdmin })
    .select('id, name, is_admin')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  req.session.userId = user.id;
  res.json({ id: user.id, name: user.name, isAdmin: !!user.is_admin });
});

/**
 * POST /api/auth/signin
 * name, password
 */
router.post('/signin', async (req, res) => {
  const supabase = (req as any).db;
  const { name, password } = req.body;

  if (!name?.trim() || !password) {
    return res.status(400).json({ error: 'Name and password are required' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, is_admin, password_hash')
    .ilike('name', name.trim())
    .maybeSingle();

  if (error || !user) return res.status(401).json({ error: 'Invalid name or password' });
  if (!user.password_hash) return res.status(401).json({ error: 'Account created before passwords. Please sign up again with a password.' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid name or password' });

  const isAdmin = nameMatch(user.name, ADMIN_NAME) ? 1 : 0;
  if (isAdmin !== user.is_admin) {
    await supabase.from('users').update({ is_admin: isAdmin }).eq('id', user.id);
  }

  req.session.userId = user.id;
  res.json({ id: user.id, name: user.name, isAdmin: !!isAdmin });
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });
  const supabase = (req as any).db;
  const { data: user, error } = await supabase.from('users').select('id, name, is_admin').eq('id', req.session.userId).single();
  if (error || !user) return res.status(401).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, isAdmin: !!user.is_admin });
});

export default router;
