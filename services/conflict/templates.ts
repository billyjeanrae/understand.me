import {
  CommunicationTemplate,
  TemplateSection,
  TemplateExample,
  TemplateVariable,
  ConflictCategory
} from '../../types/conflict';
import { EmotionAnalysis } from '../ai/emotion';

/**
 * Communication Templates Service
 * Provides evidence-based communication scripts for difficult conversations
 */

// Core communication templates for different scenarios
export const COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'constructive_feedback',
    title: 'Giving Constructive Feedback',
    category: 'workplace',
    subcategory: 'feedback',
    conflictTypes: ['workplace', 'family', 'friendship'],
    emotionalContext: ['frustration', 'concern', 'disappointment'],
    difficulty: 'beginner',
    effectiveness: 8.5,
    usageCount: 0,
    tags: ['feedback', 'constructive', 'professional'],
    structure: [
      {
        id: 'opening',
        title: 'Opening Statement',
        content: 'I\'d like to talk with you about {specific_situation}. I care about {relationship_context} and want to work together to improve things.',
        type: 'opening',
        isRequired: true,
        alternatives: [
          'I\'ve been thinking about {specific_situation} and would like to discuss it with you.',
          'Can we talk about {specific_situation}? I think we can find a good solution together.'
        ]
      },
      {
        id: 'observation',
        title: 'Specific Observation',
        content: 'I\'ve noticed that {specific_behavior}. This happened {when_and_where}.',
        type: 'expression',
        isRequired: true,
        alternatives: [
          'What I observed was {specific_behavior} during {when_and_where}.',
          'I want to share what I experienced: {specific_behavior} on {when_and_where}.'
        ]
      },
      {
        id: 'impact',
        title: 'Impact Statement',
        content: 'When this happens, I feel {emotion} because {underlying_need}. It also affects {broader_impact}.',
        type: 'expression',
        isRequired: true,
        alternatives: [
          'The impact on me is {emotion} because {underlying_need}.',
          'This affects me by {broader_impact} and makes me feel {emotion}.'
        ]
      },
      {
        id: 'request',
        title: 'Specific Request',
        content: 'Going forward, I\'d like to request {specific_request}. Would you be willing to {desired_action}?',
        type: 'request',
        isRequired: true,
        alternatives: [
          'What would help me is {specific_request}. How does that sound to you?',
          'I\'d appreciate it if {desired_action}. Is that something you\'d be open to?'
        ]
      },
      {
        id: 'collaboration',
        title: 'Collaborative Closing',
        content: 'I\'m open to hearing your perspective on this. What are your thoughts?',
        type: 'closing',
        isRequired: false,
        alternatives: [
          'How do you see this situation? I\'d like to understand your viewpoint.',
          'What\'s your take on this? I want to make sure we\'re both comfortable with moving forward.'
        ]
      }
    ],
    variables: [
      {
        name: 'specific_situation',
        type: 'text',
        description: 'The specific situation or issue you want to address',
        placeholder: 'the project deadline discussion',
        required: true,
        suggestions: ['our recent meeting', 'the project timeline', 'our communication pattern']
      },
      {
        name: 'relationship_context',
        type: 'relationship',
        description: 'The relationship context',
        placeholder: 'our working relationship',
        required: true,
        suggestions: ['our partnership', 'our team collaboration', 'our friendship']
      },
      {
        name: 'specific_behavior',
        type: 'specific_behavior',
        description: 'The specific behavior you observed',
        placeholder: 'the meeting started 15 minutes late',
        required: true
      },
      {
        name: 'when_and_where',
        type: 'text',
        description: 'When and where this occurred',
        placeholder: 'yesterday during our team meeting',
        required: true
      },
      {
        name: 'emotion',
        type: 'emotion',
        description: 'How you felt about the situation',
        placeholder: 'frustrated',
        required: true,
        suggestions: ['frustrated', 'concerned', 'confused', 'disappointed', 'worried']
      },
      {
        name: 'underlying_need',
        type: 'text',
        description: 'The underlying need or value that was affected',
        placeholder: 'I value punctuality and respect for everyone\'s time',
        required: true
      },
      {
        name: 'broader_impact',
        type: 'text',
        description: 'How this affects the broader situation',
        placeholder: 'our team\'s productivity and morale',
        required: false
      },
      {
        name: 'specific_request',
        type: 'desired_outcome',
        description: 'What you\'d like to see happen',
        placeholder: 'that we start meetings on time',
        required: true
      },
      {
        name: 'desired_action',
        type: 'desired_outcome',
        description: 'The specific action you\'re requesting',
        placeholder: 'commit to arriving a few minutes early',
        required: true
      }
    ],
    examples: [
      {
        id: 'workplace_example',
        scenario: 'Colleague consistently interrupts during meetings',
        filledTemplate: 'I\'d like to talk with you about our team meetings. I care about our working relationship and want to work together to improve things. I\'ve noticed that during discussions, I\'m often interrupted before I can finish my thoughts. This happened yesterday during our project review and again in last week\'s planning session. When this happens, I feel frustrated because I value being able to contribute fully to our team discussions. It also affects my ability to share important insights that could help our projects. Going forward, I\'d like to request that we each have a chance to complete our thoughts before others respond. Would you be willing to help create space for everyone to contribute fully? I\'m open to hearing your perspective on this. What are your thoughts?',
        context: {
          relationship: 'colleague',
          conflictType: 'workplace communication',
          emotionalState: 'frustrated but constructive'
        }
      }
    ],
    adaptations: [
      {
        condition: 'high emotional intensity',
        modification: 'Add more emotional validation and suggest taking breaks if needed'
      },
      {
        condition: 'close personal relationship',
        modification: 'Use more personal language and emphasize care for the relationship'
      }
    ]
  },
  {
    id: 'sincere_apology',
    title: 'Making a Sincere Apology',
    category: 'romantic',
    subcategory: 'apology',
    conflictTypes: ['romantic', 'family', 'friendship'],
    emotionalContext: ['guilt', 'regret', 'sadness', 'shame'],
    difficulty: 'intermediate',
    effectiveness: 9.2,
    usageCount: 0,
    tags: ['apology', 'accountability', 'repair'],
    structure: [
      {
        id: 'acknowledgment',
        title: 'Acknowledgment of Wrongdoing',
        content: 'I want to apologize for {specific_action}. I take full responsibility for {what_you_did_wrong}.',
        type: 'acknowledgment',
        isRequired: true,
        alternatives: [
          'I need to apologize for {specific_action}. What I did was {what_you_did_wrong}.',
          'I\'m sorry for {specific_action}. I recognize that {what_you_did_wrong}.'
        ]
      },
      {
        id: 'impact_recognition',
        title: 'Recognition of Impact',
        content: 'I understand that my actions caused you to feel {impact_on_other}. I can see how {broader_consequences}.',
        type: 'acknowledgment',
        isRequired: true,
        alternatives: [
          'I realize this made you feel {impact_on_other} and resulted in {broader_consequences}.',
          'I can see that what I did led to {impact_on_other} and {broader_consequences}.'
        ]
      },
      {
        id: 'genuine_remorse',
        title: 'Expression of Genuine Remorse',
        content: 'I feel {your_emotion} about this. {relationship_value} means so much to me, and I hate that I\'ve hurt you.',
        type: 'expression',
        isRequired: true,
        alternatives: [
          'I\'m truly {your_emotion} about what happened. You and {relationship_value} are important to me.',
          'I feel {your_emotion} knowing that I\'ve caused you pain. {relationship_value} matters deeply to me.'
        ]
      },
      {
        id: 'commitment_to_change',
        title: 'Commitment to Change',
        content: 'Going forward, I commit to {specific_changes}. I will {concrete_actions} to make sure this doesn\'t happen again.',
        type: 'request',
        isRequired: true,
        alternatives: [
          'I\'m committed to {specific_changes} and will {concrete_actions}.',
          'To prevent this from happening again, I will {specific_changes} and {concrete_actions}.'
        ]
      },
      {
        id: 'making_amends',
        title: 'Making Amends',
        content: 'I want to make this right. {how_to_make_amends}. What else can I do to repair the harm I\'ve caused?',
        type: 'request',
        isRequired: false,
        alternatives: [
          'I\'d like to make amends by {how_to_make_amends}. How can I help repair this?',
          'To make things right, I will {how_to_make_amends}. What would help you feel better about this?'
        ]
      },
      {
        id: 'patience_request',
        title: 'Request for Patience',
        content: 'I understand if you need time to process this. I\'m here when you\'re ready to talk more.',
        type: 'closing',
        isRequired: false,
        alternatives: [
          'I know trust needs to be rebuilt over time. I\'m committed to that process.',
          'I understand if you need space right now. I\'ll be here when you\'re ready.'
        ]
      }
    ],
    variables: [
      {
        name: 'specific_action',
        type: 'specific_behavior',
        description: 'The specific action you\'re apologizing for',
        placeholder: 'breaking my promise to call you back',
        required: true
      },
      {
        name: 'what_you_did_wrong',
        type: 'specific_behavior',
        description: 'What specifically was wrong about your action',
        placeholder: 'I didn\'t follow through on my commitment',
        required: true
      },
      {
        name: 'impact_on_other',
        type: 'emotion',
        description: 'How your actions affected the other person',
        placeholder: 'disappointed and unimportant',
        required: true,
        suggestions: ['hurt', 'disappointed', 'angry', 'betrayed', 'unimportant', 'disrespected']
      },
      {
        name: 'broader_consequences',
        type: 'text',
        description: 'The broader impact of your actions',
        placeholder: 'it damaged trust between us',
        required: true
      },
      {
        name: 'your_emotion',
        type: 'emotion',
        description: 'How you feel about what you did',
        placeholder: 'terrible',
        required: true,
        suggestions: ['terrible', 'awful', 'deeply sorry', 'regretful', 'ashamed']
      },
      {
        name: 'relationship_value',
        type: 'relationship',
        description: 'What the relationship means to you',
        placeholder: 'our relationship',
        required: true,
        suggestions: ['our relationship', 'our friendship', 'our partnership', 'our marriage']
      },
      {
        name: 'specific_changes',
        type: 'desired_outcome',
        description: 'Specific changes you\'ll make',
        placeholder: 'be more reliable with my commitments',
        required: true
      },
      {
        name: 'concrete_actions',
        type: 'desired_outcome',
        description: 'Concrete actions you\'ll take',
        placeholder: 'set reminders and check in with you about my promises',
        required: true
      },
      {
        name: 'how_to_make_amends',
        type: 'desired_outcome',
        description: 'How you plan to make amends',
        placeholder: 'I\'ll make sure to prioritize our plans this weekend',
        required: false
      }
    ],
    examples: [
      {
        id: 'romantic_example',
        scenario: 'Forgot important anniversary dinner',
        filledTemplate: 'I want to apologize for forgetting our anniversary dinner. I take full responsibility for not prioritizing this important date and failing to put it in my calendar. I understand that my actions caused you to feel hurt and unimportant. I can see how this made you question whether I truly value our relationship and our special moments together. I feel terrible about this. Our relationship means so much to me, and I hate that I\'ve hurt you. Going forward, I commit to being more attentive to important dates and events. I will put all our special occasions in my calendar with multiple reminders and check with you regularly about upcoming plans. I want to make this right. I\'ve already made reservations at your favorite restaurant for this weekend, and I\'d like to plan something special to celebrate our anniversary properly. What else can I do to repair the harm I\'ve caused? I understand if you need time to process this. I\'m here when you\'re ready to talk more.',
        context: {
          relationship: 'romantic partner',
          conflictType: 'broken commitment',
          emotionalState: 'regretful and committed to change'
        }
      }
    ],
    adaptations: [
      {
        condition: 'severe trust breach',
        modification: 'Add more detailed accountability and longer-term commitment to rebuilding trust'
      },
      {
        condition: 'repeated offense',
        modification: 'Acknowledge the pattern and provide more concrete evidence of commitment to change'
      }
    ]
  },
  {
    id: 'boundary_setting',
    title: 'Setting Healthy Boundaries',
    category: 'family',
    subcategory: 'boundary_setting',
    conflictTypes: ['family', 'friendship', 'workplace', 'romantic'],
    emotionalContext: ['overwhelmed', 'frustrated', 'anxious'],
    difficulty: 'intermediate',
    effectiveness: 8.7,
    usageCount: 0,
    tags: ['boundaries', 'self-care', 'assertiveness'],
    structure: [
      {
        id: 'relationship_affirmation',
        title: 'Relationship Affirmation',
        content: 'I care about {relationship_description} and want to maintain a healthy relationship with you.',
        type: 'opening',
        isRequired: true,
        alternatives: [
          '{relationship_description} is important to me, and I want us to have a good relationship.',
          'I value {relationship_description} and want to make sure we both feel respected.'
        ]
      },
      {
        id: 'boundary_statement',
        title: 'Clear Boundary Statement',
        content: 'I need to set a boundary around {boundary_area}. Going forward, I won\'t be able to {what_you_wont_do}.',
        type: 'expression',
        isRequired: true,
        alternatives: [
          'I\'ve realized I need to establish a boundary regarding {boundary_area}. I can\'t continue to {what_you_wont_do}.',
          'For my own well-being, I need to set a limit on {boundary_area}. I won\'t be {what_you_wont_do} anymore.'
        ]
      },
      {
        id: 'reason_explanation',
        title: 'Reason for Boundary',
        content: 'This boundary is important because {reason_for_boundary}. When {current_situation}, I feel {your_feelings}.',
        type: 'expression',
        isRequired: true,
        alternatives: [
          'I\'m setting this boundary because {reason_for_boundary}. The current situation makes me feel {your_feelings}.',
          'This is necessary for me because {reason_for_boundary}. I\'ve been feeling {your_feelings} when {current_situation}.'
        ]
      },
      {
        id: 'alternative_offer',
        title: 'Alternative or Compromise',
        content: 'What I can offer instead is {alternative_solution}. I\'m willing to {what_you_will_do}.',
        type: 'request',
        isRequired: false,
        alternatives: [
          'Instead, I can {alternative_solution} and I\'m happy to {what_you_will_do}.',
          'As an alternative, {alternative_solution} would work for me, and I can {what_you_will_do}.'
        ]
      },
      {
        id: 'boundary_enforcement',
        title: 'Boundary Enforcement',
        content: 'If this boundary isn\'t respected, I will need to {consequence}. I hope we can work together to honor this boundary.',
        type: 'request',
        isRequired: true,
        alternatives: [
          'To maintain this boundary, I\'ll need to {consequence} if it\'s not respected.',
          'If this boundary is crossed, I will {consequence}. I\'m hoping for your understanding and support.'
        ]
      },
      {
        id: 'dialogue_invitation',
        title: 'Invitation for Dialogue',
        content: 'I\'m open to discussing this further. How do you feel about this boundary?',
        type: 'closing',
        isRequired: false,
        alternatives: [
          'I\'d like to hear your thoughts on this. What questions do you have?',
          'How does this boundary feel to you? I want to make sure we can work with this together.'
        ]
      }
    ],
    variables: [
      {
        name: 'relationship_description',
        type: 'relationship',
        description: 'How you describe your relationship',
        placeholder: 'our family relationship',
        required: true,
        suggestions: ['our friendship', 'our working relationship', 'our family bond', 'our connection']
      },
      {
        name: 'boundary_area',
        type: 'text',
        description: 'The area where you\'re setting a boundary',
        placeholder: 'last-minute requests for babysitting',
        required: true
      },
      {
        name: 'what_you_wont_do',
        type: 'specific_behavior',
        description: 'What you won\'t do anymore',
        placeholder: 'drop everything to babysit with less than 24 hours notice',
        required: true
      },
      {
        name: 'reason_for_boundary',
        type: 'text',
        description: 'Why this boundary is important',
        placeholder: 'I need to be able to plan my schedule and have some predictability',
        required: true
      },
      {
        name: 'current_situation',
        type: 'text',
        description: 'What\'s happening now that\'s problematic',
        placeholder: 'I get last-minute calls asking me to cancel my plans',
        required: true
      },
      {
        name: 'your_feelings',
        type: 'emotion',
        description: 'How the current situation makes you feel',
        placeholder: 'stressed and taken advantage of',
        required: true,
        suggestions: ['overwhelmed', 'stressed', 'resentful', 'anxious', 'taken advantage of']
      },
      {
        name: 'alternative_solution',
        type: 'desired_outcome',
        description: 'What you can offer instead',
        placeholder: 'regular babysitting with at least a week\'s notice',
        required: false
      },
      {
        name: 'what_you_will_do',
        type: 'desired_outcome',
        description: 'What you\'re willing to do within your boundary',
        placeholder: 'help you find other childcare options',
        required: false
      },
      {
        name: 'consequence',
        type: 'text',
        description: 'What you\'ll do if the boundary isn\'t respected',
        placeholder: 'say no to future requests',
        required: true
      }
    ],
    examples: [
      {
        id: 'family_example',
        scenario: 'Setting boundaries with family member about unannounced visits',
        filledTemplate: 'I care about our family relationship and want to maintain a healthy relationship with you. I need to set a boundary around unannounced visits. Going forward, I won\'t be able to accommodate visits without at least a day\'s notice. This boundary is important because I need to be able to plan my schedule and maintain some structure in my home life. When people drop by unexpectedly, I feel stressed and unprepared to be a good host. What I can offer instead is planned visits that work for both of us. I\'m willing to schedule regular get-togethers and am happy to host when I can prepare. If this boundary isn\'t respected, I will need to not answer the door when people arrive unannounced. I hope we can work together to honor this boundary. I\'m open to discussing this further. How do you feel about this boundary?',
        context: {
          relationship: 'family member',
          conflictType: 'boundary violation',
          emotionalState: 'assertive but caring'
        }
      }
    ],
    adaptations: [
      {
        condition: 'aggressive pushback expected',
        modification: 'Strengthen the consequence statement and add more self-validation'
      },
      {
        condition: 'guilt-tripping likely',
        modification: 'Add statements about self-care being necessary for healthy relationships'
      }
    ]
  }
];

