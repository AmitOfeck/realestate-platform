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

export interface SearchHistoryEntry {
  zipcode: string;
  filters?: any;
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

  /**
   * Add search to user history
   */
  async addSearchHistory(userId: string, searchData: SearchHistoryEntry): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Add new search to beginning of array
      user.searchHistory.unshift({
        zipcode: searchData.zipcode,
        timestamp: new Date(),
        filters: searchData.filters
      });

      // Keep only last 50 searches
      if (user.searchHistory.length > 50) {
        user.searchHistory = user.searchHistory.slice(0, 50);
      }

      await user.save();
      console.log('✅ Search history added for user:', user.email);
      return user;
    } catch (error) {
      console.error('Error adding search history:', error);
      throw error;
    }
  }

  /**
   * Get user search history
   */
  async getSearchHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const user = await User.findById(userId).select('searchHistory');
      if (!user) {
        throw new Error('User not found');
      }

      return user.searchHistory.slice(0, limit);
    } catch (error) {
      console.error('Error getting search history:', error);
      throw error;
    }
  }

  /**
   * Add favorite property
   */
  async addFavoriteProperty(userId: string, propertyId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.favoriteProperties.includes(propertyId)) {
        user.favoriteProperties.push(propertyId);
        await user.save();
        console.log('✅ Property added to favorites for user:', user.email);
      }

      return user;
    } catch (error) {
      console.error('Error adding favorite property:', error);
      throw error;
    }
  }

  /**
   * Remove favorite property
   */
  async removeFavoriteProperty(userId: string, propertyId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.favoriteProperties = user.favoriteProperties.filter(id => id !== propertyId);
      await user.save();
      console.log('✅ Property removed from favorites for user:', user.email);
      return user;
    } catch (error) {
      console.error('Error removing favorite property:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: any): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { preferences },
        { new: true }
      );

      if (user) {
        console.log('✅ User preferences updated:', user.email);
      }
      return user;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        totalSearches: user.searchHistory.length,
        favoriteProperties: user.favoriteProperties.length,
        memberSince: user.createdAt,
        lastLogin: user.lastLogin
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

export default new UserService();
