import {
  MediationSession,
  MediationActivity,
  WorkflowStep,
  WorkflowTemplate,
  MediationPhase,
  ConflictCategory,
  ConflictIntensity,
  Conflict,
  ProgressNote
} from '../../types/conflict';
import { EmotionAnalysis } from '../ai/emotion';

/**
 * Mediation Workflow Service
 * Provides structured mediation processes based on proven conflict resolution methodologies
 */

// Predefined workflow templates for different conflict types
export const MEDIATION_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'basic_interpersonal',
    name: 'Basic Interpersonal Conflict Resolution',
    description: 'A foundational workflow for resolving common interpersonal conflicts',
    conflictTypes: ['romantic', 'family', 'friendship'],
    intensity: ['low', 'medium'],
    estimatedTotalDuration: 120, // 2 hours
    difficulty: 'beginner',
    successRate: 0.78,
    tags: ['communication', 'understanding', 'basic'],
    steps: [
      {
        id: 'preparation',
        title: 'Preparation and Goal Setting',
        description: 'Establish the foundation for productive mediation',
        phase: 'preparation',
        estimatedDuration: 15,
        prerequisites: [],
        objectives: [
          'Create a safe and respectful environment',
          'Establish ground rules for communication',
          'Set realistic expectations for the process',
          'Define what success looks like for both parties'
        ],
        activities: [
          'Review ground rules for respectful communication',
          'Identify individual goals and desired outcomes',
          'Agree on confidentiality and process guidelines',
          'Establish check-in procedures and break protocols'
        ],
        successCriteria: [
          'Both parties agree to ground rules',
          'Clear goals are established',
          'Safe environment is confirmed'
        ],
        nextSteps: ['Begin story sharing phase'],
        isCompleted: false
      },
      {
        id: 'story_sharing',
        title: 'Story Sharing and Perspective Exchange',
        description: 'Allow each party to share their perspective without interruption',
        phase: 'exploration',
        estimatedDuration: 30,
        prerequisites: ['preparation'],
        objectives: [
          'Understand each person\'s perspective',
          'Identify key issues and concerns',
          'Practice active listening',
          'Validate emotions and experiences'
        ],
        activities: [
          'Uninterrupted story sharing (10 minutes each)',
          'Active listening practice',
          'Emotion acknowledgment and validation',
          'Clarifying questions and understanding checks'
        ],
        successCriteria: [
          'Both stories have been shared',
          'Key issues are identified',
          'Emotions are acknowledged'
        ],
        nextSteps: ['Explore underlying interests'],
        isCompleted: false
      },
      {
        id: 'interest_exploration',
        title: 'Interest and Needs Exploration',
        description: 'Dig deeper to understand underlying needs and interests',
        phase: 'exploration',
        estimatedDuration: 25,
        prerequisites: ['story_sharing'],
        objectives: [
          'Identify underlying needs and interests',
          'Distinguish between positions and interests',
          'Find common ground and shared concerns',
          'Understand the "why" behind each position'
        ],
        activities: [
          'Interest identification exercises',
          'Needs mapping and prioritization',
          'Common ground discovery',
          'Perspective-taking exercises'
        ],
        successCriteria: [
          'Core interests are identified',
          'Common ground is established',
          'Underlying needs are understood'
        ],
        nextSteps: ['Generate solution options'],
        isCompleted: false
      },
      {
        id: 'option_generation',
        title: 'Creative Solution Generation',
        description: 'Brainstorm multiple options for addressing the conflict',
        phase: 'option_generation',
        estimatedDuration: 25,
        prerequisites: ['interest_exploration'],
        objectives: [
          'Generate multiple creative solutions',
          'Think outside the box',
          'Build on each other\'s ideas',
          'Avoid premature evaluation'
        ],
        activities: [
          'Brainstorming session with judgment suspended',
          'Building on ideas and creative expansion',
          'Option categorization and organization',
          'Feasibility and impact initial assessment'
        ],
        successCriteria: [
          'Multiple options are generated',
          'Creative solutions are explored',
          'Ideas are organized and categorized'
        ],
        nextSteps: ['Evaluate and select solutions'],
        isCompleted: false
      },
      {
        id: 'solution_evaluation',
        title: 'Solution Evaluation and Selection',
        description: 'Evaluate options and select the best solutions',
        phase: 'agreement',
        estimatedDuration: 20,
        prerequisites: ['option_generation'],
        objectives: [
          'Evaluate options against agreed criteria',
          'Select mutually acceptable solutions',
          'Create specific, actionable agreements',
          'Ensure fairness and mutual benefit'
        ],
        activities: [
          'Criteria development for evaluation',
          'Option assessment and ranking',
          'Solution selection and refinement',
          'Agreement drafting and review'
        ],
        successCriteria: [
          'Solutions are selected',
          'Agreements are specific and actionable',
          'Both parties are satisfied with outcomes'
        ],
        nextSteps: ['Create implementation plan'],
        isCompleted: false
      },
      {
        id: 'implementation_planning',
        title: 'Implementation and Follow-up Planning',
        description: 'Create concrete plans for implementing agreements',
        phase: 'implementation',
        estimatedDuration: 15,
        prerequisites: ['solution_evaluation'],
        objectives: [
          'Create specific implementation steps',
          'Assign responsibilities and timelines',
          'Plan for monitoring and adjustment',
          'Schedule follow-up check-ins'
        ],
        activities: [
          'Implementation timeline creation',
          'Responsibility assignment',
          'Success metrics definition',
          'Follow-up scheduling and planning'
        ],
        successCriteria: [
          'Implementation plan is complete',
          'Responsibilities are clear',
          'Follow-up is scheduled'
        ],
        nextSteps: ['Begin implementation'],
        isCompleted: false
      }
    ]
  },
  {
    id: 'workplace_conflict',
    name: 'Workplace Conflict Resolution',
    description: 'Professional mediation workflow for workplace disputes',
    conflictTypes: ['workplace'],
    intensity: ['low', 'medium', 'high'],
    estimatedTotalDuration: 90,
    difficulty: 'intermediate',
    successRate: 0.72,
    tags: ['professional', 'workplace', 'structured'],
    steps: [
      {
        id: 'workplace_preparation',
        title: 'Professional Context Setting',
        description: 'Establish professional mediation framework',
        phase: 'preparation',
        estimatedDuration: 10,
        prerequisites: [],
        objectives: [
          'Establish professional boundaries',
          'Review workplace policies and guidelines',
          'Set expectations for professional conduct',
          'Clarify confidentiality within workplace context'
        ],
        activities: [
          'Review relevant workplace policies',
          'Establish professional communication standards',
          'Clarify reporting and documentation requirements',
          'Set boundaries for personal vs. professional issues'
        ],
        successCriteria: [
          'Professional framework is established',
          'Workplace context is acknowledged',
          'Boundaries are clear'
        ],
        nextSteps: ['Begin issue identification'],
        isCompleted: false
      },
      {
        id: 'issue_identification',
        title: 'Professional Issue Identification',
        description: 'Identify work-related issues and impacts',
        phase: 'exploration',
        estimatedDuration: 20,
        prerequisites: ['workplace_preparation'],
        objectives: [
          'Identify specific workplace issues',
          'Assess impact on work performance',
          'Understand professional relationships',
          'Clarify role and responsibility conflicts'
        ],
        activities: [
          'Work impact assessment',
          'Role and responsibility clarification',
          'Professional relationship mapping',
          'Performance and productivity discussion'
        ],
        successCriteria: [
          'Work issues are clearly identified',
          'Impact on performance is understood',
          'Professional context is established'
        ],
        nextSteps: ['Explore professional solutions'],
        isCompleted: false
      },
      {
        id: 'professional_solutions',
        title: 'Professional Solution Development',
        description: 'Develop workplace-appropriate solutions',
        phase: 'option_generation',
        estimatedDuration: 25,
        prerequisites: ['issue_identification'],
        objectives: [
          'Generate professional solutions',
          'Consider organizational constraints',
          'Ensure compliance with policies',
          'Focus on work effectiveness'
        ],
        activities: [
          'Professional solution brainstorming',
          'Policy compliance review',
          'Resource and constraint assessment',
          'Implementation feasibility analysis'
        ],
        successCriteria: [
          'Professional solutions are identified',
          'Policy compliance is ensured',
          'Implementation is feasible'
        ],
        nextSteps: ['Create professional agreements'],
        isCompleted: false
      },
      {
        id: 'professional_agreement',
        title: 'Professional Agreement and Documentation',
        description: 'Create formal workplace agreements',
        phase: 'agreement',
        estimatedDuration: 20,
        prerequisites: ['professional_solutions'],
        objectives: [
          'Create formal agreements',
          'Document commitments and expectations',
          'Establish monitoring procedures',
          'Plan for escalation if needed'
        ],
        activities: [
          'Formal agreement documentation',
          'Commitment and timeline specification',
          'Monitoring and review procedures',
          'Escalation pathway definition'
        ],
        successCriteria: [
          'Formal agreements are documented',
          'Monitoring procedures are established',
          'Escalation pathways are clear'
        ],
        nextSteps: ['Implement and monitor'],
        isCompleted: false
      },
      {
        id: 'workplace_follow_up',
        title: 'Professional Follow-up and Review',
        description: 'Monitor implementation and adjust as needed',
        phase: 'follow_up',
        estimatedDuration: 15,
        prerequisites: ['professional_agreement'],
        objectives: [
          'Monitor agreement implementation',
          'Assess workplace impact',
          'Make necessary adjustments',
          'Document outcomes and lessons learned'
        ],
        activities: [
          'Implementation monitoring',
          'Workplace impact assessment',
          'Agreement adjustment as needed',
          'Outcome documentation and reporting'
        ],
        successCriteria: [
          'Implementation is monitored',
          'Adjustments are made as needed',
          'Outcomes are documented'
        ],
        nextSteps: ['Continue monitoring or close case'],
        isCompleted: false
      }
    ]
  },
  {
    id: 'high_intensity_conflict',
    name: 'High-Intensity Conflict De-escalation',
    description: 'Specialized workflow for high-emotion, high-stakes conflicts',
    conflictTypes: ['romantic', 'family', 'workplace'],
    intensity: ['high', 'severe'],
    estimatedTotalDuration: 180, // 3 hours
    difficulty: 'advanced',
    successRate: 0.65,
    tags: ['de-escalation', 'high-intensity', 'emotional'],
    steps: [
      {
        id: 'de_escalation',
        title: 'Emotional De-escalation and Stabilization',
        description: 'Reduce emotional intensity and create stability',
        phase: 'preparation',
        estimatedDuration: 30,
        prerequisites: [],
        objectives: [
          'Reduce emotional intensity',
          'Create emotional safety',
          'Establish basic communication',
          'Prevent further escalation'
        ],
        activities: [
          'Breathing and grounding exercises',
          'Emotional regulation techniques',
          'Safety and respect establishment',
          'Basic communication ground rules'
        ],
        successCriteria: [
          'Emotions are more regulated',
          'Basic safety is established',
          'Communication is possible'
        ],
        nextSteps: ['Begin careful exploration'],
        isCompleted: false
      },
      {
        id: 'careful_exploration',
        title: 'Careful Issue Exploration',
        description: 'Gently explore issues while maintaining emotional safety',
        phase: 'exploration',
        estimatedDuration: 45,
        prerequisites: ['de_escalation'],
        objectives: [
          'Understand core issues carefully',
          'Maintain emotional regulation',
          'Identify triggers and sensitivities',
          'Build empathy and understanding'
        ],
        activities: [
          'Gentle story sharing with breaks',
          'Trigger identification and management',
          'Empathy building exercises',
          'Perspective validation and acknowledgment'
        ],
        successCriteria: [
          'Core issues are understood',
          'Emotional safety is maintained',
          'Empathy is developing'
        ],
        nextSteps: ['Focus on healing and repair'],
        isCompleted: false
      },
      {
        id: 'healing_focus',
        title: 'Healing and Relationship Repair',
        description: 'Focus on healing and rebuilding the relationship',
        phase: 'exploration',
        estimatedDuration: 40,
        prerequisites: ['careful_exploration'],
        objectives: [
          'Address emotional wounds',
          'Begin healing process',
          'Rebuild trust and connection',
          'Strengthen relationship foundation'
        ],
        activities: [
          'Emotional wound acknowledgment',
          'Apology and forgiveness processes',
          'Trust rebuilding exercises',
          'Connection strengthening activities'
        ],
        successCriteria: [
          'Emotional wounds are acknowledged',
          'Healing process has begun',
          'Trust is being rebuilt'
        ],
        nextSteps: ['Develop sustainable solutions'],
        isCompleted: false
      },
      {
        id: 'sustainable_solutions',
        title: 'Sustainable Solution Development',
        description: 'Create long-term, sustainable solutions',
        phase: 'option_generation',
        estimatedDuration: 35,
        prerequisites: ['healing_focus'],
        objectives: [
          'Develop sustainable solutions',
          'Prevent future escalation',
          'Create ongoing support systems',
          'Build conflict prevention skills'
        ],
        activities: [
          'Long-term solution development',
          'Prevention strategy creation',
          'Support system establishment',
          'Skill building and practice'
        ],
        successCriteria: [
          'Sustainable solutions are developed',
          'Prevention strategies are in place',
          'Support systems are established'
        ],
        nextSteps: ['Create comprehensive agreements'],
        isCompleted: false
      },
      {
        id: 'comprehensive_agreement',
        title: 'Comprehensive Agreement and Support Planning',
        description: 'Create detailed agreements with ongoing support',
        phase: 'agreement',
        estimatedDuration: 30,
        prerequisites: ['sustainable_solutions'],
        objectives: [
          'Create comprehensive agreements',
          'Plan ongoing support and monitoring',
          'Establish early warning systems',
          'Create resource and help networks'
        ],
        activities: [
          'Detailed agreement creation',
          'Support system planning',
          'Early warning system establishment',
          'Resource network development'
        ],
        successCriteria: [
          'Comprehensive agreements are in place',
          'Support systems are planned',
          'Early warning systems are established'
        ],
        nextSteps: ['Begin supported implementation'],
        isCompleted: false
      }
    ]
  }
];

