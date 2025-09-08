// backend/server-optimized.js - Optimized server configuration
import cors from "cors";
import "dotenv/config";
import express from "express";
import connectCloudinary from "./config/cloudinary.js";
import connectDB from "./config/mongodb.js";

// Import optimized middleware
import {
    compressionMiddleware,
    securityMiddleware,
    requestLogger,
    errorHandler,
    generalRateLimit
} from "./middleware/performance.js";

// Import optimized routes
import optimizedInvestmentRouter from "./routes/optimizedInvestmentRoute.js";

// Import existing routes
import investmentProductRouter from "./routes/investmentProductRoute.js";
import investorRouter from "./routes/investorRoute.js";
import userRouter from "./routes/userRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Connect to database and cloud services
connectDB();
connectCloudinary();

// Security middleware (should be first)
app.use(securityMiddleware);

// Compression middleware
app.use(compressionMiddleware);

// Request logging
app.use(requestLogger);

// Body parsing middleware with size limits
app.use(express.json({ 
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '50mb',
    parameterLimit: 50000
}));

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174", 
            "http://localhost:5175",
            "http://localhost:5176",
            "http://localhost:3000",
            "https://kapildev1012wellfire.com",
            "https://wellfire.netlify.app",
            process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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

// API status endpoint
app.get("/", generalRateLimit, (req, res) => {
    res.json({
        success: true,
        message: "🚀 Wellfire Investment Platform API",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        endpoints: {
            optimized: {
                products: "/api/v2/investment-product",
                search: "/api/v2/investment-product/search",
                analytics: "/api/v2/investment-product/analytics"
            },
            legacy: {
                products: "/api/investment-product",
                investors: "/api/investor",
                users: "/api/user"
            }
        },
        features: [
            "Advanced caching",
            "Rate limiting",
            "Compression",
            "Security headers",
            "Performance monitoring",
            "Optimized database queries"
        ]
    });
});

// API Routes
// Optimized routes (v2)
app.use("/api/v2/investment-product", optimizedInvestmentRouter);

// Legacy routes (v1) - for backward compatibility
app.use("/api/investment-product", investmentProductRouter);
app.use("/api/investor", investorRouter);
app.use("/api/user", userRouter);

// API documentation endpoint
app.get("/api/docs", (req, res) => {
    res.json({
        success: true,
        documentation: {
            version: "2.0.0",
            baseUrl: `http://localhost:${port}`,
            endpoints: {
                "GET /api/v2/investment-product/list": {
                    description: "List investment products with advanced filtering",
                    parameters: {
                        category: "Filter by category",
                        status: "Filter by status",
                        featured: "Filter featured products",
                        page: "Page number (default: 1)",
                        limit: "Items per page (default: 12)",
                        search: "Search query",
                        minBudget: "Minimum budget filter",
                        maxBudget: "Maximum budget filter"
                    },
                    cache: "5 minutes"
                },
                "GET /api/v2/investment-product/search": {
                    description: "Full-text search with filters",
                    parameters: {
                        q: "Search query (required, min 2 chars)",
                        category: "Filter by category",
                        minBudget: "Minimum budget",
                        maxBudget: "Maximum budget",
                        page: "Page number",
                        limit: "Items per page"
                    },
                    cache: "2 minutes"
                },
                "GET /api/v2/investment-product/analytics": {
                    description: "Get funding analytics and statistics",
                    cache: "5 minutes"
                },
                "GET /api/v2/investment-product/:id": {
                    description: "Get single product with investor data",
                    cache: "2 minutes"
                },
                "POST /api/v2/investment-product/add": {
                    description: "Add new investment product (admin only)",
                    rateLimit: "10 requests per hour",
                    fileUpload: "Multiple file types supported"
                }
            },
            rateLimit: {
                general: "100 requests per 15 minutes",
                strict: "20 requests per 15 minutes", 
                upload: "10 requests per hour"
            }
        }
    });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
        suggestion: "Check /api/docs for available endpoints",
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
    
    server.close((err) => {
        if (err) {
            console.error('❌ Error during server shutdown:', err);
            process.exit(1);
        }
        
        console.log('✅ HTTP server closed');
        
        // Close database connection
        import('mongoose').then(mongoose => {
            mongoose.connection.close(() => {
                console.log('✅ Database connection closed');
                process.exit(0);
            });
        });
    });
    
    // Force close after 30 seconds
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
};

// Start server with enhanced error handling
const server = app.listen(port, () => {
    console.log(`
🚀 Wellfire Investment Platform Server Started
📍 Port: ${port}
🌐 URL: http://localhost:${port}
📊 Health: http://localhost:${port}/health
📖 Docs: http://localhost:${port}/api/docs
🔧 Environment: ${process.env.NODE_ENV || 'development'}
⚡ Features: Caching, Rate Limiting, Compression, Security
    `);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        console.error('💡 Try: lsof -ti:4000 | xargs kill -9');
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
        process.exit(1);
    }
});

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;
