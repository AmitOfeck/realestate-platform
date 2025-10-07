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

// Index for efficient queries by zipcode
previousSaleSchema.index({ addressLine2: 1 });
previousSaleSchema.index({ createdAt: 1 });

export const PreviousSaleModel = mongoose.model<Property>('PreviousSale', previousSaleSchema);
