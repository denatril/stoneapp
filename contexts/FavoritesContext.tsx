import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stone } from '../data/stones';

interface FavoritesContextType {
  favorites: Stone[];
  addToFavorites: (stone: Stone) => void;
  removeFromFavorites: (stoneId: string) => void;
  isFavorite: (stoneId: string) => boolean;
  getFavoritesCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Stone[]>([]);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites: Stone[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addToFavorites = useCallback((stone: Stone) => {
    setFavorites(prev => {
      const isAlreadyFavorite = prev.some(fav => fav.id === stone.id);
      if (isAlreadyFavorite) return prev;
      
      const newFavorites = [...prev, stone];
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const removeFromFavorites = useCallback((stoneId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(stone => stone.id !== stoneId);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((stoneId: string) => {
    return favorites.some(stone => stone.id === stoneId);
  }, [favorites]);

  const getFavoritesCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  const value = useMemo(() => ({
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesCount
  }), [favorites, addToFavorites, removeFromFavorites, isFavorite, getFavoritesCount]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};