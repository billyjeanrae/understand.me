import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Pressable, Alert } from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';
import { useRecorder } from '../hooks/useRecorder';
import { speechToText } from '../services/ai/stt';
import { textToSpeech, playAudio } from '../services/ai/tts';
import { chatWithUdine } from '../services/ai/chat';

interface VoiceInteractionCoreProps {
  onVoiceInput?: (text: string) => void;
  onAIResponse?: (response: string) => void;
  disabled?: boolean;
}

export function VoiceInteractionCore({
  onVoiceInput,
  onAIResponse,
  disabled = false
}: VoiceInteractionCoreProps) {
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const recorder = useRecorder();

  const isListening = recorder.state.isRecording;
  const isLoading = recorder.state.isLoading;

  // Handle voice interaction flow
  const handleVoiceInteraction = async () => {
    if (disabled || isLoading) return;

    try {
      if (isListening) {
        // Stop recording and process
        const audioUri = await recorder.stopRecording();
        if (!audioUri) return;

        setIsThinking(true);

        // Convert speech to text
        const sttResult = await speechToText(audioUri);
        const userText = sttResult.text;

        // Notify parent component
        onVoiceInput?.(userText);

        // Add to conversation history
        const newHistory = [...conversationHistory, { role: 'user' as const, content: userText }];
        setConversationHistory(newHistory);

        // Get AI response
        const aiResponse = await chatWithUdine(newHistory, userText);
        
        // Add AI response to history
        const updatedHistory = [...newHistory, { role: 'assistant' as const, content: aiResponse }];
        setConversationHistory(updatedHistory);

        // Notify parent component
        onAIResponse?.(aiResponse);

        setIsThinking(false);
        setIsSpeaking(true);

        // Convert AI response to speech and play it
        try {
          const ttsResult = await textToSpeech(aiResponse);
          
          if (ttsResult.audioUri) {
            // Play the audio if we have a URI (ElevenLabs)
            await playAudio(ttsResult.audioUri);
          }
          
          // Use the estimated duration or fallback to calculation
          const speakingDuration = ttsResult.duration || aiResponse.length * 50;
          
          setTimeout(() => {
            setIsSpeaking(false);
          }, speakingDuration);
        } catch (ttsError) {
          console.error('TTS error:', ttsError);
          // Fallback to estimated duration if TTS fails
          setTimeout(() => {
            setIsSpeaking(false);
          }, aiResponse.length * 50);
        }

      } else {
        // Start recording
        await recorder.startRecording();
      }
    } catch (error) {
      console.error('Voice interaction error:', error);
      setIsThinking(false);
      setIsSpeaking(false);
      Alert.alert(
        'Voice Error',
        'Failed to process voice input. Please try again or use the chat interface.',
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    const currentState = isListening || isSpeaking || isThinking;
    
    if (isListening) {
      // Pulsing animation for listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (isSpeaking) {
      // Glowing animation for speaking
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (isThinking) {
      // Subtle breathing animation for thinking
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop all animations
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening, isSpeaking, isThinking, pulseAnim, glowAnim]);

  const getOrbColor = () => {
    if (isListening) return '#4ECDC4';
    if (isSpeaking) return '#45B7D1';
    if (isThinking) return '#96CEB4';
    return '#E8F4FD';
  };

  const getGlowColor = () => {
    if (isListening) return 'rgba(78, 205, 196, 0.3)';
    if (isSpeaking) return 'rgba(69, 183, 209, 0.4)';
    if (isThinking) return 'rgba(150, 206, 180, 0.2)';
    return 'rgba(232, 244, 253, 0.1)';
  };

  const getIcon = () => {
    if (isListening) return Mic;
    if (isSpeaking) return Volume2;
    if (disabled) return MicOff;
    return Mic;
  };

  const IconComponent = getIcon();

  return (
    <Pressable
      style={[styles.container, disabled && styles.disabled]}
      onPress={handleVoiceInteraction}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.outerGlow,
          {
            backgroundColor: getGlowColor(),
            transform: [{ scale: pulseAnim }],
            opacity: glowAnim,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          {
            backgroundColor: getOrbColor(),
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <IconComponent 
          size={32} 
          color="rgba(255, 255, 255, 0.9)" 
          strokeWidth={2}
        />
      </Animated.View>
      <View style={[styles.innerRing, { borderColor: getOrbColor() }]} />
      
      {/* Recording duration indicator */}
      {isListening && recorder.state.duration > 0 && (
        <View style={styles.durationIndicator}>
          <View style={[styles.durationBar, { width: Math.min(recorder.state.duration / 100, 100) }]} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  outerGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  orb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  innerRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  durationIndicator: {
    position: 'absolute',
    bottom: -10,
    left: 10,
    right: 10,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  durationBar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
});
