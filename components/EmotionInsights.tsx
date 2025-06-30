import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Heart, Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { EmotionAnalysis } from '../services/ai/emotion';

interface EmotionInsightsProps {
  emotionAnalysis: EmotionAnalysis;
  showRecommendations?: boolean;
  compact?: boolean;
}

/**
 * Component to display emotion analysis insights for conflict resolution
 */
export default function EmotionInsights({ 
  emotionAnalysis, 
  showRecommendations = true,
  compact = false 
}: EmotionInsightsProps) {
  const { 
    primaryEmotion, 
    secondaryEmotions, 
    overallSentiment, 
    emotionalIntensity,
    conflictIndicators,
    recommendations 
  } = emotionAnalysis;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity > 0.7) return '#EF4444';
    if (intensity > 0.4) return '#F59E0B';
    return '#10B981';
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'anger':
      case 'frustration':
        return <AlertTriangle size={16} color="#EF4444" strokeWidth={2} />;
      case 'sadness':
      case 'hurt':
        return <Heart size={16} color="#6366F1" strokeWidth={2} />;
      case 'joy':
      case 'hope':
        return <CheckCircle size={16} color="#10B981" strokeWidth={2} />;
      default:
        return <Brain size={16} color="#6B7280" strokeWidth={2} />;
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          {getEmotionIcon(primaryEmotion.emotion)}
          <Text style={styles.compactText}>
            {primaryEmotion.emotion} ({Math.round(primaryEmotion.intensity * 100)}%)
          </Text>
          <View style={[styles.sentimentDot, { backgroundColor: getSentimentColor(overallSentiment) }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Brain size={20} color="#3B82F6" strokeWidth={2} />
        <Text style={styles.title}>Emotional Insights</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Primary Emotion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Emotion</Text>
          <View style={styles.emotionCard}>
            <View style={styles.emotionHeader}>
              {getEmotionIcon(primaryEmotion.emotion)}
              <Text style={styles.emotionName}>
                {primaryEmotion.emotion.charAt(0).toUpperCase() + primaryEmotion.emotion.slice(1)}
              </Text>
              <View style={styles.intensityBadge}>
                <Text style={[styles.intensityText, { color: getIntensityColor(primaryEmotion.intensity) }]}>
                  {Math.round(primaryEmotion.intensity * 100)}%
                </Text>
              </View>
            </View>
            <View style={styles.intensityBar}>
              <View 
                style={[
                  styles.intensityFill, 
                  { 
                    width: `${primaryEmotion.intensity * 100}%`,
                    backgroundColor: getIntensityColor(primaryEmotion.intensity)
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Secondary Emotions */}
        {secondaryEmotions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Secondary Emotions</Text>
            {secondaryEmotions.slice(0, 3).map((emotion, index) => (
              <View key={index} style={styles.secondaryEmotion}>
                <View style={styles.secondaryEmotionInfo}>
                  {getEmotionIcon(emotion.emotion)}
                  <Text style={styles.secondaryEmotionName}>
                    {emotion.emotion.charAt(0).toUpperCase() + emotion.emotion.slice(1)}
                  </Text>
                </View>
                <Text style={styles.secondaryEmotionValue}>
                  {Math.round(emotion.intensity * 100)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Overall Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Assessment</Text>
          <View style={styles.assessmentGrid}>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentLabel}>Sentiment</Text>
              <View style={styles.sentimentContainer}>
                <View style={[styles.sentimentDot, { backgroundColor: getSentimentColor(overallSentiment) }]} />
                <Text style={[styles.assessmentValue, { color: getSentimentColor(overallSentiment) }]}>
                  {overallSentiment.charAt(0).toUpperCase() + overallSentiment.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentLabel}>Intensity</Text>
              <Text style={[styles.assessmentValue, { color: getIntensityColor(emotionalIntensity) }]}>
                {emotionalIntensity > 0.7 ? 'High' : emotionalIntensity > 0.4 ? 'Medium' : 'Low'}
              </Text>
            </View>
          </View>
        </View>

        {/* Conflict Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conflict Indicators</Text>
          <View style={styles.indicatorsGrid}>
            {Object.entries(conflictIndicators).map(([indicator, value]) => (
              <View key={indicator} style={styles.indicator}>
                <Text style={styles.indicatorLabel}>
                  {indicator.charAt(0).toUpperCase() + indicator.slice(1)}
                </Text>
                <View style={styles.indicatorBar}>
                  <View 
                    style={[
                      styles.indicatorFill, 
                      { 
                        width: `${value * 100}%`,
                        backgroundColor: value > 0.6 ? '#EF4444' : value > 0.3 ? '#F59E0B' : '#10B981'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.indicatorValue}>{Math.round(value * 100)}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendation}>
                <CheckCircle size={14} color="#10B981" strokeWidth={2} />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactText: {
    color: '#F1F5F9',
    fontSize: 12,
    flex: 1,
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    maxHeight: 400,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  emotionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  emotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  emotionName: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  intensityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  intensityBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 2,
  },
  secondaryEmotion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryEmotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryEmotionName: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  secondaryEmotionValue: {
    color: '#94A3B8',
    fontSize: 12,
  },
  assessmentGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  assessmentItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  assessmentLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  assessmentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicatorsGrid: {
    gap: 8,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    width: 80,
  },
  indicatorBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicatorFill: {
    height: '100%',
    borderRadius: 2,
  },
  indicatorValue: {
    color: '#94A3B8',
    fontSize: 10,
    width: 30,
    textAlign: 'right',
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  recommendationText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

