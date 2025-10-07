import axios from 'axios';

export interface SimplifiedProperty {
  id: string;
  address: string;
  price: number;
  lat: number;
  lng: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  type?: string;
  saleDate?: string;
}

export interface ScrapeResult {
  success: boolean;
  data?: SimplifiedProperty[];
  message?: string;
}

export const fetchPropertiesByZipcode = async (zipcode: string): Promise<ScrapeResult> => {
  const API_KEY = process.env.ATTOM_API_KEY;
  const BASE_URL = process.env.ATTOM_BASE_URL;

  if (!API_KEY || !BASE_URL) {
    console.error('❌ Missing ATTOM API configuration');
    return { 
      success: false, 
      message: 'API configuration missing' 
    };
  }

  if (!/^\d{5}$/.test(zipcode)) {
    console.error(`❌ Invalid zipcode format: ${zipcode}`);
    return { 
      success: false, 
      message: 'Invalid zipcode format. Must be 5 digits.' 
    };
  }

  try {
    const url = `${BASE_URL}/sale/snapshot?postalcode=${zipcode}&startSaleSearchDate=2022/01/01&endSaleSearchDate=2025/12/31`;
    
    console.log(`📡 Making single API call to ATTOM for zipcode: ${zipcode}`);

    const { data } = await axios.get(url, {
      headers: {
        accept: 'application/json',
        apikey: API_KEY,
      },
      timeout: 30000 // 30 second timeout
    });

    console.log(`✅ ATTOM API response received: ${data.property?.length || 0} properties`);

    const properties = (data.property || [])
      .filter((p: any) => p.sale?.amount?.saleamt) // Only properties with valid sale amounts
      .map((p: any) => ({
        id: p.identifier?.attomId || `attom_${zipcode}_${Date.now()}_${Math.random()}`,
        address: p.address?.oneLine || 'Address not available',
        price: parseFloat(p.sale?.amount?.saleamt) || 0,
        lat: parseFloat(p.location?.latitude) || 0,
        lng: parseFloat(p.location?.longitude) || 0,
        beds: p.building?.rooms?.beds ? parseInt(p.building.rooms.beds) : undefined,
        baths: p.building?.rooms?.bathstotal ? parseFloat(p.building.rooms.bathstotal) : undefined,
        sqft: p.building?.size?.universalsize ? parseInt(p.building.size.universalsize) : undefined,
        yearBuilt: p.summary?.yearbuilt ? parseInt(p.summary.yearbuilt) : undefined,
        type: p.summary?.propertyType || 'Other',
        saleDate: p.sale?.saleTransDate || undefined,
      }))
      .filter((p: SimplifiedProperty) => p.lat !== 0 && p.lng !== 0); // Only properties with valid coordinates

    console.log(`🏠 Processed ${properties.length} valid properties for zipcode ${zipcode}`);

    return { 
      success: true, 
      data: properties 
    };

  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    
    let errorMessage = 'Failed to fetch properties';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `API Error: ${error.response.status} - ${error.response.statusText}`;
        console.error(`API Response:`, error.response.data);
      } else if (error.request) {
        errorMessage = 'Network Error: Unable to reach ATTOM API';
      } else {
        errorMessage = `Request Error: ${error.message}`;
      }
    }
    
    return { 
      success: false, 
      message: errorMessage 
    };
  }
};
