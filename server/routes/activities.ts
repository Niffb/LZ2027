import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get all activities for a trip (with votes and comments joined)
router.get('/trips/:tripId/activities', requireAuth, (req, res) => {
  const activities = db.prepare(
    'SELECT a.*, u.name as proposed_by_name FROM activities a LEFT JOIN users u ON a.proposed_by = u.id WHERE a.trip_id = ?'
  ).all(req.params.tripId) as any[];

  const result = activities.map(a => {
    const votes = db.prepare(
      'SELECT v.vote, u.name FROM votes v JOIN users u ON v.user_id = u.id WHERE v.activity_id = ?'
    ).all(a.id) as any[];

    const comments = db.prepare(
      'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.activity_id = ? ORDER BY c.created_at ASC'
    ).all(a.id) as any[];

    const votesMap: Record<string, string> = {};
    votes.forEach(v => { votesMap[v.name] = v.vote; });

    return {
      id: String(a.id),
      title: a.title,
      description: a.description,
      proposedBy: a.proposed_by_name || 'Unknown',
      costEUR: a.cost_eur,
      link: a.link,
      votes: votesMap,
      comments: comments.map(c => ({ user: c.user_name, text: c.text }))
    };
  });

  res.json(result);
});

router.post('/trips/:tripId/activities', requireAdmin, (req, res) => {
  const { title, description, costEUR, link } = req.body;
  const result = db.prepare(
    'INSERT INTO activities (trip_id, title, description, proposed_by, cost_eur, link) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.params.tripId, title, description || '', req.session.userId, costEUR || 0, link || null);

  const activity = db.prepare(
    'SELECT a.*, u.name as proposed_by_name FROM activities a LEFT JOIN users u ON a.proposed_by = u.id WHERE a.id = ?'
  ).get(result.lastInsertRowid) as any;

  res.json({
    id: String(activity.id),
    title: activity.title,
    description: activity.description,
    proposedBy: activity.proposed_by_name,
    costEUR: activity.cost_eur,
    link: activity.link,
    votes: {},
    comments: []
  });
});

router.post('/activities/:id/vote', requireAuth, (req, res) => {
  const { vote } = req.body;
  if (!['yes', 'no'].includes(vote)) {
    return res.status(400).json({ error: 'Vote must be yes or no' });
  }

  db.prepare(
    'INSERT INTO votes (activity_id, user_id, vote) VALUES (?, ?, ?) ON CONFLICT(activity_id, user_id) DO UPDATE SET vote = ?'
  ).run(req.params.id, req.session.userId, vote, vote);

  res.json({ ok: true });
});

router.post('/activities/:id/comment', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  db.prepare(
    'INSERT INTO comments (activity_id, user_id, text) VALUES (?, ?, ?)'
  ).run(req.params.id, req.session.userId, text);

  res.json({ ok: true });
});

router.delete('/activities/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
