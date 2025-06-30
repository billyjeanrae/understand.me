# Voice Interaction System

This document describes the complete voice interaction system implemented in understand.me, providing both speech-to-text (STT) and text-to-speech (TTS) capabilities for natural conversation with Udine.

## 🎯 Overview

The voice interaction system enables users to:
- **Speak to Udine**: Convert speech to text for natural input
- **Hear Udine's responses**: Convert AI responses to speech
- **Seamless conversation flow**: Automatic turn-taking between user and AI
- **Cross-platform support**: Works on web, Android, and iOS
- **Fallback options**: Graceful degradation when services are unavailable

## 🏗️ Architecture

### Core Components

1. **VoiceInteractionCore** (`components/VoiceInteractionCore.tsx`)
   - Main voice interaction component with animated UI
   - Handles the complete voice conversation flow
   - Integrates recording, STT, AI chat, and TTS

2. **useRecorder Hook** (`hooks/useRecorder.ts`)
   - Cross-platform audio recording functionality
   - Permission handling for microphone access
   - Recording state management and duration tracking

3. **Speech-to-Text Service** (`services/ai/stt.ts`)
   - Multiple STT provider support (Google, Web Speech API)
   - Language detection and configuration
   - Fallback mechanisms for reliability

4. **Text-to-Speech Service** (`services/ai/tts.ts`)
   - Multiple TTS provider support (ElevenLabs, Web Speech API)
   - Voice selection and customization
   - Audio playback management

### Service Providers

#### Speech-to-Text (STT)
- **Google Speech-to-Text API**: High-accuracy cloud-based STT
- **Web Speech API**: Browser-native STT for web platforms
- **Mock Service**: Development fallback with simulated responses

#### Text-to-Speech (TTS)
- **ElevenLabs API**: High-quality AI voices with natural intonation
- **Web Speech API**: Browser-native TTS for web platforms
- **Mock Service**: Development fallback with duration estimation

## 🚀 Usage

### Basic Voice Interaction

```tsx
import { VoiceInteractionCore } from '../components/VoiceInteractionCore';

function MyComponent() {
  const handleVoiceInput = (text: string) => {
    console.log('User said:', text);
  };

  const handleAIResponse = (response: string) => {
    console.log('AI responded:', response);
  };

  return (
    <VoiceInteractionCore
      onVoiceInput={handleVoiceInput}
      onAIResponse={handleAIResponse}
      disabled={false}
    />
  );
}
```

### Using Individual Services

#### Recording Audio
```tsx
import { useRecorder } from '../hooks/useRecorder';

function RecordingComponent() {
  const recorder = useRecorder();

  const startRecording = async () => {
    try {
      await recorder.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const audioUri = await recorder.stopRecording();
      console.log('Recording saved to:', audioUri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  return (
    <View>
      <Button 
        title={recorder.state.isRecording ? "Stop" : "Start"} 
        onPress={recorder.state.isRecording ? stopRecording : startRecording}
      />
      {recorder.state.isRecording && (
        <Text>Recording... {recorder.state.duration}ms</Text>
      )}
    </View>
  );
}
```

#### Speech-to-Text
```tsx
import { speechToText } from '../services/ai/stt';

const convertSpeechToText = async (audioUri: string) => {
  try {
    const result = await speechToText(audioUri, {
      language: 'en-US',
      provider: 'google'
    });
    console.log('Transcription:', result.text);
    console.log('Confidence:', result.confidence);
  } catch (error) {
    console.error('STT error:', error);
  }
};
```

#### Text-to-Speech
```tsx
import { textToSpeech, playAudio } from '../services/ai/tts';

const speakText = async (text: string) => {
  try {
    const result = await textToSpeech(text, {
      voice: 'pNInz6obpgDQGcFmaJgB', // Adam voice
      provider: 'elevenlabs'
    });
    
    if (result.audioUri) {
      await playAudio(result.audioUri);
    }
  } catch (error) {
    console.error('TTS error:', error);
  }
};
```

## ⚙️ Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Google Speech-to-Text API
GOOGLE_GENAI_API_KEY=your_google_api_key_here

