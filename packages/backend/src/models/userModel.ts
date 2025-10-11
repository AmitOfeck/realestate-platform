import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  lastLogin: Date;
  searchHistory: Array<{
    zipcode: string;
    timestamp: Date;
    filters?: any;
  }>;
  favoriteProperties: string[];
  preferences: {
    defaultFilters: any;
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  googleId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  picture: { 
    type: String 
  },
  lastLogin: { 
    type: Date, 
    default: Date.now 
  },
  searchHistory: [{
    zipcode: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    filters: { 
      type: Schema.Types.Mixed 
    }
  }],
  favoriteProperties: [{ 
    type: String 
  }],
  preferences: {
    defaultFilters: { 
      type: Schema.Types.Mixed, 
      default: {} 
    },
    notifications: { 
      type: Boolean, 
      default: true 
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'searchHistory.timestamp': -1 });

export default mongoose.model<IUser>('User', userSchema);
