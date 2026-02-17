import { Router } from 'express';
import { TRIP } from '../data/config.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (_req, res) => {
  res.json([TRIP]);
});

router.get('/:id', requireAuth, (_req, res) => {
  res.json(TRIP);
});

export default router;
