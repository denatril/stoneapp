import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration Constants
export const API_CONFIG = {
  OPENAI: {
    BASE_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-4-vision-preview',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.3,
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    RATE_LIMIT_DELAY: 100, // 100ms between requests
  },
  STORAGE_KEYS: {
    API_KEY: '@crystal_guide_api_key',
    API_USAGE: '@crystal_guide_api_usage',
    API_SETTINGS: '@crystal_guide_api_settings',
  },
  USAGE_LIMITS: {
    DAILY_REQUESTS: 100,
    MONTHLY_REQUESTS: 1000,
    MAX_IMAGE_SIZE: 4 * 1024 * 1024, // 4MB
    SUPPORTED_FORMATS: ['jpeg', 'jpg', 'png', 'webp'] as const,
  },
  ERROR_MESSAGES: {
    NO_API_KEY: 'API anahtarı ayarlanmamış. Lütfen ayarlardan API anahtarınızı girin.',
    INVALID_API_KEY: 'Geçersiz API anahtarı. Lütfen doğru anahtarı girin.',
    RATE_LIMIT: 'API kullanım limiti aşıldı. Lütfen daha sonra tekrar deneyin.',
    NETWORK_ERROR: 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
    IMAGE_TOO_LARGE: 'Görsel çok büyük. Maksimum 4MB boyutunda görsel yükleyebilirsiniz.',
    UNSUPPORTED_FORMAT: 'Desteklenmeyen görsel formatı. JPEG, PNG veya WebP formatında görsel yükleyin.',
    ANALYSIS_FAILED: 'Taş analizi başarısız oldu. Lütfen tekrar deneyin.',
    OFFLINE: 'Çevrimdışı moddasınız. İnternet bağlantınızı kontrol edin.',
  },
} as const;

// API Usage Tracking
interface ApiUsage {
  dailyCount: number;
  monthlyCount: number;
  lastResetDate: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

interface ApiSettings {
  autoRetry: boolean;
  maxRetries: number;
  timeout: number;
  enableOfflineQueue: boolean;
  enableUsageTracking: boolean;
  enableAnalytics: boolean;
}

class ApiConfigManager {
  private defaultSettings: ApiSettings = {
    autoRetry: true,
    maxRetries: 3,
    timeout: 30000,
    enableOfflineQueue: true,
    enableUsageTracking: true,
    enableAnalytics: true,
  };

  // API Key Management
  async setApiKey(apiKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.API_KEY, apiKey);
    } catch (error) {
      throw new Error('API anahtarı kaydedilemedi');
    }
  }

  async getApiKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.API_KEY);
    } catch (error) {
      return null;
    }
  }

  async removeApiKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.STORAGE_KEYS.API_KEY);
    } catch (error) {
      throw new Error('API anahtarı silinemedi');
    }
  }

  async isApiKeyValid(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.OPENAI.BASE_URL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Usage Tracking
  async getUsage(): Promise<ApiUsage> {
    try {
      const stored = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.API_USAGE);
      if (stored) {
        const usage = JSON.parse(stored) as ApiUsage;
        
        // Reset daily count if it's a new day
        const today = new Date().toDateString();
        if (usage.lastResetDate !== today) {
          usage.dailyCount = 0;
          usage.lastResetDate = today;
          await this.saveUsage(usage);
        }
        
        return usage;
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('Usage data could not be loaded:', error);
      }
    }
    
    // Return default usage
    const defaultUsage: ApiUsage = {
      dailyCount: 0,
      monthlyCount: 0,
      lastResetDate: new Date().toDateString(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
    };
    
    await this.saveUsage(defaultUsage);
    return defaultUsage;
  }

  async incrementUsage(success: boolean = true): Promise<void> {
    const usage = await this.getUsage();
    
    usage.dailyCount++;
    usage.monthlyCount++;
    usage.totalRequests++;
    
    if (success) {
      usage.successfulRequests++;
    } else {
      usage.failedRequests++;
    }
    
    await this.saveUsage(usage);
  }

  private async saveUsage(usage: ApiUsage): Promise<void> {
    try {
      await AsyncStorage.setItem(
        API_CONFIG.STORAGE_KEYS.API_USAGE,
        JSON.stringify(usage)
      );
    } catch (error) {
      if (__DEV__) {
        console.warn('Usage data could not be saved:', error);
      }
    }
  }

  async resetMonthlyUsage(): Promise<void> {
    const usage = await this.getUsage();
    usage.monthlyCount = 0;
    await this.saveUsage(usage);
  }

  async canMakeRequest(): Promise<{ allowed: boolean; reason?: string }> {
    const usage = await this.getUsage();
    
    if (usage.dailyCount >= API_CONFIG.USAGE_LIMITS.DAILY_REQUESTS) {
      return {
        allowed: false,
        reason: 'Günlük API kullanım limiti aşıldı'
      };
    }
    
    if (usage.monthlyCount >= API_CONFIG.USAGE_LIMITS.MONTHLY_REQUESTS) {
      return {
        allowed: false,
        reason: 'Aylık API kullanım limiti aşıldı'
      };
    }
    
    return { allowed: true };
  }

  // Settings Management
  async getSettings(): Promise<ApiSettings> {
    try {
      const stored = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.API_SETTINGS);
      if (stored) {
        return { ...this.defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('Settings could not be loaded:', error);
      }
    }
    
    return this.defaultSettings;
  }

  async updateSettings(settings: Partial<ApiSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      
      await AsyncStorage.setItem(
        API_CONFIG.STORAGE_KEYS.API_SETTINGS,
        JSON.stringify(newSettings)
      );
    } catch (error) {
      throw new Error('Ayarlar kaydedilemedi');
    }
  }

  async resetSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(API_CONFIG.STORAGE_KEYS.API_SETTINGS);
    } catch (error) {
      throw new Error('Ayarlar sıfırlanamadı');
    }
  }

  // Image Validation
  validateImage(imageUri: string, fileSize: number): { valid: boolean; error?: string } {
    // Check file size
    if (fileSize > API_CONFIG.USAGE_LIMITS.MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: API_CONFIG.ERROR_MESSAGES.IMAGE_TOO_LARGE
      };
    }
    
    // Check format
    const extension = imageUri.split('.').pop()?.toLowerCase();
    if (!extension || !API_CONFIG.USAGE_LIMITS.SUPPORTED_FORMATS.includes(extension as any)) {
      return {
        valid: false,
        error: API_CONFIG.ERROR_MESSAGES.UNSUPPORTED_FORMAT
      };
    }
    
    return { valid: true };
  }

  // Get configuration for API service
  async getApiServiceConfig() {
    const settings = await this.getSettings();
    const apiKey = await this.getApiKey();
    
    return {
      apiKey: apiKey || '',
      baseUrl: API_CONFIG.OPENAI.BASE_URL,
      model: API_CONFIG.OPENAI.MODEL,
      maxTokens: API_CONFIG.OPENAI.MAX_TOKENS,
      temperature: API_CONFIG.OPENAI.TEMPERATURE,
      timeout: settings.timeout,
      retryAttempts: settings.maxRetries,
      retryDelay: API_CONFIG.OPENAI.RETRY_DELAY,
      autoRetry: settings.autoRetry,
      enableOfflineQueue: settings.enableOfflineQueue,
    };
  }
}

// Export singleton instance
export const apiConfigManager = new ApiConfigManager();
export default apiConfigManager;

// Export types
export type { ApiUsage, ApiSettings };