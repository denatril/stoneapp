import React, { useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { crashReporting } from '../services/crashReporting';

interface NavigationTrackerProps {
  children: React.ReactNode;
}

export const NavigationTracker: React.FC<NavigationTrackerProps> = ({ children }) => {
  const navigationState = useNavigationState(state => state);

  useEffect(() => {
    if (navigationState) {
      // Get current route name
      const getCurrentRoute = (state: any): string => {
        if (state.index !== undefined && state.routes) {
          const route = state.routes[state.index];
          if (route.state) {
            return getCurrentRoute(route.state);
          }
          return route.name;
        }
        return 'Unknown';
      };

      const currentRouteName = getCurrentRoute(navigationState);
      
      // Track screen view
      crashReporting.setCurrentScreen(currentRouteName);
      crashReporting.recordUserAction(`navigate_to_${currentRouteName}`);
      
      if (__DEV__) {
        console.log('📱 Screen:', currentRouteName);
      }
    }
  }, [navigationState]);

  return <>{children}</>;
};
