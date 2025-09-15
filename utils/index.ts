import { Stone } from '../data/stones';
import { FilterState, SortOptions } from '../types';
import { ERROR_MESSAGES } from '../constants';

// Re-export simplified storage
export * from './simpleStorage';

// String Utilities
export const stringUtils = {
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  truncate: (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  },

  removeAccents: (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  searchNormalize: (str: string): string => {
    return stringUtils.removeAccents(str.toLowerCase().trim());
  },
};

// Array Utilities
export const arrayUtils = {
  removeDuplicates: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },

  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
};

// Stone Utilities
export const stoneUtils = {
  filterStones: (stones: Stone[], filters: FilterState): Stone[] => {
    return stones.filter(stone => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(stone.category)) {
        return false;
      }

      // Color filter
      if (filters.colors.length > 0) {
        const hasMatchingColor = stone.color.some(color => 
          filters.colors.includes(color)
        );
        if (!hasMatchingColor) return false;
      }

      // Origin filter
      if (filters.origins.length > 0) {
        const hasMatchingOrigin = stone.origin.some(origin => 
          filters.origins.includes(origin)
        );
        if (!hasMatchingOrigin) return false;
      }

      // Hardness range filter
      if (filters.hardnessRange) {
        const { min, max } = filters.hardnessRange;
        if (stone.hardness < min || stone.hardness > max) {
          return false;
        }
      }

      return true;
    });
  },

  sortStones: (stones: Stone[], sortOptions: SortOptions): Stone[] => {
    const { field, order } = sortOptions;
    
    return [...stones].sort((a, b) => {
      let comparison = 0;
      
      switch (field) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'tr');
          break;
        case 'hardness':
          comparison = a.hardness - b.hardness;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category, 'tr');
          break;
        default:
          comparison = 0;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
  },

  searchStones: (stones: Stone[], query: string): Stone[] => {
    if (!query.trim()) return stones;
    
    const normalizedQuery = stringUtils.searchNormalize(query);
    
    return stones.filter(stone => {
      const searchFields = [
        stone.name,
        stone.scientificName,
        stone.category,
        ...stone.color,
        ...stone.origin,
        ...stone.properties,
        stone.description,
      ];
      
      return searchFields.some(field => 
        stringUtils.searchNormalize(field).includes(normalizedQuery)
      );
    });
  },

  getStoneById: (stones: Stone[], id: string): Stone | undefined => {
    return stones.find(stone => stone.id === id);
  },

  generateStoneId: (): string => {
    return `stone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};

// Date Utilities
export const dateUtils = {
  formatDate: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatDateTime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  getRelativeTime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    
    return dateUtils.formatDate(d);
  },
};

// Validation Utilities
export const validationUtils = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidStone: (stone: Partial<Stone>): boolean => {
    return !!(stone.name && stone.category && stone.hardness);
  },

  isValidHardness: (hardness: number): boolean => {
    return hardness >= 1 && hardness <= 10;
  },
};

// Performance Utilities
export const performanceUtils = {
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },

  measurePerformance: (name: string, fn: () => void): number => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    // Performance logging removed for production
    return duration;
  },
};

// Error Utilities
export const errorUtils = {
  createError: (code: string, message: string, details?: any) => {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  },

  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.code && ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES]) {
      return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES];
    }
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  },

  logError: (_error: any, _context?: string) => {
    // Error logging handled by crash reporting service
    // Here you could integrate with crash reporting services like Sentry
  },
};

// Storage Utilities
export const storageUtils = {
  safeJsonParse: <T>(jsonString: string | null, fallback: T): T => {
    if (!jsonString) return fallback;
    try {
      return JSON.parse(jsonString);
    } catch {
      return fallback;
    }
  },

  safeJsonStringify: (data: any): string | null => {
    try {
      return JSON.stringify(data);
    } catch {
      return null;
    }
  },
};

// Color Utilities
export const colorUtils = {
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  getContrastColor: (backgroundColor: string): string => {
    // Simple contrast calculation - returns black or white
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  },
};