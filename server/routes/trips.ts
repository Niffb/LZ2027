import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (_req, res) => {
  const trips = db.prepare('SELECT * FROM trips ORDER BY start_date ASC').all();
  res.json(trips);
});

router.get('/:id', requireAuth, (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json(trip);
});

router.post('/', requireAdmin, (req, res) => {
  const { destination, startDate, endDate, travelers } = req.body;
  if (!destination || !startDate || !endDate || !travelers) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const result = db.prepare(
    'INSERT INTO trips (destination, start_date, end_date, travelers, created_by) VALUES (?, ?, ?, ?, ?)'
  ).run(destination, startDate, endDate, travelers, req.session.userId);

  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(result.lastInsertRowid);
  res.json(trip);
});

router.put('/:id', requireAdmin, (req, res) => {
  const { destination, startDate, endDate, travelers } = req.body;
  db.prepare(
    'UPDATE trips SET destination = ?, start_date = ?, end_date = ?, travelers = ? WHERE id = ?'
  ).run(destination, startDate, endDate, travelers, req.params.id);

  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  res.json(trip);
});

router.delete('/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
