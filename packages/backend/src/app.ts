import express, { Application } from 'express';
import cors from 'cors';
import scraperRoutes from './routes/scraper.routes';
import propertiesRoutes from './routes/properties.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/scrape', scraperRoutes);
app.use('/api/properties', propertiesRoutes);

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    data: null,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    data: null,
    error: 'Route not found'
  });
});

export default app;