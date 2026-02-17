import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  const supabase = (_req as any).db;
  const { data: members, error } = await supabase
    .from('users')
    .select('id, name, is_admin, created_at')
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(
    (members ?? []).map((m: any) => ({
      id: m.id,
      name: m.name,
      isAdmin: !!m.is_admin,
      joinedAt: m.created_at,
    }))
  );
});

export default router;
