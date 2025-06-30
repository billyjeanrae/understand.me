import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../../utils/platform';
import { ResponsiveContainer, ResponsiveGrid } from '../../components/layout/ResponsiveContainer';
import AchievementBadge from '../../components/achievements/AchievementBadge';
import achievementService from '../../services/achievements/achievementService';
import { AchievementProgress, Achievement } from '../../types/achievements';
import { Trophy, Target, TrendingUp, Award, Star, Zap } from 'lucide-react-native';

export default function GrowthScreen() {
  const { spacing, fontSize, isWeb } = useResponsive();
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAchievements();
  }, []);

  const initializeAchievements = async () => {
    try {
      await achievementService.initialize();
      const progress = await achievementService.getAchievementProgress();
      setAchievementProgress(progress);
    } catch (error) {
      console.error('Failed to load achievements:', error);
      Alert.alert('Error', 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'conflict_resolution', name: 'Conflict Resolution', icon: '🕊️' },
    { id: 'communication', name: 'Communication', icon: '💬' },
    { id: 'personal_growth', name: 'Growth', icon: '🌱' },
    { id: 'consistency', name: 'Consistency', icon: '🔥' },
    { id: 'mastery', name: 'Mastery', icon: '🎯' },
  ];

  const getFilteredAchievements = () => {
    if (!achievementProgress) return [];
    
    if (selectedCategory === 'all') {
      return achievementProgress.achievements;
    }
    
    return achievementProgress.achievements.filter(
      achievement => achievement.category === selectedCategory
    );
  };

  const getStatsCards = () => {
    if (!achievementProgress) return [];

    return [
      {
        icon: <Trophy size={24} color="#FFD700" strokeWidth={2} />,
        title: 'Total Points',
        value: achievementProgress.totalPoints.toLocaleString(),
        subtitle: 'Achievement Points',
      },
      {
        icon: <Award size={24} color="#10B981" strokeWidth={2} />,
        title: 'Unlocked',
        value: `${achievementProgress.unlockedCount}/${achievementProgress.achievements.length}`,
        subtitle: 'Achievements',
      },
      {
        icon: <Target size={24} color="#3B82F6" strokeWidth={2} />,
        title: 'Next Goal',
        value: achievementProgress.nextMilestone ? `${Math.round(achievementProgress.nextMilestone.progress)}%` : 'Complete!',
        subtitle: achievementProgress.nextMilestone?.title || 'All Done',
      },
    ];
  };

  // Demo function to test achievements
  const testAchievement = async () => {
    try {
      const newAchievements = await achievementService.recordSessionCompleted(['active_listening', 'empathy'], 4);
      if (newAchievements.length > 0) {
        Alert.alert(
          'Achievement Unlocked! 🎉',
          `You earned: ${newAchievements.map(a => a.title).join(', ')}`,
          [{ text: 'Awesome!', onPress: initializeAchievements }]
        );
      } else {
        Alert.alert('Progress Updated', 'Your session has been recorded!');
        initializeAchievements();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ResponsiveContainer style={styles.content}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { fontSize: fontSize(16) }]}>
              Loading your achievements...
            </Text>
          </View>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  const statsCards = getStatsCards();
  const filteredAchievements = getFilteredAchievements();
  const unlockedAchievements = filteredAchievements.filter(a => a.isUnlocked);
  const lockedAchievements = filteredAchievements.filter(a => !a.isUnlocked);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer style={styles.content}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing(24) }]}>
            <Text style={[styles.title, { fontSize: fontSize(28) }]}>
              Your Growth Journey
            </Text>
            <Text style={[styles.subtitle, { fontSize: fontSize(16) }]}>
              Track your progress and unlock achievements
            </Text>
          </View>

          {/* Stats Cards */}
          <ResponsiveGrid
            columns={{ mobile: 1, tablet: 3, desktop: 3 }}
            gap={spacing(16)}
            style={{ marginBottom: spacing(32) }}
          >
            {statsCards.map((stat, index) => (
              <View key={index} style={[styles.statCard, { padding: spacing(20) }]}>
                <View style={styles.statIcon}>
                  {stat.icon}
                </View>
                <Text style={[styles.statValue, { fontSize: fontSize(24) }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statTitle, { fontSize: fontSize(14) }]}>
                  {stat.title}
                </Text>
                <Text style={[styles.statSubtitle, { fontSize: fontSize(12) }]}>
                  {stat.subtitle}
                </Text>
              </View>
            ))}
          </ResponsiveGrid>

          {/* Recent Achievements */}
          {achievementProgress?.recentUnlocks && achievementProgress.recentUnlocks.length > 0 && (
            <View style={[styles.section, { marginBottom: spacing(32) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(20) }]}>
                🎉 Recent Achievements
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.recentAchievements}>
                  {achievementProgress.recentUnlocks.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="medium"
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Category Filter */}
          <View style={[styles.section, { marginBottom: spacing(24) }]}>
            <Text style={[styles.sectionTitle, { fontSize: fontSize(20) }]}>
              Achievement Categories
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryFilter}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: selectedCategory === category.id ? '#10B981' : '#374151',
                        paddingHorizontal: spacing(16),
                        paddingVertical: spacing(8),
                      }
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryText,
                      {
                        fontSize: fontSize(12),
                        color: selectedCategory === category.id ? '#FFFFFF' : '#D1D5DB'
                      }
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <View style={[styles.section, { marginBottom: spacing(32) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(18) }]}>
                ✅ Unlocked ({unlockedAchievements.length})
              </Text>
              <ResponsiveGrid
                columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                gap={spacing(12)}
              >
                {unlockedAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="medium"
                  />
                ))}
              </ResponsiveGrid>
            </View>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <View style={[styles.section, { marginBottom: spacing(32) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(18) }]}>
                🔒 In Progress ({lockedAchievements.length})
              </Text>
              <ResponsiveGrid
                columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                gap={spacing(12)}
              >
                {lockedAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="medium"
                    showProgress={true}
                  />
                ))}
              </ResponsiveGrid>
            </View>
          )}

          {/* Test Button (Development) */}
          <TouchableOpacity
            style={[styles.testButton, { padding: spacing(16), marginBottom: spacing(32) }]}
            onPress={testAchievement}
          >
            <Zap size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={[styles.testButtonText, { fontSize: fontSize(14) }]}>
              Complete Test Session (Demo)
            </Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
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
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statTitle: {
    color: '#D1D5DB',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  statSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter-Regular',
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  recentAchievements: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  categoryFilter: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
  },
  testButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
});
