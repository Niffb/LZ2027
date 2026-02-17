import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { getDb, getDbError } from './db.js';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import itineraryRoutes from './routes/itinerary.js';
import activityRoutes from './routes/activities.js';
import travelInfoRoutes from './routes/travel-info.js';
import memberRoutes from './routes/members.js';

export const JWT_SECRET = process.env.SESSION_SECRET || 'holiday-dashboard-family-secret';
export const JWT_EXPIRES_IN = '7d';

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Extract userId from Bearer token on every request
app.use((req: any, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) req.userId = payload.userId;
  }
  next();
});

app.get('/api/health', (_req, res) => {
  const dbErr = getDbError();
  if (dbErr) return res.status(500).json({ ok: false, error: dbErr });
  res.json({ ok: true });
});

app.use((req, res, next) => {
  try {
    (req as any).db = getDb();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', itineraryRoutes);
app.use('/api', activityRoutes);
app.use('/api', travelInfoRoutes);
app.use('/api/members', memberRoutes);

export default app;
