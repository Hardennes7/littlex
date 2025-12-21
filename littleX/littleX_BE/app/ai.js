const fs = require('fs');
const path = require('path');
const walkers = require('./walkers');
const db = require('./db');

let OpenAIClient = null;
try {
  const OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) {
    OpenAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  // openai package not installed or no key
}

function simpleHashtags(text, max = 6) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  const freq = {};
  words.forEach(w => (freq[w] = (freq[w] || 0) + 1));
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(x => '#' + x[0]);
}

async function generateHype({ prompt = '', style = 'neutral' } = {}) {
  const base = prompt.trim() || 'Share something interesting...';
  if (OpenAIClient) {
    try {
      const resp = await OpenAIClient.responses.create({
        model: 'gpt-4o-mini',
        input: `Rewrite the following to be ${style} and suggest 6 hashtags. Text:\n${base}`
      });
      const text = resp.output[0]?.content?.[0]?.text || resp.output_text || JSON.stringify(resp);
      return { enhanced: text, meta: { style, provider: 'openai' } };
    } catch (e) {
      // fallback to local
    }
  }

  // simple local fallback
  const hashtags = simpleHashtags(base, 6);
  const tone = style === 'viral' ? '🔥 Exciting take: ' : style === 'professional' ? '📌 Refined: ' : '';
  const suggestion = `${tone}${base} \n\nSuggested hashtags: ${[...new Set(hashtags)].join(' ')}`;
  return { enhanced: suggestion, meta: { style, provider: 'mock' } };
}

async function summarizeThread({ messages = [] } = {}) {
  if (OpenAIClient) {
    try {
      const joined = messages.join('\n');
      const resp = await OpenAIClient.responses.create({ model: 'gpt-4o-mini', input: `Summarize the following thread:\n${joined}` });
      const text = resp.output[0]?.content?.[0]?.text || resp.output_text || JSON.stringify(resp);
      return { summary: text, provider: 'openai' };
    } catch (e) {
      // fallback
    }
  }
  if (!messages || messages.length === 0) return { summary: 'No messages to summarize.' };
  const first = messages[0].slice(0, 140);
  const last = messages[messages.length - 1].slice(0, 140);
  const summary = `Thread of ${messages.length} messages — start: "${first}" ... end: "${last}"`;
  return { summary };
}

async function recommendCommunities({ profile_jid } = {}) {
  // prefer collaborative filtering walker backed by DB
  try {
    const recs = await walkers.recommendCommunitiesCF({ profile_jid });
    return { recommendations: recs };
  } catch (e) {
    return { recommendations: [] };
  }
}

async function getAnalytics() {
  const rows = await db.all(`SELECT name,trending_score FROM topics ORDER BY trending_score DESC LIMIT 10`);
  const groups = await db.all(`SELECT g.name,COUNT(m.profile_jid) AS members FROM interest_groups g LEFT JOIN group_members m ON g.id = m.group_id GROUP BY g.id ORDER BY members DESC`);
  return {
    snapshot_at: new Date().toISOString(),
    topTopics: rows.map(r => ({ name: r.name, score: r.trending_score })),
    groups
  };
}

module.exports = {
  generateHype,
  summarizeThread,
  recommendCommunities,
  getAnalytics
};
