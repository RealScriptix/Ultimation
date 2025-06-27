// Run: npm init -y && npm install express body-parser cors fs uuid
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3000;
const DATA_FILE = './data.json';
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {} }));

const app = express();
app.use(cors());
app.use(bodyParser.json());

function load() { return JSON.parse(fs.readFileSync(DATA_FILE)); }
function save(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

app.post('/track', (req, res) => {
  const { apiToken, placeId, eventType, player, timestamp, extra } = req.body;
  const data = load();
  const user = Object.values(data.users).find(u => u.apiToken === apiToken);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const log = { placeId, eventType, player, timestamp: timestamp || Date.now(), extra };
  user.logs = user.logs || [];
  user.logs.push(log);
  user.stats = user.stats || { heartbeats: 0, joins: 0, leaves: 0 };
  if (eventType === 'heartbeat') user.stats.heartbeats++;
  if (eventType === 'PlayerAdded') user.stats.joins++;
  if (eventType === 'PlayerRemoving') user.stats.leaves++;
  save(data);
  res.json({ ok: true });
});

app.get('/stats/:token', (req, res) => {
  const data = load();
  const user = Object.values(data.users).find(u => u.apiToken === req.params.token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  res.json({ stats: user.stats || {}, logs: user.logs || [] });
});

app.listen(PORT, () => console.log(`Ultimation API running on port ${PORT}`));
