import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any = null;
let initError: string | null = null;

async function getApp() {
  if (app) return app;
  if (initError) return null;
  try {
    const mod = await import('../server/app');
    app = mod.default;
    return app;
  } catch (err: any) {
    initError = err.message || 'Failed to initialize server';
    console.error('API init error:', err);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = await getApp();
  if (!expressApp) {
    return res.status(500).json({ error: initError || 'Server not initialized' });
  }
  return expressApp(req, res);
}
