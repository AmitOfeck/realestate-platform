import { Request, Response } from 'express';
import { ScraperService } from '../services/scraper.service';
import { ResponseHandler } from '../utils/responseHandler';

export class ScraperController {
  /**
   * Scrapes real estate data from Realtor.com for a given zipcode
   */
  static async scrapeZipcode(req: Request, res: Response): Promise<void> {
    try {
      const { zipcode } = req.params;
      
      if (!zipcode) {
        ResponseHandler.badRequest(res, 'Zipcode is required');
        return;
      }

      // Validate zipcode format (5 digits)
      if (!/^\d{5}$/.test(zipcode)) {
        ResponseHandler.badRequest(res, 'Zipcode must be 5 digits');
        return;
      }

      console.log(`📡 Scraper route hit: ${zipcode}`);
      
      const result = await ScraperService.scrapeRealtor(zipcode);
      
      res.json(result);
    } catch (error) {
      console.error('Error in scrapeZipcode:', error);
      res.json({ success: false, error: 'Failed to fetch HTML' });
    }
  }
}
