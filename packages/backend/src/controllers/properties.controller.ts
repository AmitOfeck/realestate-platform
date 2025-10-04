import { Request, Response } from 'express';
import { PropertiesService } from '../services/properties.service';
import { ResponseHandler } from '../utils/responseHandler';

export class PropertiesController {
  static async getAllProperties(req: Request, res: Response): Promise<void> {
    try {
      const { properties, count } = await PropertiesService.getAllProperties();
      
      ResponseHandler.success(res, {
        data: properties,
        count
      }, 'Properties fetched successfully');
    } catch (error) {
      console.error('Error in getAllProperties:', error);
      ResponseHandler.internalError(res, 'Failed to fetch properties');
    }
  }

  static async getPropertyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        ResponseHandler.badRequest(res, 'Property ID is required');
        return;
      }

      const property = await PropertiesService.getPropertyById(id);
      
      ResponseHandler.success(res, property, 'Property fetched successfully');
    } catch (error) {
      console.error('Error in getPropertyById:', error);
      
      if (error instanceof Error && error.message === 'Property not found') {
        ResponseHandler.notFound(res, 'Property not found');
        return;
      }
      
      ResponseHandler.internalError(res, 'Failed to fetch property');
    }
  }

  static async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      const healthData = await PropertiesService.getHealthStatus();
      
      ResponseHandler.success(res, healthData, 'Health check successful');
    } catch (error) {
      console.error('Error in getHealthStatus:', error);
      ResponseHandler.internalError(res, 'Health check failed');
    }
  }
}
