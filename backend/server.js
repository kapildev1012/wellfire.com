import cors from "cors";
import "dotenv/config";
import express from "express";
import fs from 'fs';
import path from 'path';
import multer from "multer";
import connectCloudinary from "./config/cloudinary.js";
import connectDB from "./config/mongodb.js";

// Routes
import investmentProductRouter from "./routes/investmentProductRoute.js";
import investorRouter from "./routes/investorRoute.js";
import userRouter from "./routes/userRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4000

// Connect to database and cloud services
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175", 
        "http://localhost:5176", 
        "http://localhost:3000",
        "http://localhost:4173",
        process.env.FRONTEND_URL || "http://localhost:5173"
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ Uploads directory created");
}

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "✅ Server is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
    });
});

// Root route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "✅ Wellfire Investment Platform API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: {
            health: "/health",
            products: "/api/investment-product",
            investors: "/api/investor",
            users: "/api/user"
        }
    });
});

// API Endpoints
app.use("/api/investment-product", investmentProductRouter);
app.use("/api/investor", investorRouter);
app.use("/api/user", userRouter);

// Enhanced error handling
app.use((error, req, res, next) => {
    console.error("Global error handler:", error);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: "File too large. Maximum size is 100MB per file.",
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: "Too many files uploaded. Maximum 15 files allowed.",
            });
        }
    }

    res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
});

// 404 handler
app.use("*", (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        availableRoutes: [
            "GET /",
            "GET /health",
            "GET /api/investment-product/list",
            "POST /api/investment-product/add",
            "GET /api/investment-product/:id",
            "POST /api/investor/add",
            "GET /api/investor/list",
            "POST /api/user/register",
            "POST /api/user/login"
        ]
    });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
    console.log(`\n🔄 Received ${signal}. Graceful shutdown...`);
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
};

// Start server with error handling
const server = app.listen(port, () => {
    console.log(`🚀 Investment Platform Server started on port ${port}`);
    console.log(`📍 Server URL: http://localhost:${port}`);
    console.log(`🌐 Test endpoint: http://localhost:${port}/api/investment-product/list`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        console.error('💡 Try running: lsof -ti:4000 | xargs kill -9');
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
        process.exit(1);
    }
});

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart