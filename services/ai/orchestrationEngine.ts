/**
 * AI Orchestration Engine
 * Coordinates AI SDK, Gemini (document analysis only), Hume Expression Measurement, and ElevenLabs
 * Uses LangChain-style orchestration patterns with AI SDK
 */

import { google } from '@ai-sdk/google';
import { generateText, streamText, generateObject } from 'ai';
import { z } from 'zod';
import { humeExpressionMeasurement, HumeExpressionResult } from '../hume/expressionMeasurement';
import { 
  elevenLabsConversationalAI, 
  elevenLabsTTS, 
  elevenLabsSTT,
  ELEVENLABS_CONFIG,
  CONVERSATION_CONFIG 
} from '../elevenlabs/conversationalAI';
import { SupabaseService } from '../supabase/supabaseService';

// Gemini Models Configuration (ONLY for document analysis)
export const GEMINI_MODELS = {
  DOCUMENT_ANALYSIS: google('gemini-2.0-flash-exp'), // ONLY for document analysis
  CONFLICT_ANALYSIS: google('gemini-2.0-flash-exp'), // For conflict pattern analysis
};

// Orchestration Configuration
export const ORCHESTRATION_CONFIG = {
  maxTokens: 2000,
  temperature: 0.7,
  
  // Gemini is ONLY used for document analysis - NOT conversation
  documentAnalysisPrompt: `You are a specialized document analysis AI. Your ONLY role is to analyze documents and extract key information. You do NOT engage in conversation or mediation.

Analyze documents for:
1. Key information and facts
2. Emotional tone and sentiment
3. Conflict-relevant content
4. Action items and agreements
5. Important quotes and references

Provide structured analysis without conversational elements.`,
  
  conflictAnalysisPrompt: `Analyze the conversation context and provide structured insights for conflict resolution. Focus on:
1. Conflict patterns and triggers
2. Underlying needs and interests  
3. Communication dynamics
4. Resolution opportunities
5. Recommended interventions

Provide actionable analysis for the mediation process.`
};

// Analysis Types
export interface ConflictAnalysis {
  conflictType: 'interpersonal' | 'family' | 'workplace' | 'neighbor' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggers: string[];
  underlyingNeeds: string[];
  communicationPatterns: {
    positive: string[];
    negative: string[];
    suggestions: string[];
  };
  resolutionOpportunities: string[];
  recommendedInterventions: string[];
  nextSteps: string[];
}

export interface DocumentAnalysis {
  documentType: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  actionItems: string[];
  relevantQuotes: string[];
  summary: string;
  conflictRelevance: number; // 0-100
}

export interface OrchestrationContext {
  conversationId: string;
  participantIds: string[];
  conflictType?: string;
  sessionPhase: 'opening' | 'exploration' | 'negotiation' | 'resolution' | 'closing';
  emotionHistory: HumeExpressionResult[];
  documents?: File[];
  // Enhanced context for ElevenLabs agent
  userProfile?: {
    name?: string;
    username?: string;
    personalityProfile?: any;
    communicationStyle?: string;
    conflictHistory?: any[];
  };
  sessionType: 'onboarding' | 'conflict-resolution' | 'personality-assessment' | 'practice';
  voiceEnabled: boolean;
  agentPersonality: 'udine' | 'neutral' | 'empathetic';
  toolsEnabled: string[]; // Available tools for the agent
}

export interface OrchestrationResult {
  emotionAnalysis: HumeExpressionResult;
  conflictAnalysis: ConflictAnalysis;
  documentAnalyses: DocumentAnalysis[];
  recommendations: string[];
  nextActions: string[];
  voiceResponse?: ArrayBuffer; // ElevenLabs TTS output
  // Enhanced agent interaction results
  agentResponse?: {
    text: string;
    audioBuffer?: ArrayBuffer;
    toolCalls?: ToolCall[];
    contextUpdate?: Partial<OrchestrationContext>;
    followUpQuestions?: string[];
  };
  conversationState?: {
    isActive: boolean;
    mode: 'listening' | 'speaking' | 'thinking' | 'idle';
    turnCount: number;
    lastInteraction: Date;
  };
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  result?: any;
  status: 'pending' | 'completed' | 'failed';
}

