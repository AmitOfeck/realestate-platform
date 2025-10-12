import dotenv from 'dotenv';
import fs from 'fs';
import app from './app';
import { connectDB, isConnected } from './config/db';

/**
 * Server Configuration
 * Supports both local development and Vercel deployment
 */

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_VERCEL = process.env.VERCEL === '1';
const PORT = process.env.PORT || 8080;

/**
 * Load environment variables based on environment
 */
function loadEnvironmentVariables(): void {
  if (NODE_ENV === 'development' && !IS_VERCEL) {
    // Load .env.local for local development
    const envPath = '.env.local';
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log('✅ Loaded .env.local for development');
    } else {
      console.log('⚠️ .env.local not found, using system environment variables');
    }
  } else if (IS_VERCEL) {
    console.log('✅ Using Vercel environment variables');
  } else {
    console.log('✅ Using system environment variables');
  }
}

/**
 * Initialize MongoDB connection
 * Optimized for serverless environments
 */
async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔄 Initializing MongoDB connection...');
    await connectDB();
    
    if (isConnected()) {
      console.log('✅ MongoDB connection established');
    } else {
      throw new Error('MongoDB connection failed');
    }
  } catch (error) {
    console.error('❌ MongoDB initialization failed:', error);
    throw error;
  }
}

/**
 * Start local development server
 */
async function startLocalServer(): Promise<void> {
  try {
    console.log('🚀 Starting local development server...');
    
    // Initialize database
    await initializeDatabase();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log('✅ Backend server started successfully');
      console.log(`🌐 Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start local server:', error);
    process.exit(1);
  }
}

/**
 * Global error handlers
 */
function setupErrorHandlers(): void {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('💥 Unhandled Rejection:', reason);
    process.exit(1);
  });
}

/**
 * Main server initialization
 */
async function initializeServer(): Promise<void> {
  console.log('🚀 Initializing Real Estate Platform Backend...');
  console.log(`📋 Environment: ${NODE_ENV}`);
  console.log(`☁️  Platform: ${IS_VERCEL ? 'Vercel' : 'Local'}`);
  
  // Load environment variables
  loadEnvironmentVariables();
  
  // Setup error handlers
  setupErrorHandlers();

  if (IS_VERCEL) {
    // Vercel serverless environment
    console.log('☁️  Running in Vercel serverless mode');
    
    // Initialize database for serverless
    try {
      await initializeDatabase();
      console.log('✅ Serverless initialization complete');
    } catch (error) {
      console.error('❌ Serverless initialization failed:', error);
      // Don't exit in serverless - let Vercel handle it
    }
  } else {
    // Local development environment
    await startLocalServer();
  }
}

// Initialize server
initializeServer().catch((error) => {
  console.error('💥 Server initialization failed:', error);
  process.exit(1);
});

// Export app for Vercel serverless functions
export default app;