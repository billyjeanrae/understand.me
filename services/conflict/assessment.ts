import { 
  AssessmentQuestion, 
  AssessmentResponse, 
  AssessmentResult, 
  ConflictAssessment,
  ConflictCategory,
  ConflictIntensity,
  ConflictStyle,
  Conflict
} from '../../types/conflict';

/**
 * Conflict Assessment Service
 * Provides comprehensive conflict analysis through validated questionnaires
 */

// Core assessment questionnaire based on conflict resolution research
export const CONFLICT_ASSESSMENT_QUESTIONNAIRE: AssessmentQuestion[] = [
  // Conflict Content Questions
  {
    id: 'conflict_topic',
    text: 'What is this conflict primarily about?',
    type: 'multiple_choice',
    category: 'content',
    required: true,
    options: [
      'Communication and misunderstandings',
      'Money and financial decisions',
      'Time and priorities',
      'Responsibilities and roles',
      'Values and beliefs',
      'Trust and honesty',
      'Intimacy and affection',
      'Future plans and goals',
      'Family and friends',
      'Work and career',
      'Personal habits and behaviors',
      'Other'
    ]
  },
  {
    id: 'conflict_frequency',
    text: 'How often do you and this person have conflicts?',
    type: 'scale',
    category: 'process',
    required: true,
    scaleRange: {
      min: 1,
      max: 5,
      labels: ['Rarely', 'Occasionally', 'Sometimes', 'Often', 'Very Often']
    }
  },
  {
    id: 'conflict_duration',
    text: 'How long has this particular conflict been going on?',
    type: 'multiple_choice',
    category: 'process',
    required: true,
    options: [
      'Less than a day',
      'A few days',
      'About a week',
      'A few weeks',
      'A month or more',
      'Several months',
      'Over a year'
    ]
  },
  {
    id: 'emotional_impact',
    text: 'How much is this conflict affecting your emotional well-being?',
    type: 'scale',
    category: 'emotional',
    required: true,
    scaleRange: {
      min: 1,
      max: 10,
      labels: ['Not at all', 'Slightly', 'Moderately', 'Significantly', 'Extremely']
    }
  },
  {
    id: 'relationship_importance',
    text: 'How important is this relationship to you?',
    type: 'scale',
    category: 'relationship',
    required: true,
    scaleRange: {
      min: 1,
      max: 10,
      labels: ['Not important', 'Somewhat important', 'Important', 'Very important', 'Extremely important']
    }
  },
  {
    id: 'communication_pattern',
    text: 'How would you describe your typical communication during conflicts?',
    type: 'multiple_choice',
    category: 'process',
    required: true,
    options: [
      'We discuss things calmly and respectfully',
      'We raise our voices but stay on topic',
      'We argue intensely but eventually work it out',
      'We avoid talking about the conflict',
      'One person dominates the conversation',
      'We bring up past issues and grievances',
      'We shut down and stop communicating',
      'We involve other people in our conflicts'
    ]
  },
  {
    id: 'resolution_attempts',
    text: 'What have you tried to resolve this conflict?',
    type: 'multiple_choice',
    category: 'process',
    required: false,
    options: [
      'Direct conversation with the person',
      'Writing a letter or message',
      'Asking friends or family for advice',
      'Taking a break from the relationship',
      'Seeking professional help',
      'Trying to ignore the problem',
      'Making compromises',
      'Setting boundaries',
      'Nothing yet - this is my first attempt'
    ]
  },
  {
    id: 'power_dynamics',
    text: 'How would you describe the power balance in this relationship?',
    type: 'multiple_choice',
    category: 'relationship',
    required: true,
    options: [
      'We have equal power and influence',
      'I have more power/influence',
      'They have more power/influence',
      'Power shifts depending on the situation',
      'There are significant power imbalances',
      'I\'m not sure about the power dynamics'
    ]
  },
  {
    id: 'trust_level',
    text: 'How much do you currently trust this person?',
    type: 'scale',
    category: 'relationship',
    required: true,
    scaleRange: {
      min: 1,
      max: 10,
      labels: ['No trust', 'Little trust', 'Some trust', 'Good trust', 'Complete trust']
    }
  },
  {
    id: 'resolution_motivation',
    text: 'How motivated are you to resolve this conflict?',
    type: 'scale',
    category: 'emotional',
    required: true,
    scaleRange: {
      min: 1,
      max: 10,
      labels: ['Not motivated', 'Slightly motivated', 'Moderately motivated', 'Very motivated', 'Extremely motivated']
    }
  },
  {
    id: 'other_party_motivation',
    text: 'How motivated do you think the other person is to resolve this conflict?',
    type: 'scale',
    category: 'relationship',
    required: true,
    scaleRange: {
      min: 1,
      max: 10,
      labels: ['Not motivated', 'Slightly motivated', 'Moderately motivated', 'Very motivated', 'Extremely motivated']
    }
  },
  {
    id: 'physical_symptoms',
    text: 'Are you experiencing any physical symptoms related to this conflict?',
    type: 'multiple_choice',
    category: 'emotional',
    required: false,
    options: [
      'No physical symptoms',
      'Difficulty sleeping',
      'Changes in appetite',
      'Headaches or tension',
      'Stomach problems',
      'Fatigue or low energy',
      'Muscle tension or pain',
      'Other physical symptoms'
    ]
  },
  {
    id: 'conflict_style_self',
    text: 'When in conflict, you typically:',
    type: 'multiple_choice',
    category: 'process',
    required: true,
    options: [
      'Try to win and get your way (Competing)',
      'Give in to keep the peace (Accommodating)',
      'Avoid the conflict altogether (Avoiding)',
      'Work together to find a solution that works for everyone (Collaborating)',
      'Look for a middle ground where both give up something (Compromising)'
    ]
  },
  {
    id: 'desired_outcome',
    text: 'What would an ideal resolution look like for you?',
    type: 'text',
    category: 'content',
    required: true
  },
  {
    id: 'relationship_future',
    text: 'How do you see this relationship in the future?',
    type: 'multiple_choice',
    category: 'relationship',
    required: true,
    options: [
      'I want to strengthen and improve the relationship',
      'I want to maintain the relationship as it is',
      'I\'m unsure about the future of the relationship',
      'I\'m considering ending the relationship',
      'I want to end the relationship but need help doing so',
      'I have no choice but to maintain this relationship'
    ]
  }
];

