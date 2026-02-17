import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (_req, res) => {
  const members = db.prepare('SELECT id, name, email, is_admin, created_at FROM users ORDER BY id ASC').all();
  res.json(members.map((m: any) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    isAdmin: !!m.is_admin,
    joinedAt: m.created_at
  })));
});

export default router;
