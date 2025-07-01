/**
 * Hume AI Expression Measurement Integration
 * Using Hume's Expression Measurement API for emotion analysis
 * Docs: https://dev.hume.ai/docs/expression-measurement/overview
 */

import { HumeClient } from 'hume';

// Hume Configuration
export const HUME_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_HUME_API_KEY || process.env.HUME_API_KEY,
  baseUrl: 'https://api.hume.ai'
};

// Expression Measurement Types
export interface HumeEmotionScore {
  name: string;
  score: number;
}

export interface HumeExpressionResult {
  emotions: HumeEmotionScore[];
  dominantEmotion: HumeEmotionScore;
  emotionalState: 'positive' | 'negative' | 'neutral' | 'mixed';
  conflictLevel: number; // 0-100
  resolutionPotential: number; // 0-100
  recommendations: string[];
  timestamp: Date;
  source: 'text' | 'audio' | 'video';
}

export interface ExpressionContext {
  conversationId: string;
  participantId: string;
  messageId?: string;
  conflictType?: string;
  sessionPhase?: 'opening' | 'exploration' | 'negotiation' | 'resolution' | 'closing';
}

// Emotion categories for conflict resolution
const EMOTION_CATEGORIES = {
  POSITIVE: ['joy', 'satisfaction', 'relief', 'hope', 'gratitude', 'contentment', 'pride', 'amusement', 'love'],
  NEGATIVE: ['anger', 'frustration', 'sadness', 'anxiety', 'fear', 'disappointment', 'resentment', 'disgust', 'contempt'],
  NEUTRAL: ['calm', 'neutral', 'focused', 'thoughtful', 'curious', 'concentration'],
  CONFLICT_INDICATORS: ['anger', 'frustration', 'contempt', 'disgust', 'annoyance', 'irritation'],
  RESOLUTION_INDICATORS: ['relief', 'satisfaction', 'hope', 'gratitude', 'understanding', 'empathy']
};

/**
 * Hume Expression Measurement Service
 */
export class HumeExpressionMeasurementService {
  private client: HumeClient | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize Hume client
   */
  private initializeClient() {
    try {
      if (!HUME_CONFIG.apiKey) {
        console.warn('⚠️ Hume API key not found. Expression measurement will use fallback analysis.');
        return;
      }

      this.client = new HumeClient({
        apiKey: HUME_CONFIG.apiKey
      });

      this.isInitialized = true;
      console.log('✅ Hume Expression Measurement client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Hume client:', error);
    }
  }

  /**
   * Analyze text for emotional expressions
   * Uses Hume's Language model for text analysis
   */
  async analyzeText(
    text: string,
    context?: ExpressionContext
  ): Promise<HumeExpressionResult> {
    try {
      if (!this.isInitialized || !this.client) {
        return this.getFallbackAnalysis(text, 'text');
      }

      // Start inference job for text analysis
      const job = await this.client.expressionMeasurement.batch.startInferenceJob({
        models: {
          language: {
            granularity: 'sentence'
          }
        },
        text: [text]
      });

      // Get job details and wait for completion
      const jobId = job.jobId;
      let jobDetails = await this.client.expressionMeasurement.batch.getJobDetails(jobId);

      // Poll for completion (with timeout)
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      while (jobDetails.state.status !== 'COMPLETED' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        jobDetails = await this.client.expressionMeasurement.batch.getJobDetails(jobId);
        attempts++;
      }

      if (jobDetails.state.status !== 'COMPLETED') {
        console.warn('Hume job timed out, using fallback analysis');
        return this.getFallbackAnalysis(text, 'text');
      }

      // Get predictions
      const predictions = await this.client.expressionMeasurement.batch.getJobPredictions(jobId);
      
      // Process results
      const emotions = this.processLanguagePredictions(predictions);
      return this.createExpressionResult(emotions, text, 'text', context);

    } catch (error) {
      console.error('Hume text analysis error:', error);
      return this.getFallbackAnalysis(text, 'text');
    }
  }

