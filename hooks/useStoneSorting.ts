import { useState, useCallback, useMemo } from 'react';
import { Stone } from '../data/stones';
import { SortOptions, UseStoneSortReturn } from '../types';
import { stoneUtils } from '../utils';

const defaultSortOptions: SortOptions = {
  field: 'name',
  order: 'asc',
};

export const useStoneSorting = (stones: Stone[]): UseStoneSortReturn => {
  const [sortOptions, setSortOptionsState] = useState<SortOptions>(defaultSortOptions);

  const setSortOptions = useCallback((options: Partial<SortOptions>) => {
    setSortOptionsState(prev => ({ ...prev, ...options }));
  }, []);

  const sortedStones = useMemo(() => {
    return stoneUtils.sortStones(stones, sortOptions);
  }, [stones, sortOptions]);

  return {
    sortOptions,
    setSortOptions,
    sortedStones,
  };
};