import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/trips/:tripId/itinerary', requireAuth, async (req, res) => {
  const supabase = (req as any).db;
  const tripId = parseInt(req.params.tripId, 10);
  const { data: items, error } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('day', { ascending: true })
    .order('time', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(items?.map((i: any) => ({ ...i, id: i.id })) ?? []);
});

router.post('/trips/:tripId/itinerary', requireAdmin, async (req, res) => {
  const supabase = (req as any).db;
  const { day, time, activity, location, costEUR, notes } = req.body;
  const tripId = parseInt(req.params.tripId, 10);
  const { data: item, error } = await supabase
    .from('itinerary_items')
    .insert({
      trip_id: tripId,
      day,
      time,
      activity,
      location,
      cost_eur: costEUR ?? 0,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(item);
});

router.delete('/itinerary/:id', requireAuth, async (req, res) => {
  const supabase = (req as any).db;
  const { error } = await supabase.from('itinerary_items').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