export interface AgentTools {
  analyzeEmotion: (text: string, audio?: ArrayBuffer) => Promise<HumeExpressionResult>;
  generateInsight: (context: OrchestrationContext) => Promise<string>;
  updateUserProfile: (updates: Partial<OrchestrationContext['userProfile']>) => Promise<void>;
  escalateToHuman: (reason: string) => Promise<void>;
  scheduleFollowUp: (timeframe: string, topic: string) => Promise<void>;
  assessPersonality: (responses: string[]) => Promise<any>;
}

/**
 * AI Orchestration Engine
 * Coordinates all AI services in a LangChain-style pipeline
 */
export class AIOrchestrationEngine {
  private isInitialized = false;
  private agentTools: AgentTools;
  private activeConversations = new Map<string, any>();

  constructor() {
    this.agentTools = this.initializeAgentTools();
    this.initialize();
  }

  /**
   * Initialize agent tools for ElevenLabs agent
   */
  private initializeAgentTools(): AgentTools {
    return {
      analyzeEmotion: async (text: string, audio?: ArrayBuffer) => {
        if (audio) {
          return await humeExpressionMeasurement.analyzeAudio(audio);
        } else {
          return await humeExpressionMeasurement.analyzeText(text);
        }
      },

      generateInsight: async (context: OrchestrationContext) => {
        const result = await generateText({
          model: GEMINI_MODELS.CONFLICT_ANALYSIS,
          prompt: `Based on the current context, provide a helpful insight for conflict resolution:
          
Context: ${JSON.stringify(context, null, 2)}

Generate a specific, actionable insight that would help the user in their current situation.`,
          maxTokens: 200
        });
        return result.text;
      },

      updateUserProfile: async (updates: Partial<OrchestrationContext['userProfile']>) => {
        try {
          if (!updates) {
            throw new Error('Updates parameter is required');
          }
          
          // For now, we'll need to get the user ID from the active conversation context
          // This is a temporary solution - ideally the context should be passed to tools
          const userId = 'current-user'; // TODO: Get from active conversation context
          
          // Map to Supabase profile format
          const profileUpdates: any = {};
          
          if (updates.personalityProfile) {
            profileUpdates.communication_style = updates.personalityProfile.communicationStyle;
            profileUpdates.conflict_style = updates.personalityProfile.conflictStyle;
            profileUpdates.emotional_intelligence = updates.personalityProfile.emotionalIntelligence;
            profileUpdates.personality_traits = updates.personalityProfile.traits;
            profileUpdates.personality_recommendations = updates.personalityProfile.recommendations;
          }
          
          if (updates.communicationStyle) {
            profileUpdates.communication_style = updates.communicationStyle;
          }
          
          await SupabaseService.Profile.updateProfile(userId, profileUpdates);
          console.log('✅ User profile updated in database');
        } catch (error) {
          console.error('❌ Failed to update user profile:', error);
        }
      },

      escalateToHuman: async (reason: string) => {
        console.log('Escalating to human mediator:', reason);
        // Implementation would notify human mediators
      },

      scheduleFollowUp: async (timeframe: string, topic: string) => {
        console.log(`Scheduling follow-up in ${timeframe} about ${topic}`);
        // Implementation would schedule notifications/reminders
      },

      assessPersonality: async (responses: string[]) => {
        const result = await generateObject({
          model: GEMINI_MODELS.CONFLICT_ANALYSIS,
          prompt: `Analyze these personality assessment responses and provide insights:
          
Responses: ${responses.join('\n')}

Assess communication style, conflict resolution preferences, and personality traits.`,
          schema: z.object({
            communicationStyle: z.enum(['direct', 'diplomatic', 'analytical', 'empathetic']),
            conflictStyle: z.enum(['competitive', 'collaborative', 'accommodating', 'avoiding', 'compromising']),
            emotionalIntelligence: z.number().min(1).max(10),
            traits: z.array(z.string()),
            recommendations: z.array(z.string())
          })
        });
        return result.object;
      }
    };
  }

