import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import userService from '../services/userService';

class AuthController {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Handle Google OAuth login
   */
  async googleLogin(req: Request, res: Response): Promise<void> {
    console.log('🔥 Google login request received:', req.body);
    
    try {
      const { credential } = req.body;
      console.log('📝 Credential received:', credential ? 'Yes' : 'No');

      // Validate request
      if (!credential) {
        console.log('❌ No credential provided');
        res.status(400).json({
          success: false,
          message: 'No credential provided'
        });
        return;
      }

      // Verify Google token
      const googleUser = await this.verifyGoogleToken(credential);
      
      // Find or create user in database
      console.log('🔄 Finding or creating user...');
      const user = await userService.findOrCreateUser({
        googleId: googleUser.sub,
        email: googleUser.email!,
        name: googleUser.name!,
        picture: googleUser.picture
      });
      console.log('✅ User processed:', user.email);

      // Generate JWT token
      const token = this.generateJWTToken(String(user._id), user.email);

      res.json({
        success: true,
        user: {
          id: user._id,
          googleId: user.googleId,
          email: user.email,
          name: user.name,
          picture: user.picture
        },
        token,
        message: 'Login successful'
      });

    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }

  /**
   * Verify JWT token and return user info
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const token = this.extractTokenFromHeader(req);
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'No token provided'
        });
        return;
      }

      // Verify JWT token
      const decoded = this.verifyJWTToken(token);
      
      // Get user from database
      const user = await userService.findByGoogleId(decoded.userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      res.json({
        success: true,
        user: {
          id: user._id,
          googleId: user.googleId,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  }

  /**
   * Verify Google ID token and return payload
   */
  private async verifyGoogleToken(credential: string): Promise<any> {
    console.log('🔄 Verifying Google token...');
    
    const ticket = await this.client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('✅ Google token verified, payload:', payload?.email);
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return payload;
  }

  /**
   * Generate JWT token for user
   */
  private generateJWTToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
  }

  /**
   * Verify JWT token and return decoded payload
   */
  private verifyJWTToken(token: string): any {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  }

  /**
   * Extract token from Authorization header
   */
  private extractTokenFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.replace('Bearer ', '');
  }
}

export default new AuthController();