  /**
   * Analyze audio for emotional expressions
   * Uses Hume's Speech model for audio analysis
   */
  async analyzeAudio(
    audioData: ArrayBuffer | Blob,
    context?: ExpressionContext
  ): Promise<HumeExpressionResult> {
    try {
      if (!this.isInitialized || !this.client) {
        return this.getFallbackAnalysis('Audio analysis unavailable', 'audio');
      }

      // Convert audio data to proper format
      const audioBlob = audioData instanceof ArrayBuffer 
        ? new Blob([audioData], { type: 'audio/wav' })
        : audioData;

      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('models', JSON.stringify({
        speech: {
          granularity: 'utterance'
        }
      }));

      // Start inference job for audio analysis
      const job = await this.client.expressionMeasurement.batch.startInferenceJobFromLocalFile([audioBlob as any], {
        speech: {
          granularity: 'utterance'
        }
      } as any);

      // Get job details and wait for completion
      const jobId = job.jobId;
      let jobDetails = await this.client.expressionMeasurement.batch.getJobDetails(jobId);

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds timeout for audio
      
      while (jobDetails.state.status !== 'COMPLETED' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        jobDetails = await this.client.expressionMeasurement.batch.getJobDetails(jobId);
        attempts++;
      }

      if (jobDetails.state.status !== 'COMPLETED') {
        console.warn('Hume audio job timed out, using fallback analysis');
        return this.getFallbackAnalysis('Audio analysis timed out', 'audio');
      }

      // Get predictions
      const predictions = await this.client.expressionMeasurement.batch.getJobPredictions(jobId);
      
      // Process results
      const emotions = this.processSpeechPredictions(predictions);
      return this.createExpressionResult(emotions, 'Audio input', 'audio', context);

    } catch (error) {
      console.error('Hume audio analysis error:', error);
      return this.getFallbackAnalysis('Audio analysis failed', 'audio');
    }
  }

  /**
   * Stream text analysis for real-time processing
   */
  async streamTextAnalysis(
    textStream: AsyncIterable<string>,
    context?: ExpressionContext
  ): Promise<AsyncIterable<HumeExpressionResult>> {
    const self = this;
    
    return {
      async *[Symbol.asyncIterator]() {
        let accumulatedText = '';
        
        for await (const chunk of textStream) {
          accumulatedText += chunk;
          
          // Analyze every few words for real-time feedback
          if (accumulatedText.split(' ').length >= 10) {
            const analysis = await self.analyzeText(accumulatedText, context);
            yield analysis;
            accumulatedText = ''; // Reset for next chunk
          }
        }
        
        // Final analysis if there's remaining text
        if (accumulatedText.trim()) {
          const analysis = await self.analyzeText(accumulatedText, context);
          yield analysis;
        }
      }
    };
  }

