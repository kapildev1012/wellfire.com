// backend/controllers/optimizedInvestmentController.js
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import InvestmentProduct from "../models/investmentProductModel.js";
import Investor from "../models/investorModel.js";
import NodeCache from "node-cache";

// Initialize cache with 10 minute TTL
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Helper function for cache keys
const getCacheKey = (prefix, ...params) => {
    return `${prefix}:${params.join(':')}`;
};

// Helper function for pagination
const getPaginationData = (page, limit, total) => ({
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    hasNext: page * limit < total,
    hasPrev: page > 1,
    limit: parseInt(limit)
});

// Optimized add investment product with transaction support
const addInvestmentProduct = async (req, res) => {
    const session = await InvestmentProduct.startSession();
    
    try {
        session.startTransaction();
        
        const {
            productTitle,
            description,
            artistName,
            producerName,
            labelName,
            category,
            genre,
            totalBudget,
            minimumInvestment,
            expectedDuration,
            productStatus,
            targetAudience,
            isFeatured,
            isActive,
            youtubeLink,
            tags
        } = req.body;

        // Enhanced validation
        const validationErrors = [];
        
        if (!productTitle?.trim()) validationErrors.push('Product title is required');
        if (!description?.trim()) validationErrors.push('Description is required');
        if (!artistName?.trim()) validationErrors.push('Artist name is required');
        if (!totalBudget || totalBudget < 1000) validationErrors.push('Total budget must be at least ₹1,000');
        if (!minimumInvestment || minimumInvestment < 100) validationErrors.push('Minimum investment must be at least ₹100');
        if (minimumInvestment > totalBudget) validationErrors.push('Minimum investment cannot exceed total budget');

        if (validationErrors.length > 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Check for duplicate product title
        const existingProduct = await InvestmentProduct.findOne({ 
            productTitle: productTitle.trim(),
            isActive: true 
        }).session(session);

        if (existingProduct) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'A product with this title already exists'
            });
        }

        // Handle file uploads with error handling
        const uploadResults = {};
        const uploadPromises = [];

        try {
            // Process image uploads
            const imageFields = ["coverImage", "albumArt", "posterImage", "videoThumbnail"];
            
            for (const field of imageFields) {
                if (req.files?.[field]) {
                    const file = Array.isArray(req.files[field]) ? req.files[field][0] : req.files[field];
                    if (file.path) {
                        uploadPromises.push(
                            cloudinary.uploader.upload(file.path, {
                                resource_type: "image",
                                folder: "investment-products/images",
                                transformation: [
                                    { width: 1200, height: 800, crop: "limit" },
                                    { quality: "auto" },
                                    { format: "auto" }
                                ]
                            }).then(result => ({ field, url: result.secure_url }))
                        );
                    }
                }
            }

            // Process gallery images
            if (req.files?.galleryImages) {
                const galleryFiles = Array.isArray(req.files.galleryImages) ? 
                    req.files.galleryImages : [req.files.galleryImages];
                
                for (const file of galleryFiles.slice(0, 10)) { // Limit to 10 images
                    if (file.path) {
                        uploadPromises.push(
                            cloudinary.uploader.upload(file.path, {
                                resource_type: "image",
                                folder: "investment-products/gallery",
                                transformation: [
                                    { width: 800, height: 600, crop: "limit" },
                                    { quality: "auto" }
                                ]
                            }).then(result => ({ field: 'galleryImages', url: result.secure_url }))
                        );
                    }
                }
            }

            // Process video upload
            if (req.files?.videoFile) {
                const videoFile = Array.isArray(req.files.videoFile) ? 
                    req.files.videoFile[0] : req.files.videoFile;
                
                if (videoFile.path) {
                    uploadPromises.push(
                        cloudinary.uploader.upload(videoFile.path, {
                            resource_type: "video",
                            folder: "investment-products/videos",
                            transformation: [
                                { quality: "auto" },
                                { format: "mp4" }
                            ]
                        }).then(result => ({ field: 'videoFile', url: result.secure_url }))
                    );
                }
            }

            // Process audio uploads
            const audioFields = ["demoTrack", "fullTrack"];
            for (const field of audioFields) {
                if (req.files?.[field]) {
                    const audioFile = Array.isArray(req.files[field]) ? 
                        req.files[field][0] : req.files[field];
                    
                    if (audioFile.path) {
                        uploadPromises.push(
                            cloudinary.uploader.upload(audioFile.path, {
                                resource_type: "video", // Cloudinary uses video for audio
                                folder: "investment-products/audio"
                            }).then(result => ({ field, url: result.secure_url }))
                        );
                    }
                }
            }

            // Wait for all uploads to complete
            const uploadResults_array = await Promise.all(uploadPromises);
            
            // Process upload results
            const galleryUrls = [];
            uploadResults_array.forEach(result => {
                if (result.field === 'galleryImages') {
                    galleryUrls.push(result.url);
                } else {
                    uploadResults[result.field] = result.url;
                }
            });
            
            if (galleryUrls.length > 0) {
                uploadResults.galleryImages = galleryUrls;
            }

        } catch (uploadError) {
            await session.abortTransaction();
            console.error("File upload error:", uploadError);
            return res.status(500).json({
                success: false,
                message: "File upload failed: " + uploadError.message
            });
        }

        // Parse and validate data
        let parsedAudience = [];
        if (targetAudience) {
            try {
                parsedAudience = typeof targetAudience === "string" ? 
                    JSON.parse(targetAudience) : targetAudience;
            } catch (error) {
                parsedAudience = [];
            }
        }

        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === "string" ? 
                    JSON.parse(tags) : tags;
                parsedTags = parsedTags.slice(0, 10); // Limit to 10 tags
            } catch (error) {
                parsedTags = [];
            }
        }

        // Create product data
        const productData = {
            productTitle: productTitle.trim(),
            description: description.trim(),
            artistName: artistName.trim(),
            producerName: producerName?.trim() || "",
            labelName: labelName?.trim() || "",
            category: category || "Other",
            genre: genre || "Other",
            totalBudget: Number(totalBudget),
            minimumInvestment: Number(minimumInvestment),
            expectedDuration: expectedDuration?.trim() || "",
            productStatus: productStatus || "funding",
            targetAudience: parsedAudience,
            isFeatured: isFeatured === "true" || isFeatured === true,
            isActive: isActive !== "false" && isActive !== false,
            youtubeLink: youtubeLink?.trim() || "",
            tags: parsedTags,
            ...uploadResults
        };

        // Create and save product
        const product = new InvestmentProduct(productData);
        const savedProduct = await product.save({ session });

        await session.commitTransaction();

        // Clear relevant caches
        cache.flushAll();

        res.status(201).json({
            success: true,
            message: "Investment product created successfully",
            product: savedProduct
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Add investment product error:", error);
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Product with this title already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    } finally {
        await session.endSession();
    }
};

