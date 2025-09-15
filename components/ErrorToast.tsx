import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useError } from '../contexts/ErrorContext';
import { UI_CONSTANTS, ANIMATION_CONSTANTS } from '../constants';

const { width } = Dimensions.get('window');

export const ErrorToast: React.FC = () => {
  const { state, removeError } = useError();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const currentError = state.errors[0]; // Show only the latest error

  useEffect(() => {
    if (currentError) {
      // Show animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_CONSTANTS.DURATION.MEDIUM,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: ANIMATION_CONSTANTS.DURATION.MEDIUM,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        dismissError();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: ANIMATION_CONSTANTS.DURATION.FAST,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: ANIMATION_CONSTANTS.DURATION.FAST,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentError]);

  const dismissError = () => {
    if (currentError) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: ANIMATION_CONSTANTS.DURATION.FAST,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: ANIMATION_CONSTANTS.DURATION.FAST,
          useNativeDriver: true,
        }),
      ]).start(() => {
        removeError(currentError.timestamp);
      });
    }
  };

  if (!currentError) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toast,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.content}
          onPress={dismissError}
          activeOpacity={0.9}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚠️</Text>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Hata</Text>
            <Text style={styles.message} numberOfLines={2}>
              {currentError.message}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={dismissError}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toast: {
    marginHorizontal: UI_CONSTANTS.SPACING.MD,
    marginTop: UI_CONSTANTS.SPACING.SM,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.MD,
    backgroundColor: '#dc3545',
    ...UI_CONSTANTS.SHADOW,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_CONSTANTS.SPACING.MD,
  },
  iconContainer: {
    marginRight: UI_CONSTANTS.SPACING.SM,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    marginRight: UI_CONSTANTS.SPACING.SM,
  },
  title: {
    fontSize: UI_CONSTANTS.FONT_SIZES.SM,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  message: {
    fontSize: UI_CONSTANTS.FONT_SIZES.XS,
    color: '#ffffff',
    opacity: 0.9,
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});