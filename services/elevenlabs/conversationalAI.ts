/**
 * ElevenLabs Conversational AI Integration
 * Handles turn-taking, TTS, and STT with ElevenLabs
 * Using @elevenlabs/react v0.1.7 for conversational AI
 */

import { useConversation } from '@elevenlabs/react';

// ElevenLabs Configuration
export const ELEVENLABS_CONFIG = {
  apiKey: process.env.ELEVENLABS_API_KEY || process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY,
  agentId: process.env.EXPO_PUBLIC_UDINE_AGENT_ID || 'your-udine-agent-id',
  voiceId: 'pNInz6obpgDQGcFmaJgB', // Udine voice ID
  model: 'eleven_turbo_v2_5',
  baseUrl: 'https://api.elevenlabs.io/v1'
};

// Conversation Configuration for Conflict Resolution
export const CONVERSATION_CONFIG = {
  systemPrompt: `You are Udine, an expert AI mediator and conflict resolution specialist. Your role is to:

1. **Listen Actively**: Pay careful attention to emotional cues and underlying needs
2. **Facilitate Understanding**: Help parties see each other's perspectives  
3. **Guide Resolution**: Suggest practical solutions and compromises
4. **Maintain Neutrality**: Stay impartial while being empathetic
5. **Encourage Communication**: Ask clarifying questions and reflect feelings

Key principles:
- Use a warm, supportive tone
- Acknowledge emotions before addressing facts
- Ask open-ended questions to explore deeper issues
- Summarize and reflect what you hear
- Guide toward collaborative solutions
- Maintain hope and possibility

Remember: Your goal is to help people understand each other and find mutually beneficial solutions.`,
  
  maxTokens: 1000,
  temperature: 0.7
};

/**
 * ElevenLabs Conversational AI Service
 * Handles the main conversational AI functionality
 */
export class ElevenLabsConversationalAI {
  private conversation: any;
  private isInitialized = false;
  private currentSessionId: string | null = null;

  constructor() {
    // Note: useConversation is a React hook, so this will be initialized in components
  }

  /**
   * Initialize conversation (to be called from React component)
   */
  initializeConversation(onConnect?: () => void, onDisconnect?: () => void, onError?: (error: any) => void) {
    try {
      this.conversation = useConversation({
        agentId: ELEVENLABS_CONFIG.agentId,
        onConnect: () => {
          console.log('🎤 Connected to Udine (ElevenLabs Conversational AI)');
          this.isInitialized = true;
          onConnect?.();
        },
        onDisconnect: () => {
          console.log('🔇 Disconnected from Udine');
          this.isInitialized = false;
          onDisconnect?.();
        },
        onError: (error) => {
          console.error('❌ ElevenLabs Conversation Error:', error);
          onError?.(error);
        },
        onMessage: (message) => {
          console.log('💬 Udine Message:', message);
        },
        onModeChange: (mode) => {
          console.log('🔄 Conversation Mode:', mode);
        }
      });

      return this.conversation;
    } catch (error) {
      console.error('Failed to initialize ElevenLabs conversation:', error);
      return null;
    }
  }

  /**
   * Get conversation status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isConnected: this.conversation?.status === 'connected',
      currentSessionId: this.currentSessionId,
      mode: this.conversation?.mode || 'idle'
    };
  }

  /**
   * Get conversation instance for direct use in components
   */
  getConversation() {
    return this.conversation;
  }
}

/**
 * ElevenLabs TTS Service (for non-conversational use)
 * Direct API integration for text-to-speech
 */
export class ElevenLabsTTSService {
  private apiKey: string;
  private baseUrl = ELEVENLABS_CONFIG.baseUrl;

  constructor() {
    this.apiKey = ELEVENLABS_CONFIG.apiKey!;
  }

