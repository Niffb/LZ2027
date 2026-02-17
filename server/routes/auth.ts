import { Router } from 'express';
import { INVITE_CODE, ADMIN_NAME } from '../data/config.js';

const router = Router();

router.post('/join', async (req, res) => {
  const supabase = (req as any).db;
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

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .ilike('name', trimmedName)
    .maybeSingle();

  if (existing) {
    await supabase.from('users').update({ name: trimmedName, is_admin: isAdmin }).eq('id', existing.id);
  } else {
    await supabase.from('users').insert({ name: trimmedName, is_admin: isAdmin });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, is_admin')
    .ilike('name', trimmedName)
    .single();

  if (error || !user) return res.status(500).json({ error: 'Failed to create user' });

  req.session.userId = user.id;
  res.json({ id: user.id, name: user.name, isAdmin: !!user.is_admin });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  const supabase = (req as any).db;
  const { data: user, error } = await supabase.from('users').select('id, name, is_admin').eq('id', req.session.userId).single();
  if (error || !user) return res.status(401).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, isAdmin: !!user.is_admin });
});

export default router;
