import mongoose from 'mongoose';
import { Property } from '../types/property';

const previousSaleSchema = new mongoose.Schema<Property>({
  id: { type: String, unique: true, required: true },
  addressOneLine: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
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

// Optimized indexes for fast queries
previousSaleSchema.index({ addressLine2: 1 }); // Zipcode index for fast lookups
previousSaleSchema.index({ id: 1 }, { unique: true }); // Unique index for duplicate prevention
previousSaleSchema.index({ saleDate: -1 }); // Index for sorting by sale date

export const PreviousSaleModel = mongoose.model<Property>('PreviousSale', previousSaleSchema);