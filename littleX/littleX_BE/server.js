// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'littleX API is running!',
        version: '1.0.0',
        endpoints: {
            test: 'GET /',
            login: 'POST /api/login',
            health: 'GET /api/health'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// AI / walkers integration (simple JSON-backed mock of jac walkers)
const walkers = require('./app/walkers');
const ai = require('./app/ai');

// Attach topic affinity (upsert topic and edge)
app.post('/api/attach-topic', async (req, res) => {
    const { node_id, topic_name, score } = req.body;
    if (!node_id || !topic_name) return res.status(400).json({ success: false, message: 'node_id and topic_name required' });
    try {
        const out = await walkers.attachTopicAffinity({ node_id, topic_name, score });
        return res.json({ success: true, ...out });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'internal error' });
    }
});

// Join or create an interest group
app.post('/api/join-group', async (req, res) => {
    const { profile_jid, group_name } = req.body;
    if (!profile_jid || !group_name) return res.status(400).json({ success: false, message: 'profile_jid and group_name required' });
    try {
        const out = await walkers.joinInterestGroup({ profile_jid, group_name });
        return res.json({ success: true, ...out });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'internal error' });
    }
});

// Trigger update of topic trends
app.post('/api/update-trends', async (req, res) => {
    try {
        const out = await walkers.updateTopicTrends(req.body || {});
        return res.json({ success: true, ...out });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'internal error' });
    }
});

// Get top trending topics
app.get('/api/trending', async (req, res) => {
    try {
        const top = Number(req.query.top || 10);
        const out = await walkers.getTrendingTopics({ top });
        return res.json({ success: true, trending: out });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'internal error' });
    }
});

// AI endpoints (mock LLM behaviors)
app.post('/api/ai/hype', async (req, res) => {
    try {
        const body = req.body || {};
        const out = await ai.generateHype(body);
        console.log('AI /hype out ->', out);
        return res.json({ success: true, ...out });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'internal error' });
    }
});

app.post('/api/ai/summarize', async (req, res) => {
    try {
        const { messages } = req.body || {};
        const out = await ai.summarizeThread({ messages });
        console.log('AI /summarize out ->', out);
        return res.json({ success: true, ...out });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'internal error' });
    }
});

app.get('/api/ai/recommendations', async (req, res) => {
    try {
        const profile = req.query.profile_jid;
        const out = await ai.recommendCommunities({ profile_jid: profile });
        console.log('AI /recommendations out ->', out);
        return res.json({ success: true, ...out });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'internal error' });
    }
});

app.get('/api/ai/analytics', async (req, res) => {
    try {
        const out = await ai.getAnalytics();
        console.log('AI /analytics out ->', out);
        return res.json({ success: true, analytics: out });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'internal error' });
    }
});

// Login endpoint (FIXES YOUR 404 ERROR)
app.post('/api/login', (req, res) => {
    console.log('Login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }
    
    // Mock authentication (replace with database later)
    if (email === 'hargreavesgito@gmail.com' && password === 'correct123') {
        return res.json({
            success: true,
            message: 'Login successful!',
            user: {
                id: 'user_001',
                email: email,
                name: 'Hargreaves Gito',
                token: 'mock_jwt_token_here'
            }
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
const appServer = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Test endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/`);
    console.log(`   POST http://localhost:${PORT}/api/login`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
});

// Handle server errors
app.on('error', (error) => {
    console.error('❌ Server error:', error);
});
// WebSocket real-time layer (simple rooms)
try {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server: appServer });
    const rooms = new Map(); // room -> Set(ws)

    wss.on('connection', (ws, req) => {
        ws.on('message', msg => {
            try {
                const data = JSON.parse(msg.toString());
                if (data.type === 'join' && data.room) {
                    const set = rooms.get(data.room) || new Set();
                    set.add(ws);
                    rooms.set(data.room, set);
                    ws.room = data.room;
                }

                if (data.type === 'message' && ws.room) {
                    const set = rooms.get(ws.room) || new Set();
                    for (const client of set) {
                        if (client !== ws && client.readyState === WebSocket.OPEN) client.send(JSON.stringify({ type: 'message', room: ws.room, payload: data.payload }));
                    }
                }
            } catch (e) {
                console.error('ws parse error', e);
            }
        });

        ws.on('close', () => {
            if (ws.room) {
                const set = rooms.get(ws.room);
                if (set) {
                    set.delete(ws);
                    if (set.size === 0) rooms.delete(ws.room);
                }
            }
        });
    });

    console.log('✅ WebSocket server started');
} catch (e) {
    console.warn('WebSocket support not available:', e.message);
}