/**
 * Select appropriate workflow template based on conflict characteristics
 */
export function selectWorkflowTemplate(
  conflict: Conflict,
  assessmentResult?: any
): WorkflowTemplate {
  // Filter workflows by conflict category and intensity
  const suitableWorkflows = MEDIATION_WORKFLOWS.filter(workflow => 
    workflow.conflictTypes.includes(conflict.category) &&
    workflow.intensity.includes(conflict.intensity)
  );

  if (suitableWorkflows.length === 0) {
    // Default to basic interpersonal workflow
    return MEDIATION_WORKFLOWS[0];
  }

  // For high intensity conflicts, prefer specialized workflows
  if (conflict.intensity === 'high' || conflict.intensity === 'severe') {
    const highIntensityWorkflow = suitableWorkflows.find(w => 
      w.tags.includes('high-intensity') || w.tags.includes('de-escalation')
    );
    if (highIntensityWorkflow) return highIntensityWorkflow;
  }

  // For workplace conflicts, prefer professional workflows
  if (conflict.category === 'workplace') {
    const workplaceWorkflow = suitableWorkflows.find(w => 
      w.tags.includes('workplace') || w.tags.includes('professional')
    );
    if (workplaceWorkflow) return workplaceWorkflow;
  }

  // Default to the first suitable workflow
  return suitableWorkflows[0];
}

