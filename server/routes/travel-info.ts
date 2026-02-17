import { Router } from 'express';
import { HOTELS, FLIGHTS } from '../data/config.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/trips/:tripId/hotels', requireAuth, (_req, res) => {
  res.json(HOTELS);
});

router.get('/trips/:tripId/flights', requireAuth, (_req, res) => {
  res.json(FLIGHTS);
});

export default router;
