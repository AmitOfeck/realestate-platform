export interface Property {
  id: string;
  addressOneLine: string;
  addressLine1: string;
  addressLine2?: string;
  price: number | null;
  latitude: number;
  longitude: number;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  lotSize?: number | null;
  yearBuilt: number | null;
  propertyType: string | null;
  saleDate: string | null;
  saleType?: string | null;
  pricePerSqft?: number | null;
  pricePerBed?: number | null;
  propLandUse?: string | null;
  lastModified?: string | null;
}

export interface PropertiesResponse {
  success: boolean;
  data?: Property[];
  message?: string;
  count?: number;
  averagePrice?: number;
}
