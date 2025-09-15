import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Stone } from '../data/stones';
import { useTheme } from '../contexts/ThemeContext';
import { useCollection } from '../contexts/CollectionContext';
import { useFavorites } from '../contexts/FavoritesContext';
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

interface StoneDetailScreenProps {
  route: {
    params: {
      stone: Stone;
    };
  };
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export default function StoneDetailScreen({ route, navigation }: StoneDetailScreenProps) {

  const { stone } = route.params;
  const { colors: themeColors } = useTheme();
  const { addToCollection, removeFromCollection, isInCollection } = useCollection();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  // Kritik görselleri önceden yükle - geçici olarak devre dışı
  // useEffect(() => {
  //   preloadCriticalImages();
  // }, []);

  // Mevcut taşın görselini lazy load et
  useEffect(() => {
    if (stone.imageUrl && !stoneImageCache.has(stone.imageUrl)) {
      loadImageLazy(stone.imageUrl);
    }
  }, [stone.imageUrl]);

  const isStoneInCollection = isInCollection(stone.id);
  const isStoneInFavorites = isFavorite(stone.id);

  const handleToggleCollection = () => {
    if (isStoneInCollection) {
      removeFromCollection(stone.id);
      Alert.alert('Başarılı', `${stone.name} koleksiyondan çıkarıldı.`);
    } else {
      addToCollection(stone);
      Alert.alert('Başarılı', `${stone.name} koleksiyona eklendi!`);
    }
  };

  const handleToggleFavorites = () => {
    if (isStoneInFavorites) {
      removeFromFavorites(stone.id);
      Alert.alert('Başarılı', `${stone.name} favorilerden çıkarıldı.`);
    } else {
      addToFavorites(stone);
      Alert.alert('Başarılı', `${stone.name} favorilere eklendi!`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stone.name}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleToggleFavorites}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isStoneInFavorites ? "heart" : "heart-outline"} 
              size={24} 
              color={isStoneInFavorites ? "#ff6b6b" : "#fff"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleToggleCollection}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isStoneInCollection ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isStoneInCollection ? "#4ecdc4" : "#fff"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stone Info */}
      <View style={styles.content}>
        {/* Basic Info */}
        <View style={styles.basicInfo}>
          {stone.imageUrl && (
            <View style={styles.stoneImageContainer}>
          <SafeImage 
            source={getStoneImage(stone.imageUrl)} 
            style={styles.stoneDetailImage}
            resizeMode="contain"
          />
            </View>
          )}
          <Text style={[styles.stoneName, { color: themeColors.primary }]}>{stone.name}</Text>
          <Text style={[styles.scientificName, { color: themeColors.textSecondary }]}>{stone.scientificName}</Text>
          <View style={[styles.categoryTag, { backgroundColor: themeColors.accent + '20' }]}>
            <Text style={[styles.categoryText, { color: themeColors.accent }]}>{stone.category}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Açıklama</Text>
          <Text style={[styles.description, { color: themeColors.textSecondary }]}>{stone.description}</Text>
        </View>

