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
  yearOfSaleFrom?: number;
  yearOfSaleTo?: number;
}

// Pagination interface
interface PaginationResult {
  properties: Property[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export async function getPreviousSalesByZip(
  zipcode: string, 
  filters?: SaleFilters, 
  page: number = 1, 
  limit: number = 10
): Promise<PaginationResult> {
  // Validate zipcode
  if (!/^\d{5}$/.test(zipcode)) {
    throw new Error('Invalid zipcode format. Must be 5 digits.');
  }

  // Validate pagination parameters
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;

  try {
    // Check if we already have data for this zipcode in database
    const existingData = await getExistingDataPaginated(zipcode, filters, page, limit);
    if (existingData.properties.length > 0) {
      console.log(`📦 Found ${existingData.properties.length} properties for zipcode ${zipcode} (page ${page})`);
      return existingData;
    }

    // No existing data - fetch from ATTOM API
    console.log(`🌐 No existing data for zipcode ${zipcode} - fetching from ATTOM API`);
    const freshData = await fetchFromAttomAPI(zipcode);
    
    // Save to database for future queries
    await saveToDatabase(freshData, zipcode);
    
    // Apply filters to fresh data and paginate
    const filteredData = applyFilters(freshData, filters);
    const paginatedData = paginateResults(filteredData, page, limit);
    
    return paginatedData;

  } catch (error) {
    console.error(`❌ Error fetching previous sales for zipcode ${zipcode}:`, error);
    throw error;
  }
}

async function getExistingDataPaginated(
  zipcode: string, 
  filters?: SaleFilters, 
  page: number = 1, 
  limit: number = 10
): Promise<PaginationResult> {
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

    // Add sale year filters
    if (filters?.yearOfSaleFrom || filters?.yearOfSaleTo) {
      query.saleDate = {};
      if (filters.yearOfSaleFrom) {
        query.saleDate.$gte = `${filters.yearOfSaleFrom}-01-01`;
      }
      if (filters.yearOfSaleTo) {
        query.saleDate.$lte = `${filters.yearOfSaleTo}-12-31`;
      }
    }

    // Get total count efficiently
    const totalCount = await PreviousSaleModel.countDocuments(query);
    
    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    // Get paginated results
    const properties = await PreviousSaleModel.find(query)
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      properties,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    };
  } catch (error) {
    console.warn(`⚠️ Error reading existing data for zipcode ${zipcode}:`, error);
    return {
      properties: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit
      }
    };
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

    // Sale year filter
    if (filters.yearOfSaleFrom && property.saleDate) {
      const saleYear = new Date(property.saleDate).getFullYear();
      if (saleYear < filters.yearOfSaleFrom) return false;
    }
    if (filters.yearOfSaleTo && property.saleDate) {
      const saleYear = new Date(property.saleDate).getFullYear();
      if (saleYear > filters.yearOfSaleTo) return false;
    }

    return true;
  });
}

function paginateResults(properties: Property[], page: number, limit: number): PaginationResult {
  const totalCount = properties.length;
  const totalPages = Math.ceil(totalCount / limit);
  const skip = (page - 1) * limit;
  
  const paginatedProperties = properties.slice(skip, skip + limit);
  
  return {
    properties: paginatedProperties,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit
    }
  };
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