  /**
   * Initialize the orchestration engine
   */
  private async initialize() {
    try {
      // Test Gemini models
      await this.testGeminiModels();
      
      // Initialize other services
      console.log('🔄 Initializing AI services...');
      
      this.isInitialized = true;
      console.log('✅ AI Orchestration Engine initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AI Orchestration Engine:', error);
    }
  }

  /**
   * Test Gemini model availability
   */
  private async testGeminiModels() {
    try {
      const testResult = await generateText({
        model: GEMINI_MODELS.CONFLICT_ANALYSIS,
        prompt: 'Test connection',
        maxTokens: 10
      });
      
      if (!testResult.text) {
        throw new Error('Gemini model test failed');
      }
    } catch (error) {
      console.error('Gemini model test failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced orchestration with ElevenLabs agent integration
   * Provides context-aware speech and tool use
   */
  async orchestrateWithAgent(
    input: {
      text?: string;
      audio?: ArrayBuffer;
      documents?: File[];
      userMessage?: string;
    },
    context: OrchestrationContext
  ): Promise<OrchestrationResult> {
    try {
      console.log('🔄 Starting enhanced AI orchestration with agent...');

      // Step 1: Process input through standard pipeline
      const standardResult = await this.orchestrate(input, context);

      // Step 2: Prepare agent context with tools
      const agentContext = {
        ...context,
        currentAnalysis: standardResult,
        availableTools: Object.keys(this.agentTools),
        conversationHistory: this.getConversationHistory(context.conversationId)
      };

      // Step 3: Generate agent response with tool access
      const agentResponse = await this.generateAgentResponse(
        input.userMessage || input.text || 'Audio input received',
        agentContext
      );

      // Step 4: Execute any tool calls
      if (agentResponse.toolCalls) {
        for (const toolCall of agentResponse.toolCalls) {
          await this.executeToolCall(toolCall, context);
        }
      }

      // Step 5: Store conversation data in Supabase
      await this.storeConversationData(input, agentResponse, context, standardResult);

      // Step 6: Update conversation state
      const conversationState = {
        isActive: true,
        mode: 'speaking' as const,
        turnCount: (this.activeConversations.get(context.conversationId)?.turnCount || 0) + 1,
        lastInteraction: new Date()
      };

      this.activeConversations.set(context.conversationId, {
        ...agentContext,
        ...conversationState
      });

      return {
        ...standardResult,
        agentResponse,
        conversationState
      };
    } catch (error) {
      console.error('❌ Enhanced orchestration failed:', error);
      throw error;
    }
  }

  /**
   * Main orchestration pipeline
   * Coordinates all AI services for comprehensive analysis
   */
  async orchestrate(
    input: {
      text?: string;
      audio?: ArrayBuffer;
      documents?: File[];
    },
    context: OrchestrationContext
  ): Promise<OrchestrationResult> {
    try {
      console.log('🔄 Starting AI orchestration pipeline...');

      // Step 1: Emotion Analysis (Hume Expression Measurement)
      let emotionAnalysis: HumeExpressionResult;
      if (input.audio) {
        emotionAnalysis = await humeExpressionMeasurement.analyzeAudio(input.audio, {
          conversationId: context.conversationId,
          participantId: context.participantIds[0],
          conflictType: context.conflictType,
          sessionPhase: context.sessionPhase
        });
      } else if (input.text) {
        emotionAnalysis = await humeExpressionMeasurement.analyzeText(input.text, {
          conversationId: context.conversationId,
          participantId: context.participantIds[0],
          conflictType: context.conflictType,
          sessionPhase: context.sessionPhase
        });
      } else {
        emotionAnalysis = await humeExpressionMeasurement.analyzeText('No input provided');
      }

      // Step 2: Document Analysis (Gemini - ONLY for documents)
      const documentAnalyses: DocumentAnalysis[] = [];
      if (input.documents && input.documents.length > 0) {
        for (const document of input.documents) {
          const analysis = await this.analyzeDocument(document);
          documentAnalyses.push(analysis);
        }
      }

      // Step 3: Conflict Analysis (Gemini - for conflict patterns)
      const conflictAnalysis = await this.analyzeConflict(
        input.text || 'Audio input provided',
        emotionAnalysis,
        documentAnalyses,
        context
      );

      // Step 4: Generate Recommendations
      const recommendations = await this.generateRecommendations(
        emotionAnalysis,
        conflictAnalysis,
        documentAnalyses,
        context
      );

      // Step 5: Determine Next Actions
      const nextActions = await this.determineNextActions(
        emotionAnalysis,
        conflictAnalysis,
        context
      );

      // Step 6: Generate Voice Response (ElevenLabs TTS)
      let voiceResponse: ArrayBuffer | undefined;
      if (recommendations.length > 0) {
        try {
          const responseText = recommendations[0]; // Use first recommendation for voice
          voiceResponse = await elevenLabsTTS.textToSpeech(responseText);
        } catch (error) {
          console.warn('Voice response generation failed:', error);
        }
      }

      console.log('✅ AI orchestration pipeline completed');

      return {
        emotionAnalysis,
        conflictAnalysis,
        documentAnalyses,
        recommendations,
        nextActions,
        voiceResponse
      };
    } catch (error) {
      console.error('�� AI orchestration failed:', error);
      throw error;
    }
  }

  /**
   * Analyze documents using Gemini (ONLY for document analysis)
   */
  async analyzeDocument(document: File): Promise<DocumentAnalysis> {
    try {
      // Convert file to base64 for Gemini
      const arrayBuffer = await document.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      
      const result = await generateObject({
        model: GEMINI_MODELS.DOCUMENT_ANALYSIS,
        system: ORCHESTRATION_CONFIG.documentAnalysisPrompt,
        prompt: `Analyze this document for conflict resolution context:`,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Document: ${document.name}`
              },
              {
                type: 'file',
                data: base64,
                mimeType: document.type
              }
            ]
          }
        ],
        schema: z.object({
          documentType: z.string(),
          keyPoints: z.array(z.string()),
          sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']),
          actionItems: z.array(z.string()),
          relevantQuotes: z.array(z.string()),
          summary: z.string(),
          conflictRelevance: z.number().min(0).max(100)
        })
      });

      return result.object;
    } catch (error) {
      console.error('Document analysis failed:', error);
      return {
        documentType: 'unknown',
        keyPoints: ['Analysis failed'],
        sentiment: 'neutral',
        actionItems: [],
        relevantQuotes: [],
        summary: 'Document analysis unavailable',
        conflictRelevance: 0
      };
    }
  }

  /**
   * Analyze conflict patterns using Gemini
   */
  async analyzeConflict(
    text: string,
    emotionAnalysis: HumeExpressionResult,
    documentAnalyses: DocumentAnalysis[],
    context: OrchestrationContext
  ): Promise<ConflictAnalysis> {
    try {
      const contextInfo = {
        text,
        emotions: emotionAnalysis,
        documents: documentAnalyses,
        sessionPhase: context.sessionPhase,
        participantCount: context.participantIds.length,
        emotionHistory: context.emotionHistory.slice(-5) // Last 5 emotion analyses
      };

      const result = await generateObject({
        model: GEMINI_MODELS.CONFLICT_ANALYSIS,
        system: ORCHESTRATION_CONFIG.conflictAnalysisPrompt,
        prompt: `Analyze this conflict situation:

Context: ${JSON.stringify(contextInfo, null, 2)}

Provide comprehensive conflict analysis.`,
        schema: z.object({
          conflictType: z.enum(['interpersonal', 'family', 'workplace', 'neighbor', 'other']),
          severity: z.enum(['low', 'medium', 'high', 'critical']),
          triggers: z.array(z.string()),
          underlyingNeeds: z.array(z.string()),
          communicationPatterns: z.object({
            positive: z.array(z.string()),
            negative: z.array(z.string()),
            suggestions: z.array(z.string())
          }),
          resolutionOpportunities: z.array(z.string()),
          recommendedInterventions: z.array(z.string()),
          nextSteps: z.array(z.string())
        })
      });

      return result.object;
    } catch (error) {
      console.error('Conflict analysis failed:', error);
      return {
        conflictType: 'other',
        severity: 'medium',
        triggers: ['Analysis unavailable'],
        underlyingNeeds: ['Unknown'],
        communicationPatterns: {
          positive: [],
          negative: [],
          suggestions: ['Improve communication']
        },
        resolutionOpportunities: [],
        recommendedInterventions: ['Continue dialogue'],
        nextSteps: ['Gather more information']
      };
    }
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(
    emotionAnalysis: HumeExpressionResult,
    conflictAnalysis: ConflictAnalysis,
    documentAnalyses: DocumentAnalysis[],
    context: OrchestrationContext
  ): Promise<string[]> {
    try {
      const analysisContext = {
        emotions: emotionAnalysis,
        conflict: conflictAnalysis,
        documents: documentAnalyses,
        sessionPhase: context.sessionPhase
      };

      const result = await generateText({
        model: GEMINI_MODELS.CONFLICT_ANALYSIS,
        prompt: `Based on this analysis, generate 3-5 specific recommendations:

Analysis: ${JSON.stringify(analysisContext, null, 2)}

Each recommendation should be:
1. Specific and actionable
2. Appropriate for the current emotional state
3. Aligned with conflict resolution best practices
4. Feasible to implement

Format as a simple list.`,
        maxTokens: 500
      });

      return result.text
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      return [
        'Take a moment to breathe and center yourself',
        'Focus on understanding the other person\'s perspective',
        'Express your needs clearly and respectfully'
      ];
    }
  }

  /**
   * Determine next actions for the mediation process
   */
  async determineNextActions(
    emotionAnalysis: HumeExpressionResult,
    conflictAnalysis: ConflictAnalysis,
    context: OrchestrationContext
  ): Promise<string[]> {
    const actions: string[] = [];

    // Emotion-based actions
    if (emotionAnalysis.conflictLevel > 70) {
      actions.push('de-escalate');
      actions.push('pause-session');
    } else if (emotionAnalysis.resolutionPotential > 70) {
      actions.push('explore-solutions');
      actions.push('build-agreement');
    }

    // Conflict severity actions
    if (conflictAnalysis.severity === 'critical') {
      actions.push('emergency-intervention');
    } else if (conflictAnalysis.severity === 'high') {
      actions.push('structured-mediation');
    }

    // Session phase actions
    switch (context.sessionPhase) {
      case 'opening':
        actions.push('establish-ground-rules');
        actions.push('clarify-goals');
        break;
      case 'exploration':
        actions.push('facilitate-sharing');
        actions.push('identify-needs');
        break;
      case 'negotiation':
        actions.push('generate-options');
        actions.push('evaluate-solutions');
        break;
      case 'resolution':
        actions.push('finalize-agreement');
        actions.push('plan-follow-up');
        break;
      case 'closing':
        actions.push('summarize-outcomes');
        actions.push('schedule-check-in');
        break;
    }

    return [...new Set(actions)]; // Remove duplicates
  }

  /**
   * Stream orchestration for real-time processing
   */
  async streamOrchestration(
    textStream: AsyncIterable<string>,
    context: OrchestrationContext
  ): Promise<AsyncIterable<{
    emotionAnalysis?: HumeExpressionResult;
    partialRecommendations?: string[];
  }>> {
    const self = this;
    
    return {
      async *[Symbol.asyncIterator]() {
        let accumulatedText = '';
        
        for await (const chunk of textStream) {
          accumulatedText += chunk;
          
          // Analyze every few sentences
          if (accumulatedText.split('.').length >= 2) {
            try {
              const emotionAnalysis = await humeExpressionMeasurement.analyzeText(
                accumulatedText,
                {
                  conversationId: context.conversationId,
                  participantId: context.participantIds[0],
                  sessionPhase: context.sessionPhase
                }
              );

              const partialRecommendations = emotionAnalysis.recommendations;

              yield {
                emotionAnalysis,
                partialRecommendations
              };
            } catch (error) {
              console.error('Stream orchestration error:', error);
            }
            
            accumulatedText = ''; // Reset for next chunk
          }
        }
      }
    };
  }

  /**
   * Generate agent response with context awareness and tool use
   */
  private async generateAgentResponse(
    userMessage: string,
    context: any
  ): Promise<{
    text: string;
    audioBuffer?: ArrayBuffer;
    toolCalls?: ToolCall[];
    contextUpdate?: Partial<OrchestrationContext>;
    followUpQuestions?: string[];
  }> {
    try {
      // Create system prompt based on session type and context
      const systemPrompt = this.buildAgentSystemPrompt(context);

      // Generate response with tool calling capability
      const result = await generateObject({
        model: GEMINI_MODELS.CONFLICT_ANALYSIS,
        system: systemPrompt,
        prompt: `User message: "${userMessage}"

Current context: ${JSON.stringify(context, null, 2)}

Respond as Udine, the AI mediator. Consider:
1. The user's emotional state and needs
2. The session type and phase
3. Available tools and when to use them
4. Appropriate follow-up questions
5. Context updates needed

Provide a helpful, empathetic response.`,
        schema: z.object({
          text: z.string(),
          toolCalls: z.array(z.object({
            id: z.string(),
            name: z.string(),
            parameters: z.record(z.any()),
            status: z.literal('pending')
          })).optional(),
          contextUpdate: z.object({
            userProfile: z.object({
              communicationStyle: z.string().optional(),
              personalityProfile: z.any().optional()
            }).optional()
          }).optional(),
          followUpQuestions: z.array(z.string()).optional()
        })
      });

      // Generate audio if voice is enabled
      let audioBuffer: ArrayBuffer | undefined;
      if (context.voiceEnabled) {
        try {
          audioBuffer = await elevenLabsTTS.textToSpeech(result.object.text);
        } catch (error) {
          console.warn('Voice generation failed:', error);
        }
      }

      return {
        ...result.object,
        audioBuffer
      };
    } catch (error) {
      console.error('Agent response generation failed:', error);
      return {
        text: "I'm here to help you work through this. Can you tell me more about what's happening?",
        followUpQuestions: ["What's the main issue you're facing?", "How are you feeling about this situation?"]
      };
    }
  }

  /**
   * Build system prompt based on session type and context
   */
  private buildAgentSystemPrompt(context: any): string {
    const basePrompt = CONVERSATION_CONFIG.systemPrompt;
    
    let sessionSpecificPrompt = '';
    
    switch (context.sessionType) {
      case 'onboarding':
        sessionSpecificPrompt = `
ONBOARDING MODE: You are guiding a new user through their first experience with understand.me.

Your goals:
- Welcome them warmly and explain how you can help
- Gather basic information about their communication style
- Conduct a brief personality assessment through conversation
- Help them feel comfortable with voice interaction
- Set expectations for conflict resolution sessions

Use a friendly, encouraging tone. Ask one question at a time. Make them feel heard and understood.`;
        break;
        
      case 'personality-assessment':
        sessionSpecificPrompt = `
PERSONALITY ASSESSMENT MODE: You are conducting a conversational personality assessment.

Your goals:
- Ask thoughtful questions about communication preferences
- Explore conflict resolution styles through scenarios
- Assess emotional intelligence and self-awareness
- Identify strengths and growth areas
- Provide personalized insights and recommendations

Use the assessPersonality tool when you have enough information.`;
        break;
        
      case 'conflict-resolution':
        sessionSpecificPrompt = `
CONFLICT RESOLUTION MODE: You are actively mediating a conflict.

Your goals:
- Facilitate understanding between parties
- Help identify underlying needs and interests
- Guide toward collaborative solutions
- Manage emotions and de-escalate tension
- Build agreements and action plans

Use emotion analysis tools frequently. Escalate to human if needed.`;
        break;
        
      case 'practice':
        sessionSpecificPrompt = `
PRACTICE MODE: You are helping someone practice conflict resolution skills.

Your goals:
- Create safe scenarios for skill building
- Provide constructive feedback
- Teach specific techniques and strategies
- Build confidence and competence
- Track progress over time

Be encouraging and educational. Focus on skill development.`;
        break;
    }

    return `${basePrompt}\n\n${sessionSpecificPrompt}\n\nAvailable tools: ${context.availableTools?.join(', ') || 'none'}`;
  }

  /**
   * Execute tool calls made by the agent
   */
  private async executeToolCall(toolCall: ToolCall, context: OrchestrationContext): Promise<void> {
    try {
      toolCall.status = 'pending';
      
      const tool = this.agentTools[toolCall.name as keyof AgentTools];
      if (!tool) {
        throw new Error(`Tool ${toolCall.name} not found`);
      }

      // Execute the tool with parameters
      const result = await (tool as any)(...Object.values(toolCall.parameters));
      
      toolCall.result = result;
      toolCall.status = 'completed';
      
      console.log(`��� Tool ${toolCall.name} executed successfully`);
    } catch (error) {
      console.error(`❌ Tool ${toolCall.name} execution failed:`, error);
      toolCall.status = 'failed';
      toolCall.result = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Store conversation data in Supabase
   */
  private async storeConversationData(
    input: any,
    agentResponse: any,
    context: OrchestrationContext,
    analysisResult: OrchestrationResult
  ): Promise<void> {
    try {
      // Store user message if provided
      if (input.userMessage || input.text) {
        await SupabaseService.Conversation.addMessage({
          session_id: context.conversationId,
          sender_id: context.participantIds[0] || 'anonymous',
          sender_type: 'user',
          content: input.userMessage || input.text || '',
          message_type: input.audio ? 'audio' : 'text',
          emotion_data: analysisResult.emotionAnalysis ? {
            conflict_level: analysisResult.emotionAnalysis.conflictLevel,
            resolution_potential: analysisResult.emotionAnalysis.resolutionPotential,
            dominant_emotions: [analysisResult.emotionAnalysis.dominantEmotion.name],
          } : null,
          conflict_level: analysisResult.emotionAnalysis?.conflictLevel,
        });
      }

      // Store AI response
      if (agentResponse?.text) {
        await SupabaseService.Conversation.addAIResponse(
          context.conversationId,
          agentResponse.text,
          agentResponse.toolCalls,
          agentResponse.confidence || 0.8
        );
      }

      // Store emotion analysis
      if (analysisResult.emotionAnalysis && context.participantIds[0]) {
        await SupabaseService.EmotionAnalysis.storeAnalysis({
          session_id: context.conversationId,
          user_id: context.participantIds[0],
          analysis_type: input.audio ? 'voice' : 'text',
          raw_data: analysisResult.emotionAnalysis.emotions || {},
          processed_data: {
            conflict_level: analysisResult.emotionAnalysis.conflictLevel,
            resolution_potential: analysisResult.emotionAnalysis.resolutionPotential,
            dominant_emotions: [analysisResult.emotionAnalysis.dominantEmotion.name],
            recommendations: analysisResult.emotionAnalysis.recommendations,
          },
          conflict_level: analysisResult.emotionAnalysis.conflictLevel,
          resolution_potential: analysisResult.emotionAnalysis.resolutionPotential,
          emotional_state: analysisResult.emotionAnalysis.dominantEmotion?.name || 'neutral',
          dominant_emotions: analysisResult.emotionAnalysis.dominantEmotion ? [analysisResult.emotionAnalysis.dominantEmotion.name] : [],
          session_phase: context.sessionPhase,
        });
      }

      // Store AI insights and recommendations
      if (analysisResult.recommendations?.length && context.participantIds[0]) {
        for (const recommendation of analysisResult.recommendations) {
          await SupabaseService.AIInsights.storeInsight({
            session_id: context.conversationId,
            user_id: context.participantIds[0],
            insight_type: 'recommendation',
            title: 'AI Recommendation',
            content: recommendation,
            confidence_score: 0.8,
            session_phase: context.sessionPhase,
            related_emotions: analysisResult.emotionAnalysis?.dominantEmotion ? [analysisResult.emotionAnalysis.dominantEmotion.name] : [],
          });
        }
      }

      // Update user analytics
      if (context.participantIds[0]) {
        await SupabaseService.UserAnalytics.updateAnalytics(context.participantIds[0], {
          ai_interaction_count: (await SupabaseService.UserAnalytics.getUserAnalytics(context.participantIds[0]))?.ai_interaction_count || 0 + 1,
          last_active_at: new Date().toISOString(),
        });

        // Update voice usage if applicable
        if (context.voiceEnabled) {
          await SupabaseService.UserAnalytics.updateVoiceUsage(context.participantIds[0], true);
        }
      }

    } catch (error) {
      console.error('❌ Failed to store conversation data:', error);
    }
  }

  /**
   * Get conversation history for context
   */
  private getConversationHistory(conversationId: string): any[] {
    const conversation = this.activeConversations.get(conversationId);
    return conversation?.history || [];
  }

  /**
   * Start voice-guided onboarding session
   */
  async startVoiceOnboarding(userId: string, userProfile?: any): Promise<OrchestrationResult> {
    const context: OrchestrationContext = {
      conversationId: `onboarding-${userId}-${Date.now()}`,
      participantIds: [userId],
      sessionPhase: 'opening',
      emotionHistory: [],
      sessionType: 'onboarding',
      voiceEnabled: true,
      agentPersonality: 'udine',
      toolsEnabled: ['updateUserProfile', 'assessPersonality'],
      userProfile
    };

    return await this.orchestrateWithAgent(
      { userMessage: 'I\'m new to understand.me and would like to get started' },
      context
    );
  }

  /**
   * Start personality assessment session
   */
  async startPersonalityAssessment(userId: string, userProfile?: any): Promise<OrchestrationResult> {
    const context: OrchestrationContext = {
      conversationId: `assessment-${userId}-${Date.now()}`,
      participantIds: [userId],
      sessionPhase: 'exploration',
      emotionHistory: [],
      sessionType: 'personality-assessment',
      voiceEnabled: true,
      agentPersonality: 'empathetic',
      toolsEnabled: ['analyzeEmotion', 'assessPersonality', 'updateUserProfile'],
      userProfile
    };

    return await this.orchestrateWithAgent(
      { userMessage: 'I\'d like to complete a personality assessment' },
      context
    );
  }

  /**
   * Check if engine is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      humeAvailable: humeExpressionMeasurement.isAvailable(),
      elevenLabsAvailable: elevenLabsConversationalAI.getStatus().isInitialized,
      geminiAvailable: {
        documentAnalysis: !!GEMINI_MODELS.DOCUMENT_ANALYSIS,
        conflictAnalysis: !!GEMINI_MODELS.CONFLICT_ANALYSIS
      }
    };
  }
}

// Export singleton instance
export const aiOrchestrationEngine = new AIOrchestrationEngine();
export default aiOrchestrationEngine;
