/**
 * Group Conflict Screen
 * Main interface for multi-party conflict resolution sessions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  Play,
  Pause,
  Square,
  Settings,
  UserPlus,
  FileText,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import {
  MultiPartyConflict,
  GroupSession,
  ConflictParticipant,
  SessionPhase
} from '../types/multiparty';
import { RootStackParamList } from '../navigation/AppNavigator';
import { multiPartyConflictService } from '../services/conflict/multiparty';
import { groupMediationWorkflowService } from '../services/conflict/groupMediation';
import MultiPartyChat from '../components/MultiPartyChat';

type GroupConflictScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GroupConflict'>;
type GroupConflictScreenRouteProp = RouteProp<RootStackParamList, 'GroupConflict'>;

export default function GroupConflictScreen() {
  const navigation = useNavigation<GroupConflictScreenNavigationProp>();
  const route = useRoute<GroupConflictScreenRouteProp>();
  
  const [conflict, setConflict] = useState<MultiPartyConflict | null>(null);
  const [currentSession, setCurrentSession] = useState<GroupSession | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSessionControls, setShowSessionControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock current user ID - in real app, this would come from auth
  const currentUserId = 'user_123';

  useEffect(() => {
    loadConflictData();
  }, []);

  const loadConflictData = async () => {
    try {
      // In real app, conflict ID would come from route params
      const conflictId = route.params?.conflictId || 'demo_conflict';
      
      let conflictData = multiPartyConflictService.getConflict(conflictId);
      
      // Create demo conflict if none exists
      if (!conflictData) {
        conflictData = await createDemoConflict();
      }

      setConflict(conflictData);
      setCurrentSession(conflictData.currentSession || null);
    } catch (error) {
      console.error('Failed to load conflict data:', error);
      Alert.alert('Error', 'Failed to load conflict data');
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoConflict = async (): Promise<MultiPartyConflict> => {
    const conflict = await multiPartyConflictService.createConflict(
      'Family Budget Discussion',
      'Disagreement about household spending priorities and budget allocation',
      'family',
      currentUserId,
      'You'
    );

    // Add demo participants
    await multiPartyConflictService.addParticipant(
      conflict.id,
      'participant_2',
      'Alex',
      'primary'
    );
    await multiPartyConflictService.addParticipant(
      conflict.id,
      'participant_3',
      'Jordan',
      'secondary'
    );

    // Join participants
    await multiPartyConflictService.joinConflict(conflict.id, 'participant_2');
    await multiPartyConflictService.joinConflict(conflict.id, 'participant_3');

    return multiPartyConflictService.getConflict(conflict.id)!;
  };

  const startSession = async () => {
    if (!conflict) return;

    try {
      setIsLoading(true);
      const session = await multiPartyConflictService.startSession(conflict.id);
      setCurrentSession(session);
      
      // Reload conflict to get updated state
      const updatedConflict = multiPartyConflictService.getConflict(conflict.id);
      setConflict(updatedConflict!);
      
      Alert.alert('Session Started', 'The mediation session has begun.');
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Failed to start session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    if (!conflict || !currentSession) return;

    Alert.alert(
      'End Session',
      'Are you sure you want to end this mediation session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await multiPartyConflictService.endSession(
                conflict.id,
                currentSession.id,
                { [currentUserId]: 8 } // Demo satisfaction rating
              );
              
              setCurrentSession(null);
              
              // Reload conflict to get updated state
              const updatedConflict = multiPartyConflictService.getConflict(conflict.id);
              setConflict(updatedConflict!);
              
              Alert.alert('Session Ended', 'The mediation session has been completed.');
            } catch (error) {
              console.error('Failed to end session:', error);
              Alert.alert('Error', 'Failed to end session.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const addParticipant = () => {
    Alert.alert(
      'Add Participant',
      'In a real app, this would show a participant selection interface.',
      [{ text: 'OK' }]
    );
  };

  const renderConflictHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#94A3B8" strokeWidth={2} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.conflictTitle}>{conflict?.title}</Text>
          <Text style={styles.conflictType}>
            {conflict?.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Conflict
          </Text>
        </View>
        <Pressable style={styles.headerButton} onPress={() => setShowParticipants(true)}>
          <Users size={20} color="#94A3B8" strokeWidth={2} />
        </Pressable>
      </View>

      {/* Status indicators */}
      <View style={styles.statusRow}>
        <View style={[
          styles.statusBadge,
          conflict?.status === 'active' && styles.statusActive,
          conflict?.status === 'setup' && styles.statusSetup,
          conflict?.status === 'resolved' && styles.statusResolved
        ]}>
          <Text style={styles.statusText}>
            {conflict?.status.toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.participantCount}>
          <Users size={14} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.participantCountText}>
            {conflict?.participants.filter(p => p.status === 'joined').length} active
          </Text>
        </View>

        {currentSession && (
          <View style={styles.sessionInfo}>
            <Clock size={14} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.sessionInfoText}>
              Session {currentSession.sessionNumber}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderSessionControls = () => {
    if (!conflict) return null;

    const hasActiveSession = currentSession && !currentSession.endTime;
    const canStartSession = conflict.participants.filter(p => p.status === 'joined').length >= 2;

    return (
      <View style={styles.sessionControls}>
        {!hasActiveSession ? (
          <Pressable
            style={[styles.controlButton, styles.startButton, !canStartSession && styles.disabledButton]}
            onPress={startSession}
            disabled={!canStartSession || isLoading}
          >
            <Play size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.controlButtonText}>Start Session</Text>
          </Pressable>
        ) : (
          <View style={styles.activeSessionControls}>
            <View style={styles.currentPhaseInfo}>
              <Target size={16} color="#3B82F6" strokeWidth={2} />
              <Text style={styles.currentPhaseText}>
                {currentSession.currentPhase.name}
              </Text>
            </View>
            
            <Pressable
              style={[styles.controlButton, styles.endButton]}
              onPress={endSession}
              disabled={isLoading}
            >
              <Square size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.controlButtonText}>End Session</Text>
            </Pressable>
          </View>
        )}

        {!canStartSession && (
          <Text style={styles.requirementText}>
            At least 2 participants must join to start a session
          </Text>
        )}
      </View>
    );
  };

  const renderQuickStats = () => {
    if (!conflict) return null;

    const totalSessions = conflict.sessionHistory.length + (currentSession ? 1 : 0);
    const totalAgreements = conflict.agreements.length;
    const resolvedAgreements = conflict.agreements.filter(a => a.status === 'agreed').length;

    return (
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Clock size={20} color="#3B82F6" strokeWidth={2} />
          <Text style={styles.statValue}>{totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        
        <View style={styles.statCard}>
          <FileText size={20} color="#10B981" strokeWidth={2} />
          <Text style={styles.statValue}>{resolvedAgreements}/{totalAgreements}</Text>
          <Text style={styles.statLabel}>Agreements</Text>
        </View>
        
        <View style={styles.statCard}>
          <TrendingUp size={20} color="#F59E0B" strokeWidth={2} />
          <Text style={styles.statValue}>
            {conflict.groupDynamics.trustLevel.charAt(0).toUpperCase() + conflict.groupDynamics.trustLevel.slice(1)}
          </Text>
          <Text style={styles.statLabel}>Trust Level</Text>
        </View>
      </View>
    );
  };

  const renderParticipantsModal = () => (
    <Modal
      visible={showParticipants}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowParticipants(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Participants</Text>
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setShowParticipants(false)}
          >
            <Text style={styles.modalCloseText}>Done</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.participantsList}>
          {conflict?.participants.map((participant) => (
            <View key={participant.id} style={styles.participantItem}>
              <View style={styles.participantInfo}>
                <View style={[
                  styles.participantAvatar,
                  { backgroundColor: getParticipantColor(participant.id) }
                ]}>
                  <Text style={styles.participantInitial}>
                    {participant.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.participantDetails}>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <Text style={styles.participantRole}>
                    {participant.role} • {participant.status}
                  </Text>
                </View>
              </View>
              
              <View style={[
                styles.participantStatus,
                participant.status === 'joined' && styles.statusJoined,
                participant.status === 'invited' && styles.statusInvited
              ]}>
                {participant.status === 'joined' && <CheckCircle size={16} color="#10B981" />}
                {participant.status === 'invited' && <Clock size={16} color="#F59E0B" />}
              </View>
            </View>
          ))}
          
          <Pressable style={styles.addParticipantButton} onPress={addParticipant}>
            <UserPlus size={20} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.addParticipantText}>Add Participant</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const getParticipantColor = (participantId: string): string => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const index = conflict?.participants.findIndex(p => p.id === participantId) || 0;
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conflict data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!conflict) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#EF4444" strokeWidth={2} />
          <Text style={styles.errorText}>Conflict not found</Text>
          <Pressable style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      {renderConflictHeader()}
      
      {/* Main content */}
      <View style={styles.content}>
        {currentSession ? (
          // Active session - show chat interface
          <MultiPartyChat
            conflict={conflict}
            session={currentSession}
            currentUserId={currentUserId}
            onMessageSent={(message) => {
              console.log('Message sent:', message);
            }}
            onEmotionDetected={(emotion) => {
              console.log('Emotion detected:', emotion);
            }}
          />
        ) : (
          // No active session - show overview and controls
          <ScrollView style={styles.overviewContainer} showsVerticalScrollIndicator={false}>
            {renderQuickStats()}
            
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Conflict Description</Text>
              <Text style={styles.descriptionText}>{conflict.description}</Text>
            </View>

            {conflict.sessionHistory.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.sectionTitle}>Previous Sessions</Text>
                {conflict.sessionHistory.slice(-3).map((session, index) => (
                  <View key={session.id} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyTitle}>Session {session.sessionNumber}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(session.startTime).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.historyDuration}>
                      Duration: {session.actualDuration || session.plannedDuration} minutes
                    </Text>
                    <Text style={styles.historyAgreements}>
                      {session.agreements.length} agreements reached
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Session controls */}
      {!currentSession && renderSessionControls()}

      {/* Modals */}
      {renderParticipantsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  conflictTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  conflictType: {
    fontSize: 14,
    color: '#94A3B8',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#64748B',
  },
  statusActive: {
    backgroundColor: '#10B981',
  },
  statusSetup: {
    backgroundColor: '#F59E0B',
  },
  statusResolved: {
    backgroundColor: '#3B82F6',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  participantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantCountText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionInfoText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  historySection: {
    marginBottom: 24,
  },
  historyItem: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  historyDuration: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  historyAgreements: {
    fontSize: 14,
    color: '#10B981',
  },
  sessionControls: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  endButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#64748B',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activeSessionControls: {
    gap: 12,
  },
  currentPhaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  currentPhaseText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  requirementText: {
    color: '#F59E0B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  participantsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  participantRole: {
    fontSize: 12,
    color: '#94A3B8',
  },
  participantStatus: {
    padding: 8,
  },
  statusJoined: {
    // Styles for joined status
  },
  statusInvited: {
    // Styles for invited status
  },
  addParticipantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderStyle: 'dashed',
    gap: 8,
  },
  addParticipantText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});

