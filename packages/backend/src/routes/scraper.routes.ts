import express from 'express';
import { getPreviousSalesByZip } from '../services/previousSalesService';

const router = express.Router();

console.log('📁 scraper.routes.ts LOADED FULLY');

router.get('/:zipcode', async (req, res) => {
  const { zipcode } = req.params;
  console.log(`📡 Fetching previous sales for zipcode: ${zipcode}`);

  const result = await getPreviousSalesByZip(zipcode);
  res.json(result);
});

export default router;