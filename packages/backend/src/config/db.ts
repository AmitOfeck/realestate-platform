import mongoose from 'mongoose';

// Cache the connection to avoid multiple connections in serverless
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const env = process.env.NODE_ENV || 'development';
    
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // If we have a cached connection, return it
    if (cached.conn) {
      console.log(`✅ Using cached MongoDB connection (${env})`);
      return;
    }

    // If we don't have a cached promise, create one
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      };

      console.log(`🔄 Connecting to MongoDB (${env})...`);
      cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
        console.log(`✅ Connected to MongoDB (${env})`);
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    cached.promise = null; // Reset promise on error
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
};

// Helper function to check if MongoDB is connected
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Helper function to get connection status
export const getConnectionStatus = (): string => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
};
