/**
 * Personalization Service
 * Provides personalized experiences based on user profile and behavior patterns
 */

import { 
  UserProfile, 
  ConflictSkill, 
  PersonalizationRecommendation,
  ConflictType,
  LearningActivity 
} from '../../types/user';
import { EmotionAnalysis } from '../ai/emotion';
import { userProfileService } from './profile';

export interface PersonalizedContent {
  systemPrompt: string;
  suggestedResponses: string[];
  recommendedActivities: LearningActivity[];
  adaptedWorkflow: WorkflowAdaptation;
  emotionalSupport: EmotionalSupportStrategy;
}

export interface WorkflowAdaptation {
  sessionDuration: number; // in minutes
  stepPacing: 'slow' | 'normal' | 'fast';
  interventionLevel: 'minimal' | 'moderate' | 'active';
  supportLevel: 'basic' | 'enhanced' | 'intensive';
  customInstructions: string[];
}

export interface EmotionalSupportStrategy {
  primaryApproach: 'validation' | 'problem_solving' | 'emotional_regulation' | 'perspective_shift';
  supportTechniques: string[];
  cautionAreas: string[];
  encouragementStyle: 'gentle' | 'motivational' | 'analytical' | 'empathetic';
}

export interface LearningAdaptation {
  preferredFormat: 'visual' | 'auditory' | 'interactive' | 'text';
  complexity: 'simple' | 'moderate' | 'advanced';
  examples: 'concrete' | 'abstract' | 'personal';
  feedback: 'immediate' | 'delayed' | 'summary';
}

class PersonalizationService {
  /**
   * Generate personalized content for conflict resolution
   */
  async generatePersonalizedContent(
    conflictType: ConflictType,
    emotionAnalysis?: EmotionAnalysis
  ): Promise<PersonalizedContent> {
    const profile = userProfileService.getProfile();
    
    if (!profile) {
      return this.getDefaultContent(conflictType);
    }

    const systemPrompt = this.generatePersonalizedSystemPrompt(profile, conflictType, emotionAnalysis);
    const suggestedResponses = this.generateSuggestedResponses(profile, conflictType, emotionAnalysis);
    const recommendedActivities = this.getRecommendedActivities(profile, conflictType);
    const adaptedWorkflow = this.adaptWorkflow(profile, conflictType, emotionAnalysis);
    const emotionalSupport = this.getEmotionalSupportStrategy(profile, emotionAnalysis);

    return {
      systemPrompt,
      suggestedResponses,
      recommendedActivities,
      adaptedWorkflow,
      emotionalSupport,
    };
  }

  /**
   * Adapt learning experience based on user patterns
   */
  adaptLearningExperience(profile: UserProfile, skill: ConflictSkill): LearningAdaptation {
    const learningStyle = profile.learningPatterns.learningStyle;
    const skillLevel = profile.learningPatterns.skillProgress[skill];
    const adaptationRate = profile.learningPatterns.adaptationRate;

    let preferredFormat: LearningAdaptation['preferredFormat'] = 'interactive';
    if (learningStyle === 'visual') preferredFormat = 'visual';
    else if (learningStyle === 'auditory') preferredFormat = 'auditory';
    else if (learningStyle === 'reading') preferredFormat = 'text';

    let complexity: LearningAdaptation['complexity'] = 'moderate';
    if (skillLevel === 'beginner') complexity = 'simple';
    else if (skillLevel === 'advanced' || skillLevel === 'expert') complexity = 'advanced';

    let examples: LearningAdaptation['examples'] = 'concrete';
    if (profile.personalInfo.occupation?.includes('teacher') || 
        profile.personalInfo.occupation?.includes('counselor')) {
      examples = 'abstract';
    }

    let feedback: LearningAdaptation['feedback'] = 'immediate';
    if (adaptationRate === 'slow') feedback = 'summary';
    else if (adaptationRate === 'fast') feedback = 'immediate';

    return {
      preferredFormat,
      complexity,
      examples,
      feedback,
    };
  }

