import { Platform } from 'react-native';
import humeService, { HumeAnalysisResult } from '../hume';

/**
 * Emotion Detection Service for understanding emotional context in conflict resolution
 * Integrates with Hume AI and provides fallback emotion analysis
 */

export interface EmotionScore {
  emotion: string;
  confidence: number;
  intensity: number; // 0-1 scale
}

export interface EmotionAnalysis {
  primaryEmotion: EmotionScore;
  secondaryEmotions: EmotionScore[];
  overallSentiment: 'positive' | 'negative' | 'neutral';
  emotionalIntensity: number; // 0-1 scale
  conflictIndicators: {
    frustration: number;
    anger: number;
    sadness: number;
    anxiety: number;
    defensiveness: number;
  };
  recommendations: string[];
}

export interface EmotionDetectionOptions {
  provider?: 'hume' | 'text-analysis' | 'mock';
  includeRecommendations?: boolean;
  conflictContext?: boolean;
}

/**
 * Analyze emotions from audio using Hume AI
 */
async function analyzeEmotionFromAudio(
  audioUri: string, 
  options: EmotionDetectionOptions = {}
): Promise<EmotionAnalysis> {
  try {
    // Use the new Hume service for audio analysis
    const analysisResult = await humeService.analyzeAudio(audioUri, {
      includeProsody: true,
      includeVocalBurst: true,
    });

    if (analysisResult.status === 'failed') {
      throw new Error(analysisResult.error || 'Hume AI analysis failed');
    }

    // Wait for job completion
    const completedResult = await humeService.waitForJobCompletion(analysisResult.jobId);
    
    return await processHumeResults(completedResult, options);
  } catch (error) {
    console.error('Hume AI emotion analysis error:', error);
    throw error;
  }
}

/**
 * Analyze emotions from text using sentiment analysis or Hume AI
 */
async function analyzeEmotionFromText(
  text: string, 
  options: EmotionDetectionOptions = {}
): Promise<EmotionAnalysis> {
  try {
    // Try Hume AI for text analysis if available
    if (process.env.EXPO_PUBLIC_HUME_API_KEY && options.provider === 'hume') {
      try {
        const analysisResult = await humeService.analyzeText(text);
        
        if (analysisResult.status !== 'failed') {
          const completedResult = await humeService.waitForJobCompletion(analysisResult.jobId);
          return await processHumeResults(completedResult, options);
        }
      } catch (humeError) {
        console.warn('Hume text analysis failed, falling back to local analysis:', humeError);
      }
    }

    // Fallback to simple text-based emotion analysis
    const emotions = detectEmotionsFromText(text);
    const conflictIndicators = analyzeConflictIndicators(text);
    
    const primaryEmotion = emotions.reduce((prev, current) => 
      prev.confidence > current.confidence ? prev : current
    );

    const secondaryEmotions = emotions
      .filter(e => e.emotion !== primaryEmotion.emotion)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    const overallSentiment = determineSentiment(emotions);
    const emotionalIntensity = calculateEmotionalIntensity(emotions);

    const recommendations = options.includeRecommendations 
      ? generateRecommendations(primaryEmotion, conflictIndicators)
      : [];

    return {
      primaryEmotion,
      secondaryEmotions,
      overallSentiment,
      emotionalIntensity,
      conflictIndicators,
      recommendations,
    };
  } catch (error) {
    console.error('Text emotion analysis error:', error);
    throw error;
  }
}

/**
 * Mock emotion analysis for development
 */
async function analyzeEmotionMock(
  input: string, 
  options: EmotionDetectionOptions = {}
): Promise<EmotionAnalysis> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockEmotions: EmotionScore[] = [
    { emotion: 'frustration', confidence: 0.7, intensity: 0.6 },
    { emotion: 'concern', confidence: 0.5, intensity: 0.4 },
    { emotion: 'hope', confidence: 0.3, intensity: 0.2 },
  ];

  return {
    primaryEmotion: mockEmotions[0],
    secondaryEmotions: mockEmotions.slice(1),
    overallSentiment: 'negative',
    emotionalIntensity: 0.6,
    conflictIndicators: {
      frustration: 0.7,
      anger: 0.3,
      sadness: 0.2,
      anxiety: 0.4,
      defensiveness: 0.5,
    },
    recommendations: [
      'Acknowledge the frustration being expressed',
      'Use active listening techniques',
      'Focus on finding common ground',
    ],
  };
}

/**
 * Detect emotions from text using keyword analysis and patterns
 */
