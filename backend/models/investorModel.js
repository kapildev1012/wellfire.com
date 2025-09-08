import mongoose from "mongoose";

const investorSchema = new mongoose.Schema({
    // Investor Details with enhanced validation
    investorName: { 
        type: String, 
        required: [true, 'Investor name is required'], 
        trim: true,
        minlength: [2, 'Investor name must be at least 2 characters'],
        maxlength: [100, 'Investor name cannot exceed 100 characters'],
        index: true
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        index: true
    },
    phone: { 
        type: String, 
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[+]?[0-9]{10,15}$/, 'Please provide a valid phone number'],
        index: true
    },
    address: {
        street: { 
            type: String, 
            trim: true,
            maxlength: [200, 'Street address cannot exceed 200 characters']
        },
        city: { 
            type: String, 
            trim: true,
            maxlength: [50, 'City name cannot exceed 50 characters'],
            index: true
        },
        state: { 
            type: String, 
            trim: true,
            maxlength: [50, 'State name cannot exceed 50 characters'],
            index: true
        },
        pincode: { 
            type: String, 
            trim: true,
            match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
        },
        country: { 
            type: String, 
            default: "India",
            trim: true,
            maxlength: [50, 'Country name cannot exceed 50 characters']
        }
    },

    // Investment Details with enhanced validation
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InvestmentProduct",
        required: [true, 'Product ID is required'],
        index: true
    },
    investmentAmount: { 
        type: Number, 
        required: [true, 'Investment amount is required'], 
        min: [100, 'Minimum investment amount is ₹100'],
        max: [10000000, 'Maximum investment amount is ₹1 crore'],
        validate: {
            validator: function(value) {
                return Number.isInteger(value) || (value * 100) % 1 === 0;
            },
            message: 'Investment amount can have maximum 2 decimal places'
        }
    },

    // Payment Details with enhanced validation
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: {
            values: ["UPI", "Card", "NetBanking", "Wallet", "Bank Transfer", "Cash"],
            message: 'Payment method must be one of: UPI, Card, NetBanking, Wallet, Bank Transfer, Cash'
        },
        index: true
    },
    paymentStatus: {
        type: String,
        default: "pending",
        enum: {
            values: ["pending", "processing", "completed", "failed", "refunded", "cancelled"],
            message: 'Payment status must be: pending, processing, completed, failed, refunded, or cancelled'
        },
        index: true
    },
    transactionId: { 
        type: String, 
        default: "",
        trim: true,
        maxlength: 100
    },
    paymentDate: { 
        type: Date,
        validate: {
            validator: function(value) {
                return !value || value <= new Date();
            },
            message: 'Payment date cannot be in the future'
        }
    },
    paymentGateway: {
        type: String,
        trim: true,
        maxlength: [50, 'Payment gateway name cannot exceed 50 characters']
    },
    gatewayTransactionId: {
        type: String,
        trim: true,
        maxlength: [100, 'Gateway transaction ID cannot exceed 100 characters']
    },

    // Investment Terms
    expectedReturns: { 
        type: Number, 
        default: 0,
        min: [0, 'Expected returns cannot be negative'],
        max: [1000, 'Expected returns cannot exceed 1000%']
    },
    investmentDuration: { 
        type: String, 
        default: "",
        trim: true,
        maxlength: [50, 'Investment duration cannot exceed 50 characters']
    },
    maturityDate: {
        type: Date,
        validate: {
            validator: function(value) {
                return !value || value > new Date();
            },
            message: 'Maturity date must be in the future'
        }
    },

    // Status & Tracking
    investmentStatus: {
        type: String,
        default: "active",
        enum: {
            values: ["active", "matured", "cancelled", "withdrawn", "suspended"],
            message: 'Investment status must be: active, matured, cancelled, withdrawn, or suspended'
        },
        index: true
    },

    // KYC and Compliance
    kycStatus: {
        type: String,
        default: "pending",
        enum: ["pending", "submitted", "verified", "rejected"],
        index: true
    },
    kycDocuments: [{
        type: { type: String, enum: ["PAN", "Aadhaar", "Passport", "Driving License", "Other"] },
        documentNumber: String,
        documentUrl: String,
        verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" }
    }],

    // Risk Assessment
    riskProfile: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    investorType: {
        type: String,
        enum: ["individual", "corporate", "institutional"],
        default: "individual",
        index: true
    },

    // Communication Preferences
    communicationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false },
        phone: { type: Boolean, default: false }
    },

    // Metadata
    investmentDate: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    notes: { 
        type: String, 
        default: "",
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    referralCode: {
        type: String,
        trim: true,
        maxlength: [20, 'Referral code cannot exceed 20 characters']
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for investment age
investorSchema.virtual('investmentAge').get(function() {
    const now = new Date();
    const investmentDate = new Date(this.investmentDate);
    const diffTime = Math.abs(now - investmentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Virtual for full address
investorSchema.virtual('fullAddress').get(function() {
    const addr = this.address;
    const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);
    return parts.join(', ');
});

// Virtual for investment status display
investorSchema.virtual('statusDisplay').get(function() {
    if (this.paymentStatus === 'completed' && this.investmentStatus === 'active') {
        return 'Active Investment';
    }
    if (this.paymentStatus === 'pending') {
        return 'Payment Pending';
    }
    if (this.paymentStatus === 'failed') {
        return 'Payment Failed';
    }
    return this.investmentStatus.charAt(0).toUpperCase() + this.investmentStatus.slice(1);
});

// Middleware for data validation and cleanup
investorSchema.pre('save', function(next) {
    // Auto-generate transaction ID if payment is completed and no ID exists
    if (this.paymentStatus === 'completed' && !this.transactionId) {
        this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    
    // Set payment date when status changes to completed
    if (this.paymentStatus === 'completed' && !this.paymentDate) {
        this.paymentDate = new Date();
    }
    
    // Validate investment amount against product minimum
    if (this.isModified('investmentAmount') || this.isModified('productId')) {
        // This validation will be handled in the controller with product data
    }
    
    next();
});

// Compound indexes for optimal query performance
investorSchema.index({ productId: 1, paymentStatus: 1 });
investorSchema.index({ email: 1, productId: 1 });
investorSchema.index({ paymentStatus: 1, investmentDate: -1 });
investorSchema.index({ investmentStatus: 1, paymentStatus: 1 });
investorSchema.index({ investorType: 1, investmentAmount: -1 });
investorSchema.index({ kycStatus: 1, investmentDate: -1 });
investorSchema.index({ 'address.city': 1, 'address.state': 1 });
investorSchema.index({ createdAt: -1, paymentStatus: 1 });
investorSchema.index({ transactionId: 1 }, { sparse: true });

// Text index for search functionality
investorSchema.index({ 
    investorName: 'text', 
    email: 'text', 
    phone: 'text',
    transactionId: 'text'
});

// Static methods for common queries
investorSchema.statics.findByProduct = function(productId) {
    return this.find({ productId, paymentStatus: 'completed' });
};

investorSchema.statics.findActiveInvestments = function() {
    return this.find({ 
        paymentStatus: 'completed', 
        investmentStatus: 'active' 
    });
};

investorSchema.statics.findPendingPayments = function() {
    return this.find({ paymentStatus: 'pending' })
        .sort({ createdAt: -1 });
};

investorSchema.statics.findByEmail = function(email) {
    return this.find({ email: email.toLowerCase() });
};

investorSchema.statics.getInvestmentStats = function(productId) {
    return this.aggregate([
        { $match: { productId: mongoose.Types.ObjectId(productId), paymentStatus: 'completed' } },
        {
            $group: {
                _id: null,
                totalInvestors: { $sum: 1 },
                totalAmount: { $sum: '$investmentAmount' },
                averageInvestment: { $avg: '$investmentAmount' },
                minInvestment: { $min: '$investmentAmount' },
                maxInvestment: { $max: '$investmentAmount' }
            }
        }
    ]);
};

investorSchema.statics.searchInvestors = function(query, options = {}) {
    const {
        productId,
        paymentStatus,
        investmentStatus,
        city,
        state,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = options;
    
    let filter = {};
    
    if (query) {
        filter.$text = { $search: query };
    }
    
    if (productId) filter.productId = productId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (investmentStatus) filter.investmentStatus = investmentStatus;
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (state) filter['address.state'] = new RegExp(state, 'i');
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    return this.find(filter)
        .populate('productId', 'productTitle category totalBudget')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
};

// Instance methods
investorSchema.methods.updatePaymentStatus = function(status, transactionId, gatewayId) {
    this.paymentStatus = status;
    if (transactionId) this.transactionId = transactionId;
    if (gatewayId) this.gatewayTransactionId = gatewayId;
    if (status === 'completed') this.paymentDate = new Date();
    return this.save();
};

investorSchema.methods.updateKYC = function(status, documents) {
    this.kycStatus = status;
    if (documents) this.kycDocuments = documents;
    return this.save();
};

investorSchema.methods.calculateReturns = function() {
    if (this.expectedReturns && this.investmentAmount) {
        return (this.investmentAmount * this.expectedReturns) / 100;
    }
    return 0;
};

const Investor = mongoose.models.Investor || mongoose.model("Investor", investorSchema);

export default Investor;