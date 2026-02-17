# Deploying to Vercel

This app runs entirely on Vercel: static frontend + Express API as serverless functions. Uses Supabase (PostgreSQL) for data.

---

## Step 1: Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In **Project Settings** → **API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (Secret) → `SUPABASE_SERVICE_ROLE_KEY`
3. In **SQL Editor**, run:
   - `supabase/schema.sql`
   - `supabase/migration-password.sql` (adds password_hash column)
   - Optional: `supabase/migration-clear-users.sql` (removes all users for fresh start)

---

## Step 2: Deploy to Vercel

1. Push your code to GitHub and [import the repo on Vercel](https://vercel.com/new).
2. Vercel will auto-detect:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add **Environment variables** in Vercel → Project → Settings → Environment Variables:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
   - `SESSION_SECRET` = random secret (e.g. from a password generator)
4. Deploy.

The API lives at `your-project.vercel.app/api/*`. No separate backend service needed.

---

## Local development

1. Copy `.env.example` to `.env.local` and set all vars.
2. Run `npm run dev:all` (frontend + backend).
3. Or separately: `npm run dev` and `npm run server`.
