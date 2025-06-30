/**
 * Advanced Analytics Types
 * Comprehensive analytics and insights for conflict resolution tracking
 */

import { ConflictType, ConflictSkill, SkillLevel } from './user';
import { EmotionAnalysis } from '../services/ai/emotion';

export interface ConversationAnalytics {
  id: string;
  conversationId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  
  // Message analytics
  messageCount: number;
  averageMessageLength: number;
  responseTime: number; // average response time in seconds
  
  // Emotional analytics
  emotionalJourney: EmotionalDataPoint[];
  dominantEmotions: EmotionFrequency[];
  emotionalStability: number; // 0-100 score
  emotionalProgress: EmotionalProgress;
  
  // Communication patterns
  communicationStyle: CommunicationPattern;
  engagementLevel: number; // 0-100 score
  participationQuality: ParticipationQuality;
  
  // Conflict resolution metrics
  conflictType: ConflictType;
  resolutionProgress: ResolutionProgress;
  skillsUsed: ConflictSkill[];
  skillEffectiveness: Record<ConflictSkill, number>; // 0-100 effectiveness
  
  // AI interaction analytics
  aiInteractions: AIInteractionMetrics;
  personalizationEffectiveness: number; // 0-100 score
  
  // Outcomes
  satisfactionRating?: number; // 1-10 scale
  resolutionAchieved: boolean;
  followUpRequired: boolean;
  keyInsights: string[];
  recommendedActions: string[];
}

export interface EmotionalDataPoint {
  timestamp: Date;
  emotions: EmotionAnalysis;
  intensity: number; // 0-100
  trigger?: string;
  context: string;
  aiResponse?: string;
}

export interface EmotionFrequency {
  emotion: string;
  frequency: number; // percentage of conversation
  averageIntensity: number; // 0-100
  peakIntensity: number; // 0-100
  contexts: string[];
}

export interface EmotionalProgress {
  startingState: string;
  endingState: string;
  progressDirection: 'improving' | 'stable' | 'declining';
  volatility: 'low' | 'medium' | 'high';
  breakthroughMoments: BreakthroughMoment[];
  challengingMoments: ChallengingMoment[];
}

export interface BreakthroughMoment {
  timestamp: Date;
  description: string;
  emotionalShift: string;
  triggerEvent: string;
  impact: 'minor' | 'moderate' | 'major';
}

export interface ChallengingMoment {
  timestamp: Date;
  description: string;
  emotionalState: string;
  triggerEvent: string;
  recoveryTime: number; // in minutes
  interventionUsed?: string;
}

export interface CommunicationPattern {
  style: 'direct' | 'indirect' | 'analytical' | 'emotional' | 'mixed';
  clarity: number; // 0-100 score
  assertiveness: number; // 0-100 score
  empathy: number; // 0-100 score
  activeListening: number; // 0-100 score
  questionAsking: number; // frequency per message
  acknowledgment: number; // frequency of acknowledging others
}

export interface ParticipationQuality {
  consistency: number; // 0-100 score
  depth: number; // 0-100 score
  relevance: number; // 0-100 score
  constructiveness: number; // 0-100 score
  openness: number; // 0-100 score
  respectfulness: number; // 0-100 score
}

export interface ResolutionProgress {
  overallProgress: number; // 0-100 percentage
  stagesCompleted: ResolutionStage[];
  currentStage: ResolutionStage;
  timeToResolution?: number; // estimated minutes
  obstaclesIdentified: string[];
  breakthroughsAchieved: string[];
  nextSteps: string[];
}

export interface ResolutionStage {
  name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  startTime?: Date;
  completionTime?: Date;
  effectiveness: number; // 0-100 score
  challenges: string[];
  successes: string[];
}

export interface AIInteractionMetrics {
  totalInteractions: number;
  averageResponseQuality: number; // 0-100 score
  personalizationAccuracy: number; // 0-100 score
  interventionTiming: number; // 0-100 score
  emotionalSensitivity: number; // 0-100 score
  suggestionRelevance: number; // 0-100 score
  userSatisfactionWithAI: number; // 0-100 score
}

export interface UserAnalytics {
  userId: string;
  timeframe: AnalyticsTimeframe;
  
  // Overall metrics
  totalConversations: number;
  totalDuration: number; // in minutes
  averageSessionLength: number; // in minutes
  conflictResolutionRate: number; // percentage
  
