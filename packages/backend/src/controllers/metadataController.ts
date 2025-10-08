import { Request, Response } from 'express';
import { 
  getMetadataByZipcode, 
  deleteMetadata, 
  getAllMetadata, 
  clearAllMetadata 
} from '../services/metadataService';

// GET /api/metadata/:zipcode - Get metadata for specific zipcode
export async function getMetadata(req: Request, res: Response): Promise<void> {
  try {
    const { zipcode } = req.params;
    
    if (!zipcode) {
      res.status(400).json({ 
        success: false, 
        message: 'Zipcode is required' 
      });
      return;
    }

    // Validate zipcode format
    if (!/^\d{5}$/.test(zipcode)) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid zipcode format. Must be 5 digits.' 
      });
      return;
    }
    
    console.log(`📡 Getting metadata for zipcode: ${zipcode}`);
    
    const metadata = await getMetadataByZipcode(zipcode);
    
    if (metadata) {
      res.status(200).json({ 
        success: true, 
        data: metadata 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: `No metadata found for zipcode ${zipcode}` 
      });
    }
    
  } catch (error) {
    console.error('❌ Error in getMetadata:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get metadata' 
    });
  }
}

// DELETE /api/metadata/:zipcode - Reset metadata for specific zipcode
export async function deleteMetadataByZipcode(req: Request, res: Response): Promise<void> {
  try {
    const { zipcode } = req.params;
    
    if (!zipcode) {
      res.status(400).json({ 
        success: false, 
        message: 'Zipcode is required' 
      });
      return;
    }

    // Validate zipcode format
    if (!/^\d{5}$/.test(zipcode)) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid zipcode format. Must be 5 digits.' 
      });
      return;
    }
    
    console.log(`🗑️ Deleting metadata for zipcode: ${zipcode}`);
    
    await deleteMetadata(zipcode);
    
    res.status(200).json({ 
      success: true, 
      message: `Metadata for zipcode ${zipcode} has been reset` 
    });
    
  } catch (error) {
    console.error('❌ Error in deleteMetadataByZipcode:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete metadata' 
    });
  }
}

// GET /api/metadata - Get all metadata (admin)
export async function getAllMetadataController(req: Request, res: Response): Promise<void> {
  try {
    console.log(`📡 Getting all metadata`);
    
    const metadata = await getAllMetadata();
    
    res.status(200).json({ 
      success: true, 
      data: metadata,
      count: metadata.length
    });
    
  } catch (error) {
    console.error('❌ Error in getAllMetadataController:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get all metadata' 
    });
  }
}

// DELETE /api/metadata - Clear all metadata
export async function clearAllMetadataController(req: Request, res: Response): Promise<void> {
  try {
    console.log(`🗑️ Clearing all metadata`);
    
    await clearAllMetadata();
    
    res.status(200).json({ 
      success: true, 
      message: 'All metadata has been cleared' 
    });
    
  } catch (error) {
    console.error('❌ Error in clearAllMetadataController:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear all metadata' 
    });
  }
}
