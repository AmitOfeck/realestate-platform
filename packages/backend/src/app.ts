import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import previousSalesRoutes from './routes/previousSalesRoutes';
import metadataRoutes from './routes/metadataRoutes';
import { connectDB, isConnected } from './config/db';

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database initialization middleware
app.use(async (req, res, next) => {
  try {
    if (!isConnected()) {
      console.log('🔄 Database not connected, initializing...');
      await connectDB();
      console.log('✅ Database initialized for request');
    }
    next();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Database connection failed' 
    });
  }
});

// Routes
app.use('/api/previous-sales', previousSalesRoutes);
app.use('/api/metadata', metadataRoutes);

// Root route handler
app.get('/', (req, res) => {
  console.log('🚀 Root endpoint hit - server is running');
  console.log('📋 Environment:', process.env.NODE_ENV);
  console.log('☁️ Vercel:', process.env.VERCEL);
  console.log('🔗 Database connected:', isConnected());
  
  res.json({ 
    success: true, 
    message: 'Real Estate Platform Backend API',
    endpoints: [
      '/api/metadata',
      '/api/previous-sales/:zipcode'
    ]
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

export default app;