  /**
   * Convert text to speech using ElevenLabs TTS API
   */
  async textToSpeech(
    text: string,
    voiceId: string = ELEVENLABS_CONFIG.voiceId,
    options?: {
      model?: string;
      stability?: number;
      similarityBoost?: number;
      style?: number;
      useSpeakerBoost?: boolean;
    }
  ): Promise<ArrayBuffer> {
    try {
      if (!this.apiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: options?.model || ELEVENLABS_CONFIG.model,
          voice_settings: {
            stability: options?.stability || 0.5,
            similarity_boost: options?.similarityBoost || 0.8,
            style: options?.style || 0.2,
            use_speaker_boost: options?.useSpeakerBoost || true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      throw error;
    }
  }

  /**
   * Stream text to speech for real-time audio generation
   */
  async streamTextToSpeech(
    text: string,
    voiceId: string = ELEVENLABS_CONFIG.voiceId,
    options?: {
      model?: string;
      stability?: number;
      similarityBoost?: number;
      style?: number;
      useSpeakerBoost?: boolean;
    }
  ): Promise<ReadableStream> {
    try {
      if (!this.apiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: options?.model || ELEVENLABS_CONFIG.model,
          voice_settings: {
            stability: options?.stability || 0.5,
            similarity_boost: options?.similarityBoost || 0.8,
            style: options?.style || 0.2,
            use_speaker_boost: options?.useSpeakerBoost || true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`TTS stream request failed: ${response.statusText}`);
      }

      return response.body!;
    } catch (error) {
      console.error('ElevenLabs TTS Stream Error:', error);
      throw error;
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<any[]> {
    try {
      if (!this.apiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Failed to get voices:', error);
      return [];
    }
  }

  /**
   * Get voice details
   */
  async getVoice(voiceId: string): Promise<any> {
    try {
      if (!this.apiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voice: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get voice:', error);
      return null;
    }
  }
}

/**
 * ElevenLabs STT Service
 * Speech-to-text using ElevenLabs API
 */
export class ElevenLabsSTTService {
  private apiKey: string;
  private baseUrl = ELEVENLABS_CONFIG.baseUrl;

  constructor() {
    this.apiKey = ELEVENLABS_CONFIG.apiKey!;
  }

  /**
   * Convert speech to text using ElevenLabs STT
   */
  async speechToText(
    audioData: ArrayBuffer | Blob,
    options?: {
      model?: string;
      language?: string;
    }
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      // Convert audio data to proper format
      const audioBlob = audioData instanceof ArrayBuffer 
        ? new Blob([audioData], { type: 'audio/wav' })
        : audioData;

      // Create form data for file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');
      
      if (options?.model) {
        formData.append('model_id', options.model);
      }
      
      if (options?.language) {
        formData.append('language', options.language);
      }

      const response = await fetch(`${this.baseUrl}/speech-to-text`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`STT request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('ElevenLabs STT Error:', error);
      throw error;
    }
  }

  /**
   * Check if STT service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

/**
 * React Hook for ElevenLabs Conversational AI
 * This should be used in React components
 */
export function useElevenLabsConversation(
  agentId?: string,
  onConnect?: () => void,
  onDisconnect?: () => void,
  onError?: (error: any) => void,
  onMessage?: (message: any) => void
) {
  return useConversation({
    agentId: agentId || ELEVENLABS_CONFIG.agentId,
    onConnect: () => {
      console.log('🎤 Connected to ElevenLabs Conversational AI');
      onConnect?.();
    },
    onDisconnect: () => {
      console.log('🔇 Disconnected from ElevenLabs');
      onDisconnect?.();
    },
    onError: (error) => {
      console.error('❌ ElevenLabs Error:', error);
      onError?.(error);
    },
    onMessage: (message) => {
      console.log('💬 ElevenLabs Message:', message);
      onMessage?.(message);
    },
    onModeChange: (mode) => {
      console.log('🔄 Mode Change:', mode);
    }
  });
}

// Export singleton instances
export const elevenLabsConversationalAI = new ElevenLabsConversationalAI();
export const elevenLabsTTS = new ElevenLabsTTSService();
export const elevenLabsSTT = new ElevenLabsSTTService();

// Export default
export default {
  conversationalAI: elevenLabsConversationalAI,
  tts: elevenLabsTTS,
  stt: elevenLabsSTT,
  useConversation: useElevenLabsConversation
};
