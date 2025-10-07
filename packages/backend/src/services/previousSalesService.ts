import axios from 'axios';
import { Property } from '../types/property';
import { PreviousSaleModel } from '../models/previousSalesModel';

// Filter interface for property filtering
interface SaleFilters {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minSqft?: number;
  maxSqft?: number;
  yearBuiltFrom?: number;
  yearBuiltTo?: number;
}

export async function getPreviousSalesByZip(zipcode: string, filters?: SaleFilters): Promise<Property[]> {
  // Validate zipcode
  if (!/^\d{5}$/.test(zipcode)) {
    throw new Error('Invalid zipcode format. Must be 5 digits.');
  }

  try {
    // Check if we already have data for this zipcode in database
    const existingData = await getExistingData(zipcode, filters);
    if (existingData.length > 0) {
      console.log(`📦 Found ${existingData.length} filtered properties for zipcode ${zipcode}`);
      return existingData;
    }

    // No existing data - fetch from ATTOM API
    console.log(`🌐 No existing data for zipcode ${zipcode} - fetching from ATTOM API`);
    const freshData = await fetchFromAttomAPI(zipcode);
    
    // Save to database for future queries
    await saveToDatabase(freshData, zipcode);
    
    // Apply filters to fresh data
    const filteredData = applyFilters(freshData, filters);
    return filteredData;

  } catch (error) {
    console.error(`❌ Error fetching previous sales for zipcode ${zipcode}:`, error);
    throw error;
  }
}

async function getExistingData(zipcode: string, filters?: SaleFilters): Promise<Property[]> {
  try {
    // Build MongoDB query with filters using indexes
    const query: any = { 
      addressLine2: { $regex: zipcode, $options: 'i' } 
    };

    // Add price filters
    if (filters?.minPrice || filters?.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    // Add bedroom filters
    if (filters?.minBeds || filters?.maxBeds) {
      query.bedrooms = {};
      if (filters.minBeds) query.bedrooms.$gte = filters.minBeds;
      if (filters.maxBeds) query.bedrooms.$lte = filters.maxBeds;
    }

    // Add sqft filters
    if (filters?.minSqft || filters?.maxSqft) {
      query.sqft = {};
      if (filters.minSqft) query.sqft.$gte = filters.minSqft;
      if (filters.maxSqft) query.sqft.$lte = filters.maxSqft;
    }

    // Add year built filters
    if (filters?.yearBuiltFrom || filters?.yearBuiltTo) {
      query.yearBuilt = {};
      if (filters.yearBuiltFrom) query.yearBuilt.$gte = filters.yearBuiltFrom;
      if (filters.yearBuiltTo) query.yearBuilt.$lte = filters.yearBuiltTo;
    }

    const existingProperties = await PreviousSaleModel.find(query)
      .sort({ saleDate: -1 })
      .limit(50)
      .lean();

    return existingProperties;
  } catch (error) {
    console.warn(`⚠️ Error reading existing data for zipcode ${zipcode}:`, error);
    return [];
  }
}

function applyFilters(properties: Property[], filters?: SaleFilters): Property[] {
  if (!filters) return properties;

  return properties.filter(property => {
    // Price filter
    if (filters.minPrice && property.price && property.price < filters.minPrice) return false;
    if (filters.maxPrice && property.price && property.price > filters.maxPrice) return false;

    // Bedroom filter
    if (filters.minBeds && property.bedrooms && property.bedrooms < filters.minBeds) return false;
    if (filters.maxBeds && property.bedrooms && property.bedrooms > filters.maxBeds) return false;

    // Sqft filter
    if (filters.minSqft && property.sqft && property.sqft < filters.minSqft) return false;
    if (filters.maxSqft && property.sqft && property.sqft > filters.maxSqft) return false;

    // Year built filter
    if (filters.yearBuiltFrom && property.yearBuilt && property.yearBuilt < filters.yearBuiltFrom) return false;
    if (filters.yearBuiltTo && property.yearBuilt && property.yearBuilt > filters.yearBuiltTo) return false;

    return true;
  });
}

async function fetchFromAttomAPI(zipcode: string): Promise<Property[]> {
  const API_KEY = process.env.ATTOM_API_KEY;
  const BASE_URL = process.env.ATTOM_BASE_URL;

  if (!API_KEY || !BASE_URL) {
    throw new Error('Missing ATTOM API configuration');
  }

  const url = `${BASE_URL}/sale/snapshot?postalcode=${zipcode}&startSaleSearchDate=2022/01/01&endSaleSearchDate=2025/12/31&pagesize=100`;
  
  console.log(`📡 Making API call to ATTOM for zipcode: ${zipcode}`);

  const { data } = await axios.get(url, {
    headers: {
      accept: 'application/json',
      apikey: API_KEY,
    },
    timeout: 30000
  });

  console.log(`✅ ATTOM API response received: ${data.property?.length || 0} properties`);

  const properties: Property[] = (data.property || [])
    .filter((p: any) => p.sale?.amount?.saleamt && p.location?.latitude && p.location?.longitude)
    .map((p: any) => {
      const price = parseFloat(p.sale?.amount?.saleamt) || null;
      const sqft = p.building?.size?.universalsize ? parseInt(p.building.size.universalsize) : null;
      const bedrooms = p.building?.rooms?.beds ? parseInt(p.building.rooms.beds) : null;
      const bathrooms = p.building?.rooms?.bathstotal ? parseFloat(p.building.rooms.bathstotal) : null;
      
      return {
        id: p.identifier?.attomId || `attom_${zipcode}_${Date.now()}_${Math.random()}`,
        addressOneLine: p.address?.oneLine || 'Address not available',
        addressLine1: p.address?.line1 || '',
        addressLine2: p.address?.line2 || undefined,
        price: price,
        latitude: parseFloat(p.location?.latitude) || 0,
        longitude: parseFloat(p.location?.longitude) || 0,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        sqft: sqft,
        lotSize: p.building?.size?.lotsize ? parseFloat(p.building.size.lotsize) : null,
        yearBuilt: p.summary?.yearbuilt ? parseInt(p.summary.yearbuilt) : null,
        propertyType: p.summary?.propertyType || null,
        saleDate: p.sale?.saleTransDate || null,
        saleType: p.sale?.saleType || null,
        pricePerSqft: sqft && price ? Math.round(price / sqft) : null,
        pricePerBed: bedrooms && price ? Math.round(price / bedrooms) : null,
        propLandUse: p.summary?.propLandUse || null,
        lastModified: p.lastModified || null,
      };
    })
    .filter((p: Property) => p.latitude !== 0 && p.longitude !== 0 && p.price !== null)
    .sort((a: Property, b: Property) => {
      // Sort by most recent saleDate
      if (!a.saleDate && !b.saleDate) return 0;
      if (!a.saleDate) return 1;
      if (!b.saleDate) return -1;
      return new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime();
    });

  console.log(`🏠 Processed ${properties.length} properties for zipcode ${zipcode}`);
  return properties;
}

async function saveToDatabase(properties: Property[], zipcode: string): Promise<void> {
  try {
    // First, delete any existing properties for this zipcode to prevent duplicates
    const deleteResult = await PreviousSaleModel.deleteMany({
      addressLine2: { $regex: zipcode, $options: 'i' }
    });
    
    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing properties for zipcode ${zipcode}`);
    }
    
    // Then insert all new properties
    await PreviousSaleModel.insertMany(properties);
    
    console.log(`💾 Saved ${properties.length} properties for zipcode ${zipcode}`);
  } catch (error) {
    console.warn(`⚠️ Error saving to database for zipcode ${zipcode}:`, error);
  }
}