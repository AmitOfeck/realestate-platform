import express from 'express';
import { fetchPreviousSales } from '../controllers/previousSalesController';

const router = express.Router();

console.log('📁 previousSalesRoutes.ts LOADED FULLY');

router.get('/:zipcode', fetchPreviousSales);

export default router;
