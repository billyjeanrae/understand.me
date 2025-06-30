import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, AchievementProgress, UserStats, AchievementNotification } from '../../types/achievements';

const ACHIEVEMENTS_KEY = '@understand_me_achievements';
const USER_STATS_KEY = '@understand_me_user_stats';
const NOTIFICATIONS_KEY = '@understand_me_achievement_notifications';

// Predefined achievements
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'isUnlocked' | 'unlockedAt'>[] = [
  // Conflict Resolution
  {
    id: 'first_session',
    title: 'First Steps',
    description: 'Complete your first conflict resolution session',
    icon: '🌱',
    category: 'conflict_resolution',
    difficulty: 'bronze',
    points: 10,
    requirements: [{ type: 'sessions_completed', target: 1, current: 0 }],
  },
  {
    id: 'session_streak_7',
    title: 'Week Warrior',
    description: 'Complete sessions for 7 consecutive days',
    icon: '🔥',
    category: 'consistency',
    difficulty: 'silver',
    points: 50,
    requirements: [{ type: 'streak_days', target: 7, current: 0 }],
  },
  {
    id: 'conflicts_resolved_10',
    title: 'Peacemaker',
    description: 'Successfully resolve 10 conflicts',
    icon: '🕊️',
    category: 'conflict_resolution',
    difficulty: 'silver',
    points: 75,
    requirements: [{ type: 'conflicts_resolved', target: 10, current: 0 }],
  },
  {
    id: 'voice_pioneer',
    title: 'Voice Pioneer',
    description: 'Complete your first voice-enabled session',
    icon: '🎤',
    category: 'communication',
    difficulty: 'bronze',
    points: 20,
    requirements: [{ type: 'voice_sessions', target: 1, current: 0 }],
  },
  {
    id: 'personality_explorer',
    title: 'Self-Discovery',
    description: 'Complete your personality assessment',
    icon: '🧠',
    category: 'personal_growth',
    difficulty: 'bronze',
    points: 30,
    requirements: [{ type: 'personality_assessment', target: 1, current: 0 }],
  },
  {
    id: 'skill_master',
    title: 'Skill Collector',
    description: 'Use 15 different conflict resolution skills',
    icon: '🎯',
    category: 'mastery',
    difficulty: 'gold',
    points: 100,
    requirements: [{ type: 'skills_used', target: 15, current: 0 }],
  },
  {
    id: 'improvement_champion',
    title: 'Growth Champion',
    description: 'Achieve an improvement score of 80 or higher',
    icon: '📈',
    category: 'personal_growth',
    difficulty: 'gold',
    points: 150,
    requirements: [{ type: 'improvement_score', target: 80, current: 0 }],
  },
  {
    id: 'session_marathon',
    title: 'Marathon Runner',
    description: 'Complete 50 conflict resolution sessions',
    icon: '🏃‍♂️',
    category: 'consistency',
    difficulty: 'platinum',
    points: 200,
    requirements: [{ type: 'sessions_completed', target: 50, current: 0 }],
  },
  {
    id: 'master_communicator',
    title: 'Master Communicator',
    description: 'Complete 25 voice-enabled sessions',
    icon: '����️',
    category: 'communication',
    difficulty: 'gold',
    points: 125,
    requirements: [{ type: 'voice_sessions', target: 25, current: 0 }],
  },
  {
    id: 'streak_legend',
    title: 'Consistency Legend',
    description: 'Maintain a 30-day session streak',
    icon: '👑',
    category: 'consistency',
    difficulty: 'platinum',
    points: 300,
    requirements: [{ type: 'streak_days', target: 30, current: 0 }],
  },
];

class AchievementService {
  private achievements: Achievement[] = [];
  private userStats: UserStats = this.getDefaultUserStats();
  private notifications: AchievementNotification[] = [];

  async initialize(): Promise<void> {
    try {
      await this.loadAchievements();
      await this.loadUserStats();
      await this.loadNotifications();
      this.initializeAchievements();
    } catch (error) {
      console.error('Failed to initialize achievement service:', error);
    }
  }

  private getDefaultUserStats(): UserStats {
    return {
      sessionsCompleted: 0,
      conflictsResolved: 0,
      skillsUsed: [],
      streakDays: 0,
      improvementScore: 0,
      voiceSessionsCount: 0,
      personalityAssessmentCompleted: false,
      totalTimeSpent: 0,
      averageSessionRating: 0,
    };
  }

