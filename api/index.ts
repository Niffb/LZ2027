import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();
dotenv.config({ path: '.env.local' });

// ── Database ──────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: ReturnType<typeof createClient> | null = null;
let dbError: string | null = null;

if (!supabaseUrl || !supabaseServiceKey) {
  const missing = [!supabaseUrl && 'SUPABASE_URL', !supabaseServiceKey && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean).join(', ');
  dbError = `Missing env: ${missing}`;
  console.error(`DB init error: ${dbError}`);
} else {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

function getDb() {
  if (!supabase) throw new Error(dbError || 'Database not initialized');
  return supabase;
}

// ── Config ────────────────────────────────────────────────────────────────────
const INVITE_CODE = 'lz2027';
const ADMIN_NAME = 'niff';
const TRIP_ID = 1;

const TRIP = {
  id: TRIP_ID,
  destination: 'Lanzarote',
  start_date: '2027-08-09',
  end_date: '2027-08-20',
  travelers: 12,
};

const HOTELS = [
  {
    id: 1, trip_id: TRIP_ID,
    name: 'Dreams Playa Dorada Lanzarote',
    address: 'Playa Dorada, Playa Blanca, Lanzarote',
    check_in: '2027-08-09', check_out: '2027-08-20',
    confirmation_number: '', notes: '',
  },
];

const FLIGHTS = [
  {
    id: 1, trip_id: TRIP_ID, airline: 'TBC', flight_number: '',
    departure_airport: 'LGW', arrival_airport: 'ACE',
    departure_time: '2027-08-09T06:00', arrival_time: '2027-08-09T10:00',
    booking_reference: '', notes: 'Outbound',
  },
  {
    id: 2, trip_id: TRIP_ID, airline: 'TBC', flight_number: '',
    departure_airport: 'ACE', arrival_airport: 'LGW',
    departure_time: '2027-08-20T11:00', arrival_time: '2027-08-20T15:00',
    booking_reference: '', notes: 'Return',
  },
];

const nameMatch = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const JWT_SECRET = process.env.SESSION_SECRET || 'holiday-dashboard-family-secret';
const JWT_EXPIRES_IN = '7d';

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// ── Middleware ─────────────────────────────────────────────────────────────────
function extractUser(req: any, _res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) req.userId = payload.userId;
  }
  next();
}

function requireAuth(req: any, res: any, next: any) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

async function requireAdmin(req: any, res: any, next: any) {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const db = req.db;
  const { data: user } = await db.from('users').select('is_admin').eq('id', req.userId).single();
  if (!user || !user.is_admin) return res.status(403).json({ error: 'Admin access required' });
  next();
}

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(extractUser);

