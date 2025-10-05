import { Router } from 'express';
import { PropertiesController } from '../controllers/properties.controller';

const router = Router();

// Health check route
router.get('/health', PropertiesController.getHealthStatus);

// Properties routes
router.get('/', PropertiesController.getAllProperties);
router.get('/:id', PropertiesController.getPropertyById);

export default router;
