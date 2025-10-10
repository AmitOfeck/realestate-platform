import dotenv from 'dotenv';
import fs from 'fs';
import app from './app';
import { connectDB, isConnected } from './config/db';

// Load environment variables dynamically
const env = process.env.NODE_ENV || 'development';

// Only load .env files in development
if (env === 'development' && fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
  console.log('✅ Loaded .env.local for development');
} else if (env === 'production') {
  console.log('✅ Using Vercel environment variables');
} else {
  console.log('⚠️ Using system environment variables');
}

// Initialize MongoDB connection for Vercel
(async () => {
  try {
    console.log('🔄 Initializing MongoDB for serverless...');
    await connectDB();
    console.log('✅ MongoDB initialized for serverless');
  } catch (error) {
    console.error('❌ MongoDB initialization failed:', error);
  }
})();

console.log('🚀 Server.ts loaded - IIFE started');

// Export the app for Vercel serverless
export default app;

// Only start server locally (not in Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 8080;

  const startServer = async (): Promise<void> => {
    try {
      // Connect to MongoDB
      await connectDB();
      
      // Verify connection
      if (!isConnected()) {
        throw new Error('MongoDB connection failed');
      }
      
      // Start the server
      app.listen(PORT, () => {
        console.log(`✅ Backend running on port ${PORT}`);
        console.log(`🌐 Previous Sales API ready at /api/previous-sales/:zipcode`);
        console.log(`🌐 Metadata API ready at /api/metadata`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  };

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
  });

  // Start the server
  startServer();
}