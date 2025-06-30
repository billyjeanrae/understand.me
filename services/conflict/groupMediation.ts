/**
 * Group Mediation Workflow Service
 * Manages structured mediation workflows for multi-party conflicts
 */

import { 
  GroupMediationWorkflow,
  SessionPhase,
  PhaseActivity,
  MultiPartyConflict,
  GroupSession,
  ConflictParticipant,
  EmotionalJourney
} from '../../types/multiparty';
import { ConflictType } from '../../types/user';
import { EmotionAnalysis } from '../ai/emotion';
import { personalizationService } from '../user/personalization';

class GroupMediationWorkflowService {
  private workflows: Map<string, GroupMediationWorkflow> = new Map();

  constructor() {
    this.initializeDefaultWorkflows();
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): GroupMediationWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get recommended workflow for conflict
   */
  getRecommendedWorkflow(conflict: MultiPartyConflict): GroupMediationWorkflow {
    const participantCount = conflict.participants.length;
    const conflictType = conflict.type;

    // Select workflow based on conflict characteristics
    if (conflictType === 'family' && participantCount <= 4) {
      return this.workflows.get('family_mediation') || this.getDefaultWorkflow();
    } else if (conflictType === 'workplace' && participantCount <= 6) {
      return this.workflows.get('workplace_mediation') || this.getDefaultWorkflow();
    } else if (participantCount > 6) {
      return this.workflows.get('large_group_mediation') || this.getDefaultWorkflow();
    } else {
      return this.workflows.get('standard_mediation') || this.getDefaultWorkflow();
    }
  }

  /**
   * Adapt workflow based on group dynamics and progress
   */
  async adaptWorkflow(
    workflow: GroupMediationWorkflow,
    conflict: MultiPartyConflict,
    session: GroupSession
  ): Promise<GroupMediationWorkflow> {
    const adaptedWorkflow = { ...workflow };

    // Analyze group dynamics
    const groupDynamics = conflict.groupDynamics;
    const emotionalJourney = session.emotionalJourney;

    // Adjust phases based on group needs
    if (groupDynamics.trustLevel === 'low') {
      // Add trust-building activities
      adaptedWorkflow.phases = this.addTrustBuildingPhases(adaptedWorkflow.phases);
    }

    if (groupDynamics.communicationQuality === 'poor') {
      // Extend communication phases
      adaptedWorkflow.phases = this.extendCommunicationPhases(adaptedWorkflow.phases);
    }

    if (groupDynamics.emotionalVolatility === 'high') {
      // Add emotional regulation breaks
      adaptedWorkflow.phases = this.addEmotionalRegulationBreaks(adaptedWorkflow.phases);
    }

    // Adjust timing based on participation patterns
    const participationMetrics = session.participationMetrics;
    const avgEngagement = Object.values(participationMetrics.engagementScore)
      .reduce((sum, score) => sum + score, 0) / Object.keys(participationMetrics.engagementScore).length;

    if (avgEngagement < 40) {
      // Shorten phases to maintain engagement
      adaptedWorkflow.phases = adaptedWorkflow.phases.map(phase => ({
        ...phase,
        duration: Math.max(5, Math.round(phase.duration * 0.8))
      }));
    }

    return adaptedWorkflow;
  }

