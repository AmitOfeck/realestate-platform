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
  zipcode?: string;
  count?: number;
}

export class ScraperService {
  private static readonly ATTOM_API_KEY = '7e44c3e52c8806b55d8085db1af317ca';
  private static readonly ATTOM_BASE_URL = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

  /**
   * Fetches properties from ATTOM Data API by zipcode
   */
  static async fetchPropertiesByZipcode(zipcode: string): Promise<ScrapeResult> {
    console.log(`🔍 Fetching properties for zipcode: ${zipcode}`);
    
    // Validate zipcode
    if (!this.isValidZipcode(zipcode)) {
      console.error(`❌ Invalid zipcode format: ${zipcode}`);
      return {
        success: false,
        message: 'Invalid zipcode format. Must be 5 digits.',
        zipcode
      };
    }

    try {
      const url = `${this.ATTOM_BASE_URL}/sale/snapshot?postalcode=${zipcode}&startSaleSearchDate=2022/01/01&endSaleSearchDate=2025/12/31`;
      
      console.log(`📡 Making request to ATTOM API: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'accept': 'application/json',
          'apikey': this.ATTOM_API_KEY
        },
        timeout: 30000 // 30 second timeout
      });

      console.log(`✅ ATTOM API response received: ${response.status}`);
      
      // Parse the response
      const properties = this.parseAttomResponse(response.data, zipcode);
      
      console.log(`🏠 Found ${properties.length} properties for zipcode ${zipcode}`);
      
      return {
        success: true,
        data: properties,
        zipcode,
        count: properties.length
      };

    } catch (error) {
      console.error(`❌ Error fetching properties for zipcode ${zipcode}:`, error);
      
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
        message: errorMessage,
        zipcode
      };
    }
  }

  /**
   * Parses ATTOM API response and converts to simplified property format
   */
  private static parseAttomResponse(data: any, zipcode: string): SimplifiedProperty[] {
    const properties: SimplifiedProperty[] = [];
    
    try {
      // ATTOM API response structure
      const propertyData = data?.property || [];
      
      if (!Array.isArray(propertyData)) {
        console.warn('⚠️ No property data found in ATTOM response');
        return properties;
      }

      propertyData.forEach((property: any, index: number) => {
        try {
          // Extract sale information
          const sale = property?.sale;
          if (!sale || !sale.amount || !sale.amount.saleamt) {
            console.log(`⚠️ Skipping property ${index}: No valid sale amount`);
            return;
          }

          // Extract address information
          const address = property?.address;
          if (!address) {
            console.log(`⚠️ Skipping property ${index}: No address information`);
            return;
          }

          // Extract location coordinates
          const location = property?.location;
          if (!location || !location.latitude || !location.longitude) {
            console.log(`⚠️ Skipping property ${index}: No coordinates`);
            return;
          }

          // Extract property details
          const building = property?.building;
          const summary = property?.summary;

          const simplifiedProperty: SimplifiedProperty = {
            id: `attom_${zipcode}_${index}_${Date.now()}`,
            address: this.formatAddress(address),
            price: parseFloat(sale.amount.saleamt),
            lat: parseFloat(location.latitude),
            lng: parseFloat(location.longitude),
            beds: building?.rooms?.beds ? parseInt(building.rooms.beds) : undefined,
            baths: building?.rooms?.bathstotal ? parseFloat(building.rooms.bathstotal) : undefined,
            sqft: building?.size?.livingsize ? parseInt(building.size.livingsize) : undefined,
            yearBuilt: building?.yearbuilt ? parseInt(building.yearbuilt) : undefined,
            type: this.mapPropertyType(building?.type),
            saleDate: sale?.saledate || undefined
          };

          properties.push(simplifiedProperty);
          
        } catch (propertyError) {
          console.warn(`⚠️ Error parsing property ${index}:`, propertyError);
        }
      });

    } catch (parseError) {
      console.error('❌ Error parsing ATTOM response:', parseError);
    }

    return properties;
  }

  /**
   * Formats address from ATTOM API response
   */
  private static formatAddress(address: any): string {
    const parts = [];
    
    if (address?.oneLine) {
      return address.oneLine;
    }
    
    if (address?.line1) parts.push(address.line1);
    if (address?.line2) parts.push(address.line2);
    if (address?.locality) parts.push(address.locality);
    if (address?.region) parts.push(address.region);
    if (address?.postal1) parts.push(address.postal1);
    
    return parts.join(', ') || 'Address not available';
  }

  /**
   * Maps ATTOM property type to simplified type
   */
  private static mapPropertyType(type: string): string {
    if (!type) return 'Other';
    
    const typeMap: { [key: string]: string } = {
      'SFR': 'Single Family',
      'CONDO': 'Condo',
      'TOWNHOUSE': 'Townhouse',
      'MULTI': 'Multi-Family',
      'LAND': 'Land',
      'COMMERCIAL': 'Commercial'
    };
    
    return typeMap[type.toUpperCase()] || 'Other';
  }

  /**
   * Validates zipcode format
   */
  private static isValidZipcode(zipcode: string): boolean {
    return /^\d{5}$/.test(zipcode);
  }

  /**
   * Converts simplified properties to full Property interface
   */
  static convertToFullProperty(simplified: SimplifiedProperty): Property {
    return {
      id: simplified.id,
      title: simplified.address,
      address: simplified.address,
      city: '', // Not available from ATTOM
      state: '', // Not available from ATTOM
      zipcode: '', // Not available from ATTOM
      price: simplified.price,
      bedrooms: simplified.beds || 0,
      bathrooms: simplified.baths || 0,
      sqft: simplified.sqft || 0,
      yearBuilt: simplified.yearBuilt,
      propertyType: (simplified.type as any) || 'Other',
      features: [],
      amenities: [],
      lat: simplified.lat,
      lng: simplified.lng,
      images: [],
      status: 'Sold', // ATTOM shows sold properties
      listingDate: simplified.saleDate,
      // Legacy fields
      name: simplified.address,
      image: undefined
    };
  }
}