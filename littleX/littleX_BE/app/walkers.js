const dbModule = require('./db');
const uuid = require('crypto').randomUUID;

async function attachTopicAffinity({ node_id, topic_name, score = 1.0 }) {
  // use SQLite-backed store
  const db = dbModule;
  // find or create topic
  let topic = await db.get(`SELECT id,name,trending_score FROM topics WHERE name = ?`, [topic_name]);
  if (!topic) {
    const id = `topic_${Date.now()}`;
    await db.run(`INSERT INTO topics(id,name,trending_score) VALUES(?,?,?)`, [id, topic_name, Number(score)]);
    topic = { id, name: topic_name, trending_score: Number(score) };
  } else {
    const newScore = Number(topic.trending_score || 0) + Number(score);
    await db.run(`UPDATE topics SET trending_score = ? WHERE id = ?`, [newScore, topic.id]);
    topic.trending_score = newScore;
  }

  await db.run(`INSERT INTO topic_affinity(node_id,topic_id,score,ts) VALUES(?,?,?,?)`, [node_id, topic.id, Number(score), Date.now()]);
  return { status: 'attached', topic };
}

async function joinInterestGroup({ profile_jid, group_name }) {
  const db = dbModule;
  let g = await db.get(`SELECT id,name,description FROM interest_groups WHERE name = ?`, [group_name]);
  if (!g) {
    const id = `group_${Date.now()}`;
    await db.run(`INSERT INTO interest_groups(id,name,description) VALUES(?,?,?)`, [id, group_name, 'Generated group']);
    g = { id, name: group_name, description: 'Generated group' };
  }

  const exists = await db.get(`SELECT 1 FROM group_members WHERE group_id = ? AND profile_jid = ?`, [g.id, profile_jid]);
  if (!exists) {
    await db.run(`INSERT INTO group_members(group_id,profile_jid,joined_at) VALUES(?,?,?)`, [g.id, profile_jid, Date.now()]);
  }

  return { status: 'joined', group: g };
}

async function updateTopicTrends({ decay = 0.9 } = {}) {
  const db = dbModule;
  // decay existing topics
  const topics = await db.all(`SELECT id,trending_score FROM topics`);
  for (const t of topics) {
    const ns = Number(t.trending_score || 0) * Number(decay);
    await db.run(`UPDATE topics SET trending_score = ? WHERE id = ?`, [ns, t.id]);
  }

  // boost by recent mentions
  const weekMs = 7 * 24 * 3600 * 1000;
  const affinities = await db.all(`SELECT * FROM topic_affinity`);
  const now = Date.now();
  for (const a of affinities) {
    const topic = await db.get(`SELECT id,trending_score FROM topics WHERE id = ?`, [a.topic_id]);
    if (topic) {
      const age = now - (a.ts || 0);
      const weight = age < weekMs ? 1.0 : 0.1;
      const add = (a.score || 0) * weight * 0.1;
      const ns = Number(topic.trending_score || 0) + add;
      await db.run(`UPDATE topics SET trending_score = ? WHERE id = ?`, [ns, topic.id]);
    }
  }

  return { status: 'updated' };
}

async function getTrendingTopics({ top = 10 } = {}) {
  const db = dbModule;
  const topics = await db.all(`SELECT id,name,trending_score FROM topics ORDER BY trending_score DESC LIMIT ?`, [top]);
  return topics.map(t => ({ id: t.id, name: t.name, score: Number(t.trending_score || 0) }));
}

// collaborative filtering: simple co-affinity based recommendations
async function recommendCommunitiesCF({ profile_jid, top = 8 } = {}) {
  const db = dbModule;
  // find topics this profile is affiliated with
  const affinities = await db.all(`SELECT topic_id FROM topic_affinity WHERE node_id = ?`, [profile_jid]);
  const topicIds = affinities.map(a => a.topic_id);

  if (topicIds.length === 0) {
    // fallback: return biggest groups
    const groups = await db.all(`SELECT g.id,g.name,COUNT(m.profile_jid) AS members FROM interest_groups g LEFT JOIN group_members m ON g.id = m.group_id GROUP BY g.id ORDER BY members DESC LIMIT ?`, [top]);
    return groups;
  }

  // find other nodes with overlapping topics, then their groups
  const rows = await db.all(`SELECT ga.node_id, ga.topic_id FROM topic_affinity ga WHERE ga.topic_id IN (${topicIds.map(()=>'?').join(',')})`, topicIds);
  const coNodes = [...new Set(rows.map(r => r.node_id).filter(n => n !== profile_jid))];
  if (coNodes.length === 0) return [];

  const groups = await db.all(`SELECT g.id,g.name,COUNT(m.profile_jid) AS members FROM interest_groups g JOIN group_members m ON g.id = m.group_id WHERE m.profile_jid IN (${coNodes.map(()=>'?').join(',')}) GROUP BY g.id ORDER BY members DESC LIMIT ?`, [...coNodes, top]);
  return groups;
}

module.exports = {
  attachTopicAffinity,
  joinInterestGroup,
  updateTopicTrends,
  getTrendingTopics,
  recommendCommunitiesCF
};
