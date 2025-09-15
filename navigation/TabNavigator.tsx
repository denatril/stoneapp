import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';

// Direct imports instead of lazy loading
import HomeScreen from '../screens/HomeScreen';
import LibraryStackNavigator from './LibraryStackNavigator';
import ScannerScreen from '../screens/ScannerScreen';
import CollectionScreen from '../screens/CollectionScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();



const TabNavigator = React.memo(() => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Ana Sayfa') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Kütüphane') {
            iconName = focused ? 'diamond' : 'diamond-outline';
          } else if (route.name === 'Tarayıcı') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Favoriler') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: 'rgba(0,0,0,0.1)',
          borderTopWidth: 0,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          display: 'none',
        },
        tabBarItemStyle: {
          paddingTop: 7,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Ana Sayfa" 
        component={HomeScreen}
      />
      <Tab.Screen 
        name="Kütüphane" 
        component={LibraryStackNavigator}
      />
      <Tab.Screen 
        name="Tarayıcı" 
        component={ScannerScreen}
      />
      <Tab.Screen 
        name="Favoriler" 
        component={CollectionScreen}
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen}
      />
      </Tab.Navigator>
  );
});

export default TabNavigator;