/**
 * Create a new mediation session
 */
export function createMediationSession(
  conflictId: string,
  workflowTemplate: WorkflowTemplate,
  phase: MediationPhase = 'preparation'
): MediationSession {
  const currentStep = workflowTemplate.steps.find(step => step.phase === phase);
  
  return {
    id: `session_${Date.now()}`,
    conflictId,
    phase,
    startTime: new Date(),
    objectives: currentStep?.objectives || [],
    activities: [],
    insights: [],
    emotionalJourney: [],
    progress: 0,
    nextSteps: currentStep?.nextSteps || [],
    aiSuggestions: [],
    templatesUsed: [],
    interventions: []
  };
}

/**
 * Generate AI-powered suggestions for mediation session
 */
export function generateMediationSuggestions(
  session: MediationSession,
  currentStep: WorkflowStep,
  emotionalContext?: EmotionAnalysis
): string[] {
  const suggestions: string[] = [];

  // Phase-specific suggestions
  switch (session.phase) {
    case 'preparation':
      suggestions.push('Start with a moment of calm breathing to center yourselves');
      suggestions.push('Remind both parties that the goal is understanding, not winning');
      suggestions.push('Establish that it\'s okay to take breaks if emotions become overwhelming');
      break;

    case 'exploration':
      suggestions.push('Use "I" statements to express feelings without blame');
      suggestions.push('Practice reflecting back what you heard before responding');
      suggestions.push('Focus on understanding the other person\'s perspective');
      break;

    case 'option_generation':
      suggestions.push('Think creatively - there may be solutions you haven\'t considered');
      suggestions.push('Build on each other\'s ideas rather than dismissing them');
      suggestions.push('Consider what would work for both of you, not just yourself');
      break;

    case 'agreement':
      suggestions.push('Make sure agreements are specific and actionable');
      suggestions.push('Discuss what success will look like for both of you');
      suggestions.push('Plan for how you\'ll handle setbacks or challenges');
      break;
  }

  // Emotion-aware suggestions
  if (emotionalContext) {
    const { primaryEmotion, conflictIndicators } = emotionalContext;

    if (primaryEmotion.intensity > 0.7) {
      suggestions.push('Consider taking a short break to let emotions settle');
      suggestions.push('Focus on breathing and staying present in the moment');
    }

    if (conflictIndicators.frustration > 0.6) {
      suggestions.push('Acknowledge the frustration - it shows how much this matters');
      suggestions.push('Try to identify what specifically is causing the frustration');
    }

    if (conflictIndicators.defensiveness > 0.6) {
      suggestions.push('Remember that you\'re both on the same team working toward a solution');
      suggestions.push('Try to listen for the underlying concern behind the words');
    }

    if (primaryEmotion.emotion === 'sadness' || primaryEmotion.emotion === 'hurt') {
      suggestions.push('Take time to acknowledge and validate these difficult feelings');
      suggestions.push('Remember that healing takes time and patience');
    }
  }

  return suggestions.slice(0, 4); // Limit to top 4 suggestions
}

