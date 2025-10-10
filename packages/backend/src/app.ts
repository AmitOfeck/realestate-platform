import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import previousSalesRoutes from './routes/previousSalesRoutes';
import metadataRoutes from './routes/metadataRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/previous-sales', previousSalesRoutes);
app.use('/api/metadata', metadataRoutes);

// Root route handler
app.get('/', (req, res) => {
  console.log('here');
  console.log("node_env", process.env.NODE_ENV);
  console.log("process.env.MONGO_URI", process.env.MONGO_URI);
  console.log("process.env.ATTOM_API_KEY", process.env.ATTOM_API_KEY);
  console.log("process.env.ATTOM_BASE_URL", process.env.ATTOM_BASE_URL);
  console.log("process.env.PORT", process.env.PORT);
  console.log("process.env.VERCEL", process.env.VERCEL);
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