  /**
   * Generate facilitation guidance for current phase
   */
  generateFacilitationGuidance(
    phase: SessionPhase,
    conflict: MultiPartyConflict,
    session: GroupSession
  ): string[] {
    const guidance: string[] = [...phase.facilitationNotes];
    const groupDynamics = conflict.groupDynamics;
    const recentEmotions = session.emotionalJourney.slice(-3);

    // Add dynamic guidance based on current state
    switch (phase.type) {
      case 'opening':
        if (groupDynamics.trustLevel === 'low') {
          guidance.push('Spend extra time on trust-building exercises');
          guidance.push('Acknowledge past difficulties openly');
        }
        if (conflict.participants.some(p => p.engagementLevel === 'low')) {
          guidance.push('Check in with quieter participants individually');
        }
        break;

      case 'perspective_sharing':
        if (groupDynamics.dominantParticipants.length > 0) {
          guidance.push('Actively manage speaking time to ensure balance');
          guidance.push('Use structured turn-taking');
        }
        if (this.hasHighEmotionalIntensity(recentEmotions)) {
          guidance.push('Allow for emotional processing time');
          guidance.push('Validate emotions before moving to content');
        }
        break;

      case 'solution_generation':
        if (groupDynamics.progressMomentum === 'stalled') {
          guidance.push('Use creative brainstorming techniques');
          guidance.push('Consider breaking into smaller groups');
        }
        if (groupDynamics.alliances.length > 0) {
          guidance.push('Ensure all perspectives are represented in solutions');
          guidance.push('Address alliance dynamics if they become problematic');
        }
        break;

      case 'negotiation':
        if (groupDynamics.tensions.some(t => t.intensity === 'high')) {
          guidance.push('Address high-tension relationships directly');
          guidance.push('Consider separate caucuses if needed');
        }
        break;

      case 'agreement':
        guidance.push('Ensure all agreements are specific and measurable');
        guidance.push('Confirm understanding from all parties');
        if (conflict.agreements.some(a => a.status === 'negotiating')) {
          guidance.push('Revisit unresolved agreements from previous sessions');
        }
        break;
    }

    // Add participant-specific guidance
    conflict.participants.forEach(participant => {
      if (participant.engagementLevel === 'low') {
        guidance.push(`Check in with ${participant.name} - low engagement detected`);
      }
      if (participant.currentEmotions) {
        const primaryEmotion = participant.currentEmotions.emotions[0];
        if (primaryEmotion && primaryEmotion.score > 0.7) {
          guidance.push(`${participant.name} showing high ${primaryEmotion.name} - provide support`);
        }
      }
    });

    return guidance;
  }

  /**
   * Generate personalized activities for participants
   */
  async generatePersonalizedActivities(
    phase: SessionPhase,
    participants: ConflictParticipant[]
  ): Promise<PhaseActivity[]> {
    const activities: PhaseActivity[] = [...phase.activities];

    // Add activities based on participant characteristics
    const hasAnalyticalParticipants = participants.some(p => p.communicationStyle === 'analytical');
    const hasEmotionalParticipants = participants.some(p => p.communicationStyle === 'emotional');

    if (phase.type === 'perspective_sharing') {
      if (hasAnalyticalParticipants) {
        activities.push({
          id: 'structured_perspective',
          name: 'Structured Perspective Framework',
          type: 'exercise',
          description: 'Use a structured framework to share perspectives',
          duration: 15,
          instructions: [
            'Each participant uses the SOAR framework',
            'Situation: What happened?',
            'Observations: What did you see/hear?',
            'Analysis: What do you think caused this?',
            'Response: What would you like to see happen?'
          ],
          expectedOutcomes: ['Clear, structured perspectives', 'Reduced emotional reactivity']
        });
      }

      if (hasEmotionalParticipants) {
        activities.push({
          id: 'emotional_check_in',
          name: 'Emotional Check-in Circle',
          type: 'reflection',
          description: 'Share current emotional state before perspectives',
          duration: 10,
          instructions: [
            'Go around the circle',
            'Each person shares one word for their current emotion',
            'Optional: Brief explanation of why',
            'No responses or advice - just listening'
          ],
          expectedOutcomes: ['Emotional awareness', 'Increased empathy']
        });
      }
    }

    if (phase.type === 'solution_generation') {
      activities.push({
        id: 'multi_perspective_brainstorm',
        name: 'Multi-Perspective Brainstorming',
        type: 'brainstorming',
        description: 'Generate solutions from different viewpoints',
        duration: 20,
        instructions: [
          'Round 1: Solutions that help Person A',
          'Round 2: Solutions that help Person B',
          'Round 3: Solutions that help everyone',
          'No criticism during brainstorming',
          'Build on others\' ideas'
        ],
        expectedOutcomes: ['Creative solutions', 'Increased perspective-taking']
      });
    }

    return activities;
  }

