import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AppHeader({ 
  title = 'Crystal Guide', 
  subtitle = 'Kristal Rehberiniz' 
}: AppHeaderProps) {
  const { theme, colors } = useTheme();

  return (
    <View style={styles.appHeaderSection}>
      <LinearGradient
        colors={theme === 'dark' ? ['#2a2a3e', '#1a1a2e'] : ['#f8f9ff', '#e8f0fe']}
        style={styles.appHeaderContainer}
        start={[0, 0]}
        end={[1, 1]}
      >
        <View style={styles.appHeaderContent}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.appIconWrapper}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Ionicons name="diamond" size={24} color="#fff" />
          </LinearGradient>
          <View style={styles.appTitleContainer}>
            <Text style={[styles.appTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  appHeaderSection: {
    marginBottom: 20,
    marginTop: 25,
    marginHorizontal: 20,
  },
  appHeaderContainer: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  appHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  appTitleContainer: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  appSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 1,
  },
});