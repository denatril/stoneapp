import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Image, ImageProps, ImageSourcePropType, View, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  source: number | ImageSourcePropType;
  showLoader?: boolean;
  placeholder?: React.ReactNode;
  lazyLoad?: boolean;
  fadeInDuration?: number;
  placeholderColor?: string;
}

const SafeImage: React.FC<SafeImageProps> = memo(({ 
  source, 
  showLoader = true, 
  placeholder,
  lazyLoad = false,
  fadeInDuration = 300,
  placeholderColor = '#f0f0f0',
  style, 
  ...props 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazyLoad);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const viewRef = useRef<View>(null);
  
  // Ensure source is a valid type for Image component
  const safeSource = typeof source === 'number' ? source : source as ImageSourcePropType;
  
  // Lazy loading effect
  useEffect(() => {
    if (lazyLoad && !shouldLoad) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, 100); // Small delay to improve performance
      
      return () => clearTimeout(timer);
    }
  }, [lazyLoad, shouldLoad]);
  
  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
    fadeAnim.setValue(0);
  }, [fadeAnim]);
  
  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: fadeInDuration,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, fadeInDuration]);
  
  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);
  
  // Default placeholder component
  const defaultPlaceholder = (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: placeholderColor,
    }}>
      <Ionicons name="image-outline" size={24} color="#ccc" />
    </View>
  );
  
  return (
    <View ref={viewRef} style={style}>
      {/* Placeholder */}
      {(loading || !shouldLoad) && (
        placeholder || defaultPlaceholder
      )}
      
      {/* Image */}
      {shouldLoad && (
        <Animated.View style={{ opacity: error ? 0 : fadeAnim }}>
          <Image
            source={safeSource}
            style={style}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            {...props}
          />
        </Animated.View>
      )}
      
      {/* Loading indicator */}
      {loading && shouldLoad && showLoader && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.8)'
        }}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}
      
      {/* Error state */}
      {error && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
        }}>
          <Ionicons name="image-outline" size={24} color="#ccc" />
        </View>
      )}
    </View>
  );
});

SafeImage.displayName = 'SafeImage';

export default SafeImage;