/**
 * Create mediation activities based on current step
 */
export function createMediationActivities(step: WorkflowStep): MediationActivity[] {
  const activities: MediationActivity[] = [];

  step.activities.forEach((activityDescription, index) => {
    const activity: MediationActivity = {
      id: `${step.id}_activity_${index}`,
      type: determineActivityType(activityDescription, step.phase),
      title: activityDescription,
      description: getActivityDescription(activityDescription, step.phase),
      duration: Math.round(step.estimatedDuration / step.activities.length),
      instructions: getActivityInstructions(activityDescription, step.phase),
      completed: false
    };
    activities.push(activity);
  });

  return activities;
}

/**
 * Determine activity type based on description and phase
 */
function determineActivityType(description: string, phase: MediationPhase): MediationActivity['type'] {
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes('story') || lowerDesc.includes('sharing')) {
    return 'story_sharing';
  }
  if (lowerDesc.includes('listening') || lowerDesc.includes('reflect')) {
    return 'active_listening';
  }
  if (lowerDesc.includes('interest') || lowerDesc.includes('needs')) {
    return 'interest_exploration';
  }
  if (lowerDesc.includes('brainstorm') || lowerDesc.includes('generate')) {
    return 'brainstorming';
  }
  if (lowerDesc.includes('evaluate') || lowerDesc.includes('assess')) {
    return 'option_evaluation';
  }
  if (lowerDesc.includes('agreement') || lowerDesc.includes('document')) {
    return 'agreement_drafting';
  }

  // Default based on phase
  switch (phase) {
    case 'exploration': return 'story_sharing';
    case 'option_generation': return 'brainstorming';
    case 'agreement': return 'agreement_drafting';
    default: return 'story_sharing';
  }
}

