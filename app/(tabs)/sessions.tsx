import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useResponsive } from '../../utils/platform';
import { ResponsiveContainer, ResponsiveGrid } from '../../components/layout/ResponsiveContainer';
import { MessageSquare, Plus, Clock, CheckCircle, TrendingUp, Users, Mic, FileText, BarChart3 } from 'lucide-react-native';

export default function SessionsScreen() {
  const { spacing, fontSize } = useResponsive();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  // Mock session history data
  const sessionHistory = [
    {
      id: '1',
      title: 'Workplace Disagreement',
      date: new Date('2024-06-29'),
      duration: 25,
      status: 'completed',
      type: 'individual',
      rating: 4,
      skillsUsed: ['Active Listening', 'Empathy', 'Problem Solving'],
      outcome: 'Resolved successfully with mutual understanding',
    },
    {
      id: '2',
      title: 'Family Communication Issue',
      date: new Date('2024-06-28'),
      duration: 18,
      status: 'completed',
      type: 'voice',
      rating: 5,
      skillsUsed: ['Emotional Intelligence', 'Perspective Taking'],
      outcome: 'Improved family dynamics and communication',
    },
    {
      id: '3',
      title: 'Team Project Conflict',
      date: new Date('2024-06-27'),
      duration: 32,
      status: 'in_progress',
      type: 'group',
      rating: 0,
      skillsUsed: ['Mediation', 'Compromise'],
      outcome: 'Session paused - to be continued',
    },
  ];

  const sessionTypes = [
    {
      id: 'individual',
      title: 'Individual Session',
      description: 'Work through a personal conflict with AI guidance',
      icon: <MessageSquare size={32} color="#10B981" strokeWidth={2} />,
      route: '/(main)/session/describe',
      color: '#10B981',
    },
    {
      id: 'voice',
      title: 'Voice Session',
      description: 'Practice conflict resolution through voice interaction',
      icon: <Mic size={32} color="#3B82F6" strokeWidth={2} />,
      route: '/(main)/session/describe',
      color: '#3B82F6',
    },
    {
      id: 'group',
      title: 'Group Mediation',
      description: 'Facilitate resolution between multiple parties',
      icon: <Users size={32} color="#8B5CF6" strokeWidth={2} />,
      route: '/(tabs)/sessions/group-conflict',
      color: '#8B5CF6',
    },
    {
      id: 'dashboard',
      title: 'Conflict Dashboard',
      description: 'Manage and track your ongoing conflicts',
      icon: <BarChart3 size={32} color="#EC4899" strokeWidth={2} />,
      route: '/(tabs)/sessions/conflict-dashboard',
      color: '#EC4899',
    },
    {
      id: 'assessment',
      title: 'Personality Assessment',
      description: 'Understand your conflict resolution style',
      icon: <FileText size={32} color="#F59E0B" strokeWidth={2} />,
      route: '/(auth)/onboarding/personality',
      color: '#F59E0B',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#10B981" strokeWidth={2} />;
      case 'in_progress':
        return <Clock size={16} color="#F59E0B" strokeWidth={2} />;
      default:
        return <Clock size={16} color="#6B7280" strokeWidth={2} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <Mic size={16} color="#3B82F6" strokeWidth={2} />;
      case 'group':
        return <Users size={16} color="#8B5CF6" strokeWidth={2} />;
      default:
        return <MessageSquare size={16} color="#10B981" strokeWidth={2} />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={styles.star}>
        {i < rating ? '⭐' : '☆'}
      </Text>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer style={styles.content}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing(24) }]}>
            <Text style={[styles.title, { fontSize: fontSize(28) }]}>
              Conflict Resolution Sessions
            </Text>
            <Text style={[styles.subtitle, { fontSize: fontSize(16) }]}>
              Start a new session or review your progress
            </Text>
          </View>

          {/* Tab Navigation */}
          <View style={[styles.tabContainer, { marginBottom: spacing(24) }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  backgroundColor: activeTab === 'new' ? '#10B981' : '#374151',
                  paddingHorizontal: spacing(24),
                  paddingVertical: spacing(12),
                }
              ]}
              onPress={() => setActiveTab('new')}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={[styles.tabText, { fontSize: fontSize(14) }]}>
                New Session
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                {
                  backgroundColor: activeTab === 'history' ? '#10B981' : '#374151',
                  paddingHorizontal: spacing(24),
                  paddingVertical: spacing(12),
                }
              ]}
              onPress={() => setActiveTab('history')}
            >
              <Clock size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={[styles.tabText, { fontSize: fontSize(14) }]}>
                History
              </Text>
            </TouchableOpacity>
          </View>

          {/* New Session Tab */}
          {activeTab === 'new' && (
            <View style={styles.newSessionContainer}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(20), marginBottom: spacing(16) }]}>
                Choose Your Session Type
              </Text>
              
              <ResponsiveGrid
                columns={{ mobile: 1, tablet: 2, desktop: 2 }}
                gap={spacing(16)}
              >
                {sessionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.sessionTypeCard, { padding: spacing(20) }]}
                    onPress={() => router.push(type.route as any)}
                  >
                    <View style={styles.sessionTypeIcon}>
                      {type.icon}
                    </View>
                    <Text style={[styles.sessionTypeTitle, { fontSize: fontSize(16) }]}>
                      {type.title}
                    </Text>
                    <Text style={[styles.sessionTypeDescription, { fontSize: fontSize(14) }]}>
                      {type.description}
                    </Text>
                    <View style={[styles.sessionTypeButton, { backgroundColor: type.color }]}>
                      <Text style={[styles.sessionTypeButtonText, { fontSize: fontSize(12) }]}>
                        Start Session
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ResponsiveGrid>

              {/* Quick Stats */}
              <View style={[styles.quickStats, { marginTop: spacing(32) }]}>
                <Text style={[styles.sectionTitle, { fontSize: fontSize(18), marginBottom: spacing(16) }]}>
                  Your Progress
                </Text>
                <ResponsiveGrid
                  columns={{ mobile: 3, tablet: 3, desktop: 3 }}
                  gap={spacing(12)}
                >
                  <View style={[styles.statCard, { padding: spacing(16) }]}>
                    <Text style={[styles.statNumber, { fontSize: fontSize(24) }]}>
                      {sessionHistory.filter(s => s.status === 'completed').length}
                    </Text>
                    <Text style={[styles.statLabel, { fontSize: fontSize(12) }]}>
                      Completed
                    </Text>
                  </View>
                  <View style={[styles.statCard, { padding: spacing(16) }]}>
                    <Text style={[styles.statNumber, { fontSize: fontSize(24) }]}>
                      {Math.round(sessionHistory.reduce((sum, s) => sum + s.duration, 0) / sessionHistory.length) || 0}
                    </Text>
                    <Text style={[styles.statLabel, { fontSize: fontSize(12) }]}>
                      Avg Minutes
                    </Text>
                  </View>
                  <View style={[styles.statCard, { padding: spacing(16) }]}>
                    <Text style={[styles.statNumber, { fontSize: fontSize(24) }]}>
                      {(sessionHistory.reduce((sum, s) => sum + s.rating, 0) / sessionHistory.filter(s => s.rating > 0).length || 0).toFixed(1)}
                    </Text>
                    <Text style={[styles.statLabel, { fontSize: fontSize(12) }]}>
                      Avg Rating
                    </Text>
                  </View>
                </ResponsiveGrid>
              </View>
            </View>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <View style={styles.historyContainer}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(20), marginBottom: spacing(16) }]}>
                Session History
              </Text>
              
              {sessionHistory.length === 0 ? (
                <View style={styles.emptyState}>
                  <MessageSquare size={48} color="#6B7280" strokeWidth={1} />
                  <Text style={[styles.emptyStateText, { fontSize: fontSize(16) }]}>
                    No sessions yet
                  </Text>
                  <Text style={[styles.emptyStateSubtext, { fontSize: fontSize(14) }]}>
                    Start your first conflict resolution session to see your history here
                  </Text>
                </View>
              ) : (
                <View style={styles.sessionList}>
                  {sessionHistory.map((session) => (
                    <TouchableOpacity
                      key={session.id}
                      style={[styles.sessionCard, { padding: spacing(16) }]}
                    >
                      <View style={styles.sessionHeader}>
                        <View style={styles.sessionTitleRow}>
                          <Text style={[styles.sessionTitle, { fontSize: fontSize(16) }]}>
                            {session.title}
                          </Text>
                          <View style={styles.sessionStatus}>
                            {getStatusIcon(session.status)}
                          </View>
                        </View>
                        <View style={styles.sessionMeta}>
                          <View style={styles.sessionMetaItem}>
                            {getTypeIcon(session.type)}
                            <Text style={[styles.sessionMetaText, { fontSize: fontSize(12) }]}>
                              {session.type}
                            </Text>
                          </View>
                          <View style={styles.sessionMetaItem}>
                            <Clock size={12} color="#6B7280" strokeWidth={2} />
                            <Text style={[styles.sessionMetaText, { fontSize: fontSize(12) }]}>
                              {session.duration}m
                            </Text>
                          </View>
                          <Text style={[styles.sessionDate, { fontSize: fontSize(12) }]}>
                            {session.date.toLocaleDateString()}
                          </Text>
                        </View>
                      </View>

                      {session.rating > 0 && (
                        <View style={styles.sessionRating}>
                          <View style={styles.stars}>
                            {renderStars(session.rating)}
                          </View>
                        </View>
                      )}

                      {session.skillsUsed.length > 0 && (
                        <View style={styles.skillsContainer}>
                          <Text style={[styles.skillsLabel, { fontSize: fontSize(12) }]}>
                            Skills Used:
                          </Text>
                          <View style={styles.skillsList}>
                            {session.skillsUsed.map((skill, index) => (
                              <View key={index} style={styles.skillTag}>
                                <Text style={[styles.skillText, { fontSize: fontSize(10) }]}>
                                  {skill}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      <Text style={[styles.sessionOutcome, { fontSize: fontSize(14) }]}>
                        {session.outcome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ResponsiveContainer>
      </ScrollView>
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
  header: {
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  newSessionContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  sessionTypeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sessionTypeIcon: {
    marginBottom: 16,
  },
  sessionTypeTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  sessionTypeDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  sessionTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sessionTypeButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  quickStats: {
    width: '100%',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  historyContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  sessionList: {
    gap: 16,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sessionHeader: {
    marginBottom: 12,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  sessionStatus: {
    marginLeft: 8,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionMetaText: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
  sessionDate: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginLeft: 'auto',
  },
  sessionRating: {
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillsLabel: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  sessionOutcome: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
});
