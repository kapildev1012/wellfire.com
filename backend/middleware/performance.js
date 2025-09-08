// backend/middleware/performance.js
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import helmet from 'helmet';

// Rate limiting configuration
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            message: 'Too many requests from this IP, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// Different rate limits for different endpoints
export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const strictRateLimit = createRateLimit(15 * 60 * 1000, 20);   // 20 requests per 15 minutes
export const uploadRateLimit = createRateLimit(60 * 60 * 1000, 10);   // 10 uploads per hour

// Compression middleware
export const compressionMiddleware = compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
});

// Security middleware
export const securityMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.cloudinary.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };
        
        if (duration > 1000) {
            console.warn('🐌 Slow request:', logData);
        } else {
            console.log('📝 Request:', logData);
        }
    });
    
    next();
};

// Error handling middleware
export const errorHandler = (error, req, res, next) => {
    console.error('🚨 Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors
        });
    }

    // Mongoose cast error
    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    // MongoDB duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large'
        });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            message: 'Too many files'
        });
    }

    // Default error
    res.status(error.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
};

// Cache control middleware
export const cacheControl = (maxAge = 300) => {
    return (req, res, next) => {
        if (req.method === 'GET') {
            res.set('Cache-Control', `public, max-age=${maxAge}`);
        }
        next();
    };
};

// No cache middleware for dynamic content
export const noCache = (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
};

// Request size limiter
export const requestSizeLimiter = (limit = '50mb') => {
    return (req, res, next) => {
        req.rawBody = '';
        req.setEncoding('utf8');
        
        req.on('data', (chunk) => {
            req.rawBody += chunk;
            if (req.rawBody.length > parseInt(limit)) {
                res.status(413).json({
                    success: false,
                    message: 'Request entity too large'
                });
                return;
            }
        });
        
        req.on('end', () => {
            next();
        });
    };
};
