import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { analyzeEmotion, EmotionAnalysis, getEmotionAwareResponseSuggestions } from './emotion'
import { personalizationService } from '../user/personalization';
import { userProfileService } from '../user/profile';
import { ConflictType } from '../../types/user';

export interface ChatOptions {
  includeEmotionAnalysis?: boolean;
  emotionContext?: EmotionAnalysis;
  conflictResolutionMode?: 'mediation' | 'coaching' | 'support';
  conflictType?: ConflictType;
  usePersonalization?: boolean;
}

export interface ChatResponse {
  text: string;
  emotionAnalysis?: EmotionAnalysis;
  suggestions?: string[];
  conflictInsights?: {
    emotionalState: string;
    recommendedApproach: string;
    nextSteps: string[];
  };
}

/**
 * Enhanced chat function with emotion-aware conflict resolution
 */
export async function chatWithUdine(
	history: { role: 'user' | 'assistant'; content: string }[],
	message: string,
	options: ChatOptions = {}
): Promise<string> {
	try {
		// Analyze emotions in the user's message
		let emotionAnalysis: EmotionAnalysis | undefined;
		if (options.includeEmotionAnalysis !== false) {
			try {
				emotionAnalysis = await analyzeEmotion(message, 'text', {
					includeRecommendations: true,
					conflictContext: true,
				});
			} catch (error) {
				console.warn('Emotion analysis failed, continuing without it:', error);
			}
		}

		// Use provided emotion context or the analyzed emotions
		const currentEmotions = options.emotionContext || emotionAnalysis;

		// Build personalized system prompt
		let systemPrompt = buildEmotionAwareSystemPrompt(currentEmotions, options.conflictResolutionMode);
		
		// Apply personalization if enabled and profile exists
		if (options.usePersonalization !== false && options.conflictType) {
			try {
				const personalizedContent = await personalizationService.generatePersonalizedContent(
					options.conflictType,
					currentEmotions
				);
				systemPrompt = personalizedContent.systemPrompt;
			} catch (error) {
				console.warn('Personalization failed, using default prompt:', error);
			}
		}

		// Generate AI response
		const { text } = await generateText({
			model: google('gemini-2.0-flash-exp'),
			system: systemPrompt,
			messages: [...history, { role: 'user', content: message }]
		});

		return text;
	} catch (error) {
		console.error('Chat with Udine error:', error);
		// Fallback response
		return "I'm here to help you work through this. Could you tell me more about what's happening?";
	}
}

/**
 * Enhanced chat function that returns full response with emotion analysis
 */
export async function chatWithUdineEnhanced(
	history: { role: 'user' | 'assistant'; content: string }[],
	message: string,
	options: ChatOptions = {}
): Promise<ChatResponse> {
	try {
		// Analyze emotions in the user's message
		const emotionAnalysis = await analyzeEmotion(message, 'text', {
			includeRecommendations: true,
			conflictContext: true,
		});

		// Use provided emotion context or the analyzed emotions
		const currentEmotions = options.emotionContext || emotionAnalysis;

		// Build emotion-aware system prompt
		const systemPrompt = buildEmotionAwareSystemPrompt(currentEmotions, options.conflictResolutionMode);

		// Generate AI response
		const { text } = await generateText({
			model: google('gemini-2.0-flash-exp'),
			system: systemPrompt,
			messages: [...history, { role: 'user', content: message }]
		});

		// Generate emotion-aware suggestions
		const suggestions = getEmotionAwareResponseSuggestions(
			currentEmotions,
			history.length === 0 ? 'initial' : 'ongoing'
		);

		// Generate conflict insights
		const conflictInsights = generateConflictInsights(currentEmotions);

		return {
			text,
			emotionAnalysis: currentEmotions,
			suggestions,
			conflictInsights,
		};
	} catch (error) {
		console.error('Enhanced chat with Udine error:', error);
		// Fallback response
		return {
			text: "I'm here to help you work through this. Could you tell me more about what's happening?",
		};
	}
}

/**
 * Build emotion-aware system prompt for Udine
 */
