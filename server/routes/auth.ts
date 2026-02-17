import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const isAdmin = email === 'niff.bareham@gmail.com' ? 1 : (userCount === 0 ? 1 : 0);

  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)'
  ).run(name, email, hash, isAdmin);

  const user = db.prepare('SELECT id, name, email, is_admin FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
  req.session.userId = user.id;

  res.json({ id: user.id, name: user.name, email: user.email, isAdmin: !!user.is_admin });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  req.session.userId = user.id;
  res.json({ id: user.id, name: user.name, email: user.email, isAdmin: !!user.is_admin });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = db.prepare('SELECT id, name, email, is_admin FROM users WHERE id = ?').get(req.session.userId) as any;
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json({ id: user.id, name: user.name, email: user.email, isAdmin: !!user.is_admin });
});

export default router;
