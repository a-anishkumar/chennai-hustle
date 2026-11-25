import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const SAVES_FILE = path.join(DATA_DIR, 'saves.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SAVES_FILE)) fs.writeFileSync(SAVES_FILE, JSON.stringify({ saves: {}, posters: [] }, null, 2));

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

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'chennai-hustle-api', timestamp: new Date().toISOString() });
});

app.get('/api/save/:playerId', (req, res) => {
  const db = readDb();
  const save = db.saves[req.params.playerId] || null;
  res.json({ save });
});

app.post('/api/save/:playerId', (req, res) => {
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
  list.sort((a, b) => b.money + b.reputation * 10 - (a.money + a.reputation * 10));
  res.json({ leaderboard: list.slice(0, 10) });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chennai Hustle Express API listening on http://localhost:${PORT}`);
});
