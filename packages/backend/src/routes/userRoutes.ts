import express from 'express';
import {
  getUserProfile,
  addSearchHistory,
  getSearchHistory,
  addFavoriteProperty,
  removeFavoriteProperty,
  updatePreferences,
  getUserStats
} from '../controllers/userController';

const router = express.Router();

// User profile routes
router.get('/profile', getUserProfile);
router.get('/stats', getUserStats);

// Search history routes
router.post('/search-history', addSearchHistory);
router.get('/search-history', getSearchHistory);

// Favorite properties routes
router.post('/favorites', addFavoriteProperty);
router.delete('/favorites', removeFavoriteProperty);

// Preferences routes
router.put('/preferences', updatePreferences);

export default router;
