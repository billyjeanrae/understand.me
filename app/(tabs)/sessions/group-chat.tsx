import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useResponsive } from '../../../utils/platform';
import { ResponsiveContainer } from '../../../components/layout/ResponsiveContainer';
import {
  ArrowLeft,
  Send,
  Mic,
  MoreVertical,
  Users,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Circle
} from 'lucide-react-native';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'voice' | 'system' | 'mediation';
  timestamp: Date;
  isRead: boolean;
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
}

interface ChatParticipant {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'typing';
  role: 'participant' | 'mediator';
  avatar?: string;
}

export default function GroupChatScreen() {
  const { spacing, fontSize } = useResponsive();
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [conflictTitle, setConflictTitle] = useState('Family Budget Discussion');

  const currentUserId = 'user_123';

  useEffect(() => {
    loadChatData();
    // Simulate real-time updates
    const interval = setInterval(() => {
      simulateTyping();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadChatData = () => {
    // Mock participants
    const mockParticipants: ChatParticipant[] = [
      {
        id: 'user_123',
        name: 'You',
        status: 'online',
        role: 'mediator'
      },
      {
        id: 'participant_1',
        name: 'Sarah',
        status: 'online',
        role: 'participant'
      },
      {
        id: 'participant_2',
        name: 'Mike',
        status: 'online',
        role: 'participant'
      },
      {
        id: 'participant_3',
        name: 'Emma',
        status: 'offline',
        role: 'participant'
      }
    ];

    // Mock messages
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg_1',
        senderId: 'system',
        senderName: 'System',
        content: 'Group mediation session started. Welcome everyone!',
        type: 'system',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: true
      },
      {
        id: 'msg_2',
        senderId: 'user_123',
        senderName: 'You',
        content: 'Hi everyone, thank you for joining this session. Let\'s start by having each person share their perspective on the budget situation.',
        type: 'mediation',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        isRead: true
      },
      {
        id: 'msg_3',
        senderId: 'participant_1',
        senderName: 'Sarah',
        content: 'I think we need to be more careful about our spending on entertainment and dining out.',
        type: 'text',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        isRead: true
      },
      {
        id: 'msg_4',
        senderId: 'participant_2',
        senderName: 'Mike',
        content: 'I understand Sarah\'s concern, but I also think we should consider that some of those expenses are important for family bonding.',
        type: 'text',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: true
      },
      {
        id: 'msg_5',
        senderId: 'user_123',
        senderName: 'You',
        content: 'Those are both valid points. Sarah, can you help us understand what specific changes you\'d like to see? And Mike, what family activities are most important to you?',
        type: 'mediation',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        isRead: true
      }
    ];

    setParticipants(mockParticipants);
    setMessages(mockMessages);
  };

  const simulateTyping = () => {
    const activeParticipants = participants.filter(p => p.status === 'online' && p.id !== currentUserId);
    if (activeParticipants.length > 0) {
      const randomParticipant = activeParticipants[Math.floor(Math.random() * activeParticipants.length)];
      setTypingUsers([randomParticipant.name]);
      
      setTimeout(() => {
        setTypingUsers([]);
        // Simulate receiving a message
        if (Math.random() > 0.5) {
          const responses = [
            "I think we're making good progress here.",
            "Can we schedule a follow-up to discuss this further?",
            "I appreciate everyone being so open about this.",
            "Let me think about what you've said.",
            "That's a fair point to consider."
          ];
          
          const newMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            senderId: randomParticipant.id,
            senderName: randomParticipant.name,
            content: responses[Math.floor(Math.random() * responses.length)],
            type: 'text',
            timestamp: new Date(),
            isRead: false
          };
          
          setMessages(prev => [...prev, newMsg]);
        }
      }, 2000);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim().length === 0) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: 'You',
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date(),
      isRead: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'system': return '#6B7280';
      case 'mediation': return '#3B82F6';
      case 'text': return '#FFFFFF';
      default: return '#FFFFFF';
    }
  };

  const getMessageBackground = (senderId: string, type: string) => {
    if (type === 'system') return 'rgba(107, 114, 128, 0.2)';
    if (type === 'mediation') return 'rgba(59, 130, 246, 0.2)';
    if (senderId === currentUserId) return '#3B82F6';
    return 'rgba(255, 255, 255, 0.1)';
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isOwnMessage = message.senderId === currentUserId;
    const showDate = index === 0 || 
      formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

    return (
      <View key={message.id}>
        {showDate && (
          <View style={styles.dateHeader}>
            <Text style={[styles.dateText, { fontSize: fontSize(12) }]}>
              {formatDate(message.timestamp)}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          message.type === 'system' && styles.systemMessage
        ]}>
          {!isOwnMessage && message.type !== 'system' && (
            <Text style={[styles.senderName, { fontSize: fontSize(12) }]}>
              {message.senderName}
            </Text>
          )}
          
          <View style={[
            styles.messageBubble,
            { 
              backgroundColor: getMessageBackground(message.senderId, message.type),
              padding: spacing(12)
            }
          ]}>
            <Text style={[
              styles.messageText,
              { 
                fontSize: fontSize(14),
                color: getMessageTypeColor(message.type)
              }
            ]}>
              {message.content}
            </Text>
          </View>
          
          <Text style={[styles.messageTime, { fontSize: fontSize(10) }]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderParticipantStatus = () => (
    <View style={styles.participantStatus}>
      <Users size={16} color="#9CA3AF" strokeWidth={2} />
      <Text style={[styles.participantCount, { fontSize: fontSize(12) }]}>
        {participants.filter(p => p.status === 'online').length} online
      </Text>
      {typingUsers.length > 0 && (
        <Text style={[styles.typingIndicator, { fontSize: fontSize(12) }]}>
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { fontSize: fontSize(16) }]}>
              {conflictTitle}
            </Text>
            {renderParticipantStatus()}
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => Alert.alert('Voice Call', 'Starting voice call...')}
            >
              <Phone size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => Alert.alert('Video Call', 'Starting video call...')}
            >
              <Video size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => Alert.alert('Chat Info', 'This would show chat details')}
            >
              <Info size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <ResponsiveContainer style={styles.messagesContent}>
            {messages.map((message, index) => renderMessage(message, index))}
          </ResponsiveContainer>
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { padding: spacing(16) }]}>
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={() => Alert.alert('Attachments', 'File attachment coming soon')}
            >
              <Paperclip size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.textInput, { fontSize: fontSize(14), padding: spacing(12) }]}
              placeholder="Type a message..."
              placeholderTextColor="#6B7280"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
            />
            
            <TouchableOpacity 
              style={styles.emojiButton}
              onPress={() => Alert.alert('Emojis', 'Emoji picker coming soon')}
            >
              <Smile size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
            
            {newMessage.trim().length > 0 ? (
              <TouchableOpacity 
                style={[styles.sendButton, { padding: spacing(8) }]}
                onPress={sendMessage}
              >
                <Send size={20} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.voiceButton, { padding: spacing(8) }]}
                onPress={() => Alert.alert('Voice Message', 'Voice recording coming soon')}
              >
                <Mic size={20} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  participantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantCount: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  typingIndicator: {
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  systemMessage: {
    alignItems: 'center',
  },
  senderName: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    borderRadius: 16,
    maxWidth: '80%',
    minWidth: 60,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  messageTime: {
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
  },
  voiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