// Optimized list with caching and aggregation
const listInvestmentProducts = async (req, res) => {
    try {
        const {
            category,
            status,
            featured,
            active = "true",
            page = 1,
            limit = 12,
            sortBy = "createdAt",
            sortOrder = "desc",
            search,
            minBudget,
            maxBudget
        } = req.query;

        // Create cache key
        const cacheKey = getCacheKey('products', category, status, featured, active, 
            page, limit, sortBy, sortOrder, search, minBudget, maxBudget);
        
        // Check cache first
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            return res.json({
                success: true,
                ...cachedResult,
                cached: true
            });
        }

        // Build aggregation pipeline for better performance
        const pipeline = [];

        // Match stage
        const matchStage = { isActive: active === "true" };
        if (category) matchStage.category = category;
        if (status) matchStage.productStatus = status;
        if (featured !== undefined) matchStage.isFeatured = featured === "true";
        
        if (minBudget || maxBudget) {
            matchStage.totalBudget = {};
            if (minBudget) matchStage.totalBudget.$gte = parseInt(minBudget);
            if (maxBudget) matchStage.totalBudget.$lte = parseInt(maxBudget);
        }

        if (search) {
            matchStage.$text = { $search: search };
        }

        pipeline.push({ $match: matchStage });

        // Add funding stats using lookup
        pipeline.push({
            $lookup: {
                from: "investors",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$productId", "$$productId"] },
                                    { $eq: ["$paymentStatus", "completed"] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalInvestors: { $sum: 1 },
                            totalAmount: { $sum: "$investmentAmount" }
                        }
                    }
                ],
                as: "investmentStats"
            }
        });

        // Add computed fields
        pipeline.push({
            $addFields: {
                totalInvestors: {
                    $ifNull: [{ $arrayElemAt: ["$investmentStats.totalInvestors", 0] }, 0]
                },
                actualFunding: {
                    $ifNull: [{ $arrayElemAt: ["$investmentStats.totalAmount", 0] }, 0]
                },
                fundingPercentage: {
                    $multiply: [
                        {
                            $divide: [
                                { $ifNull: [{ $arrayElemAt: ["$investmentStats.totalAmount", 0] }, 0] },
                                "$totalBudget"
                            ]
                        },
                        100
                    ]
                }
            }
        });

        // Sort stage
        const sortStage = {};
        sortStage[sortBy] = sortOrder === "desc" ? -1 : 1;
        pipeline.push({ $sort: sortStage });

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });

        // Project only necessary fields for list view
        pipeline.push({
            $project: {
                _id: 1,
                productTitle: 1,
                artistName: 1,
                category: 1,
                genre: 1,
                totalBudget: 1,
                currentFunding: 1,
                minimumInvestment: 1,
                fundingDeadline: 1,
                productStatus: 1,
                fundingStatus: 1,
                isFeatured: 1,
                isActive: 1,
                slug: 1,
                createdAt: 1,
                updatedAt: 1,
                youtubeLink: 1,
                tags: 1,
                galleryImages: { $slice: ["$galleryImages", 3] },
                description: { $substr: ["$description", 0, 200] },
                targetAudience: { $slice: ["$targetAudience", 5] },
                fundingPercentage: {
                    $cond: {
                        if: { $gt: ["$totalBudget", 0] },
                        then: { $multiply: [{ $divide: ["$currentFunding", "$totalBudget"] }, 100] },
                        else: 0
                    }
                }
            }
        });

        // Execute aggregation
        const [products, totalCount] = await Promise.all([
            InvestmentProduct.aggregate(pipeline),
            InvestmentProduct.countDocuments(matchStage)
        ]);

        const result = {
            products,
            pagination: getPaginationData(page, limit, totalCount)
        };

        // Cache the result
        cache.set(cacheKey, result, 300); // Cache for 5 minutes

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error("List investment products error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Optimized single product fetch with investor data
const getInvestmentProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check cache first
        const cacheKey = getCacheKey('product', id);
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            return res.json({
                success: true,
                ...cachedResult,
                cached: true
            });
        }

        // Use aggregation for better performance
        const pipeline = [
            { $match: { _id: mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "investors",
                    let: { productId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$productId", "$$productId"] },
                                        { $eq: ["$paymentStatus", "completed"] }
                                    ]
                                }
                            }
                        },
                        {
                            $facet: {
                                stats: [
                                    {
                                        $group: {
                                            _id: null,
                                            totalInvestors: { $sum: 1 },
                                            totalAmount: { $sum: "$investmentAmount" },
                                            avgInvestment: { $avg: "$investmentAmount" },
                                            minInvestment: { $min: "$investmentAmount" },
                                            maxInvestment: { $max: "$investmentAmount" }
                                        }
                                    }
                                ],
                                recent: [
                                    { $sort: { investmentDate: -1 } },
                                    { $limit: 5 },
                                    {
                                        $project: {
                                            investorName: 1,
                                            investmentAmount: 1,
                                            investmentDate: 1
                                        }
                                    }
                                ]
                            }
                        }
                    ],
                    as: "investmentData"
                }
            },
            {
                $addFields: {
                    stats: { $arrayElemAt: ["$investmentData.stats", 0] },
                    recentInvestments: { $arrayElemAt: ["$investmentData.recent", 0] }
                }
            },
            {
                $project: {
                    _id: 1,
                    productTitle: 1,
                    description: 1,
                    artistName: 1,
                    category: 1,
                    genre: 1,
                    totalBudget: 1,
                    currentFunding: 1,
                    minimumInvestment: 1,
                    fundingDeadline: 1,
                    productStatus: 1,
                    fundingStatus: 1,
                    isFeatured: 1,
                    isActive: 1,
                    slug: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    youtubeLink: 1,
                    galleryImages: 1,
                    tags: 1,
                    targetAudience: 1,
                    expectedDuration: 1,
                    investors: 1
                }
            }
        ];

        const [product] = await InvestmentProduct.aggregate(pipeline);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Investment product not found"
            });
        }

        // Increment view count asynchronously
        InvestmentProduct.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();

        const result = { product };
        
        // Cache for 2 minutes
        cache.set(cacheKey, result, 120);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error("Get investment product error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Optimized analytics with caching
const getFundingAnalytics = async (req, res) => {
    try {
        const cacheKey = 'analytics:funding';
        const cachedResult = cache.get(cacheKey);
        
        if (cachedResult) {
            return res.json({
                success: true,
                analytics: cachedResult,
                cached: true
            });
        }

        // Use aggregation for better performance
        const analyticsPromises = [
            // Product stats
            InvestmentProduct.aggregate([
                {
                    $group: {
                        _id: null,
                        totalProducts: { $sum: 1 },
                        activeProducts: {
                            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                        },
                        fundingProducts: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ["$productStatus", "funding"] },
                                            { $eq: ["$isActive", true] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        completedProducts: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ["$productStatus", "completed"] },
                                            { $eq: ["$isActive", true] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        totalBudgetSum: { $sum: "$totalBudget" },
                        avgBudget: { $avg: "$totalBudget" }
                    }
                }
            ]),
            
            // Investment stats
            Investor.aggregate([
                { $match: { paymentStatus: "completed" } },
                {
                    $group: {
                        _id: null,
                        totalInvestments: { $sum: "$investmentAmount" },
                        totalInvestors: { $sum: 1 },
                        avgInvestment: { $avg: "$investmentAmount" }
                    }
                }
            ]),
            
            // Category distribution
            InvestmentProduct.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 },
                        totalBudget: { $sum: "$totalBudget" }
                    }
                },
                { $sort: { count: -1 } }
            ]),
            
            // Top funded projects
            InvestmentProduct.aggregate([
                { $match: { isActive: true } },
                {
                    $lookup: {
                        from: "investors",
                        let: { productId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$productId", "$$productId"] },
                                            { $eq: ["$paymentStatus", "completed"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalFunding: { $sum: "$investmentAmount" }
                                }
                            }
                        ],
                        as: "funding"
                    }
                },
                {
                    $addFields: {
                        actualFunding: { $ifNull: [{ $arrayElemAt: ["$funding.totalFunding", 0] }, 0] },
                        fundingPercentage: {
                            $multiply: [
                                {
                                    $divide: [
                                        { $ifNull: [{ $arrayElemAt: ["$funding.totalFunding", 0] }, 0] },
                                        "$totalBudget"
                                    ]
                                },
                                100
                            ]
                        }
                    }
                },
                {
                    $project: {
                        productTitle: 1,
                        category: 1,
                        totalBudget: 1,
                        actualFunding: 1,
                        fundingPercentage: 1
                    }
                },
                { $sort: { fundingPercentage: -1 } },
                { $limit: 10 }
            ])
        ];

        const [productStats, investmentStats, categoryStats, topFunded] = 
            await Promise.all(analyticsPromises);

        const analytics = {
            overview: {
                totalProducts: productStats[0]?.totalProducts || 0,
                activeProducts: productStats[0]?.activeProducts || 0,
                fundingProducts: productStats[0]?.fundingProducts || 0,
                completedProducts: productStats[0]?.completedProducts || 0,
                totalBudgetSum: productStats[0]?.totalBudgetSum || 0,
                avgBudget: productStats[0]?.avgBudget || 0
            },
            investments: {
                totalInvestments: investmentStats[0]?.totalInvestments || 0,
                totalInvestors: investmentStats[0]?.totalInvestors || 0,
                avgInvestment: investmentStats[0]?.avgInvestment || 0
            },
            categoryDistribution: categoryStats,
            topFundedProjects: topFunded
        };

        // Cache for 5 minutes
        cache.set(cacheKey, analytics, 300);

        res.json({
            success: true,
            analytics
        });

    } catch (error) {
        console.error("Get funding analytics error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Search with full-text search and filters
const searchProducts = async (req, res) => {
    try {
        const {
            q: query,
            category,
            minBudget,
            maxBudget,
            status,
            featured,
            page = 1,
            limit = 12,
            sortBy = 'relevance'
        } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters long"
            });
        }

        const cacheKey = getCacheKey('search', query, category, minBudget, maxBudget, 
            status, featured, page, limit, sortBy);
        
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            return res.json({
                success: true,
                ...cachedResult,
                cached: true
            });
        }

        const searchOptions = {
            category,
            minBudget: minBudget ? parseInt(minBudget) : undefined,
            maxBudget: maxBudget ? parseInt(maxBudget) : undefined,
            status,
            featured: featured === 'true',
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy: sortBy === 'relevance' ? 'score' : sortBy,
            sortOrder: sortBy === 'relevance' ? 'desc' : 'desc'
        };

        const products = await InvestmentProduct.searchProducts(query, searchOptions);
        const total = await InvestmentProduct.countDocuments({
            $text: { $search: query },
            isActive: true,
            ...(category && { category }),
            ...(status && { productStatus: status }),
            ...(featured !== undefined && { isFeatured: featured === 'true' }),
            ...((minBudget || maxBudget) && {
                totalBudget: {
                    ...(minBudget && { $gte: parseInt(minBudget) }),
                    ...(maxBudget && { $lte: parseInt(maxBudget) })
                }
            })
        });

        const result = {
            products,
            pagination: getPaginationData(page, limit, total),
            searchQuery: query
        };

        // Cache for 2 minutes
        cache.set(cacheKey, result, 120);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error("Search products error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Bulk operations for admin
const bulkUpdateProducts = async (req, res) => {
    try {
        const { productIds, updates } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Product IDs array is required"
            });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Updates object is required"
            });
        }

        // Validate update fields
        const allowedUpdates = ['isFeatured', 'isActive', 'productStatus', 'category'];
        const updateKeys = Object.keys(updates);
        const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));

        if (!isValidUpdate) {
            return res.status(400).json({
                success: false,
                message: `Only these fields can be bulk updated: ${allowedUpdates.join(', ')}`
            });
        }

        updates.updatedAt = new Date();

        const result = await InvestmentProduct.updateMany(
            { _id: { $in: productIds } },
            { $set: updates }
        );

        // Clear cache
        cache.flushAll();

        res.json({
            success: true,
            message: `${result.modifiedCount} products updated successfully`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("Bulk update products error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export {
    addInvestmentProduct,
    listInvestmentProducts,
    getInvestmentProduct,
    getFundingAnalytics,
    searchProducts,
    bulkUpdateProducts
};
