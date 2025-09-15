import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stones, Stone, UserLibrary, createDefaultUserLibrary, libraryHelpers } from '../data/stones';
import { useTheme } from '../contexts/ThemeContext';
import { StoneCardSkeleton } from '../components/SkeletonLoader';
import { OptimizedFlatList } from '../components/OptimizedFlatList';
import { MemoizedStoneCard } from '../components/MemoizedStoneCard';


// Görsel cache sistemi - Memory leak prevention
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

// Optimized görsel yükleme fonksiyonu
const getStoneImage = (imageUrl: string | undefined): any => {
  if (!imageUrl) {
    return defaultImage;
  }
  
  // Cache'den kontrol et
  if (stoneImageCache.has(imageUrl)) {
    return stoneImageCache.get(imageUrl) || defaultImage;
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

interface UserLibraryScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const STORAGE_KEY = 'user_library';
const USER_ID = 'default_user'; // Gerçek uygulamada kullanıcı kimlik doğrulamasından gelecek

export default function UserLibraryScreen({ navigation }: UserLibraryScreenProps) {
  const { colors: themeColors, theme } = useTheme();
  const [userLibrary, setUserLibrary] = useState<UserLibrary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [libraryName, setLibraryName] = useState('');
  const [libraryDescription, setLibraryDescription] = useState('');
  const [availableStones, setAvailableStones] = useState<Stone[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedStones, setSelectedStones] = useState<Set<string>>(new Set());
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Performance monitor is already instantiated as a singleton

  // Kullanıcı kütüphanesini yükle
  const loadUserLibrary = useCallback(async () => {
    // Production build'de performans izlemeyi aktifleştir
    const startTime = process.env.NODE_ENV === 'production' && !__DEV__ ? performance.now() : 0;
    
    try {
      setIsLoading(true);
      const savedLibrary = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (savedLibrary) {
        const library = JSON.parse(savedLibrary);
        // Date objelerini yeniden oluştur
        library.createdAt = new Date(library.createdAt);
        library.updatedAt = new Date(library.updatedAt);
        setUserLibrary(library);
        setLibraryName(library.name);
        setLibraryDescription(library.description || '');
      } else {
        // Varsayılan kütüphane oluştur
        const defaultLibrary = createDefaultUserLibrary(USER_ID);
        setUserLibrary(defaultLibrary);
        setLibraryName(defaultLibrary.name);
        setLibraryDescription(defaultLibrary.description || '');
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLibrary));
      }
    } catch (error) {
      console.error('Kütüphane yüklenirken hata:', error);
      Alert.alert('Hata', 'Kütüphane yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      // Production build'de performans izlemeyi aktifleştir
      if (process.env.NODE_ENV === 'production' && !__DEV__ && startTime > 0) {
        const endTime = performance.now();
        // performanceMonitor.addCustomMetric('loadUserLibrary', endTime - startTime);
      }
    }
  }, []);

  // Kullanıcı kütüphanesini kaydet
  const saveUserLibrary = useCallback(async (library: UserLibrary) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(library));
      setUserLibrary(library);
    } catch (error) {
      console.error('Kütüphane kaydedilirken hata:', error);
      Alert.alert('Hata', 'Kütüphane kaydedilirken bir hata oluştu.');
    }
  }, []);

  // Kütüphaneye taş ekle
  const addStoneToLibrary = useCallback(async (stone: Stone) => {
    if (!userLibrary) return;
    
    const updatedLibrary = libraryHelpers.addStoneToLibrary(userLibrary, stone);
    await saveUserLibrary(updatedLibrary);
  }, [userLibrary, saveUserLibrary]);

  // Kütüphaneden taş kaldır
  const removeStoneFromLibrary = useCallback(async (stoneId: string) => {
    if (!userLibrary) return;
    
    Alert.alert(
      'Taşı Kaldır',
      'Bu taşı kütüphanenizden kaldırmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            const updatedLibrary = libraryHelpers.removeStoneFromLibrary(userLibrary, stoneId);
            await saveUserLibrary(updatedLibrary);
          }
        }
      ]
    );
  }, [userLibrary, saveUserLibrary]);

  // Long press ile seçim modunu başlat
  const handleLongPressStart = useCallback((stoneId: string) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    
    const timer = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedStones(new Set([stoneId]));
    }, 3000); // 3 saniye
    
    setLongPressTimer(timer);
  }, [longPressTimer]);

  // Long press iptal
  const handleLongPressCancel = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Çoklu seçim modunu başlat
  const startSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
    setSelectedStones(new Set());
  }, []);

  // Seçim modunu iptal et
  const cancelSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedStones(new Set());
  }, []);

  // Taş seçimini değiştir
  const toggleStoneSelection = useCallback((stoneId: string) => {
    setSelectedStones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stoneId)) {
        newSet.delete(stoneId);
      } else {
        newSet.add(stoneId);
      }
      return newSet;
    });
  }, []);

  // Seçili taşları kaldır
  const removeSelectedStones = useCallback(async () => {
    if (!userLibrary || selectedStones.size === 0) return;
    
    Alert.alert(
      'Seçili Taşları Kaldır',
      `${selectedStones.size} taşı kütüphanenizden kaldırmak istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            let updatedLibrary = userLibrary;
            for (const stoneId of selectedStones) {
              updatedLibrary = libraryHelpers.removeStoneFromLibrary(updatedLibrary, stoneId);
            }
            await saveUserLibrary(updatedLibrary);
            setIsSelectionMode(false);
            setSelectedStones(new Set());
          }
        }
      ]
    );
  }, [userLibrary, selectedStones, saveUserLibrary]);

  // Kütüphane bilgilerini güncelle
  const updateLibraryInfo = useCallback(async () => {
    if (!userLibrary) return;
    
    const updatedLibrary = {
      ...userLibrary,
      name: libraryName,
      description: libraryDescription,
      updatedAt: new Date()
    };
    
    await saveUserLibrary(updatedLibrary);
    setShowEditModal(false);
  }, [userLibrary, libraryName, libraryDescription, saveUserLibrary]);

  // Kullanılabilir taşları hesapla (kütüphanede olmayan taşlar) - Memoized
  const calculateAvailableStones = useMemo(() => {
    if (!userLibrary) return [];
    
    const libraryStoneIds = new Set(userLibrary.stones.map(stone => stone.id));
    return stones.filter(stone => !libraryStoneIds.has(stone.id));
  }, [userLibrary]);

  useEffect(() => {
    loadUserLibrary();
  }, [loadUserLibrary]);

  useEffect(() => {
    setAvailableStones(calculateAvailableStones);
  }, [calculateAvailableStones]);

  // Production build'de performans raporu oluştur
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && !__DEV__) {
      return () => {
        // Performance monitoring disabled for production
        if (__DEV__) {
          console.log('UserLibraryScreen cleanup');
        }
      };
    }
  }, []);

  // Optimized kütüphane taşı render fonksiyonu
  const renderLibraryStone = useCallback(({ item }: { item: Stone }) => {
    return (
      <MemoizedStoneCard
        stone={item}
        isSelected={selectedStones.has(item.id)}
        isSelectionMode={isSelectionMode}
        themeColors={themeColors}
        theme={theme}
        onPress={() => {
          if (isSelectionMode) {
            toggleStoneSelection(item.id);
          } else {
            navigation.navigate('StoneDetail', { stone: item });
          }
        }}
        onLongPressStart={() => {
          if (!isSelectionMode) {
            handleLongPressStart(item.id);
          }
        }}
        onLongPressCancel={() => {
          if (!isSelectionMode) {
            handleLongPressCancel();
          }
        }}
      />
    );
  }, [themeColors, navigation, theme, isSelectionMode, selectedStones, toggleStoneSelection, handleLongPressStart, handleLongPressCancel]);

  // Eklenebilir taş render fonksiyonu
  const renderAvailableStone = useCallback(({ item }: { item: Stone }) => (
    <MemoizedStoneCard
      stone={item}
      isSelected={false}
      isSelectionMode={false}
      themeColors={themeColors}
      theme={theme}
      onPress={() => addStoneToLibrary(item)}
      onLongPressStart={() => {}}
      onLongPressCancel={() => {}}
    />
  ), [addStoneToLibrary, themeColors, theme]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          {[...Array(5)].map((_, index) => (
            <StoneCardSkeleton key={index} />
          ))}
        </View>
      </View>
    );
  }

  if (!userLibrary) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.errorText, { color: themeColors.text }]}>
          Kütüphane yüklenemedi
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={theme === 'dark' ? ['#2a2a3e', '#1a1a2e'] : ['#f8f9ff', '#e8f0fe']}
          style={styles.headerContent}
          start={[0, 0]}
          end={[1, 1]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.headerIcon}
                start={[0, 0]}
                end={[1, 1]}
              >
                <Ionicons name="library" size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>
                  {userLibrary.name}
                </Text>
                <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
                  {isSelectionMode && selectedStones.size > 0 
                    ? `${selectedStones.size} taş seçildi` 
                    : `${userLibrary.stones.length} taş`
                  }
                </Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              {isSelectionMode ? (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: themeColors.surface }]}
                    onPress={cancelSelectionMode}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={20} color={themeColors.text} />
                  </TouchableOpacity>
                  {selectedStones.size > 0 && (
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#ff3742' }]}
                      onPress={removeSelectedStones}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: themeColors.surface }]}
                    onPress={() => setShowEditModal(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={20} color={themeColors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: themeColors.accent }]}
                    onPress={() => setShowAddModal(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          {userLibrary.description && !isSelectionMode && (
            <Text style={[styles.headerDescription, { color: themeColors.textSecondary }]}>
              {userLibrary.description}
            </Text>
          )}
          {isSelectionMode && (
            <Text style={[styles.selectionModeText, { color: themeColors.accent }]}>
              Kaldırmak istediğiniz taşları seçin
            </Text>
          )}
        </LinearGradient>
      </View>

      {/* Kütüphane Taşları */}
      {userLibrary.stones.length > 0 ? (
        <OptimizedFlatList
          data={userLibrary.stones}
          renderItem={renderLibraryStone}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.emptyIcon}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Ionicons name="library-outline" size={48} color="#fff" />
          </LinearGradient>
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
            Kütüphaneniz Boş
          </Text>
          <Text style={[styles.emptyDescription, { color: themeColors.textSecondary }]}>
            Kişisel kristal koleksiyonunuzu oluşturmak için taş eklemeye başlayın
          </Text>
          <TouchableOpacity 
            style={[styles.addFirstButton, { backgroundColor: themeColors.accent }]}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addFirstButtonText}>İlk Taşınızı Ekleyin</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Taş Ekleme Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              Kütüphaneye Taş Ekle
            </Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowAddModal(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>
          
          {availableStones.length > 0 ? (
            <OptimizedFlatList
              data={availableStones}
              renderItem={renderAvailableStone}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalListContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noStonesContainer}>
              <Text style={[styles.noStonesText, { color: themeColors.textSecondary }]}>
                Tüm taşlar kütüphanenizde mevcut
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Kütüphane Düzenleme Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              Kütüphane Bilgileri
            </Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowEditModal(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>Kütüphane Adı</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: themeColors.surface, 
                  color: themeColors.text,
                  borderColor: themeColors.border
                }]}
                value={libraryName}
                onChangeText={setLibraryName}
                placeholder="Kütüphane adını girin"
                placeholderTextColor={themeColors.textSecondary}
                maxLength={50}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>Açıklama (İsteğe bağlı)</Text>
              <TextInput
                style={[styles.textAreaInput, { 
                  backgroundColor: themeColors.surface, 
                  color: themeColors.text,
                  borderColor: themeColors.border
                }]}
                value={libraryDescription}
                onChangeText={setLibraryDescription}
                placeholder="Kütüphane açıklamasını girin"
                placeholderTextColor={themeColors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: themeColors.accent }]}
              onPress={updateLibraryInfo}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerContent: {
    borderRadius: 16,
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerDescription: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
  },
  stoneCard: {
    marginBottom: 12,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stoneCardContent: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stoneImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stoneImage: {
    width: 40,
    height: 40,
  },
  stoneInfo: {
    flex: 1,
  },
  stoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  selectedStoneCard: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 2,
  },
  selectionModeText: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  stoneCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  stoneDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalListContainer: {
    padding: 16,
  },

  noStonesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noStonesText: {
    fontSize: 16,
    textAlign: 'center',
  },
  editForm: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
