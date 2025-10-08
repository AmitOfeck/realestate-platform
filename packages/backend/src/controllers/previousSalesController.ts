import { Request, Response } from 'express';
import { getPreviousSalesByZip } from '../services/previousSalesService';

export async function fetchPreviousSales(req: Request, res: Response): Promise<void> {
  try {
    const { zipcode } = req.params;
    const query = req.query;
    
    if (!zipcode) {
      res.status(400).json({ 
        success: false, 
        message: 'Zipcode is required' 
      });
      return;
    }

    // Parse pagination parameters
    const page = query.page ? Math.max(1, parseInt(query.page as string)) : 1;
    const limit = query.limit ? Math.min(100, Math.max(1, parseInt(query.limit as string))) : 12;

    // Parse filter parameters
    const filters = {
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      minBeds: query.minBeds ? Number(query.minBeds) : undefined,
      maxBeds: query.maxBeds ? Number(query.maxBeds) : undefined,
      minSqft: query.minSqft ? Number(query.minSqft) : undefined,
      maxSqft: query.maxSqft ? Number(query.maxSqft) : undefined,
      yearBuiltFrom: query.yearBuiltFrom ? Number(query.yearBuiltFrom) : undefined,
      yearBuiltTo: query.yearBuiltTo ? Number(query.yearBuiltTo) : undefined,
      yearOfSaleFrom: query.yearOfSaleFrom ? Number(query.yearOfSaleFrom) : undefined,
      yearOfSaleTo: query.yearOfSaleTo ? Number(query.yearOfSaleTo) : undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });
    
    console.log(`📡 Fetching previous sales for zipcode: ${zipcode} (page ${page}, limit ${limit}) with filters:`, filters);
    
    const result = await getPreviousSalesByZip(zipcode, filters, page, limit);
    
    res.status(200).json({ 
      success: true, 
      properties: result.properties,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('❌ Error in fetchPreviousSales:', error);
    
    let message = 'Failed to fetch sales data';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid zipcode')) {
        message = error.message;
        statusCode = 400;
      } else if (error.message.includes('Missing ATTOM API')) {
        message = 'API configuration error';
        statusCode = 500;
      }
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message: message 
    });
  }
}