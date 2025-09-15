import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys enum for type safety
export enum StorageKeys {
  USER_PREFERENCES = 'user_preferences',
  FAVORITE_STONES = 'favorite_stones',
  COLLECTION_DATA = 'collection_data',
  SEARCH_HISTORY = 'search_history',
  APP_SETTINGS = 'app_settings',
  USER_SESSION = 'user_session',
  THEME_SETTINGS = 'theme_settings',
  NOTIFICATION_SETTINGS = 'notification_settings',
}

// Simple storage utility
export class SimpleStorage {
  private static instance: SimpleStorage;

  static getInstance(): SimpleStorage {
    if (!SimpleStorage.instance) {
      SimpleStorage.instance = new SimpleStorage();
    }
    return SimpleStorage.instance;
  }

  // Set data with JSON stringify
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonString);
      
      if (__DEV__) {
        console.log(`✅ Stored: ${key}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Failed to store ${key}:`, error);
      }
      throw error;
    }
  }

  // Get data with JSON parse
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await AsyncStorage.getItem(key);
      if (jsonString === null) return null;
      
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`❌ Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  // Remove item
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      
      if (__DEV__) {
        console.log(`🗑️ Removed: ${key}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Failed to remove ${key}:`, error);
      }
      throw error;
    }
  }

  // Clear all storage
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      
      if (__DEV__) {
        console.log('🧹 Storage cleared');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to clear storage:', error);
      }
      throw error;
    }
  }

  // Get all keys
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Failed to get all keys:', error);
      }
      return [];
    }
  }

  // Safe JSON parse utility
  safeJsonParse<T>(jsonString: string | null, fallback: T): T {
    if (!jsonString) return fallback;
    try {
      return JSON.parse(jsonString);
    } catch {
      return fallback;
    }
  }
}

// Export singleton instance
export const simpleStorage = SimpleStorage.getInstance();

// Utility functions for common operations
export const StorageUtils = {
  // Store user preferences
  async setUserPreferences(preferences: any): Promise<void> {
    return simpleStorage.setItem(StorageKeys.USER_PREFERENCES, preferences);
  },

  // Get user preferences
  async getUserPreferences(): Promise<any> {
    return simpleStorage.getItem(StorageKeys.USER_PREFERENCES);
  },

  // Store favorites
  async setFavorites(favorites: any[]): Promise<void> {
    return simpleStorage.setItem(StorageKeys.FAVORITE_STONES, favorites);
  },

  // Get favorites
  async getFavorites(): Promise<any[]> {
    const favorites = await simpleStorage.getItem<any[]>(StorageKeys.FAVORITE_STONES);
    return favorites || [];
  },

  // Store collection
  async setCollection(collection: any[]): Promise<void> {
    return simpleStorage.setItem(StorageKeys.COLLECTION_DATA, collection);
  },

  // Get collection
  async getCollection(): Promise<any[]> {
    const collection = await simpleStorage.getItem<any[]>(StorageKeys.COLLECTION_DATA);
    return collection || [];
  },

  // Store search history
  async setSearchHistory(history: string[]): Promise<void> {
    return simpleStorage.setItem(StorageKeys.SEARCH_HISTORY, history);
  },

  // Get search history
  async getSearchHistory(): Promise<string[]> {
    const history = await simpleStorage.getItem<string[]>(StorageKeys.SEARCH_HISTORY);
    return history || [];
  },
};
