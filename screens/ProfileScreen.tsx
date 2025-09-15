import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useCollection } from '../contexts/CollectionContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { apiConfigManager } from '../config/apiConfig';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colors: themeColors, theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { collection } = useCollection();
  const { favorites } = useFavorites();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [apiUsage, setApiUsage] = useState({
    dailyCount: 0,
    monthlyCount: 0,
    lastResetDate: new Date().toISOString(),
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0
  });

  const getCollectionStats = () => {
    const totalStones = collection.length;
    const favoriteCount = favorites.length;
    const categories = [...new Set(collection.map(stone => stone.category))];
    const mostCommonCategory = categories.reduce((a, b) => 
      collection.filter(stone => stone.category === a).length >
      collection.filter(stone => stone.category === b).length ? a : b
    , categories[0] || 'Yok');
    
    return {
      totalStones,
      favoriteCount,
      categoryCount: categories.length,
      mostCommonCategory
    };
  };

  const stats = getCollectionStats();

  const handleClearCollection = () => {
    Alert.alert(
      'Koleksiyonu Temizle',
      'Tüm koleksiyonunuzu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => {
          // Bu fonksiyon CollectionContext'e eklenebilir
          Alert.alert('Bilgi', 'Koleksiyon temizleme özelliği yakında eklenecek.');
        }}
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Bilgi', 'Veri dışa aktarma özelliği yakında eklenecek.');
  };

  const loadApiKeyStatus = async () => {
    try {
      const key = await apiConfigManager.getApiKey();
      const usage = await apiConfigManager.getUsage();
      setHasApiKey(!!key);
      setApiUsage(usage);
      if (key) {
        setApiKey(key.substring(0, 8) + '...' + key.substring(key.length - 4));
      }
    } catch (error) {
      console.error('API key durumu yüklenirken hata:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      Alert.alert('Hata', 'Lütfen geçerli bir API key girin.');
      return;
    }

    try {
      await apiConfigManager.setApiKey(tempApiKey.trim());
      setShowApiKeyModal(false);
      setTempApiKey('');
      await loadApiKeyStatus();
      Alert.alert('Başarılı', 'API key başarıyla kaydedildi.');
    } catch (error) {
      Alert.alert('Hata', 'API key kaydedilirken bir hata oluştu.');
    }
  };

  const handleRemoveApiKey = () => {
    Alert.alert(
      'API Key Kaldır',
      'API key\'i kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiConfigManager.removeApiKey();
              await loadApiKeyStatus();
              Alert.alert('Başarılı', 'API key başarıyla kaldırıldı.');
            } catch (error) {
              Alert.alert('Hata', 'API key kaldırılırken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadApiKeyStatus();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
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
              <Ionicons name="person" size={24} color="#fff" />
            </LinearGradient>
            <View style={styles.appTitleContainer}>
              <Text style={[styles.appTitle, { color: themeColors.text }]}>Profilim</Text>
              <Text style={[styles.appSubtitle, { color: themeColors.textSecondary }]}>Kullanıcı Bilgileri</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* User Info */}
      {user && (
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Hesap Bilgileri</Text>
          
          <View style={styles.userInfoItem}>
            <Ionicons name="person-circle" size={24} color={themeColors.primary} />
            <View style={styles.userInfoContent}>
              <Text style={[styles.userInfoLabel, { color: themeColors.textSecondary }]}>İsim</Text>
              <Text style={[styles.userInfoValue, { color: themeColors.text }]}>{user.name}</Text>
            </View>
          </View>

          <View style={styles.userInfoItem}>
            <Ionicons name="mail" size={24} color={themeColors.primary} />
            <View style={styles.userInfoContent}>
              <Text style={[styles.userInfoLabel, { color: themeColors.textSecondary }]}>E-posta</Text>
              <Text style={[styles.userInfoValue, { color: themeColors.text }]}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.userInfoItem}>
            <Ionicons name="calendar" size={24} color={themeColors.primary} />
            <View style={styles.userInfoContent}>
              <Text style={[styles.userInfoLabel, { color: themeColors.textSecondary }]}>Üyelik Tarihi</Text>
              <Text style={[styles.userInfoValue, { color: themeColors.text }]}>
                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: themeColors.primary }]}>
          <Ionicons name="person" size={40} color="white" />
        </View>
        <Text style={[styles.userName, { color: themeColors.text }]}>Kristal Koleksiyoncusu</Text>
        <Text style={[styles.userEmail, { color: themeColors.textSecondary }]}>kristal@example.com</Text>
      </View>

      {/* İstatistikler */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Koleksiyon İstatistikleri</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: themeColors.primary }]}>{stats.totalStones}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Toplam Taş</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: themeColors.primary }]}>{stats.favoriteCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Favori</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: themeColors.primary }]}>{stats.categoryCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Kategori</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statText, { color: themeColors.primary }]}>{stats.mostCommonCategory}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>En Çok</Text>
          </View>
        </View>
      </View>

      {/* Uygulama Ayarları */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Uygulama Ayarları</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={24} color={themeColors.primary} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>Karanlık Mod</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: themeColors.border, true: themeColors.primary }}
            thumbColor={isDarkMode ? "white" : themeColors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={24} color={themeColors.primary} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>Bildirimler</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: themeColors.border, true: themeColors.primary }}
            thumbColor={notifications ? "white" : themeColors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="sync" size={24} color={themeColors.primary} />
            <Text style={[styles.settingText, { color: themeColors.text }]}>Otomatik Senkronizasyon</Text>
          </View>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: themeColors.border, true: themeColors.primary }}
            thumbColor={autoSync ? "white" : themeColors.textSecondary}
          />
        </View>
      </View>

      {/* API Ayarları */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>AI Analiz Ayarları</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="key" size={24} color={themeColors.primary} />
            <View style={styles.apiKeyInfo}>
              <Text style={[styles.settingText, { color: themeColors.text }]}>OpenAI API Key</Text>
              <Text style={[styles.apiKeyStatus, { color: hasApiKey ? '#4CAF50' : themeColors.textSecondary }]}>
                {hasApiKey ? `Aktif: ${apiKey}` : 'Ayarlanmamış'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.apiKeyButton, { backgroundColor: hasApiKey ? '#ff4444' : themeColors.primary }]}
            onPress={hasApiKey ? handleRemoveApiKey : () => setShowApiKeyModal(true)}
          >
            <Text style={styles.apiKeyButtonText}>
              {hasApiKey ? 'Kaldır' : 'Ekle'}
            </Text>
          </TouchableOpacity>
        </View>

        {hasApiKey && (
          <View style={styles.usageContainer}>
            <Text style={[styles.usageTitle, { color: themeColors.text }]}>Kullanım İstatistikleri</Text>
            <View style={styles.usageStats}>
              <View style={styles.usageStat}>
                <Text style={[styles.usageNumber, { color: themeColors.primary }]}>{apiUsage.dailyCount}</Text>
                <Text style={[styles.usageLabel, { color: themeColors.textSecondary }]}>Günlük</Text>
              </View>
              <View style={styles.usageStat}>
                <Text style={[styles.usageNumber, { color: themeColors.primary }]}>{apiUsage.monthlyCount}</Text>
                <Text style={[styles.usageLabel, { color: themeColors.textSecondary }]}>Aylık</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Veri Yönetimi */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Veri Yönetimi</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Ionicons name="download" size={24} color={themeColors.primary} />
          <Text style={[styles.actionText, { color: themeColors.text }]}>Verileri Dışa Aktar</Text>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleClearCollection}>
          <Ionicons name="trash" size={24} color="#ff4444" />
          <Text style={[styles.actionText, { color: "#ff4444" }]}>Koleksiyonu Temizle</Text>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Hakkında */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Hakkında</Text>
        <Text style={[styles.aboutText, { color: themeColors.textSecondary }]}>
          Kristal Rehberi v1.0.0{"\n"}
          Taş ve kristal koleksiyonunuzu yönetmek için geliştirilmiş modern bir uygulama.
        </Text>
      </View>

      {/* Logout Button - Only show if user is logged in */}
      {user && (
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      )}

      {/* Logout Button */}
      {user && (
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>OpenAI API Key</Text>
            <TouchableOpacity onPress={() => setShowApiKeyModal(false)}>
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={[styles.modalDescription, { color: themeColors.textSecondary }]}>
              AI taş analizi için OpenAI API key'inizi girin. API key'iniz güvenli bir şekilde cihazınızda saklanacaktır.
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>API Key</Text>
              <TextInput
                style={[styles.apiKeyInput, { 
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }]}
                value={tempApiKey}
                onChangeText={setTempApiKey}
                placeholder="sk-..."
                placeholderTextColor={themeColors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { borderColor: themeColors.border }]}
                onPress={() => {
                  setShowApiKeyModal(false);
                  setTempApiKey('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: themeColors.text }]}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: themeColors.primary }]}
                onPress={handleSaveApiKey}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  actionText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  apiKeyInfo: {
    flex: 1,
    marginLeft: 15,
  },
  apiKeyStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  apiKeyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  apiKeyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  usageContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  usageStat: {
    alignItems: 'center',
  },
  usageNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  usageLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    // backgroundColor will be set dynamically
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  userInfoContent: {
    flex: 1,
    marginLeft: 15,
  },
  userInfoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: '400',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#ff4444',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
