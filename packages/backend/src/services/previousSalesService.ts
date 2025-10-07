import axios from 'axios';
import { Property } from '../types/property';
import { PreviousSaleModel } from '../models/previousSalesModel';

const CACHE_TTL_DAYS = parseInt(process.env.CACHE_TTL_DAYS || '7');
const CACHE_TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds

export async function getPreviousSalesByZip(zipcode: string): Promise<Property[]> {
  // Validate zipcode
  if (!/^\d{5}$/.test(zipcode)) {
    throw new Error('Invalid zipcode format. Must be 5 digits.');
  }

  try {
    // Check cache first
    const cachedData = await getCachedData(zipcode);
    if (cachedData.length > 0) {
      console.log(`📦 Cache hit for zipcode ${zipcode}: ${cachedData.length} properties`);
      return cachedData;
    }

    // Cache miss - fetch from ATTOM API
    console.log(`🌐 Cache miss for zipcode ${zipcode} - fetching from ATTOM API`);
    const freshData = await fetchFromAttomAPI(zipcode);
    
    // Save to cache
    await saveToCache(freshData, zipcode);
    
    console.log(`💾 Cached ${freshData.length} properties for zipcode ${zipcode}`);
    return freshData;

  } catch (error) {
    console.error(`❌ Error fetching previous sales for zipcode ${zipcode}:`, error);
    throw error;
  }
}

async function getCachedData(zipcode: string): Promise<Property[]> {
  try {
    const cutoffDate = new Date(Date.now() - CACHE_TTL_MS);
    
    const cachedProperties = await PreviousSaleModel.find({
      addressLine2: { $regex: zipcode, $options: 'i' },
      createdAt: { $gte: cutoffDate }
    }).sort({ saleDate: -1 });

    return cachedProperties.map(doc => doc.toObject());
  } catch (error) {
    console.warn(`⚠️ Error reading from cache for zipcode ${zipcode}:`, error);
    return [];
  }
}

async function fetchFromAttomAPI(zipcode: string): Promise<Property[]> {
  const API_KEY = process.env.ATTOM_API_KEY;
  const BASE_URL = process.env.ATTOM_BASE_URL;

  if (!API_KEY || !BASE_URL) {
    throw new Error('Missing ATTOM API configuration');
  }

  const url = `${BASE_URL}/sale/snapshot?postalcode=${zipcode}&startSaleSearchDate=2022/01/01&endSaleSearchDate=2025/12/31`;
  
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

async function saveToCache(properties: Property[], zipcode: string): Promise<void> {
  try {
    // Remove old cached data for this zipcode
    await PreviousSaleModel.deleteMany({
      addressLine2: { $regex: zipcode, $options: 'i' }
    });

    // Insert new data
    if (properties.length > 0) {
      await PreviousSaleModel.insertMany(properties);
    }
  } catch (error) {
    console.warn(`⚠️ Error saving to cache for zipcode ${zipcode}:`, error);
    // Don't throw error - we still want to return the data even if caching fails
  }
}
