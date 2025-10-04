export interface Property {
  id: string;
  name: string;
  price: number;
  lat: number;
  lng: number;
  image?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  zipcode: string;
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