  /**
   * Generate personalized AI system prompt
   */
  private generatePersonalizedSystemPrompt(
    profile: UserProfile,
    conflictType: ConflictType,
    emotionAnalysis?: EmotionAnalysis
  ): string {
    const basePrompt = `You are Udine, an AI conflict resolution specialist. You're helping someone resolve a ${conflictType} conflict.`;
    
    let personalizations: string[] = [];

    // Communication style adaptations
    const aiStyle = profile.communicationStyle.aiInteractionStyle;
    switch (aiStyle.personality) {
      case 'supportive':
        personalizations.push('Be especially supportive and encouraging in your responses.');
        break;
      case 'direct':
        personalizations.push('Be direct and straightforward while remaining empathetic.');
        break;
      case 'analytical':
        personalizations.push('Provide logical, structured analysis while being emotionally aware.');
        break;
      case 'empathetic':
        personalizations.push('Focus on emotional validation and understanding.');
        break;
    }

    // Intervention level
    switch (aiStyle.interventionLevel) {
      case 'minimal':
        personalizations.push('Provide guidance only when asked, let the user lead the conversation.');
        break;
      case 'active':
        personalizations.push('Actively guide the conversation and provide frequent suggestions.');
        break;
      default:
        personalizations.push('Provide balanced guidance, stepping in when needed.');
    }

    // Feedback style
    switch (aiStyle.feedbackStyle) {
      case 'gentle':
        personalizations.push('Give feedback gently and with care for the user\'s feelings.');
        break;
      case 'direct':
        personalizations.push('Provide clear, direct feedback while being respectful.');
        break;
      case 'encouraging':
        personalizations.push('Focus on encouragement and positive reinforcement.');
        break;
    }

    // Conflict approach adaptation
    const approach = profile.conflictPreferences.preferredApproach;
    switch (approach) {
      case 'collaborative':
        personalizations.push('Focus on win-win solutions and mutual understanding.');
        break;
      case 'competitive':
        personalizations.push('Help the user advocate for their needs while considering others.');
        break;
      case 'accommodating':
        personalizations.push('Help the user balance accommodation with self-advocacy.');
        break;
      case 'avoiding':
        personalizations.push('Gently encourage engagement while respecting their comfort level.');
        break;
      case 'compromising':
        personalizations.push('Focus on finding middle ground and fair solutions.');
        break;
    }

    // Emotional processing style
    const emotionalStyle = profile.conflictPreferences.emotionalProcessingStyle;
    if (emotionalStyle === 'analytical') {
      personalizations.push('Provide logical frameworks for understanding emotions.');
    } else if (emotionalStyle === 'intuitive') {
      personalizations.push('Honor their intuitive understanding and emotional insights.');
    }

    // Trigger topics awareness
    if (profile.conflictPreferences.triggerTopics.length > 0) {
      personalizations.push(`Be especially sensitive around these topics: ${profile.conflictPreferences.triggerTopics.join(', ')}.`);
    }

    // Current emotional state
    if (emotionAnalysis) {
      const primaryEmotion = emotionAnalysis.primaryEmotion;
      if (primaryEmotion) {
        personalizations.push(`The user is currently experiencing ${primaryEmotion.emotion} (${Math.round(primaryEmotion.confidence * 100)}% confidence). Respond appropriately to this emotional state.`);
      }
    }

    // Learning preferences
    const learningStyle = profile.learningPatterns.learningStyle;
    if (learningStyle === 'visual') {
      personalizations.push('Use visual metaphors and descriptive language.');
    } else if (learningStyle === 'auditory') {
      personalizations.push('Use conversational language and verbal explanations.');
    }

    return `${basePrompt}\n\nPersonalization guidelines:\n${personalizations.map(p => `- ${p}`).join('\n')}`;
  }

  /**
   * Generate suggested responses based on user profile
   */
  private generateSuggestedResponses(
    profile: UserProfile,
    conflictType: ConflictType,
    emotionAnalysis?: EmotionAnalysis
  ): string[] {
    const responses: string[] = [];
    const approach = profile.conflictPreferences.preferredApproach;

    // Base responses by conflict approach
    switch (approach) {
      case 'collaborative':
        responses.push("I'd like to understand your perspective better.");
        responses.push("How can we work together to solve this?");
        responses.push("What would a win-win solution look like?");
        break;
      case 'competitive':
        responses.push("I need to be clear about my concerns.");
        responses.push("Here's what I think we should do.");
        responses.push("Let me explain my position.");
        break;
      case 'accommodating':
        responses.push("I want to understand what you need.");
        responses.push("How can I help make this work for you?");
        responses.push("Your feelings are important to me.");
        break;
      case 'avoiding':
        responses.push("Maybe we should take some time to think about this.");
        responses.push("I need to process this before we continue.");
        responses.push("Can we revisit this when we're both calmer?");
        break;
      case 'compromising':
        responses.push("What if we both give a little?");
        responses.push("Let's find a middle ground.");
        responses.push("How about we try this approach?");
        break;
    }

    // Add emotion-specific responses
    if (emotionAnalysis) {
      const primaryEmotion = emotionAnalysis.primaryEmotion;
      if (primaryEmotion) {
        switch (primaryEmotion.emotion.toLowerCase()) {
          case 'anger':
          case 'frustration':
            responses.push("I'm feeling frustrated, and I need a moment.");
            responses.push("Let me explain why this is important to me.");
            break;
          case 'sadness':
          case 'disappointment':
            responses.push("This situation is really affecting me.");
            responses.push("I'm feeling hurt by what happened.");
            break;
          case 'anxiety':
          case 'worry':
            responses.push("I'm concerned about how this might affect us.");
            responses.push("Can we talk about what's worrying me?");
            break;
          case 'confusion':
            responses.push("I'm not sure I understand what's happening.");
            responses.push("Can you help me see your point of view?");
            break;
        }
      }
    }

    // Add conflict-type specific responses
    switch (conflictType) {
      case 'romantic':
        responses.push("Our relationship means a lot to me.");
        responses.push("I want us to work through this together.");
        break;
      case 'family':
        responses.push("Family is important, and so is resolving this.");
        responses.push("I care about our relationship.");
        break;
      case 'workplace':
        responses.push("I want to maintain a professional relationship.");
        responses.push("Let's focus on what's best for the team.");
        break;
      case 'friendship':
        responses.push("Our friendship matters to me.");
        responses.push("I value your perspective.");
        break;
    }

    return responses.slice(0, 6); // Limit to 6 suggestions
  }

