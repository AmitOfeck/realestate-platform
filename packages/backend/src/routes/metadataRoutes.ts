import express from 'express';
import { 
  getMetadata, 
  deleteMetadataByZipcode, 
  getAllMetadataController, 
  clearAllMetadataController 
} from '../controllers/metadataController';

const router = express.Router();

// GET /api/metadata/:zipcode - Get metadata for specific zipcode
router.get('/:zipcode', getMetadata);

// DELETE /api/metadata/:zipcode - Reset metadata for specific zipcode
router.delete('/:zipcode', deleteMetadataByZipcode);

// GET /api/metadata - Get all metadata (admin)
router.get('/', getAllMetadataController);

// DELETE /api/metadata - Clear all metadata
router.delete('/', clearAllMetadataController);

export default router;