  /**
   * Process language model predictions from Hume
   */
  private processLanguagePredictions(predictions: any): HumeEmotionScore[] {
    const emotions: HumeEmotionScore[] = [];
    
    try {
      if (predictions && predictions.length > 0) {
        const firstResult = predictions[0];
        
        if (firstResult.results && firstResult.results.predictions) {
          const languagePredictions = firstResult.results.predictions;
          
          languagePredictions.forEach((prediction: any) => {
            if (prediction.models && prediction.models.language) {
              const groupedPredictions = prediction.models.language.grouped_predictions;
              
              groupedPredictions.forEach((group: any) => {
                group.predictions.forEach((pred: any) => {
                  emotions.push({
                    name: pred.name,
                    score: pred.score
                  });
                });
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing language predictions:', error);
    }

    return emotions.sort((a, b) => b.score - a.score);
  }

  /**
   * Process speech model predictions from Hume
   */
  private processSpeechPredictions(predictions: any): HumeEmotionScore[] {
    const emotions: HumeEmotionScore[] = [];
    
    try {
      if (predictions && predictions.length > 0) {
        const firstResult = predictions[0];
        
        if (firstResult.results && firstResult.results.predictions) {
          const speechPredictions = firstResult.results.predictions;
          
          speechPredictions.forEach((prediction: any) => {
            if (prediction.models && prediction.models.speech) {
              const groupedPredictions = prediction.models.speech.grouped_predictions;
              
              groupedPredictions.forEach((group: any) => {
                group.predictions.forEach((pred: any) => {
                  emotions.push({
                    name: pred.name,
                    score: pred.score
                  });
                });
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing speech predictions:', error);
    }

    return emotions.sort((a, b) => b.score - a.score);
  }

  /**
   * Create comprehensive expression result
   */
  private createExpressionResult(
    emotions: HumeEmotionScore[],
    text: string,
    source: 'text' | 'audio' | 'video',
    context?: ExpressionContext
  ): HumeExpressionResult {
    const dominantEmotion = emotions[0] || { name: 'neutral', score: 0.5 };
    
    // Determine emotional state
    let emotionalState: 'positive' | 'negative' | 'neutral' | 'mixed';
    const positiveScore = emotions
      .filter(e => EMOTION_CATEGORIES.POSITIVE.includes(e.name.toLowerCase()))
      .reduce((sum, e) => sum + e.score, 0);
    const negativeScore = emotions
      .filter(e => EMOTION_CATEGORIES.NEGATIVE.includes(e.name.toLowerCase()))
      .reduce((sum, e) => sum + e.score, 0);

    if (Math.abs(positiveScore - negativeScore) < 0.1) emotionalState = 'mixed';
    else if (positiveScore > negativeScore) emotionalState = 'positive';
    else if (negativeScore > positiveScore) emotionalState = 'negative';
    else emotionalState = 'neutral';

    // Calculate conflict level (0-100)
    const conflictLevel = Math.min(100, emotions
      .filter(e => EMOTION_CATEGORIES.CONFLICT_INDICATORS.includes(e.name.toLowerCase()))
      .reduce((sum, e) => sum + e.score * 100, 0));

    // Calculate resolution potential (0-100)
    const resolutionPotential = Math.min(100, emotions
      .filter(e => EMOTION_CATEGORIES.RESOLUTION_INDICATORS.includes(e.name.toLowerCase()))
      .reduce((sum, e) => sum + e.score * 100, 0) + (100 - conflictLevel) * 0.3);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      dominantEmotion,
      emotionalState,
      conflictLevel,
      context
    );

    return {
      emotions,
      dominantEmotion,
      emotionalState,
      conflictLevel,
      resolutionPotential,
      recommendations,
      timestamp: new Date(),
      source
    };
  }

  /**
   * Generate contextual recommendations based on emotions
   */
  private generateRecommendations(
    dominantEmotion: HumeEmotionScore,
    emotionalState: string,
    conflictLevel: number,
    context?: ExpressionContext
  ): string[] {
    const recommendations: string[] = [];

    // Emotion-specific recommendations
    switch (dominantEmotion.name.toLowerCase()) {
      case 'anger':
      case 'frustration':
        recommendations.push('Take a moment to breathe and center yourself');
        recommendations.push('Focus on expressing needs rather than blame');
        break;
      case 'sadness':
      case 'disappointment':
        recommendations.push('Acknowledge these feelings - they are valid');
        recommendations.push('Consider what support or understanding you need');
        break;
      case 'anxiety':
      case 'fear':
        recommendations.push('Ground yourself in the present moment');
        recommendations.push('Remember that this conversation is a safe space');
        break;
      case 'joy':
      case 'satisfaction':
        recommendations.push('This positive energy can help build solutions');
        recommendations.push('Share what is working well');
        break;
    }

    // Conflict level recommendations
    if (conflictLevel > 70) {
      recommendations.push('Consider taking a brief pause to de-escalate');
      recommendations.push('Focus on one issue at a time');
    } else if (conflictLevel < 30) {
      recommendations.push('This is a good time to explore solutions');
      recommendations.push('Build on this collaborative energy');
    }

    // Context-specific recommendations
    if (context?.sessionPhase === 'opening') {
      recommendations.push('Set clear intentions for this conversation');
    } else if (context?.sessionPhase === 'resolution') {
      recommendations.push('Focus on concrete next steps');
    }

    return recommendations.slice(0, 3); // Limit to top 3 recommendations
  }

  /**
   * Fallback analysis when Hume is unavailable
   */
  private getFallbackAnalysis(text: string, source: 'text' | 'audio' | 'video'): HumeExpressionResult {
    // Simple keyword-based emotion detection as fallback
    const emotionKeywords = {
      anger: ['angry', 'mad', 'furious', 'rage', 'hate'],
      frustration: ['frustrated', 'annoyed', 'irritated', 'bothered'],
      sadness: ['sad', 'hurt', 'disappointed', 'upset', 'depressed'],
      joy: ['happy', 'glad', 'excited', 'pleased', 'delighted'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous'],
      neutral: ['okay', 'fine', 'alright', 'normal']
    };

    const textLower = text.toLowerCase();
    const detectedEmotions: HumeEmotionScore[] = [];

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => textLower.includes(keyword)).length;
      if (matches > 0) {
        detectedEmotions.push({
          name: emotion,
          score: Math.min(0.9, matches * 0.3)
        });
      }
    });

    if (detectedEmotions.length === 0) {
      detectedEmotions.push({ name: 'neutral', score: 0.5 });
    }

    return this.createExpressionResult(detectedEmotions, text, source);
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return this.isInitialized && !!HUME_CONFIG.apiKey;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasApiKey: !!HUME_CONFIG.apiKey,
      clientReady: !!this.client
    };
  }
}

// Export singleton instance
export const humeExpressionMeasurement = new HumeExpressionMeasurementService();
export default humeExpressionMeasurement;
