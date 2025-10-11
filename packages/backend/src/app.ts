import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import previousSalesRoutes from './routes/previousSalesRoutes';
import metadataRoutes from './routes/metadataRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
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
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Test route for debugging
app.get('/test-auth', (req, res) => {
  console.log('🔥 Test auth route hit');
  res.json({ success: true, message: 'Auth route working' });
});

// Test environment variables
app.get('/test-env', (req, res) => {
  res.json({
    MONGO_URI: process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
    PORT: process.env.PORT,
    ATTOM_API_KEY: process.env.ATTOM_API_KEY ? 'Set' : 'Not set'
  });
});

// Test user database connection
app.get('/test-user-db', async (req, res) => {
  try {
    const User = require('./models/userModel').default;
    const mongoose = require('mongoose');
    
    console.log('🔍 Testing user model...');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('🔗 Connection state:', mongoose.connection.readyState);
    
    // Try to create a test user
    const testUser = new User({
      googleId: 'test123',
      email: 'test@example.com',
      name: 'Test User'
    });
    
    const savedUser = await testUser.save();
    console.log('✅ Test user saved with ID:', savedUser._id);
    
    // Clean up - delete the test user
    await User.deleteOne({ _id: savedUser._id });
    console.log('🗑️ Test user deleted');
    
    res.json({ 
      success: true, 
      message: 'User model working',
      database: mongoose.connection.name,
      connectionState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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