  // Skill development
  skillProgress: SkillProgressAnalytics[];
  skillTrends: SkillTrend[];
  learningVelocity: number; // skills improved per month
  
  // Emotional intelligence
  emotionalIntelligence: EmotionalIntelligenceMetrics;
  emotionalGrowth: EmotionalGrowthMetrics;
  
  // Communication effectiveness
  communicationEffectiveness: CommunicationEffectivenessMetrics;
  
  // Conflict patterns
  conflictPatterns: ConflictPatternAnalytics;
  
  // Personalization insights
  personalizationInsights: PersonalizationInsights;
  
  // Predictive analytics
  predictiveInsights: PredictiveInsights;
  
  // Recommendations
  recommendations: AnalyticsRecommendation[];
}

export interface AnalyticsTimeframe {
  start: Date;
  end: Date;
  period: 'week' | 'month' | 'quarter' | 'year' | 'all_time';
}

export interface SkillProgressAnalytics {
  skill: ConflictSkill;
  currentLevel: SkillLevel;
  previousLevel: SkillLevel;
  progressRate: number; // improvement per week
  practiceFrequency: number; // times used per week
  effectiveness: number; // 0-100 score
  confidenceLevel: number; // 0-100 score
  areasForImprovement: string[];
  strengthAreas: string[];
}

export interface SkillTrend {
  skill: ConflictSkill;
  trend: 'improving' | 'stable' | 'declining';
  trendStrength: number; // 0-100
  timeToNextLevel?: number; // estimated weeks
  recommendedActivities: string[];
}

export interface EmotionalIntelligenceMetrics {
  selfAwareness: number; // 0-100 score
  selfRegulation: number; // 0-100 score
  empathy: number; // 0-100 score
  socialSkills: number; // 0-100 score
  motivation: number; // 0-100 score
  overallEQ: number; // 0-100 score
  improvementAreas: string[];
}

export interface EmotionalGrowthMetrics {
  emotionalStabilityTrend: 'improving' | 'stable' | 'declining';
  emotionalRangeDiversity: number; // 0-100 score
  emotionalRecoveryTime: number; // average minutes
  emotionalAwarenessLevel: number; // 0-100 score
  emotionalExpressionClarity: number; // 0-100 score
}

export interface CommunicationEffectivenessMetrics {
  clarity: number; // 0-100 score
  persuasiveness: number; // 0-100 score
  activeListening: number; // 0-100 score
  empathicResponse: number; // 0-100 score
  conflictDeEscalation: number; // 0-100 score
  solutionOrientation: number; // 0-100 score
}

export interface ConflictPatternAnalytics {
  mostCommonConflictTypes: ConflictTypeFrequency[];
  conflictTriggers: TriggerAnalytics[];
  resolutionStrategies: StrategyEffectiveness[];
  timeToResolution: ResolutionTimeAnalytics;
  successFactors: SuccessFactor[];
  challengeAreas: ChallengeArea[];
}

export interface ConflictTypeFrequency {
  type: ConflictType;
  frequency: number; // percentage
  averageResolutionTime: number; // in hours
  successRate: number; // percentage
  satisfactionRating: number; // 1-10 average
}

export interface TriggerAnalytics {
  trigger: string;
  frequency: number; // times encountered
  emotionalImpact: number; // 0-100 average intensity
  resolutionDifficulty: number; // 0-100 score
  effectiveStrategies: string[];
}

export interface StrategyEffectiveness {
  strategy: string;
  usageFrequency: number; // times used
  successRate: number; // percentage
  averageEffectiveness: number; // 0-100 score
  bestContexts: string[];
  limitations: string[];
}

export interface ResolutionTimeAnalytics {
  averageTime: number; // in hours
  medianTime: number; // in hours
  fastestResolution: number; // in hours
  longestResolution: number; // in hours
  timeByConflictType: Record<ConflictType, number>;
}

export interface SuccessFactor {
  factor: string;
  impact: number; // 0-100 correlation with success
  frequency: number; // how often present in successful resolutions
  description: string;
}

export interface ChallengeArea {
  area: string;
  frequency: number; // how often it causes difficulty
  impact: number; // 0-100 impact on resolution success
  recommendedImprovement: string;
}

export interface PersonalizationInsights {
  personalizationAccuracy: number; // 0-100 score
  preferenceAlignment: number; // 0-100 score
  adaptationEffectiveness: number; // 0-100 score
  userSatisfactionWithPersonalization: number; // 0-100 score
  mostEffectivePersonalizations: string[];
  leastEffectivePersonalizations: string[];
}

