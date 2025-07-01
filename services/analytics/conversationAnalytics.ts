/**
 * Conversation Analytics Service
 * Analyzes individual conversations for insights and patterns
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ConversationAnalytics,
  EmotionalDataPoint,
  EmotionFrequency,
  EmotionalProgress,
  CommunicationPattern,
  ParticipationQuality,
  ResolutionProgress,
  AIInteractionMetrics,
  BreakthroughMoment,
  ChallengingMoment
} from '../../types/analytics';
import { ConflictType, ConflictSkill } from '../../types/user';
import { EmotionAnalysis } from '../ai/emotion';

const CONVERSATION_ANALYTICS_KEY = '@understand_me_conversation_analytics';

class ConversationAnalyticsService {
  private analytics: Map<string, ConversationAnalytics> = new Map();

  /**
   * Initialize the conversation analytics service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadAnalytics();
    } catch (error) {
      console.error('Failed to initialize conversation analytics service:', error);
    }
  }

  /**
   * Start tracking a new conversation
   */
  async startConversationTracking(
    conversationId: string,
    userId: string,
    conflictType: ConflictType
  ): Promise<ConversationAnalytics> {
    const analytics: ConversationAnalytics = {
      id: `analytics_${conversationId}`,
      conversationId,
      userId,
      startTime: new Date(),
      duration: 0,
      messageCount: 0,
      averageMessageLength: 0,
      responseTime: 0,
      emotionalJourney: [],
      dominantEmotions: [],
      emotionalStability: 50,
      emotionalProgress: this.initializeEmotionalProgress(),
      communicationStyle: this.initializeCommunicationPattern(),
      engagementLevel: 50,
      participationQuality: this.initializeParticipationQuality(),
      conflictType,
      resolutionProgress: this.initializeResolutionProgress(),
      skillsUsed: [],
      skillEffectiveness: {} as Record<ConflictSkill, number>,
      aiInteractions: this.initializeAIInteractionMetrics(),
      personalizationEffectiveness: 50,
      resolutionAchieved: false,
      followUpRequired: false,
      keyInsights: [],
      recommendedActions: []
    };

    this.analytics.set(conversationId, analytics);
    await this.saveAnalytics();

    return analytics;
  }

  /**
   * Add emotional data point to conversation
   */
  async addEmotionalDataPoint(
    conversationId: string,
    emotions: EmotionAnalysis,
    context: string,
    trigger?: string,
    aiResponse?: string
  ): Promise<void> {
    const analytics = this.analytics.get(conversationId);
    if (!analytics) return;

    const dataPoint: EmotionalDataPoint = {
      timestamp: new Date(),
      emotions,
      intensity: emotions.primaryEmotion.confidence * 100 || 0,
      trigger,
      context,
      aiResponse
    };

    analytics.emotionalJourney.push(dataPoint);
    
    // Update emotional metrics
    await this.updateEmotionalMetrics(analytics);
    
    this.analytics.set(conversationId, analytics);
    await this.saveAnalytics();
  }

  /**
   * Track message in conversation
   */
  async trackMessage(
    conversationId: string,
    messageLength: number,
    responseTime: number,
    skillsUsed: ConflictSkill[] = []
  ): Promise<void> {
    const analytics = this.analytics.get(conversationId);
    if (!analytics) return;

    analytics.messageCount++;
    analytics.averageMessageLength = 
      (analytics.averageMessageLength * (analytics.messageCount - 1) + messageLength) / analytics.messageCount;
    analytics.responseTime = 
      (analytics.responseTime * (analytics.messageCount - 1) + responseTime) / analytics.messageCount;

    // Track skills used
    skillsUsed.forEach(skill => {
      if (!analytics.skillsUsed.includes(skill)) {
        analytics.skillsUsed.push(skill);
      }
    });

    // Update engagement level based on message patterns
    await this.updateEngagementLevel(analytics);

    this.analytics.set(conversationId, analytics);
    await this.saveAnalytics();
  }

  /**
   * Update resolution progress
   */
  async updateResolutionProgress(
    conversationId: string,
    progress: number,
    stageCompleted?: string,
    breakthroughs?: string[],
    obstacles?: string[]
  ): Promise<void> {
    const analytics = this.analytics.get(conversationId);
    if (!analytics) return;

    analytics.resolutionProgress.overallProgress = progress;
    
    if (stageCompleted) {
      const stage = analytics.resolutionProgress.stagesCompleted.find(s => s.name === stageCompleted);
      if (stage) {
        stage.status = 'completed';
        stage.completionTime = new Date();
      }
    }

    if (breakthroughs) {
      analytics.resolutionProgress.breakthroughsAchieved.push(...breakthroughs);
    }

    if (obstacles) {
      analytics.resolutionProgress.obstaclesIdentified.push(...obstacles);
    }

    this.analytics.set(conversationId, analytics);
    await this.saveAnalytics();
  }

  /**
   * End conversation tracking
   */
  async endConversationTracking(
    conversationId: string,
    satisfactionRating?: number,
    resolutionAchieved: boolean = false
  ): Promise<ConversationAnalytics | null> {
    const analytics = this.analytics.get(conversationId);
    if (!analytics) return null;

    analytics.endTime = new Date();
    analytics.duration = Math.round(
      (analytics.endTime.getTime() - analytics.startTime.getTime()) / (1000 * 60)
    );
    analytics.satisfactionRating = satisfactionRating;
    analytics.resolutionAchieved = resolutionAchieved;

    // Generate final insights and recommendations
    await this.generateFinalInsights(analytics);

    this.analytics.set(conversationId, analytics);
    await this.saveAnalytics();

    return analytics;
  }

  /**
   * Get conversation analytics
   */
  getConversationAnalytics(conversationId: string): ConversationAnalytics | null {
    return this.analytics.get(conversationId) || null;
  }

  /**
   * Get analytics for user
   */
  getUserConversationAnalytics(userId: string): ConversationAnalytics[] {
    return Array.from(this.analytics.values()).filter(a => a.userId === userId);
  }

  /**
   * Generate conversation insights
   */
  async generateConversationInsights(conversationId: string): Promise<string[]> {
    const analytics = this.analytics.get(conversationId);
    if (!analytics) return [];

    const insights: string[] = [];

    // Emotional insights
    if (analytics.emotionalJourney.length > 0) {
      const emotionalTrend = this.analyzeEmotionalTrend(analytics.emotionalJourney);
      insights.push(`Emotional journey showed ${emotionalTrend} throughout the conversation`);

      const dominantEmotion = analytics.dominantEmotions[0];
      if (dominantEmotion) {
        insights.push(`Primary emotion was ${dominantEmotion.emotion} (${Math.round(dominantEmotion.frequency)}% of conversation)`);
      }
    }

    // Communication insights
    const commStyle = analytics.communicationStyle;
    if (commStyle.clarity > 80) {
      insights.push('Communication was exceptionally clear and well-structured');
    } else if (commStyle.clarity < 40) {
      insights.push('Communication could benefit from more clarity and structure');
    }

    if (commStyle.empathy > 80) {
      insights.push('Demonstrated strong empathetic understanding');
    }

    // Resolution insights
    if (analytics.resolutionProgress.overallProgress > 80) {
      insights.push('Made excellent progress toward conflict resolution');
    } else if (analytics.resolutionProgress.overallProgress < 30) {
      insights.push('Resolution progress was limited - consider different approaches');
    }

    // Skill insights
    if (analytics.skillsUsed.length > 5) {
      insights.push(`Applied ${analytics.skillsUsed.length} different conflict resolution skills`);
    }

    // Engagement insights
    if (analytics.engagementLevel > 80) {
      insights.push('Maintained high engagement throughout the conversation');
    } else if (analytics.engagementLevel < 40) {
      insights.push('Engagement levels suggest the need for more interactive approaches');
    }

    return insights;
  }

  /**
   * Private helper methods
   */
  private async loadAnalytics(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(CONVERSATION_ANALYTICS_KEY);
      if (data) {
        const analyticsArray = JSON.parse(data) as ConversationAnalytics[];
        analyticsArray.forEach(analytics => {
          // Convert date strings back to Date objects
          analytics.startTime = new Date(analytics.startTime);
          if (analytics.endTime) analytics.endTime = new Date(analytics.endTime);
          
          analytics.emotionalJourney.forEach(point => {
            point.timestamp = new Date(point.timestamp);
          });

          this.analytics.set(analytics.conversationId, analytics);
        });
      }
    } catch (error) {
      console.error('Failed to load conversation analytics:', error);
    }
  }

  private async saveAnalytics(): Promise<void> {
    try {
      const analyticsArray = Array.from(this.analytics.values());
      await AsyncStorage.setItem(CONVERSATION_ANALYTICS_KEY, JSON.stringify(analyticsArray));
    } catch (error) {
      console.error('Failed to save conversation analytics:', error);
    }
  }

  private initializeEmotionalProgress(): EmotionalProgress {
    return {
      startingState: 'neutral',
      endingState: 'neutral',
      progressDirection: 'stable',
      volatility: 'medium',
      breakthroughMoments: [],
      challengingMoments: []
    };
  }

  private initializeCommunicationPattern(): CommunicationPattern {
    return {
      style: 'mixed',
      clarity: 50,
      assertiveness: 50,
      empathy: 50,
      activeListening: 50,
      questionAsking: 0,
      acknowledgment: 0
    };
  }

  private initializeParticipationQuality(): ParticipationQuality {
    return {
      consistency: 50,
      depth: 50,
      relevance: 50,
      constructiveness: 50,
      openness: 50,
      respectfulness: 50
    };
  }

  private initializeResolutionProgress(): ResolutionProgress {
    return {
      overallProgress: 0,
      stagesCompleted: [
        { name: 'Problem Identification', status: 'not_started', effectiveness: 0, challenges: [], successes: [] },
        { name: 'Perspective Sharing', status: 'not_started', effectiveness: 0, challenges: [], successes: [] },
        { name: 'Solution Generation', status: 'not_started', effectiveness: 0, challenges: [], successes: [] },
        { name: 'Agreement Building', status: 'not_started', effectiveness: 0, challenges: [], successes: [] }
      ],
      currentStage: { name: 'Problem Identification', status: 'not_started', effectiveness: 0, challenges: [], successes: [] },
      obstaclesIdentified: [],
      breakthroughsAchieved: [],
      nextSteps: []
    };
  }

  private initializeAIInteractionMetrics(): AIInteractionMetrics {
    return {
      totalInteractions: 0,
      averageResponseQuality: 50,
      personalizationAccuracy: 50,
      interventionTiming: 50,
      emotionalSensitivity: 50,
      suggestionRelevance: 50,
      userSatisfactionWithAI: 50
    };
  }

  private async updateEmotionalMetrics(analytics: ConversationAnalytics): Promise<void> {
    const journey = analytics.emotionalJourney;
    if (journey.length === 0) return;

    // Calculate dominant emotions
    const emotionCounts: Record<string, { count: number; totalIntensity: number; maxIntensity: number }> = {};
    
    journey.forEach(point => {
      const allEmotions = [point.emotions.primaryEmotion, ...point.emotions.secondaryEmotions];
      allEmotions.forEach(emotion => {
        if (!emotionCounts[emotion.emotion]) {
          emotionCounts[emotion.emotion] = { count: 0, totalIntensity: 0, maxIntensity: 0 };
        }
        emotionCounts[emotion.emotion].count++;
        emotionCounts[emotion.emotion].totalIntensity += emotion.confidence * 100;
        emotionCounts[emotion.emotion].maxIntensity = Math.max(
          emotionCounts[emotion.emotion].maxIntensity,
          emotion.confidence * 100
        );
      });
    });

    analytics.dominantEmotions = Object.entries(emotionCounts)
      .map(([emotion, data]) => ({
        emotion,
        frequency: (data.count / journey.length) * 100,
        averageIntensity: data.totalIntensity / data.count,
        peakIntensity: data.maxIntensity,
        contexts: journey
          .filter(p => {
            const allEmotions = [p.emotions.primaryEmotion, ...p.emotions.secondaryEmotions];
            return allEmotions.some(e => e.emotion === emotion);
          })
          .map(p => p.context)
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Calculate emotional stability
    const intensities = journey.map(p => p.intensity);
    const variance = this.calculateVariance(intensities);
    analytics.emotionalStability = Math.max(0, 100 - variance);

    // Update emotional progress
    if (journey.length >= 2) {
      const firstEmotion = journey[0].emotions.primaryEmotion.emotion || 'neutral';
      const lastEmotion = journey[journey.length - 1].emotions.primaryEmotion.emotion || 'neutral';
      
      analytics.emotionalProgress.startingState = firstEmotion;
      analytics.emotionalProgress.endingState = lastEmotion;
      
      // Determine progress direction
      const firstIntensity = journey[0].intensity;
      const lastIntensity = journey[journey.length - 1].intensity;
      const positiveEmotions = ['joy', 'satisfaction', 'relief', 'hope', 'gratitude'];
      
      if (positiveEmotions.includes(lastEmotion.toLowerCase()) && 
          !positiveEmotions.includes(firstEmotion.toLowerCase())) {
        analytics.emotionalProgress.progressDirection = 'improving';
      } else if (!positiveEmotions.includes(lastEmotion.toLowerCase()) && 
                 positiveEmotions.includes(firstEmotion.toLowerCase())) {
        analytics.emotionalProgress.progressDirection = 'declining';
      } else {
        analytics.emotionalProgress.progressDirection = 'stable';
      }

      // Determine volatility
      analytics.emotionalProgress.volatility = variance > 30 ? 'high' : variance > 15 ? 'medium' : 'low';
    }

    // Identify breakthrough and challenging moments
    this.identifyEmotionalMoments(analytics);
  }

  private async updateEngagementLevel(analytics: ConversationAnalytics): Promise<void> {
    let engagement = 50; // Base engagement

    // Message frequency factor
    const avgResponseTime = analytics.responseTime;
    if (avgResponseTime < 30) engagement += 20; // Quick responses
    else if (avgResponseTime > 120) engagement -= 15; // Slow responses

    // Message length factor
    const avgLength = analytics.averageMessageLength;
    if (avgLength > 50) engagement += 10; // Detailed messages
    else if (avgLength < 10) engagement -= 10; // Very short messages

    // Emotional engagement factor
    if (analytics.emotionalJourney.length > 0) {
      const avgIntensity = analytics.emotionalJourney.reduce((sum, p) => sum + p.intensity, 0) / analytics.emotionalJourney.length;
      if (avgIntensity > 70) engagement += 15; // High emotional engagement
      else if (avgIntensity < 30) engagement -= 10; // Low emotional engagement
    }

    analytics.engagementLevel = Math.max(0, Math.min(100, engagement));
  }

  private async generateFinalInsights(analytics: ConversationAnalytics): Promise<void> {
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Analyze overall conversation effectiveness
    if (analytics.resolutionAchieved) {
      insights.push('Successfully achieved conflict resolution');
      if (analytics.duration < 30) {
        insights.push('Achieved resolution efficiently in under 30 minutes');
      }
    } else {
      insights.push('Conflict resolution is still in progress');
      recommendations.push('Consider scheduling a follow-up session to continue progress');
    }

    // Emotional insights
    if (analytics.emotionalProgress.progressDirection === 'improving') {
      insights.push('Emotional state improved significantly during the conversation');
    } else if (analytics.emotionalProgress.progressDirection === 'declining') {
      insights.push('Emotional state became more challenging during the conversation');
      recommendations.push('Focus on emotional regulation techniques in future sessions');
    }

    // Communication insights
    if (analytics.communicationStyle.empathy > 70) {
      insights.push('Demonstrated strong empathetic communication');
    } else {
      recommendations.push('Practice active listening and empathetic responses');
    }

    // Skill development insights
    if (analytics.skillsUsed.length > 3) {
      insights.push(`Applied ${analytics.skillsUsed.length} different conflict resolution skills`);
    } else {
      recommendations.push('Explore additional conflict resolution techniques');
    }

    analytics.keyInsights = insights;
    analytics.recommendedActions = recommendations;
  }

  private identifyEmotionalMoments(analytics: ConversationAnalytics): void {
    const journey = analytics.emotionalJourney;
    const breakthroughs: BreakthroughMoment[] = [];
    const challenges: ChallengingMoment[] = [];

    for (let i = 1; i < journey.length; i++) {
      const current = journey[i];
      const previous = journey[i - 1];
      
      const intensityChange = current.intensity - previous.intensity;
      const positiveEmotions = ['joy', 'satisfaction', 'relief', 'hope', 'gratitude'];
      const negativeEmotions = ['anger', 'frustration', 'sadness', 'anxiety', 'fear'];

      // Identify breakthroughs (positive emotional shifts)
      if (intensityChange > 20 || 
          (positiveEmotions.includes(current.emotions.primaryEmotion.emotion.toLowerCase()) &&
           negativeEmotions.includes(previous.emotions.primaryEmotion.emotion.toLowerCase()))) {
        
        breakthroughs.push({
          timestamp: current.timestamp,
          description: `Positive emotional shift from ${previous.emotions.primaryEmotion.emotion} to ${current.emotions.primaryEmotion.emotion}`,
          emotionalShift: `${previous.emotions.primaryEmotion.emotion} → ${current.emotions.primaryEmotion.emotion}`,
          triggerEvent: current.trigger || current.context,
          impact: intensityChange > 40 ? 'major' : intensityChange > 25 ? 'moderate' : 'minor'
        });
      }

      // Identify challenging moments (negative emotional shifts)
      if (intensityChange < -20 || 
          (negativeEmotions.includes(current.emotions.primaryEmotion.emotion.toLowerCase()) &&
           current.intensity > 70)) {
        
        challenges.push({
          timestamp: current.timestamp,
          description: `Challenging emotional moment: ${current.emotions.primaryEmotion.emotion}`,
          emotionalState: current.emotions.primaryEmotion.emotion,
          triggerEvent: current.trigger || current.context,
          recoveryTime: this.calculateRecoveryTime(journey, i),
          interventionUsed: current.aiResponse ? 'AI intervention' : undefined
        });
      }
    }

    analytics.emotionalProgress.breakthroughMoments = breakthroughs;
    analytics.emotionalProgress.challengingMoments = challenges;
  }

  private calculateRecoveryTime(journey: EmotionalDataPoint[], challengeIndex: number): number {
    const challengeIntensity = journey[challengeIndex].intensity;
    
    for (let i = challengeIndex + 1; i < journey.length; i++) {
      if (journey[i].intensity < challengeIntensity - 20) {
        const recoveryTime = journey[i].timestamp.getTime() - journey[challengeIndex].timestamp.getTime();
        return Math.round(recoveryTime / (1000 * 60)); // Convert to minutes
      }
    }
    
    return 0; // No recovery detected
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private analyzeEmotionalTrend(journey: EmotionalDataPoint[]): string {
    if (journey.length < 2) return 'stable progression';

    const firstHalf = journey.slice(0, Math.floor(journey.length / 2));
    const secondHalf = journey.slice(Math.floor(journey.length / 2));

    const firstAvg = firstHalf.reduce((sum, p) => sum + p.intensity, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.intensity, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 15) return 'significant improvement';
    if (difference > 5) return 'gradual improvement';
    if (difference < -15) return 'concerning decline';
    if (difference < -5) return 'slight decline';
    return 'stable progression';
  }
}

// Export singleton instance
export const conversationAnalyticsService = new ConversationAnalyticsService();
export default conversationAnalyticsService;
