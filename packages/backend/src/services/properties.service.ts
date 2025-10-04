import { Property } from '../../../../types/Property';
import { PropertyModel } from '../models/property.model';

export class PropertiesService {
  static async getAllProperties(): Promise<{ properties: Property[]; count: number }> {
    try {
      const [properties, count] = await Promise.all([
        PropertyModel.getAllProperties(),
        PropertyModel.getPropertiesCount()
      ]);

      return { properties, count };
    } catch (error) {
      throw new Error('Failed to fetch properties from database');
    }
  }

  static async getPropertyById(id: string): Promise<Property> {
    try {
      const property = await PropertyModel.getPropertyById(id);
      
      if (!property) {
        throw new Error('Property not found');
      }

      return property;
    } catch (error) {
      if (error instanceof Error && error.message === 'Property not found') {
        throw error;
      }
      throw new Error('Failed to fetch property from database');
    }
  }

  static async getHealthStatus(): Promise<{ message: string; timestamp: string }> {
    try {
      return {
        message: 'Backend server is running',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error('Failed to get health status');
    }
  }
}
