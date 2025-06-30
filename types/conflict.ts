/**
 * Core type definitions for conflict resolution system
 */

export type ConflictCategory = 
  | 'romantic'
  | 'family'
  | 'workplace'
  | 'friendship'
  | 'community'
  | 'other';

export type ConflictIntensity = 'low' | 'medium' | 'high' | 'severe';

export type ConflictStyle = 
  | 'competing'
  | 'accommodating'
  | 'avoiding'
  | 'collaborating'
  | 'compromising';

export type MediationPhase = 
  | 'assessment'
  | 'preparation'
  | 'exploration'
  | 'option_generation'
  | 'agreement'
  | 'implementation'
  | 'follow_up';

export type ConflictStatus = 
  | 'active'
  | 'in_mediation'
  | 'resolved'
  | 'paused'
  | 'escalated';

export interface ConflictParticipant {
  id: string;
  name: string;
  relationship: string; // e.g., "spouse", "colleague", "friend"
  conflictStyle?: ConflictStyle;
  emotionalState?: {
    primary: string;
    intensity: number;
    lastUpdated: Date;
  };
}

export interface ConflictIssue {
  id: string;
  title: string;
  description: string;
  category: string; // e.g., "communication", "resources", "values"
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface ConflictAssessment {
  id: string;
  conflictId: string;
  completedAt: Date;
  scores: {
    intensity: number; // 1-10 scale
    complexity: number; // 1-10 scale
    emotionalImpact: number; // 1-10 scale
    relationshipThreat: number; // 1-10 scale
  };
  conflictStyle: ConflictStyle;
  readinessForMediation: number; // 1-10 scale
  recommendedApproach: string[];
  notes?: string;
}

export interface Conflict {
  id: string;
  title: string;
  description: string;
  category: ConflictCategory;
  intensity: ConflictIntensity;
  status: ConflictStatus;
  participants: ConflictParticipant[];
  issues: ConflictIssue[];
  createdAt: Date;
  updatedAt: Date;
  
  // Assessment data
  assessment?: ConflictAssessment;
  
  // Mediation tracking
  currentPhase?: MediationPhase;
  mediationStarted?: Date;
  mediationCompleted?: Date;
  
  // Progress tracking
  progressNotes: ProgressNote[];
  outcomes?: ConflictOutcome;
  
  // Metadata
  tags: string[];
  isPrivate: boolean;
  reminderSettings?: ReminderSettings;
}

export interface ProgressNote {
  id: string;
  conflictId: string;
  timestamp: Date;
  phase: MediationPhase;
  content: string;
  emotionalState?: {
    before: { emotion: string; intensity: number };
    after: { emotion: string; intensity: number };
  };
  insights: string[];
  nextSteps: string[];
  createdBy: 'user' | 'ai' | 'system';
}

export interface ConflictOutcome {
  id: string;
  conflictId: string;
  resolvedAt: Date;
  resolutionType: 'full_resolution' | 'partial_resolution' | 'agreement_to_disagree' | 'relationship_ended';
  satisfactionScore: number; // 1-10 scale
  agreementDetails?: {
    terms: string[];
    commitments: Array<{
      participant: string;
      commitment: string;
      deadline?: Date;
    }>;
  };
  followUpScheduled?: Date;
  lessonsLearned: string[];
  skillsGained: string[];
}

export interface MediationSession {
  id: string;
  conflictId: string;
  phase: MediationPhase;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  
  // Session content
  objectives: string[];
  activities: MediationActivity[];
  insights: string[];
  emotionalJourney: Array<{
    timestamp: Date;
    participant: string;
    emotion: string;
    intensity: number;
  }>;
  
  // Outcomes
  progress: number; // 0-100 percentage
  nextSteps: string[];
  scheduledFollowUp?: Date;
  