  /**
   * Get recommended activities based on profile
   */
  private getRecommendedActivities(
    profile: UserProfile,
    conflictType: ConflictType
  ): LearningActivity[] {
    const activities: LearningActivity[] = [];
    const learningStyle = profile.learningPatterns.learningStyle;
    const preferredActivities = profile.learningPatterns.preferredActivities;

    // Add preferred activities first
    activities.push(...preferredActivities);

    // Add activities based on learning style
    if (learningStyle === 'visual' || learningStyle === 'mixed') {
      if (!activities.includes('perspective_exercises')) {
        activities.push('perspective_exercises');
      }
    }

    if (learningStyle === 'auditory' || learningStyle === 'mixed') {
      if (!activities.includes('communication_practice')) {
        activities.push('communication_practice');
      }
    }

    if (learningStyle === 'kinesthetic' || learningStyle === 'mixed') {
      if (!activities.includes('role_playing')) {
        activities.push('role_playing');
      }
    }

    // Add activities based on conflict type
    switch (conflictType) {
      case 'romantic':
      case 'family':
        if (!activities.includes('emotional_awareness')) {
          activities.push('emotional_awareness');
        }
        break;
      case 'workplace':
        if (!activities.includes('problem_solving_games')) {
          activities.push('problem_solving_games');
        }
        break;
    }

    // Add general beneficial activities
    if (!activities.includes('guided_meditation')) {
      activities.push('guided_meditation');
    }
    if (!activities.includes('reflection_exercises')) {
      activities.push('reflection_exercises');
    }

    return activities.slice(0, 5); // Limit to 5 activities
  }

  /**
   * Adapt workflow based on user preferences
   */
  private adaptWorkflow(
    profile: UserProfile,
    conflictType: ConflictType,
    emotionAnalysis?: EmotionAnalysis
  ): WorkflowAdaptation {
    const sessionDuration = this.getSessionDuration(profile.conflictPreferences.sessionDuration);
    const stepPacing = this.getStepPacing(profile.learningPatterns.adaptationRate);
    const interventionLevel = profile.communicationStyle.aiInteractionStyle.interventionLevel;
    
    let supportLevel: WorkflowAdaptation['supportLevel'] = 'enhanced';
    if (emotionAnalysis) {
      const allEmotions = [emotionAnalysis.primaryEmotion, ...emotionAnalysis.secondaryEmotions];
      const highIntensityEmotions = allEmotions.filter(e => e.confidence > 0.7);
      if (highIntensityEmotions.length > 0) {
        supportLevel = 'intensive';
      }
    }

    const customInstructions = this.generateCustomInstructions(profile, conflictType, emotionAnalysis);

    return {
      sessionDuration,
      stepPacing,
      interventionLevel,
      supportLevel,
      customInstructions,
    };
  }

