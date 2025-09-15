import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stone } from '../data/stones';
import { FavoriteItem } from '../types';
import { STORAGE_KEYS, APP_LIMITS } from '../constants';
import { errorUtils } from '../utils';

export interface UseStoneFavoritesReturn {
  favorites: FavoriteItem[];
  addToFavorites: (stone: Stone) => Promise<boolean>;
  removeFromFavorites: (stoneId: string) => Promise<boolean>;
  isFavorite: (stoneId: string) => boolean;
  clearFavorites: () => Promise<boolean>;
  favoritesCount: number;
  isMaxFavoritesReached: boolean;
}

export const useStoneFavorites = (): UseStoneFavoritesReturn => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const favoritesData = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (favoritesData) {
        const parsedFavorites = JSON.parse(favoritesData);
        setFavorites(parsedFavorites);
      }
    } catch (error) {
      errorUtils.logError(error, 'useStoneFavorites.loadFavorites');
    }
  }, []);

  const saveFavorites = useCallback(async (favoritesToSave: FavoriteItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoritesToSave));
      return true;
    } catch (error) {
      errorUtils.logError(error, 'useStoneFavorites.saveFavorites');
      return false;
    }
  }, []);

  const addToFavorites = useCallback(async (stone: Stone): Promise<boolean> => {
    try {
      // Check if already in favorites
      if (favorites.some(fav => fav.id === stone.id)) {
        return false;
      }

      // Check max favorites limit
      if (favorites.length >= APP_LIMITS.MAX_FAVORITES) {
        return false;
      }

      const newFavorite: FavoriteItem = {
        ...stone,
        dateAdded: new Date().toISOString(),
      };

      const updatedFavorites = [newFavorite, ...favorites];
      setFavorites(updatedFavorites);
      
      return await saveFavorites(updatedFavorites);
    } catch (error) {
      errorUtils.logError(error, 'useStoneFavorites.addToFavorites');
      return false;
    }
  }, [favorites, saveFavorites]);

  const removeFromFavorites = useCallback(async (stoneId: string): Promise<boolean> => {
    try {
      const updatedFavorites = favorites.filter(fav => fav.id !== stoneId);
      setFavorites(updatedFavorites);
      
      return await saveFavorites(updatedFavorites);
    } catch (error) {
      errorUtils.logError(error, 'useStoneFavorites.removeFromFavorites');
      return false;
    }
  }, [favorites, saveFavorites]);

  const isFavorite = useCallback((stoneId: string): boolean => {
    return favorites.some(fav => fav.id === stoneId);
  }, [favorites]);

  const clearFavorites = useCallback(async (): Promise<boolean> => {
    try {
      setFavorites([]);
      await AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES);
      return true;
    } catch (error) {
      errorUtils.logError(error, 'useStoneFavorites.clearFavorites');
      return false;
    }
  }, []);

  const favoritesCount = favorites.length;
  const isMaxFavoritesReached = favoritesCount >= APP_LIMITS.MAX_FAVORITES;

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
    favoritesCount,
    isMaxFavoritesReached,
  };
};