export interface PredictiveInsights {
  conflictRiskScore: number; // 0-100 likelihood of future conflicts
  resolutionSuccessProbability: number; // 0-100 for current conflicts
  skillDevelopmentTrajectory: SkillTrajectory[];
  emotionalWellnessTrend: 'improving' | 'stable' | 'at_risk';
  recommendedInterventions: string[];
  earlyWarningSignals: string[];
}

export interface SkillTrajectory {
  skill: ConflictSkill;
  currentTrajectory: 'accelerating' | 'steady' | 'plateauing' | 'declining';
  projectedLevel: SkillLevel;
  timeToProjection: number; // in weeks
  confidenceInterval: number; // 0-100
}

export interface AnalyticsRecommendation {
  id: string;
  type: 'skill_development' | 'emotional_regulation' | 'communication' | 'conflict_prevention' | 'personalization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: number; // 0-100 score
  timeToImplement: number; // in days
  difficulty: 'easy' | 'moderate' | 'challenging';
  actionSteps: string[];
  successMetrics: string[];
  relatedInsights: string[];
}

export interface SystemAnalytics {
  timeframe: AnalyticsTimeframe;
  
  // Platform metrics
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userRetention: RetentionMetrics;
  
  // Usage metrics
  totalConversations: number;
  averageSessionLength: number;
  totalResolutions: number;
  resolutionSuccessRate: number;
  
  // Feature usage
  featureUsage: FeatureUsageMetrics[];
  
  // Performance metrics
  systemPerformance: SystemPerformanceMetrics;
  
  // User satisfaction
  userSatisfaction: UserSatisfactionMetrics;
  
  // Trends and insights
  platformTrends: PlatformTrend[];
  systemInsights: SystemInsight[];
}

export interface RetentionMetrics {
  day1: number; // percentage
  day7: number; // percentage
  day30: number; // percentage
  day90: number; // percentage
  averageLifetime: number; // in days
}

export interface FeatureUsageMetrics {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  averageUsagePerUser: number;
  userSatisfaction: number; // 0-100 score
  retentionImpact: number; // correlation with retention
}

export interface SystemPerformanceMetrics {
  averageResponseTime: number; // in milliseconds
  uptime: number; // percentage
  errorRate: number; // percentage
  aiAccuracy: number; // 0-100 score
  personalizationLatency: number; // in milliseconds
}

export interface UserSatisfactionMetrics {
  overallSatisfaction: number; // 1-10 average
  npsScore: number; // Net Promoter Score
  featureSatisfaction: Record<string, number>;
  supportSatisfaction: number; // 1-10 average
  recommendationRate: number; // percentage
}

export interface PlatformTrend {
  metric: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  changeRate: number; // percentage change
  significance: 'low' | 'medium' | 'high';
  timeframe: string;
}

export interface SystemInsight {
  id: string;
  type: 'user_behavior' | 'feature_performance' | 'satisfaction' | 'technical' | 'business';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  recommendedActions: string[];
  dataPoints: string[];
}

// Visualization types
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'radar';
  title: string;
  data: ChartDataPoint[];
  xAxis?: string;
  yAxis?: string;
  categories?: string[];
}

export interface ChartDataPoint {
  x: string | number | Date;
  y: string | number;
  category?: string;
  value?: number;
  label?: string;
}

export interface AnalyticsDashboard {
  userId: string;
  dashboardType: 'personal' | 'system' | 'comparative';
  timeframe: AnalyticsTimeframe;
  widgets: AnalyticsWidget[];
  insights: DashboardInsight[];
  lastUpdated: Date;
}

export interface AnalyticsWidget {
  id: string;
  type: 'metric' | 'chart' | 'insight' | 'recommendation' | 'progress';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { row: number; col: number };
  data: any;
  refreshRate: number; // in minutes
}

export interface DashboardInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'achievement' | 'warning' | 'opportunity';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actionRequired: boolean;
  relatedWidgets: string[];
}

// Export interfaces for analytics queries
export interface AnalyticsQuery {
  userId?: string;
  timeframe: AnalyticsTimeframe;
  metrics: string[];
  filters?: AnalyticsFilter[];
  groupBy?: string[];
  orderBy?: string;
  limit?: number;
}

export interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
}

