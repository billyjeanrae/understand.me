/**
 * Profile Screen
 * Main profile interface with overview, recommendations, and management
 */

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Settings, 
  TrendingUp, 
  Target, 
  Brain,
  Award,
  Clock,
  ArrowRight,
  RefreshCw,
  Edit3
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { 
  useProfile, 
  useProfileAnalytics, 
  usePersonalizationRecommendations,
  useProfileActions,
  useProfileLoading,
  useProfileError,
  useTopSkillsNeedingWork,
  useHighPriorityRecommendations,
  useRecentConflicts,
  usePersonalizedInsights
} from '../stores/userProfileStore';
import { RootStackParamList } from '../navigation/types';
import ProfileManagement from '../components/ProfileManagement';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const profile = useProfile();
  const analytics = useProfileAnalytics();
  const recommendations = usePersonalizationRecommendations();
  const { initializeProfile, generateRecommendations, refreshAnalytics } = useProfileActions();
  const isLoading = useProfileLoading();
  const error = useProfileError();
  const skillsNeedingWork = useTopSkillsNeedingWork();
  const highPriorityRecommendations = useHighPriorityRecommendations();
  const recentConflicts = useRecentConflicts();
  const personalizedInsights = usePersonalizedInsights();

  const [showProfileManagement, setShowProfileManagement] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!profile) {
      initializeProfile();
    }
  }, [profile, initializeProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshAnalytics(),
        generateRecommendations(),
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh profile data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRecommendationPress = (recommendationId: string) => {
    const recommendation = recommendations.find(r => r.id === recommendationId);
    if (recommendation) {
      Alert.alert(
        recommendation.title,
        `${recommendation.description}\n\nReasoning: ${recommendation.reasoning}\n\nAction Items:\n${recommendation.actionItems.map(item => `• ${item}`).join('\n')}`,
        [
          { text: 'Dismiss', style: 'cancel' },
          { text: 'Start Activity', onPress: () => {
            // TODO: Navigate to specific activity or workflow
            Alert.alert('Coming Soon', 'Activity implementation coming soon!');
          }}
        ]
      );
    }
  };

  if (showProfileManagement) {
    return (
      <ProfileManagement onClose={() => setShowProfileManagement(false)} />
    );
  }

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <View style={styles.loadingContainer}>
          <RefreshCw size={32} color="#3B82F6" strokeWidth={2} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={initializeProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No profile found. Please create a profile first.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Profile</Text>
          <Text style={styles.headerSubtitle}>Track your growth and personalize your experience</Text>
        </View>
        <Pressable 
          style={styles.headerButton} 
          onPress={() => setShowProfileManagement(true)}
        >
          <Edit3 size={20} color="#94A3B8" strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {/* Profile Overview */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <User size={32} color="#3B82F6" strokeWidth={2} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              <Text style={styles.profileJoined}>
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Analytics Overview */}
        {analytics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <TrendingUp size={24} color="#10B981" strokeWidth={2} />
                <Text style={styles.analyticsValue}>{analytics.profileCompleteness}%</Text>
                <Text style={styles.analyticsLabel}>Profile Complete</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Brain size={24} color="#8B5CF6" strokeWidth={2} />
                <Text style={styles.analyticsValue}>{analytics.learningProgress}%</Text>
                <Text style={styles.analyticsLabel}>Learning Progress</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Target size={24} color="#F59E0B" strokeWidth={2} />
                <Text style={styles.analyticsValue}>{analytics.engagementScore}</Text>
                <Text style={styles.analyticsLabel}>Engagement</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Award size={24} color="#EF4444" strokeWidth={2} />
                <Text style={styles.analyticsValue}>
                  {analytics.conflictResolutionImprovement > 0 ? '+' : ''}{analytics.conflictResolutionImprovement}%
                </Text>
                <Text style={styles.analyticsLabel}>Improvement</Text>
              </View>
            </View>
          </View>
        )}

        {/* Personalized Insights */}
        {personalizedInsights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Insights</Text>
            {personalizedInsights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* High Priority Recommendations */}
        {highPriorityRecommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            {highPriorityRecommendations.map((recommendation) => (
              <Pressable
                key={recommendation.id}
                style={styles.recommendationCard}
                onPress={() => handleRecommendationPress(recommendation.id)}
              >
                <View style={styles.recommendationHeader}>
                  <View style={styles.recommendationIcon}>
                    {recommendation.type === 'skill_development' && <Brain size={20} color="#3B82F6" strokeWidth={2} />}
                    {recommendation.type === 'communication_style' && <User size={20} color="#10B981" strokeWidth={2} />}
                    {recommendation.type === 'learning_activity' && <Target size={20} color="#F59E0B" strokeWidth={2} />}
                  </View>
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                    <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
                    <View style={styles.recommendationMeta}>
                      <Text style={styles.recommendationPriority}>
                        {recommendation.priority.toUpperCase()} PRIORITY
                      </Text>
                      {recommendation.timeToComplete && (
                        <Text style={styles.recommendationTime}>
                          <Clock size={12} color="#64748B" strokeWidth={2} />
                          {' '}{recommendation.timeToComplete}min
                        </Text>
                      )}
                    </View>
                  </View>
                  <ArrowRight size={20} color="#64748B" strokeWidth={2} />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Skills Needing Work */}
        {skillsNeedingWork.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills to Develop</Text>
            <View style={styles.skillsGrid}>
              {skillsNeedingWork.map(({ skill, level }) => (
                <View key={skill} style={styles.skillCard}>
                  <Text style={styles.skillName}>
                    {skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.skillLevel}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                  <View style={styles.skillProgress}>
                    <View 
                      style={[
                        styles.skillProgressBar, 
                        { width: level === 'beginner' ? '20%' : '40%' }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Conflicts */}
        {recentConflicts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentConflicts.slice(0, 3).map((conflict) => (
              <View key={conflict.id} style={styles.conflictCard}>
                <View style={styles.conflictHeader}>
                  <Text style={styles.conflictType}>
                    {conflict.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Conflict
                  </Text>
                  <View style={[
                    styles.conflictStatus,
                    conflict.status === 'resolved' && styles.conflictStatusResolved,
                    conflict.status === 'active' && styles.conflictStatusActive,
                  ]}>
                    <Text style={[
                      styles.conflictStatusText,
                      conflict.status === 'resolved' && styles.conflictStatusTextResolved,
                      conflict.status === 'active' && styles.conflictStatusTextActive,
                    ]}>
                      {conflict.status.charAt(0).toUpperCase() + conflict.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.conflictContext}>
                  {conflict.relationshipContext.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <Text style={styles.conflictDate}>
                  {new Date(conflict.startDate).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Pressable 
              style={styles.quickAction}
              onPress={() => navigation.navigate('ConflictDashboard')}
            >
              <Target size={24} color="#3B82F6" strokeWidth={2} />
              <Text style={styles.quickActionText}>Conflict Dashboard</Text>
            </Pressable>
            <Pressable 
              style={styles.quickAction}
              onPress={() => setShowProfileManagement(true)}
            >
              <Settings size={24} color="#10B981" strokeWidth={2} />
              <Text style={styles.quickActionText}>Edit Profile</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    gap: 16,
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
    fontSize: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  headerButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  profileJoined: {
    fontSize: 12,
    color: '#64748B',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  insightCard: {
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  insightText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  recommendationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recommendationPriority: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  recommendationTime: {
    fontSize: 12,
    color: '#64748B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  skillLevel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  skillProgress: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  skillProgressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  conflictCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conflictType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  conflictStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  conflictStatusResolved: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  conflictStatusActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  conflictStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  conflictStatusTextResolved: {
    color: '#10B981',
  },
  conflictStatusTextActive: {
    color: '#F59E0B',
  },
  conflictContext: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  conflictDate: {
    fontSize: 12,
    color: '#64748B',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
