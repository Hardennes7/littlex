// server.js - Simple Login Server
const express = require("express");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (allow frontend to connect)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Login Server is running!",
        endpoints: [
            "GET    /              - This message",
            "POST   /api/login     - Login endpoint",
            "GET    /api/health    - Health check"
        ]
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "login-api"
    });
});

// LOGIN ENDPOINT - This fixes your 404 error!
app.post("/api/login", (req, res) => {
    console.log(`[${new Date().toISOString()}] Login attempt from: ${req.ip}`);
    console.log(`Email: ${req.body.email}`);
    
    const { email, password } = req.body;
    
    // Simple validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }
    
    // Check credentials (in real app, check database)
    if (email === "hargreavesgito@gmail.com" && password === "correct123") {
        return res.json({
            success: true,
            message: "Login successful!",
            user: {
                email: email,
                name: "Hargreaves Gito",
                id: "user_001",
                token: "mock_jwt_token_here"
            }
        });
    } else {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }
});

// Handle 404 for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.url}`,
        suggestion: "Try POST /api/login for login"
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Login endpoint: POST http://localhost:${PORT}/api/login`);
    console.log(`✅ Test with: curl -X POST http://localhost:${PORT}/api/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}'`);
});

