import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface CrashReport {
  id: string;
  timestamp: string;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  userAgent: string;
  platform: typeof Platform.OS;
  version: string;
  userId?: string;
  screen?: string;
  userActions?: string[];
}

interface AnalyticsEvent {
  id: string;
  timestamp: string;
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  screen?: string;
}

class CrashReportingService {
  private static instance: CrashReportingService;
  private crashReports: CrashReport[] = [];
  private analyticsEvents: AnalyticsEvent[] = [];
  private userActions: string[] = [];
  private currentScreen?: string;
  private userId?: string;

  private readonly MAX_REPORTS = 50;
  private readonly MAX_EVENTS = 100;
  private readonly MAX_USER_ACTIONS = 20;
  private readonly STORAGE_KEYS = {
    CRASH_REPORTS: 'crash_reports',
    ANALYTICS_EVENTS: 'analytics_events',
  };

  static getInstance(): CrashReportingService {
    if (!CrashReportingService.instance) {
      CrashReportingService.instance = new CrashReportingService();
    }
    return CrashReportingService.instance;
  }

  // Initialize the service
  async initialize(userId?: string): Promise<void> {
    this.userId = userId;
    await this.loadStoredData();
    this.setupGlobalErrorHandler();
    this.trackEvent('app_launched');
  }

  // Set current user
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Set current screen
  setCurrentScreen(screenName: string): void {
    this.currentScreen = screenName;
    this.trackEvent('screen_view', { screen: screenName });
  }

  // Record user action
  recordUserAction(action: string): void {
    this.userActions.push(`${new Date().toISOString()}: ${action}`);
    
    // Keep only last N actions
    if (this.userActions.length > this.MAX_USER_ACTIONS) {
      this.userActions.shift();
    }
  }

  // Track analytics event
  trackEvent(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      event,
      properties,
      userId: this.userId,
      screen: this.currentScreen,
    };

    this.analyticsEvents.push(analyticsEvent);

    // Keep only last N events
    if (this.analyticsEvents.length > this.MAX_EVENTS) {
      this.analyticsEvents.shift();
    }

    this.saveAnalyticsEvents();

    if (__DEV__) {
      console.log('📊 Analytics Event:', event, properties);
    }
  }

  // Report crash
  async reportCrash(error: Error, additionalInfo?: Record<string, any>): Promise<void> {
    const crashReport: CrashReport = {
      id: `crash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      userAgent: 'React Native App',
      platform: Platform.OS,
      version: '1.0.0', // App version
      userId: this.userId,
      screen: this.currentScreen,
      userActions: [...this.userActions],
    };

    // Add additional info if provided
    if (additionalInfo) {
      (crashReport as any).additionalInfo = additionalInfo;
    }

    this.crashReports.push(crashReport);

    // Keep only last N reports
    if (this.crashReports.length > this.MAX_REPORTS) {
      this.crashReports.shift();
    }

    await this.saveCrashReports();

    if (__DEV__) {
      console.error('💥 Crash Report Generated:', crashReport);
    }

    // Track crash as analytics event
    this.trackEvent('app_crash', {
      error_message: error.message,
      error_name: error.name,
    });
  }

  // Setup global error handler
  private setupGlobalErrorHandler(): void {
    // React Native için basit error handling
    if (__DEV__) {
      // Development'ta console.error ile yeterli
      const originalConsoleError = console.error;
      console.error = async (...args: any[]) => {
        // Call original console.error first
        originalConsoleError.apply(console, args);
        
        // If first argument looks like an error, report it
        if (args[0] instanceof Error) {
          try {
            await this.reportCrash(args[0]);
          } catch (reportingError) {
            originalConsoleError('Error reporting crash:', reportingError);
          }
        }
      };
    }

    // Production'da silent error handling
    process.on?.('uncaughtException', async (error: Error) => {
      try {
        await this.reportCrash(error, { type: 'uncaught_exception' });
      } catch (reportingError) {
        // Silent fail in production
      }
    });

    process.on?.('unhandledRejection', async (reason: any) => {
      try {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        await this.reportCrash(error, { type: 'unhandled_rejection' });
      } catch (reportingError) {
        // Silent fail in production
      }
    });
  }

  // Load stored data
  private async loadStoredData(): Promise<void> {
    try {
      const [crashReportsJson, analyticsEventsJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.CRASH_REPORTS),
        AsyncStorage.getItem(this.STORAGE_KEYS.ANALYTICS_EVENTS),
      ]);

      if (crashReportsJson) {
        this.crashReports = JSON.parse(crashReportsJson);
      }

      if (analyticsEventsJson) {
        this.analyticsEvents = JSON.parse(analyticsEventsJson);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading stored crash/analytics data:', error);
      }
    }
  }

  // Save crash reports
  private async saveCrashReports(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.CRASH_REPORTS,
        JSON.stringify(this.crashReports)
      );
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving crash reports:', error);
      }
    }
  }

  // Save analytics events
  private async saveAnalyticsEvents(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.ANALYTICS_EVENTS,
        JSON.stringify(this.analyticsEvents)
      );
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving analytics events:', error);
      }
    }
  }

  // Get all crash reports
  getCrashReports(): CrashReport[] {
    return [...this.crashReports];
  }

  // Get analytics events
  getAnalyticsEvents(): AnalyticsEvent[] {
    return [...this.analyticsEvents];
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    this.crashReports = [];
    this.analyticsEvents = [];
    this.userActions = [];
    
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEYS.CRASH_REPORTS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.ANALYTICS_EVENTS),
      ]);
    } catch (error) {
      if (__DEV__) {
        console.error('Error clearing crash/analytics data:', error);
      }
    }
  }

  // Export data for debugging
  async exportData(): Promise<{
    crashReports: CrashReport[];
    analyticsEvents: AnalyticsEvent[];
    summary: {
      totalCrashes: number;
      totalEvents: number;
      lastCrash?: string;
      mostCommonError?: string;
    };
  }> {
    const crashReports = this.getCrashReports();
    const analyticsEvents = this.getAnalyticsEvents();

    // Calculate summary
    const totalCrashes = crashReports.length;
    const totalEvents = analyticsEvents.length;
    const lastCrash = crashReports[crashReports.length - 1]?.timestamp;
    
    // Find most common error
    const errorCounts: Record<string, number> = {};
    crashReports.forEach(report => {
      const errorKey = report.error.name || 'Unknown';
      errorCounts[errorKey] = (errorCounts[errorKey] || 0) + 1;
    });
    
    const mostCommonError = Object.keys(errorCounts).reduce((a, b) => 
      errorCounts[a] > errorCounts[b] ? a : b
    , Object.keys(errorCounts)[0]);

    return {
      crashReports,
      analyticsEvents,
      summary: {
        totalCrashes,
        totalEvents,
        lastCrash,
        mostCommonError,
      },
    };
  }
}

// Export singleton instance
export const crashReporting = CrashReportingService.getInstance();

// Export types
export type { CrashReport, AnalyticsEvent };
