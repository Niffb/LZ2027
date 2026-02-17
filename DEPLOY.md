# Deploying to Vercel (Free Tier)

This app uses a **split deployment**: frontend on Vercel, backend on Render. Both have free tiers. The backend uses **Supabase** (PostgreSQL) for persistent data.

---

## Step 1: Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In **Project Settings** → **API**, copy:
   - **Project URL** → `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - **service_role key** (Secret) → `SUPABASE_SERVICE_ROLE_KEY` (backend only)
   - **Publishable key** → `VITE_SUPABASE_ANON_KEY` (frontend auth)
3. In **SQL Editor**, run `supabase/schema.sql`, then `supabase/migration-auth.sql`.
4. Run `supabase/migration-password.sql` to add the password_hash column. Auth is custom (name + password), not Supabase Auth.

---

## Step 2: Deploy backend to Render

1. Push your code to GitHub (or connect Render to your repo).
2. Go to [render.com](https://render.com) and sign up.
3. **New** → **Web Service**.
4. Connect your repo and choose it.
5. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run server`
   - **Plan:** Free

6. **Environment variables:**
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = a random secret (e.g. from a password generator)
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key

7. Deploy. Your API URL will be something like `https://vaycay-api.onrender.com`.

**Note:** Render's free tier sleeps after ~15 minutes of inactivity; the first request may take 30–60 seconds.

---

## Step 3: Deploy frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up.
2. **Add New** → **Project** → import your repo.
3. Settings (usually detected automatically):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment variables:**
   - `VITE_API_URL` = your Render API URL (e.g. `https://vaycay-api.onrender.com`) – no trailing slash.

5. Deploy.

The `vercel.json` rewrites proxy `/api/*` requests to your Render backend, so you can use the Vercel URL directly.

---

## Local development

1. Copy `.env.example` to `.env.local` and set all Supabase vars (URL, service role key, and VITE_ URL + anon key for frontend).
2. Run:
   - Frontend: `npm run dev`
   - Backend: `npm run server`
   - Or both: `npm run dev:all`

Uses `http://localhost:3000` as the frontend and `http://localhost:3001` for the API (via Vite proxy).