  /**
   * Assess phase completion and readiness to move forward
   */
  assessPhaseCompletion(
    phase: SessionPhase,
    session: GroupSession,
    conflict: MultiPartyConflict
  ): {
    isComplete: boolean;
    completionPercentage: number;
    recommendations: string[];
  } {
    let completionScore = 0;
    const recommendations: string[] = [];

    switch (phase.type) {
      case 'opening':
        // Check if ground rules established and participants comfortable
        if (session.participationMetrics.contributionCount) {
          const participantCount = Object.keys(session.participationMetrics.contributionCount).length;
          const activeParticipants = conflict.participants.filter(p => p.status === 'joined').length;
          completionScore = (participantCount / activeParticipants) * 100;
        }
        if (completionScore < 80) {
          recommendations.push('Ensure all participants have spoken');
          recommendations.push('Confirm understanding of ground rules');
        }
        break;

      case 'perspective_sharing':
        // Check if all participants have shared their perspective
        const sharedPerspectives = conflict.participants.filter(p => 
          p.perspective.summary && p.perspective.summary.length > 0
        ).length;
        const totalParticipants = conflict.participants.filter(p => p.status === 'joined').length;
        completionScore = (sharedPerspectives / totalParticipants) * 100;
        
        if (completionScore < 100) {
          recommendations.push('Ensure all participants have shared their perspective');
        }
        break;

      case 'issue_identification':
        // Check if core issues have been identified
        if (conflict.resolutionGoals.length > 0) {
          completionScore = Math.min(100, conflict.resolutionGoals.length * 25);
        }
        if (completionScore < 75) {
          recommendations.push('Identify at least 3 core issues to address');
          recommendations.push('Look for common ground and shared concerns');
        }
        break;

      case 'solution_generation':
        // Check if solutions have been generated
        const solutionCount = session.phases
          .filter(p => p.phaseId === phase.id)
          .reduce((count, result) => count + result.outcomes.length, 0);
        completionScore = Math.min(100, solutionCount * 10);
        
        if (completionScore < 60) {
          recommendations.push('Generate more solution options');
          recommendations.push('Encourage creative thinking');
        }
        break;

      case 'agreement':
        // Check if agreements have been reached
        const agreedAgreements = conflict.agreements.filter(a => a.status === 'agreed').length;
        const totalAgreements = conflict.agreements.length;
        if (totalAgreements > 0) {
          completionScore = (agreedAgreements / totalAgreements) * 100;
        }
        if (completionScore < 50) {
          recommendations.push('Work towards at least one concrete agreement');
          recommendations.push('Focus on smaller, achievable agreements first');
        }
        break;

      default:
        completionScore = 75; // Default completion for other phases
    }

    return {
      isComplete: completionScore >= 75,
      completionPercentage: Math.round(completionScore),
      recommendations
    };
  }

