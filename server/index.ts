import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import db from './db.js';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import itineraryRoutes from './routes/itinerary.js';
import activityRoutes from './routes/activities.js';
import travelInfoRoutes from './routes/travel-info.js';
import memberRoutes from './routes/members.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');
const isProduction = existsSync(distPath);

const app = express();
const PORT = process.env.PORT || 3001;

// Only apply CORS in dev (when frontend is on a separate port via Vite)
if (!isProduction) {
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.use(cors({ origin: corsOrigin, credentials: true }));
}

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'holiday-dashboard-family-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Attach db to request for middleware access
app.use((req, _res, next) => {
  (req as any).db = db;
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', itineraryRoutes);
app.use('/api', activityRoutes);
app.use('/api', travelInfoRoutes);
app.use('/api/members', memberRoutes);

// Serve built frontend when dist/ exists (production / full-stack mode)
if (isProduction) {
  app.use(express.static(distPath));
  // SPA fallback — serve index.html for any non-API route
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}${isProduction ? ' (serving frontend from dist/)' : ''}`);
});
