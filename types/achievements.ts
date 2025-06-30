export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  requirements: AchievementRequirement[];
  unlockedAt?: Date;
  progress: number; // 0-100
  isUnlocked: boolean;
  isNew?: boolean;
}

export interface AchievementRequirement {
  type: 'sessions_completed' | 'conflicts_resolved' | 'skills_used' | 'streak_days' | 'improvement_score' | 'voice_sessions' | 'personality_assessment';
  target: number;
  current: number;
}

export type AchievementCategory = 
  | 'conflict_resolution'
  | 'communication'
  | 'emotional_intelligence'
  | 'personal_growth'
  | 'consistency'
  | 'mastery'
  | 'social';

export interface AchievementProgress {
  userId: string;
  achievements: Achievement[];
  totalPoints: number;
  unlockedCount: number;
  recentUnlocks: Achievement[];
  nextMilestone?: Achievement;
}

export interface AchievementNotification {
  id: string;
  achievementId: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  celebrationLevel: 'normal' | 'special' | 'epic';
}

export interface UserStats {
  sessionsCompleted: number;
  conflictsResolved: number;
  skillsUsed: string[];
  streakDays: number;
  improvementScore: number;
  voiceSessionsCount: number;
  personalityAssessmentCompleted: boolean;
  totalTimeSpent: number; // in minutes
  averageSessionRating: number;
  lastSessionDate?: Date;
}
