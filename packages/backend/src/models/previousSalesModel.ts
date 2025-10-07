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

// Optimized indexes for fast queries and filtering
previousSaleSchema.index({ addressLine2: 1 }); // Zipcode index for fast lookups
previousSaleSchema.index({ id: 1 }, { unique: true }); // Unique index for duplicate prevention
previousSaleSchema.index({ saleDate: -1 }); // Index for sorting by sale date
previousSaleSchema.index({ price: 1 }); // Price filtering
previousSaleSchema.index({ bedrooms: 1 }); // Bedroom filtering
previousSaleSchema.index({ sqft: 1 }); // Sqft filtering
previousSaleSchema.index({ yearBuilt: 1 }); // Year built filtering

// Compound indexes for complex queries
previousSaleSchema.index({ addressLine2: 1, price: 1 }); // Zipcode + Price
previousSaleSchema.index({ addressLine2: 1, bedrooms: 1 }); // Zipcode + Bedrooms
previousSaleSchema.index({ addressLine2: 1, sqft: 1 }); // Zipcode + Sqft

previousSaleSchema.index({ addressLine2: 1, saleDate: -1 }); // Zipcode + Sale Date
previousSaleSchema.index({ addressLine2: 1, yearBuilt: 1 }); // Zipcode + Year Built
previousSaleSchema.index({ saleDate: 1 }); // Sale Date filtering (ascending for range queries)

export const PreviousSaleModel = mongoose.model<Property>('PreviousSale', previousSaleSchema);