import { Request, Response } from 'express';
import userService from '../services/userService';
import jwt from 'jsonwebtoken';

// Helper function to get user from JWT token
const getUserFromToken = (req: Request) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('No token provided');
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
  return decoded.userId;
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    const user = await userService.findByGoogleId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        searchHistory: user.searchHistory.slice(0, 10), // Last 10 searches
        favoriteProperties: user.favoriteProperties,
        preferences: user.preferences,
        stats: {
          totalSearches: user.searchHistory.length,
          favoriteProperties: user.favoriteProperties.length,
          memberSince: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};

export const addSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    const { zipcode, filters } = req.body;

    if (!zipcode) {
      return res.status(400).json({
        success: false,
        message: 'Zipcode is required'
      });
    }

    await userService.addSearchHistory(userId, { zipcode, filters });

    res.json({
      success: true,
      message: 'Search history added successfully'
    });
  } catch (error) {
    console.error('Add search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add search history'
    });
  }
};

export const getSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    const limit = parseInt(req.query.limit as string) || 20;

    const searchHistory = await userService.getSearchHistory(userId, limit);

    res.json({
      success: true,
      searchHistory
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search history'
    });
  }
};

export const addFavoriteProperty = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    await userService.addFavoriteProperty(userId, propertyId);

    res.json({
      success: true,
      message: 'Property added to favorites'
    });
  } catch (error) {
    console.error('Add favorite property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add favorite property'
    });
  }
};

export const removeFavoriteProperty = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    await userService.removeFavoriteProperty(userId, propertyId);

    res.json({
      success: true,
      message: 'Property removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove favorite property'
    });
  }
};

export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    const { preferences } = req.body;

    await userService.updatePreferences(userId, preferences);

    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    const stats = await userService.getUserStats(userId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user stats'
    });
  }
};
