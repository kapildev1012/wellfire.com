// backend/scripts/initializeDatabase.js
import mongoose from 'mongoose';
import 'dotenv/config';
import InvestmentProduct from '../models/investmentProductModel.js';
import Investor from '../models/investorModel.js';

const initializeDatabase = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('📊 Creating database indexes...');

        // Create indexes for InvestmentProduct
        await InvestmentProduct.collection.createIndexes([
            // Single field indexes
            { key: { productTitle: 1 }, name: 'productTitle_1' },
            { key: { artistName: 1 }, name: 'artistName_1' },
            { key: { category: 1 }, name: 'category_1' },
            { key: { genre: 1 }, name: 'genre_1' },
            { key: { productStatus: 1 }, name: 'productStatus_1' },
            { key: { fundingStatus: 1 }, name: 'fundingStatus_1' },
            { key: { isFeatured: 1 }, name: 'isFeatured_1' },
            { key: { isActive: 1 }, name: 'isActive_1' },
            { key: { createdAt: -1 }, name: 'createdAt_-1' },
            { key: { slug: 1 }, name: 'slug_1', unique: true, sparse: true },
            
            // Compound indexes for common queries
            { key: { category: 1, productStatus: 1 }, name: 'category_1_productStatus_1' },
            { key: { isFeatured: 1, isActive: 1 }, name: 'isFeatured_1_isActive_1' },
            { key: { fundingStatus: 1, fundingDeadline: 1 }, name: 'fundingStatus_1_fundingDeadline_1' },
            { key: { createdAt: -1, isActive: 1 }, name: 'createdAt_-1_isActive_1' },
            { key: { currentFunding: -1, totalBudget: 1 }, name: 'currentFunding_-1_totalBudget_1' },
            { key: { totalBudget: 1, minimumInvestment: 1 }, name: 'totalBudget_1_minimumInvestment_1' },
            
            // Text search index
            { 
                key: { 
                    artistName: 'text', 
                    productTitle: 'text', 
                    description: 'text',
                    tags: 'text'
                }, 
                name: 'text_search_index',
                weights: {
                    productTitle: 10,
                    artistName: 8,
                    tags: 5,
                    description: 1
                }
            }
        ]);

        // Create indexes for Investor
        await Investor.collection.createIndexes([
            // Single field indexes
            { key: { email: 1 }, name: 'email_1' },
            { key: { phone: 1 }, name: 'phone_1' },
            { key: { productId: 1 }, name: 'productId_1' },
            { key: { paymentStatus: 1 }, name: 'paymentStatus_1' },
            { key: { investmentStatus: 1 }, name: 'investmentStatus_1' },
            { key: { investorType: 1 }, name: 'investorType_1' },
            { key: { kycStatus: 1 }, name: 'kycStatus_1' },
            { key: { investmentDate: -1 }, name: 'investmentDate_-1' },
            { key: { createdAt: -1 }, name: 'createdAt_-1' },
            { key: { transactionId: 1 }, name: 'transactionId_1', sparse: true },
            { key: { 'address.city': 1 }, name: 'address.city_1' },
            { key: { 'address.state': 1 }, name: 'address.state_1' },
            
            // Compound indexes for common queries
            { key: { productId: 1, paymentStatus: 1 }, name: 'productId_1_paymentStatus_1' },
            { key: { email: 1, productId: 1 }, name: 'email_1_productId_1' },
            { key: { paymentStatus: 1, investmentDate: -1 }, name: 'paymentStatus_1_investmentDate_-1' },
            { key: { investmentStatus: 1, paymentStatus: 1 }, name: 'investmentStatus_1_paymentStatus_1' },
            { key: { investorType: 1, investmentAmount: -1 }, name: 'investorType_1_investmentAmount_-1' },
            { key: { kycStatus: 1, investmentDate: -1 }, name: 'kycStatus_1_investmentDate_-1' },
            { key: { 'address.city': 1, 'address.state': 1 }, name: 'address.city_1_address.state_1' },
            { key: { createdAt: -1, paymentStatus: 1 }, name: 'createdAt_-1_paymentStatus_1' },
            
            // Text search index
            { 
                key: { 
                    investorName: 'text', 
                    email: 'text', 
                    phone: 'text',
                    transactionId: 'text'
                }, 
                name: 'investor_text_search_index',
                weights: {
                    investorName: 10,
                    email: 8,
                    phone: 5,
                    transactionId: 3
                }
            }
        ]);

        console.log('✅ Database indexes created successfully');

        // Get collection stats
        const productCount = await InvestmentProduct.countDocuments();
        const investorCount = await Investor.countDocuments();
        const dbStats = await mongoose.connection.db.stats();

        console.log('📈 Collection Statistics:');
        console.log(`   📦 InvestmentProducts: ${productCount} documents`);
        console.log(`   👥 Investors: ${investorCount} documents`);
        console.log(`   💾 Database Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);

        // List all indexes
        const productIndexes = await InvestmentProduct.collection.listIndexes().toArray();
        const investorIndexes = await Investor.collection.listIndexes().toArray();

        console.log('🔍 Created Indexes:');
        console.log(`   📦 InvestmentProduct indexes: ${productIndexes.length}`);
        productIndexes.forEach(index => {
            console.log(`      - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        
        console.log(`   👥 Investor indexes: ${investorIndexes.length}`);
        investorIndexes.forEach(index => {
            console.log(`      - ${index.name}: ${JSON.stringify(index.key)}`);
        });

        // Optimize collections
        console.log('⚡ Optimizing collections...');
        
        // Update any existing products without slugs
        const productsWithoutSlugs = await InvestmentProduct.find({ slug: { $exists: false } });
        if (productsWithoutSlugs.length > 0) {
            console.log(`🔧 Updating ${productsWithoutSlugs.length} products with missing slugs...`);
            for (const product of productsWithoutSlugs) {
                let baseSlug = product.productTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .substring(0, 100);
                
                // Ensure unique slug
                let slug = baseSlug;
                let counter = 1;
                while (await InvestmentProduct.findOne({ slug, _id: { $ne: product._id } })) {
                    slug = `${baseSlug}-${counter}`;
                    counter++;
                }
                
                product.slug = slug;
                await product.save();
            }
        }

        // Validate data integrity using aggregation
        console.log('🔍 Validating data integrity...');
        
        const invalidProducts = await InvestmentProduct.aggregate([
            {
                $match: {
                    $or: [
                        { $expr: { $gt: ['$currentFunding', '$totalBudget'] } },
                        { $expr: { $gt: ['$minimumInvestment', '$totalBudget'] } },
                        { totalBudget: { $lt: 1000 } }
                    ]
                }
            },
            {
                $project: {
                    productTitle: 1,
                    totalBudget: 1,
                    currentFunding: 1,
                    minimumInvestment: 1
                }
            }
        ]);

        if (invalidProducts.length > 0) {
            console.warn(`⚠️  Found ${invalidProducts.length} products with data integrity issues`);
            invalidProducts.forEach(product => {
                console.warn(`   - ${product.productTitle}: ${product._id}`);
            });
        }

        console.log('✅ Database initialization completed successfully!');
        console.log('🚀 Your MongoDB is now optimized for high performance');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeDatabase();
}

export default initializeDatabase;
