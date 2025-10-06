import { Router } from 'express';
import { ScraperController } from '../controllers/scraper.controller';

const router = Router();

console.log('📁 scraper.routes.ts LOADED FULLY');

// GET /api/scrape/:zipcode
router.get('/:zipcode', ScraperController.scrapeZipcode);

export default router;