# ElevenLabs Text-to-Speech API
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Hume AI (for future emotion detection)
EXPO_PUBLIC_HUME_API_KEY=your_hume_api_key_here
```

### Voice Settings

The system supports comprehensive voice customization:

```tsx
interface VoiceSettings {
  ttsEnabled: boolean;           // Enable/disable TTS
  sttEnabled: boolean;           // Enable/disable STT
  selectedVoice: string;         // Voice ID for TTS
  selectedLanguage: string;      // Language for STT
  speechSpeed: number;           // TTS speed (0.5 - 1.5)
  autoSpeak: boolean;           // Auto-speak AI responses
}
```

### Supported Languages

STT supports these languages:
- English (US, UK)
- Spanish (Spain, Mexico)
- French, German, Italian
- Portuguese (Brazil)
- Japanese, Korean
- Chinese (Simplified, Traditional)

### Available Voices (ElevenLabs)

- **Adam** (`pNInz6obpgDQGcFmaJgB`): Professional male voice
- **Bella** (`EXAVITQu4vr4xnSDxMaL`): Warm female voice
- **Antoni** (`ErXwobaYiN019PkySvjV`): Expressive male voice
- **Arnold** (`VR6AewLTigWG4xSOukaG`): Deep male voice

## 🔧 Platform-Specific Implementation

### Web Platform
- Uses Web Speech API for both STT and TTS
- Requires HTTPS for microphone access
- Fallback to ElevenLabs for higher quality TTS

### Mobile Platforms (iOS/Android)
- Uses Expo AV for audio recording
- Integrates with Google Speech-to-Text API
- Uses ElevenLabs for high-quality TTS

### Permission Handling

```tsx
// Automatic permission requests
const recorder = useRecorder();

// Manual permission check
import { Audio } from 'expo-av';

const checkPermissions = async () => {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
};
```

## 🎨 UI Components

### VoiceInteractionCore Features

- **Animated orb**: Visual feedback for different states
- **State indicators**: Listening, thinking, speaking states
- **Duration tracking**: Shows recording progress
- **Touch interaction**: Tap to start/stop recording
- **Accessibility**: Proper ARIA labels and screen reader support

### Visual States

1. **Idle**: Soft blue orb with microphone icon
2. **Listening**: Pulsing teal orb with microphone icon
3. **Thinking**: Gentle breathing animation with processing indicator
4. **Speaking**: Glowing blue orb with speaker icon
5. **Disabled**: Grayed out orb with disabled microphone icon

## 🔄 Conversation Flow

1. **User taps microphone**: Recording starts
2. **User speaks**: Audio is captured with visual feedback
3. **User taps again or pauses**: Recording stops
4. **Processing**: Audio is converted to text via STT
5. **AI thinking**: Text is sent to AI for response
6. **AI response**: Response is converted to speech via TTS
7. **Playback**: AI response is played back to user
8. **Ready**: System returns to idle state for next interaction

## 🛠️ Development & Testing

### Mock Services

For development without API keys:

```tsx
// Enable mock mode
const result = await speechToText(audioUri, { provider: 'mock' });
const ttsResult = await textToSpeech(text, { provider: 'mock' });
```

### Testing Voice Features

1. **STT Testing**: Record short phrases and verify transcription accuracy
2. **TTS Testing**: Use the voice settings screen to test different voices
3. **Integration Testing**: Complete conversation flows
4. **Error Handling**: Test with network issues and permission denials

### Debugging

Enable verbose logging:

```tsx
// In your component
useEffect(() => {
  console.log('Voice interaction state:', {
    isListening: recorder.state.isRecording,
    isThinking,
    isSpeaking,
  });
}, [recorder.state.isRecording, isThinking, isSpeaking]);
```

## 🔮 Future Enhancements

### Planned Features

1. **Emotion Detection**: Integrate Hume AI for emotional context
2. **Voice Cloning**: Custom voice training for personalized responses
3. **Multi-language Conversations**: Real-time language switching
4. **Noise Cancellation**: Improved audio quality in noisy environments
5. **Offline Mode**: Local STT/TTS for privacy and reliability

### Integration Opportunities

- **Conflict Resolution Context**: Emotion-aware responses
- **Personalization**: Voice preferences based on user profile
- **Analytics**: Conversation quality metrics
- **Accessibility**: Enhanced support for hearing/speech impairments

## 📚 API Reference

### VoiceInteractionCore Props

```tsx
interface VoiceInteractionCoreProps {
  onVoiceInput?: (text: string) => void;     // Callback for STT results
  onAIResponse?: (response: string) => void; // Callback for AI responses
  disabled?: boolean;                        // Disable voice interaction
}
```

### useRecorder Return Value

```tsx
interface UseRecorderReturn {
  state: {
    isRecording: boolean;    // Currently recording
    isLoading: boolean;      // Processing audio
    duration: number;        // Recording duration in ms
    uri: string | null;      // Last recording URI
  };
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  playRecording: () => Promise<void>;
  clearRecording: () => void;
}
```

### STT Options

```tsx
interface STTOptions {
  language?: string;                           // Language code (e.g., 'en-US')
  provider?: 'google' | 'whisper' | 'web';   // STT provider
}
```

### TTS Options

```tsx
interface TTSOptions {
  voice?: string;                              // Voice ID
  speed?: number;                              // Speech speed (0.5-1.5)
  pitch?: number;                              // Voice pitch
  provider?: 'elevenlabs' | 'web' | 'expo';   // TTS provider
}
```

---

This voice interaction system provides a robust foundation for natural conversation with AI, with extensive customization options and cross-platform compatibility.

