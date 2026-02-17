import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      session?: { userId?: string } | null;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const supabase = (req as any).db;
  const { data: user } = await supabase.from('users').select('is_admin').eq('id', req.session.userId).single();
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
