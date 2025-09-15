import React, { memo, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { TarotCard as TarotCardType } from '../data/tarotCards';
import { UI_CONSTANTS } from '../constants';
import SafeImage from './SafeImage';

// Tarot kart arkası için statik görsel haritası
const tarotImageMap: { [key: string]: any } = {
  'card-back.svg': require('../assets/tarot/card-back.svg'),
  'card.png': require('../assets/tarot/card.png'),
};

// Kart görüntüleri için URL oluşturma
const TAROT_BASE_URL = 'https://raw.githubusercontent.com/rws-tarot/rws-tarot-card-images/master/cards-jpg/';

// Major Arcana kart görüntüleri için dosya adları
const majorArcanaFileNames: { [key: string]: string } = {
  '0': 'fool',
  '1': 'magician',
  '2': 'high-priestess',
  '3': 'empress',
  '4': 'emperor',
  '5': 'hierophant',
  '6': 'lovers',
  '7': 'chariot',
  '8': 'strength',
  '9': 'hermit',
  '10': 'wheel-of-fortune',
  '11': 'justice',
  '12': 'hanged-man',
  '13': 'death',
  '14': 'temperance',
  '15': 'devil',
  '16': 'tower',
  '17': 'star',
  '18': 'moon',
  '19': 'sun',
  '20': 'judgement',
  '21': 'world',
};



// Performans için statik görsel haritası - bir kez yüklenir
const cardImages: { [key: string]: any } = {
  '0': require('../assets/major-arcana/00-fool.png'),
  '1': require('../assets/major-arcana/01-magician.png'),
  '2': require('../assets/major-arcana/02-high-priestess.png'),
  '3': require('../assets/major-arcana/03-empress.png'),
  '4': require('../assets/major-arcana/04-emperor.png'),
  '5': require('../assets/major-arcana/05-hierophant.png'),
  '6': require('../assets/major-arcana/06-lovers.png'),
  '7': require('../assets/major-arcana/07-chariot.png'),
  '8': require('../assets/major-arcana/08-strength.png'),
  '9': require('../assets/major-arcana/09-hermit.png'),
  '10': require('../assets/major-arcana/10-wheel-of-fortune.png'),
  '11': require('../assets/major-arcana/11-justice.png'),
  '12': require('../assets/major-arcana/12-hanged-man.png'),
  '13': require('../assets/major-arcana/13-death.png'),
  '14': require('../assets/major-arcana/14-temperance.png'),
  '15': require('../assets/major-arcana/15-devil.png'),
  '16': require('../assets/major-arcana/16-tower.png'),
  '17': require('../assets/major-arcana/17-star.png'),
  '18': require('../assets/major-arcana/18-moon.png'),
  '19': require('../assets/major-arcana/19-sun.png'),
  '20': require('../assets/major-arcana/20-judgement.png'),
  '21': require('../assets/major-arcana/21-world.png'),
};

// Fallback görsel
const fallbackImage = require('../assets/icon.png');

// Optimize edilmiş görsel yükleme fonksiyonu
const getCardImage = (cardNumber: string): any => {
  try {
    return cardImages[cardNumber] || fallbackImage;
  } catch (error) {
     console.error('Görüntü yükleme hatası:', error);
     return fallbackImage;
   }
 };

// Kart ismini büyük yazı ile göstermek için yardımcı bileşen
const CardNameOverlay = ({ cardName }: { cardName: string }) => (
  <View style={styles.cardNumberOverlay}>
    <Text style={styles.cardNumberText}>{cardName}</Text>
  </View>
);

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - UI_CONSTANTS.SPACING.MD * 4) / 2.5; // Kartları büyütmek için 3'ten 2.5'e değiştirildi
const CARD_HEIGHT = CARD_WIDTH * 1.6; // Tarot kartı oranı

interface TarotCardProps {
  card?: TarotCardType;
  isFlipped?: boolean;
  isSelected?: boolean;
  onPress?: (card: TarotCardType) => void;
  showBack?: boolean;
  disabled?: boolean;
}

