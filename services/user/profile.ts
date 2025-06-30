/**
 * User Profile Service
 * Manages user profile data, preferences, and conflict history
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserProfile, 
  UserProfileUpdate, 
  ProfileAnalytics,
  ConflictSummary,
  ConflictSkill,
  SkillLevel,
  PersonalizationRecommendation,
  UserPreferences,
  ConflictType,
  RelationshipContext
} from '../../types/user';

const PROFILE_STORAGE_KEY = '@understand_me_user_profile';
const PROFILE_ANALYTICS_KEY = '@understand_me_profile_analytics';

class UserProfileService {
  private profile: UserProfile | null = null;
  private analytics: ProfileAnalytics | null = null;

  /**
   * Initialize user profile service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadProfile();
      await this.loadAnalytics();
    } catch (error) {
      console.error('Failed to initialize user profile service:', error);
    }
  }

  /**
   * Create a new user profile
   */
  async createProfile(
    userId: string,
    email: string,
    name: string,
    initialData?: Partial<UserProfile>
  ): Promise<UserProfile> {
    const now = new Date();
    
    const defaultProfile: UserProfile = {
      id: userId,
      email,
      name,
      createdAt: now,
      updatedAt: now,
      personalInfo: {
        primaryLanguage: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      conflictPreferences: {
        preferredApproach: 'collaborative',
        communicationPreference: 'balanced',
        emotionalProcessingStyle: 'balanced',
        mediationStyle: 'guided',
        sessionDuration: 'medium',
        triggerTopics: [],
        strengths: [],
        improvementAreas: [],
      },
      communicationStyle: {
        preferredMode: 'mixed',
        voiceSettings: {
          speechRate: 1.0,
          volume: 0.8,
        },
        textPreferences: {
          formality: 'adaptive',
          responseLength: 'adaptive',
          useEmojis: true,
        },
        aiInteractionStyle: {
          personality: 'empathetic',
          interventionLevel: 'moderate',
          feedbackStyle: 'encouraging',
        },
      },
      learningPatterns: {
        learningStyle: 'mixed',
        skillProgress: this.initializeSkillProgress(),
        successfulStrategies: [],
        commonChallenges: [],
        adaptationRate: 'moderate',
        retentionStrength: 'medium',
        preferredActivities: [],
      },
      conflictHistory: {
        totalConflicts: 0,
        resolvedConflicts: 0,
        resolutionRate: 0,
        averageResolutionTime: 0,
        conflictTypes: {} as Record<ConflictType, number>,
        relationshipContexts: {} as Record<RelationshipContext, number>,
        recentConflicts: [],
        resolutionTrends: [],
        emotionalPatterns: [],
      },
      personalizationSettings: {
        notifications: {
          conflictReminders: true,
          progressUpdates: true,
          tipOfTheDay: true,
          weeklyInsights: true,
        },
        privacy: {
          shareAnonymousData: false,
          allowResearchParticipation: false,
          dataRetentionPeriod: 365,
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          screenReader: false,
          reducedMotion: false,
        },
        customization: {
          theme: 'auto',
          primaryColor: '#3B82F6',
          dashboardLayout: 'detailed',
        },
      },
      ...initialData,
    };

    this.profile = defaultProfile;
    await this.saveProfile();
    await this.updateAnalytics();
    
    return defaultProfile;
  }

  /**
   * Get current user profile
   */
  getProfile(): UserProfile | null {
    return this.profile;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: UserProfileUpdate): Promise<UserProfile> {
    if (!this.profile) {
      throw new Error('No profile found. Create profile first.');
    }

    const updatedProfile: UserProfile = {
      ...this.profile,
      ...updates,
      updatedAt: new Date(),
    };

    // Deep merge nested objects
    if (updates.personalInfo) {
      updatedProfile.personalInfo = {
        ...this.profile.personalInfo,
        ...updates.personalInfo,
      };
    }

    if (updates.conflictPreferences) {
      updatedProfile.conflictPreferences = {
        ...this.profile.conflictPreferences,
        ...updates.conflictPreferences,
      };
    }

    if (updates.communicationStyle) {
      updatedProfile.communicationStyle = {
        ...this.profile.communicationStyle,
        ...updates.communicationStyle,
        voiceSettings: {
          ...this.profile.communicationStyle.voiceSettings,
          ...updates.communicationStyle.voiceSettings,
        },
        textPreferences: {
          ...this.profile.communicationStyle.textPreferences,
          ...updates.communicationStyle.textPreferences,
        },
        aiInteractionStyle: {
          ...this.profile.communicationStyle.aiInteractionStyle,
          ...updates.communicationStyle.aiInteractionStyle,
        },
      };
    }

    if (updates.personalizationSettings) {
      updatedProfile.personalizationSettings = {
        ...this.profile.personalizationSettings,
        ...updates.personalizationSettings,
        notifications: {
          ...this.profile.personalizationSettings.notifications,
          ...updates.personalizationSettings.notifications,
        },
        privacy: {
          ...this.profile.personalizationSettings.privacy,
          ...updates.personalizationSettings.privacy,
        },
        accessibility: {
          ...this.profile.personalizationSettings.accessibility,
          ...updates.personalizationSettings.accessibility,
        },
        customization: {
          ...this.profile.personalizationSettings.customization,
          ...updates.personalizationSettings.customization,
        },
      };
    }

    this.profile = updatedProfile;
    await this.saveProfile();
    await this.updateAnalytics();

    return updatedProfile;
  }

  /**
   * Add conflict to user history
   */
  async addConflictToHistory(conflict: ConflictSummary): Promise<void> {
    if (!this.profile) return;

    const updatedHistory = { ...this.profile.conflictHistory };
    
    // Add to recent conflicts
    updatedHistory.recentConflicts = [
      conflict,
      ...updatedHistory.recentConflicts.slice(0, 9) // Keep last 10
    ];

    // Update totals
    updatedHistory.totalConflicts += 1;
    if (conflict.status === 'resolved') {
      updatedHistory.resolvedConflicts += 1;
    }

    // Update resolution rate
    updatedHistory.resolutionRate = 
      updatedHistory.totalConflicts > 0 
        ? (updatedHistory.resolvedConflicts / updatedHistory.totalConflicts) * 100 
        : 0;

    // Update conflict type counts
    updatedHistory.conflictTypes[conflict.type] = 
      (updatedHistory.conflictTypes[conflict.type] || 0) + 1;

    // Update relationship context counts
    updatedHistory.relationshipContexts[conflict.relationshipContext] = 
      (updatedHistory.relationshipContexts[conflict.relationshipContext] || 0) + 1;

    await this.updateProfile({ 
      conflictHistory: updatedHistory 
    });
  }

  /**
   * Update skill progress
   */
  async updateSkillProgress(skill: ConflictSkill, level: SkillLevel): Promise<void> {
    if (!this.profile) return;

    const updatedLearningPatterns = {
      ...this.profile.learningPatterns,
      skillProgress: {
        ...this.profile.learningPatterns.skillProgress,
        [skill]: level,
      },
    };

    await this.updateProfile({ 
      learningPatterns: updatedLearningPatterns 
    });
  }

  /**
   * Get user preferences (quick access)
   */
  getUserPreferences(): UserPreferences | null {
    if (!this.profile) return null;

    return {
      preferredApproach: this.profile.conflictPreferences.preferredApproach,
      communicationMode: this.profile.communicationStyle.preferredMode,
      aiPersonality: this.profile.communicationStyle.aiInteractionStyle.personality,
      sessionDuration: this.profile.conflictPreferences.sessionDuration,
      notificationsEnabled: this.profile.personalizationSettings.notifications.conflictReminders,
    };
  }

  /**
   * Get profile analytics
   */
  getAnalytics(): ProfileAnalytics | null {
    return this.analytics;
  }

  /**
   * Generate personalization recommendations
   */
  async generateRecommendations(): Promise<PersonalizationRecommendation[]> {
    if (!this.profile || !this.analytics) return [];

    const recommendations: PersonalizationRecommendation[] = [];

    // Skill development recommendations
    const skillsNeedingWork = this.getSkillsNeedingImprovement();
    skillsNeedingWork.forEach((skill, index) => {
      recommendations.push({
        id: `skill_${skill}_${Date.now()}`,
        type: 'skill_development',
        title: `Improve ${skill.replace('_', ' ')} skills`,
        description: `Focus on developing your ${skill.replace('_', ' ')} abilities`,
        reasoning: `Your current level in ${skill.replace('_', ' ')} could benefit from improvement`,
        priority: index < 2 ? 'high' : 'medium',
        estimatedImpact: 8,
        timeToComplete: 30,
        relatedSkills: [skill],
        actionItems: this.getSkillActionItems(skill),
      });
    });

    // Communication style recommendations
    if (this.analytics.engagementScore < 70) {
      recommendations.push({
        id: `communication_${Date.now()}`,
        type: 'communication_style',
        title: 'Optimize your communication preferences',
        description: 'Adjust your communication settings for better engagement',
        reasoning: 'Your current engagement score suggests room for improvement',
        priority: 'medium',
        estimatedImpact: 6,
        timeToComplete: 15,
        relatedSkills: ['communication'],
        actionItems: [
          'Review your preferred communication mode',
          'Adjust AI interaction style',
          'Update response length preferences',
        ],
      });
    }

    // Learning activity recommendations
    const preferredActivities = this.profile.learningPatterns.preferredActivities;
    if (preferredActivities.length < 3) {
      recommendations.push({
        id: `learning_${Date.now()}`,
        type: 'learning_activity',
        title: 'Explore new learning activities',
        description: 'Try different learning approaches to enhance your growth',
        reasoning: 'Diversifying learning activities can improve skill development',
        priority: 'low',
        estimatedImpact: 5,
        timeToComplete: 20,
        relatedSkills: ['emotional_awareness', 'problem_solving'],
        actionItems: [
          'Try guided meditation exercises',
          'Practice role-playing scenarios',
          'Complete reflection exercises',
        ],
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Private helper methods
   */
  private async loadProfile(): Promise<void> {
    try {
      const profileData = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (profileData) {
        this.profile = JSON.parse(profileData);
        // Convert date strings back to Date objects
        if (this.profile) {
          this.profile.createdAt = new Date(this.profile.createdAt);
          this.profile.updatedAt = new Date(this.profile.updatedAt);
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  private async saveProfile(): Promise<void> {
    try {
      if (this.profile) {
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(this.profile));
      }
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  private async loadAnalytics(): Promise<void> {
    try {
      const analyticsData = await AsyncStorage.getItem(PROFILE_ANALYTICS_KEY);
      if (analyticsData) {
        this.analytics = JSON.parse(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load profile analytics:', error);
    }
  }

  private async updateAnalytics(): Promise<void> {
    if (!this.profile) return;

    const completeness = this.calculateProfileCompleteness();
    const engagement = this.calculateEngagementScore();
    const learningProgress = this.calculateLearningProgress();
    const improvement = this.calculateConflictResolutionImprovement();

    this.analytics = {
      profileCompleteness: completeness,
      engagementScore: engagement,
      learningProgress: learningProgress,
      conflictResolutionImprovement: improvement,
      recommendedActions: await this.generateRecommendedActions(),
      personalizedInsights: this.generatePersonalizedInsights(),
    };

    try {
      await AsyncStorage.setItem(PROFILE_ANALYTICS_KEY, JSON.stringify(this.analytics));
    } catch (error) {
      console.error('Failed to save profile analytics:', error);
    }
  }

  private initializeSkillProgress(): Record<ConflictSkill, SkillLevel> {
    const skills: ConflictSkill[] = [
      'active_listening', 'emotional_awareness', 'assertiveness', 'empathy',
      'problem_solving', 'communication', 'conflict_de_escalation',
      'boundary_setting', 'compromise', 'perspective_taking',
      'emotional_regulation', 'negotiation'
    ];

    const progress: Record<ConflictSkill, SkillLevel> = {} as Record<ConflictSkill, SkillLevel>;
    skills.forEach(skill => {
      progress[skill] = 'beginner';
    });

    return progress;
  }

  private calculateProfileCompleteness(): number {
    if (!this.profile) return 0;

    let completedFields = 0;
    let totalFields = 0;

    // Personal info fields
    const personalFields = ['age', 'occupation', 'relationshipStatus', 'hasChildren'];
    personalFields.forEach(field => {
      totalFields++;
      if (this.profile!.personalInfo[field as keyof typeof this.profile.personalInfo] !== undefined) {
        completedFields++;
      }
    });

    // Conflict preferences
    totalFields += 3; // strengths, improvementAreas, triggerTopics
    if (this.profile.conflictPreferences.strengths.length > 0) completedFields++;
    if (this.profile.conflictPreferences.improvementAreas.length > 0) completedFields++;
    if (this.profile.conflictPreferences.triggerTopics.length > 0) completedFields++;

    // Learning patterns
    totalFields += 2; // successfulStrategies, preferredActivities
    if (this.profile.learningPatterns.successfulStrategies.length > 0) completedFields++;
    if (this.profile.learningPatterns.preferredActivities.length > 0) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }

  private calculateEngagementScore(): number {
    if (!this.profile) return 0;

    let score = 50; // Base score

    // Conflict activity
    const recentActivity = this.profile.conflictHistory.recentConflicts.length;
    score += Math.min(recentActivity * 10, 30);

    // Profile completeness bonus
    const completeness = this.calculateProfileCompleteness();
    score += completeness * 0.2;

    return Math.min(Math.round(score), 100);
  }

  private calculateLearningProgress(): number {
    if (!this.profile) return 0;

    const skillLevels = Object.values(this.profile.learningPatterns.skillProgress);
    const levelValues = { beginner: 1, developing: 2, proficient: 3, advanced: 4, expert: 5 };
    
    const totalProgress = skillLevels.reduce((sum, level) => sum + levelValues[level], 0);
    const maxProgress = skillLevels.length * 5;

    return Math.round((totalProgress / maxProgress) * 100);
  }

  private calculateConflictResolutionImprovement(): number {
    if (!this.profile || this.profile.conflictHistory.resolutionTrends.length < 2) return 0;

    const trends = this.profile.conflictHistory.resolutionTrends;
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];

    const improvementRate = 
      ((latest.satisfactionAverage - previous.satisfactionAverage) / previous.satisfactionAverage) * 100;

    return Math.round(Math.max(-50, Math.min(50, improvementRate)));
  }

  private async generateRecommendedActions(): Promise<string[]> {
    const actions: string[] = [];

    if (!this.profile) return actions;

    // Profile completion actions
    if (this.calculateProfileCompleteness() < 80) {
      actions.push('Complete your profile for better personalization');
    }

    // Skill development actions
    const skillsToImprove = this.getSkillsNeedingImprovement();
    if (skillsToImprove.length > 0) {
      actions.push(`Focus on improving ${skillsToImprove[0].replace('_', ' ')} skills`);
    }

    // Engagement actions
    if (this.profile.conflictHistory.totalConflicts === 0) {
      actions.push('Try the conflict assessment tool to get started');
    }

    return actions.slice(0, 5); // Limit to 5 actions
  }

  private generatePersonalizedInsights(): string[] {
    const insights: string[] = [];

    if (!this.profile) return insights;

    // Resolution rate insights
    const resolutionRate = this.profile.conflictHistory.resolutionRate;
    if (resolutionRate > 80) {
      insights.push('You have an excellent conflict resolution success rate!');
    } else if (resolutionRate > 60) {
      insights.push('Your conflict resolution skills are developing well.');
    } else if (resolutionRate > 0) {
      insights.push('There\'s room to improve your conflict resolution approach.');
    }

    // Communication style insights
    const commStyle = this.profile.communicationStyle.preferredMode;
    if (commStyle === 'voice') {
      insights.push('You prefer voice communication - great for building emotional connection.');
    } else if (commStyle === 'text') {
      insights.push('Text communication allows you to think through responses carefully.');
    }

    // Learning pattern insights
    const learningStyle = this.profile.learningPatterns.learningStyle;
    if (learningStyle === 'visual') {
      insights.push('Visual learning activities might be most effective for you.');
    }

    return insights.slice(0, 3); // Limit to 3 insights
  }

  private getSkillsNeedingImprovement(): ConflictSkill[] {
    if (!this.profile) return [];

    const skillProgress = this.profile.learningPatterns.skillProgress;
    const needsWork: ConflictSkill[] = [];

    Object.entries(skillProgress).forEach(([skill, level]) => {
      if (level === 'beginner' || level === 'developing') {
        needsWork.push(skill as ConflictSkill);
      }
    });

    return needsWork.slice(0, 3); // Top 3 skills needing work
  }

  private getSkillActionItems(skill: ConflictSkill): string[] {
    const actionMap: Record<ConflictSkill, string[]> = {
      active_listening: [
        'Practice summarizing what others say',
        'Focus on listening without planning your response',
        'Ask clarifying questions',
      ],
      emotional_awareness: [
        'Keep an emotion journal',
        'Practice identifying emotions in the moment',
        'Learn emotion regulation techniques',
      ],
      assertiveness: [
        'Practice "I" statements',
        'Set clear boundaries',
        'Express needs directly but respectfully',
      ],
      empathy: [
        'Try perspective-taking exercises',
        'Practice emotional validation',
        'Listen for underlying feelings',
      ],
      problem_solving: [
        'Break problems into smaller parts',
        'Brainstorm multiple solutions',
        'Evaluate pros and cons systematically',
      ],
      communication: [
        'Practice clear, direct communication',
        'Work on non-verbal communication',
        'Learn to ask better questions',
      ],
      conflict_de_escalation: [
        'Learn calming techniques',
        'Practice staying neutral',
        'Focus on common ground',
      ],
      boundary_setting: [
        'Identify your limits',
        'Practice saying no respectfully',
        'Communicate boundaries clearly',
      ],
      compromise: [
        'Look for win-win solutions',
        'Practice flexibility',
        'Focus on shared interests',
      ],
      perspective_taking: [
        'Try to see situations from others\' viewpoints',
        'Ask about others\' experiences',
        'Challenge your assumptions',
      ],
      emotional_regulation: [
        'Practice deep breathing',
        'Learn mindfulness techniques',
        'Develop healthy coping strategies',
      ],
      negotiation: [
        'Prepare for difficult conversations',
        'Focus on interests, not positions',
        'Practice finding mutual benefits',
      ],
    };

    return actionMap[skill] || ['Practice this skill regularly', 'Seek feedback from others', 'Reflect on your progress'];
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();
export default userProfileService;