/**
 * Calculate conflict assessment scores based on responses
 */
export function calculateAssessmentScores(responses: AssessmentResponse[]): AssessmentResult['scores'] {
  const responseMap = new Map(responses.map(r => [r.questionId, r.value]));

  // Conflict Intensity (1-10 scale)
  const emotionalImpact = Number(responseMap.get('emotional_impact')) || 5;
  const frequency = Number(responseMap.get('conflict_frequency')) || 3;
  const duration = getDurationScore(responseMap.get('conflict_duration') as string);
  const physicalSymptoms = getPhysicalSymptomsScore(responseMap.get('physical_symptoms') as string);
  
  const conflictIntensity = Math.round(
    (emotionalImpact * 0.4 + frequency * 2 * 0.3 + duration * 0.2 + physicalSymptoms * 0.1)
  );

  // Relationship Health (1-10 scale)
  const trustLevel = Number(responseMap.get('trust_level')) || 5;
  const relationshipImportance = Number(responseMap.get('relationship_importance')) || 5;
  const powerBalance = getPowerBalanceScore(responseMap.get('power_dynamics') as string);
  const futureOrientation = getFutureOrientationScore(responseMap.get('relationship_future') as string);
  
  const relationshipHealth = Math.round(
    (trustLevel * 0.3 + relationshipImportance * 0.2 + powerBalance * 0.2 + futureOrientation * 0.3)
  );

  // Communication Quality (1-10 scale)
  const communicationPattern = getCommunicationScore(responseMap.get('communication_pattern') as string);
  const resolutionAttempts = getResolutionAttemptsScore(responseMap.get('resolution_attempts') as string);
  
  const communicationQuality = Math.round(
    (communicationPattern * 0.7 + resolutionAttempts * 0.3)
  );

  // Emotional Impact (1-10 scale) - direct from response
  const emotionalImpactScore = emotionalImpact;

  // Resolution Readiness (1-10 scale)
  const selfMotivation = Number(responseMap.get('resolution_motivation')) || 5;
  const otherMotivation = Number(responseMap.get('other_party_motivation')) || 5;
  const conflictStyle = getConflictStyleReadiness(responseMap.get('conflict_style_self') as string);
  
  const resolutionReadiness = Math.round(
    (selfMotivation * 0.4 + otherMotivation * 0.3 + conflictStyle * 0.3)
  );

  return {
    conflictIntensity: Math.max(1, Math.min(10, conflictIntensity)),
    relationshipHealth: Math.max(1, Math.min(10, relationshipHealth)),
    communicationQuality: Math.max(1, Math.min(10, communicationQuality)),
    emotionalImpact: Math.max(1, Math.min(10, emotionalImpactScore)),
    resolutionReadiness: Math.max(1, Math.min(10, resolutionReadiness))
  };
}

