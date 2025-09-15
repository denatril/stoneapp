import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const { colors: themeColors } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [themeColors.border, themeColors.textSecondary + '40'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

export const StoneCardSkeleton: React.FC = () => {
  const { colors: themeColors } = useTheme();
  
  return (
    <View style={[styles.skeletonCard, { backgroundColor: themeColors.surface }]}>
      <View style={styles.skeletonContent}>
        <SkeletonLoader width={80} height={80} borderRadius={8} style={styles.skeletonImage} />
        <View style={styles.skeletonInfo}>
          <SkeletonLoader width="80%" height={20} style={styles.skeletonTitle} />
          <SkeletonLoader width="60%" height={14} style={styles.skeletonCategory} />
          <SkeletonLoader width="100%" height={12} style={styles.skeletonDescription} />
          <SkeletonLoader width="100%" height={12} style={styles.skeletonDescription} />
        </View>
      </View>
      <View style={styles.skeletonDetails}>
        <SkeletonLoader width="30%" height={12} />
        <SkeletonLoader width="30%" height={12} />
        <SkeletonLoader width="30%" height={12} />
      </View>
    </View>
  );
};

export const GridCardSkeleton: React.FC = () => {
  const { colors: themeColors } = useTheme();
  
  return (
    <View style={[styles.skeletonGridCard, { backgroundColor: themeColors.surface }]}>
      <SkeletonLoader width="100%" height={120} borderRadius={8} style={styles.skeletonGridImage} />
      <SkeletonLoader width="80%" height={16} style={styles.skeletonGridTitle} />
      <SkeletonLoader width="60%" height={12} style={styles.skeletonGridCategory} />
      <SkeletonLoader width="50%" height={12} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  skeletonContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skeletonImage: {
    marginRight: 16,
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonTitle: {
    marginBottom: 8,
  },
  skeletonCategory: {
    marginBottom: 8,
  },
  skeletonDescription: {
    marginBottom: 4,
  },
  skeletonDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonGridCard: {
    borderRadius: 12,
    padding: 12,
    margin: 8,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  skeletonGridImage: {
    marginBottom: 12,
  },
  skeletonGridTitle: {
    marginBottom: 4,
  },
  skeletonGridCategory: {
    marginBottom: 4,
  },
});