function detectEmotionsFromText(text: string): EmotionScore[] {
  const emotionKeywords = {
    anger: ['angry', 'furious', 'mad', 'rage', 'hate', 'annoyed', 'irritated'],
    sadness: ['sad', 'depressed', 'hurt', 'disappointed', 'upset', 'crying'],
    fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'terrified'],
    joy: ['happy', 'excited', 'glad', 'pleased', 'delighted', 'cheerful'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned'],
    disgust: ['disgusted', 'revolted', 'sick', 'appalled', 'repulsed'],
    frustration: ['frustrated', 'annoyed', 'fed up', 'exasperated', 'irritated'],
    hope: ['hopeful', 'optimistic', 'confident', 'positive', 'encouraged'],
    concern: ['concerned', 'worried', 'troubled', 'bothered', 'uneasy'],
  };

  const lowerText = text.toLowerCase();
  const emotions: EmotionScore[] = [];

  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    const matches = keywords.filter(keyword => lowerText.includes(keyword));
    if (matches.length > 0) {
      const confidence = Math.min(matches.length * 0.3, 1.0);
      const intensity = confidence * 0.8; // Slightly lower intensity than confidence
      emotions.push({ emotion, confidence, intensity });
    }
  });

  // If no emotions detected, add neutral
  if (emotions.length === 0) {
    emotions.push({ emotion: 'neutral', confidence: 0.8, intensity: 0.2 });
  }

  return emotions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Analyze conflict-specific indicators
 */
function analyzeConflictIndicators(text: string): EmotionAnalysis['conflictIndicators'] {
  const lowerText = text.toLowerCase();
  
  const indicators = {
    frustration: countMatches(lowerText, ['frustrated', 'annoying', 'fed up', 'sick of']),
    anger: countMatches(lowerText, ['angry', 'mad', 'furious', 'hate', 'can\'t stand']),
    sadness: countMatches(lowerText, ['hurt', 'sad', 'disappointed', 'upset']),
    anxiety: countMatches(lowerText, ['worried', 'anxious', 'nervous', 'scared']),
    defensiveness: countMatches(lowerText, ['but', 'however', 'not my fault', 'you always', 'you never']),
  };

  // Normalize scores to 0-1 range
  const maxScore = Math.max(...Object.values(indicators), 1);
  return Object.fromEntries(
    Object.entries(indicators).map(([key, value]) => [key, Math.min(value / maxScore, 1)])
  ) as EmotionAnalysis['conflictIndicators'];
}

/**
 * Count keyword matches in text
 */
function countMatches(text: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => {
    const matches = text.split(keyword).length - 1;
    return count + matches;
  }, 0);
}

/**
 * Determine overall sentiment from emotions
 */
function determineSentiment(emotions: EmotionScore[]): 'positive' | 'negative' | 'neutral' {
  const positiveEmotions = ['joy', 'hope', 'excitement', 'love', 'gratitude'];
  const negativeEmotions = ['anger', 'sadness', 'fear', 'frustration', 'disgust'];

  let positiveScore = 0;
  let negativeScore = 0;

  emotions.forEach(emotion => {
    if (positiveEmotions.includes(emotion.emotion)) {
      positiveScore += emotion.confidence;
    } else if (negativeEmotions.includes(emotion.emotion)) {
      negativeScore += emotion.confidence;
    }
  });

  if (positiveScore > negativeScore * 1.2) return 'positive';
  if (negativeScore > positiveScore * 1.2) return 'negative';
  return 'neutral';
}

/**
 * Calculate overall emotional intensity
 */
function calculateEmotionalIntensity(emotions: EmotionScore[]): number {
  if (emotions.length === 0) return 0;
  
  const totalIntensity = emotions.reduce((sum, emotion) => sum + emotion.intensity, 0);
  return Math.min(totalIntensity / emotions.length, 1);
}

/**
 * Generate conflict resolution recommendations based on emotions
 */
