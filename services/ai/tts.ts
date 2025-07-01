import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

/**
 * Text-to-Speech service for converting AI responses to speech
 * Supports multiple TTS providers with fallback options
 */

interface TTSOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  provider?: 'elevenlabs' | 'web' | 'expo';
}

interface TTSResult {
  audioUri?: string;
  duration?: number;
}

/**
 * Convert text to speech using ElevenLabs API
 */
async function textToSpeechElevenLabs(text: string, options: TTSOptions = {}): Promise<TTSResult> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Default voice ID for a pleasant, professional voice
    const voiceId = options.voice || 'pNInz6obpgDQGcFmaJgB'; // Adam voice

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUri = URL.createObjectURL(audioBlob);

    return {
      audioUri,
      duration: estimateSpeechDuration(text),
    };
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    throw error;
  }
}

/**
 * Convert text to speech using Web Speech API (browser only)
 */
async function textToSpeechWeb(text: string, options: TTSOptions = {}): Promise<TTSResult> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = options.speed || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = 1.0;

    // Try to find a preferred voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      resolve({
        duration: estimateSpeechDuration(text),
      });
    };

    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    speechSynthesis.speak(utterance);
  });
}

/**
 * Convert text to speech using Expo Speech API
 */
async function textToSpeechExpo(text: string, options: TTSOptions = {}): Promise<TTSResult> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    
    // Find a suitable voice
    const preferredVoice = voices.find(voice => 
      voice.language.startsWith('en') && voice.quality === 'Enhanced'
    ) || voices.find(voice => voice.language.startsWith('en'));

    const speechOptions: Speech.SpeechOptions = {
      voice: preferredVoice?.identifier,
      rate: options.speed || 1.0,
      pitch: options.pitch || 1.0,
      language: 'en-US',
    };

    // Speak the text
    Speech.speak(text, speechOptions);
    
    return {
      duration: estimateSpeechDuration(text),
    };
  } catch (error) {
    console.error('Expo Speech error:', error);
    throw error;
  }
}

/**
 * Fallback TTS implementation for development
 */
async function textToSpeechMock(text: string, options: TTSOptions = {}): Promise<TTSResult> {
  // Simulate TTS processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`[Mock TTS] Speaking: "${text}"`);
  
  return {
    duration: estimateSpeechDuration(text),
  };
}

/**
 * Estimate speech duration based on text length and average speaking rate
 */
function estimateSpeechDuration(text: string): number {
  // Average speaking rate is about 150-160 words per minute
  // That's roughly 2.5-2.7 words per second
  const wordsPerSecond = 2.5;
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, wordCount / wordsPerSecond) * 1000; // Return in milliseconds
}

/**
 * Main text-to-speech function with provider fallback
 */
export async function textToSpeech(
  text: string, 
  options: TTSOptions = {}
): Promise<TTSResult> {
  if (!text.trim()) {
    return { duration: 0 };
  }

  const provider = options.provider || (Platform.OS === 'web' ? 'web' : 'expo');

  try {
    switch (provider) {
      case 'web':
        if (Platform.OS === 'web') {
          return await textToSpeechWeb(text, options);
        }
        throw new Error('Web Speech API only available in browser');

      case 'elevenlabs':
        return await textToSpeechElevenLabs(text, options);

      case 'expo':
        return await textToSpeechExpo(text, options);

      default:
        throw new Error(`Unknown TTS provider: ${provider}`);
    }
  } catch (error) {
    console.warn(`TTS provider ${provider} failed, falling back to mock:`, error);
    // Fallback to mock for development
    return await textToSpeechMock(text, options);
  }
}

/**
 * Play audio from URI using Expo Audio
 */
export async function playAudio(audioUri: string): Promise<void> {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
    await sound.playAsync();
    
    // Clean up after playback
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Audio playback error:', error);
    throw error;
  }
}

/**
 * Check if TTS is available on the current platform
 */
export function isTTSAvailable(): boolean {
  if (Platform.OS === 'web') {
    return 'speechSynthesis' in window;
  }
  return true; // Assume available on mobile with proper API keys
}

/**
 * Check if STT is available (for compatibility with VoiceSettingsScreen)
 */
export function isSTTAvailable(): boolean {
  if (Platform.OS === 'web') {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
  return true; // Assume available on mobile with proper API keys
}

/**
 * Get available voices for TTS
 */
export function getAvailableVoices(): Array<{ id: string; name: string; language: string }> {
  if (Platform.OS === 'web' && 'speechSynthesis' in window) {
    const voices = speechSynthesis.getVoices();
    return voices.map(voice => ({
      id: voice.voiceURI,
      name: voice.name,
      language: voice.lang,
    }));
  }
  
  // Default ElevenLabs voices
  return [
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', language: 'en-US' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', language: 'en-US' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', language: 'en-US' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', language: 'en-US' },
  ];
}

/**
 * Stop any currently playing TTS
 */
export function stopTTS(): void {
  if (Platform.OS === 'web' && 'speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  // For other platforms, this would need to be implemented based on the audio system used
}
