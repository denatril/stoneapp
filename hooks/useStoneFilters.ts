import { useState, useCallback, useMemo } from 'react';
import { FilterState, UseStoneFiltersReturn } from '../types';

const initialFilterState: FilterState = {
  categories: [],
  colors: [],
  origins: [],
  hardnessRange: null,
};

export const useStoneFilters = (): UseStoneFiltersReturn => {
  const [filters, setFiltersState] = useState<FilterState>(initialFilterState);

  const setFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(initialFilterState);
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setFiltersState(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const toggleColor = useCallback((color: string) => {
    setFiltersState(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }));
  }, []);

  const toggleOrigin = useCallback((origin: string) => {
    setFiltersState(prev => ({
      ...prev,
      origins: prev.origins.includes(origin)
        ? prev.origins.filter(o => o !== origin)
        : [...prev.origins, origin],
    }));
  }, []);

  const setHardnessRange = useCallback((range: { min: number; max: number } | null) => {
    setFiltersState(prev => ({ ...prev, hardnessRange: range }));
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.categories.length > 0 ||
      filters.colors.length > 0 ||
      filters.origins.length > 0 ||
      filters.hardnessRange !== null
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    clearFilters,
    toggleCategory,
    toggleColor,
    toggleOrigin,
    setHardnessRange,
    hasActiveFilters,
  };
};