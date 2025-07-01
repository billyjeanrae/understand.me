/**
 * Chat Screen
 * One-on-one conflict resolution sessions with AI mediator Udine
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MessageCircle,
  Mic,
  MicOff,
  Send,
  ArrowLeft,
  Heart,
  Brain,
  Target,
  Clock,
  FileText,
  CheckCircle
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../navigation/types';
import { chatWithUdine } from '../services/ai/chat';
import { analyzeEmotion } from '../services/ai/emotion';
import VoiceMessageRecorder from '../components/VoiceMessageRecorder';
import EmotionInsights from '../components/EmotionInsights';

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotions?: any;
  phase?: ConflictPhase;
}

type ConflictPhase = 'introduction' | 'exploration' | 'understanding' | 'resolution' | 'agreement';

const PHASE_INFO = {
  introduction: {
    title: 'Introduction',
    description: 'Getting to know the situation',
    icon: MessageCircle,
    color: '#3B82F6'
  },
  exploration: {
    title: 'Exploration',
    description: 'Understanding different perspectives',
    icon: Brain,
    color: '#8B5CF6'
  },
  understanding: {
    title: 'Understanding',
    description: 'Finding common ground',
    icon: Heart,
    color: '#EC4899'
  },
  resolution: {
    title: 'Resolution',
    description: 'Working toward solutions',
    icon: Target,
    color: '#10B981'
  },
  agreement: {
    title: 'Agreement',
    description: 'Finalizing the resolution',
    icon: CheckCircle,
    color: '#F59E0B'
  }
};

export default function ChatScreen() {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<ConflictPhase>('introduction');
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [sessionStartTime] = useState(new Date());
  const [emotionInsights, setEmotionInsights] = useState<any>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const sessionId = route.params?.sessionId || `session_${Date.now()}`;

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const initializeSession = async () => {
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: "Hello, I'm Udine, your AI mediator. I'm here to help you work through this conflict with understanding and compassion. Let's start by having you share what's on your mind. What situation would you like to discuss today?",
      timestamp: new Date(),
      phase: 'introduction'
    };
    
    setMessages([welcomeMessage]);
  };

  const sendMessage = async (content: string, emotions?: any) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      emotions,
      phase: currentPhase
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Analyze emotions if not provided
      let messageEmotions = emotions;
      if (!messageEmotions) {
        try {
          messageEmotions = await analyzeEmotion(content, 'text', {
            includeRecommendations: true,
            conflictContext: true
          });
          setEmotionInsights(messageEmotions);
        } catch (error) {
          console.warn('Emotion analysis failed:', error);
        }
      }

      // Prepare context for AI
      const history = messages.map(m => ({ 
        role: m.role, 
        content: m.content,
        phase: m.phase 
      }));
      
      const contextualPrompt = `
        Current conflict resolution phase: ${currentPhase}
        Session duration: ${Math.round((Date.now() - sessionStartTime.getTime()) / 60000)} minutes
        ${messageEmotions ? `User emotions detected: ${JSON.stringify(messageEmotions.topEmotions || [])}` : ''}
        
        As Udine, an empathetic AI mediator, respond appropriately for the ${currentPhase} phase of conflict resolution.
      `;

      const response = await chatWithUdine(history, content, {
        conflictType: 'interpersonal',
        usePersonalization: true,
        emotionContext: messageEmotions,
        additionalContext: contextualPrompt
      });
      
      // Determine if we should advance to next phase
      const nextPhase = determineNextPhase(response, messages.length);
      if (nextPhase !== currentPhase) {
        setCurrentPhase(nextPhase);
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        phase: nextPhase
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      Alert.alert('Error', 'Failed to get response from Udine. Please try again.');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const determineNextPhase = (response: string, messageCount: number): ConflictPhase => {
    // Simple phase progression logic - can be enhanced with AI analysis
    if (messageCount < 4) return 'introduction';
    if (messageCount < 8) return 'exploration';
    if (messageCount < 12) return 'understanding';
    if (messageCount < 16) return 'resolution';
    return 'agreement';
  };

  const handleVoiceMessage = async (voiceData: any) => {
    // For now, we'll use a placeholder transcript
    // In a real implementation, you'd transcribe the audio
    const transcript = "Voice message received";
    await sendMessage(transcript);
  };

  const handleVoiceCancel = () => {
    // Handle voice recording cancellation
    console.log('Voice recording cancelled');
  };

  const handleTextSubmit = async () => {
    await sendMessage(input);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSessionDuration = () => {
    const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 60000);
    return `${duration} min`;
  };

  const PhaseIcon = PHASE_INFO[currentPhase].icon;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#E2E8F0" />
          </Pressable>
          
          <View style={styles.headerInfo}>
            <View style={styles.phaseIndicator}>
              <PhaseIcon size={16} color={PHASE_INFO[currentPhase].color} />
              <Text style={[styles.phaseText, { color: PHASE_INFO[currentPhase].color }]}>
                {PHASE_INFO[currentPhase].title}
              </Text>
            </View>
            <Text style={styles.headerTitle}>Conflict Resolution Session</Text>
            <View style={styles.sessionMeta}>
              <Clock size={12} color="#64748B" />
              <Text style={styles.sessionTime}>{getSessionDuration()}</Text>
            </View>
          </View>

          <Pressable 
            style={styles.modeToggle}
            onPress={() => setIsVoiceMode(!isVoiceMode)}
          >
            {isVoiceMode ? (
              <Mic size={20} color="#10B981" />
            ) : (
              <MessageCircle size={20} color="#3B82F6" />
            )}
          </Pressable>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
              ]}>
                {message.content}
              </Text>
              <Text style={styles.messageTime}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <Text style={[styles.messageText, styles.assistantMessageText, styles.loadingText]}>
                Udine is thinking...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Emotion Insights */}
        {emotionInsights && (
          <View style={styles.emotionInsightsContainer}>
            <EmotionInsights emotionAnalysis={emotionInsights} compact />
          </View>
        )}

        {/* Input Area */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          {isVoiceMode ? (
            <VoiceMessageRecorder
              onSend={handleVoiceMessage}
              onCancel={handleVoiceCancel}
            />
          ) : (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
                placeholderTextColor="#64748B"
                multiline
                maxLength={500}
              />
              <Pressable
                style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                onPress={handleTextSubmit}
                disabled={!input.trim() || isLoading}
              >
                <Send size={20} color={input.trim() ? "#FFFFFF" : "#64748B"} />
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  phaseText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTime: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  modeToggle: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#E2E8F0',
  },
  messageTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'right',
  },
  loadingText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  emotionInsightsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  voiceRecorder: {
    alignSelf: 'center',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 10,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
});