/**
 * Generate recommendations based on assessment results
 */
export function generateRecommendations(
  responses: AssessmentResponse[], 
  scores: AssessmentResult['scores']
): string[] {
  const recommendations: string[] = [];
  const responseMap = new Map(responses.map(r => [r.questionId, r.value]));

  // High intensity conflicts
  if (scores.conflictIntensity >= 7) {
    recommendations.push('Consider taking a cooling-off period before attempting resolution');
    recommendations.push('Focus on emotional regulation and self-care during this process');
  }

  // Low relationship health
  if (scores.relationshipHealth <= 4) {
    recommendations.push('Work on rebuilding trust and connection before addressing specific issues');
    recommendations.push('Consider whether this relationship is worth the effort to repair');
  }

  // Poor communication
  if (scores.communicationQuality <= 4) {
    recommendations.push('Practice active listening and "I" statements');
    recommendations.push('Set ground rules for respectful communication');
  }

  // High emotional impact
  if (scores.emotionalImpact >= 7) {
    recommendations.push('Seek emotional support from friends, family, or a counselor');
    recommendations.push('Practice stress management techniques');
  }

  // Low resolution readiness
  if (scores.resolutionReadiness <= 4) {
    recommendations.push('Reflect on your goals and motivations for resolving this conflict');
    recommendations.push('Consider what barriers are preventing resolution');
  }

  // Conflict style specific recommendations
  const conflictStyle = responseMap.get('conflict_style_self') as string;
  if (conflictStyle?.includes('Avoiding')) {
    recommendations.push('Practice expressing your needs and concerns directly');
  } else if (conflictStyle?.includes('Competing')) {
    recommendations.push('Focus on understanding the other person\'s perspective');
  } else if (conflictStyle?.includes('Accommodating')) {
    recommendations.push('Practice advocating for your own needs and interests');
  }

  // Physical symptoms
  if (responseMap.get('physical_symptoms') !== 'No physical symptoms') {
    recommendations.push('Monitor your physical health and consider medical consultation if symptoms persist');
  }

  return recommendations.slice(0, 6); // Limit to top 6 recommendations
}

/**
 * Suggest appropriate conflict resolution approaches
 */
export function suggestApproaches(
  responses: AssessmentResponse[], 
  scores: AssessmentResult['scores']
): string[] {
  const approaches: string[] = [];
  const responseMap = new Map(responses.map(r => [r.questionId, r.value]));

  // High readiness and good relationship health
  if (scores.resolutionReadiness >= 7 && scores.relationshipHealth >= 6) {
    approaches.push('Collaborative problem-solving mediation');
    approaches.push('Interest-based negotiation');
  }

  // Medium readiness
  if (scores.resolutionReadiness >= 5 && scores.resolutionReadiness < 7) {
    approaches.push('Structured communication exercises');
    approaches.push('Gradual trust-building activities');
  }

  // Low readiness but high relationship importance
  if (scores.resolutionReadiness < 5 && Number(responseMap.get('relationship_importance')) >= 7) {
    approaches.push('Individual reflection and preparation');
    approaches.push('Professional counseling or therapy');
  }

  // Communication issues
  if (scores.communicationQuality <= 5) {
    approaches.push('Communication skills training');
    approaches.push('Guided conversation templates');
  }

  // High emotional intensity
  if (scores.emotionalImpact >= 7) {
    approaches.push('Emotion-focused mediation');
    approaches.push('Stress reduction and coping strategies');
  }

  // Power imbalances
  if (responseMap.get('power_dynamics')?.toString().includes('significant power imbalances')) {
    approaches.push('Power-aware mediation techniques');
    approaches.push('Advocacy and empowerment strategies');
  }

  return approaches.slice(0, 5); // Limit to top 5 approaches
}

