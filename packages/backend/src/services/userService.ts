import User, { IUser } from '../models/userModel';

export interface CreateUserData {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

export interface UpdateUserData {
  name?: string;
  picture?: string;
  lastLogin?: Date;
}

class UserService {
  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ googleId });
    } catch (error) {
      console.error('Error finding user by Google ID:', error);
      throw error;
    }
  }

  /**
   * Find user by MongoDB ID
   */
  async findById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      const user = new User({
        googleId: userData.googleId,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        lastLogin: new Date()
      });

      const savedUser = await user.save();
      console.log('✅ New user created:', savedUser.email);
      return savedUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update existing user
   */
  async updateUser(googleId: string, updateData: UpdateUserData): Promise<IUser | null> {
    try {
      const user = await User.findOneAndUpdate(
        { googleId },
        { 
          ...updateData,
          lastLogin: new Date()
        },
        { new: true }
      );

      if (user) {
        console.log('✅ User updated:', user.email);
      }

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Find or create user (for OAuth flow)
   */
  async findOrCreateUser(userData: CreateUserData): Promise<IUser> {
    try {
      console.log('🔍 Looking for user with Google ID:', userData.googleId);
      let user = await this.findByGoogleId(userData.googleId);
      
      if (!user) {
        console.log('🆕 Creating new user...');
        user = await this.createUser(userData);
        console.log('✅ New user created with ID:', user._id);
      } else {
        console.log('🔄 Updating existing user with ID:', user._id);
        user = await this.updateUser(userData.googleId, {
          name: userData.name,
          picture: userData.picture
        });
        console.log('✅ User updated with ID:', user?._id);
      }

      return user!;
    } catch (error) {
      console.error('❌ Error in findOrCreateUser:', error);
      throw error;
    }
  }
}

export default new UserService();