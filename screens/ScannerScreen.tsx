import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Modal, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stone, UserLibrary, createDefaultUserLibrary, libraryHelpers } from '../data/stones';
import { apiService, StoneAnalysisRequest } from '../services/apiService';
import { apiConfigManager } from '../config/apiConfig';
import { useNavigation } from '@react-navigation/native';

const ScannerScreen = React.memo(() => {
  const { colors: themeColors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<'back' | 'front'>('back');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Performance monitoring - Production build'de aktif
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' && !__DEV__) {
      // performanceMonitor.startMountMeasurement('ScannerScreen');
      return () => {
        // performanceMonitor.endMountMeasurement('ScannerScreen');
      };
    }
  }, []);



  const requestMediaLibraryPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }, []);

  const takePicture = useCallback(async () => {
    if (cameraRef.current && !isLoading) {
      try {
        setIsLoading(true);
        if (process.env.NODE_ENV === 'production' && !__DEV__) {
          // performanceMonitor.startRenderMeasurement('camera-capture');
        }
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setCapturedImage(photo.uri);
        setShowCamera(false);
        setShowImageModal(true);
        if (process.env.NODE_ENV === 'production' && !__DEV__) {
          // performanceMonitor.endRenderMeasurement('camera-capture');
        }
      } catch (error) {
        Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  const pickImage = useCallback(async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        Alert.alert('İzin Gerekli', 'Galeriye erişim için izin gerekli.');
        return;
      }

      if (process.env.NODE_ENV === 'production' && !__DEV__) {
        // performanceMonitor.startRenderMeasurement('image-picker');
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        setShowImageModal(true);
      }
      if (process.env.NODE_ENV === 'production' && !__DEV__) {
        // performanceMonitor.endRenderMeasurement('image-picker');
      }
    } catch (error) {
      Alert.alert('Hata', 'Galeri açılırken bir hata oluştu.');
    }
  }, [requestMediaLibraryPermission]);

  const analyzeImage = useCallback(async () => {
    if (!capturedImage) return;

    try {
      setIsLoading(true);
      setShowImageModal(false);
      if (process.env.NODE_ENV === 'production' && !__DEV__) {
        // performanceMonitor.startRenderMeasurement('image-analysis');
      }
      
      // Check if API key is configured
      const hasApiKey = await apiService.isApiKeySet();
      if (!hasApiKey) {
        Alert.alert(
          'API Anahtarı Gerekli',
          'Taş analizi için OpenAI API anahtarı gereklidir. Ayarlardan API anahtarınızı girin.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Ayarlara Git', onPress: () => navigation.navigate('Profil' as never) }
          ]
        );
        return;
      }

      // Check usage limits
      const usageCheck = await apiConfigManager.canMakeRequest();
      if (!usageCheck.allowed) {
        Alert.alert('Kullanım Limiti', usageCheck.reason || 'API kullanım limiti aşıldı.');
        return;
      }

      // Convert image to base64
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.readAsDataURL(blob);
      });

      // Prepare analysis request
      const analysisRequest: StoneAnalysisRequest = {
        imageBase64: base64,
        imageFormat: 'jpeg',
        analysisType: 'full'
      };

      // Perform AI analysis
      const analysisResult = await apiService.analyzeStone(analysisRequest);
      
      if (analysisResult.success && analysisResult.data) {
        // Create stone from analysis result
        const analyzedStoneData = analysisResult.data;
        const newStone: Stone = {
          id: Date.now().toString(),
          name: analyzedStoneData.stoneName,
          scientificName: analyzedStoneData.stoneName,
          category: analyzedStoneData.properties.category,
          color: Array.isArray(analyzedStoneData.properties.color) ? analyzedStoneData.properties.color : [analyzedStoneData.properties.color],
          hardness: analyzedStoneData.properties.hardness,
          origin: Array.isArray(analyzedStoneData.properties.origin) ? analyzedStoneData.properties.origin : [analyzedStoneData.properties.origin],
          properties: Array.isArray(analyzedStoneData.properties.healingProperties) ? analyzedStoneData.properties.healingProperties : [analyzedStoneData.properties.healingProperties || 'Şifa özellikleri'],
          healingProperties: Array.isArray(analyzedStoneData.properties.healingProperties) ? analyzedStoneData.properties.healingProperties : [analyzedStoneData.properties.healingProperties || 'Şifa özellikleri'],
          uses: ['Meditasyon', 'Şifa', 'Koruma'],
          description: analyzedStoneData.description,
          imageUrl: capturedImage
        };
        
        // Add to user's library
        const libraryData = await AsyncStorage.getItem('userLibrary');
        let userLibrary: UserLibrary;
        
        if (libraryData) {
          userLibrary = JSON.parse(libraryData);
        } else {
          userLibrary = createDefaultUserLibrary('default_user');
        }
        
        // Add stone to library
        const updatedLibrary = libraryHelpers.addStoneToLibrary(userLibrary, newStone);
        
        // Save updated library
        await AsyncStorage.setItem('userLibrary', JSON.stringify(updatedLibrary));
        
        // Update usage tracking
        await apiConfigManager.incrementUsage(true);
        
        // Show result to user
        Alert.alert(
          'Taş Tanımlandı! 🔮',
          `${newStone.name} taşını keşfettiniz!\n\n${newStone.description}`,
          [{ text: 'Tamam', style: 'default' }]
        );
        
        if (process.env.NODE_ENV === 'production' && !__DEV__) {
          // performanceMonitor.endRenderMeasurement('image-analysis');
        }
      } else {
        // Update usage tracking for failed request
        await apiConfigManager.incrementUsage(false);
        
        Alert.alert(
          'Analiz Başarısız',
          analysisResult.error || 'Taş analizi yapılamadı. Lütfen tekrar deneyin.',
          [
            { text: 'Tamam' },
            { text: 'Tekrar Dene', onPress: () => analyzeImage() }
          ]
        );
      }
      
      setCapturedImage(null);
    } catch (error) {
      console.error('Analysis error:', error);
      await apiConfigManager.incrementUsage(false);
      
      Alert.alert(
        'Hata',
        'Görsel analizi sırasında bir hata oluştu. İnternet bağlantınızı kontrol edin.',
        [
          { text: 'Tamam' },
          { text: 'Tekrar Dene', onPress: () => analyzeImage() }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  }, [capturedImage]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setShowImageModal(false);
    setShowCamera(true);
  }, []);

  const closeImageModal = useCallback(() => {
    setShowImageModal(false);
    setCapturedImage(null);
  }, []);

  const toggleCameraType = useCallback(() => {
    setType(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.loadingText, { color: themeColors.text }]}>Kamera izni kontrol ediliyor...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Ionicons name="camera-outline" size={64} color={themeColors.textSecondary} />
        <Text style={[styles.noPermissionText, { color: themeColors.text }]}>Kamera İzni Gerekli</Text>
        <Text style={[styles.noPermissionDescription, { color: themeColors.textSecondary }]}>
          Taş tanıma özelliğini kullanmak için kamera iznine ihtiyacımız var.
        </Text>
        <TouchableOpacity 
          style={[styles.permissionButton, { backgroundColor: themeColors.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera} 
          facing={type} 
          ref={cameraRef}
        />
        <View style={styles.cameraOverlay}>
          <View style={[styles.cameraHeader, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity 
              style={[styles.cameraButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cameraButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={toggleCameraType}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          <View style={styles.cameraFooter}>
            <TouchableOpacity 
              style={[styles.captureButton, isLoading && { opacity: 0.6 }]}
              onPress={takePicture}
              disabled={isLoading}
            >
              <View style={styles.captureButtonInner}>
                {isLoading && (
                  <View style={styles.loadingIndicator}>
                    <Text style={styles.loadingText}>•••</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Uygulama Başlığı */}
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
                  <Text style={[styles.appTitle, { color: themeColors.text }]}>Taş Tanımlama</Text>
                  <Text style={[styles.appSubtitle, { color: themeColors.textSecondary }]}>Taşları Tanıyın</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="camera" size={32} color="white" />
              <Text style={styles.actionButtonText}>Fotoğraf Çek</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: themeColors.accent }]}
              onPress={pickImage}
            >
              <Ionicons name="images" size={32} color="white" />
              <Text style={styles.actionButtonText}>Galeriden Seç</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.infoCard, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="information-circle" size={24} color={themeColors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: themeColors.text }]}>Nasıl Kullanılır?</Text>
              <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
                • Taşınızı iyi aydınlatılmış bir yerde fotoğraflayın{"\n"}
                • Taşın tüm yüzeyini gösterecek şekilde çekin{"\n"}
                • Net ve odaklanmış fotoğraflar daha iyi sonuç verir
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Image Analysis Modal */}
      <Modal
        visible={showImageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity onPress={closeImageModal}>
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Fotoğraf Analizi</Text>
            <View style={{ width: 24 }} />
          </View>

          {capturedImage && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: themeColors.textSecondary }]}
              onPress={retakePhoto}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.modalButtonText}>Yeniden Çek</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: themeColors.primary }]}
              onPress={analyzeImage}
            >
              <Ionicons name="analytics" size={20} color="white" />
              <Text style={styles.modalButtonText}>Analiz Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default ScannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  appHeaderSection: {
    marginBottom: 20,
    marginTop: 25,
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
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: 5,
    marginTop: -5,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  noPermissionText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  noPermissionDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    borderWidth: 3,
  },
  topLeft: {
    top: -100,
    left: -100,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -100,
    right: -100,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -100,
    left: -100,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -100,
    right: -100,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  cameraFooter: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  capturedImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