// Inject DB
app.use('/api', (req: any, res, next) => {
  try { req.db = getDb(); } catch (err: any) { return res.status(500).json({ error: err.message }); }
  next();
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  if (dbError) return res.status(500).json({ ok: false, error: dbError });
  res.json({ ok: true });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req: any, res) => {
  const db = req.db;
  const { name, password, inviteCode } = req.body;
  if (!name?.trim() || !password || !inviteCode?.trim())
    return res.status(400).json({ error: 'Name, password and group code are required' });
  const trimmedName = name.trim();
  if (trimmedName.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (String(inviteCode).trim() !== INVITE_CODE)
    return res.status(401).json({ error: 'Incorrect group code' });

  const { data: existing, error: lookupErr } = await db.from('users').select('id, password_hash').ilike('name', trimmedName).maybeSingle();
  if (lookupErr) {
    if (lookupErr.message.includes('password_hash'))
      return res.status(500).json({ error: 'Database missing password_hash column. Run migration-password.sql in Supabase SQL Editor.' });
    return res.status(500).json({ error: lookupErr.message });
  }
  if (existing) {
    if (!existing.password_hash) {
      const hash = await bcrypt.hash(password, 10);
      const isAdmin = nameMatch(trimmedName, ADMIN_NAME) ? 1 : 0;
      await db.from('users').update({ password_hash: hash, is_admin: isAdmin }).eq('id', existing.id);
      const { data: u } = await db.from('users').select('id, name, is_admin').eq('id', existing.id).single();
      const token = signToken(u.id);
      return res.json({ id: u.id, name: u.name, isAdmin: !!u.is_admin, token });
    }
    return res.status(400).json({ error: 'Name already taken. Sign in instead.' });
  }

  const hash = await bcrypt.hash(password, 10);
  const isAdmin = nameMatch(trimmedName, ADMIN_NAME) ? 1 : 0;
  const { data: user, error } = await db.from('users').insert({ name: trimmedName, password_hash: hash, is_admin: isAdmin }).select('id, name, is_admin').single();
  if (error) return res.status(500).json({ error: error.message });
  const token = signToken(user.id);
  res.json({ id: user.id, name: user.name, isAdmin: !!user.is_admin, token });
});

app.post('/api/auth/signin', async (req: any, res) => {
  const db = req.db;
  const { name, password } = req.body;
  if (!name?.trim() || !password) return res.status(400).json({ error: 'Name and password are required' });
  const { data: user, error } = await db.from('users').select('id, name, is_admin, password_hash').ilike('name', name.trim()).maybeSingle();
  if (error || !user) return res.status(401).json({ error: 'Invalid name or password' });
  if (!user.password_hash) return res.status(401).json({ error: 'Please sign up again with a password.' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid name or password' });
  const isAdmin = nameMatch(user.name, ADMIN_NAME) ? 1 : 0;
  if (isAdmin !== user.is_admin) await db.from('users').update({ is_admin: isAdmin }).eq('id', user.id);
  const token = signToken(user.id);
  res.json({ id: user.id, name: user.name, isAdmin: !!isAdmin, token });
});

app.post('/api/auth/logout', (_req: any, res) => {
  res.json({ ok: true });
});

app.get('/api/auth/me', async (req: any, res) => {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  const db = req.db;
  const { data: user, error } = await db.from('users').select('id, name, is_admin').eq('id', req.userId).single();
  if (error || !user) return res.status(401).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, isAdmin: !!user.is_admin });
});

// ── Trips ─────────────────────────────────────────────────────────────────────
app.get('/api/trips', requireAuth, (_req, res) => res.json([TRIP]));
app.get('/api/trips/:id', requireAuth, (_req, res) => res.json(TRIP));

// ── Hotels & Flights (static config) ──────────────────────────────────────────
app.get('/api/trips/:tripId/hotels', requireAuth, (_req, res) => res.json(HOTELS));
app.get('/api/trips/:tripId/flights', requireAuth, (_req, res) => res.json(FLIGHTS));

// ── Members ───────────────────────────────────────────────────────────────────
app.get('/api/members', requireAuth, async (req: any, res) => {
  const db = req.db;
  const { data, error } = await db.from('users').select('id, name, is_admin, created_at').order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json((data ?? []).map((m: any) => ({ id: m.id, name: m.name, isAdmin: !!m.is_admin, joinedAt: m.created_at })));
});

// ── Itinerary ─────────────────────────────────────────────────────────────────
app.get('/api/trips/:tripId/itinerary', requireAuth, async (req: any, res) => {
  const db = req.db;
  const tripId = parseInt(req.params.tripId, 10);
  const { data, error } = await db.from('itinerary_items').select('*').eq('trip_id', tripId).order('day').order('time');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

app.post('/api/trips/:tripId/itinerary', requireAdmin, async (req: any, res) => {
  const db = req.db;
  const { day, time, activity, location, costEUR, notes } = req.body;
  const tripId = parseInt(req.params.tripId, 10);
  const { data, error } = await db.from('itinerary_items').insert({ trip_id: tripId, day, time, activity, location, cost_eur: costEUR ?? 0, notes: notes ?? null }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/itinerary/:id', requireAdmin, async (req: any, res) => {
  const db = req.db;
  const { error } = await db.from('itinerary_items').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Activities ────────────────────────────────────────────────────────────────
app.get('/api/trips/:tripId/activities', requireAuth, async (req: any, res) => {
  const db = req.db;
  const tripId = parseInt(req.params.tripId, 10);
  const { data: acts, error } = await db.from('activities').select('id, title, description, cost_eur, link, proposed_by').eq('trip_id', tripId);
  if (error) return res.status(500).json({ error: error.message });
  const ids = (acts ?? []).map((a: any) => a.id);
  const [allVotes, allComments, allUsers] = await Promise.all([
    ids.length ? db.from('votes').select('activity_id, vote, user_id').in('activity_id', ids) : { data: [] },
    ids.length ? db.from('comments').select('activity_id, text, user_id').in('activity_id', ids) : { data: [] },
    db.from('users').select('id, name'),
  ]);
  const usersMap = new Map((allUsers.data ?? []).map((u: any) => [u.id, u.name]));
  res.json((acts ?? []).map((a: any) => {
    const votes = (allVotes.data ?? []).filter((v: any) => v.activity_id === a.id);
    const comments = (allComments.data ?? []).filter((c: any) => c.activity_id === a.id);
    const votesMap: Record<string, string> = {};
    votes.forEach((v: any) => { votesMap[usersMap.get(v.user_id) ?? 'Unknown'] = v.vote; });
    return {
      id: a.id, title: a.title, description: a.description,
      proposedBy: usersMap.get(a.proposed_by) ?? 'Unknown',
      costEUR: a.cost_eur, link: a.link, votes: votesMap,
      comments: comments.map((c: any) => ({ user: usersMap.get(c.user_id) ?? 'Unknown', text: c.text })),
    };
  }));
});

app.post('/api/trips/:tripId/activities', requireAdmin, async (req: any, res) => {
  const db = req.db;
  const { title, description, costEUR, link } = req.body;
  const tripId = parseInt(req.params.tripId, 10);
  const { data: activity, error } = await db.from('activities').insert({ trip_id: tripId, title, description: description ?? '', proposed_by: req.userId, cost_eur: costEUR ?? 0, link: link ?? null }).select('id, title, description, cost_eur, link').single();
  if (error) return res.status(500).json({ error: error.message });
  const { data: proposer } = await db.from('users').select('name').eq('id', req.userId).single();
  res.json({ id: activity.id, title: activity.title, description: activity.description ?? '', proposedBy: proposer?.name ?? 'Unknown', costEUR: activity.cost_eur ?? 0, link: activity.link ?? null, votes: {}, comments: [] });
});

app.post('/api/activities/:id/vote', requireAuth, async (req: any, res) => {
  const { vote } = req.body;
  if (!['yes', 'no'].includes(vote)) return res.status(400).json({ error: 'Vote must be yes or no' });
  const db = req.db;
  const { error } = await db.from('votes').upsert({ activity_id: req.params.id, user_id: req.userId, vote }, { onConflict: 'activity_id,user_id' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.post('/api/activities/:id/comment', requireAuth, async (req: any, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  const db = req.db;
  const { error } = await db.from('comments').insert({ activity_id: req.params.id, user_id: req.userId, text });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/activities/:id', requireAdmin, async (req: any, res) => {
  const db = req.db;
  const { error } = await db.from('activities').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Export for Vercel ─────────────────────────────────────────────────────────
export default app;
