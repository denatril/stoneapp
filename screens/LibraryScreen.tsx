import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal } from 'react-native';
import SafeImage from '../components/SafeImage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stone, categories, colors, origins, popularStones, stoneCategories } from '../data/stones';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserLibrary } from '../data/stones';
import { useTheme } from '../contexts/ThemeContext';
import { useCollection } from '../contexts/CollectionContext';
import { StoneCardSkeleton, GridCardSkeleton } from '../components/SkeletonLoader';


// Lazy loading için görsel cache sistemi - Memory leak prevention
const MAX_CACHE_SIZE = 50;
const stoneImageCache = new Map<string, any>();
const defaultImage = require('../assets/icon.png');

// Cache temizleme fonksiyonu
const cleanupCache = () => {
  if (stoneImageCache.size > MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(stoneImageCache.keys()).slice(0, 10);
    keysToDelete.forEach(key => stoneImageCache.delete(key));
  }
};

// Güvenli görsel yükleme fonksiyonu - Metro bundler uyumlu
const loadImageSafely = (imageName: string) => {
  try {
    // Metro bundler için statik require kullanımı
    switch (imageName) {
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
    if (__DEV__) {
      console.warn(`Görsel yüklenemedi: ${imageName}, varsayılan görsel kullanılıyor`);
    }
    return require('../assets/icon.png');
  }
};

// Statik görsel haritası - Sadece 5 popüler taş
const imageMap: { [key: string]: any } = {
  'amethyst.png': loadImageSafely('amethyst.png'),
  'clear-quartz.png': loadImageSafely('clear-quartz.png'),
  'rose-quartz.png': loadImageSafely('rose-quartz.png'),
  'citrine.png': loadImageSafely('citrine.png'),
  'tiger-eye.png': loadImageSafely('tiger-eye.png'),
};

// Kritik görsellerin önceden yüklenmesi
const preloadCriticalImages = () => {
  const criticalImages = [
    'amethyst.png',
    'clear-quartz.png',
    'rose-quartz.png',
    'citrine.png',
    'tiger-eye.png'
  ];
  
  criticalImages.forEach(imageName => {
    if (!stoneImageCache.has(imageName) && imageMap[imageName]) {
      stoneImageCache.set(imageName, imageMap[imageName]);
      cleanupCache(); // Memory leak prevention
    }
  });
};

// Lazy loading ile görsel yükleme
const loadImageLazy = async (imageName: string): Promise<any> => {
  if (stoneImageCache.has(imageName)) {
    return stoneImageCache.get(imageName);
  }
  
  const imageSource = imageMap[imageName] || defaultImage;
  stoneImageCache.set(imageName, imageSource);
  cleanupCache(); // Memory leak prevention
  return imageSource;
};

// Optimized görsel yükleme fonksiyonu
const getStoneImage = (imageUrl: string | undefined): any => {
  if (!imageUrl) {
    return defaultImage;
  }
  
  // Cache'den kontrol et
  if (stoneImageCache.has(imageUrl)) {
    const cachedImage = stoneImageCache.get(imageUrl);
    return cachedImage || defaultImage;
  }
  
  // imageMap'ten statik require'ı al
  const staticImage = imageMap[imageUrl];
  if (staticImage) {
    stoneImageCache.set(imageUrl, staticImage);
    cleanupCache(); // Memory leak prevention
    return staticImage;
  }
  
  // Varsayılan görüntü döndür
  return defaultImage;
};

// Bileşen dışında tanımlanan sabit fonksiyonlar
const keyExtractor = (item: Stone) => item.id;

const getItemLayout = (data: any, index: number) => ({
  length: 200,
  offset: 200 * index,
  index,
});

interface LibraryScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
    addListener: (event: string, callback: () => void) => () => void;
  };
}

