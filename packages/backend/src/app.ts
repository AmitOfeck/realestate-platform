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