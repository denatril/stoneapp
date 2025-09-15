import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // TODO: Add proper splash screen
    return null;
  }

  // Simple conditional rendering for MVP
  if (isAuthenticated) {
    return <TabNavigator />;
  }

  return <LoginScreen />;
};

export default AppNavigator;
