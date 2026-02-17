import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/trips/:tripId/itinerary', requireAuth, (req, res) => {
  const items = db.prepare(
    'SELECT * FROM itinerary_items WHERE trip_id = ? ORDER BY day ASC, time ASC'
  ).all(req.params.tripId);
  res.json(items);
});

router.post('/trips/:tripId/itinerary', requireAdmin, (req, res) => {
  const { day, time, activity, location, costEUR, notes } = req.body;
  const result = db.prepare(
    'INSERT INTO itinerary_items (trip_id, day, time, activity, location, cost_eur, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.params.tripId, day, time, activity, location, costEUR || 0, notes || null);

  const item = db.prepare('SELECT * FROM itinerary_items WHERE id = ?').get(result.lastInsertRowid);
  res.json(item);
});

router.delete('/itinerary/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM itinerary_items WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
