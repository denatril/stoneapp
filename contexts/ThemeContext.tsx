import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorProvider, useColors, type Theme, type ColorScheme } from './ColorContext';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ColorScheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isManuallySet, setIsManuallySet] = useState(false);

  useEffect(() => {
    // Kaydedilmiş tema tercihini yükle
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const isManual = await AsyncStorage.getItem('isManualTheme');
        
        if (savedTheme && isManual === 'true') {
          setTheme(savedTheme as Theme);
          setIsManuallySet(true);
        } else {
          // Manuel ayar yoksa sistem temasını kullan
          const currentScheme = Appearance.getColorScheme();
          if (currentScheme) {
            setTheme(currentScheme === 'dark' ? 'dark' : 'light');
          }
        }
      } catch (error) {
        console.error('Tema yüklenirken hata:', error);
        // Hata durumunda sistem temasını kullan
        const currentScheme = Appearance.getColorScheme();
        if (currentScheme) {
          setTheme(currentScheme === 'dark' ? 'dark' : 'light');
        }
      }
    };

    loadTheme();

    // Sistem temasını dinle (sadece manuel ayar yoksa)
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (!isManuallySet && colorScheme) {
        setTheme(colorScheme === 'dark' ? 'dark' : 'light');
      }
    });

    return () => subscription?.remove();
  }, [isManuallySet]);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsManuallySet(true);
    
    try {
      await AsyncStorage.setItem('theme', newTheme);
      await AsyncStorage.setItem('isManualTheme', 'true');
    } catch (error) {
      console.error('Tema kaydedilirken hata:', error);
    }
  }, [theme]);

  return (
    <ColorProvider theme={theme}>
      <ThemeContextProvider theme={theme} toggleTheme={toggleTheme}>
        {children}
      </ThemeContextProvider>
    </ColorProvider>
  );
};

const ThemeContextProvider: React.FC<{ 
  children: React.ReactNode; 
  theme: Theme; 
  toggleTheme: () => void; 
}> = ({ children, theme, toggleTheme }) => {
  const { colors } = useColors();

  const value = useMemo(() => ({
    theme,
    isDarkMode: theme === 'dark',
    toggleTheme,
    colors
  }), [theme, toggleTheme, colors]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};