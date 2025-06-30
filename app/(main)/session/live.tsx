import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Pause, 
  Square, 
  Users, 
  Clock, 
  Brain,
  Heart,
  TrendingUp,
  MessageCircle
} from 'lucide-react-native';

import { ResponsiveLayout } from '../../../components/layout/ResponsiveLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { VoiceButton } from '../../../components/session/VoiceButton';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { Spacing } from '../../../constants/Spacing';

export default function LiveSessionScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [conflictLevel, setConflictLevel] = useState(3); // 1-5 scale
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [aiInsight, setAiInsight] = useState('');
  const [transcription, setTranscription] = useState('');

  // Mock session data
  const sessionData = {
    title: 'Family Discussion',
    participants: 2,
    type: 'Solo Practice',
  };

  // Mock emotions data
  const emotions = {
    calm: 0.7,
    frustrated: 0.3,
    understanding: 0.5,
    defensive: 0.2,
  };

  useEffect(() => {
    // Session timer
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoicePress = () => {
    if (isListening) {
      setIsListening(false);
      setIsProcessing(true);
      
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        setTranscription('I understand that this situation is challenging for everyone involved...');
        setAiInsight('Try acknowledging the other person\'s perspective before sharing your own.');
      }, 2000);
    } else {
      setIsListening(true);
    }
  };

  const handlePauseSession = () => {
    Alert.alert(
      'Pause Session',
      'Would you like to pause this session? You can resume it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pause', onPress: () => router.back() },
      ]
    );
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session? This will take you to the summary.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Session', onPress: () => router.push('/(main)/session/summary') },
      ]
    );
  };

  const getConflictLevelColor = (level: number) => {
    if (level <= 2) return Colors.conflict.low;
    if (level <= 3) return Colors.conflict.moderate;
    return Colors.conflict.high;
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'calm':
        return Colors.emotion.calm;
      case 'frustrated':
        return Colors.emotion.tension;
      case 'understanding':
        return Colors.emotion.positive;
      case 'defensive':
        return Colors.emotion.conflict;
      default:
        return Colors.emotion.neutral;
    }
  };

  return (
    <ResponsiveLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>{sessionData.title}</Text>
            <View style={styles.sessionMeta}>
              <View style={styles.metaItem}>
                <Clock size={16} color={Colors.text.tertiary} />
                <Text style={styles.metaText}>{formatTime(sessionTime)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Users size={16} color={Colors.text.tertiary} />
                <Text style={styles.metaText}>{sessionData.participants} participants</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handlePauseSession} style={styles.headerButton}>
              <Pause size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEndSession} style={styles.headerButton}>
              <Square size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Real-time Metrics */}
        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <TrendingUp size={20} color={getConflictLevelColor(conflictLevel)} />
              <Text style={styles.metricLabel}>Conflict Level</Text>
            </View>
            <View style={styles.conflictMeter}>
              <View style={styles.conflictMeterBackground}>
                <View 
                  style={[
                    styles.conflictMeterFill,
                    { 
                      width: `${(conflictLevel / 5) * 100}%`,
                      backgroundColor: getConflictLevelColor(conflictLevel)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.conflictLevelText}>{conflictLevel}/5</Text>
            </View>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Heart size={20} color={Colors.emotion.positive} />
              <Text style={styles.metricLabel}>Emotions</Text>
            </View>
            <View style={styles.emotionsContainer}>
              {Object.entries(emotions).map(([emotion, intensity]) => (
                <View key={emotion} style={styles.emotionBar}>
                  <Text style={styles.emotionLabel}>{emotion}</Text>
                  <View style={styles.emotionMeter}>
                    <View 
                      style={[
                        styles.emotionFill,
                        { 
                          width: `${intensity * 100}%`,
                          backgroundColor: getEmotionColor(emotion)
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Voice Interface */}
        <View style={styles.voiceSection}>
          <VoiceButton
            isListening={isListening}
            isProcessing={isProcessing}
            onPress={handleVoicePress}
          />
          
          <Text style={styles.voiceInstruction}>
            {isListening 
              ? 'Listening... Speak naturally about the situation'
              : isProcessing
              ? 'Processing your input...'
              : 'Tap to start speaking'
            }
          </Text>
        </View>

        {/* AI Insights */}
        {aiInsight && (
          <Card style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Brain size={20} color={Colors.primary[500]} />
              <Text style={styles.insightTitle}>AI Insight</Text>
            </View>
            <Text style={styles.insightText}>{aiInsight}</Text>
          </Card>
        )}

        {/* Transcription */}
        {transcription && (
          <Card style={styles.transcriptionCard}>
            <View style={styles.transcriptionHeader}>
              <MessageCircle size={20} color={Colors.text.secondary} />
              <Text style={styles.transcriptionTitle}>Recent Input</Text>
            </View>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </Card>
        )}

        {/* Session Controls */}
        <View style={styles.controls}>
          <Button
            title="Pause Session"
            onPress={handlePauseSession}
            variant="outline"
            style={styles.controlButton}
          />
          <Button
            title="End Session"
            onPress={handleEndSession}
            variant="danger"
            style={styles.controlButton}
          />
        </View>
      </View>
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  
  sessionInfo: {
    flex: 1,
  },
  
  sessionTitle: {
    ...Typography.styles.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  sessionMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  
  metaText: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
  },
  
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  
  headerButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.background.tertiary,
  },
  
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  
  metricCard: {
    flex: 1,
    padding: Spacing.md,
  },
  
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  
  metricLabel: {
    ...Typography.styles.label,
    color: Colors.text.secondary,
  },
  
  conflictMeter: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  conflictMeterBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  conflictMeterFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  conflictLevelText: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  
  emotionsContainer: {
    gap: Spacing.sm,
  },
  
  emotionBar: {
    gap: Spacing.xs,
  },
  
  emotionLabel: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  
  emotionMeter: {
    height: 4,
    backgroundColor: Colors.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  emotionFill: {
    height: '100%',
    borderRadius: 2,
  },
  
  voiceSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  
  voiceInstruction: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    maxWidth: 250,
  },
  
  insightCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  
  insightTitle: {
    ...Typography.styles.label,
    color: Colors.primary[700],
    fontWeight: '600',
  },
  
  insightText: {
    ...Typography.styles.body,
    color: Colors.primary[800],
    lineHeight: 22,
  },
  
  transcriptionCard: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.background.tertiary,
  },
  
  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  
  transcriptionTitle: {
    ...Typography.styles.label,
    color: Colors.text.secondary,
  },
  
  transcriptionText: {
    ...Typography.styles.transcription,
    color: Colors.text.primary,
  },
  
  controls: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
  },
  
  controlButton: {
    flex: 1,
  },
});
