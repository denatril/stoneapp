import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TarotCard from './TarotCard';
import { getRandomCards, TarotCard as TarotCardType, threeCardPositions } from '../data/tarotCards';
import { UI_CONSTANTS } from '../constants';

const { width } = Dimensions.get('window');

interface TarotDeckProps {
  onReadingComplete?: (selectedCards: TarotCardType[], positions: string[]) => void;
}

const TarotDeck: React.FC<TarotDeckProps> = ({ onReadingComplete }) => {
  const [shuffledCards, setShuffledCards] = useState<TarotCardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarotCardType[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [gamePhase, setGamePhase] = useState<'deck' | 'reveal'>('deck');
  const [fadeAnim] = useState(new Animated.Value(1));

  // Deste tıklaması - 3 rastgele kart seç
  const handleDeckClick = useCallback(() => {
    setIsShuffling(true);
    
    // Animasyon ile kartları karıştır
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      const randomCards = getRandomCards(3);
      setSelectedCards(randomCards);
      setIsShuffling(false);
      setGamePhase('reveal');
      
      const positions = Object.values(threeCardPositions);
      onReadingComplete?.(randomCards, positions);
    }, 600);
  }, [fadeAnim, onReadingComplete]);

  // İlk yüklemede deste durumunda başla
  useEffect(() => {
    setGamePhase('deck');
  }, []);



  // Yeniden başlat
  const handleRestart = useCallback(() => {
    setSelectedCards([]);
    setGamePhase('deck');
  }, []);

  // Okuma sonuçlarını göster
  const showReadingResults = useCallback(() => {
    if (selectedCards.length !== 3) return;

    const positions = Object.values(threeCardPositions);
    const readingText = selectedCards
      .map((card, index) => `${positions[index]}: ${card.name} - ${card.keywords.join(', ')}`)
      .join('\n\n');

    Alert.alert(
      'Tarot Okuma Sonucu',
      readingText,
      [
        { text: 'Yeni Okuma', onPress: handleRestart },
        { text: 'Tamam', style: 'default' },
      ]
    );
  }, [selectedCards, handleRestart]);

  // Seçilen kartların pozisyonları
  const selectedCardsWithPositions = useMemo(() => {
    const positions = Object.values(threeCardPositions);
    return selectedCards.map((card, index) => ({
      card,
      position: positions[index] || 'Bilinmeyen',
    }));
  }, [selectedCards]);

  // Deste fazı
  if (gamePhase === 'deck') {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.fullContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.deckContainer}>
        <TouchableOpacity 
          style={styles.deckButton}
          onPress={handleDeckClick}
          disabled={isShuffling}
        >
          <Animated.View style={[styles.deckCards, { opacity: fadeAnim }]}>
            <View style={styles.cardStack}>
              <View style={[styles.stackCard, styles.stackCard1]} />
              <View style={[styles.stackCard, styles.stackCard2]} />
              <View style={[styles.stackCard, styles.stackCard3]} />
            </View>
          </Animated.View>
          
          <Text style={styles.deckText}>
            {isShuffling ? 'Kartlar seçiliyor...' : 'Kartları Çek'}
          </Text>
        </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Sonuç fazı
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Seçilen Kartlar</Text>
        <Text style={styles.subtitle}>3 kartlık okuma tamamlandı</Text>
      </View>

      <ScrollView 
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.selectedCardsContainer}>
          {selectedCardsWithPositions.map((item, index) => (
            <View key={item.card.id} style={styles.selectedCardItem}>
              <Text style={styles.positionTitle}>{item.position}</Text>
              <TarotCard
                card={item.card}
                isFlipped={true}
                showBack={false}
                disabled={true}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.card.name}</Text>
                <Text style={styles.cardKeywords}>
                  {item.card.keywords.slice(0, 2).join(' • ')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.resultButton}
          onPress={showReadingResults}
        >
          <Text style={styles.resultButtonText}>Detaylı Yorum</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.restartButton}
          onPress={handleRestart}
        >
          <Text style={styles.restartButtonText}>Yeni Okuma</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deckContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  deckButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  deckCards: {
    alignItems: 'center',
    marginBottom: 24,
  },
  deckText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,215,0,0.3)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ffd700',
    overflow: 'hidden',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  header: {
    padding: UI_CONSTANTS.SPACING.MD,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderBottomWidth: 2,
    borderBottomColor: '#ffd700',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  instruction: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },

  cardStack: {
    position: 'relative',
    width: 140,
    height: 200,
  },
  stackCard: {
    position: 'absolute',
    width: 140,
    height: 200,
    backgroundColor: '#0f0f23',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#ffd700',
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  stackCard1: {
    transform: [{ rotate: '-8deg' }, { translateY: 4 }],
    zIndex: 1,
    opacity: 0.8,
  },
  stackCard2: {
    transform: [{ rotate: '0deg' }],
    zIndex: 2,
    opacity: 0.9,
  },
  stackCard3: {
    transform: [{ rotate: '8deg' }, { translateY: -4 }],
    zIndex: 3,
    opacity: 1,
  },
  shufflingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  cardsContainer: {
    flex: 1,
    padding: UI_CONSTANTS.SPACING.SM,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  actions: {
    padding: UI_CONSTANTS.SPACING.MD,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderTopWidth: 2,
    borderTopColor: '#ffd700',
  },
  shuffleButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  shuffleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: UI_CONSTANTS.SPACING.SM,
  },
  selectedCardsContainer: {
    paddingBottom: 20,
  },
  selectedCardItem: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
    elevation: 8,
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  positionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a148c',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardKeywords: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resultButton: {
    backgroundColor: 'rgba(255,215,0,0.9)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffd700',
    elevation: 5,
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  resultButtonText: {
    color: '#4a148c',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  restartButton: {
    backgroundColor: 'rgba(74,20,140,0.9)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9c27b0',
    elevation: 5,
    shadowColor: '#9c27b0',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default TarotDeck;