  /**
   * Private helper methods
   */
  private initializeDefaultWorkflows(): void {
    // Standard mediation workflow
    this.workflows.set('standard_mediation', {
      id: 'standard_mediation',
      name: 'Standard Group Mediation',
      description: 'A balanced approach suitable for most group conflicts',
      phases: this.createStandardPhases(),
      estimatedDuration: 120,
      maxParticipants: 6,
      conflictTypes: ['interpersonal', 'workplace', 'family'],
      difficultyLevel: 'intermediate',
      facilitationRequirements: ['Basic mediation training', 'Group dynamics awareness']
    });

    // Family mediation workflow
    this.workflows.set('family_mediation', {
      id: 'family_mediation',
      name: 'Family Conflict Mediation',
      description: 'Specialized workflow for family conflicts with emphasis on relationships',
      phases: this.createFamilyPhases(),
      estimatedDuration: 90,
      maxParticipants: 4,
      conflictTypes: ['family'],
      difficultyLevel: 'intermediate',
      facilitationRequirements: ['Family therapy background', 'Emotional regulation skills']
    });

    // Workplace mediation workflow
    this.workflows.set('workplace_mediation', {
      id: 'workplace_mediation',
      name: 'Workplace Team Mediation',
      description: 'Professional mediation focused on work relationships and productivity',
      phases: this.createWorkplacePhases(),
      estimatedDuration: 90,
      maxParticipants: 8,
      conflictTypes: ['workplace'],
      difficultyLevel: 'beginner',
      facilitationRequirements: ['HR knowledge', 'Professional communication skills']
    });

    // Large group mediation workflow
    this.workflows.set('large_group_mediation', {
      id: 'large_group_mediation',
      name: 'Large Group Facilitation',
      description: 'Structured approach for larger groups with multiple perspectives',
      phases: this.createLargeGroupPhases(),
      estimatedDuration: 180,
      maxParticipants: 12,
      conflictTypes: ['workplace', 'neighbor', 'other'],
      difficultyLevel: 'advanced',
      facilitationRequirements: ['Advanced facilitation skills', 'Large group management']
    });
  }

