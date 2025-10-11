import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import userService from '../services/userService';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth callback
router.post('/google', async (req, res) => {
  console.log('🔥 Google login request received:', req.body);
  
  try {
    const { credential } = req.body;
    console.log('📝 Credential received:', credential ? 'Yes' : 'No');

    if (!credential) {
      console.log('❌ No credential provided');
      return res.status(400).json({
        success: false,
        message: 'No credential provided'
      });
    }

    // Verify the Google token
    console.log('🔄 Verifying Google token...');
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('✅ Google token verified, payload:', payload?.email);
    
    if (!payload) {
      console.log('❌ Invalid token payload');
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Find or create user in database
    console.log('🔄 Finding or creating user...');
    const user = await userService.findOrCreateUser({
      googleId: payload.sub,
      email: payload.email!,
      name: payload.name!,
      picture: payload.picture
    });
    console.log('✅ User processed:', user.email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

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
});

// Verify JWT token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Get user from database
    const user = await userService.findByGoogleId(decoded.userId);
    
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
        picture: user.picture
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

export default router;
