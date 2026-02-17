<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Ytw1shKHLjoNWOcFLdVotw9Q-Vc0Ex_q

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy [.env.example](.env.example) to `.env.local` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Run Supabase migration: `supabase/migration-password.sql` (adds password_hash to users)
4. **Run both frontend and backend:** `npm run dev:all`  
   (Or separately: `npm run server` in one terminal, `npm run dev` in another)

**Group/invite code for sign up:** `lz2027` (edit in `server/data/config.ts`)

## Deploy to Vercel (Free Tier)

See [DEPLOY.md](DEPLOY.md) for full instructions. The frontend deploys to Vercel; the backend (Express + SQLite) deploys to Render.