const TarotCard = memo<TarotCardProps>((
  {
    card,
    isFlipped = false,
    isSelected = false,
    onPress,
    showBack = false, // Varsayılan olarak ön yüzü göster
    disabled = false,
  }
) => {
  // Görsel önbelleğe alma
  useEffect(() => {
    // React Native'de require() ile yüklenen görseller zaten cache'leniyor
    // Manuel preload gerekmiyor
  }, [card]);

  // Animasyon olmadan direkt kart gösterme
  const handlePress = useCallback(() => {
    if (disabled || !card) return;
    onPress?.(card);
  }, [disabled, card, onPress]);



  // Kart ön yüzü (açık kart) - PNG gösterim alanı
  const renderCardFront = () => {
    if (!card) return null;

    return (
      <View style={[styles.cardFace, styles.cardFront]}>
        {/* PNG görüntü alanı - Header kaldırıldı */}
        <View style={styles.pngContainer}>
          <SafeImage 
            source={getCardImage(card.number.toString())}
            style={styles.pngImage}
            resizeMode="contain"
            showLoader={true}
            onError={(error) => {
              console.log('Android görüntü yükleme hatası:', error.nativeEvent.error);
            }}
          />
        </View>
      </View>
    );
  };



  // Sembol ikonları
  const getSymbolIcon = (symbol: string): string => {
    const symbolMap: { [key: string]: string } = {
      'Uçurum': '🏔️',
      'Beyaz gül': '🌹',
      'Köpek': '🐕',
      'Dağlar': '⛰️',
      'Güneş': '☀️',
      'Sonsuzluk işareti': '∞',
      'Değnek': '🪄',
      'Kupa': '🏆',
      'Kılıç': '⚔️',
      'Pentagram': '⭐',
      'Ay': '🌙',
      'Pomegranate': '🍎',
      'Haç': '✝️',
      'Tora': '📜',
      'Su': '💧',
      'Buğday': '🌾',
      'Venüs işareti': '♀',
      'Taç': '👑',
      'Nehir': '🌊',
      'Yastık': '🛏️',
      'Taht': '🪑',
      'Koç kafası': '🐏',
      'Orb': '🔮',
      'Zırh': '🛡️',
      'Anahtar': '🗝️',
      'Sütunlar': '🏛️',
      'Çiçekler': '🌸',
      'Melek': '👼',
      'Adem ve Havva': '👫',
      'Ağaç': '🌳',
      'Dağ': '🏔️',
      'Savaş arabası': '🏺',
      'Sfenks': '🦁',
      'Yıldızlar': '⭐',
      'Şehir': '🏙️',
      'Kadın': '👩',
      'Aslan': '🦁',
      'Fener': '🏮',
      'Yıldız': '⭐',
      'Gri sakal': '🧙',
      'Çark': '☸️',
      'Yılan': '🐍',
      'Anubis': '🐺',
      'Bulutlar': '☁️',
      'Terazi': '⚖️',
      'Perde': '🎭',
      'Asılı figür': '🤸',
      'Hale': '😇',
      'Kırmızı pantolon': '👖',
      'İskelet': '💀',
      'Bayrak': '🏳️',
      'Kupalar': '🏆',
      'Yol': '🛤️',
      'Şeytan figürü': '😈',
      'Zincirler': '⛓️',
      'Boynuzlar': '👹',
      'Ters pentagram': '🔯',
      'Alev': '🔥',
      'Kule': '🗼',
      'Şimşek': '⚡',
      'İnsanlar': '👥',
      'Köpekler': '🐕',
      'Kerevit': '🦀',
      'Kuleler': '🏰',
      'Çocuk': '👶',
      'At': '🐎',
      'Ayçiçekleri': '🌻',
      'Trompet': '🎺',
      'Mezarlar': '⚰️',
      'Çelenk': '🌿',
      'Kadın figürü': '👩',
      'Dört element': '🌍',
      'Sonsuzluk': '∞',
      'Dünya': '🌍'
    };
    return symbolMap[symbol] || '✦';
  };

  const cardContainerStyle = useMemo(() => [
    styles.cardContainer,
    isSelected && styles.selectedCard,
    disabled && styles.disabledCard,
  ], [isSelected, disabled]);

  return (
    <TouchableOpacity
      style={cardContainerStyle}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.card}>
        {renderCardFront()}
      </View>
      
      {isSelected && (
        <View style={styles.selectionIndicator}>
          <Text style={styles.selectionText}>Seçildi</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    margin: UI_CONSTANTS.SPACING.XS,
    alignItems: 'center',
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
  },
  disabledCard: {
    opacity: 0.6,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },

  cardFront: {
  },

  pngContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: -10,
    marginBottom: 5,
  },
  pngImage: {
    width: '100%',
    height: '100%',
    // Görsel optimizasyonu için
    resizeMode: 'contain',
    backgroundColor: 'transparent',
    alignSelf: 'center',
    transform: [{ scale: 1.2 }],
  },

  selectionIndicator: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  selectionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  cardNumberOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  cardNumberText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default TarotCard;