/**
 * Get detailed activity description
 */
function getActivityDescription(title: string, phase: MediationPhase): string {
  const descriptions: Record<string, string> = {
    'story_sharing': 'Each person shares their perspective on the conflict without interruption, focusing on their experience and feelings.',
    'active_listening': 'Practice truly hearing and understanding what the other person is saying, reflecting back what you heard.',
    'interest_exploration': 'Dig deeper to understand the underlying needs, concerns, and interests behind each person\'s position.',
    'brainstorming': 'Generate creative solutions together, building on each other\'s ideas without judgment.',
    'option_evaluation': 'Carefully assess the proposed solutions against agreed-upon criteria to find the best options.',
    'agreement_drafting': 'Create specific, actionable agreements that both parties can commit to implementing.'
  };

  const activityType = determineActivityType(title, phase);
  return descriptions[activityType] || title;
}

/**
 * Get step-by-step instructions for activities
 */
function getActivityInstructions(title: string, phase: MediationPhase): string[] {
  const activityType = determineActivityType(title, phase);

  const instructionSets: Record<string, string[]> = {
    'story_sharing': [
      'Decide who will share first',
      'The first person shares their story for 5-10 minutes without interruption',
      'Focus on your own experience and feelings, not blame or accusations',
      'The listener practices active listening without preparing their response',
      'Switch roles and repeat the process',
      'Both parties acknowledge what they heard'
    ],
    'active_listening': [
      'Make eye contact and give your full attention',
      'Listen for emotions and underlying concerns, not just facts',
      'Avoid interrupting or preparing your response while listening',
      'Reflect back what you heard: "What I\'m hearing is..."',
      'Ask clarifying questions to better understand',
      'Validate the other person\'s feelings and experience'
    ],
    'interest_exploration': [
      'Ask "What\'s really important to you about this?"',
      'Explore the "why" behind each position or request',
      'Identify shared values and common concerns',
      'Distinguish between positions (what you want) and interests (why you want it)',
      'Look for underlying needs that both parties share',
      'Create a list of identified interests and needs'
    ],
    'brainstorming': [
      'Set a timer for focused brainstorming (10-15 minutes)',
      'Generate as many ideas as possible without judging them',
      'Build on each other\'s ideas with "Yes, and..." thinking',
      'Write down all ideas, even ones that seem unrealistic',
      'Encourage creative and outside-the-box thinking',
      'Save evaluation for later - focus only on generation now'
    ],
    'option_evaluation': [
      'Review all the generated options together',
      'Establish criteria for evaluation (fairness, feasibility, mutual benefit)',
      'Rate each option against the agreed criteria',
      'Discuss the pros and cons of top options',
      'Consider combining elements from different options',
      'Select the most promising solutions for further development'
    ],
    'agreement_drafting': [
      'Write down the specific agreements you\'ve reached',
      'Make sure each agreement is clear and actionable',
      'Include who will do what, when, and how',
      'Discuss what success will look like',
      'Plan for how you\'ll handle challenges or setbacks',
      'Both parties review and confirm their commitment'
    ]
  };

  return instructionSets[activityType] || [title];
}

