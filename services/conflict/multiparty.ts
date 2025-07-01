/**
 * Multi-Party Conflict Service
 * Manages group conflicts, participants, and mediation sessions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  MultiPartyConflict,
  ConflictParticipant,
  GroupSession,
  ConflictAgreement,
  ActionItem,
  ResolutionGoal,
  GroupDynamics,
  MultiPartySettings,
  ParticipationMetrics,
  EmotionalJourney,
  MultiPartyAction,
  MultiPartyMessage
} from '../../types/multiparty';
import { ConflictType } from '../../types/user';
import { EmotionAnalysis } from '../ai/emotion';

const MULTIPARTY_CONFLICTS_KEY = '@understand_me_multiparty_conflicts';
const MULTIPARTY_SESSIONS_KEY = '@understand_me_multiparty_sessions';
const MULTIPARTY_MESSAGES_KEY = '@understand_me_multiparty_messages';

class MultiPartyConflictService {
  private conflicts: Map<string, MultiPartyConflict> = new Map();
  private sessions: Map<string, GroupSession> = new Map();
  private messages: Map<string, MultiPartyMessage[]> = new Map();

  /**
   * Initialize the multi-party conflict service
   */
  async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.loadConflicts(),
        this.loadSessions(),
        this.loadMessages(),
      ]);
    } catch (error) {
      console.error('Failed to initialize multi-party conflict service:', error);
    }
  }

  /**
   * Create a new multi-party conflict
   */
  async createConflict(
    title: string,
    description: string,
    type: ConflictType,
    creatorId: string,
    creatorName: string,
    settings?: Partial<MultiPartySettings>
  ): Promise<MultiPartyConflict> {
    const conflictId = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const defaultSettings: MultiPartySettings = {
      maxSessionDuration: 120,
      breakFrequency: 30,
      maxParticipants: 8,
      speakingTimeLimit: 5,
      allowInterruptions: false,
      requireHandRaising: true,
      aiModerationLevel: 'moderate',
      emotionMonitoring: true,
      realTimeInsights: true,
      recordSessions: true,
      shareTranscripts: true,
      anonymizeData: false,
      notifyOnJoin: true,
      notifyOnLeave: true,
      notifyOnAgreement: true,
      closedCaptions: false,
      languageTranslation: false,
      screenReaderSupport: false,
      ...settings,
    };

    const creator: ConflictParticipant = {
      id: creatorId,
      name: creatorName,
      role: 'primary',
      status: 'joined',
      joinedAt: now,
      lastActiveAt: now,
      perspective: {
        summary: '',
        keyPoints: [],
        emotionalState: 'neutral',
        desiredOutcome: '',
        willingnessToCompromise: 'medium',
        trustLevel: {},
      },
      communicationStyle: 'direct',
      preferredRole: 'speaker',
      engagementLevel: 'high',
      relationshipToOthers: {},
      personalGoals: [],
      concerns: [],
      strengths: [],
    };

    const conflict: MultiPartyConflict = {
      id: conflictId,
      title,
      description,
      type,
      status: 'setup',
      participants: [creator],
      sessionHistory: [],
      createdAt: now,
      updatedAt: now,
      resolutionGoals: [],
      agreements: [],
      groupDynamics: this.initializeGroupDynamics(),
      settings: defaultSettings,
    };

    this.conflicts.set(conflictId, conflict);
    await this.saveConflicts();

    return conflict;
  }

  /**
   * Add participant to conflict
   */
  async addParticipant(
    conflictId: string,
    participantId: string,
    participantName: string,
    role: ConflictParticipant['role'] = 'secondary'
  ): Promise<ConflictParticipant> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    if (conflict.participants.length >= conflict.settings.maxParticipants) {
      throw new Error('Maximum participants reached');
    }

    const existingParticipant = conflict.participants.find(p => p.id === participantId);
    if (existingParticipant) {
      throw new Error('Participant already exists');
    }

    const participant: ConflictParticipant = {
      id: participantId,
      name: participantName,
      role,
      status: 'invited',
      perspective: {
        summary: '',
        keyPoints: [],
        emotionalState: 'neutral',
        desiredOutcome: '',
        willingnessToCompromise: 'medium',
        trustLevel: {},
      },
      communicationStyle: 'direct',
      preferredRole: 'speaker',
      engagementLevel: 'medium',
      relationshipToOthers: {},
      personalGoals: [],
      concerns: [],
      strengths: [],
    };

    conflict.participants.push(participant);
    conflict.updatedAt = new Date();

    // Update group dynamics
    await this.updateGroupDynamics(conflictId);

    this.conflicts.set(conflictId, conflict);
    await this.saveConflicts();

    return participant;
  }

  /**
   * Join a conflict as a participant
   */
  async joinConflict(conflictId: string, participantId: string): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    const participant = conflict.participants.find(p => p.id === participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    if (participant.status === 'joined') {
      return; // Already joined
    }

    participant.status = 'joined';
    participant.joinedAt = new Date();
    participant.lastActiveAt = new Date();

    conflict.updatedAt = new Date();

    await this.updateGroupDynamics(conflictId);

    this.conflicts.set(conflictId, conflict);
    await this.saveConflicts();
  }

  /**
   * Start a new mediation session
   */
  async startSession(
    conflictId: string,
    facilitatorId?: string,
    customAgenda?: Partial<GroupSession['agenda']>
  ): Promise<GroupSession> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    if (conflict.currentSession) {
      throw new Error('Session already in progress');
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const activeParticipants = conflict.participants.filter(p => p.status === 'joined');
    if (activeParticipants.length < 2) {
      throw new Error('At least 2 participants required to start session');
    }

    const session: GroupSession = {
      id: sessionId,
      conflictId,
      sessionNumber: conflict.sessionHistory.length + 1,
      startTime: now,
      plannedDuration: conflict.settings.maxSessionDuration,
      attendees: activeParticipants.map(p => p.id),
      absentees: [],
      agenda: customAgenda ? { ...this.generateDefaultAgenda(conflict), ...customAgenda } : this.generateDefaultAgenda(conflict),
      currentPhase: this.generateDefaultAgenda(conflict).phases[0],
      phases: [],
      facilitationType: facilitatorId ? 'human_led' : 'ai_only',
      agreements: [],
      actionItems: [],
      nextSteps: [],
      participationMetrics: this.initializeParticipationMetrics(activeParticipants),
      emotionalJourney: [],
      satisfactionRatings: {},
      effectivenessScore: 0,
    };

    conflict.currentSession = session;
    conflict.status = 'active';
    conflict.startedAt = conflict.startedAt || now;
    conflict.updatedAt = now;

    this.sessions.set(sessionId, session);
    this.conflicts.set(conflictId, conflict);

    await Promise.all([
      this.saveSessions(),
      this.saveConflicts(),
    ]);

    return session;
  }

  /**
   * End current session
   */
  async endSession(
    conflictId: string,
    sessionId: string,
    satisfactionRatings: Record<string, number> = {}
  ): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    const session = this.sessions.get(sessionId);

    if (!conflict || !session) {
      throw new Error('Conflict or session not found');
    }

    const now = new Date();
    session.endTime = now;
    session.actualDuration = Math.round((now.getTime() - session.startTime.getTime()) / (1000 * 60));
    session.satisfactionRatings = satisfactionRatings;
    session.effectivenessScore = this.calculateSessionEffectiveness(session);

    // Move session to history
    conflict.sessionHistory.push(session);
    conflict.currentSession = undefined;
    conflict.updatedAt = now;

    // Update participant activity
    session.attendees.forEach(participantId => {
      const participant = conflict.participants.find(p => p.id === participantId);
      if (participant) {
        participant.lastActiveAt = now;
      }
    });

    await this.updateGroupDynamics(conflictId);

    this.sessions.delete(sessionId);
    this.conflicts.set(conflictId, conflict);

    await Promise.all([
      this.saveSessions(),
      this.saveConflicts(),
    ]);
  }

  /**
   * Add message to session
   */
  async addMessage(
    conflictId: string,
    sessionId: string,
    senderId: string,
    content: string,
    type: MultiPartyMessage['type'] = 'text',
    emotionAnalysis?: EmotionAnalysis
  ): Promise<MultiPartyMessage> {
    const conflict = this.conflicts.get(conflictId);
    const session = this.sessions.get(sessionId);

    if (!conflict || !session) {
      throw new Error('Conflict or session not found');
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message: MultiPartyMessage = {
      id: messageId,
      conflictId,
      sessionId,
      senderId,
      type,
      content,
      timestamp: new Date(),
      reactions: [],
      mentions: this.extractMentions(content, conflict.participants),
      emotionAnalysis,
    };

    const sessionMessages = this.messages.get(sessionId) || [];
    sessionMessages.push(message);
    this.messages.set(sessionId, sessionMessages);

    // Update participation metrics
    if (session.participationMetrics.contributionCount[senderId]) {
      session.participationMetrics.contributionCount[senderId]++;
    } else {
      session.participationMetrics.contributionCount[senderId] = 1;
    }

    // Update emotional journey if emotion analysis provided
    if (emotionAnalysis) {
      const emotionalMoment: EmotionalJourney = {
        timestamp: new Date(),
        participantEmotions: { [senderId]: emotionAnalysis },
        groupMood: this.calculateGroupMood(session),
        intensity: emotionAnalysis.primaryEmotion?.confidence || 0,
        triggers: [],
        interventions: [],
      };
      session.emotionalJourney.push(emotionalMoment);
    }

    // Update participant activity
    const participant = conflict.participants.find(p => p.id === senderId);
    if (participant) {
      participant.lastActiveAt = new Date();
      participant.currentEmotions = emotionAnalysis;
    }

    this.sessions.set(sessionId, session);
    this.conflicts.set(conflictId, conflict);

    await Promise.all([
      this.saveMessages(),
      this.saveSessions(),
      this.saveConflicts(),
    ]);

    return message;
  }

  /**
   * Create agreement
   */
  async createAgreement(
    conflictId: string,
    title: string,
    description: string,
    type: ConflictAgreement['type'],
    terms: ConflictAgreement['terms'],
    proposedBy: string
  ): Promise<ConflictAgreement> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    const agreementId = `agreement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const agreement: ConflictAgreement = {
      id: agreementId,
      title,
      description,
      type,
      terms,
      conditions: [],
      timeline: {
        startDate: new Date(),
        milestones: [],
        reviewDates: [],
      },
      agreedBy: [proposedBy],
      objectedBy: [],
      abstained: [],
      actionItems: [],
      successMetrics: [],
      reviewSchedule: [],
      status: 'proposed',
      createdAt: new Date(),
    };

    conflict.agreements.push(agreement);
    conflict.updatedAt = new Date();

    this.conflicts.set(conflictId, conflict);
    await this.saveConflicts();

    return agreement;
  }

  /**
   * Vote on agreement
   */
  async voteOnAgreement(
    conflictId: string,
    agreementId: string,
    participantId: string,
    vote: 'agree' | 'disagree' | 'abstain'
  ): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    const agreement = conflict.agreements.find(a => a.id === agreementId);
    if (!agreement) {
      throw new Error('Agreement not found');
    }

    // Remove participant from all vote arrays
    agreement.agreedBy = agreement.agreedBy.filter(id => id !== participantId);
    agreement.objectedBy = agreement.objectedBy.filter(id => id !== participantId);
    agreement.abstained = agreement.abstained.filter(id => id !== participantId);

    // Add to appropriate array
    switch (vote) {
      case 'agree':
        agreement.agreedBy.push(participantId);
        break;
      case 'disagree':
        agreement.objectedBy.push(participantId);
        break;
      case 'abstain':
        agreement.abstained.push(participantId);
        break;
    }

    // Check if agreement is reached
    const totalParticipants = conflict.participants.filter(p => p.status === 'joined').length;
    const totalVotes = agreement.agreedBy.length + agreement.objectedBy.length + agreement.abstained.length;
    
    if (totalVotes === totalParticipants) {
      if (agreement.objectedBy.length === 0 && agreement.agreedBy.length > 0) {
        agreement.status = 'agreed';
        agreement.finalizedAt = new Date();
      } else if (agreement.objectedBy.length > 0) {
        agreement.status = 'negotiating';
      }
    }

    conflict.updatedAt = new Date();
    this.conflicts.set(conflictId, conflict);
    await this.saveConflicts();
  }

  /**
   * Get conflict by ID
   */
  getConflict(conflictId: string): MultiPartyConflict | undefined {
    return this.conflicts.get(conflictId);
  }

  /**
   * Get all conflicts for a participant
   */
  getConflictsForParticipant(participantId: string): MultiPartyConflict[] {
    return Array.from(this.conflicts.values()).filter(conflict =>
      conflict.participants.some(p => p.id === participantId)
    );
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): GroupSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get messages for session
   */
  getSessionMessages(sessionId: string): MultiPartyMessage[] {
    return this.messages.get(sessionId) || [];
  }

  /**
   * Private helper methods
   */
  private async loadConflicts(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(MULTIPARTY_CONFLICTS_KEY);
      if (data) {
        const conflicts = JSON.parse(data) as MultiPartyConflict[];
        conflicts.forEach(conflict => {
          // Convert date strings back to Date objects
          conflict.createdAt = new Date(conflict.createdAt);
          conflict.updatedAt = new Date(conflict.updatedAt);
          if (conflict.startedAt) conflict.startedAt = new Date(conflict.startedAt);
          if (conflict.resolvedAt) conflict.resolvedAt = new Date(conflict.resolvedAt);
          
          this.conflicts.set(conflict.id, conflict);
        });
      }
    } catch (error) {
      console.error('Failed to load multi-party conflicts:', error);
    }
  }

  private async saveConflicts(): Promise<void> {
    try {
      const conflicts = Array.from(this.conflicts.values());
      await AsyncStorage.setItem(MULTIPARTY_CONFLICTS_KEY, JSON.stringify(conflicts));
    } catch (error) {
      console.error('Failed to save multi-party conflicts:', error);
    }
  }

  private async loadSessions(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(MULTIPARTY_SESSIONS_KEY);
      if (data) {
        const sessions = JSON.parse(data) as GroupSession[];
        sessions.forEach(session => {
          // Convert date strings back to Date objects
          session.startTime = new Date(session.startTime);
          if (session.endTime) session.endTime = new Date(session.endTime);
          
          this.sessions.set(session.id, session);
        });
      }
    } catch (error) {
      console.error('Failed to load multi-party sessions:', error);
    }
  }

  private async saveSessions(): Promise<void> {
    try {
      const sessions = Array.from(this.sessions.values());
      await AsyncStorage.setItem(MULTIPARTY_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save multi-party sessions:', error);
    }
  }

  private async loadMessages(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(MULTIPARTY_MESSAGES_KEY);
      if (data) {
        const messagesData = JSON.parse(data) as Record<string, MultiPartyMessage[]>;
        Object.entries(messagesData).forEach(([sessionId, messages]) => {
          // Convert date strings back to Date objects
          messages.forEach(message => {
            message.timestamp = new Date(message.timestamp);
          });
          this.messages.set(sessionId, messages);
        });
      }
    } catch (error) {
      console.error('Failed to load multi-party messages:', error);
    }
  }

  private async saveMessages(): Promise<void> {
    try {
      const messagesData: Record<string, MultiPartyMessage[]> = {};
      this.messages.forEach((messages, sessionId) => {
        messagesData[sessionId] = messages;
      });
      await AsyncStorage.setItem(MULTIPARTY_MESSAGES_KEY, JSON.stringify(messagesData));
    } catch (error) {
      console.error('Failed to save multi-party messages:', error);
    }
  }

  private initializeGroupDynamics(): GroupDynamics {
    return {
      cohesionLevel: 'medium',
      trustLevel: 'medium',
      communicationQuality: 'fair',
      dominantParticipants: [],
      quietParticipants: [],
      conflictInstigators: [],
      peacemakers: [],
      alliances: [],
      tensions: [],
      neutralRelationships: [],
      communicationFlow: [],
      interruptionPatterns: [],
      overallMood: 'neutral',
      emotionalVolatility: 'moderate',
      progressMomentum: 'steady',
      breakthroughMoments: [],
      setbacks: [],
    };
  }

  private generateDefaultAgenda(conflict: MultiPartyConflict): GroupSession['agenda'] {
    const phases = [
      {
        id: 'opening',
        name: 'Opening & Introductions',
        type: 'opening' as const,
        description: 'Welcome participants and set ground rules',
        duration: 15,
        activities: [],
        requiredParticipants: conflict.participants.map(p => p.id),
        facilitationNotes: ['Establish safe space', 'Review ground rules', 'Set expectations'],
      },
      {
        id: 'perspective_sharing',
        name: 'Perspective Sharing',
        type: 'perspective_sharing' as const,
        description: 'Each participant shares their perspective',
        duration: 30,
        activities: [],
        requiredParticipants: conflict.participants.map(p => p.id),
        facilitationNotes: ['Ensure equal speaking time', 'No interruptions', 'Active listening'],
      },
      {
        id: 'issue_identification',
        name: 'Issue Identification',
        type: 'issue_identification' as const,
        description: 'Identify core issues and common ground',
        duration: 20,
        activities: [],
        requiredParticipants: conflict.participants.map(p => p.id),
        facilitationNotes: ['Focus on interests, not positions', 'Look for shared concerns'],
      },
      {
        id: 'solution_generation',
        name: 'Solution Generation',
        type: 'solution_generation' as const,
        description: 'Brainstorm potential solutions',
        duration: 25,
        activities: [],
        requiredParticipants: conflict.participants.map(p => p.id),
        facilitationNotes: ['Encourage creativity', 'No judgment during brainstorming'],
      },
      {
        id: 'agreement',
        name: 'Agreement Building',
        type: 'agreement' as const,
        description: 'Work towards agreements and action items',
        duration: 20,
        activities: [],
        requiredParticipants: conflict.participants.map(p => p.id),
        facilitationNotes: ['Be specific about commitments', 'Set clear timelines'],
      },
      {
        id: 'closing',
        name: 'Closing & Next Steps',
        type: 'closing' as const,
        description: 'Summarize agreements and plan follow-up',
        duration: 10,
        activities: [],
        requiredParticipants: conflict.participants.map(p => p.id),
        facilitationNotes: ['Confirm understanding', 'Schedule follow-up if needed'],
      },
    ];

    return {
      phases,
      timeAllocations: phases.reduce((acc, phase) => {
        acc[phase.id] = phase.duration;
        return acc;
      }, {} as Record<string, number>),
      breakSchedule: [],
      specialConsiderations: [],
    };
  }

  private initializeParticipationMetrics(participants: ConflictParticipant[]): ParticipationMetrics {
    const metrics: ParticipationMetrics = {
      speakingTime: {},
      contributionCount: {},
      questionCount: {},
      agreementRate: {},
      engagementScore: {},
      emotionalStability: {},
    };

    participants.forEach(participant => {
      metrics.speakingTime[participant.id] = 0;
      metrics.contributionCount[participant.id] = 0;
      metrics.questionCount[participant.id] = 0;
      metrics.agreementRate[participant.id] = 0;
      metrics.engagementScore[participant.id] = 50;
      metrics.emotionalStability[participant.id] = 50;
    });

    return metrics;
  }

  private calculateSessionEffectiveness(session: GroupSession): number {
    let score = 50; // Base score

    // Agreement factor
    if (session.agreements.length > 0) {
      score += session.agreements.length * 10;
    }

    // Participation factor
    const participationScores = Object.values(session.participationMetrics.engagementScore);
    const avgParticipation = participationScores.reduce((sum, score) => sum + score, 0) / participationScores.length;
    score += (avgParticipation - 50) * 0.5;

    // Satisfaction factor
    const satisfactionScores = Object.values(session.satisfactionRatings);
    if (satisfactionScores.length > 0) {
      const avgSatisfaction = satisfactionScores.reduce((sum, rating) => sum + rating, 0) / satisfactionScores.length;
      score += (avgSatisfaction - 5) * 5; // Assuming 1-10 scale
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateGroupMood(session: GroupSession): string {
    const recentEmotions = session.emotionalJourney.slice(-5);
    if (recentEmotions.length === 0) return 'neutral';

    // Simple mood calculation based on recent emotions
    const positiveEmotions = ['joy', 'satisfaction', 'hope', 'relief'];
    const negativeEmotions = ['anger', 'frustration', 'sadness', 'anxiety'];

    let positiveCount = 0;
    let negativeCount = 0;

    recentEmotions.forEach(moment => {
      Object.values(moment.participantEmotions).forEach(analysis => {
        const allEmotions = [analysis.primaryEmotion, ...analysis.secondaryEmotions];
        allEmotions.forEach(emotion => {
          if (positiveEmotions.includes(emotion.emotion.toLowerCase())) {
            positiveCount += emotion.confidence;
          } else if (negativeEmotions.includes(emotion.emotion.toLowerCase())) {
            negativeCount += emotion.confidence;
          }
        });
      });
    });

    if (positiveCount > negativeCount * 1.5) return 'positive';
    if (negativeCount > positiveCount * 1.5) return 'tense';
    return 'neutral';
  }

  private extractMentions(content: string, participants: ConflictParticipant[]): string[] {
    const mentions: string[] = [];
    participants.forEach(participant => {
      if (content.toLowerCase().includes(participant.name.toLowerCase()) ||
          content.includes(`@${participant.name}`) ||
          content.includes(`@${participant.id}`)) {
        mentions.push(participant.id);
      }
    });
    return mentions;
  }

  private async updateGroupDynamics(conflictId: string): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return;

    // This would be a complex algorithm to analyze group dynamics
    // For now, we'll do basic updates
    const activeParticipants = conflict.participants.filter(p => p.status === 'joined');
    
    if (activeParticipants.length >= 3) {
      conflict.groupDynamics.cohesionLevel = 'medium';
    }

    // Update trust levels based on agreements and interactions
    const agreementRate = conflict.agreements.filter(a => a.status === 'agreed').length / Math.max(conflict.agreements.length, 1);
    if (agreementRate > 0.7) {
      conflict.groupDynamics.trustLevel = 'high';
    } else if (agreementRate > 0.3) {
      conflict.groupDynamics.trustLevel = 'medium';
    } else {
      conflict.groupDynamics.trustLevel = 'low';
    }

    conflict.updatedAt = new Date();
  }
}

// Export singleton instance
export const multiPartyConflictService = new MultiPartyConflictService();
export default multiPartyConflictService;
