import React, { createContext, useContext, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ColorScheme {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  card: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
}

interface ColorContextType {
  colors: ColorScheme;
}

const lightColors: ColorScheme = {
  background: '#f8f9fa',
  surface: '#ffffff',
  primary: '#1976D2',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  shadow: '#000000',
  card: '#ffffff',
  accent: '#2196F3',
  error: '#ff5722',
  success: '#4CAF50',
  warning: '#ff9800',
};

const darkColors: ColorScheme = {
  background: '#121212',
  surface: '#1e1e1e',
  primary: '#64B5F6',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#333333',
  shadow: '#000000',
  card: '#2d2d2d',
  accent: '#81C784',
  error: '#ff6b6b',
  success: '#69f0ae',
  warning: '#ffb74d',
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const ColorProvider: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => {
  const colors = useMemo(() => theme === 'light' ? lightColors : darkColors, [theme]);

  const value = useMemo(() => ({ colors }), [colors]);

  return (
    <ColorContext.Provider value={value}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColors = () => {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
};

export type { ColorScheme, Theme };
export { lightColors, darkColors };