/**
 * Find appropriate templates based on conflict context and emotional state
 */
export function findSuitableTemplates(
  conflictCategory: ConflictCategory,
  conflictType: string,
  emotionalContext?: EmotionAnalysis,
  subcategory?: string
): CommunicationTemplate[] {
  let suitableTemplates = COMMUNICATION_TEMPLATES.filter(template => 
    template.conflictTypes.includes(conflictCategory)
  );

  // Filter by subcategory if provided
  if (subcategory) {
    suitableTemplates = suitableTemplates.filter(template => 
      template.subcategory === subcategory
    );
  }

  // Filter by emotional context if provided
  if (emotionalContext) {
    const primaryEmotion = emotionalContext.primaryEmotion.emotion;
    suitableTemplates = suitableTemplates.filter(template =>
      template.emotionalContext.some(emotion => 
        emotion === primaryEmotion || 
        emotionalContext.secondaryEmotions.some(sec => sec.emotion === emotion)
      )
    );
  }

  // Sort by effectiveness and usage
  return suitableTemplates.sort((a, b) => {
    // Prioritize higher effectiveness
    if (a.effectiveness !== b.effectiveness) {
      return b.effectiveness - a.effectiveness;
    }
    // Then by lower usage count (to promote variety)
    return a.usageCount - b.usageCount;
  });
}

