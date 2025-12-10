import mongoose from 'mongoose';

export const connectDB = async () => {
    // Prefer explicit env var. For development, fall back to local MongoDB so
    // you can run the app without Atlas if desired.
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/TaskManager';
    try {
        const usingLocal = uri.includes('127.0.0.1') || uri.includes('localhost');
        console.log('Connecting to MongoDB...')
        console.log(usingLocal ? 'Using local MongoDB at 127.0.0.1' : `Using MONGO_URI (remote)`)
        await mongoose.connect(uri, {
            // recommended options; Mongoose 6+ makes some optional but explicit is ok
            // useNewUrlParser and useUnifiedTopology are default in recent versions
            serverSelectionTimeoutMS: 10000,
        })
        console.log('DB CONNECTED')
    } catch (err) {
        console.error('MongoDB connection error:')
        console.error(err.message || err)
        // rethrow so nodemon / process supervisor shows the crash
        throw err
    }
}