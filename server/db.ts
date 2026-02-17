import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config(); // .env
dotenv.config({ path: '.env.local' }); // overrides with .env.local

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: SupabaseClient | null = null;
let dbError: string | null = null;

if (!supabaseUrl || !supabaseServiceKey) {
  const missing = [!supabaseUrl && 'SUPABASE_URL', !supabaseServiceKey && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean).join(', ');
  dbError = `Missing env: ${missing}. Add to Vercel env vars or .env.local`;
  console.error(`DB init error: ${dbError}`);
} else {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export function getDb(): SupabaseClient {
  if (!supabase) {
    throw new Error(dbError || 'Database not initialized');
  }
  return supabase;
}

export function getDbError(): string | null {
  return dbError;
}

export async function verifySchema(): Promise<void> {
  if (!supabase) {
    console.error(`Cannot verify schema: ${dbError}`);
    return;
  }

  const required: Record<string, string[]> = {
    users: ['id', 'name', 'password_hash', 'is_admin', 'created_at'],
    itinerary_items: ['id', 'trip_id', 'day', 'time', 'activity', 'location', 'cost_eur'],
    activities: ['id', 'trip_id', 'title', 'description', 'proposed_by', 'cost_eur', 'link'],
    votes: ['id', 'activity_id', 'user_id', 'vote'],
    comments: ['id', 'activity_id', 'user_id', 'text', 'created_at'],
  };

  for (const [table, columns] of Object.entries(required)) {
    const { error } = await supabase.from(table).select(columns.join(',')).limit(0);
    if (error) {
      const msg = error.message;
      if (msg.includes('does not exist') || msg.includes('schema cache')) {
        console.error(`\n⚠️  SCHEMA ERROR: ${msg}`);
        console.error(`   Table "${table}" is missing expected columns.`);
        console.error(`   Run the SQL in supabase/schema.sql (and migration-password.sql) in the Supabase SQL Editor.\n`);
      }
    }
  }
}
