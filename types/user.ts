/**
 * User Profile Types and Interfaces
 * Comprehensive user data structures for personalization and conflict resolution tracking
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Personal Information
  personalInfo: PersonalInfo;
  
  // Conflict Resolution Preferences
  conflictPreferences: ConflictPreferences;
  
  // Communication Style
  communicationStyle: CommunicationStyle;
  
  // Learning Patterns
  learningPatterns: LearningPatterns;
  
  // Conflict History
  conflictHistory: ConflictHistorySummary;
  
  // Personalization Settings
  personalizationSettings: PersonalizationSettings;
}

export interface PersonalInfo {
  age?: number;
  occupation?: string;
  relationshipStatus?: 'single' | 'partnered' | 'married' | 'divorced' | 'widowed' | 'other';
  hasChildren?: boolean;
  primaryLanguage: string;
  timezone: string;
  culturalBackground?: string[];
}

export interface ConflictPreferences {
  // Preferred resolution approach
  preferredApproach: 'collaborative' | 'competitive' | 'accommodating' | 'avoiding' | 'compromising';
  
  // Communication preferences during conflict
  communicationPreference: 'direct' | 'indirect' | 'balanced';
  
  // Emotional processing style
  emotionalProcessingStyle: 'analytical' | 'intuitive' | 'balanced';
  
  // Preferred mediation style
  mediationStyle: 'structured' | 'flexible' | 'guided' | 'self-directed';
  
  // Time preferences
  sessionDuration: 'short' | 'medium' | 'long' | 'flexible';
  
  // Trigger topics (sensitive areas)
  triggerTopics: string[];
  
  // Strengths in conflict resolution
  strengths: ConflictStrength[];
  
  // Areas for improvement
  improvementAreas: ConflictSkill[];
}

export interface CommunicationStyle {
  // Primary communication mode preference
  preferredMode: 'voice' | 'text' | 'mixed';
  
  // Voice settings
  voiceSettings: {
    preferredVoice?: string;
    speechRate: number;
    volume: number;
  };
  
  // Text preferences
  textPreferences: {
    formality: 'casual' | 'formal' | 'adaptive';
    responseLength: 'brief' | 'detailed' | 'adaptive';
    useEmojis: boolean;
  };
  
  // AI interaction preferences
  aiInteractionStyle: {
    personality: 'supportive' | 'direct' | 'analytical' | 'empathetic';
    interventionLevel: 'minimal' | 'moderate' | 'active';
    feedbackStyle: 'gentle' | 'direct' | 'encouraging';
  };
}

export interface LearningPatterns {
  // Learning style
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  
  // Progress tracking
  skillProgress: Record<ConflictSkill, SkillLevel>;
  
  // Successful strategies
  successfulStrategies: string[];
  
  // Common challenges
  commonChallenges: string[];
  
  // Adaptation patterns
  adaptationRate: 'fast' | 'moderate' | 'slow';
  
  // Retention patterns
  retentionStrength: 'high' | 'medium' | 'low';
  
  // Preferred learning activities
  preferredActivities: LearningActivity[];
}

export interface ConflictHistorySummary {
  totalConflicts: number;
  resolvedConflicts: number;
  resolutionRate: number;
  averageResolutionTime: number; // in hours
  
  // Conflict categories
  conflictTypes: Record<ConflictType, number>;
  
  // Relationship contexts
  relationshipContexts: Record<RelationshipContext, number>;
  
  // Recent activity
  recentConflicts: ConflictSummary[];
  
  // Trends
  resolutionTrends: ResolutionTrend[];
  
  // Emotional patterns
  emotionalPatterns: EmotionalPattern[];
}

export interface PersonalizationSettings {
  // Notification preferences
  notifications: {
    conflictReminders: boolean;
    progressUpdates: boolean;
    tipOfTheDay: boolean;
    weeklyInsights: boolean;
  };
  
  // Privacy settings
  privacy: {
    shareAnonymousData: boolean;
    allowResearchParticipation: boolean;
    dataRetentionPeriod: number; // in days
  };
  
  // Accessibility
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
  
  // Customization
  customization: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    dashboardLayout: 'compact' | 'detailed' | 'minimal';
  };
}

// Supporting Types
export type ConflictStrength = 
  | 'active_listening'
  | 'empathy'
  | 'problem_solving'
  | 'emotional_regulation'
  | 'communication'
  | 'patience'
  | 'creativity'
  | 'compromise'
  | 'boundary_setting'
  | 'perspective_taking';

export type ConflictSkill = 
  | 'active_listening'
  | 'emotional_awareness'
  | 'assertiveness'
  | 'empathy'
  | 'problem_solving'
  | 'communication'
  | 'conflict_de_escalation'
  | 'boundary_setting'
  | 'compromise'
  | 'perspective_taking'
  | 'emotional_regulation'
  | 'negotiation';

export type SkillLevel = 'beginner' | 'developing' | 'proficient' | 'advanced' | 'expert';

export type LearningActivity = 
  | 'guided_meditation'
  | 'role_playing'
  | 'case_studies'
  | 'reflection_exercises'
  | 'communication_practice'
  | 'emotional_awareness'
  | 'problem_solving_games'
  | 'perspective_exercises';

export type ConflictType = 
  | 'interpersonal'
  | 'workplace'
  | 'family'
  | 'romantic'
  | 'friendship'
  | 'neighbor'
  | 'financial'
  | 'parenting'
  | 'caregiving'
  | 'other';

export type RelationshipContext = 
  | 'spouse_partner'
  | 'parent_child'
  | 'sibling'
  | 'friend'
  | 'colleague'
  | 'supervisor'
  | 'neighbor'
  | 'acquaintance'
  | 'stranger'
  | 'other';

export interface ConflictSummary {
  id: string;
  type: ConflictType;
  relationshipContext: RelationshipContext;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'resolved' | 'paused' | 'escalated';
  resolutionOutcome?: 'win_win' | 'compromise' | 'win_lose' | 'lose_lose' | 'ongoing';
  satisfactionRating?: number; // 1-10
  keyLearnings?: string[];
}

export interface ResolutionTrend {
  period: 'week' | 'month' | 'quarter';
  startDate: Date;
  endDate: Date;
  conflictsStarted: number;
  conflictsResolved: number;
  averageResolutionTime: number;
  satisfactionAverage: number;
  skillImprovements: ConflictSkill[];
}

export interface EmotionalPattern {
  emotion: string;
  frequency: number;
  contexts: ConflictType[];
  triggers: string[];
  copingStrategies: string[];
  improvementTrend: 'improving' | 'stable' | 'declining';
}

// User Profile Actions
export interface UserProfileUpdate {
  personalInfo?: Partial<PersonalInfo>;
  conflictPreferences?: Partial<ConflictPreferences>;
  communicationStyle?: Partial<CommunicationStyle>;
  personalizationSettings?: Partial<PersonalizationSettings>;
}

export interface ProfileAnalytics {
  profileCompleteness: number; // percentage
  engagementScore: number; // 1-100
  learningProgress: number; // percentage
  conflictResolutionImprovement: number; // percentage change
  recommendedActions: string[];
  personalizedInsights: string[];
}

// Personalization Recommendations
export interface PersonalizationRecommendation {
  id: string;
  type: 'skill_development' | 'communication_style' | 'conflict_approach' | 'learning_activity';
  title: string;
  description: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number; // 1-10
  timeToComplete?: number; // in minutes
  relatedSkills: ConflictSkill[];
  actionItems: string[];
}

export interface UserPreferences {
  // Quick access to commonly used preferences
  preferredApproach: ConflictPreferences['preferredApproach'];
  communicationMode: CommunicationStyle['preferredMode'];
  aiPersonality: CommunicationStyle['aiInteractionStyle']['personality'];
  sessionDuration: ConflictPreferences['sessionDuration'];
  notificationsEnabled: boolean;
}

