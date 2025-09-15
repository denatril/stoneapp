import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { stones } from '../data/stones';
import { majorArcana, type TarotCard } from '../data/tarotCards';
import TarotCardComponent from '../components/TarotCard';
import { getDailyQuote, getRandomQuote } from '../data/quotes';
import AppHeader from '../components/AppHeader';

import DailyQuoteSection from '../components/DailyQuoteSection';
// import { useRouteBasedPreloading } from '../hooks/useRouteBasedPreloading';

export default function HomeScreen() {
  const { theme, colors: themeColors } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  
  // Route-based preloading - geçici olarak devre dışı
  // const { currentScreen, preloadScreen, getPreloadingMetrics } = useRouteBasedPreloading();
  const [stoneOfTheDay, setStoneOfTheDay] = useState(stones[0]);
  const [dailyQuote, setDailyQuote] = useState('');
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCombinationModal, setShowCombinationModal] = useState(false);
  const [cardAnimation] = useState(new Animated.Value(0));

  // Günün taşını belirle
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const randomIndex = dayOfYear % stones.length;
    setStoneOfTheDay(stones[randomIndex]);
  }, []);

  // Günlük motive edici sözü belirle
  useEffect(() => {
    setDailyQuote(getDailyQuote());
  }, []);

  // Yeni quote göster
  const getNewQuote = () => {
    const newQuote = getRandomQuote();
    setDailyQuote(newQuote);
  };

  // Kart çekme fonksiyonu - 3 kart çeker
  const drawCard = () => {
    const shuffledCards = [...majorArcana].sort(() => Math.random() - 0.5);
    const selectedCards = shuffledCards.slice(0, 3);
    setDrawnCards(selectedCards);
    setCurrentCardIndex(0);
    setShowCardModal(true);
    
    // Kart animasyonu
    cardAnimation.setValue(0);
    Animated.spring(cardAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  // Sıradaki kartı göster
  const showNextCard = () => {
    if (currentCardIndex < drawnCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      
      // Kart geçiş animasyonu
      cardAnimation.setValue(0);
      Animated.spring(cardAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  };

  // Modal kapatma fonksiyonu
  const closeCardModal = () => {
    Animated.timing(cardAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowCardModal(false);
      setDrawnCards([]);
      setCurrentCardIndex(0);
    });
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: themeColors.background,
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right
    }]}>
      {/* Ana İçerik */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{paddingBottom: 80}}
        showsVerticalScrollIndicator={false}>
        {/* Uygulama Başlığı */}
        <AppHeader />



        {/* Günün İlhamı */}
        <DailyQuoteSection dailyQuote={dailyQuote} onGetNewQuote={getNewQuote} />

        {/* Günün Taşı */}
        <View style={styles.stoneOfTheDaySection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Günün Taşı</Text>
            <View style={styles.specialBadge}>
              <Ionicons name="sparkles" size={16} color="#FFD700" />
              <Text style={styles.specialText}>Özel</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.stoneOfTheDayCard, { backgroundColor: themeColors.card }]}
            onPress={() => navigation.navigate('Kütüphane', { 
              screen: 'StoneDetail', 
              params: { stone: stoneOfTheDay } 
            })}
          >
            <LinearGradient
              colors={theme === 'dark' ? ['#2D1B69', '#11998e'] : ['#667eea', '#764ba2']}
              style={styles.stoneOfTheDayGradient}
              start={[0, 0]}
              end={[1, 1]}
            >
              <View style={styles.stoneOfTheDayContent}>
                <View style={styles.stoneOfTheDayImageContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.stoneImageGradient}
                  >
                    <Ionicons name="diamond" size={56} color="#fff" />
                  </LinearGradient>
                </View>
                
                <View style={styles.stoneOfTheDayInfo}>
                  <Text style={[styles.stoneOfTheDayName, { color: '#fff' }]}>{stoneOfTheDay.name}</Text>
                  <Text style={[styles.stoneOfTheDayCategory, { color: 'rgba(255,255,255,0.8)' }]}>{stoneOfTheDay.category}</Text>
                  <Text style={[styles.stoneOfTheDayDescription, { color: 'rgba(255,255,255,0.9)' }]} numberOfLines={3}>
                    {stoneOfTheDay.description}
                  </Text>
                  
                  <View style={styles.stoneActions}>
                    <View style={styles.actionButton}>
                      <Ionicons name="eye" size={16} color="#fff" />
                      <Text style={styles.actionText}>İncele</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.stoneOfTheDayIcon}>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tarot Kartları */}
        <View style={styles.tarotSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Günlük Tarot Kartınız</Text>
            <View style={styles.specialBadge}>
              <Ionicons name="moon" size={16} color="#9B59B6" />
              <Text style={styles.specialText}>Mistik</Text>
            </View>
          </View>
          
          <View style={styles.tarotContainer}>
            <LinearGradient
              colors={theme === 'dark' ? ['#2D1B69', '#11998e'] : ['#667eea', '#764ba2']}
              style={styles.tarotGradient}
              start={[0, 0]}
              end={[1, 1]}
            >
              <View style={styles.tarotHeader}>
                <Text style={styles.tarotTitle}>Kartınızı Seçin</Text>
                <Text style={styles.tarotSubtitle}>Günlük rehberlik için bir kart çekin</Text>
              </View>
              
              <View style={styles.tarotImageContainer}>
                <Image 
                  source={require('../assets/tarot/card.png')}
                  style={styles.tarotCardImage}
                  resizeMode="contain"
                />
              </View>
              
              <View style={styles.tarotFooter}>
                <TouchableOpacity style={styles.drawCardButton}
                  onPress={drawCard}
                >
                  <Text style={styles.drawCardButtonText}>Kart Çek</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
      
      {/* Tarot Kartı Modal */}
      <Modal
        visible={showCardModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeCardModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={closeCardModal}
          >
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  transform: [
                    {
                      scale: cardAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                  opacity: cardAnimation,
                },
              ]}
            >
              {drawnCards.length > 0 && (
                <View style={styles.cardModalContainer}>
                  <View style={styles.cardModalHeader}>
                    <Text style={styles.cardModalTitle}>Çekilen Kart ({currentCardIndex + 1}/3)</Text>
                    <TouchableOpacity onPress={closeCardModal} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.cardContainer}>
                    <TarotCardComponent
                      card={drawnCards[currentCardIndex]}
                      isFlipped={true}
                      showBack={false}
                      onPress={() => {}}
                      disabled={false}
                    />
                  </View>
                  
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{drawnCards[currentCardIndex].name}</Text>
                    <Text style={styles.cardNameEn}>{drawnCards[currentCardIndex].nameEn}</Text>
                    <Text style={styles.cardDescription}>{drawnCards[currentCardIndex].description}</Text>
                    
                    {currentCardIndex < drawnCards.length - 1 ? (
                      <TouchableOpacity 
                        style={styles.newCardButton}
                        onPress={showNextCard}
                      >
                        <Text style={styles.newCardButtonText}>Sıradaki Kartı Gör</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.newCardButton, styles.combinationButton]}
                        onPress={() => {
                          // Kombinasyon yorumu modalını aç
                          setShowCombinationModal(true);
                        }}
                      >
                        <Text style={styles.newCardButtonText}>🔮 Kombinasyon Yorumu</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Kombinasyon Yorumu Modal */}
      <Modal
        visible={showCombinationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCombinationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(75, 0, 130, 0.95)', 'rgba(139, 69, 19, 0.95)']}
            style={styles.modalBackground}
          >
            <View style={styles.combinationModalContent}>
              <View style={styles.combinationModalHeader}>
                <Text style={styles.combinationModalTitle}>✨ Üç Kart Yorumu ✨</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowCombinationModal(false)}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.combinationScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.combinationContent}>
                  <Text style={styles.combinationSectionTitle}>🃏 Seçilen Kartlarınız:</Text>
                  {drawnCards.map((card, index) => (
                    <Text key={index} style={styles.combinationCardText}>
                      {index + 1}. {card.name} - {card.nameEn}
                    </Text>
                  ))}
                  
                  <Text style={styles.combinationSectionTitle}>🔮 Ruhsal Analiz:</Text>
                  <Text style={styles.combinationAnalysisText}>
                    Bu üç kart, ruhunuzun derinliklerinden gelen güçlü bir mesaj taşıyor. Evrenin size sunduğu bu kombinasyon, yaşamınızda büyük bir dönüşümün habercisidir.
                  </Text>
                  
                  <Text style={styles.combinationSectionTitle}>⏳ Zaman Akışı:</Text>
                  <View style={styles.timelineContainer}>
                    <View style={styles.timelineItem}>
                      <Text style={styles.timelineEmoji}>🌅</Text>
                      <Text style={styles.timelineLabel}>Geçmiş:</Text>
                      <Text style={styles.timelineText}>{drawnCards[0]?.name} - {drawnCards[0]?.keywords[0]}</Text>
                    </View>
                    <View style={styles.timelineItem}>
                      <Text style={styles.timelineEmoji}>🌞</Text>
                      <Text style={styles.timelineLabel}>Şimdi:</Text>
                      <Text style={styles.timelineText}>{drawnCards[1]?.name} - {drawnCards[1]?.keywords[0]}</Text>
                    </View>
                    <View style={styles.timelineItem}>
                      <Text style={styles.timelineEmoji}>🌙</Text>
                      <Text style={styles.timelineLabel}>Gelecek:</Text>
                      <Text style={styles.timelineText}>{drawnCards[2]?.name} - {drawnCards[2]?.keywords[0]}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.combinationSectionTitle}>🌟 Mistik Mesaj:</Text>
                  <Text style={styles.combinationMysticText}>
                    Kartlarınız {drawnCards[0]?.keywords[0]}, {drawnCards[1]?.keywords[0]} ve {drawnCards[2]?.keywords[0]} enerjilerini birleştirerek size rehberlik ediyor. Bu güçlü kombinasyon, içsel bilgeliğinizi uyandırıyor.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </LinearGradient>
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
    marginBottom: 20,
    marginTop: 25,
    marginHorizontal: 20,
  },
  appHeaderContainer: {
    borderRadius: 24,
    padding: 24,
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
    fontSize: 16,
    fontWeight: '500',
    opacity: 1,
  },

  dailyQuoteSection: {
    marginVertical: 15,
    paddingHorizontal: 5,
  },
  dailyQuoteWrapper: {
    borderRadius: 20,
    padding: 20,
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  dailyQuoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 20,
  },
  themeIcon: {
    marginRight: 8,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dailyQuoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteLeftIcon: {
    marginRight: 12,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  quoteRightIcon: {
    marginLeft: 12,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  dailyQuoteText: {
    flex: 1,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  statsSection: {
    marginVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCardWrapper: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  statCardGradient: {
    borderWidth: 0,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statIconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 8,
    textAlign: 'center',
  },
  statProgress: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickAccessSection: {
    marginVertical: 20,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessCardWrapper: {
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  quickAccessCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  quickAccessIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quickAccessIconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  recentSection: {
    marginVertical: 20,
    marginBottom: 40,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  recentListContainer: {
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  recentCard: {
    width: 160,
    marginRight: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  recentCardGradient: {
    padding: 18,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'space-between',
  },
  recentImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  recentInfo: {
    alignItems: 'center',
    width: '100%',
  },
  recentName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  recentCategory: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  recentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  recentStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentStatText: {
    fontSize: 11,
    marginLeft: 3,
    fontWeight: '700',
  },
  stoneOfTheDaySection: {
    marginVertical: 20,
    marginHorizontal: 20,
  },
  specialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  stoneOfTheDayCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  stoneOfTheDayGradient: {
    padding: 20,
  },
  stoneOfTheDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stoneOfTheDayImageContainer: {
    marginRight: 16,
  },
  stoneImageGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stoneOfTheDayInfo: {
    flex: 1,
    marginRight: 12,
  },
  stoneOfTheDayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stoneOfTheDayCategory: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  stoneOfTheDayDescription: {
    fontSize: 18,
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
    letterSpacing: 0.2
  },
  stoneActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  stoneOfTheDayIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarotSection: {
    marginVertical: 20,
    marginBottom: 40,
    marginHorizontal: 20,
  },
  tarotContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  tarotGradient: {
    padding: 20,
    minHeight: 300,
  },
  tarotHeader: {
    alignItems: 'center',
    marginBottom: -10,
  },
  tarotTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 0,
  },
  tarotSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  tarotFooter: {
    alignItems: 'center',
    marginTop: -20,
  },
  tarotDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tarotImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 0,
    height: 450,
    width: '100%',
  },
  tarotCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  drawCardButton: {
    backgroundColor: 'rgba(147, 112, 219, 0.4)',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(186, 85, 211, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawCardButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E2E',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardModalContainer: {
    alignItems: 'center',
  },
  cardModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 30,
    width: '100%',
  },
  cardModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 5,
  },
  cardContainer: {
    padding: 35,
    alignItems: 'center',
  },
  cardInfo: {
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  cardName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: -20
  },
  cardNameEn: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  cardDescription: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  newCardButton: {
    backgroundColor: '#764ba2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    alignSelf: 'center',
    minWidth: 200,
  },
  newCardButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  combinationButton: {
    backgroundColor: '#9b59b6',
  },
  newDrawButton: {
    backgroundColor: '#764ba2',
  },
  // Kombinasyon Modal Stilleri
  combinationModalContent: {
    backgroundColor: 'rgba(30, 30, 46, 0.95)',
    borderRadius: 20,
    width: '95%',
    maxHeight: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  combinationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  combinationModalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    letterSpacing: 0.5,
    fontStyle: 'normal'
  },
  combinationScrollView: {
    maxHeight: 1000,
  },
  combinationContent: {
    padding: 10,
  },
  combinationSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  combinationCardText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    paddingLeft: 10,
    lineHeight: 22,
  },
  combinationAnalysisText: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  timelineContainer: {
    marginVertical: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  timelineEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  timelineLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 40,
    letterSpacing: 0.5,
  },
  timelineText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
    lineHeight: 20,
    marginLeft: 5
  },
  combinationMysticText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
});
