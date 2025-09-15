import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface DailyQuoteSectionProps {
  dailyQuote: string;
  onGetNewQuote: () => void;
}

export default function DailyQuoteSection({ dailyQuote, onGetNewQuote }: DailyQuoteSectionProps) {
  const { theme, colors: themeColors } = useTheme();

  return (
    <View style={styles.stoneOfTheDaySection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Günün İlhamı</Text>
        <View style={styles.specialBadge}>
          <Ionicons name="sparkles" size={16} color="#FFD700" />
          <Text style={styles.specialText}>İlham</Text>
        </View>
      </View>
      
      <View style={[styles.stoneOfTheDayCard, { backgroundColor: themeColors.card }]}>
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
                <Ionicons name="chatbubble-ellipses" size={56} color="#fff" />
              </LinearGradient>
            </View>
            
            <View style={styles.stoneOfTheDayInfo}>
              <Text style={[styles.stoneOfTheDayName, { color: '#fff' }]}>Günlük İlham</Text>
              <Text style={[styles.stoneOfTheDayCategory, { color: 'rgba(255,255,255,0.8)' }]}>Motivasyon</Text>
              <Text style={[styles.stoneOfTheDayDescription, { color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }]} numberOfLines={3}>
                {dailyQuote}
              </Text>
              
              <View style={styles.stoneActions}>
                <TouchableOpacity style={styles.actionButton} onPress={onGetNewQuote}>
                  <Ionicons name="heart" size={16} color="#fff" />
                  <Text style={styles.actionText}>İlham Al</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stoneOfTheDaySection: {
    marginVertical: 20,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
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
});