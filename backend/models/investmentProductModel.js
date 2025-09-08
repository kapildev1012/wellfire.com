// backend/models/investmentProductModel.js
import mongoose from "mongoose";

const investmentProductSchema = new mongoose.Schema({
    productTitle: { 
        type: String, 
        required: [true, 'Product title is required'], 
        trim: true,
        maxlength: [200, 'Product title cannot exceed 200 characters'],
        index: true // Index for search
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    artistName: { 
        type: String, 
        required: [true, 'Artist name is required'],
        trim: true,
        maxlength: [100, 'Artist name cannot exceed 100 characters'],
        index: true // Index for search
    },
    producerName: { 
        type: String, 
        default: "",
        trim: true,
        maxlength: [100, 'Producer name cannot exceed 100 characters']
    },
    labelName: { 
        type: String, 
        default: "",
        trim: true,
        maxlength: [100, 'Label name cannot exceed 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ["Music", "Film", "Commercial", "Upcoming Projects", "Documentary", "Web Series", "Other"],
            message: 'Category must be one of: Music, Film, Commercial, Upcoming Projects, Documentary, Web Series, Other'
        },
        index: true // Index for filtering
    },
    genre: {
        type: String,
        default: "Other",
        enum: {
            values: ["Pop", "Rock", "Classical", "Jazz", "Hip-Hop", "Electronic", "Folk", "Country", "R&B", "Indie", "Other"],
            message: 'Genre must be a valid music/film genre'
        },
        index: true // Index for filtering
    },

    // Financial Details with validation
    totalBudget: { 
        type: Number, 
        required: [true, 'Total budget is required'], 
        min: [1000, 'Total budget must be at least ₹1,000'],
        max: [100000000, 'Total budget cannot exceed ₹10 crores']
    },
    currentFunding: { 
        type: Number, 
        default: 0, 
        min: [0, 'Current funding cannot be negative'],
        validate: {
            validator: function(value) {
                return value <= this.totalBudget;
            },
            message: 'Current funding cannot exceed total budget'
        }
    },
    minimumInvestment: { 
        type: Number, 
        required: [true, 'Minimum investment is required'], 
        min: [100, 'Minimum investment must be at least ₹100'],
        validate: {
            validator: function(value) {
                return value <= this.totalBudget;
            },
            message: 'Minimum investment cannot exceed total budget'
        }
    },
    totalInvestors: { 
        type: Number, 
        default: 0, 
        min: [0, 'Total investors cannot be negative']
    },
    fundingDeadline: { 
        type: Date,
        validate: {
            validator: function(value) {
                return !value || value > new Date();
            },
            message: 'Funding deadline must be in the future'
        }
    },
    fundingStatus: {
        type: String,
        default: "active",
        enum: {
            values: ["active", "paused", "completed", "cancelled"],
            message: 'Funding status must be: active, paused, completed, or cancelled'
        },
        index: true // Index for filtering
    },

    // Media Assets with validation
    coverImage: { 
        type: String, 
        default: "",
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Cover image must be a valid URL'
        }
    },
    albumArt: { 
        type: String, 
        default: "",
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Album art must be a valid URL'
        }
    },
    posterImage: { 
        type: String, 
        default: "",
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Poster image must be a valid URL'
        }
    },
    galleryImages: [{ 
        type: String,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Gallery images must be valid URLs'
        }
    }],

    // Video Assets
    videoThumbnail: { 
        type: String, 
        default: "",
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Video thumbnail must be a valid URL'
        }
    },
    videoFile: { 
        type: String, 
        default: "",
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Video file must be a valid URL'
        }
    },
    youtubeLink: { 
        type: String, 
        default: "",
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/.test(v);
            },
            message: 'YouTube link must be a valid YouTube URL'
        }
    },

    // Audio Assets
    demoTrack: { 
        type: String, 
        default: "",
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Demo track must be a valid URL'
        }
    },
    fullTrack: { 
        type: String, 
        default: "",
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Full track must be a valid URL'
        }
    },

    // Project Details
    expectedDuration: { 
        type: String, 
        default: "",
        maxlength: [50, 'Expected duration cannot exceed 50 characters']
    },
    productStatus: {
        type: String,
        default: "funding",
        enum: {
            values: ["funding", "in-production", "completed", "cancelled"],
            message: 'Product status must be: funding, in-production, completed, or cancelled'
        },
        index: true // Index for filtering
    },
    targetAudience: [{ 
        type: String,
        maxlength: [50, 'Target audience item cannot exceed 50 characters']
    }],

    // Admin Controls
    isFeatured: { 
        type: Boolean, 
        default: false,
        index: true // Index for filtering featured products
    },
    isActive: { 
        type: Boolean, 
        default: true,
        index: true // Index for filtering active products
    },

    // SEO and Search
    slug: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],

    // Analytics
    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    // Optimize for read operations
    read: 'secondaryPreferred'
});

