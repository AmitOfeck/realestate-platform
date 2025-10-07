import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 8080;

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Backend running on port ${PORT}`);
      console.log(`🌐 Previous Sales API ready at /api/previous-sales/:zipcode`);
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