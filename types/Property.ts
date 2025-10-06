export interface Property {
  // Basic Info
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  
  // Pricing
  price: number;
  pricePerSqft?: number;
  priceHistory?: Array<{
    date: string;
    price: number;
    event: string; // "Listed", "Price Change", "Sold"
  }>;
  
  // Property Details
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family' | 'Land' | 'Other';
  
  // Features & Amenities
  features: string[]; // ["Pool", "Garage", "Fireplace", "Hardwood Floors"]
  amenities: string[]; // ["Gym", "Pool", "Security", "Parking"]
  
  // Location & Coordinates
  lat: number;
  lng: number;
  neighborhood?: string;
  schoolDistrict?: string;
  
  // Media
  images: string[];
  virtualTourUrl?: string;
  
  // Status & Dates
  status: 'For Sale' | 'Pending' | 'Sold' | 'Off Market';
  daysOnMarket?: number;
  listingDate?: string;
  
  // Agent & Contact
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  brokerage?: string;
  
  // Additional Details
  description?: string;
  hoaFee?: number;
  taxes?: number;
  mlsNumber?: string;
  
  // Financial Details
  estimatedPayment?: {
    monthly: number;
    downPayment: number;
    interestRate: number;
  };

  // Legacy fields for backward compatibility
  name?: string; // Maps to title
  image?: string; // Maps to first image in images array
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

export interface PropertiesResponse extends ApiResponse<Property[]> {
  count: number;
}