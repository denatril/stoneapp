import { apiConfigManager } from '../config/apiConfig';

// API Configuration
interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  requestId: string;
}

interface StoneAnalysisRequest {
  imageBase64: string;
  imageFormat: 'jpeg' | 'png' | 'webp';
  analysisType: 'identification' | 'properties' | 'full';
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

interface StoneAnalysisResponse {
  stoneName: string;
  confidence: number;
  properties: {
    hardness: number;
    color: string;
    category: string;
    origin: string;
    chakra?: string;
    healingProperties: string[];
    metaphysicalProperties: string[];
  };
  description: string;
  imageUrl?: string;
  alternativePossibilities?: Array<{
    name: string;
    confidence: number;
  }>;
}

class ApiService {
  private config: ApiConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private requestCounter = 0;

  constructor() {
    this.config = {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '', // Will be set from environment or user input
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000 // 1 second
    };
    
    // Load API key from storage on initialization (fire and forget)
    this.initializeApiKey().catch(error => {
      console.error('Failed to initialize API key:', error);
    });
  }

  // Initialize API key from storage
  private async initializeApiKey(): Promise<void> {
    try {
      const storedKey = await apiConfigManager.getApiKey();
      if (storedKey) {
        this.config.apiKey = storedKey;
      }
    } catch (error) {
      console.error('Failed to load API key from storage:', error);
    }
  }

  // Set API key (to be called after user provides it)
  async setApiKey(apiKey: string): Promise<void> {
    this.config.apiKey = apiKey;
    try {
      await apiConfigManager.setApiKey(apiKey);
    } catch (error) {
      console.error('Failed to save API key to storage:', error);
      // Still keep the key in memory even if storage fails
    }
  }

  // Get API key status
  async isApiKeySet(): Promise<boolean> {
    if (this.config.apiKey.length > 0) {
      return true;
    }
    // Check if API key exists in storage
    const storedKey = await apiConfigManager.getApiKey();
    if (storedKey) {
      this.config.apiKey = storedKey;
      return true;
    }
    return false;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    this.requestCounter++;
    return `req_${Date.now()}_${this.requestCounter}`;
  }

  // Generic API request method
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    requestId: string
  ): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const endTime = performance.now();
      
      // Log API response time in development
      if (__DEV__) {
        console.log(`API ${endpoint} response time: ${endTime - startTime}ms`);
      }
      
