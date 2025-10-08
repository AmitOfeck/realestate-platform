import { ZipcodeMetadataModel } from '../models/zipcodeMetadataModel';
import { ZipcodeMetadata } from '../types/metadata';

// Helper function to get last fetch date for a zipcode
export async function getLastFetchDate(zipcode: string): Promise<Date | null> {
  try {
    const metadata = await ZipcodeMetadataModel.findOne({ zipcode });
    return metadata ? metadata.lastFetchDate : null;
  } catch (error) {
    console.warn(`⚠️ Error getting last fetch date for zipcode ${zipcode}:`, error);
    return null;
  }
}

// Helper function to update last fetch date for a zipcode
export async function updateLastFetchDate(zipcode: string, fetchDate: Date): Promise<void> {
  try {
    await ZipcodeMetadataModel.findOneAndUpdate(
      { zipcode },
      { 
        zipcode,
        lastFetchDate: fetchDate,
        lastApiCallDate: fetchDate,
        $inc: { totalPropertiesCount: 0 } // This will be updated when we save new houses
      },
      { upsert: true, new: true }
    );
    console.log(`📅 Updated last fetch date for zipcode ${zipcode} to ${fetchDate.toISOString()}`);
  } catch (error) {
    console.warn(`⚠️ Error updating last fetch date for zipcode ${zipcode}:`, error);
  }
}

// Get metadata for a specific zipcode
export async function getMetadataByZipcode(zipcode: string): Promise<ZipcodeMetadata | null> {
  try {
    const metadata = await ZipcodeMetadataModel.findOne({ zipcode });
    return metadata;
  } catch (error) {
    console.warn(`⚠️ Error getting metadata for zipcode ${zipcode}:`, error);
    return null;
  }
}

// Delete metadata for a specific zipcode
export async function deleteMetadata(zipcode: string): Promise<void> {
  try {
    const result = await ZipcodeMetadataModel.deleteOne({ zipcode });
    if (result.deletedCount > 0) {
      console.log(`🗑️ Deleted metadata for zipcode ${zipcode}`);
    } else {
      console.log(`📭 No metadata found for zipcode ${zipcode}`);
    }
  } catch (error) {
    console.warn(`⚠️ Error deleting metadata for zipcode ${zipcode}:`, error);
    throw error;
  }
}

// Get all metadata
export async function getAllMetadata(): Promise<ZipcodeMetadata[]> {
  try {
    const metadata = await ZipcodeMetadataModel.find({}).sort({ zipcode: 1 });
    return metadata;
  } catch (error) {
    console.warn(`⚠️ Error getting all metadata:`, error);
    throw error;
  }
}

// Clear all metadata
export async function clearAllMetadata(): Promise<void> {
  try {
    const result = await ZipcodeMetadataModel.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} metadata records`);
  } catch (error) {
    console.warn(`⚠️ Error clearing all metadata:`, error);
    throw error;
  }
}

// Update total properties count for a zipcode
export async function updateTotalPropertiesCount(zipcode: string, count: number): Promise<void> {
  try {
    await ZipcodeMetadataModel.findOneAndUpdate(
      { zipcode },
      { $inc: { totalPropertiesCount: count } },
      { upsert: true }
    );
    console.log(`📊 Updated total properties count for zipcode ${zipcode} by ${count}`);
  } catch (error) {
    console.warn(`⚠️ Error updating total properties count for zipcode ${zipcode}:`, error);
  }
}
