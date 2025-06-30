import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import ParticipantInviteModal from '../../../components/modals/ParticipantInviteModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useResponsive } from '../../../utils/platform';
import { ResponsiveContainer } from '../../../components/layout/ResponsiveContainer';
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
  ArrowLeft,
  MessageCircle
} from 'lucide-react-native';

// Types for group conflict management
interface ConflictParticipant {
  id: string;
  name: string;
  role: 'mediator' | 'participant';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
}

interface GroupSession {
  id: string;
  title: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  phase: 'introduction' | 'issue_identification' | 'discussion' | 'resolution' | 'agreement';
  startTime: Date;
  duration: number; // minutes
  participants: ConflictParticipant[];
  currentSpeaker?: string;
  agenda: string[];
  notes: string[];
}

interface MultiPartyConflict {
  id: string;
  title: string;
  description: string;
  category: 'family' | 'workplace' | 'community' | 'business' | 'other';
  participants: ConflictParticipant[];
  currentSession?: GroupSession;
  sessions: GroupSession[];
  createdAt: Date;
  status: 'active' | 'resolved' | 'paused';
}

export default function GroupConflictScreen() {
  const { spacing, fontSize } = useResponsive();
  const router = useRouter();
  const [conflict, setConflict] = useState<MultiPartyConflict | null>(null);
  const [currentSession, setCurrentSession] = useState<GroupSession | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSessionControls, setShowSessionControls] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = 'user_123';

  useEffect(() => {
    loadConflictData();
  }, []);

  const loadConflictData = async () => {
    try {
      // Create demo conflict data
      const demoConflict = await createDemoConflict();
      setConflict(demoConflict);
      setCurrentSession(demoConflict.currentSession || null);
    } catch (error) {
      console.error('Failed to load conflict data:', error);
      Alert.alert('Error', 'Failed to load conflict data');
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoConflict = async (): Promise<MultiPartyConflict> => {
    const participants: ConflictParticipant[] = [
      {
        id: 'user_123',
        name: 'You',
        role: 'mediator',
        status: 'active',
        joinedAt: new Date()
      },
      {
        id: 'participant_1',
        name: 'Sarah',
        role: 'participant',
        status: 'active',
        joinedAt: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 'participant_2',
        name: 'Mike',
        role: 'participant',
        status: 'active',
        joinedAt: new Date(Date.now() - 3 * 60 * 1000)
      },
      {
        id: 'participant_3',
        name: 'Emma',
        role: 'participant',
        status: 'pending',
        joinedAt: new Date()
      }
    ];

    const currentSession: GroupSession = {
      id: 'session_1',
      title: 'Family Budget Discussion - Session 1',
      status: 'planning',
      phase: 'introduction',
      startTime: new Date(),
      duration: 0,
      participants: participants.filter(p => p.status === 'active'),
      agenda: [
        'Welcome and introductions',
        'Review ground rules',
        'Identify key budget concerns',
        'Discuss spending priorities',
        'Explore compromise solutions',
        'Create action plan'
      ],
      notes: []
    };

    const conflict: MultiPartyConflict = {
      id: 'conflict_family_budget',
      title: 'Family Budget Discussion',
      description: 'Disagreement about household spending priorities and budget allocation among family members',
      category: 'family',
      participants,
      currentSession,
      sessions: [currentSession],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'active'
    };

    return conflict;
  };

  const startSession = () => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      status: 'active' as const,
      startTime: new Date()
    };

    setCurrentSession(updatedSession);
    Alert.alert('Session Started', 'Group mediation session has begun');
  };

  const pauseSession = () => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      status: 'paused' as const,
      duration: currentSession.duration + Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000)
    };

    setCurrentSession(updatedSession);
    Alert.alert('Session Paused', 'You can resume the session when ready');
  };

  const endSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this mediation session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            if (currentSession) {
              const updatedSession = {
                ...currentSession,
                status: 'completed' as const,
                duration: currentSession.duration + Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000)
              };
              setCurrentSession(updatedSession);
              Alert.alert('Session Ended', 'Mediation session has been completed');
            }
          }
        }
      ]
    );
  };

  const addParticipant = () => {
    setShowInviteModal(true);
  };

  const handleParticipantAdded = (newParticipant: ConflictParticipant) => {
    if (conflict) {
      setConflict(prev => prev ? {
        ...prev,
        participants: [...prev.participants, newParticipant]
      } : null);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'introduction': return '#3B82F6';
      case 'issue_identification': return '#F59E0B';
      case 'discussion': return '#EF4444';
      case 'resolution': return '#8B5CF6';
      case 'agreement': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'paused': return '#F59E0B';
      case 'planning': return '#3B82F6';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { fontSize: fontSize(16) }]}>
            Loading conflict data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!conflict) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#EF4444" strokeWidth={2} />
          <Text style={[styles.errorText, { fontSize: fontSize(16) }]}>
            Failed to load conflict data
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadConflictData}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer style={styles.content}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing(24) }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { fontSize: fontSize(20) }]}>
                {conflict.title}
              </Text>
              <Text style={[styles.subtitle, { fontSize: fontSize(14) }]}>
                {conflict.category} • {conflict.participants.length} participants
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setShowSessionControls(true)}
            >
              <Settings size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Current Session Status */}
          {currentSession && (
            <View style={[styles.sessionCard, { marginBottom: spacing(24), padding: spacing(20) }]}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionTitle, { fontSize: fontSize(18) }]}>
                    {currentSession.title}
                  </Text>
                  <View style={styles.sessionMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentSession.status) }]}>
                      <Text style={[styles.badgeText, { fontSize: fontSize(12) }]}>
                        {currentSession.status.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.phaseBadge, { backgroundColor: getPhaseColor(currentSession.phase) }]}>
                      <Text style={[styles.badgeText, { fontSize: fontSize(12) }]}>
                        {currentSession.phase.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Session Controls */}
              <View style={styles.sessionControls}>
                {currentSession.status === 'planning' && (
                  <TouchableOpacity 
                    style={[styles.controlButton, styles.startButton]}
                    onPress={startSession}
                  >
                    <Play size={20} color="#FFFFFF" strokeWidth={2} />
                    <Text style={[styles.controlText, { fontSize: fontSize(14) }]}>
                      Start Session
                    </Text>
                  </TouchableOpacity>
                )}

                {currentSession.status === 'active' && (
                  <>
                    <TouchableOpacity 
                      style={[styles.controlButton, styles.pauseButton]}
                      onPress={pauseSession}
                    >
                      <Pause size={20} color="#FFFFFF" strokeWidth={2} />
                      <Text style={[styles.controlText, { fontSize: fontSize(14) }]}>
                        Pause
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.controlButton, styles.endButton]}
                      onPress={endSession}
                    >
                      <Square size={20} color="#FFFFFF" strokeWidth={2} />
                      <Text style={[styles.controlText, { fontSize: fontSize(14) }]}>
                        End Session
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {currentSession.status === 'paused' && (
                  <TouchableOpacity 
                    style={[styles.controlButton, styles.resumeButton]}
                    onPress={startSession}
                  >
                    <Play size={20} color="#FFFFFF" strokeWidth={2} />
                    <Text style={[styles.controlText, { fontSize: fontSize(14) }]}>
                      Resume
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Session Duration */}
              <View style={styles.sessionStats}>
                <View style={styles.statItem}>
                  <Clock size={16} color="#9CA3AF" strokeWidth={2} />
                  <Text style={[styles.statText, { fontSize: fontSize(12) }]}>
                    {currentSession.duration} min
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Users size={16} color="#9CA3AF" strokeWidth={2} />
                  <Text style={[styles.statText, { fontSize: fontSize(12) }]}>
                    {currentSession.participants.length} active
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Participants */}
          <View style={[styles.section, { marginBottom: spacing(24) }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(18) }]}>
                Participants
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addParticipant}
              >
                <UserPlus size={20} color="#3B82F6" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.participantsList}>
              {conflict.participants.map((participant) => (
                <View key={participant.id} style={[styles.participantCard, { padding: spacing(16) }]}>
                  <View style={styles.participantInfo}>
                    <View style={styles.participantAvatar}>
                      <Text style={[styles.avatarText, { fontSize: fontSize(16) }]}>
                        {participant.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.participantDetails}>
                      <Text style={[styles.participantName, { fontSize: fontSize(16) }]}>
                        {participant.name}
                      </Text>
                      <Text style={[styles.participantRole, { fontSize: fontSize(12) }]}>
                        {participant.role} • {participant.status}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: participant.status === 'active' ? '#10B981' : '#6B7280' }
                  ]} />
                </View>
              ))}
            </View>
          </View>

          {/* Session Agenda */}
          {currentSession && (
            <View style={[styles.section, { marginBottom: spacing(24) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(18) }]}>
                Session Agenda
              </Text>
              <View style={styles.agendaList}>
                {currentSession.agenda.map((item, index) => (
                  <View key={index} style={[styles.agendaItem, { padding: spacing(12) }]}>
                    <View style={styles.agendaNumber}>
                      <Text style={[styles.agendaNumberText, { fontSize: fontSize(12) }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.agendaText, { fontSize: fontSize(14) }]}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { padding: spacing(16) }]}
              onPress={() => router.push('/(tabs)/sessions/group-chat')}
            >
              <MessageCircle size={24} color="#3B82F6" strokeWidth={2} />
              <Text style={[styles.actionText, { fontSize: fontSize(14) }]}>
                Group Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { padding: spacing(16) }]}
              onPress={() => router.push('/(tabs)/sessions/session-notes')}
            >
              <FileText size={24} color="#10B981" strokeWidth={2} />
              <Text style={[styles.actionText, { fontSize: fontSize(14) }]}>
                Session Notes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { padding: spacing(16) }]}
              onPress={() => Alert.alert('Progress', 'This would show conflict progress')}
            >
              <TrendingUp size={24} color="#F59E0B" strokeWidth={2} />
              <Text style={[styles.actionText, { fontSize: fontSize(14) }]}>
                Progress
              </Text>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>
      </ScrollView>

      <ParticipantInviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onParticipantAdded={handleParticipantAdded}
        conflictTitle={conflict?.title}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  settingsButton: {
    padding: 8,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sessionHeader: {
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  phaseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  sessionControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  endButton: {
    backgroundColor: '#EF4444',
  },
  resumeButton: {
    backgroundColor: '#3B82F6',
  },
  controlText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    padding: 8,
  },
  participantsList: {
    gap: 12,
  },
  participantCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  participantRole: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  agendaList: {
    gap: 8,
  },
  agendaItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  agendaNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agendaNumberText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  agendaText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Medium',
  },
});