  private initializeAchievements(): void {
    if (this.achievements.length === 0) {
      this.achievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
        ...def,
        progress: 0,
        isUnlocked: false,
        requirements: def.requirements.map(req => ({ ...req, current: 0 })),
      }));
      this.saveAchievements();
    }
  }

  async getAchievementProgress(): Promise<AchievementProgress> {
    const unlockedAchievements = this.achievements.filter(a => a.isUnlocked);
    const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
    const recentUnlocks = unlockedAchievements
      .filter(a => a.unlockedAt && Date.now() - a.unlockedAt.getTime() < 7 * 24 * 60 * 60 * 1000)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, 5);

    const nextMilestone = this.achievements
      .filter(a => !a.isUnlocked)
      .sort((a, b) => b.progress - a.progress)[0];

    return {
      userId: 'current_user', // TODO: Get from auth
      achievements: this.achievements,
      totalPoints,
      unlockedCount: unlockedAchievements.length,
      recentUnlocks,
      nextMilestone,
    };
  }

  async updateUserStats(updates: Partial<UserStats>): Promise<Achievement[]> {
    this.userStats = { ...this.userStats, ...updates };
    await this.saveUserStats();

    // Update achievement progress
    const newlyUnlocked = await this.updateAchievementProgress();
    
    // Create notifications for newly unlocked achievements
    for (const achievement of newlyUnlocked) {
      await this.createAchievementNotification(achievement);
    }

    return newlyUnlocked;
  }

  private async updateAchievementProgress(): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (achievement.isUnlocked) continue;

      let allRequirementsMet = true;
      let totalProgress = 0;

      for (const requirement of achievement.requirements) {
        let current = 0;

        switch (requirement.type) {
          case 'sessions_completed':
            current = this.userStats.sessionsCompleted;
            break;
          case 'conflicts_resolved':
            current = this.userStats.conflictsResolved;
            break;
          case 'skills_used':
            current = this.userStats.skillsUsed.length;
            break;
          case 'streak_days':
            current = this.userStats.streakDays;
            break;
          case 'improvement_score':
            current = this.userStats.improvementScore;
            break;
          case 'voice_sessions':
            current = this.userStats.voiceSessionsCount;
            break;
          case 'personality_assessment':
            current = this.userStats.personalityAssessmentCompleted ? 1 : 0;
            break;
        }

        requirement.current = current;
        const progress = Math.min(100, (current / requirement.target) * 100);
        totalProgress += progress;

        if (current < requirement.target) {
          allRequirementsMet = false;
        }
      }

      achievement.progress = totalProgress / achievement.requirements.length;

      if (allRequirementsMet && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        achievement.isNew = true;
        newlyUnlocked.push(achievement);
      }
    }

    if (newlyUnlocked.length > 0) {
      await this.saveAchievements();
    }

    return newlyUnlocked;
  }

  private async createAchievementNotification(achievement: Achievement): Promise<void> {
    const notification: AchievementNotification = {
      id: `notif_${achievement.id}_${Date.now()}`,
      achievementId: achievement.id,
      title: `Achievement Unlocked! ${achievement.icon}`,
      message: `You've earned "${achievement.title}" - ${achievement.description}`,
      timestamp: new Date(),
      isRead: false,
      celebrationLevel: achievement.difficulty === 'platinum' ? 'epic' : 
                      achievement.difficulty === 'gold' ? 'special' : 'normal',
    };

    this.notifications.unshift(notification);
    await this.saveNotifications();

    // Also create a notification in the notification service
    try {
      const { notificationService } = await import('../notifications/notificationService');
      await notificationService.createAchievementNotification(achievement.title, achievement.points);
    } catch (error) {
      console.error('Failed to create notification service notification:', error);
    }
  }

  async getNotifications(): Promise<AchievementNotification[]> {
    return this.notifications;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      await this.saveNotifications();
    }
  }

  async markAchievementAsViewed(achievementId: string): Promise<void> {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement) {
      achievement.isNew = false;
      await this.saveAchievements();
    }
  }

  // Storage methods
  private async loadAchievements(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      if (data) {
        const achievements = JSON.parse(data);
        this.achievements = achievements.map((a: any) => ({
          ...a,
          unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
        }));
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  }

  private async saveAchievements(): Promise<void> {
    try {
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(this.achievements));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }

  private async loadUserStats(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(USER_STATS_KEY);
      if (data) {
        const stats = JSON.parse(data);
        this.userStats = {
          ...this.getDefaultUserStats(),
          ...stats,
          lastSessionDate: stats.lastSessionDate ? new Date(stats.lastSessionDate) : undefined,
        };
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  }

  private async saveUserStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_STATS_KEY, JSON.stringify(this.userStats));
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  }

  private async loadNotifications(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (data) {
        const notifications = JSON.parse(data);
        this.notifications = notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  private async saveNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Utility methods for easy stat updates
  async recordSessionCompleted(skillsUsed: string[] = [], rating: number = 0): Promise<Achievement[]> {
    const updates: Partial<UserStats> = {
      sessionsCompleted: this.userStats.sessionsCompleted + 1,
      skillsUsed: [...new Set([...this.userStats.skillsUsed, ...skillsUsed])],
      lastSessionDate: new Date(),
    };

    if (rating > 0) {
      const totalRatings = this.userStats.sessionsCompleted;
      updates.averageSessionRating = 
        (this.userStats.averageSessionRating * totalRatings + rating) / (totalRatings + 1);
    }

    return this.updateUserStats(updates);
  }

  async recordConflictResolved(): Promise<Achievement[]> {
    return this.updateUserStats({
      conflictsResolved: this.userStats.conflictsResolved + 1,
    });
  }

  async recordVoiceSession(): Promise<Achievement[]> {
    return this.updateUserStats({
      voiceSessionsCount: this.userStats.voiceSessionsCount + 1,
    });
  }

  async recordPersonalityAssessment(): Promise<Achievement[]> {
    return this.updateUserStats({
      personalityAssessmentCompleted: true,
    });
  }

  async updateStreak(days: number): Promise<Achievement[]> {
    return this.updateUserStats({
      streakDays: days,
    });
  }

  async updateImprovementScore(score: number): Promise<Achievement[]> {
    return this.updateUserStats({
      improvementScore: score,
    });
  }
}

export const achievementService = new AchievementService();
export default achievementService;
