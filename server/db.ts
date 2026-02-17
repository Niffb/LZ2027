import Database from 'better-sqlite3';
import path from 'path';
import { ADMIN_NAME } from './data/config.js';

const dbPath = path.join(import.meta.dirname, '..', 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS itinerary_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL DEFAULT 1,
    day INTEGER NOT NULL,
    time TEXT NOT NULL,
    activity TEXT NOT NULL,
    location TEXT NOT NULL,
    cost_eur REAL DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT,
    proposed_by INTEGER REFERENCES users(id),
    cost_eur REAL DEFAULT 0,
    link TEXT
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    vote TEXT CHECK(vote IN ('yes', 'no')),
    UNIQUE(activity_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Ensure the admin name always has admin privileges if they've already joined
db.prepare('UPDATE users SET is_admin = 1 WHERE LOWER(name) = LOWER(?)').run(ADMIN_NAME);

export default db;