  /**
   * Get emotional support strategy
   */
  private getEmotionalSupportStrategy(
    profile: UserProfile,
    emotionAnalysis?: EmotionAnalysis
  ): EmotionalSupportStrategy {
    let primaryApproach: EmotionalSupportStrategy['primaryApproach'] = 'validation';
    
    const emotionalStyle = profile.conflictPreferences.emotionalProcessingStyle;
    if (emotionalStyle === 'analytical') {
      primaryApproach = 'problem_solving';
    } else if (emotionalStyle === 'intuitive') {
      primaryApproach = 'validation';
    }

    // Adjust based on current emotions
    if (emotionAnalysis) {
      const primaryEmotion = emotionAnalysis.primaryEmotion;
      if (primaryEmotion) {
        switch (primaryEmotion.emotion.toLowerCase()) {
          case 'anger':
          case 'frustration':
            primaryApproach = 'emotional_regulation';
            break;
          case 'confusion':
            primaryApproach = 'perspective_shift';
            break;
          case 'sadness':
          case 'disappointment':
            primaryApproach = 'validation';
            break;
        }
      }
    }

    const supportTechniques = this.getSupportTechniques(primaryApproach, profile);
    const cautionAreas = profile.conflictPreferences.triggerTopics;
    const encouragementStyle = profile.communicationStyle.aiInteractionStyle.feedbackStyle === 'gentle' 
      ? 'gentle' 
      : profile.communicationStyle.aiInteractionStyle.personality === 'direct' 
        ? 'motivational'
        : profile.communicationStyle.aiInteractionStyle.personality === 'supportive'
          ? 'empathetic'
          : profile.communicationStyle.aiInteractionStyle.personality;

    return {
      primaryApproach,
      supportTechniques,
      cautionAreas,
      encouragementStyle,
    };
  }

  /**
   * Helper methods
   */
  private getDefaultContent(conflictType: ConflictType): PersonalizedContent {
    return {
      systemPrompt: `You are Udine, an AI conflict resolution specialist helping with a ${conflictType} conflict. Be empathetic, supportive, and guide the user toward constructive resolution.`,
      suggestedResponses: [
        "I'd like to understand your perspective.",
        "How can we work together on this?",
        "What would help resolve this situation?",
      ],
      recommendedActivities: ['reflection_exercises', 'communication_practice', 'emotional_awareness'],
      adaptedWorkflow: {
        sessionDuration: 30,
        stepPacing: 'normal',
        interventionLevel: 'moderate',
        supportLevel: 'enhanced',
        customInstructions: [],
      },
      emotionalSupport: {
        primaryApproach: 'validation',
        supportTechniques: ['active_listening', 'emotional_validation', 'perspective_taking'],
        cautionAreas: [],
        encouragementStyle: 'empathetic',
      },
    };
  }

  private getSessionDuration(preference: string): number {
    switch (preference) {
      case 'short': return 15;
      case 'medium': return 30;
      case 'long': return 60;
      case 'flexible': return 45;
      default: return 30;
    }
  }

  private getStepPacing(adaptationRate: string): WorkflowAdaptation['stepPacing'] {
    switch (adaptationRate) {
      case 'fast': return 'fast';
      case 'slow': return 'slow';
      default: return 'normal';
    }
  }

  private generateCustomInstructions(
    profile: UserProfile,
    conflictType: ConflictType,
    emotionAnalysis?: EmotionAnalysis
  ): string[] {
    const instructions: string[] = [];

    // Add instructions based on strengths
    const strengths = profile.conflictPreferences.strengths;
    if (strengths.includes('empathy')) {
      instructions.push('Leverage your natural empathy to understand all perspectives');
    }
    if (strengths.includes('problem_solving')) {
      instructions.push('Use your problem-solving skills to find creative solutions');
    }

    // Add instructions for improvement areas
    const improvementAreas = profile.conflictPreferences.improvementAreas;
    if (improvementAreas.includes('active_listening')) {
      instructions.push('Focus on listening carefully before responding');
    }
    if (improvementAreas.includes('emotional_regulation')) {
      instructions.push('Take breaks if emotions become overwhelming');
    }

    // Add emotional state instructions
    if (emotionAnalysis) {
      const allEmotions = [emotionAnalysis.primaryEmotion, ...emotionAnalysis.secondaryEmotions];
      const highIntensityEmotions = allEmotions.filter(e => e.confidence > 0.7);
      if (highIntensityEmotions.length > 0) {
        instructions.push('Take time to process your emotions before proceeding');
      }
    }

    return instructions;
  }

  private getSupportTechniques(
    approach: EmotionalSupportStrategy['primaryApproach'],
    profile: UserProfile
  ): string[] {
    const baseMap = {
      validation: ['emotional_validation', 'active_listening', 'empathetic_responses'],
      problem_solving: ['structured_analysis', 'solution_brainstorming', 'logical_frameworks'],
      emotional_regulation: ['breathing_exercises', 'mindfulness', 'grounding_techniques'],
      perspective_shift: ['reframing', 'perspective_taking', 'cognitive_restructuring'],
    };

    let techniques = [...baseMap[approach]];

    // Add techniques based on user strengths
    const strengths = profile.conflictPreferences.strengths;
    if (strengths.includes('creativity') && !techniques.includes('creative_problem_solving')) {
      techniques.push('creative_problem_solving');
    }

    return techniques.slice(0, 4); // Limit to 4 techniques
  }
}

// Export singleton instance
export const personalizationService = new PersonalizationService();
export default personalizationService;
