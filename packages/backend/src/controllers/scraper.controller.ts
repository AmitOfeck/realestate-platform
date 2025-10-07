import { Request, Response } from 'express';
import { ScraperService } from '../services/scraper.service';

export class ScraperController {
  /**
   * Fetches real estate data from ATTOM Data API for a given zipcode
   */
  static async scrapeZipcode(req: Request, res: Response): Promise<void> {
    try {
      const { zipcode } = req.params;
      
      if (!zipcode) {
        console.error('❌ No zipcode provided');
        res.json({ 
          success: false, 
          message: 'Zipcode is required' 
        });
        return;
      }

      // Validate zipcode format (5 digits)
      if (!/^\d{5}$/.test(zipcode)) {
        console.error(`❌ Invalid zipcode format: ${zipcode}`);
        res.json({ 
          success: false, 
          message: 'Zipcode must be 5 digits' 
        });
        return;
      }

      console.log(`📡 Scraper route hit: ${zipcode}`);
      
      const result = await ScraperService.fetchPropertiesByZipcode(zipcode);
      
      if (result.success) {
        console.log(`✅ Successfully fetched ${result.count} properties for zipcode ${zipcode}`);
      } else {
        console.error(`❌ Failed to fetch properties for zipcode ${zipcode}: ${result.message}`);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ Error in scrapeZipcode:', error);
      res.json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
}