export default function LibraryScreen({ navigation }: LibraryScreenProps) {
  const { theme, colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const { collection, addToCollection, removeFromCollection, isInCollection } = useCollection();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [hardnessRange, setHardnessRange] = useState<{ min: number; max: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'hardness' | 'category'>('name');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadStates, setImageLoadStates] = useState<Map<string, boolean>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<'popular' | 'userStones'>('popular');
  const [userLibrary, setUserLibrary] = useState<UserLibrary | null>(null);
  const [userStones, setUserStones] = useState<Stone[]>([]);

  // Kritik görselleri önceden yükle - geçici olarak devre dışı
  // useEffect(() => {
  //   preloadCriticalImages();
  // }, []);

  // Kullanıcı kütüphanesini yükle
  const loadUserLibrary = useCallback(async () => {
    try {
      const libraryData = await AsyncStorage.getItem('userLibrary');
      if (libraryData) {
        const library: UserLibrary = JSON.parse(libraryData);
        setUserLibrary(library);
        setUserStones(library.stones);
      }
    } catch (error) {
      console.error('Kullanıcı kütüphanesi yüklenirken hata:', error);
    }
  }, []);

  // Simüle edilmiş loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Daha hızlı loading
    
    return () => clearTimeout(timer);
  }, []);

  // Kullanıcı kütüphanesini yükle
  useEffect(() => {
    loadUserLibrary();
  }, [loadUserLibrary]);

  // Ekran odaklandığında kütüphaneyi yenile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserLibrary();
    });
    return unsubscribe;
  }, [navigation, loadUserLibrary]);

  // Lazy image loading handler
  const handleImageLoad = useCallback(async (imageName: string) => {
    if (!imageLoadStates.get(imageName)) {
      try {
        await loadImageLazy(imageName);
        setImageLoadStates(prev => new Map(prev.set(imageName, true)));
      } catch (error) {
        if (__DEV__) {
          console.warn(`Failed to load image: ${imageName}`);
        }
      }
    }
  }, [imageLoadStates]);

  const sortOptions = [
    { value: 'name', label: 'İsme Göre (A-Z)' },
    { value: 'hardness', label: 'Sertliğe Göre' },
    { value: 'category', label: 'Kategoriye Göre' }
  ];

  // Filtre fonksiyonları - useCallback ile optimize edildi
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const toggleColor = useCallback((color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  }, []);

  const toggleOrigin = useCallback((origin: string) => {
    setSelectedOrigins(prev => 
      prev.includes(origin) 
        ? prev.filter(o => o !== origin)
        : [...prev, origin]
    );
  }, []);

  const setHardnessFilter = useCallback((min: number, max: number) => {
    setHardnessRange({ min, max });
  }, []);

  const clearHardnessFilter = useCallback(() => {
    setHardnessRange(null);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedOrigins([]);
    setHardnessRange(null);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedColors.length > 0) count++;
    if (selectedOrigins.length > 0) count++;
    if (hardnessRange) count++;
    return count;
  }, [selectedCategories, selectedColors, selectedOrigins, hardnessRange]);



  // keyExtractor ve getItemLayout fonksiyonları bileşen dışında tanımlandı

  const filteredStones = useMemo(() => {
    // Seçilen kategoriye göre taşları belirle
    let baseStones = selectedCategory === 'popular' ? popularStones : userStones;
    let filtered = [...baseStones];
    
    // Kategori filtresi
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(stone => selectedCategories.includes(stone.category));
    }
    
    // Renk filtresi
    if (selectedColors.length > 0) {
      filtered = filtered.filter(stone => {
        // Bir taşın birden fazla rengi olabilir
        return Array.isArray(stone.color) && stone.color.some(color => selectedColors.includes(color));
      });
    }
    
    // Menşei filtresi
    if (selectedOrigins.length > 0) {
      filtered = filtered.filter(stone => 
        Array.isArray(stone.origin) && stone.origin.some(origin => selectedOrigins.includes(origin))
      );
    }
    
    // Sertlik filtresi
    if (hardnessRange) {
      filtered = filtered.filter(stone => 
        stone.hardness >= hardnessRange.min && stone.hardness <= hardnessRange.max
      );
    }
    
    // Sıralama
    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'hardness') {
        return a.hardness - b.hardness;
      } else if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });
  }, [selectedCategories, selectedColors, selectedOrigins, hardnessRange, sortBy, selectedCategory, userStones]);

  // Koleksiyon toggle fonksiyonu
  const handleToggleCollection = useCallback((stone: Stone, event: any) => {
    event.stopPropagation();
    if (isInCollection(stone.id)) {
      removeFromCollection(stone.id);
    } else {
      addToCollection(stone);
    }
  }, [addToCollection, removeFromCollection, isInCollection]);

  // Render fonksiyonları
  const renderListItem = useCallback(({ item }: { item: Stone }) => (
    <TouchableOpacity 
      style={[styles.stoneCard, { shadowColor: themeColors.shadow }]}
      onPress={() => navigation.navigate('StoneDetail', { stone: item })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={theme === 'dark' ? ['#2a2a3e', '#1a1a2e'] : ['#f8f9ff', '#e8f0fe']}
        style={styles.stoneCardContent}
        start={[0, 0]}
        end={[1, 1]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.stoneImageContainer}
          start={[0, 0]}
          end={[1, 1]}
        >
          <SafeImage 
            source={getStoneImage(item.imageUrl)} 
            style={styles.stoneImage}
            resizeMode="contain"
          />
        </LinearGradient>
        <View style={styles.stoneInfo}>
          <View style={styles.stoneHeader}>
            <View style={styles.stoneNameContainer}>
              <Text style={[styles.stoneName, { color: themeColors.primary }]} numberOfLines={1}>{item.name}</Text>
              <TouchableOpacity 
                style={styles.heartButton}
                onPress={(event) => handleToggleCollection(item, event)}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name={isInCollection(item.id) ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isInCollection(item.id) ? "#ff4757" : themeColors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.stoneCategory, { backgroundColor: themeColors.accent + '20', color: themeColors.accent }]} numberOfLines={1}>{item.category}</Text>
          </View>
          <Text style={[styles.stoneDescription, { color: themeColors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.stoneDetails}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Sertlik</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{item.hardness}/10</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Renk</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]} numberOfLines={1}>{item.color[0]}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Menşei</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]} numberOfLines={1}>{item.origin[0]}</Text>
            </View>
          </View>
          <View style={styles.propertiesContainer}>
            <Text style={[styles.propertiesTitle, { color: themeColors.textSecondary }]}>Özellikler:</Text>
            <Text style={[styles.propertiesText, { color: themeColors.textSecondary }]} numberOfLines={2}>
              {item.properties.slice(0, 3).join(', ')}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [themeColors, navigation, handleToggleCollection, isInCollection, theme]);

  const renderGridItem = useCallback(({ item }: { item: Stone }) => (
    <TouchableOpacity 
      style={[styles.gridCard, { shadowColor: themeColors.shadow }]}
      onPress={() => navigation.navigate('StoneDetail', { stone: item })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={theme === 'dark' ? ['#2a2a3e', '#1a1a2e'] : ['#f8f9ff', '#e8f0fe']}
        style={styles.gridCardContent}
        start={[0, 0]}
        end={[1, 1]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gridImageContainer}
          start={[0, 0]}
          end={[1, 1]}
        >
          <SafeImage 
            source={getStoneImage(item.imageUrl)} 
            style={styles.gridImage}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.gridHeartButton}
            onPress={(event) => handleToggleCollection(item, event)}
            activeOpacity={0.6}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Ionicons 
              name={isInCollection(item.id) ? "heart" : "heart-outline"} 
              size={18} 
              color={isInCollection(item.id) ? "#ff4757" : "#fff"} 
            />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.gridInfo}>
          <Text style={[styles.gridStoneName, { color: themeColors.primary }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.gridStoneCategory, { color: themeColors.textSecondary }]} numberOfLines={1}>{item.category}</Text>
          <Text style={[styles.gridStoneHardness, { color: themeColors.accent }]} numberOfLines={1}>Sertlik: {item.hardness}/10</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [themeColors, navigation, handleToggleCollection, isInCollection, theme]);



  const renderHeader = () => (
    <>
      {/* Uygulama Başlığı */}
      <View style={styles.appHeaderSection}>
        <LinearGradient
          colors={theme === 'dark' ? ['#2a2a3e', '#1a1a2e'] : ['#f8f9ff', '#e8f0fe']}
          style={styles.appHeaderContainer}
          start={[0, 0]}
          end={[1, 1]}
        >
          <View style={styles.appHeaderContent}>
            <View style={styles.appHeaderLeft}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.appIconWrapper}
                start={[0, 0]}
                end={[1, 1]}
              >
                <Ionicons name="library" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.appTitleContainer}>
                <Text style={[styles.appTitle, { color: themeColors.text }]}>Kristal Kütüphanesi</Text>
                <Text style={[styles.appSubtitle, { color: themeColors.textSecondary }]}>Tüm Kristaller</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Kategori Seçici */}
      <View style={styles.categorySelector}>
        <TouchableOpacity
          style={[
            styles.categorySelectorButton,
            { backgroundColor: selectedCategory === 'popular' ? themeColors.primary : themeColors.surface }
          ]}
          onPress={() => setSelectedCategory('popular')}
        >
          <Ionicons 
            name="star" 
            size={18} 
            color={selectedCategory === 'popular' ? '#fff' : themeColors.textSecondary} 
          />
          <Text style={[
            styles.categorySelectorText,
            { color: selectedCategory === 'popular' ? '#fff' : themeColors.textSecondary }
          ]}>
            {stoneCategories.popular}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.categorySelectorButton,
            { backgroundColor: selectedCategory === 'userStones' ? themeColors.primary : themeColors.surface }
          ]}
          onPress={() => setSelectedCategory('userStones')}
        >
          <Ionicons 
            name="heart" 
            size={18} 
            color={selectedCategory === 'userStones' ? '#fff' : themeColors.textSecondary} 
          />
          <Text style={[
            styles.categorySelectorText,
            { color: selectedCategory === 'userStones' ? '#fff' : themeColors.textSecondary }
          ]}>
            {stoneCategories.userStones} ({userStones.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Compact Controls */}
      <View style={styles.compactControls}>
        {/* Filtre ve Görünüm Butonları */}
        <View style={styles.searchFilterRow}>
          <TouchableOpacity 
            style={[styles.compactFilterButton, { backgroundColor: themeColors.surface }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={18} color={themeColors.accent} />
            {activeFilterCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: themeColors.accent, position: 'absolute', top: -4, right: -4 }]}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Grid Görünüm Butonları */}
          <TouchableOpacity
            style={[styles.compactViewButton, { backgroundColor: viewMode === 'list' ? themeColors.primary : themeColors.surface }]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons 
              name="list" 
              size={16} 
              color={viewMode === 'list' ? '#fff' : themeColors.textSecondary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.compactViewButton, { backgroundColor: viewMode === 'grid' ? themeColors.primary : themeColors.surface }]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons 
              name="grid" 
              size={16} 
              color={viewMode === 'grid' ? '#fff' : themeColors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Sonuç sayısı */}
        <Text style={[styles.resultCount, { color: themeColors.textSecondary }]}>
          {filteredStones.length} taş
        </Text>
      </View>
       
       {/* Filtre Paneli */}
       {showFilters && (
         <View style={[styles.filterPanel, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadow }]}>
           {/* Kategori Filtreleri */}
           <View style={styles.filterSection}>
             <Text style={[styles.filterTitle, { color: themeColors.text }]}>Kategoriler:</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
               {categories.map((category) => (
                 <TouchableOpacity
                   key={category}
                   style={[
                     styles.categoryChip,
                     { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                     selectedCategories.includes(category) && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                   ]}
                   onPress={() => toggleCategory(category)}
                 >
                   <Text style={[
                     styles.categoryChipText,
                     { color: themeColors.textSecondary },
                     selectedCategories.includes(category) && { color: '#ffffff' }
                   ]}>
                     {category}
                   </Text>
                 </TouchableOpacity>
               ))}
             </ScrollView>
             {selectedCategories.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={() => setSelectedCategories([])}
                >
                  <Text style={styles.clearFiltersText}>Kategori Filtrelerini Temizle</Text>
                </TouchableOpacity>
              )}
            </View>
        
            {/* Renk Filtreleri */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: themeColors.text }]}>Renkler:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorChip,
                      { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                      selectedColors.includes(color) && { backgroundColor: themeColors.accent, borderColor: themeColors.accent }
                    ]}
                    onPress={() => toggleColor(color)}
                  >
                    <Text style={[
                      styles.colorChipText,
                      { color: themeColors.textSecondary },
                      selectedColors.includes(color) && { color: '#ffffff' }
                    ]}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {selectedColors.length > 0 && (
                 <TouchableOpacity 
                   style={styles.clearFiltersButton}
                   onPress={() => setSelectedColors([])}
                 >
                   <Text style={styles.clearFiltersText}>Renk Filtrelerini Temizle</Text>
                 </TouchableOpacity>
               )}
             </View>
             
             {/* Menşei Filtreleri */}
             <View style={styles.filterSection}>
               <Text style={[styles.filterTitle, { color: themeColors.text }]}>Menşei:</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                 {origins.map((origin) => (
                   <TouchableOpacity
                     key={origin}
                     style={[
                       styles.categoryChip,
                       { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                       selectedOrigins.includes(origin) && { backgroundColor: themeColors.accent, borderColor: themeColors.accent }
                     ]}
                     onPress={() => toggleOrigin(origin)}
                   >
                     <Text style={[
                       styles.categoryChipText,
                       { color: themeColors.textSecondary },
                       selectedOrigins.includes(origin) && { color: '#ffffff' }
                     ]}>
                       {origin}
                     </Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
               {selectedOrigins.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearFiltersButton}
                    onPress={() => setSelectedOrigins([])}
                  >
                    <Text style={styles.clearFiltersText}>Menşei Filtrelerini Temizle</Text>
                  </TouchableOpacity>
                )}
              </View>
             
             {/* Sertlik Filtreleri */}
             <View style={styles.filterSection}>
               <Text style={[styles.filterTitle, { color: themeColors.text }]}>Sertlik (Mohs Skalası):</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                 <TouchableOpacity
                   style={[
                     styles.hardnessChip,
                     { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                     hardnessRange?.min === 1 && hardnessRange?.max === 3 && { backgroundColor: themeColors.accent, borderColor: themeColors.accent }
                   ]}
                   onPress={() => setHardnessFilter(1, 3)}
                 >
                   <Text style={[
                     styles.hardnessChipText,
                     { color: themeColors.textSecondary },
                     hardnessRange?.min === 1 && hardnessRange?.max === 3 && { color: '#ffffff' }
                   ]}>Yumuşak (1-3)</Text>
                 </TouchableOpacity>
                 
                 <TouchableOpacity
                   style={[
                     styles.hardnessChip,
                     { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                     hardnessRange?.min === 4 && hardnessRange?.max === 6 && { backgroundColor: themeColors.accent, borderColor: themeColors.accent }
                   ]}
                   onPress={() => setHardnessFilter(4, 6)}
                 >
                   <Text style={[
                     styles.hardnessChipText,
                     { color: themeColors.textSecondary },
                     hardnessRange?.min === 4 && hardnessRange?.max === 6 && { color: '#ffffff' }
                   ]}>Orta (4-6)</Text>
                 </TouchableOpacity>
                 
                 <TouchableOpacity
                   style={[
                     styles.hardnessChip,
                     { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                     hardnessRange?.min === 7 && hardnessRange?.max === 10 && { backgroundColor: themeColors.accent, borderColor: themeColors.accent }
                   ]}
                   onPress={() => setHardnessFilter(7, 10)}
                 >
                   <Text style={[
                     styles.hardnessChipText,
                     { color: themeColors.textSecondary },
                     hardnessRange?.min === 7 && hardnessRange?.max === 10 && { color: '#ffffff' }
                   ]}>Sert (7-10)</Text>
                 </TouchableOpacity>
               </ScrollView>
               {hardnessRange && (
                 <TouchableOpacity 
                   style={styles.clearFiltersButton}
                   onPress={clearHardnessFilter}
                 >
                   <Text style={styles.clearFiltersText}>Sertlik Filtresini Temizle</Text>
                 </TouchableOpacity>
               )}
             </View>
           </View>
         )}
       
    </>
  );

  return (
    <View style={[styles.container, { 
      backgroundColor: themeColors.background,
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right
    }]}>
      {isLoading ? (
        <FlatList
          data={Array.from({ length: 6 }, (_, index) => ({ id: index.toString() }))}
          renderItem={() => viewMode === 'grid' ? <GridCardSkeleton /> : <StoneCardSkeleton />}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={`skeleton-${viewMode}`}
          removeClippedSubviews={false}
          maxToRenderPerBatch={6}
          windowSize={6}
          initialNumToRender={6}
          scrollEnabled={false}
        />
      ) : (
        <FlatList
          data={filteredStones}
          renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          getItemLayout={viewMode === 'list' ? getItemLayout : undefined}
          removeClippedSubviews={true}
          maxToRenderPerBatch={viewMode === 'grid' ? 2 : 3}
          windowSize={viewMode === 'grid' ? 4 : 5}
          initialNumToRender={viewMode === 'grid' ? 2 : 3}
          updateCellsBatchingPeriod={50}
          disableVirtualization={false}
          legacyImplementation={false}
          extraData={collection}
          onEndReachedThreshold={0.5}
          contentInset={{bottom: 80}}
        />
      )}

      {/* Sıralama Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSortModal}
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Sıralama</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  { borderBottomColor: themeColors.border },
                  sortBy === option.value && { backgroundColor: themeColors.primary + '20' }
                ]}
                onPress={() => {
                  setSortBy(option.value as 'name' | 'hardness' | 'category');
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: themeColors.text }]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Ionicons name="checkmark" size={20} color={themeColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  appHeaderSection: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 20,
    marginBottom: 20,
    width: '90%',
  },
  appHeaderContainer: {
    borderRadius: 20,
    padding:20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  appHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    fontSize: 20,
    fontWeight: '500',
    opacity: 0.7,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginLeft: 8,
  },
  searchWrapper: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearHistoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  suggestionText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  suggestionDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff5722',
    borderRadius: 12,
  },
  clearFiltersText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  colorChip: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  colorChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  colorChipTextSelected: {
    color: '#ffffff',
  },
  hardnessChip: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ffcc80',
  },
  hardnessChipSelected: {
    backgroundColor: '#ff9800',
    borderColor: '#ff9800',
  },
  hardnessChipText: {
    fontSize: 14,
    color: '#e65100',
    fontWeight: '500',
  },
  hardnessChipTextSelected: {
    color: '#ffffff',
  },
  originChip: {
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ce93d8',
  },
  originChipSelected: {
    backgroundColor: '#9c27b0',
    borderColor: '#9c27b0',
  },
  originChipText: {
    fontSize: 13,
    color: '#7b1fa2',
    fontWeight: '500',
  },
  originChipTextSelected: {
    color: '#ffffff',
  },

  listContainer: {
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  stoneCard: {
    borderRadius: 25,
    marginBottom: 15,
    marginLeft: -5,
    marginRight: 15,
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
  },
  stoneCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
  },
  stoneImageContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    padding: 3,
  },
  stoneImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#f8f9fa',
  },
  stoneInfo: {
    flex: 1,
  },
  stoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stoneNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stoneName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    flex: 1,
  },
  heartButton: {
    padding: 4,
    marginLeft: 8,
  },
  stoneCategory: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stoneDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  stoneDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  propertiesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  propertiesTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  propertiesText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleInfo: {
    flex: 1,
  },
  compactViewButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  gridCard: {
    borderRadius: 20,
    margin: 6,
    marginHorizontal: 10,
    flex: 1,
    overflow: 'hidden',
  },
  gridCardContent: {
    padding: 12,
    borderRadius: 20,
  },
  gridImageContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    position: 'relative',
  },
  gridHeartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#f8f9fa',
  },
  gridInfo: {
    alignItems: 'center',
  },
  gridStoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  gridStoneCategory: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  gridStoneHardness: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  categorySelector: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  categorySelectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  categorySelectorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  compactControls: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactFilterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resultCount: {
    fontSize: 12,
    textAlign: 'center',
  },
  sortContainer: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 1000,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sortButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sortDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortOptionText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
     fontSize: 18,
     fontWeight: 'bold',
   },
   loadingContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     paddingVertical: 50,
   },
   loadingText: {
     marginTop: 16,
     fontSize: 16,
     fontWeight: '500',
   },

   filterPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