        {/* Physical Properties */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Fiziksel Özellikler</Text>
          <View style={styles.propertiesGrid}>
            <View style={[styles.propertyItem, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadow }]}>
              <Text style={[styles.propertyLabel, { color: themeColors.textSecondary }]}>Sertlik</Text>
              <Text style={[styles.propertyValue, { color: themeColors.text }]}>{stone.hardness}/10</Text>
            </View>
            <View style={[styles.propertyItem, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadow }]}>
              <Text style={[styles.propertyLabel, { color: themeColors.textSecondary }]}>Renkler</Text>
              <Text style={[styles.propertyValue, { color: themeColors.text }]}>{stone.color.join(', ')}</Text>
            </View>
          </View>
        </View>

        {/* Origins */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Menşei</Text>
          <View style={[styles.originsList, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadow }]}>
            {stone.origin.map((origin, index) => (
              <View key={index} style={styles.originItem}>
                <Ionicons name="location" size={16} color={themeColors.primary} />
                <Text style={[styles.originText, { color: themeColors.text }]}>{origin}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Properties */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Özellikler</Text>
          <View style={styles.tagsContainer}>
            {stone.properties.map((property, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: themeColors.accent + '20' }]}>
                <Text style={[styles.tagText, { color: themeColors.accent }]}>{property}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Healing Properties */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Şifa Özellikleri</Text>
          <View style={[styles.healingList, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadow }]}>
            {stone.healingProperties.map((healing, index) => (
              <View key={index} style={styles.healingItem}>
                <Ionicons name="leaf" size={16} color={themeColors.accent} />
                <Text style={[styles.healingText, { color: themeColors.text }]}>{healing}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Uses */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Kullanım Alanları</Text>
          <View style={[styles.usesList, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadow }]}>
            {stone.uses.map((use, index) => (
              <View key={index} style={styles.useItem}>
                <Ionicons name="star" size={16} color={themeColors.primary} />
                <Text style={[styles.useText, { color: themeColors.text }]}>{use}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Care Instructions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Bakım Talimatları</Text>
          <View style={[styles.careCard, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadow }]}>
            <View style={styles.careItem}>
              <Ionicons name="water" size={20} color={themeColors.accent} />
              <Text style={[styles.careText, { color: themeColors.text }]}>Temizlik: Yumuşak fırça ve ılık su ile temizleyin</Text>
            </View>
            <View style={styles.careItem}>
              <Ionicons name="sunny" size={20} color={themeColors.accent} />
              <Text style={[styles.careText, { color: themeColors.text }]}>Şarj: Ay ışığında veya doğal güneş ışığında şarj edin</Text>
            </View>
            <View style={styles.careItem}>
              <Ionicons name="shield-checkmark" size={20} color={themeColors.accent} />
              <Text style={[styles.careText, { color: themeColors.text }]}>Saklama: Yumuşak bez içinde, serin ve kuru yerde saklayın</Text>
            </View>
          </View>
        </View>

        {/* Cleansing Methods */}
        {stone.cleansingMethods && stone.cleansingMethods.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Arındırma Yöntemleri</Text>
            <View style={[styles.cleansingCard, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadow }]}>
              {stone.cleansingMethods.map((method, index) => (
                <View key={index} style={styles.cleansingItem}>
                  <Ionicons name="sparkles" size={18} color={themeColors.primary} />
                  <Text style={[styles.cleansingText, { color: themeColors.text }]}>{method}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Chakra Association */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Çakra İlişkisi</Text>
          <View style={[styles.chakraCard, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadow }]}>
            <View style={styles.chakraItem}>
              <View style={[styles.chakraIndicator, { backgroundColor: '#9C27B0' }]} />
              <Text style={[styles.chakraText, { color: themeColors.text }]}>Taç Çakrası - Ruhsal bağlantı ve bilgelik</Text>
            </View>
          </View>
        </View>

        {/* Zodiac Signs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Uyumlu Burçlar</Text>
          <View style={styles.zodiacContainer}>
            {['Balık', 'Akrep', 'Yengeç'].map((sign, index) => (
              <View key={index} style={[styles.zodiacTag, { backgroundColor: themeColors.accent + '20' }]}>
                <Ionicons name="star-outline" size={16} color={themeColors.accent} />
                <Text style={[styles.zodiacText, { color: themeColors.accent }]}>{sign}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  basicInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stoneImageContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  stoneDetailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 102,
    resizeMode: 'contain',
    backgroundColor: '#f8f9fa',
  },
  stoneName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  scientificName: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  propertiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  propertyItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  propertyLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  originsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  originItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  healingList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  healingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  usesList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  useItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  useText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  careCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  careItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  careText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  cleansingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cleansingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cleansingText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  chakraCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chakraItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chakraIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  chakraText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  zodiacContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zodiacTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  zodiacText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
});
