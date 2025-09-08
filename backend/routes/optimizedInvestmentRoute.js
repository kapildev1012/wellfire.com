// backend/routes/optimizedInvestmentRoute.js
import express from 'express';
import {
    addInvestmentProduct,
    listInvestmentProducts,
    getInvestmentProduct,
    getFundingAnalytics,
    searchProducts,
    bulkUpdateProducts
} from '../controllers/optimizedInvestmentController.js';
import { upload } from '../middleware/multer.js';
import { 
    generalRateLimit, 
    strictRateLimit, 
    uploadRateLimit,
    cacheControl,
    noCache 
} from '../middleware/performance.js';

const optimizedInvestmentRouter = express.Router();

// Public routes with caching
optimizedInvestmentRouter.get('/list', 
    generalRateLimit,
    cacheControl(300), // Cache for 5 minutes
    listInvestmentProducts
);

optimizedInvestmentRouter.get('/search', 
    generalRateLimit,
    cacheControl(120), // Cache for 2 minutes
    searchProducts
);

optimizedInvestmentRouter.get('/analytics', 
    strictRateLimit,
    cacheControl(300), // Cache for 5 minutes
    getFundingAnalytics
);

optimizedInvestmentRouter.get('/:id', 
    generalRateLimit,
    cacheControl(120), // Cache for 2 minutes
    getInvestmentProduct
);

// Admin routes with stricter rate limiting and no caching
optimizedInvestmentRouter.post('/add',
    uploadRateLimit,
    noCache,
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'albumArt', maxCount: 1 },
        { name: 'posterImage', maxCount: 1 },
        { name: 'videoThumbnail', maxCount: 1 },
        { name: 'galleryImages', maxCount: 10 },
        { name: 'videoFile', maxCount: 1 },
        { name: 'demoTrack', maxCount: 1 },
        { name: 'fullTrack', maxCount: 1 }
    ]),
    addInvestmentProduct
);

optimizedInvestmentRouter.patch('/bulk-update',
    strictRateLimit,
    noCache,
    bulkUpdateProducts
);

export default optimizedInvestmentRouter;
