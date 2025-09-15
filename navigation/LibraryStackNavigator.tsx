import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Stone } from '../data/stones';
import LibraryScreen from '../screens/LibraryScreen';
import UserLibraryScreen from '../screens/UserLibraryScreen';
import StoneDetailScreen from '../screens/StoneDetailScreen';

type LibraryStackParamList = {
  LibraryMain: undefined;
  UserLibrary: undefined;
  StoneDetail: { stone: Stone };
};

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export default function LibraryStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="LibraryMain"
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
      }}
    >
      <Stack.Screen name="LibraryMain" component={LibraryScreen} />
      <Stack.Screen name="UserLibrary" component={UserLibraryScreen} />
      <Stack.Screen name="StoneDetail" component={StoneDetailScreen} />
    </Stack.Navigator>
  );
}
