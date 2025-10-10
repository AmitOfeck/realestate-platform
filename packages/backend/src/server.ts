import dotenv from 'dotenv';
import fs from 'fs';
import app from './app';
import { connectDB, isConnected } from './config/db';

// Load environment variables dynamically
const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.production' : '.env.local';

// Check if env file exists before loading
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`✅ Loaded environment from ${envFile}`);
} else {
  console.log(`⚠️ Environment file ${envFile} not found, using system environment variables`);
  console.log(`💡 Create ${envFile} from ${envFile}.example for local development`);
}

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