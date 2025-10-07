import { Request, Response } from 'express';
import { getPreviousSalesByZip } from '../services/previousSalesService';

export async function fetchPreviousSales(req: Request, res: Response): Promise<void> {
  try {
    const { zipcode } = req.params;
    
    if (!zipcode) {
      res.status(400).json({ 
        success: false, 
        message: 'Zipcode is required' 
      });
      return;
    }

    console.log(`📡 Fetching previous sales for zipcode: ${zipcode}`);
    
    const properties = await getPreviousSalesByZip(zipcode);
    
    res.status(200).json({ 
      success: true, 
      count: properties.length,
      properties: properties 
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
