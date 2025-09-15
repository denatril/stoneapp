// UI Constants
export const UI_CONSTANTS = {
  BORDER_RADIUS: {
    XS: 4,
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    EXTRA_LARGE: 20,
    ROUND: 25,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
    XXL: 24,
    XXXL: 30,
  },
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 28,
    HUGE: 32,
  },
  SHADOW: {
    LIGHT: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    MEDIUM: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    HEAVY: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 10,
    },
  },
  ICON_SIZE: {
    XS: 16,
    SM: 20,
    MD: 24,
    LG: 28,
    XL: 32,
    XXL: 36,
  },
};



// App Constants
export const APP_CONSTANTS = {
  LOADING_DELAY: 1500,
  SEARCH_DEBOUNCE_DELAY: 300,
  MAX_SEARCH_RESULTS: 50,
  ITEMS_PER_PAGE: 20,
  MAX_FAVORITES: 100,
  MAX_COLLECTION_SIZE: 500,
};

// Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  IS_MANUAL_THEME: 'isManualTheme',
  FAVORITES: 'favorites',
  COLLECTION: 'collection',
  SEARCH_HISTORY: 'searchHistory',
  USER_PREFERENCES: 'userPreferences',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
  PERMISSION_DENIED: 'İzin reddedildi. Lütfen uygulama ayarlarından gerekli izinleri verin.',
  CAMERA_ERROR: 'Kamera erişiminde hata oluştu.',
  STORAGE_ERROR: 'Veri kaydetme/okuma hatası.',
  UNKNOWN_ERROR: 'Bilinmeyen bir hata oluştu.',
  STONE_NOT_FOUND: 'Taş bulunamadı.',
  COLLECTION_FULL: 'Koleksiyon dolu. Maksimum taş sayısına ulaştınız.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  STONE_ADDED: 'Taş başarıyla koleksiyona eklendi!',
  STONE_REMOVED: 'Taş koleksiyondan çıkarıldı.',
  FAVORITE_ADDED: 'Favorilere eklendi!',
  FAVORITE_REMOVED: 'Favorilerden çıkarıldı.',
  SETTINGS_SAVED: 'Ayarlar kaydedildi.',
};

// Gradient Colors
export const GRADIENT_COLORS = {
  PRIMARY: ['#667eea', '#764ba2'],
  SECONDARY: ['#f093fb', '#f5576c'],
  SUCCESS: ['#4facfe', '#00f2fe'],
  WARNING: ['#ffecd2', '#fcb69f'],
  ERROR: ['#ff9a9e', '#fecfef'],
  DARK: ['#2a2a3e', '#1a1a2e'],
  LIGHT: ['#f8f9ff', '#e8f0fe'],
};

// App Limits
export const APP_LIMITS = {
  MAX_FAVORITES: 100,
  MAX_COLLECTION_SIZE: 500,
  MAX_SEARCH_HISTORY: 20,
  MAX_SEARCH_RESULTS: 50,
};

// Filter Defaults
export const FILTER_DEFAULTS = {
  CATEGORIES: [],
  COLORS: [],
  ORIGINS: [],
  HARDNESS_RANGE: null,
};

// Search Defaults
export const SEARCH_DEFAULTS = {
  QUERY: '',
  SUGGESTIONS: [],
  HISTORY: [],
  IS_LOADING: false,
  DEBOUNCE_DELAY: 300,
  MAX_HISTORY_ITEMS: 20,
  MAX_SUGGESTIONS: 10,
};

// Animation Constants
export const ANIMATION_CONSTANTS = {
  DURATION: {
    FAST: 150,
    MEDIUM: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
};