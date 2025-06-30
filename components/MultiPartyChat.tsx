/**
 * Multi-Party Chat Component
 * Real-time chat interface for group conflict resolution sessions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import VoiceMessageRecorder from './VoiceMessageRecorder';
import { CrossPlatformBottomSheet } from './common/CrossPlatformModal';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Send,
  Mic,
  MicOff,
  Users,
  Clock,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Heart
} from 'lucide-react-native';

import {
  MultiPartyConflict,
  GroupSession,
  ConflictParticipant,
  MultiPartyMessage,
  MessageReaction
} from '../types/multiparty';
import { EmotionAnalysis } from '../services/ai/emotion';
import { multiPartyConflictService } from '../services/conflict/multiparty';

interface MultiPartyChatProps {
  conflict: MultiPartyConflict;
  session: GroupSession;
  currentUserId: string;
  onMessageSent?: (message: MultiPartyMessage) => void;
  onEmotionDetected?: (emotion: EmotionAnalysis) => void;
}

export default function MultiPartyChat({
  conflict,
  session,
  currentUserId,
  onMessageSent,
  onEmotionDetected
}: MultiPartyChatProps) {
  const [messages, setMessages] = useState<MultiPartyMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentParticipant = conflict.participants.find(p => p.id === currentUserId);
  const isSessionActive = session.endTime === undefined;

  useEffect(() => {
    loadMessages();
  }, [session.id]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const sessionMessages = multiPartyConflictService.getSessionMessages(session.id);
      setMessages(sessionMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !isSessionActive) return;

    setIsLoading(true);
    try {
      const message = await multiPartyConflictService.addMessage(
        conflict.id,
        session.id,
        currentUserId,
        inputText.trim(),
        'text'
      );

      setMessages(prev => [...prev, message]);
      setInputText('');
      onMessageSent?.(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!isSessionActive) return;
    setShowVoiceRecorder(true);
  };

  const handleVoiceSend = (voiceData: any) => {
    const voiceMessage: MultiPartyMessage = {
      id: voiceData.id,
      senderId: currentUserId,
      senderName: currentParticipant?.name || 'Unknown',
      content: `Voice message (${Math.floor(voiceData.duration)}s)`,
      type: 'voice',
      timestamp: voiceData.timestamp,
      isRead: false,
      voiceData: voiceData
    };

    setMessages(prev => [...prev, voiceMessage]);
    setShowVoiceRecorder(false);
    onMessageSent?.(voiceMessage);
  };

  const addReaction = async (messageId: string, reactionType: MessageReaction['type']) => {
    try {
      // Find the message and add/update reaction
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;

      const message = messages[messageIndex];
      const existingReactionIndex = message.reactions.findIndex(
        r => r.participantId === currentUserId
      );

      const updatedMessage = { ...message };

      if (existingReactionIndex >= 0) {
        // Update existing reaction
        updatedMessage.reactions[existingReactionIndex] = {
          participantId: currentUserId,
          type: reactionType,
          timestamp: new Date()
        };
      } else {
        // Add new reaction
        updatedMessage.reactions.push({
          participantId: currentUserId,
          type: reactionType,
          timestamp: new Date()
        });
      }

      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = updatedMessage;
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const getParticipantName = (participantId: string): string => {
    if (participantId === 'system') return 'System';
    const participant = conflict.participants.find(p => p.id === participantId);
    return participant?.name || 'Unknown';
  };

  const getParticipantColor = (participantId: string): string => {
    if (participantId === 'system') return '#64748B';
    if (participantId === currentUserId) return '#3B82F6';
    
    // Generate consistent color based on participant ID
    const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
    const index = conflict.participants.findIndex(p => p.id === participantId);
    return colors[index % colors.length] || '#64748B';
  };

  const formatTimestamp = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message: MultiPartyMessage) => {
    const isOwnMessage = message.senderId === currentUserId;
    const isSystemMessage = message.type === 'system' || message.type === 'facilitation';
    const participantName = getParticipantName(message.senderId);
    const participantColor = getParticipantColor(message.senderId);

    return (
      <View key={message.id} style={styles.messageContainer}>
        {/* System messages */}
        {isSystemMessage && (
          <View style={styles.systemMessage}>
            <AlertCircle size={16} color="#64748B" strokeWidth={2} />
            <Text style={styles.systemMessageText}>{message.content}</Text>
          </View>
        )}

        {/* Regular messages */}
        {!isSystemMessage && (
          <View style={[
            styles.messageWrapper,
            isOwnMessage && styles.ownMessageWrapper
          ]}>
            {/* Participant info */}
            {!isOwnMessage && (
              <View style={styles.participantInfo}>
                <View style={[styles.participantAvatar, { backgroundColor: participantColor }]}>
                  <Text style={styles.participantInitial}>
                    {participantName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.participantName}>{participantName}</Text>
              </View>
            )}

            {/* Message bubble */}
            <View style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
            ]}>
              <Text style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText
              ]}>
                {message.content}
              </Text>

              {/* Emotion indicator */}
              {message.emotionAnalysis && message.emotionAnalysis.primaryEmotion && (
                <View style={styles.emotionIndicator}>
                  <Text style={styles.emotionText}>
                    {message.emotionAnalysis.primaryEmotion.emotion}
                  </Text>
                </View>
              )}

              {/* Timestamp */}
              <Text style={[
                styles.timestamp,
                isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
              ]}>
                {formatTimestamp(message.timestamp)}
              </Text>
            </View>

            {/* Reactions */}
            {message.reactions.length > 0 && (
              <View style={styles.reactionsContainer}>
                {message.reactions.map((reaction, index) => (
                  <View key={index} style={styles.reaction}>
                    {reaction.type === 'agree' && <ThumbsUp size={12} color="#10B981" />}
                    {reaction.type === 'disagree' && <ThumbsDown size={12} color="#EF4444" />}
                    {reaction.type === 'like' && <Heart size={12} color="#EC4899" />}
                    {reaction.type === 'concern' && <AlertCircle size={12} color="#F59E0B" />}
                    {reaction.type === 'question' && <MessageCircle size={12} color="#3B82F6" />}
                  </View>
                ))}
              </View>
            )}

            {/* Reaction buttons (for other participants' messages) */}
            {!isOwnMessage && isSessionActive && (
              <View style={styles.reactionButtons}>
                <Pressable
                  style={styles.reactionButton}
                  onPress={() => addReaction(message.id, 'agree')}
                >
                  <ThumbsUp size={16} color="#64748B" strokeWidth={2} />
                </Pressable>
                <Pressable
                  style={styles.reactionButton}
                  onPress={() => addReaction(message.id, 'disagree')}
                >
                  <ThumbsDown size={16} color="#64748B" strokeWidth={2} />
                </Pressable>
                <Pressable
                  style={styles.reactionButton}
                  onPress={() => addReaction(message.id, 'concern')}
                >
                  <AlertCircle size={16} color="#64748B" strokeWidth={2} />
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderParticipantsList = () => (
    <View style={styles.participantsHeader}>
      <Users size={16} color="#94A3B8" strokeWidth={2} />
      <Text style={styles.participantsText}>
        {session.attendees.length} participants
      </Text>
      <View style={styles.participantIndicators}>
        {session.attendees.slice(0, 4).map((participantId, index) => {
          const participant = conflict.participants.find(p => p.id === participantId);
          const color = getParticipantColor(participantId);
          return (
            <View
              key={participantId}
              style={[
                styles.participantIndicator,
                { backgroundColor: color, marginLeft: index > 0 ? -8 : 0 }
              ]}
            >
              <Text style={styles.participantIndicatorText}>
                {participant?.name.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          );
        })}
        {session.attendees.length > 4 && (
          <View style={[styles.participantIndicator, styles.moreIndicator]}>
            <Text style={styles.participantIndicatorText}>
              +{session.attendees.length - 4}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (!currentParticipant) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>You are not a participant in this conflict.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      {renderParticipantsList()}

      {/* Session status */}
      <View style={styles.sessionStatus}>
        <Clock size={14} color="#94A3B8" strokeWidth={2} />
        <Text style={styles.sessionStatusText}>
          {isSessionActive ? 'Session Active' : 'Session Ended'}
        </Text>
        {session.currentPhase && (
          <Text style={styles.currentPhase}>
            • {session.currentPhase.name}
          </Text>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input area */}
      {isSessionActive && (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#64748B"
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            
            <View style={styles.inputActions}>
              <Pressable
                style={[styles.actionButton, isRecording && styles.recordingButton]}
                onPress={toggleRecording}
              >
                {isRecording ? (
                  <MicOff size={20} color="#FFFFFF" strokeWidth={2} />
                ) : (
                  <Mic size={20} color="#94A3B8" strokeWidth={2} />
                )}
              </Pressable>
              
              <Pressable
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Send size={20} color="#FFFFFF" strokeWidth={2} />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Session ended message */}
      {!isSessionActive && (
        <View style={styles.sessionEndedContainer}>
          <Text style={styles.sessionEndedText}>
            This session has ended. No new messages can be sent.
          </Text>
        </View>
      )}

      {/* Voice Recorder Modal */}
      <CrossPlatformBottomSheet
        visible={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
      >
        <VoiceMessageRecorder
          onSend={handleVoiceSend}
          onCancel={() => setShowVoiceRecorder(false)}
          maxDuration={120}
        />
      </CrossPlatformBottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    gap: 8,
  },
  participantsText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  participantIndicators: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  participantIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  moreIndicator: {
    backgroundColor: '#64748B',
  },
  participantIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sessionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    gap: 6,
  },
  sessionStatusText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  currentPhase: {
    color: '#94A3B8',
    fontSize: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  systemMessageText: {
    color: '#64748B',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  messageWrapper: {
    paddingHorizontal: 20,
  },
  ownMessageWrapper: {
    alignItems: 'flex-end',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantInitial: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  participantName: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    position: 'relative',
  },
  ownMessageBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#E2E8F0',
  },
  emotionIndicator: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  emotionText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherTimestamp: {
    color: '#64748B',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  reaction: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  reactionButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 20,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#64748B',
  },
  sessionEndedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderTopColor: 'rgba(100, 116, 139, 0.2)',
    borderTopWidth: 1,
  },
  sessionEndedText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  voiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  voiceModalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: 200,
  },
});
