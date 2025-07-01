import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Platform, Alert, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Settings, Target, User, MessageCircle, BookOpen } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

import { VoiceInteractionCore } from '../components/VoiceInteractionCore';
import ChatUI from '../components/ChatUI';
import EmotionInsights from '../components/EmotionInsights';
import { EmotionAnalysis, analyzeEmotion } from '../services/ai/emotion';
import tools from '../utils/tools';

/**
 * Main home screen that combines voice interaction and chat interface
 * This is where users interact with Udine for conflict resolution
 */
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [lastVoiceInput, setLastVoiceInput] = useState<string>('');
  const [lastAIResponse, setLastAIResponse] = useState<string>('');
  const [currentEmotionAnalysis, setCurrentEmotionAnalysis] = useState<EmotionAnalysis | null>(null);
  const [showEmotionInsights, setShowEmotionInsights] = useState(false);

  const handleVoiceInput = async (text: string) => {
    setLastVoiceInput(text);
    console.log('Voice input received:', text);
    
    // Analyze emotions in the voice input
    try {
      const emotionAnalysis = await analyzeEmotion(text, 'text', {
        includeRecommendations: true,
        conflictContext: true,
      });
      setCurrentEmotionAnalysis(emotionAnalysis);
      setShowEmotionInsights(true);
    } catch (error) {
      console.error('Emotion analysis failed:', error);
    }
  };

  const handleAIResponse = (response: string) => {
    setLastAIResponse(response);
    console.log('AI response received:', response);
    
    // Show a brief notification of the AI response
    Alert.alert('Udine says:', response.length > 100 ? response.substring(0, 100) + '...' : response);
  };

  const toggleEmotionInsights = () => {
    setShowEmotionInsights(!showEmotionInsights);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Understand.me</Text>
        <View style={styles.headerButtons}>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('Chat', {})}
          >
            <MessageCircle size={20} color="#10B981" strokeWidth={2} />
          </Pressable>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('ResourceLibrary')}
          >
            <BookOpen size={20} color="#8B5CF6" strokeWidth={2} />
          </Pressable>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('ConflictDashboard')}
          >
            <Target size={20} color="#94A3B8" strokeWidth={2} />
          </Pressable>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('Profile')}
          >
            <User size={20} color="#94A3B8" strokeWidth={2} />
          </Pressable>
          <Pressable style={styles.headerButton} onPress={toggleEmotionInsights}>
            <Brain size={20} color={showEmotionInsights ? "#3B82F6" : "#94A3B8"} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <View style={styles.topContent}>
        <Text style={styles.description}>
          Talk with Udine, your AI conflict resolution specialist, or use the chat below for text-based interaction.
        </Text>

        {/* Emotion Insights Panel */}
        {showEmotionInsights && currentEmotionAnalysis && (
          <View style={styles.emotionSection}>
            <EmotionInsights 
              emotionAnalysis={currentEmotionAnalysis}
              showRecommendations={true}
            />
          </View>
        )}

        <View style={styles.voiceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Voice Interaction</Text>
            {currentEmotionAnalysis && (
              <EmotionInsights 
                emotionAnalysis={currentEmotionAnalysis}
                compact={true}
              />
            )}
          </View>
          <Text style={styles.sectionSubtitle}>
            Tap the microphone to start speaking with Udine
          </Text>
          
          <View style={styles.voiceContainer}>
            <VoiceInteractionCore
              onVoiceInput={handleVoiceInput}
              onAIResponse={handleAIResponse}
            />
          </View>

          {lastVoiceInput && (
            <View style={styles.lastInteraction}>
              <Text style={styles.lastInputLabel}>Last voice input:</Text>
              <Text style={styles.lastInputText}>{lastVoiceInput}</Text>
            </View>
          )}
        </View>

        <View style={styles.chatContainer}>
          <ChatUI />
        </View>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  topContent: { flex: 1, padding: 16 },
  description: { 
    color: '#E2E8F0', 
    fontSize: 16, 
    marginBottom: 24, 
    textAlign: 'center',
    lineHeight: 24,
  },
  emotionSection: {
    marginBottom: 24,
  },
  voiceSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  voiceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  lastInteraction: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    maxWidth: '90%',
  },
  lastInputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  lastInputText: {
    color: '#F1F5F9',
    fontSize: 14,
    lineHeight: 20,
  },
  chatContainer: { flex: 1 },
});