  // AI assistance
  aiSuggestions: string[];
  templatesUsed: string[];
  interventions: Array<{
    timestamp: Date;
    type: 'de_escalation' | 'reframe' | 'empathy_prompt' | 'break_suggestion';
    trigger: string;
    response: string;
  }>;
}

export interface MediationActivity {
  id: string;
  type: 'story_sharing' | 'active_listening' | 'interest_exploration' | 'brainstorming' | 'option_evaluation' | 'agreement_drafting';
  title: string;
  description: string;
  duration: number; // in minutes
  instructions: string[];
  completed: boolean;
  notes?: string;
  effectiveness?: number; // 1-5 scale
}

export interface CommunicationTemplate {
  id: string;
  title: string;
  category: ConflictCategory;
  subcategory: string; // e.g., "apology", "boundary_setting", "feedback"
  conflictTypes: string[]; // applicable conflict types
  emotionalContext: string[]; // when to use based on emotions
  
  // Template content
  structure: TemplateSection[];
  examples: TemplateExample[];
  
  // Customization
  variables: TemplateVariable[];
  adaptations: Array<{
    condition: string;
    modification: string;
  }>;
  
  // Metadata
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  effectiveness: number; // user rating
  usageCount: number;
  tags: string[];
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  type: 'opening' | 'acknowledgment' | 'expression' | 'request' | 'closing';
  isRequired: boolean;
  alternatives?: string[];
}

export interface TemplateExample {
  id: string;
  scenario: string;
  filledTemplate: string;
  context: {
    relationship: string;
    conflictType: string;
    emotionalState: string;
  };
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'emotion' | 'relationship' | 'specific_behavior' | 'desired_outcome';
  description: string;
  placeholder: string;
  required: boolean;
  suggestions?: string[];
}

export interface ReminderSettings {
  enabled: boolean;
  checkInFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  reminderTypes: Array<'progress_check' | 'follow_up' | 'skill_practice' | 'relationship_maintenance'>;
  customReminders: Array<{
    id: string;
    message: string;
    frequency: string;
    nextDue: Date;
  }>;
}

export interface ConflictMetrics {
  // Resolution metrics
  totalConflicts: number;
  resolvedConflicts: number;
  resolutionRate: number;
  averageResolutionTime: number; // in days
  
  // Relationship health
  relationshipHealthScore: number; // 1-100
  communicationImprovement: number; // percentage change
  trustLevel: number; // 1-10 scale
  satisfactionLevel: number; // 1-10 scale
  
  // Skill development
  conflictResolutionSkills: number; // 1-10 scale
  emotionalRegulation: number; // 1-10 scale
  activeListening: number; // 1-10 scale
  empathy: number; // 1-10 scale
  
  // Usage patterns
  preferredMediationPhases: MediationPhase[];
  mostUsedTemplates: string[];
  commonConflictTypes: ConflictCategory[];
  peakUsageTimes: string[];
  
  // Emotional journey
  emotionalTrends: Array<{
    date: Date;
    averageIntensity: number;
    dominantEmotion: string;
  }>;
  
  // AI effectiveness
  aiSuggestionAcceptanceRate: number;
  templateEffectiveness: Record<string, number>;
  interventionSuccess: Record<string, number>;
}

// Assessment questionnaire types
export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'scale' | 'multiple_choice' | 'text' | 'boolean';
  category: 'content' | 'process' | 'relationship' | 'emotional';
  required: boolean;
  options?: string[]; // for multiple choice
  scaleRange?: { min: number; max: number; labels: string[] }; // for scale questions
  followUpQuestions?: AssessmentQuestion[]; // conditional questions
}

export interface AssessmentResponse {
  questionId: string;
  value: string | number | boolean;
  timestamp: Date;
  confidence?: number; // how confident the user is in their answer
}

export interface AssessmentResult {
  id: string;
  conflictId: string;
  completedAt: Date;
  responses: AssessmentResponse[];
  scores: {
    conflictIntensity: number;
    relationshipHealth: number;
    communicationQuality: number;
    emotionalImpact: number;
    resolutionReadiness: number;
  };
  recommendations: string[];
  suggestedApproaches: string[];
  riskFactors: string[];
  strengths: string[];
}

// Workflow and state management
export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  phase: MediationPhase;
  estimatedDuration: number; // in minutes
  prerequisites: string[];
  objectives: string[];
  activities: string[];
  successCriteria: string[];
  nextSteps: string[];
  isCompleted: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  conflictTypes: ConflictCategory[];
  intensity: ConflictIntensity[];
  steps: WorkflowStep[];
  estimatedTotalDuration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  successRate: number; // historical success rate
  tags: string[];
}

