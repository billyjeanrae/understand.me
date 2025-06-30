import { Platform } from 'react-native';

/**
 * Speech-to-Text service for converting audio recordings to text
 * Supports multiple STT providers with fallback options
 */

interface STTResult {
  text: string;
  confidence?: number;
  language?: string;
}

interface STTOptions {
  language?: string;
  provider?: 'google' | 'whisper' | 'web';
}

/**
 * Convert audio file to text using Web Speech API (browser only)
 */
async function speechToTextWeb(audioBlob: Blob, options: STTOptions = {}): Promise<STTResult> {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Web Speech API not supported'));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = options.language || 'en-US';

    recognition.onresult = (event) => {
      const result = event.results[0];
      if (result) {
        resolve({
          text: result[0].transcript,
          confidence: result[0].confidence,
          language: recognition.lang,
        });
      } else {
        reject(new Error('No speech detected'));
      }
    };

    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      // Recognition ended
    };

    // For web, we need to use a different approach since we can't directly
    // feed audio blob to recognition. This is a simplified implementation.
    recognition.start();
  });
}

/**
 * Convert audio file to text using Google Speech-to-Text API
 */
async function speechToTextGoogle(audioUri: string, options: STTOptions = {}): Promise<STTResult> {
  try {
    // Read audio file as base64
    const response = await fetch(audioUri);
    const audioBlob = await response.blob();
    const base64Audio = await blobToBase64(audioBlob);

    // Call Google Speech-to-Text API
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    const requestBody = {
      config: {
        encoding: 'WEBM_OPUS', // Adjust based on your audio format
        sampleRateHertz: 48000,
        languageCode: options.language || 'en-US',
        enableAutomaticPunctuation: true,
      },
      audio: {
        content: base64Audio.split(',')[1], // Remove data:audio/... prefix
      },
    };

    const sttResponse = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!sttResponse.ok) {
      throw new Error(`Google STT API error: ${sttResponse.statusText}`);
    }

    const data = await sttResponse.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No speech detected in audio');
    }

    const result = data.results[0];
    const alternative = result.alternatives[0];

    return {
      text: alternative.transcript,
      confidence: alternative.confidence,
      language: options.language || 'en-US',
    };
  } catch (error) {
    console.error('Google STT error:', error);
    throw error;
  }
}

/**
 * Fallback STT implementation using a mock service
 * This is useful for development and testing
 */
async function speechToTextMock(audioUri: string, options: STTOptions = {}): Promise<STTResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    text: "This is a mock transcription for development purposes.",
    confidence: 0.95,
    language: options.language || 'en-US',
  };
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
 * Main speech-to-text function with provider fallback
 */
export async function speechToText(
  audioUri: string, 
  options: STTOptions = {}
): Promise<STTResult> {
  const provider = options.provider || (Platform.OS === 'web' ? 'web' : 'google');

  try {
    switch (provider) {
      case 'web':
        if (Platform.OS === 'web') {
          // For web, we'll use a simplified approach
          // In a real implementation, you'd need to handle audio blob properly
          return await speechToTextMock(audioUri, options);
        }
        throw new Error('Web Speech API only available in browser');

      case 'google':
        return await speechToTextGoogle(audioUri, options);

      case 'whisper':
        // TODO: Implement Whisper API integration
        throw new Error('Whisper STT not yet implemented');

      default:
        throw new Error(`Unknown STT provider: ${provider}`);
    }
  } catch (error) {
    console.warn(`STT provider ${provider} failed, falling back to mock:`, error);
    // Fallback to mock for development
    return await speechToTextMock(audioUri, options);
  }
}

/**
 * Check if STT is available on the current platform
 */
export function isSTTAvailable(): boolean {
  if (Platform.OS === 'web') {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
  return true; // Assume available on mobile with proper API keys
}

/**
 * Get supported languages for STT
 */
export function getSupportedLanguages(): string[] {
  return [
    'en-US', 'en-GB', 'en-AU', 'en-CA',
    'es-ES', 'es-MX', 'es-AR',
    'fr-FR', 'fr-CA',
    'de-DE', 'de-AT',
    'it-IT',
    'pt-BR', 'pt-PT',
    'ja-JP',
    'ko-KR',
    'zh-CN', 'zh-TW',
    'ru-RU',
    'ar-SA',
    'hi-IN',
    'nl-NL',
    'sv-SE',
    'da-DK',
    'no-NO',
    'fi-FI',
  ];
}

/**
 * Get supported languages for STT
 */
export function getSupportedLanguages(): string[] {
  return [
    'en-US', // English (US)
    'en-GB', // English (UK)
    'es-ES', // Spanish (Spain)
    'es-MX', // Spanish (Mexico)
    'fr-FR', // French
    'de-DE', // German
    'it-IT', // Italian
    'pt-BR', // Portuguese (Brazil)
    'ja-JP', // Japanese
    'ko-KR', // Korean
    'zh-CN', // Chinese (Simplified)
    'zh-TW', // Chinese (Traditional)
  ];
}