/**
 * Customize template based on specific context
 */
export function customizeTemplate(
  template: CommunicationTemplate,
  variables: Record<string, string>,
  emotionalContext?: EmotionAnalysis
): string {
  let customizedTemplate = '';

  // Build the template from sections
  template.structure.forEach((section, index) => {
    if (section.isRequired || variables[`include_${section.id}`] === 'true') {
      let sectionContent = section.content;

      // Apply emotional adaptations
      if (emotionalContext) {
        const adaptation = template.adaptations.find(adapt => 
          shouldApplyAdaptation(adapt.condition, emotionalContext)
        );
        if (adaptation && section.type === 'expression') {
          sectionContent = applyAdaptation(sectionContent, adaptation.modification);
        }
      }

      // Replace variables
      template.variables.forEach(variable => {
        const placeholder = `{${variable.name}}`;
        const value = variables[variable.name] || variable.placeholder;
        sectionContent = sectionContent.replace(new RegExp(placeholder, 'g'), value);
      });

      customizedTemplate += sectionContent;
      if (index < template.structure.length - 1) {
        customizedTemplate += ' ';
      }
    }
  });

  return customizedTemplate.trim();
}

/**
 * Get template suggestions based on emotional state
 */
export function getTemplateSuggestions(
  emotionalContext: EmotionAnalysis,
  conflictCategory: ConflictCategory
): Array<{ template: CommunicationTemplate; reason: string }> {
  const suggestions: Array<{ template: CommunicationTemplate; reason: string }> = [];

  const { primaryEmotion, conflictIndicators } = emotionalContext;

  // Suggest apology template for guilt/regret
  if (primaryEmotion.emotion === 'guilt' || primaryEmotion.emotion === 'regret') {
    const apologyTemplate = COMMUNICATION_TEMPLATES.find(t => t.subcategory === 'apology');
    if (apologyTemplate) {
      suggestions.push({
        template: apologyTemplate,
        reason: 'You seem to be feeling regret about something - an apology might help repair the relationship'
      });
    }
  }

  // Suggest boundary setting for overwhelm/anxiety
  if (primaryEmotion.emotion === 'overwhelmed' || primaryEmotion.emotion === 'anxiety') {
    const boundaryTemplate = COMMUNICATION_TEMPLATES.find(t => t.subcategory === 'boundary_setting');
    if (boundaryTemplate) {
      suggestions.push({
        template: boundaryTemplate,
        reason: 'You seem overwhelmed - setting clear boundaries might help reduce stress'
      });
    }
  }

  // Suggest feedback template for frustration
  if (conflictIndicators.frustration > 0.6) {
    const feedbackTemplate = COMMUNICATION_TEMPLATES.find(t => t.subcategory === 'feedback');
    if (feedbackTemplate) {
      suggestions.push({
        template: feedbackTemplate,
        reason: 'Your frustration suggests there\'s something specific that needs to be addressed constructively'
      });
    }
  }

  return suggestions;
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  template: CommunicationTemplate,
  variables: Record<string, string>
): { isValid: boolean; missingRequired: string[]; suggestions: Record<string, string[]> } {
  const missingRequired: string[] = [];
  const suggestions: Record<string, string[]> = {};

  template.variables.forEach(variable => {
    const value = variables[variable.name];
    
    if (variable.required && (!value || value.trim() === '')) {
      missingRequired.push(variable.name);
    }

    if (variable.suggestions && variable.suggestions.length > 0) {
      suggestions[variable.name] = variable.suggestions;
    }
  });

  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    suggestions
  };
}

