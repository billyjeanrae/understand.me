import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Plus, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  Users, 
  Award,
  Mic,
  BarChart3
} from 'lucide-react-native';

import { ResponsiveLayout } from '../../components/layout/ResponsiveLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuthStore();
  
  const isTablet = screenWidth >= 768;

  const handleStartSession = () => {
    router.push('/(main)/session/describe');
  };

  const handleViewHistory = () => {
    router.push('/(main)/growth/history');
  };

  const handleViewGrowth = () => {
    router.push('/(main)/growth');
  };

  const handleViewSettings = () => {
    router.push('/(main)/settings');
  };

  // Mock data for demonstration
  const recentSessions = [
    {
      id: '1',
      title: 'Family Discussion',
      date: '2 hours ago',
      participants: 3,
      resolution: 'positive',
    },
    {
      id: '2',
      title: 'Work Conflict',
      date: 'Yesterday',
      participants: 2,
      resolution: 'moderate',
    },
  ];

  const stats = {
    totalSessions: 12,
    avgResolution: 85,
    growthScore: 7.8,
    streakDays: 5,
  };

  return (
    <ResponsiveLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back, {user?.name || user?.username || 'User'}!
            </Text>
            <Text style={styles.subtitle}>
              Ready to improve your communication skills?
            </Text>
          </View>
          <TouchableOpacity onPress={handleViewSettings} style={styles.profileButton}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name || user?.username || 'U')[0].toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Start Section */}
        <Card style={styles.quickStartCard}>
          <View style={styles.quickStartContent}>
            <View style={styles.quickStartText}>
              <Text style={styles.quickStartTitle}>Start a New Session</Text>
              <Text style={styles.quickStartDescription}>
                Begin a conflict resolution session with AI guidance
              </Text>
            </View>
            <Button
              title="Start Session"
              onPress={handleStartSession}
              size="large"
              style={styles.startButton}
            />
          </View>
          <View style={styles.voiceHint}>
            <Mic size={16} color={Colors.text.tertiary} />
            <Text style={styles.voiceHintText}>Voice-guided experience available</Text>
          </View>
        </Card>

        {/* Stats Overview */}
        <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
          <Card style={styles.statCard}>
            <MessageCircle size={24} color={Colors.primary[500]} />
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <TrendingUp size={24} color={Colors.emotion.positive} />
            <Text style={styles.statNumber}>{stats.avgResolution}%</Text>
            <Text style={styles.statLabel}>Avg Resolution</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Award size={24} color={Colors.secondary[500]} />
            <Text style={styles.statNumber}>{stats.growthScore}</Text>
            <Text style={styles.statLabel}>Growth Score</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Clock size={24} color={Colors.emotion.calm} />
            <Text style={styles.statNumber}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </Card>
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <TouchableOpacity onPress={handleViewHistory}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentSessions.map((session) => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <View style={[
                  styles.resolutionBadge,
                  { backgroundColor: getResolutionColor(session.resolution) }
                ]}>
                  <Text style={styles.resolutionText}>
                    {session.resolution}
                  </Text>
                </View>
              </View>
              <View style={styles.sessionMeta}>
                <View style={styles.sessionMetaItem}>
                  <Clock size={14} color={Colors.text.tertiary} />
                  <Text style={styles.sessionMetaText}>{session.date}</Text>
                </View>
                <View style={styles.sessionMetaItem}>
                  <Users size={14} color={Colors.text.tertiary} />
                  <Text style={styles.sessionMetaText}>
                    {session.participants} participants
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleViewGrowth}
            >
              <BarChart3 size={24} color={Colors.primary[500]} />
              <Text style={styles.quickActionText}>View Growth</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleViewHistory}
            >
              <Clock size={24} color={Colors.secondary[500]} />
              <Text style={styles.quickActionText}>Session History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleViewSettings}
            >
              <Award size={24} color={Colors.emotion.positive} />
              <Text style={styles.quickActionText}>Achievements</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ResponsiveLayout>
  );
}

function getResolutionColor(resolution: string) {
  switch (resolution) {
    case 'positive':
      return Colors.emotion.positive;
    case 'moderate':
      return Colors.emotion.tension;
    case 'challenging':
      return Colors.emotion.conflict;
    default:
      return Colors.emotion.neutral;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  
  greeting: {
    ...Typography.styles.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  subtitle: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
  },
  
  profileButton: {
    padding: Spacing.xs,
  },
  
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarText: {
    ...Typography.styles.h5,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  
  quickStartCard: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  
  quickStartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  
  quickStartText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  
  quickStartTitle: {
    ...Typography.styles.h5,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  
  quickStartDescription: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
  },
  
  startButton: {
    minWidth: 120,
  },
  
  voiceHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  
  voiceHintText: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  
  statsGridTablet: {
    justifyContent: 'space-between',
  },
  
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.md,
  },
  
  statNumber: {
    ...Typography.styles.metric,
    color: Colors.text.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  
  statLabel: {
    ...Typography.styles.metricLabel,
    color: Colors.text.secondary,
  },
  
  section: {
    marginBottom: Spacing.xl,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  sectionTitle: {
    ...Typography.styles.h5,
    color: Colors.text.primary,
  },
  
  sectionLink: {
    ...Typography.styles.body,
    color: Colors.primary[500],
    fontWeight: '600',
  },
  
  sessionCard: {
    marginBottom: Spacing.md,
  },
  
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  sessionTitle: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  
  resolutionBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  
  resolutionText: {
    ...Typography.styles.caption,
    color: Colors.text.inverse,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  
  sessionMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  
  sessionMetaText: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
  },
  
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
  },
  
  quickActionText: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
