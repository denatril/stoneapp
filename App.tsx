import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { CollectionProvider } from './contexts/CollectionContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { AuthProvider } from './contexts/AuthContext';

// Navigation
import TabNavigator from './navigation/TabNavigator';
import { LoginScreen } from './screens/LoginScreen';

// Components
import ErrorBoundary from './components/ErrorBoundary';

// Hooks
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Simple loading state for now
  }

  if (isAuthenticated) {
    return <TabNavigator />;
  }

  return <LoginScreen />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ErrorProvider>
            <ThemeProvider>
              <AuthProvider>
                <FavoritesProvider>
                  <CollectionProvider>
                    <NavigationContainer>
                      <AppContent />
                      <StatusBar style="auto" />
                    </NavigationContainer>
                  </CollectionProvider>
                </FavoritesProvider>
              </AuthProvider>
            </ThemeProvider>
          </ErrorProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;