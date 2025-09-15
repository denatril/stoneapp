import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCollection } from '../contexts/CollectionContext';
import { useTheme } from '../contexts/ThemeContext';
import { Stone, categories } from '../data/stones';
import SafeImage from '../components/SafeImage';

// Lazy loading için görsel cache sistemi
const stoneImageCache = new Map<string, any>();
const defaultImage = require('../assets/icon.png');



// Statik görsel haritası - Sadece 5 popüler taş
const imageMap: { [key: string]: any } = {
  'amethyst.png': require('../assets/stones/amethyst.png'),
  'clear-quartz.png': require('../assets/stones/clear-quartz.png'),
  'rose-quartz.png': require('../assets/stones/rose-quartz.png'),
  'citrine.png': require('../assets/stones/citrine.png'),
  'tiger-eye.png': require('../assets/stones/tiger-eye.png'),
};

// Kritik görselleri önceden yükle
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
  return imageSource;
};

// Optimized görsel yükleme fonksiyonu
const getStoneImage = (imageUrl: string | undefined): any => {
  if (!imageUrl) {
    return defaultImage;
  }
  
  if (stoneImageCache.has(imageUrl)) {
    const cachedImage = stoneImageCache.get(imageUrl);
    return cachedImage || defaultImage;
  }
  
  // imageMap'ten statik require'ı al
  const staticImage = imageMap[imageUrl];
  if (staticImage) {
    stoneImageCache.set(imageUrl, staticImage);
    return staticImage;
  }
  
  return defaultImage;
};

// Bileşen dışında tanımlanan sabit fonksiyonlar
const keyExtractor = (item: Stone) => item.id;

const getItemLayout = (data: ArrayLike<Stone> | null | undefined, index: number) => ({
  length: 120,
  offset: 120 * index,
  index,
});

interface CollectionScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    addListener: (event: string, callback: () => void) => () => void;
  };
}