function generateRecommendations(
  primaryEmotion: EmotionScore, 
  conflictIndicators: EmotionAnalysis['conflictIndicators']
): string[] {
  const recommendations: string[] = [];

  // Emotion-specific recommendations
  switch (primaryEmotion.emotion) {
    case 'anger':
    case 'frustration':
      recommendations.push(
        'Acknowledge the frustration and validate their feelings',
        'Use calm, non-confrontational language',
        'Focus on the issue, not personal attacks'
      );
      break;
    case 'sadness':
    case 'hurt':
      recommendations.push(
        'Show empathy and understanding',
        'Ask open-ended questions about their feelings',
        'Offer emotional support before problem-solving'
      );
      break;
    case 'fear':
    case 'anxiety':
      recommendations.push(
        'Provide reassurance and safety',
        'Break down the problem into manageable parts',
        'Offer concrete next steps'
      );
      break;
    case 'hope':
    case 'joy':
      recommendations.push(
        'Build on the positive energy',
        'Focus on collaborative solutions',
        'Celebrate small wins together'
      );
      break;
  }

  // Conflict indicator recommendations
  if (conflictIndicators.defensiveness > 0.5) {
    recommendations.push('Use "I" statements instead of "you" statements');
  }
  
  if (conflictIndicators.frustration > 0.6) {
    recommendations.push('Take a break if emotions are too high');
  }

  if (conflictIndicators.anxiety > 0.5) {
    recommendations.push('Provide clear structure and expectations');
  }

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

/**
 * Process Hume AI results into our format
 */
async function processHumeResults(results: any, options: EmotionDetectionOptions): Promise<EmotionAnalysis> {
  try {
    if (!results || !results.predictions) {
      return await analyzeEmotionMock('', options);
    }

    const emotions: EmotionScore[] = results.predictions.map((pred: any) => ({
      emotion: pred.name,
      confidence: pred.score,
      intensity: pred.score,
    }));

    // Get top emotion
    const topEmotion = emotions.reduce((prev, current) => 
      (prev.confidence > current.confidence) ? prev : current
    );

    // Calculate overall sentiment
    const positiveEmotions = ['joy', 'love', 'admiration', 'amusement', 'excitement'];
    const negativeEmotions = ['anger', 'sadness', 'fear', 'disgust', 'disappointment'];
    
    const positiveScore = emotions
      .filter(e => positiveEmotions.some(pos => e.emotion.toLowerCase().includes(pos)))
      .reduce((sum, e) => sum + e.confidence, 0);
    
    const negativeScore = emotions
      .filter(e => negativeEmotions.some(neg => e.emotion.toLowerCase().includes(neg)))
      .reduce((sum, e) => sum + e.confidence, 0);

    let sentiment: 'positive' | 'negative' | 'neutral';
    if (positiveScore > negativeScore + 0.1) {
      sentiment = 'positive';
    } else if (negativeScore > positiveScore + 0.1) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    return {
      emotions: emotions.slice(0, 10), // Top 10 emotions
      topEmotion: topEmotion.emotion,
      confidence: topEmotion.confidence,
      sentiment,
      arousal: calculateArousal(emotions),
      valence: calculateValence(emotions),
      recommendations: generateRecommendations(emotions, sentiment),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error processing Hume results:', error);
    return await analyzeEmotionMock('', options);
  }
}

/**
 * Convert blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Main emotion analysis function with provider fallback
 */
export async function analyzeEmotion(
  input: string, // Can be text or audio URI
  inputType: 'text' | 'audio',
  options: EmotionDetectionOptions = {}
): Promise<EmotionAnalysis> {
  const provider = options.provider || 'text-analysis';

  try {
    switch (provider) {
      case 'hume':
        if (inputType === 'audio') {
          return await analyzeEmotionFromAudio(input, options);
        } else {
          // Hume AI also supports text, but we'll fall back to text analysis
          return await analyzeEmotionFromText(input, options);
        }

      case 'text-analysis':
        if (inputType === 'text') {
          return await analyzeEmotionFromText(input, options);
        } else {
          throw new Error('Text analysis provider only supports text input');
        }

      case 'mock':
        return await analyzeEmotionMock(input, options);

      default:
        throw new Error(`Unknown emotion detection provider: ${provider}`);
    }
  } catch (error) {
    console.warn(`Emotion detection provider ${provider} failed, falling back to mock:`, error);
    // Fallback to mock for development
    return await analyzeEmotionMock(input, options);
  }
}

/**
 * Check if emotion detection is available
 */
export function isEmotionDetectionAvailable(): boolean {
  return !!process.env.EXPO_PUBLIC_HUME_API_KEY || true; // Always available with fallback
}

/**
 * Get emotion-aware response suggestions for conflict resolution
 */
export function getEmotionAwareResponseSuggestions(
  emotionAnalysis: EmotionAnalysis,
  context: 'initial' | 'ongoing' | 'resolution'
): string[] {
  const { primaryEmotion, conflictIndicators, overallSentiment } = emotionAnalysis;
  
  const suggestions: string[] = [];

  // Context-specific suggestions
  if (context === 'initial') {
    suggestions.push(
      "I can sense this is important to you. Let's work through this together.",
      "Thank you for sharing your feelings with me. I'm here to help."
    );
  }

  // Emotion-specific responses
  if (primaryEmotion.emotion === 'frustration' && primaryEmotion.intensity > 0.6) {
    suggestions.push(
      "I understand you're feeling frustrated. That's completely valid.",
      "Let's take a step back and look at what's really bothering you."
    );
  }

  if (conflictIndicators.defensiveness > 0.5) {
    suggestions.push(
      "I'm not here to judge or blame. Let's focus on understanding each other.",
      "What would help you feel more comfortable in this conversation?"
    );
  }

  if (overallSentiment === 'negative' && emotionAnalysis.emotionalIntensity > 0.7) {
    suggestions.push(
      "I can tell this is really affecting you. Would you like to take a moment?",
      "Your feelings are important. Let's make sure we address them properly."
    );
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
}