/**
 * Generate template preview with current variables
 */
export function generateTemplatePreview(
  template: CommunicationTemplate,
  variables: Record<string, string>
): string {
  const previewVariables = { ...variables };
  
  // Fill in missing variables with placeholders
  template.variables.forEach(variable => {
    if (!previewVariables[variable.name]) {
      previewVariables[variable.name] = `[${variable.placeholder}]`;
    }
  });

  return customizeTemplate(template, previewVariables);
}

/**
 * Track template usage for analytics
 */
export function trackTemplateUsage(templateId: string, effectiveness?: number): void {
  const template = COMMUNICATION_TEMPLATES.find(t => t.id === templateId);
  if (template) {
    template.usageCount++;
    if (effectiveness !== undefined) {
      // Update effectiveness with weighted average
      const weight = 0.1; // How much new ratings affect the average
      template.effectiveness = template.effectiveness * (1 - weight) + effectiveness * weight;
    }
  }
}

/**
 * Get template effectiveness feedback
 */
export function getTemplateEffectivenessFeedback(templateId: string): {
  averageRating: number;
  usageCount: number;
  successStories: number;
} {
  const template = COMMUNICATION_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    return { averageRating: 0, usageCount: 0, successStories: 0 };
  }

  return {
    averageRating: template.effectiveness,
    usageCount: template.usageCount,
    successStories: Math.round(template.usageCount * (template.effectiveness / 10))
  };
}

