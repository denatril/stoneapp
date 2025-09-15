import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SafeImage from './SafeImage';
import { Stone } from '../data/stones';

// Görsel cache sistemi
const getStoneImage = (imageUrl: string | undefined): any => {
  if (!imageUrl) {
    return require('../assets/icon.png');
  }
   
   try {
    // Metro bundler için statik require kullanımı
    switch (imageUrl) {
      case 'amethyst.png':
        return require('../assets/stones/amethyst.png');
      case 'clear-quartz.png':
        return require('../assets/stones/clear-quartz.png');
      case 'rose-quartz.png':
        return require('../assets/stones/rose-quartz.png');
      case 'citrine.png':
        return require('../assets/stones/citrine.png');
      case 'tiger-eye.png':
        return require('../assets/stones/tiger-eye.png');
      default:
        return require('../assets/icon.png');
    }
  } catch (error) {
    return require('../assets/icon.png');
  }
};

interface MemoizedStoneCardProps {
  stone: Stone;
  isSelected: boolean;
  isSelectionMode: boolean;
  themeColors: any;
  theme: string;
  onPress: () => void;
  onLongPressStart: () => void;
  onLongPressCancel: () => void;
}

const MemoizedStoneCard = memo<MemoizedStoneCardProps>((
  {
    stone,
    isSelected,
    isSelectionMode,
    themeColors,
    theme,
    onPress,
    onLongPressStart,
    onLongPressCancel,
  }
) => {
  // Memoized handlers
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const handlePressIn = useCallback(() => {
    if (!isSelectionMode) {
      onLongPressStart();
    }
  }, [isSelectionMode, onLongPressStart]);

  const handlePressOut = useCallback(() => {
    if (!isSelectionMode) {
      onLongPressCancel();
    }
  }, [isSelectionMode, onLongPressCancel]);

  return (
    <TouchableOpacity 
      style={[
        styles.stoneCard, 
        { shadowColor: themeColors.shadow },
        isSelected && styles.selectedStoneCard
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayPressIn={0}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={theme === 'dark' ? ['#2a2a3e', '#1a1a2e'] : ['#f8f9ff', '#e8f0fe']}
        style={styles.stoneCardContent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            <Ionicons 
              name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={isSelected ? themeColors.accent : themeColors.textSecondary} 
            />
          </View>
        )}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.stoneImageContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeImage 
            source={getStoneImage(stone.imageUrl)} 
            style={styles.stoneImage}
            resizeMode="contain"
          />
        </LinearGradient>
        <View style={styles.stoneInfo}>
          <View style={styles.stoneHeader}>
            <Text style={[styles.stoneName, { color: themeColors.primary }]} numberOfLines={1}>
              {stone.name}
            </Text>
          </View>
          <Text style={[styles.stoneCategory, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {stone.category}
          </Text>
          <Text style={[styles.stoneDescription, { color: themeColors.textSecondary }]} numberOfLines={2}>
            {stone.description}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
   );
 }, (prevProps, nextProps) => {
   // Custom comparison function for better memoization
   return (
     prevProps.stone.id === nextProps.stone.id &&
     prevProps.isSelected === nextProps.isSelected &&
     prevProps.isSelectionMode === nextProps.isSelectionMode &&
     prevProps.theme === nextProps.theme
   );
 });

MemoizedStoneCard.displayName = 'MemoizedStoneCard';

const styles = StyleSheet.create({
  stoneCard: {
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedStoneCard: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  stoneCardContent: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  stoneImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stoneImage: {
    width: 80,
    height: 80,
  },
  stoneInfo: {
    flex: 1,
  },
  stoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  stoneName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  stoneCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  stoneDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export { MemoizedStoneCard };