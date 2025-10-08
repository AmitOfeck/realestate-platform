import mongoose from 'mongoose';
import { Property } from '../types/property';

const previousSaleSchema = new mongoose.Schema<Property>({
  id: { type: String, unique: true, required: true },
  addressOneLine: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  zipcode: { type: String, required: true }, // Added zipcode field for efficient queries
  price: { type: Number, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  sqft: { type: Number },
  lotSize: { type: Number },
  yearBuilt: { type: Number },
  propertyType: { type: String },
  saleDate: { type: String },
  saleType: { type: String },
  pricePerSqft: { type: Number },
  pricePerBed: { type: Number },
  propLandUse: { type: String },
  lastModified: { type: String },
}, { 
  timestamps: true,
  collection: 'previousSales'
});

// Optimized indexes for fast queries and filtering
previousSaleSchema.index({ zipcode: 1 }); // Primary zipcode index for fast lookups
previousSaleSchema.index({ addressLine2: 1 }); // Legacy zipcode index for backward compatibility
previousSaleSchema.index({ id: 1 }, { unique: true }); // Unique index for duplicate prevention
previousSaleSchema.index({ saleDate: -1 }); // Index for sorting by sale date
previousSaleSchema.index({ price: 1 }); // Price filtering
previousSaleSchema.index({ bedrooms: 1 }); // Bedroom filtering
previousSaleSchema.index({ sqft: 1 }); // Sqft filtering
previousSaleSchema.index({ yearBuilt: 1 }); // Year built filtering

// Compound indexes for complex queries
previousSaleSchema.index({ zipcode: 1, price: 1 }); // Zipcode + Price
previousSaleSchema.index({ zipcode: 1, bedrooms: 1 }); // Zipcode + Bedrooms
previousSaleSchema.index({ zipcode: 1, sqft: 1 }); // Zipcode + Sqft
previousSaleSchema.index({ zipcode: 1, saleDate: -1 }); // Zipcode + Sale Date
previousSaleSchema.index({ zipcode: 1, yearBuilt: 1 }); // Zipcode + Year Built
previousSaleSchema.index({ saleDate: 1 }); // Sale Date filtering (ascending for range queries)

// Legacy compound indexes for backward compatibility
previousSaleSchema.index({ addressLine2: 1, price: 1 }); // Legacy Zipcode + Price
previousSaleSchema.index({ addressLine2: 1, bedrooms: 1 }); // Legacy Zipcode + Bedrooms
previousSaleSchema.index({ addressLine2: 1, sqft: 1 }); // Legacy Zipcode + Sqft
previousSaleSchema.index({ addressLine2: 1, saleDate: -1 }); // Legacy Zipcode + Sale Date
previousSaleSchema.index({ addressLine2: 1, yearBuilt: 1 }); // Legacy Zipcode + Year Built

// Metadata schema for tracking fetch dates per zipcode
const zipcodeMetadataSchema = new mongoose.Schema({
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

export const PreviousSaleModel = mongoose.model<Property>('PreviousSale', previousSaleSchema);
export const ZipcodeMetadataModel = mongoose.model('ZipcodeMetadata', zipcodeMetadataSchema);