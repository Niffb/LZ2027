# Deploying to Vercel (Free Tier)

This app uses a **split deployment**: frontend on Vercel, backend on Render. Both have free tiers.

## Why split?

Vercel runs serverless functions. Your backend uses:

- **SQLite** – needs a persistent filesystem (not available on Vercel)
- **Session cookies** – better suited to a long‑running server

So the backend runs on Render instead.

---

## Step 1: Deploy backend to Render

1. Push your code to GitHub (or connect Render to your repo).
2. Go to [render.com](https://render.com) and sign up.
3. **New** → **Web Service**.
4. Connect your repo and choose it.
5. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm run server`
   - **Plan:** Free

6. **Environment variables:**
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = a random secret (e.g. from a password generator)
   - `CORS_ORIGIN` = your future Vercel URL (e.g. `https://your-app.vercel.app`) – you can set this after deploying the frontend.
   - `GEMINI_API_KEY` = your Gemini API key (from `.env.local`)

7. Deploy. Your API base URL will be something like `https://vaycay-api.onrender.com` (or your chosen name).

**Note:** Render’s free tier sleeps after ~15 minutes of inactivity; the first request may take 30–60 seconds. Render's free tier uses ephemeral storage—the SQLite database resets on redeploy. For persistent data, use a paid plan with disk or a hosted DB.

---

## Step 2: Deploy frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up.
2. **Add New** → **Project** → import your repo.
3. Settings (usually detected automatically):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment variables:**
   - `VITE_API_URL` = your Render API URL (e.g. `https://vaycay-api.onrender.com`) – no trailing slash.
   - `GEMINI_API_KEY` = your Gemini API key (for any AI features in the frontend).

5. Deploy.

---

## Step 3: Connect frontend and backend

1. In **Render** → your service → **Environment**:
   - Set `CORS_ORIGIN` to your Vercel URL (e.g. `https://your-app.vercel.app`).

2. Redeploy the Render service after changing env vars.

---

## Local development

- Frontend: `npm run dev`
- Backend: `npm run server`
- Or both: `npm run dev:all`

Uses `http://localhost:3000` as the frontend and `http://localhost:3001` for the API (via Vite proxy). No `VITE_API_URL` needed locally.
