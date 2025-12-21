const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_FILE = process.env.LITTLEX_DB_PATH || path.join(__dirname, '..', 'data', 'littlex.db');

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(DB_FILE);

const db = new sqlite3.Database(DB_FILE);

function migrateFromJSON(jsonPath) {
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const j = JSON.parse(raw);
    const topics = j.topics || [];
    const groups = j.interestGroups || [];
    const members = j.groupMembers || [];
    const affinities = j.topicAffinity || [];

    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS topics (id TEXT PRIMARY KEY, name TEXT, trending_score REAL)`);
      db.run(`CREATE TABLE IF NOT EXISTS interest_groups (id TEXT PRIMARY KEY, name TEXT, description TEXT)`);
      db.run(`CREATE TABLE IF NOT EXISTS group_members (group_id TEXT, profile_jid TEXT, joined_at INTEGER)`);
      db.run(`CREATE TABLE IF NOT EXISTS topic_affinity (node_id TEXT, topic_id TEXT, score REAL, ts INTEGER)`);

      const tIns = db.prepare(`INSERT OR IGNORE INTO topics(id,name,trending_score) VALUES(?,?,?)`);
      topics.forEach(t => tIns.run(t.id || `topic_${Date.now()}`, t.name, t.trending_score || 0));
      tIns.finalize();

      const gIns = db.prepare(`INSERT OR IGNORE INTO interest_groups(id,name,description) VALUES(?,?,?)`);
      groups.forEach(g => gIns.run(g.id || `group_${Date.now()}`, g.name, g.description || ''));
      gIns.finalize();

      const mIns = db.prepare(`INSERT INTO group_members(group_id,profile_jid,joined_at) VALUES(?,?,?)`);
      members.forEach(m => mIns.run(m.group_id, m.profile_jid, m.joined_at || Date.now()));
      mIns.finalize();

      const aIns = db.prepare(`INSERT INTO topic_affinity(node_id,topic_id,score,ts) VALUES(?,?,?,?)`);
      affinities.forEach(a => aIns.run(a.node_id, a.topic_id, a.score || 1, a.ts || Date.now()));
      aIns.finalize();
    });
  } catch (e) {
    // ignore if file missing
  }
}

migrateFromJSON(path.join(__dirname, '..', 'data', 'graph.json'));

module.exports = {
  db,
  run: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve(this);
      });
    });
  },
  all: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },
  get: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
};