  private createStandardPhases(): SessionPhase[] {
    return [
      {
        id: 'opening',
        name: 'Opening & Ground Rules',
        type: 'opening',
        description: 'Welcome participants and establish safe communication guidelines',
        duration: 15,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Create welcoming atmosphere',
          'Establish confidentiality',
          'Set ground rules for respectful communication',
          'Explain the mediation process'
        ]
      },
      {
        id: 'perspective_sharing',
        name: 'Perspective Sharing',
        type: 'perspective_sharing',
        description: 'Each participant shares their view of the situation',
        duration: 30,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Ensure equal speaking time',
          'No interruptions during sharing',
          'Reflect back what you hear',
          'Focus on feelings and needs, not blame'
        ]
      },
      {
        id: 'issue_identification',
        name: 'Issue Identification',
        type: 'issue_identification',
        description: 'Identify core issues and areas of agreement',
        duration: 20,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Look for common themes',
          'Separate positions from interests',
          'Identify shared values and goals',
          'Prioritize issues to address'
        ]
      },
      {
        id: 'solution_generation',
        name: 'Solution Brainstorming',
        type: 'solution_generation',
        description: 'Generate creative solutions together',
        duration: 25,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Encourage wild ideas',
          'Build on others\' suggestions',
          'No evaluation during brainstorming',
          'Focus on mutual gains'
        ]
      },
      {
        id: 'negotiation',
        name: 'Solution Evaluation',
        type: 'negotiation',
        description: 'Evaluate and refine potential solutions',
        duration: 20,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Use objective criteria',
          'Consider feasibility and fairness',
          'Look for win-win options',
          'Be willing to compromise'
        ]
      },
      {
        id: 'agreement',
        name: 'Agreement Building',
        type: 'agreement',
        description: 'Formalize agreements and action steps',
        duration: 15,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Make agreements specific and measurable',
          'Assign clear responsibilities',
          'Set realistic timelines',
          'Plan follow-up meetings'
        ]
      }
    ];
  }

  private createFamilyPhases(): SessionPhase[] {
    // Similar structure but with family-specific considerations
    const phases = this.createStandardPhases();
    
    // Modify for family context
    phases[0].facilitationNotes.push('Acknowledge family history and relationships');
    phases[1].facilitationNotes.push('Validate emotional experiences');
    phases[1].facilitationNotes.push('Address power dynamics between family members');
    
    return phases;
  }

  private createWorkplacePhases(): SessionPhase[] {
    // Similar structure but with workplace-specific considerations
    const phases = this.createStandardPhases();
    
    // Modify for workplace context
    phases[0].facilitationNotes.push('Maintain professional boundaries');
    phases[0].facilitationNotes.push('Consider organizational policies');
    phases[5].facilitationNotes.push('Align agreements with company values');
    
    return phases;
  }

  private createLargeGroupPhases(): SessionPhase[] {
    // Extended phases for larger groups
    return [
      {
        id: 'opening',
        name: 'Opening & Introductions',
        type: 'opening',
        description: 'Welcome and brief introductions',
        duration: 20,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Use structured introductions',
          'Establish clear facilitation process',
          'Set expectations for large group dynamics'
        ]
      },
      {
        id: 'perspective_sharing',
        name: 'Small Group Perspective Sharing',
        type: 'perspective_sharing',
        description: 'Share perspectives in smaller groups first',
        duration: 45,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Break into groups of 3-4',
          'Rotate group membership',
          'Have groups report back key themes'
        ]
      },
      {
        id: 'issue_identification',
        name: 'Issue Mapping',
        type: 'issue_identification',
        description: 'Map issues and relationships visually',
        duration: 30,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Use visual mapping techniques',
          'Identify issue clusters',
          'Look for systemic patterns'
        ]
      },
      {
        id: 'solution_generation',
        name: 'Multi-Round Brainstorming',
        type: 'solution_generation',
        description: 'Multiple rounds of solution generation',
        duration: 40,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Use structured brainstorming methods',
          'Rotate between individual and group work',
          'Build on previous rounds'
        ]
      },
      {
        id: 'agreement',
        name: 'Consensus Building',
        type: 'agreement',
        description: 'Build consensus on key agreements',
        duration: 45,
        activities: [],
        requiredParticipants: [],
        facilitationNotes: [
          'Use consensus-building techniques',
          'Address objections systematically',
          'Create implementation timeline'
        ]
      }
    ];
  }

  private getDefaultWorkflow(): GroupMediationWorkflow {
    return this.workflows.get('standard_mediation')!;
  }

  private addTrustBuildingPhases(phases: SessionPhase[]): SessionPhase[] {
    const trustPhase: SessionPhase = {
      id: 'trust_building',
      name: 'Trust Building',
      type: 'opening',
      description: 'Activities to build trust and safety',
      duration: 20,
      activities: [],
      requiredParticipants: [],
      facilitationNotes: [
        'Use trust-building exercises',
        'Address past hurts if appropriate',
        'Establish psychological safety'
      ]
    };

    return [phases[0], trustPhase, ...phases.slice(1)];
  }

  private extendCommunicationPhases(phases: SessionPhase[]): SessionPhase[] {
    return phases.map(phase => {
      if (phase.type === 'perspective_sharing' || phase.type === 'issue_identification') {
        return {
          ...phase,
          duration: Math.round(phase.duration * 1.3),
          facilitationNotes: [
            ...phase.facilitationNotes,
            'Take extra time for clarification',
            'Use active listening techniques',
            'Paraphrase to ensure understanding'
          ]
        };
      }
      return phase;
    });
  }

  private addEmotionalRegulationBreaks(phases: SessionPhase[]): SessionPhase[] {
    const breakPhase: SessionPhase = {
      id: 'emotional_break',
      name: 'Emotional Regulation Break',
      type: 'opening',
      description: 'Brief break for emotional regulation',
      duration: 10,
      activities: [],
      requiredParticipants: [],
      facilitationNotes: [
        'Guided breathing exercise',
        'Individual reflection time',
        'Check emotional temperature'
      ]
    };

    // Insert break after perspective sharing
    const perspectiveIndex = phases.findIndex(p => p.type === 'perspective_sharing');
    if (perspectiveIndex >= 0) {
      phases.splice(perspectiveIndex + 1, 0, breakPhase);
    }

    return phases;
  }

  private hasHighEmotionalIntensity(emotionalJourney: EmotionalJourney[]): boolean {
    if (emotionalJourney.length === 0) return false;
    
    const recentIntensity = emotionalJourney.slice(-3).reduce((sum, moment) => sum + moment.intensity, 0) / 3;
    return recentIntensity > 70;
  }
}

// Export singleton instance
export const groupMediationWorkflowService = new GroupMediationWorkflowService();
export default groupMediationWorkflowService;

