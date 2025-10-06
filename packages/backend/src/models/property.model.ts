import { Property } from '../../../../types/Property';

// Static data - in a real app, this would be replaced with database operations
const properties: Property[] = [
  {
    id: '1',
    title: 'Luxury Beverly Hills Estate',
    address: '123 Beverly Hills Dr',
    city: 'Beverly Hills',
    state: 'CA',
    zipcode: '90210',
    price: 2500000,
    pricePerSqft: 714,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3500,
    lotSize: 0.5,
    yearBuilt: 2015,
    propertyType: 'Single Family',
    features: ['Pool', 'Garage', 'Fireplace', 'Hardwood Floors'],
    amenities: ['Security', 'Gated Community'],
    lat: 34.0736,
    lng: -118.4004,
    neighborhood: 'Beverly Hills',
    schoolDistrict: 'Beverly Hills Unified',
    images: ['https://via.placeholder.com/400x300/4CAF50/white?text=Luxury+Estate'],
    status: 'For Sale',
    daysOnMarket: 45,
    listingDate: '2024-01-15',
    agentName: 'John Smith',
    agentPhone: '(555) 123-4567',
    brokerage: 'Beverly Hills Realty',
    description: 'Stunning luxury estate in the heart of Beverly Hills...',
    hoaFee: 0,
    taxes: 25000,
    mlsNumber: 'MLS123456',
    estimatedPayment: {
      monthly: 12500,
      downPayment: 500000,
      interestRate: 6.5
    },
    // Legacy fields for backward compatibility
    name: 'Luxury Beverly Hills Estate',
    image: 'https://via.placeholder.com/400x300/4CAF50/white?text=Luxury+Estate'
  },
  {
    id: '2',
    title: 'Modern Hillside Villa',
    address: '456 Rodeo Dr',
    city: 'Beverly Hills',
    state: 'CA',
    zipcode: '90210',
    price: 1800000,
    pricePerSqft: 643,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    lotSize: 0.3,
    yearBuilt: 2018,
    propertyType: 'Single Family',
    features: ['Garage', 'Fireplace', 'Updated Kitchen'],
    amenities: ['Parking'],
    lat: 34.0800,
    lng: -118.4100,
    neighborhood: 'Beverly Hills',
    schoolDistrict: 'Beverly Hills Unified',
    images: ['https://via.placeholder.com/400x300/2196F3/white?text=Modern+Villa'],
    status: 'For Sale',
    daysOnMarket: 30,
    listingDate: '2024-02-01',
    agentName: 'Sarah Johnson',
    agentPhone: '(555) 987-6543',
    brokerage: 'Beverly Hills Properties',
    description: 'Beautiful modern villa with stunning hillside views...',
    hoaFee: 0,
    taxes: 18000,
    mlsNumber: 'MLS123457',
    estimatedPayment: {
      monthly: 9000,
      downPayment: 360000,
      interestRate: 6.5
    },
    // Legacy fields for backward compatibility
    name: 'Modern Hillside Villa',
    image: 'https://via.placeholder.com/400x300/2196F3/white?text=Modern+Villa'
  },
  {
    id: '3',
    title: 'Classic Beverly Hills Home',
    address: '789 Sunset Blvd',
    city: 'Beverly Hills',
    state: 'CA',
    zipcode: '90210',
    price: 3200000,
    pricePerSqft: 762,
    bedrooms: 6,
    bathrooms: 5,
    sqft: 4200,
    lotSize: 0.7,
    yearBuilt: 2010,
    propertyType: 'Single Family',
    features: ['Pool', 'Garage', 'Fireplace', 'Hardwood Floors', 'Wine Cellar'],
    amenities: ['Security', 'Gated Community', 'Pool House'],
    lat: 34.0650,
    lng: -118.3900,
    neighborhood: 'Beverly Hills',
    schoolDistrict: 'Beverly Hills Unified',
    images: ['https://via.placeholder.com/400x300/FF9800/white?text=Classic+Home'],
    status: 'For Sale',
    daysOnMarket: 60,
    listingDate: '2024-01-01',
    agentName: 'Mike Davis',
    agentPhone: '(555) 456-7890',
    brokerage: 'Beverly Hills Homes',
    description: 'Magnificent classic estate with timeless elegance...',
    hoaFee: 0,
    taxes: 32000,
    mlsNumber: 'MLS123458',
    estimatedPayment: {
      monthly: 16000,
      downPayment: 640000,
      interestRate: 6.5
    },
    // Legacy fields for backward compatibility
    name: 'Classic Beverly Hills Home',
    image: 'https://via.placeholder.com/400x300/FF9800/white?text=Classic+Home'
  },
  {
    id: '4',
    title: 'Contemporary Condo',
    address: '101 Wilshire Blvd',
    city: 'Beverly Hills',
    state: 'CA',
    zipcode: '90210',
    price: 1200000,
    pricePerSqft: 667,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    lotSize: 0.1,
    yearBuilt: 2020,
    propertyType: 'Condo',
    features: ['Balcony', 'Hardwood Floors', 'Updated Kitchen'],
    amenities: ['Gym', 'Pool', 'Security', 'Parking'],
    lat: 34.0850,
    lng: -118.4200,
    neighborhood: 'Beverly Hills',
    schoolDistrict: 'Beverly Hills Unified',
    images: ['https://via.placeholder.com/400x300/9C27B0/white?text=Contemporary'],
    status: 'For Sale',
    daysOnMarket: 25,
    listingDate: '2024-02-10',
    agentName: 'Lisa Chen',
    agentPhone: '(555) 321-0987',
    brokerage: 'Beverly Hills Condos',
    description: 'Stylish contemporary condo with modern amenities...',
    hoaFee: 400,
    taxes: 12000,
    mlsNumber: 'MLS123459',
    estimatedPayment: {
      monthly: 6000,
      downPayment: 240000,
      interestRate: 6.5
    },
    // Legacy fields for backward compatibility
    name: 'Contemporary Condo',
    image: 'https://via.placeholder.com/400x300/9C27B0/white?text=Contemporary'
  },
  {
    id: '5',
    title: 'Penthouse with City Views',
    address: '555 Rodeo Dr',
    city: 'Beverly Hills',
    state: 'CA',
    zipcode: '90210',
    price: 4500000,
    pricePerSqft: 1406,
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3200,
    lotSize: 0.2,
    yearBuilt: 2022,
    propertyType: 'Condo',
    features: ['Rooftop Deck', 'Hardwood Floors', 'Gourmet Kitchen', 'Wine Cellar'],
    amenities: ['Concierge', 'Valet', 'Gym', 'Pool', 'Security'],
    lat: 34.0700,
    lng: -118.3800,
    neighborhood: 'Beverly Hills',
    schoolDistrict: 'Beverly Hills Unified',
    images: ['https://via.placeholder.com/400x300/F44336/white?text=Penthouse'],
    status: 'For Sale',
    daysOnMarket: 15,
    listingDate: '2024-02-20',
    agentName: 'Robert Kim',
    agentPhone: '(555) 654-3210',
    brokerage: 'Luxury Beverly Hills',
    description: 'Exclusive penthouse with breathtaking city views...',
    hoaFee: 800,
    taxes: 45000,
    mlsNumber: 'MLS123460',
    estimatedPayment: {
      monthly: 22500,
      downPayment: 900000,
      interestRate: 6.5
    },
    // Legacy fields for backward compatibility
    name: 'Penthouse with City Views',
    image: 'https://via.placeholder.com/400x300/F44336/white?text=Penthouse'
  }
];

export class PropertyModel {
  static async getAllProperties(): Promise<Property[]> {
    // Simulate async database operation
    return new Promise((resolve) => {
      setTimeout(() => resolve([...properties]), 0);
    });
  }

  static async getPropertyById(id: string): Promise<Property | null> {
    // Simulate async database operation
    return new Promise((resolve) => {
      setTimeout(() => {
        const property = properties.find(p => p.id === id);
        resolve(property || null);
      }, 0);
    });
  }

  static async getPropertiesCount(): Promise<number> {
    // Simulate async database operation
    return new Promise((resolve) => {
      setTimeout(() => resolve(properties.length), 0);
    });
  }
}