export default function CollectionScreen({ navigation }: CollectionScreenProps) {
  const insets = useSafeAreaInsets();
  const { collection, removeFromCollection, addCustomStoneToCollection } = useCollection();
  const { colors: themeColors, theme } = useTheme();
  
  // Kritik görselleri önceden yükle - geçici olarak devre dışı
  // useEffect(() => {
  //   preloadCriticalImages();
  // }, []);
  
  // Görünen taşların görsellerini lazy load et
  useEffect(() => {
    collection.forEach(stone => {
      if (stone.imageUrl && !stoneImageCache.has(stone.imageUrl)) {
        loadImageLazy(stone.imageUrl);
      }
    });
  }, [collection]);
  
  // Filtreleme ve sıralama state'leri
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'hardness' | 'dateAdded'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  


  const handleRemoveFromCollection = useCallback((stoneId: string) => {
    removeFromCollection(stoneId);
  }, [removeFromCollection]);



  // Filtrelenmiş ve sıralanmış koleksiyon
  const filteredAndSortedCollection = useMemo(() => {
    let filtered = collection;
    
    // Kategori filtresi
    if (filterCategory !== 'all') {
      filtered = collection.filter(stone => stone.category === filterCategory);
    }
    
    // Sıralama
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'tr');
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category, 'tr');
          break;
        case 'hardness':
          comparison = a.hardness - b.hardness;
          break;
        case 'dateAdded':
          // Varsayılan olarak ekleme sırasına göre (id'ye göre)
          comparison = a.id.localeCompare(b.id);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [collection, filterCategory, sortBy, sortOrder]);

  const renderCollectionItem = useCallback(({ item }: { item: Stone }) => (
    <TouchableOpacity 
      style={[styles.stoneCard, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadow }]}
      onPress={() => navigation.navigate('StoneDetail', { stone: item })}
      activeOpacity={0.7}
    >
      <View style={styles.stoneCardContent}>
        <View style={styles.stoneImageContainer}>
          <SafeImage 
          source={getStoneImage(item.imageUrl)} 
          style={styles.stoneImage}
          resizeMode="contain"
          fadeDuration={0}
        />
        </View>
        <View style={styles.stoneInfo}>
          <View style={styles.stoneHeader}>
            <View style={styles.stoneNameContainer}>
              <Text style={[styles.stoneName, { color: themeColors.primary }]} numberOfLines={1}>{item.name}</Text>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveFromCollection(item.id)}
                activeOpacity={0.6}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <Ionicons 
                  name="heart" 
                  size={20} 
                  color="#ff4757" 
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
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{item.color[0]}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Menşei</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{item.origin[0]}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [themeColors, handleRemoveFromCollection, navigation, collection]);

  const EmptyCollection = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={themeColors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Favorileriniz Boş</Text>
      <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
        Beğendiğiniz taşları favorilerinize eklemek için kalp simgesine dokunun
      </Text>
      <TouchableOpacity 
        style={[styles.browseButton, { backgroundColor: themeColors.primary }]}
        onPress={() => navigation.navigate('Kütüphane')}
        activeOpacity={0.8}
      >
        <Text style={styles.browseButtonText}>Taşları Keşfet</Text>
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <View>
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
              <Ionicons name="star" size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.appTitleContainer}>
              <Text style={[styles.appTitle, { color: themeColors.text }]}>Favorilerim</Text>
              <Text style={[styles.appSubtitle, { color: themeColors.textSecondary }]}>Favori Taşlarınız</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="funnel" size={20} color={themeColors.primary} />
              {filterCategory !== 'all' && <View style={[styles.filterIndicator, { backgroundColor: themeColors.primary }]} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
              onPress={() => setShowSortModal(true)}
            >
              <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={20} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (collection.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ListHeaderComponent />
        <EmptyCollection />
      </View>
    );
  }

  if (filteredAndSortedCollection.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ListHeaderComponent />
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={80} color={themeColors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Sonuç Bulunamadı</Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            Seçilen filtrelere uygun taş bulunamadı
          </Text>
          <TouchableOpacity 
            style={[styles.browseButton, { backgroundColor: themeColors.primary }]}
            onPress={() => {
              setFilterCategory('all');
              setSortBy('name');
              setSortOrder('asc');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.browseButtonText}>Filtreleri Temizle</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, paddingTop: insets.top }]}>
      <FlatList
        data={filteredAndSortedCollection}
        renderItem={renderCollectionItem}
        keyExtractor={keyExtractor}
        extraData={filteredAndSortedCollection}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={3}
        getItemLayout={getItemLayout}
        updateCellsBatchingPeriod={50}
        disableVirtualization={false}
        legacyImplementation={false}
        onEndReachedThreshold={0.5}
      />
      
      {/* Sıralama Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Sıralama</Text>
            
            {[
              { key: 'name', label: 'İsme Göre', icon: 'text' },
              { key: 'category', label: 'Kategoriye Göre', icon: 'library' },
              { key: 'hardness', label: 'Sertliğe Göre', icon: 'diamond' },
              { key: 'dateAdded', label: 'Eklenme Tarihine Göre', icon: 'time' }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[styles.modalOption, sortBy === option.key && { backgroundColor: themeColors.primary + '20' }]}
                onPress={() => {
                  setSortBy(option.key as any);
                  setShowSortModal(false);
                }}
              >
                <Ionicons name={option.icon as any} size={20} color={themeColors.primary} />
                <Text style={[styles.modalOptionText, { color: themeColors.text }]}>{option.label}</Text>
                {sortBy === option.key && <Ionicons name="checkmark" size={20} color={themeColors.primary} />}
              </TouchableOpacity>
            ))}
            
            <View style={[styles.modalDivider, { backgroundColor: themeColors.border }]} />
            
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: themeColors.primary + '10' }]}
              onPress={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                setShowSortModal(false);
              }}
            >
              <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={20} color={themeColors.primary} />
              <Text style={[styles.modalOptionText, { color: themeColors.text }]}>
                {sortOrder === 'asc' ? 'Artan Sıralama' : 'Azalan Sıralama'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Filtreleme Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Kategori Filtresi</Text>
            
            <TouchableOpacity
              style={[styles.modalOption, filterCategory === 'all' && { backgroundColor: themeColors.primary + '20' }]}
              onPress={() => {
                setFilterCategory('all');
                setShowFilterModal(false);
              }}
            >
              <Ionicons name="apps" size={20} color={themeColors.primary} />
              <Text style={[styles.modalOptionText, { color: themeColors.text }]}>Tüm Kategoriler</Text>
              {filterCategory === 'all' && <Ionicons name="checkmark" size={20} color={themeColors.primary} />}
            </TouchableOpacity>
            
            <View style={[styles.modalDivider, { backgroundColor: themeColors.border }]} />
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.modalOption, filterCategory === category && { backgroundColor: themeColors.primary + '20' }]}
                onPress={() => {
                  setFilterCategory(category);
                  setShowFilterModal(false);
                }}
              >
                <Ionicons name="library" size={20} color={themeColors.primary} />
                <Text style={[styles.modalOptionText, { color: themeColors.text }]}>{category}</Text>
                {filterCategory === category && <Ionicons name="checkmark" size={20} color={themeColors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  appHeaderSection: {
    marginBottom: 20,
    marginTop: 45,
    marginHorizontal: 20,
  },
  appHeaderContainer: {
    borderRadius: 20,
    padding: 20,
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
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  header: {
    marginBottom: 20,
    paddingTop: 20,
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
  listContainer: {
    paddingBottom: 20,
  },
  stoneCard: {
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
    shadowRadius: 3.84,
    elevation: 5,
  },
  stoneCardContent: {
    flexDirection: 'row',
  },
  stoneImageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    flex: 1,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  stoneCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stoneDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  stoneDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  filterIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  modalDivider: {
    height: 1,
    marginVertical: 8,
  },
});
