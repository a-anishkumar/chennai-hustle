import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { Server as ColyseusServer, Room } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const SAVES_FILE = path.join(DATA_DIR, 'saves.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SAVES_FILE)) fs.writeFileSync(SAVES_FILE, JSON.stringify({ saves: {}, posters: [] }, null, 2));

// Optional PostgreSQL Pool when DATABASE_URL is configured; JSON file fallback otherwise
let pgPool = null;
if (process.env.DATABASE_URL) {
  pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  pgPool
    .query(
      'CREATE TABLE IF NOT EXISTS chennai_saves (player_id TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW())'
    )
    .catch((err) => console.warn('PostgreSQL init fallback to JSON:', err.message));
}

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(SAVES_FILE, 'utf-8'));
  } catch {
    return { saves: {}, posters: [] };
  }
}

function writeDb(db) {
  fs.writeFileSync(SAVES_FILE, JSON.stringify(db, null, 2));
}

// Colyseus Multiplayer Room for Chennai Hustle
class ChennaiRoom extends Room {
  onCreate() {
    this.onMessage('move', (client, data) => {
      this.broadcast('playerMove', { id: client.sessionId, ...data }, { except: client });
    });
  }
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    ok: true,
    service: 'chennai-hustle-api',
    multiplayer: 'colyseus',
    database: pgPool ? 'postgresql' : 'json-file',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/save/:playerId', async (req, res) => {
  if (pgPool) {
    try {
      const r = await pgPool.query('SELECT data FROM chennai_saves WHERE player_id = $1', [req.params.playerId]);
      if (r.rows[0]) return res.json({ save: r.rows[0].data });
    } catch {
      // fall through to JSON
    }
  }
  const db = readDb();
  res.json({ save: db.saves[req.params.playerId] || null });
});

app.post('/api/save/:playerId', async (req, res) => {
  if (pgPool) {
    try {
      await pgPool.query(
        'INSERT INTO chennai_saves (player_id, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (player_id) DO UPDATE SET data = $2, updated_at = NOW()',
        [req.params.playerId, req.body]
      );
    } catch {
      // fall through to JSON
    }
  }
  const db = readDb();
  db.saves[req.params.playerId] = { ...req.body, updatedAt: new Date().toISOString() };
  writeDb(db);
  res.json({ ok: true });
});

app.get('/api/posters', (_req, res) => {
  const db = readDb();
  res.json({ posters: db.posters || [] });
});

app.post('/api/posters', (req, res) => {
  const db = readDb();
  db.posters = [...(db.posters || []), req.body].slice(-60);
  writeDb(db);
  res.json({ ok: true, count: db.posters.length });
});

app.get('/api/leaderboard', (_req, res) => {
  const db = readDb();
  const list = Object.entries(db.saves || {}).map(([id, s]) => ({
    id,
    money: s.money ?? 0,
    reputation: s.reputation ?? 0,
    dayCount: s.dayCount ?? 1,
  }));
  list.sort((a, b) => b.money + b.reputation * 10 - (a.money + b.reputation * 10));
  res.json({ leaderboard: list.slice(0, 10) });
});

const PORT = process.env.PORT || 3001;
const httpServer = http.createServer(app);
const gameServer = new ColyseusServer({
  transport: new WebSocketTransport({ server: httpServer }),
});
gameServer.define('chennai_world', ChennaiRoom);

httpServer.listen(PORT, () => {
  console.log(`Chennai Hustle Express + Colyseus API listening on http://localhost:${PORT}`);
});