/**
 * Track emotional journey during mediation
 */
export function trackEmotionalJourney(
  session: MediationSession,
  participant: string,
  emotionAnalysis: EmotionAnalysis
): void {
  session.emotionalJourney.push({
    timestamp: new Date(),
    participant,
    emotion: emotionAnalysis.primaryEmotion.emotion,
    intensity: emotionAnalysis.primaryEmotion.intensity
  });
}

/**
 * Create AI intervention based on emotional state
 */
export function createAIIntervention(
  session: MediationSession,
  emotionAnalysis: EmotionAnalysis,
  trigger: string
): void {
  let interventionType: 'de_escalation' | 'reframe' | 'empathy_prompt' | 'break_suggestion';
  let response: string;

  const { primaryEmotion, conflictIndicators } = emotionAnalysis;

  if (primaryEmotion.intensity > 0.8) {
    interventionType = 'de_escalation';
    response = 'I notice emotions are running high. Let\'s take a moment to breathe and center ourselves before continuing.';
  } else if (conflictIndicators.defensiveness > 0.7) {
    interventionType = 'reframe';
    response = 'It sounds like you both care deeply about this. Let\'s focus on what you both want to achieve together.';
  } else if (primaryEmotion.emotion === 'sadness' || primaryEmotion.emotion === 'hurt') {
    interventionType = 'empathy_prompt';
    response = 'I can hear the pain in what you\'re sharing. This clearly matters a lot to you.';
  } else {
    interventionType = 'break_suggestion';
    response = 'This is important work you\'re doing. Would it help to take a short break to process what we\'ve discussed?';
  }

  session.interventions.push({
    timestamp: new Date(),
    type: interventionType,
    trigger,
    response
  });
}

