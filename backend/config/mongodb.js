import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Optimize MongoDB connection settings
        const options = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
        };

        // Connection event listeners
        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB Connected Successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB Connection Error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB Disconnected');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed through app termination');
            process.exit(0);
        });

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, options);
        
        // Set mongoose options for better performance
        mongoose.set('strictQuery', true);
        
        console.log(`🚀 Connected to MongoDB: ${mongoose.connection.name}`);
        
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;