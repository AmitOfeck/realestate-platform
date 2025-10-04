import { Property } from '../../../../types/Property';

// Static data - in a real app, this would be replaced with database operations
const properties: Property[] = [
  {
    id: '1',
    name: 'Luxury Beverly Hills Estate',
    price: 2500000,
    lat: 34.0736,
    lng: -118.4004,
    image: 'https://via.placeholder.com/100x60/4CAF50/white?text=Luxury+Estate',
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3500,
    zipcode: '90210'
  },
  {
    id: '2',
    name: 'Modern Hillside Villa',
    price: 1800000,
    lat: 34.0800,
    lng: -118.4100,
    image: 'https://via.placeholder.com/100x60/2196F3/white?text=Modern+Villa',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    zipcode: '90210'
  },
  {
    id: '3',
    name: 'Classic Beverly Hills Home',
    price: 3200000,
    lat: 34.0650,
    lng: -118.3900,
    image: 'https://via.placeholder.com/100x60/FF9800/white?text=Classic+Home',
    bedrooms: 6,
    bathrooms: 5,
    sqft: 4200,
    zipcode: '90210'
  },
  {
    id: '4',
    name: 'Contemporary Condo',
    price: 1200000,
    lat: 34.0850,
    lng: -118.4200,
    image: 'https://via.placeholder.com/100x60/9C27B0/white?text=Contemporary',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    zipcode: '90210'
  },
  {
    id: '5',
    name: 'Penthouse with City Views',
    price: 4500000,
    lat: 34.0700,
    lng: -118.3800,
    image: 'https://via.placeholder.com/100x60/F44336/white?text=Penthouse',
    bedrooms: 4,
    bathrooms: 4,
    sqft: 3200,
    zipcode: '90210'
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