/**
 * Identify risk factors that might complicate resolution
 */
export function identifyRiskFactors(
  responses: AssessmentResponse[], 
  scores: AssessmentResult['scores']
): string[] {
  const riskFactors: string[] = [];
  const responseMap = new Map(responses.map(r => [r.questionId, r.value]));

  if (scores.conflictIntensity >= 8) {
    riskFactors.push('High conflict intensity may lead to escalation');
  }

  if (scores.relationshipHealth <= 3) {
    riskFactors.push('Poor relationship foundation may hinder resolution');
  }

  if (Number(responseMap.get('trust_level')) <= 3) {
    riskFactors.push('Low trust levels create barriers to open communication');
  }

  if (Number(responseMap.get('other_party_motivation')) <= 3) {
    riskFactors.push('Other party may not be motivated to participate in resolution');
  }

  if (responseMap.get('communication_pattern')?.toString().includes('shut down')) {
    riskFactors.push('Communication shutdown patterns may prevent progress');
  }

  if (responseMap.get('power_dynamics')?.toString().includes('significant power imbalances')) {
    riskFactors.push('Power imbalances may create unfair negotiation conditions');
  }

  const physicalSymptoms = responseMap.get('physical_symptoms') as string;
  if (physicalSymptoms && physicalSymptoms !== 'No physical symptoms') {
    riskFactors.push('Physical stress symptoms indicate high personal impact');
  }

  return riskFactors;
}

/**
 * Identify relationship and personal strengths
 */
export function identifyStrengths(
  responses: AssessmentResponse[], 
  scores: AssessmentResult['scores']
): string[] {
  const strengths: string[] = [];
  const responseMap = new Map(responses.map(r => [r.questionId, r.value]));

  if (scores.resolutionReadiness >= 7) {
    strengths.push('High motivation to resolve the conflict');
  }

  if (Number(responseMap.get('relationship_importance')) >= 7) {
    strengths.push('Strong commitment to the relationship');
  }

  if (Number(responseMap.get('trust_level')) >= 6) {
    strengths.push('Good foundation of trust');
  }

  if (scores.communicationQuality >= 6) {
    strengths.push('Effective communication patterns');
  }

  if (responseMap.get('power_dynamics')?.toString().includes('equal power')) {
    strengths.push('Balanced power dynamics');
  }

  const conflictStyle = responseMap.get('conflict_style_self') as string;
  if (conflictStyle?.includes('Collaborating')) {
    strengths.push('Collaborative conflict resolution style');
  }

  if (Number(responseMap.get('other_party_motivation')) >= 6) {
    strengths.push('Other party appears motivated to resolve');
  }

  const resolutionAttempts = responseMap.get('resolution_attempts') as string;
  if (resolutionAttempts?.includes('Direct conversation')) {
    strengths.push('Willingness to communicate directly');
  }

  return strengths;
}

// Helper functions for scoring
function getDurationScore(duration: string): number {
  const durationMap: Record<string, number> = {
    'Less than a day': 1,
    'A few days': 2,
    'About a week': 3,
    'A few weeks': 4,
    'A month or more': 6,
    'Several months': 8,
    'Over a year': 10
  };
  return durationMap[duration] || 5;
}

function getPhysicalSymptomsScore(symptoms: string): number {
  if (!symptoms || symptoms === 'No physical symptoms') return 1;
  return symptoms.split(',').length + 2; // More symptoms = higher score
}

function getPowerBalanceScore(powerDynamics: string): number {
  const powerMap: Record<string, number> = {
    'We have equal power and influence': 10,
    'Power shifts depending on the situation': 7,
    'I have more power/influence': 6,
    'They have more power/influence': 6,
    'I\'m not sure about the power dynamics': 5,
    'There are significant power imbalances': 2
  };
  return powerMap[powerDynamics] || 5;
}

