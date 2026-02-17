import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/trips/:tripId/activities', requireAuth, async (req, res) => {
  const supabase = (req as any).db;
  const tripId = parseInt(req.params.tripId, 10);

  const { data: activitiesData, error: actErr } = await supabase
    .from('activities')
    .select('id, title, description, cost_eur, link, proposed_by')
    .eq('trip_id', tripId);

  if (actErr) return res.status(500).json({ error: actErr.message });

  const ids = (activitiesData ?? []).map((a: any) => a.id);
  const [allVotes, allComments, allUsers] = await Promise.all([
    ids.length ? supabase.from('votes').select('activity_id, vote, user_id').in('activity_id', ids) : { data: [] },
    ids.length ? supabase.from('comments').select('activity_id, text, user_id').in('activity_id', ids) : { data: [] },
    supabase.from('users').select('id, name'),
  ]);

  const usersMap = new Map((allUsers.data ?? []).map((u: any) => [u.id, u.name]));

  const result = (activitiesData ?? []).map((a: any) => {
    const votes = (allVotes.data ?? []).filter((v: any) => v.activity_id === a.id);
    const comments = (allComments.data ?? []).filter((c: any) => c.activity_id === a.id);
    const votesMap: Record<string, string> = {};
    votes.forEach((v: any) => { votesMap[usersMap.get(v.user_id) ?? 'Unknown'] = v.vote; });
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      proposedBy: usersMap.get(a.proposed_by) ?? 'Unknown',
      costEUR: a.cost_eur,
      link: a.link,
      votes: votesMap,
      comments: comments.map((c: any) => ({ user: usersMap.get(c.user_id) ?? 'Unknown', text: c.text })),
    };
  });

  res.json(result);
});

router.post('/trips/:tripId/activities', requireAdmin, async (req, res) => {
  const supabase = (req as any).db;
  const { title, description, costEUR, link } = req.body;
  const tripId = parseInt(req.params.tripId, 10);

  const { data: activity, error } = await supabase
    .from('activities')
    .insert({
      trip_id: tripId,
      title,
      description: description ?? '',
      proposed_by: req.userId,
      cost_eur: costEUR ?? 0,
      link: link ?? null,
    })
    .select('id, title, description, cost_eur, link')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const { data: proposer } = await supabase.from('users').select('name').eq('id', req.userId).single();

  res.json({
    id: activity.id,
    title: activity.title,
    description: activity.description ?? '',
    proposedBy: proposer?.name ?? 'Unknown',
    costEUR: activity.cost_eur ?? 0,
    link: activity.link ?? null,
    votes: {},
    comments: [],
  });
});

router.post('/activities/:id/vote', requireAuth, async (req, res) => {
  const { vote } = req.body;
  if (!['yes', 'no'].includes(vote)) {
    return res.status(400).json({ error: 'Vote must be yes or no' });
  }
  const supabase = (req as any).db;
  const { error } = await supabase.from('votes').upsert(
    {
      activity_id: req.params.id,
      user_id: req.userId,
      vote,
    },
    { onConflict: 'activity_id,user_id' }
  );
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

router.post('/activities/:id/comment', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  const supabase = (req as any).db;
  const { error } = await supabase.from('comments').insert({
    activity_id: req.params.id,
    user_id: req.userId,
    text,
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

router.delete('/activities/:id', requireAdmin, async (req, res) => {
  const supabase = (req as any).db;
  const { error } = await supabase.from('activities').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
