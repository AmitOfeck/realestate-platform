import express from 'express';
import { fetchPreviousSales } from '../controllers/previousSalesController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

console.log('📁 previousSalesRoutes.ts LOADED FULLY');

// Protect the route with authentication middleware
router.get('/:zipcode', authenticateToken, fetchPreviousSales);

export default router;