function getFutureOrientationScore(future: string): number {
  const futureMap: Record<string, number> = {
    'I want to strengthen and improve the relationship': 10,
    'I want to maintain the relationship as it is': 7,
    'I have no choice but to maintain this relationship': 5,
    'I\'m unsure about the future of the relationship': 4,
    'I\'m considering ending the relationship': 2,
    'I want to end the relationship but need help doing so': 1
  };
  return futureMap[future] || 5;
}

function getCommunicationScore(pattern: string): number {
  const communicationMap: Record<string, number> = {
    'We discuss things calmly and respectfully': 10,
    'We argue intensely but eventually work it out': 7,
    'We raise our voices but stay on topic': 6,
    'One person dominates the conversation': 4,
    'We bring up past issues and grievances': 3,
    'We avoid talking about the conflict': 2,
    'We shut down and stop communicating': 1,
    'We involve other people in our conflicts': 2
  };
  return communicationMap[pattern] || 5;
}

function getResolutionAttemptsScore(attempts: string): number {
  if (!attempts) return 3;
  
  const positiveAttempts = [
    'Direct conversation with the person',
    'Making compromises',
    'Setting boundaries',
    'Seeking professional help'
  ];
  
  const attemptsList = attempts.split(',');
  const positiveCount = attemptsList.filter(attempt => 
    positiveAttempts.some(positive => attempt.includes(positive))
  ).length;
  
  return Math.min(10, 3 + positiveCount * 2);
}

function getConflictStyleReadiness(style: string): number {
  const styleMap: Record<string, number> = {
    'Work together to find a solution that works for everyone (Collaborating)': 10,
    'Look for a middle ground where both give up something (Compromising)': 7,
    'Try to win and get your way (Competing)': 5,
    'Give in to keep the peace (Accommodating)': 4,
    'Avoid the conflict altogether (Avoiding)': 2
  };
  return styleMap[style] || 5;
}

/**
 * Create a complete assessment result
 */
export async function processAssessment(
  conflictId: string,
  responses: AssessmentResponse[]
): Promise<AssessmentResult> {
  const scores = calculateAssessmentScores(responses);
  const recommendations = generateRecommendations(responses, scores);
  const suggestedApproaches = suggestApproaches(responses, scores);
  const riskFactors = identifyRiskFactors(responses, scores);
  const strengths = identifyStrengths(responses, scores);

  return {
    id: `assessment_${Date.now()}`,
    conflictId,
    completedAt: new Date(),
    responses,
    scores,
    recommendations,
    suggestedApproaches,
    riskFactors,
    strengths
  };
}

/**
 * Determine conflict category from assessment responses
 */
export function determineConflictCategory(responses: AssessmentResponse[]): ConflictCategory {
  // This would be enhanced with more sophisticated categorization logic
  // For now, this would need to be specified by the user or inferred from context
  return 'other';
}

/**
 * Determine conflict intensity from assessment scores
 */
export function determineConflictIntensity(scores: AssessmentResult['scores']): ConflictIntensity {
  const averageIntensity = (scores.conflictIntensity + scores.emotionalImpact) / 2;
  
  if (averageIntensity >= 8) return 'severe';
  if (averageIntensity >= 6) return 'high';
  if (averageIntensity >= 4) return 'medium';
  return 'low';
}

/**
 * Determine primary conflict style from assessment
 */
export function determineConflictStyle(responses: AssessmentResponse[]): ConflictStyle {
  const responseMap = new Map(responses.map(r => [r.questionId, r.value]));
  const styleResponse = responseMap.get('conflict_style_self') as string;
  
  if (styleResponse?.includes('Competing')) return 'competing';
  if (styleResponse?.includes('Accommodating')) return 'accommodating';
  if (styleResponse?.includes('Avoiding')) return 'avoiding';
  if (styleResponse?.includes('Collaborating')) return 'collaborating';
  if (styleResponse?.includes('Compromising')) return 'compromising';
  
  return 'compromising'; // default
}

