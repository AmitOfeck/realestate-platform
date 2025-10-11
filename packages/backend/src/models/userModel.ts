import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  lastLogin: Date;
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
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', userSchema);