function buildEmotionAwareSystemPrompt(
	emotionAnalysis?: EmotionAnalysis,
	mode: ChatOptions['conflictResolutionMode'] = 'mediation'
): string {
	let basePrompt = `You are Udine, an AI-mediated conflict resolution specialist. Your role is to:
	- Help users navigate interpersonal disputes with empathy and understanding
	- Facilitate communication between conflicting parties
	- Provide structured guidance for conflict resolution
	- Maintain neutrality while promoting mutual understanding
	- Offer practical tools and insights for healthier interactions`;

	// Add mode-specific guidance
	switch (mode) {
		case 'mediation':
			basePrompt += `\n\nYou are currently in MEDIATION mode:
			- Focus on helping parties understand each other's perspectives
			- Remain strictly neutral and avoid taking sides
			- Guide the conversation toward mutual understanding
			- Suggest structured communication techniques`;
			break;
		case 'coaching':
			basePrompt += `\n\nYou are currently in COACHING mode:
			- Help the user develop better conflict resolution skills
			- Provide personalized advice and strategies
			- Focus on long-term relationship improvement
			- Offer specific techniques they can practice`;
			break;
		case 'support':
			basePrompt += `\n\nYou are currently in SUPPORT mode:
			- Provide emotional validation and understanding
			- Help the user process their feelings
			- Offer comfort and reassurance
			- Focus on emotional well-being first`;
			break;
	}

	// Add emotion-specific guidance
	if (emotionAnalysis) {
		const { primaryEmotion, conflictIndicators, recommendations } = emotionAnalysis;
		
		basePrompt += `\n\nEMOTIONAL CONTEXT:
		The user is primarily experiencing: ${primaryEmotion.emotion} (intensity: ${Math.round(primaryEmotion.intensity * 100)}%)
		Conflict indicators show: frustration (${Math.round(conflictIndicators.frustration * 100)}%), anger (${Math.round(conflictIndicators.anger * 100)}%), defensiveness (${Math.round(conflictIndicators.defensiveness * 100)}%)
		
		RECOMMENDED APPROACH:
		${recommendations.map(rec => `- ${rec}`).join('\n')}`;

		// Specific emotional guidance
		if (primaryEmotion.intensity > 0.7) {
			basePrompt += `\n\nIMPORTANT: The user is experiencing high emotional intensity. Prioritize validation and emotional support before problem-solving.`;
		}

		if (conflictIndicators.defensiveness > 0.6) {
			basePrompt += `\n\nNOTE: The user may be feeling defensive. Use non-confrontational language and avoid anything that could be perceived as criticism.`;
		}

		if (conflictIndicators.frustration > 0.6) {
			basePrompt += `\n\nNOTE: High frustration detected. Acknowledge their feelings and consider suggesting a break if emotions are overwhelming.`;
		}
	}

	basePrompt += `\n\nKeep responses conversational, supportive, and focused on resolution. Adapt your tone and approach based on the emotional context.`;

	return basePrompt;
}

/**
 * Generate conflict resolution insights based on emotion analysis
 */
function generateConflictInsights(emotionAnalysis: EmotionAnalysis): ChatResponse['conflictInsights'] {
	const { primaryEmotion, conflictIndicators, overallSentiment } = emotionAnalysis;

	// Determine emotional state description
	let emotionalState = '';
	if (primaryEmotion.intensity > 0.7) {
		emotionalState = `Highly ${primaryEmotion.emotion}`;
	} else if (primaryEmotion.intensity > 0.4) {
		emotionalState = `Moderately ${primaryEmotion.emotion}`;
	} else {
		emotionalState = `Mildly ${primaryEmotion.emotion}`;
	}

	// Determine recommended approach
	let recommendedApproach = '';
	if (overallSentiment === 'negative' && primaryEmotion.intensity > 0.6) {
		recommendedApproach = 'Emotional support and validation first, then gentle problem-solving';
	} else if (conflictIndicators.defensiveness > 0.5) {
		recommendedApproach = 'Non-confrontational dialogue with focus on understanding';
	} else if (overallSentiment === 'positive') {
		recommendedApproach = 'Collaborative problem-solving with optimistic framing';
	} else {
		recommendedApproach = 'Balanced approach with empathy and practical guidance';
	}

	// Generate next steps
	const nextSteps: string[] = [];
	
	if (primaryEmotion.intensity > 0.7) {
		nextSteps.push('Allow emotional expression and validation');
	}
	
	if (conflictIndicators.frustration > 0.5) {
		nextSteps.push('Identify specific sources of frustration');
	}
	
	if (conflictIndicators.defensiveness > 0.5) {
		nextSteps.push('Build trust and psychological safety');
	}
	
	nextSteps.push('Explore underlying needs and interests');
	nextSteps.push('Develop collaborative solutions');

	return {
		emotionalState,
		recommendedApproach,
		nextSteps: nextSteps.slice(0, 4), // Limit to 4 steps
	};
}
