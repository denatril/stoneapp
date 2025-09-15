import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

interface SearchSectionProps {
  onSearchPress?: () => void;
}

export default function SearchSection({ onSearchPress }: SearchSectionProps) {
  const { theme, colors } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const [searchText, setSearchText] = useState('');

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      // Navigate to Library screen with search focus
      navigation.navigate('Kütüphane' as never);
    }
  };

  const clearSearch = () => {
    setSearchText('');
  };

  return (
    <View style={styles.searchContainer}>
      <LinearGradient
        colors={theme === 'dark' ? ['#2a2a3e', '#1a1a2e'] : ['#f8f9ff', '#e8f0fe']}
        style={styles.searchWrapper}
        start={[0, 0]}
        end={[1, 1]}
      >
        <View style={styles.searchHeader}>
          <View style={styles.searchTitleContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.searchIconWrapper}
              start={[0, 0]}
              end={[1, 1]}
            >
              <Ionicons name="search" size={16} color="#fff" />
            </LinearGradient>
            <Text style={[styles.searchTitle, { color: colors.text }]}>Kristal Arama</Text>
          </View>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.searchBadge}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Text style={styles.searchBadgeText}>Hızlı</Text>
          </LinearGradient>
        </View>
        
        <TouchableOpacity
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }
          ]}
          onPress={handleSearchPress}
          activeOpacity={0.7}
        >
          <View style={styles.searchInputContainer}>
            <Ionicons 
              name="search" 
              size={20} 
              color={colors.textSecondary} 
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                { color: colors.text }
              ]}
              placeholder="Kristal, taş veya özellik ara..."
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              onFocus={handleSearchPress}
              editable={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.clearButtonGradient}
                  start={[0, 0]}
                  end={[1, 1]}
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
        
        <View style={styles.quickFilters}>
          <TouchableOpacity 
            style={[
              styles.filterChip,
              {
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
              }
            ]}
            onPress={handleSearchPress}
          >
            <Ionicons name="diamond" size={12} color={colors.primary} />
            <Text style={[styles.filterChipText, { color: colors.text }]}>Kristaller</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterChip,
              {
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
              }
            ]}
            onPress={handleSearchPress}
          >
            <Ionicons name="heart" size={12} color={colors.primary} />
            <Text style={[styles.filterChipText, { color: colors.text }]}>Şifa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterChip,
              {
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
              }
            ]}
            onPress={handleSearchPress}
          >
            <Ionicons name="color-palette" size={12} color={colors.primary} />
            <Text style={[styles.filterChipText, { color: colors.text }]}>Renkler</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = {
  searchContainer: {
    marginBottom: 20,
    marginTop: 8,
    marginHorizontal: 20,
  },
  searchWrapper: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  searchHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  searchTitleContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  searchIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 10,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  searchBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  searchBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  searchBar: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 10,
  },
  clearButtonGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  quickFilters: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: 6,
  },
};