/**
 * Calculate session progress based on completed activities
 */
export function calculateSessionProgress(session: MediationSession): number {
  if (session.activities.length === 0) return 0;
  
  const completedActivities = session.activities.filter(a => a.completed).length;
  return Math.round((completedActivities / session.activities.length) * 100);
}

/**
 * Generate session insights based on activities and emotional journey
 */
export function generateSessionInsights(session: MediationSession): string[] {
  const insights: string[] = [];

  // Analyze emotional journey
  if (session.emotionalJourney.length > 0) {
    const startIntensity = session.emotionalJourney[0]?.intensity || 0;
    const endIntensity = session.emotionalJourney[session.emotionalJourney.length - 1]?.intensity || 0;
    
    if (endIntensity < startIntensity - 0.2) {
      insights.push('Emotional intensity decreased during the session, indicating progress in de-escalation');
    }
    
    const dominantEmotions = session.emotionalJourney.map(e => e.emotion);
    const uniqueEmotions = [...new Set(dominantEmotions)];
    if (uniqueEmotions.length > 3) {
      insights.push('A wide range of emotions were expressed, showing emotional processing and exploration');
    }
  }

  // Analyze activity completion
  const completedActivities = session.activities.filter(a => a.completed);
  if (completedActivities.length === session.activities.length) {
    insights.push('All planned activities were completed successfully');
  }

  // Analyze interventions
  if (session.interventions.length > 0) {
    const interventionTypes = session.interventions.map(i => i.type);
    if (interventionTypes.includes('de_escalation')) {
      insights.push('De-escalation techniques were needed and applied during the session');
    }
  }

  // Default insights if none generated
  if (insights.length === 0) {
    insights.push('Progress was made in understanding each other\'s perspectives');
    insights.push('Both parties engaged constructively in the mediation process');
  }

  return insights;
}

/**
 * Create progress note from mediation session
 */
export function createProgressNote(
  session: MediationSession,
  insights: string[],
  nextSteps: string[]
): ProgressNote {
  const emotionalBefore = session.emotionalJourney[0];
  const emotionalAfter = session.emotionalJourney[session.emotionalJourney.length - 1];

  return {
    id: `note_${Date.now()}`,
    conflictId: session.conflictId,
    timestamp: new Date(),
    phase: session.phase,
    content: `Mediation session completed. Progress: ${session.progress}%. ${insights.join(' ')}`,
    emotionalState: emotionalBefore && emotionalAfter ? {
      before: { emotion: emotionalBefore.emotion, intensity: emotionalBefore.intensity },
      after: { emotion: emotionalAfter.emotion, intensity: emotionalAfter.intensity }
    } : undefined,
    insights,
    nextSteps,
    createdBy: 'ai'
  };
}

