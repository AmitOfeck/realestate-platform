import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userService from '../services/userService';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Get user from database to ensure they still exist
    const user = await userService.findById(decoded.userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    console.log(`✅ Authenticated user: ${user.email}`);
    next();

  } catch (error) {
    console.error('❌ Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }
};
