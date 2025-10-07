import express from 'express';
import { fetchPropertiesByZipcode } from '../services/scraperService';

const router = express.Router();

console.log('📁 scraper.routes.ts LOADED FULLY');

router.get('/:zipcode', async (req, res) => {
  const { zipcode } = req.params;
  console.log(`📡 Fetching properties for zipcode: ${zipcode}`);

  const result = await fetchPropertiesByZipcode(zipcode);
  res.json(result);
});

export default router;