      return {
        success: true,
        data,
        timestamp: Date.now(),
        requestId
      };
      
    } catch (error) {
      const endTime = performance.now();
      
      // Log API error response time in development
      if (__DEV__) {
        console.log(`API ${endpoint} error response time: ${endTime - startTime}ms`, error);
      }
      
      // Track failed API usage
      try {
        await apiConfigManager.incrementUsage(false);
      } catch (usageError) {
        console.error('Failed to track API usage:', usageError);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now(),
        requestId
      };
    }
  }

  // Retry mechanism for failed requests
  private async makeRequestWithRetry<T>(
    endpoint: string,
    options: RequestInit,
    requestId: string,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const response = await this.makeRequest<T>(endpoint, options, requestId);
    
    if (!response.success && attempt < this.config.retryAttempts) {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
      return this.makeRequestWithRetry<T>(endpoint, options, requestId, attempt + 1);
    }
    
    return response;
  }

  // Queue management for API requests
  private async processRequestQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
          // Small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Request queue processing error:', error);
        }
      }
    }
    
    this.isProcessingQueue = false;
  }

  // Add request to queue
  private queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processRequestQueue();
    });
  }

  // Main stone analysis method
  async analyzeStone(request: StoneAnalysisRequest): Promise<ApiResponse<StoneAnalysisResponse>> {
    if (!(await this.isApiKeySet())) {
      return {
        success: false,
        error: 'API key not configured',
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };
    }

    // Check rate limiting
    const rateLimitCheck = await this.canMakeRequest();
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.reason || 'Rate limit exceeded',
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };
    }

    const requestId = this.generateRequestId();
    
    return this.queueRequest(async () => {
      const prompt = this.createStoneAnalysisPrompt(request);
      
      const response = await this.makeRequestWithRetry<any>(
        '/chat/completions',
        {
          method: 'POST',
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: prompt
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/${request.imageFormat};base64,${request.imageBase64}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 1000,
            temperature: 0.3
          })
        },
        requestId
      );
      
      if (response.success && response.data) {
        try {
          const analysisResult = this.parseStoneAnalysisResponse(response.data);
          // Track successful API usage
          try {
            await apiConfigManager.incrementUsage(true);
          } catch (usageError) {
            console.error('Failed to track successful API usage:', usageError);
          }
          return {
            success: true,
            data: analysisResult,
            timestamp: Date.now(),
            requestId
          };
        } catch (parseError) {
          // Track failed API usage
          try {
            await apiConfigManager.incrementUsage(false);
          } catch (usageError) {
            console.error('Failed to track failed API usage:', usageError);
          }
          return {
            success: false,
            error: 'Failed to parse analysis response',
            timestamp: Date.now(),
            requestId
          };
        }
      }
      
      // Track failed API usage for unsuccessful responses
      try {
        await apiConfigManager.incrementUsage(false);
      } catch (usageError) {
        console.error('Failed to track failed API usage:', usageError);
      }
      
      return response;
    });
  }

  // Create analysis prompt
  private createStoneAnalysisPrompt(request: StoneAnalysisRequest): string {
    const basePrompt = `
Analyze this stone/crystal image and provide detailed information in JSON format.

Please identify:
1. Stone name and type
2. Physical properties (hardness, color, category, origin)
3. Healing and metaphysical properties
4. Confidence level (0-100)
5. Alternative possibilities if uncertain

Return response in this exact JSON format:
{
  "stoneName": "string",
  "confidence": number,
  "properties": {
    "hardness": number,
    "color": "string",
    "category": "string",
    "origin": "string",
    "chakra": "string",
    "healingProperties": ["string"],
    "metaphysicalProperties": ["string"]
  },
  "description": "string",
  "alternativePossibilities": [
    {
      "name": "string",
      "confidence": number
    }
  ]
}
`;

    if (request.analysisType === 'identification') {
      return basePrompt + '\nFocus primarily on stone identification and basic properties.';
    } else if (request.analysisType === 'properties') {
      return basePrompt + '\nFocus on detailed healing and metaphysical properties.';
    }
    
    return basePrompt + '\nProvide comprehensive analysis including all aspects.';
  }

  // Parse OpenAI response
  private parseStoneAnalysisResponse(apiResponse: any): StoneAnalysisResponse {
    const content = apiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in API response');
    }
    
    try {
      // Extract JSON from response (in case there's additional text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.stoneName || typeof parsed.confidence !== 'number') {
        throw new Error('Invalid response format');
      }
      
      return parsed as StoneAnalysisResponse;
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${error}`);
    }
  }

  // Get API usage statistics
  async getApiStats(): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    queueLength: number;
    dailyCount: number;
    monthlyCount: number;
  }> {
    // Simplified analytics for mobile app
    
    // Get usage data from apiConfigManager
    let usage;
    try {
      usage = await apiConfigManager.getUsage();
    } catch (error) {
      console.error('Failed to get usage data:', error);
      // Return default values if usage data cannot be retrieved
      usage = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        dailyCount: 0,
        monthlyCount: 0
      };
    }
    
    return {
      totalRequests: usage.totalRequests,
      successfulRequests: usage.successfulRequests,
      failedRequests: usage.failedRequests,
      averageResponseTime: 0, // Simplified for mobile
      queueLength: this.requestQueue.length,
      dailyCount: usage.dailyCount,
      monthlyCount: usage.monthlyCount
    };
  }

  // Clear API statistics
  async clearStats(): Promise<void> {
    // Reset usage statistics in apiConfigManager
    try {
      await apiConfigManager.resetMonthlyUsage();
    } catch (error) {
      console.error('Failed to reset monthly usage:', error);
    }
  }

  // Validate API key
  async validateApiKey(apiKey?: string): Promise<boolean> {
    const keyToValidate = apiKey || this.config.apiKey;
    if (!keyToValidate) {
      return false;
    }
    try {
      return await apiConfigManager.isApiKeyValid(keyToValidate);
    } catch (error) {
      console.error('Failed to validate API key:', error);
      return false;
    }
  }

  // Check if API request can be made (rate limiting)
  async canMakeRequest(): Promise<{ allowed: boolean; reason?: string }> {
    try {
      return await apiConfigManager.canMakeRequest();
    } catch (error) {
      console.error('Failed to check rate limiting:', error);
      return { allowed: false, reason: 'Rate limiting check failed' };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export types for use in other files
export type {
  ApiConfig,
  ApiResponse,
  StoneAnalysisRequest,
  StoneAnalysisResponse
};