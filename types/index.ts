import { Stone } from '../data/stones';

// Navigation Types
export type RootParamList = {
  Home: undefined;
  Library: undefined;
  Collection: undefined;
  Scanner: undefined;
  Profile: undefined;
  StoneDetail: { stone: Stone };
  UserLibrary: undefined;
};

export interface NavigationProps {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}

export interface ScreenProps {
  navigation: NavigationProps;
  route?: {
    params?: any;
  };
}

// Filter Types
export interface FilterState {
  categories: string[];
  colors: string[];
  origins: string[];
  hardnessRange: { min: number; max: number } | null;
}

export interface SortOptions {
  field: 'name' | 'hardness' | 'category' | 'dateAdded';
  order: 'asc' | 'desc';
}

// Search Types
export interface SearchState {
  query: string;
  suggestions: string[];
  history: string[];
  isLoading: boolean;
}

// Collection Types
export interface CollectionItem extends Stone {
  dateAdded: string;
  isCustom?: boolean;
}

export interface FavoriteItem extends Stone {
  dateAdded: string;
}

// Theme Types
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  card: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
}

// Component Props Types
export interface StoneCardProps {
  stone: Stone;
  onPress: (stone: Stone) => void;
  onToggleCollection?: (stone: Stone) => void;
  onToggleFavorite?: (stone: Stone) => void;
  isInCollection?: boolean;
  isFavorite?: boolean;
  viewMode?: 'list' | 'grid';
}

export interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  variant?: 'category' | 'color' | 'origin';
}

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (text: string) => void;
  placeholder?: string;
  suggestions?: string[];
  showSuggestions?: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

// API Types (for future use)
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Storage Types
export interface UserPreferences {
  defaultViewMode: 'list' | 'grid';
  defaultSortBy: 'name' | 'hardness' | 'category';
  enableNotifications: boolean;
  enableHapticFeedback: boolean;
  autoSaveToCollection: boolean;
}

// Hook Return Types
export interface UseStoneFiltersReturn {
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  toggleCategory: (category: string) => void;
  toggleColor: (color: string) => void;
  toggleOrigin: (origin: string) => void;
  setHardnessRange: (range: { min: number; max: number } | null) => void;
  hasActiveFilters: boolean;
}

export interface UseStoneSearchReturn {
  searchState: SearchState;
  searchStones: (query: string) => void;
  clearSearch: () => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  filteredStones: Stone[];
}

export interface UseStoneSortReturn {
  sortOptions: SortOptions;
  setSortOptions: (options: Partial<SortOptions>) => void;
  sortedStones: Stone[];
}

export interface UseErrorHandlerReturn {
  error: AppError | null;
  isLoading: boolean;
  showError: (error: AppError) => void;
  clearError: () => void;
  handleAsyncError: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
  withErrorHandling: <T extends any[], R>(fn: (...args: T) => R) => (...args: T) => R | null;
}

// Component State Types
export interface LibraryScreenState {
  viewMode: 'list' | 'grid';
  showFilters: boolean;
  showSortModal: boolean;
  isLoading: boolean;
}

export interface CollectionScreenState {
  showSortModal: boolean;
  showFilterModal: boolean;
  showAddStoneModal: boolean;
}

// Form Types
export interface CustomStoneForm {
  name: string;
  category: string;
  description: string;
  hardness: string;
  color: string;
  origin: string;
}

// Performance Types
export interface PerformanceMetrics {
  renderTime: number;
  listScrollPerformance: number;
  imageLoadTime: number;
  searchResponseTime: number;
}