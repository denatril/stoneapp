import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stone } from '../data/stones';
import { SearchState, UseStoneSearchReturn } from '../types';
import { stoneUtils, performanceUtils } from '../utils';
import { STORAGE_KEYS, SEARCH_DEFAULTS } from '../constants';

const initialSearchState: SearchState = {
  query: '',
  suggestions: [],
  history: [],
  isLoading: false,
};

export const useStoneSearch = (stones: Stone[]): UseStoneSearchReturn => {
  const [searchState, setSearchState] = useState<SearchState>(initialSearchState);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = useCallback(async () => {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      if (history) {
        const parsedHistory = JSON.parse(history);
        setSearchState(prev => ({ ...prev, history: parsedHistory }));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  const saveSearchHistory = useCallback(async (history: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => performanceUtils.debounce((query: string) => {
      setSearchState(prev => ({ ...prev, isLoading: false }));
    }, SEARCH_DEFAULTS.DEBOUNCE_DELAY),
    []
  );

  const searchStones = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      isLoading: query.length > 0,
    }));

    if (query.length > 0) {
      debouncedSearch(query);
    }
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      query: '',
      isLoading: false,
    }));
  }, []);

  const addToHistory = useCallback(async (query: string) => {
    if (!query.trim() || searchState.history.includes(query)) return;

    const newHistory = [query, ...searchState.history]
      .slice(0, SEARCH_DEFAULTS.MAX_HISTORY_ITEMS);

    setSearchState(prev => ({ ...prev, history: newHistory }));
    await saveSearchHistory(newHistory);
  }, [searchState.history, saveSearchHistory]);

  const clearHistory = useCallback(async () => {
    setSearchState(prev => ({ ...prev, history: [] }));
    await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  }, []);

  // Generate search suggestions based on query
  const suggestions = useMemo(() => {
    if (!searchState.query || searchState.query.length < 2) return [];

    const query = searchState.query.toLowerCase();
    const allSuggestions = new Set<string>();

    stones.forEach(stone => {
      // Add stone names
      if (stone.name.toLowerCase().includes(query)) {
        allSuggestions.add(stone.name);
      }

      // Add categories
      if (stone.category.toLowerCase().includes(query)) {
        allSuggestions.add(stone.category);
      }

      // Add colors
      stone.color.forEach(color => {
        if (color.toLowerCase().includes(query)) {
          allSuggestions.add(color);
        }
      });

      // Add origins
      stone.origin.forEach(origin => {
        if (origin.toLowerCase().includes(query)) {
          allSuggestions.add(origin);
        }
      });

      // Add properties
      stone.properties.forEach(property => {
        if (property.toLowerCase().includes(query)) {
          allSuggestions.add(property);
        }
      });
    });

    return Array.from(allSuggestions)
      .filter(suggestion => suggestion !== searchState.query)
      .slice(0, SEARCH_DEFAULTS.MAX_SUGGESTIONS);
  }, [stones, searchState.query]);

  // Filter stones based on search query
  const filteredStones = useMemo(() => {
    if (!searchState.query.trim()) return stones;
    return stoneUtils.searchStones(stones, searchState.query);
  }, [stones, searchState.query]);

  // Update suggestions in state
  useEffect(() => {
    setSearchState(prev => ({ ...prev, suggestions }));
  }, [suggestions]);

  return {
    searchState: {
      ...searchState,
      suggestions,
    },
    searchStones,
    clearSearch,
    addToHistory,
    clearHistory,
    filteredStones,
  };
};