// Virtual for funding percentage
investmentProductSchema.virtual('fundingPercentage').get(function() {
    if (this.totalBudget <= 0) return 0;
    return Math.min((this.currentFunding / this.totalBudget) * 100, 100);
});

// Virtual for remaining amount
investmentProductSchema.virtual('remainingAmount').get(function() {
    return Math.max(this.totalBudget - this.currentFunding, 0);
});

// Virtual for funding status text
investmentProductSchema.virtual('fundingStatusText').get(function() {
    const percentage = this.fundingPercentage;
    if (percentage >= 100) return 'Fully Funded';
    if (percentage >= 75) return 'Almost There';
    if (percentage >= 50) return 'Half Way';
    if (percentage >= 25) return 'Getting Started';
    return 'Just Started';
});

// Virtual for time remaining
investmentProductSchema.virtual('timeRemaining').get(function() {
    if (!this.fundingDeadline) return null;
    const now = new Date();
    const deadline = new Date(this.fundingDeadline);
    const diff = deadline - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days left`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hours left`;
});

// Middleware for slug generation and validation
investmentProductSchema.pre('save', function(next) {
    // Update timestamp
    this.updatedAt = Date.now();
    
    // Generate slug if not provided
    if (!this.slug && this.productTitle) {
        this.slug = this.productTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100);
    }
    
    // Validate funding logic
    if (this.currentFunding > this.totalBudget) {
        return next(new Error('Current funding cannot exceed total budget'));
    }
    
    if (this.minimumInvestment > this.totalBudget) {
        return next(new Error('Minimum investment cannot exceed total budget'));
    }
    
    next();
});

// Middleware for updating related data
investmentProductSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

// Post middleware for cleanup
investmentProductSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        // Clean up related investor data when product is deleted
        const Investor = mongoose.model('Investor');
        await Investor.deleteMany({ productId: doc._id });
    }
});

// Compound indexes for better query performance
investmentProductSchema.index({ category: 1, productStatus: 1 });
investmentProductSchema.index({ isFeatured: 1, isActive: 1 });
investmentProductSchema.index({ fundingStatus: 1, fundingDeadline: 1 });
investmentProductSchema.index({ createdAt: -1, isActive: 1 });
investmentProductSchema.index({ currentFunding: -1, totalBudget: 1 });
investmentProductSchema.index({ artistName: 'text', productTitle: 'text', description: 'text' });

// Static methods for common queries
investmentProductSchema.statics.findActive = function() {
    return this.find({ isActive: true });
};

investmentProductSchema.statics.findFeatured = function() {
    return this.find({ isFeatured: true, isActive: true });
};

investmentProductSchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true });
};

investmentProductSchema.statics.findFunding = function() {
    return this.find({ 
        productStatus: 'funding', 
        isActive: true,
        $expr: { $lt: ['$currentFunding', '$totalBudget'] }
    });
};

investmentProductSchema.statics.searchProducts = function(query, options = {}) {
    const {
        category,
        minBudget,
        maxBudget,
        status,
        featured,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = options;
    
    let filter = { isActive: true };
    
    if (query) {
        filter.$text = { $search: query };
    }
    
    if (category) filter.category = category;
    if (status) filter.productStatus = status;
    if (featured !== undefined) filter.isFeatured = featured;
    
    if (minBudget || maxBudget) {
        filter.totalBudget = {};
        if (minBudget) filter.totalBudget.$gte = minBudget;
        if (maxBudget) filter.totalBudget.$lte = maxBudget;
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    return this.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(); // Use lean() for better performance on read operations
};

// Instance methods
investmentProductSchema.methods.incrementView = function() {
    this.viewCount += 1;
    return this.save();
};

investmentProductSchema.methods.incrementShare = function() {
    this.shareCount += 1;
    return this.save();
};

investmentProductSchema.methods.updateFunding = function(amount, investorCount = 1) {
    this.currentFunding += amount;
    this.totalInvestors += investorCount;
    return this.save();
};

const InvestmentProduct = mongoose.models.InvestmentProduct ||
    mongoose.model("InvestmentProduct", investmentProductSchema);

export default InvestmentProduct;