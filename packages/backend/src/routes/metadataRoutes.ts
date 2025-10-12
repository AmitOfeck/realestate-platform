import express from 'express';
import { 
  getMetadata, 
  deleteMetadataByZipcode, 
  getAllMetadataController, 
  clearAllMetadataController 
} from '../controllers/metadataController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/metadata/:zipcode - Get metadata for specific zipcode
router.get('/:zipcode', authenticateToken, getMetadata);

// DELETE /api/metadata/:zipcode - Reset metadata for specific zipcode
router.delete('/:zipcode', authenticateToken, deleteMetadataByZipcode);

// GET /api/metadata - Get all metadata (admin)
router.get('/', authenticateToken, getAllMetadataController);

// DELETE /api/metadata - Clear all metadata
router.delete('/', authenticateToken, clearAllMetadataController);

export default router;
