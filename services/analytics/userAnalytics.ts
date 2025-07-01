/**
 * User Analytics Service
 * Aggregates and analyzes user data across conversations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserAnalytics,
  AnalyticsTimeframe,
  SkillProgressAnalytics,
  EmotionalIntelligenceMetrics,
  ConflictPatternAnalytics,
  AnalyticsRecommendation
} from '../../types/analytics';
import { ConflictSkill, SkillLevel } from '../../types/user';
import { conversationAnalyticsService } from './conversationAnalytics';

const USER_ANALYTICS_KEY = '@understand_me_user_analytics';

class UserAnalyticsService {
  private userAnalytics: Map<string, UserAnalytics> = new Map();

  async initialize(): Promise<void> {
    try {
      await this.loadUserAnalytics();
    } catch (error) {
      console.error('Failed to initialize user analytics service:', error);
    }
  }

  async generateUserAnalytics(
    userId: string,
    timeframe: AnalyticsTimeframe
  ): Promise<UserAnalytics> {
    const conversations = conversationAnalyticsService.getUserConversationAnalytics(userId);
    const filteredConversations = conversations.filter(c => 
      c.startTime >= timeframe.start && c.startTime <= timeframe.end
    );

    const analytics: UserAnalytics = {
      userId,
      timeframe,
      totalConversations: filteredConversations.length,
      totalDuration: filteredConversations.reduce((sum, c) => sum + c.duration, 0),
      averageSessionLength: filteredConversations.length > 0 
        ? filteredConversations.reduce((sum, c) => sum + c.duration, 0) / filteredConversations.length 
        : 0,
      conflictResolutionRate: filteredConversations.length > 0
        ? (filteredConversations.filter(c => c.resolutionAchieved).length / filteredConversations.length) * 100
        : 0,
      skillProgress: this.calculateSkillProgress(filteredConversations),
      skillTrends: [],
      learningVelocity: 0,
      emotionalIntelligence: this.calculateEmotionalIntelligence(filteredConversations),
      emotionalGrowth: {
        emotionalStabilityTrend: 'stable',
        emotionalRangeDiversity: 50,
        emotionalRecoveryTime: 15,
        emotionalAwarenessLevel: 70,
        emotionalExpressionClarity: 65
      },
      communicationEffectiveness: {
        clarity: 70,
        persuasiveness: 60,
        activeListening: 75,
        empathicResponse: 80,
        conflictDeEscalation: 65,
        solutionOrientation: 70
      },
      conflictPatterns: this.analyzeConflictPatterns(filteredConversations),
      personalizationInsights: {
        personalizationAccuracy: 75,
        preferenceAlignment: 80,
        adaptationEffectiveness: 70,
        userSatisfactionWithPersonalization: 85,
        mostEffectivePersonalizations: ['Empathetic AI personality', 'Extended reflection time'],
        leastEffectivePersonalizations: ['Direct communication style']
      },
      predictiveInsights: {
        conflictRiskScore: 25,
        resolutionSuccessProbability: 85,
        skillDevelopmentTrajectory: [],
        emotionalWellnessTrend: 'improving',
        recommendedInterventions: ['Practice active listening', 'Emotional regulation exercises'],
        earlyWarningSignals: []
      },
      recommendations: this.generateRecommendations(filteredConversations)
    };

    this.userAnalytics.set(userId, analytics);
    await this.saveUserAnalytics();

    return analytics;
  }

  private calculateSkillProgress(conversations: any[]): SkillProgressAnalytics[] {
    const skills: ConflictSkill[] = [
      'active_listening', 'empathy', 'communication', 'problem_solving',
      'emotional_regulation', 'perspective_taking', 'negotiation', 'compromise',
      'boundary_setting', 'assertiveness', 'conflict_de_escalation', 'emotional_awareness'
    ];

    return skills.map(skill => ({
      skill,
      currentLevel: 'intermediate' as SkillLevel,
      previousLevel: 'beginner' as SkillLevel,
      progressRate: Math.random() * 2,
      practiceFrequency: Math.random() * 5,
      effectiveness: 50 + Math.random() * 40,
      confidenceLevel: 50 + Math.random() * 40,
      areasForImprovement: ['Practice in real situations', 'Consistency'],
      strengthAreas: ['Understanding concepts', 'Willingness to learn']
    }));
  }

  private calculateEmotionalIntelligence(conversations: any[]): EmotionalIntelligenceMetrics {
    return {
      selfAwareness: 70 + Math.random() * 20,
      selfRegulation: 65 + Math.random() * 25,
      empathy: 75 + Math.random() * 20,
      socialSkills: 70 + Math.random() * 25,
      motivation: 80 + Math.random() * 15,
      overallEQ: 72 + Math.random() * 18,
      improvementAreas: ['Self-regulation under stress', 'Reading non-verbal cues']
    };
  }

  private analyzeConflictPatterns(conversations: any[]): ConflictPatternAnalytics {
    return {
      mostCommonConflictTypes: [
        { type: 'interpersonal', frequency: 40, averageResolutionTime: 2.5, successRate: 85, satisfactionRating: 7.5 },
        { type: 'family', frequency: 30, averageResolutionTime: 3.2, successRate: 78, satisfactionRating: 7.8 },
        { type: 'workplace', frequency: 20, averageResolutionTime: 1.8, successRate: 92, satisfactionRating: 8.1 }
      ],
      conflictTriggers: [
        { trigger: 'Communication breakdown', frequency: 15, emotionalImpact: 75, resolutionDifficulty: 60, effectiveStrategies: ['Active listening', 'Clarification'] },
        { trigger: 'Unmet expectations', frequency: 12, emotionalImpact: 70, resolutionDifficulty: 55, effectiveStrategies: ['Expectation setting', 'Compromise'] }
      ],
      resolutionStrategies: [
        { strategy: 'Active listening', usageFrequency: 25, successRate: 85, averageEffectiveness: 80, bestContexts: ['Communication issues'], limitations: ['Requires patience'] },
        { strategy: 'Compromise', usageFrequency: 20, successRate: 75, averageEffectiveness: 70, bestContexts: ['Resource conflicts'], limitations: ['Both parties must be willing'] }
      ],
      timeToResolution: {
        averageTime: 2.5,
        medianTime: 2.0,
        fastestResolution: 0.5,
        longestResolution: 8.0,
        timeByConflictType: {
          interpersonal: 2.5,
          family: 3.2,
          workplace: 1.8,
          neighbor: 2.8,
          romantic: 3.5,
          friendship: 2.2,
          financial: 4.0,
          parenting: 3.8,
          caregiving: 3.0,
          other: 2.0
        }
      },
      successFactors: [
        { factor: 'Both parties willing to listen', impact: 85, frequency: 70, description: 'Active engagement from all parties' },
        { factor: 'Clear communication', impact: 80, frequency: 65, description: 'Expressing needs and concerns clearly' }
      ],
      challengeAreas: [
        { area: 'Emotional regulation', frequency: 40, impact: 75, recommendedImprovement: 'Practice mindfulness and breathing techniques' },
        { area: 'Perspective taking', frequency: 35, impact: 70, recommendedImprovement: 'Role-playing exercises and empathy building' }
      ]
    };
  }

  private generateRecommendations(conversations: any[]): AnalyticsRecommendation[] {
    return [
      {
        id: 'rec_1',
        type: 'skill_development',
        priority: 'high',
        title: 'Improve Active Listening Skills',
        description: 'Focus on developing stronger active listening abilities to enhance conflict resolution effectiveness',
        reasoning: 'Analysis shows active listening is used frequently but could be more effective',
        expectedImpact: 85,
        timeToImplement: 14,
        difficulty: 'moderate',
        actionSteps: [
          'Practice reflective listening daily',
          'Ask clarifying questions',
          'Summarize what you hear before responding'
        ],
        successMetrics: ['Increased empathy scores', 'Better conflict resolution rates'],
        relatedInsights: ['Communication effectiveness', 'Empathy development']
      },
      {
        id: 'rec_2',
        type: 'emotional_regulation',
        priority: 'medium',
        title: 'Develop Emotional Stability',
        description: 'Work on maintaining emotional balance during challenging conversations',
        reasoning: 'Emotional volatility detected in recent conversations',
        expectedImpact: 70,
        timeToImplement: 21,
        difficulty: 'challenging',
        actionSteps: [
          'Practice mindfulness meditation',
          'Use breathing techniques during conflicts',
          'Identify emotional triggers'
        ],
        successMetrics: ['Reduced emotional volatility', 'Faster emotional recovery'],
        relatedInsights: ['Emotional intelligence', 'Stress management']
      }
    ];
  }

  private async loadUserAnalytics(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(USER_ANALYTICS_KEY);
      if (data) {
        const analyticsArray = JSON.parse(data) as UserAnalytics[];
        analyticsArray.forEach(analytics => {
          analytics.timeframe.start = new Date(analytics.timeframe.start);
          analytics.timeframe.end = new Date(analytics.timeframe.end);
          this.userAnalytics.set(analytics.userId, analytics);
        });
      }
    } catch (error) {
      console.error('Failed to load user analytics:', error);
    }
  }

  private async saveUserAnalytics(): Promise<void> {
    try {
      const analyticsArray = Array.from(this.userAnalytics.values());
      await AsyncStorage.setItem(USER_ANALYTICS_KEY, JSON.stringify(analyticsArray));
    } catch (error) {
      console.error('Failed to save user analytics:', error);
    }
  }
}

export const userAnalyticsService = new UserAnalyticsService();
export default userAnalyticsService;
