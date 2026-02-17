import express from 'express';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { getDb } from './db.js';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import itineraryRoutes from './routes/itinerary.js';
import activityRoutes from './routes/activities.js';
import travelInfoRoutes from './routes/travel-info.js';
import memberRoutes from './routes/members.js';

const isVercel = !!process.env.VERCEL;
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

if (!isVercel) {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.use(cors({ origin: corsOrigin, credentials: true }));
}

app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'holiday-dashboard-family-secret'],
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  httpOnly: true,
}));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use((req, _res, next) => {
  (req as any).db = getDb();
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', itineraryRoutes);
app.use('/api', activityRoutes);
app.use('/api', travelInfoRoutes);
app.use('/api/members', memberRoutes);

export default app;
