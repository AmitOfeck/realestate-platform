import mongoose from 'mongoose';
import { ZipcodeMetadata } from '../types/metadata';

// Metadata schema for tracking fetch dates per zipcode
const zipcodeMetadataSchema = new mongoose.Schema<ZipcodeMetadata>({
  zipcode: { type: String, required: true, unique: true },
  lastFetchDate: { type: Date, required: true },
  totalPropertiesCount: { type: Number, default: 0 },
  lastApiCallDate: { type: Date, required: true },
}, {
  timestamps: true,
  collection: 'zipcodeMetadata'
});

// Indexes for metadata
zipcodeMetadataSchema.index({ zipcode: 1 }, { unique: true });
zipcodeMetadataSchema.index({ lastFetchDate: 1 });
zipcodeMetadataSchema.index({ lastApiCallDate: 1 });

export const ZipcodeMetadataModel = mongoose.model<ZipcodeMetadata>('ZipcodeMetadata', zipcodeMetadataSchema);