// Helper functions
function shouldApplyAdaptation(condition: string, emotionalContext: EmotionAnalysis): boolean {
  const { primaryEmotion, conflictIndicators } = emotionalContext;

  switch (condition) {
    case 'high emotional intensity':
      return primaryEmotion.intensity > 0.7;
    case 'close personal relationship':
      return true; // Would need relationship context to determine
    case 'severe trust breach':
      return conflictIndicators.anger > 0.7 || conflictIndicators.sadness > 0.7;
    case 'repeated offense':
      return true; // Would need history context to determine
    case 'aggressive pushback expected':
      return conflictIndicators.defensiveness > 0.6;
    case 'guilt-tripping likely':
      return conflictIndicators.defensiveness > 0.5;
    default:
      return false;
  }
}

function applyAdaptation(content: string, modification: string): string {
  // This would apply specific modifications based on the adaptation
  // For now, we'll just add the modification as additional context
  return content + ' ' + modification;
}

/**
 * Create a new custom template
 */
export function createCustomTemplate(
  title: string,
  category: ConflictCategory,
  subcategory: string,
  structure: TemplateSection[],
  variables: TemplateVariable[]
): CommunicationTemplate {
  return {
    id: `custom_${Date.now()}`,
    title,
    category,
    subcategory,
    conflictTypes: [category],
    emotionalContext: [],
    difficulty: 'beginner',
    effectiveness: 5.0,
    usageCount: 0,
    tags: ['custom'],
    structure,
    variables,
    examples: [],
    adaptations: []
  };
}

/**
 * Export templates for backup or sharing
 */
export function exportTemplates(): string {
  return JSON.stringify(COMMUNICATION_TEMPLATES, null, 2);
}

/**
 * Import templates from backup or sharing
 */
export function importTemplates(templatesJson: string): CommunicationTemplate[] {
  try {
    const imported = JSON.parse(templatesJson);
    return Array.isArray(imported) ? imported : [];
  } catch (error) {
    console.error('Failed to import templates:', error);
    return [];
  }
}

