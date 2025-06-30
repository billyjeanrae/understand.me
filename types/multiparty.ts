/**
 * Multi-Party Conflict Resolution Types
 * Types and interfaces for group conflict mediation and resolution
 */

import { ConflictType, ConflictSkill, EmotionalPattern } from './user';
import { EmotionAnalysis } from '../services/ai/emotion';

export interface MultiPartyConflict {
  id: string;
  title: string;
  description: string;
  type: ConflictType;
  status: 'setup' | 'active' | 'paused' | 'resolved' | 'escalated';
  
  // Participants
  participants: ConflictParticipant[];
  facilitator?: ConflictParticipant; // Optional human facilitator
  
  // Session management
  currentSession?: GroupSession;
  sessionHistory: GroupSession[];
  
  // Conflict details
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  resolvedAt?: Date;
  
  // Resolution tracking
  resolutionGoals: ResolutionGoal[];
  agreements: ConflictAgreement[];
  
  // Group dynamics
  groupDynamics: GroupDynamics;
  
  // Settings
  settings: MultiPartySettings;
}

export interface ConflictParticipant {
  id: string;
  name: string;
  email?: string;
  role: 'primary' | 'secondary' | 'observer' | 'facilitator';
  status: 'invited' | 'joined' | 'active' | 'inactive' | 'left';
  
  // Participation tracking
  joinedAt?: Date;
  lastActiveAt?: Date;
  
  // Individual perspective
  perspective: ParticipantPerspective;
  
  // Communication preferences
  communicationStyle: 'direct' | 'diplomatic' | 'analytical' | 'emotional';
  preferredRole: 'speaker' | 'listener' | 'mediator' | 'problem_solver';
  
  // Current state
  currentEmotions?: EmotionAnalysis;
  engagementLevel: 'high' | 'medium' | 'low';
  
  // Conflict-specific data
  relationshipToOthers: Record<string, RelationshipContext>;
  personalGoals: string[];
  concerns: string[];
  strengths: ConflictSkill[];
}

export interface ParticipantPerspective {
  summary: string;
  keyPoints: string[];
  emotionalState: string;
  desiredOutcome: string;
  willingnessToCompromise: 'high' | 'medium' | 'low';
  trustLevel: Record<string, 'high' | 'medium' | 'low'>; // trust in other participants
}

export interface GroupSession {
  id: string;
  conflictId: string;
  sessionNumber: number;
  
  // Timing
  startTime: Date;
  endTime?: Date;
  plannedDuration: number; // in minutes
  actualDuration?: number;
  
  // Participants
  attendees: string[]; // participant IDs
  absentees: string[];
  
  // Session structure
  agenda: SessionAgenda;
  currentPhase: SessionPhase;
  phases: SessionPhaseResult[];
  
  // Facilitation
  facilitationType: 'ai_only' | 'human_led' | 'hybrid';
  facilitatorNotes?: string[];
  
  // Outcomes
  agreements: ConflictAgreement[];
  actionItems: ActionItem[];
  nextSteps: string[];
  
  // Analytics
  participationMetrics: ParticipationMetrics;
  emotionalJourney: EmotionalJourney[];
  
  // Session quality
  satisfactionRatings: Record<string, number>; // participant ID -> rating
  effectivenessScore: number;
}

export interface SessionAgenda {
  phases: SessionPhase[];
  timeAllocations: Record<string, number>; // phase -> minutes
  breakSchedule: Date[];
  specialConsiderations: string[];
}

export interface SessionPhase {
  id: string;
  name: string;
  type: 'opening' | 'perspective_sharing' | 'issue_identification' | 'solution_generation' | 'negotiation' | 'agreement' | 'closing';
  description: string;
  duration: number; // in minutes
  activities: PhaseActivity[];
  requiredParticipants: string[]; // participant IDs
  facilitationNotes: string[];
}

export interface PhaseActivity {
  id: string;
  name: string;
  type: 'discussion' | 'exercise' | 'reflection' | 'voting' | 'brainstorming' | 'role_play';
  description: string;
  duration: number;
  instructions: string[];
  materials?: string[];
  expectedOutcomes: string[];
}

