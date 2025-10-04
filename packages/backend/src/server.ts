import app from './app';

const PORT = process.env.PORT || 8080;

const startServer = (): void => {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Properties API available at http://localhost:${PORT}/api/properties`);
    console.log(`Health check available at http://localhost:${PORT}/api/health`);
  });
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
