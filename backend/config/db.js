import mongoose from 'mongoose';

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
        throw new Error('MONGO_URI environment variable is not set. Please configure MongoDB Atlas connection string in .env file');
    }
    
    try {
        console.log('Connecting to MongoDB Atlas (Cloud)...')
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
        })
        console.log('✓ MongoDB Atlas Connected Successfully')
        console.log('Database: TaskManager')
    } catch (err) {
        console.error('MongoDB connection error:')
        console.error(err.message || err)
        console.error('\nMake sure:')
        console.error('1. Your IP is whitelisted in MongoDB Atlas Network Access')
        console.error('2. MONGO_URI in .env file is correct')
        console.error('3. Internet connection is active')
        throw err
    }
}