export interface SessionPhaseResult {
  phaseId: string;
  startTime: Date;
  endTime: Date;
  completionStatus: 'completed' | 'partial' | 'skipped';
  outcomes: string[];
  participantFeedback: Record<string, string>;
  facilitatorNotes: string[];
  emotionalHighlights: EmotionalHighlight[];
}

export interface ConflictAgreement {
  id: string;
  title: string;
  description: string;
  type: 'behavioral' | 'procedural' | 'outcome' | 'boundary' | 'communication';
  
  // Agreement details
  terms: AgreementTerm[];
  conditions: string[];
  timeline: AgreementTimeline;
  
  // Participant involvement
  agreedBy: string[]; // participant IDs
  objectedBy: string[];
  abstained: string[];
  
  // Implementation
  actionItems: ActionItem[];
  successMetrics: string[];
  reviewSchedule: Date[];
  
  // Status
  status: 'proposed' | 'negotiating' | 'agreed' | 'implemented' | 'violated' | 'modified';
  createdAt: Date;
  finalizedAt?: Date;
}

export interface AgreementTerm {
  id: string;
  description: string;
  responsibility: string; // who is responsible
  deadline?: Date;
  measurable: boolean;
  consequences?: string;
}

export interface AgreementTimeline {
  startDate: Date;
  endDate?: Date;
  milestones: Milestone[];
  reviewDates: Date[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  responsible: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignedTo: string[]; // participant IDs
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[]; // other action item IDs
  notes: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface ResolutionGoal {
  id: string;
  title: string;
  description: string;
  type: 'relationship' | 'behavioral' | 'structural' | 'communication' | 'outcome';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Goal specifics
  measurable: boolean;
  successCriteria: string[];
  timeline?: Date;
  
  // Participant alignment
  supportedBy: string[]; // participant IDs
  opposedBy: string[];
  neutralParticipants: string[];
  
  // Progress tracking
  status: 'proposed' | 'accepted' | 'in_progress' | 'achieved' | 'abandoned';
  progressNotes: string[];
  achievedAt?: Date;
}

export interface GroupDynamics {
  // Overall group health
  cohesionLevel: 'low' | 'medium' | 'high';
  trustLevel: 'low' | 'medium' | 'high';
  communicationQuality: 'poor' | 'fair' | 'good' | 'excellent';
  
  // Participation patterns
  dominantParticipants: string[]; // participant IDs
  quietParticipants: string[];
  conflictInstigators: string[];
  peacemakers: string[];
  
  // Relationship mapping
  alliances: ParticipantAlliance[];
  tensions: ParticipantTension[];
  neutralRelationships: string[][]; // pairs of participant IDs
  
  // Communication patterns
  communicationFlow: CommunicationFlow[];
  interruptionPatterns: InterruptionPattern[];
  
  // Emotional climate
  overallMood: 'hostile' | 'tense' | 'neutral' | 'cooperative' | 'positive';
  emotionalVolatility: 'stable' | 'moderate' | 'high';
  
  // Progress indicators
  progressMomentum: 'stalled' | 'slow' | 'steady' | 'accelerating';
  breakthroughMoments: BreakthroughMoment[];
  setbacks: SetbackMoment[];
}

export interface ParticipantAlliance {
  participants: string[]; // participant IDs
  strength: 'weak' | 'moderate' | 'strong';
  basis: 'shared_interests' | 'personal_relationship' | 'common_opposition' | 'strategic';
  formed: Date;
  stability: 'unstable' | 'stable' | 'very_stable';
}

export interface ParticipantTension {
  participants: string[]; // exactly 2 participant IDs
  intensity: 'low' | 'medium' | 'high' | 'severe';
  source: 'historical' | 'current_conflict' | 'personality' | 'values' | 'interests';
  manifestation: 'verbal' | 'non_verbal' | 'avoidance' | 'passive_aggressive';
  escalationRisk: 'low' | 'medium' | 'high';
}

export interface CommunicationFlow {
  from: string; // participant ID
  to: string; // participant ID
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  direction: 'one_way' | 'two_way';
  topics: string[];
}

export interface InterruptionPattern {
  interrupter: string; // participant ID
  interrupted: string; // participant ID
  frequency: number; // per session
  context: 'disagreement' | 'clarification' | 'dominance' | 'excitement';
  impact: 'minimal' | 'moderate' | 'disruptive';
}

export interface BreakthroughMoment {
  id: string;
  timestamp: Date;
  description: string;
  participants: string[]; // who was involved
  type: 'understanding' | 'agreement' | 'emotional' | 'creative_solution';
  impact: 'minor' | 'moderate' | 'major';
  followUpActions: string[];
}

export interface SetbackMoment {
  id: string;
  timestamp: Date;
  description: string;
  participants: string[]; // who was involved
  type: 'disagreement' | 'emotional_outburst' | 'walkout' | 'misunderstanding';
  severity: 'minor' | 'moderate' | 'major';
  recoveryActions: string[];
  recovered: boolean;
}

export interface ParticipationMetrics {
  speakingTime: Record<string, number>; // participant ID -> minutes
  contributionCount: Record<string, number>; // participant ID -> number of contributions
  questionCount: Record<string, number>; // participant ID -> questions asked
  agreementRate: Record<string, number>; // participant ID -> percentage of agreements
  engagementScore: Record<string, number>; // participant ID -> 0-100 score
  emotionalStability: Record<string, number>; // participant ID -> stability score
}

export interface EmotionalJourney {
  timestamp: Date;
  participantEmotions: Record<string, EmotionAnalysis>; // participant ID -> emotions
  groupMood: string;
  intensity: number; // 0-100
  triggers: string[];
  interventions: string[];
}

export interface EmotionalHighlight {
  timestamp: Date;
  participant: string;
  emotion: string;
  intensity: number;
  trigger: string;
  response: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface MultiPartySettings {
  // Session settings
  maxSessionDuration: number; // in minutes
  breakFrequency: number; // minutes between breaks
  maxParticipants: number;
  
  // Communication rules
  speakingTimeLimit: number; // per turn in minutes
  allowInterruptions: boolean;
  requireHandRaising: boolean;
  
  // Facilitation settings
  aiModerationLevel: 'minimal' | 'moderate' | 'active';
  emotionMonitoring: boolean;
  realTimeInsights: boolean;
  
  // Privacy and recording
  recordSessions: boolean;
  shareTranscripts: boolean;
  anonymizeData: boolean;
  
  // Notification settings
  notifyOnJoin: boolean;
  notifyOnLeave: boolean;
  notifyOnAgreement: boolean;
  
  // Accessibility
  closedCaptions: boolean;
  languageTranslation: boolean;
  screenReaderSupport: boolean;
}

// Supporting types
export type RelationshipContext = 
  | 'family_member'
  | 'romantic_partner'
  | 'close_friend'
  | 'colleague'
  | 'supervisor'
  | 'subordinate'
  | 'neighbor'
  | 'acquaintance'
  | 'stranger'
  | 'adversary';

// Multi-party specific actions and events
export interface MultiPartyAction {
  type: 'join' | 'leave' | 'speak' | 'agree' | 'disagree' | 'propose' | 'vote' | 'timeout';
  participantId: string;
  timestamp: Date;
  data?: any;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface GroupMediationWorkflow {
  id: string;
  name: string;
  description: string;
  phases: SessionPhase[];
  estimatedDuration: number;
  maxParticipants: number;
  conflictTypes: ConflictType[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  facilitationRequirements: string[];
}

// Real-time communication types
export interface MultiPartyMessage {
  id: string;
  conflictId: string;
  sessionId: string;
  senderId: string;
  type: 'text' | 'voice' | 'system' | 'facilitation';
  content: string;
  timestamp: Date;
  reactions: MessageReaction[];
  mentions: string[]; // participant IDs
  replyTo?: string; // message ID
  emotionAnalysis?: EmotionAnalysis;
}

export interface MessageReaction {
  participantId: string;
  type: 'agree' | 'disagree' | 'like' | 'concern' | 'question';
  timestamp: Date;
}

export interface MultiPartyNotification {
  id: string;
  conflictId: string;
  type: 'participant_joined' | 'participant_left' | 'agreement_reached' | 'session_starting' | 'action_item_due';
  title: string;
  message: string;
  recipients: string[]; // participant IDs
  timestamp: Date;
  read: Record<string, boolean>; // participant ID -> read status
  actionRequired: boolean;
  actionUrl?: string;
}

