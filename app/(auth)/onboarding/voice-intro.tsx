import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingStep } from '../../../components/onboarding/OnboardingStep';
import { VoiceButton } from '../../../components/session/VoiceButton';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ResponsiveLayout } from '../../../components/layout/ResponsiveLayout';

import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { Spacing } from '../../../constants/Spacing';

import { useAuthStore } from '../../../stores/authStore';
import { aiOrchestrationEngine } from '../../../services/ai/orchestrationEngine';
import { useElevenLabsConversation } from '../../../services/elevenlabs/conversationalAI';

const { width } = Dimensions.get('window');

export default function VoiceIntroScreen() {
  const { user, updateOnboardingData } = useAuthStore();
  const [isListening, setIsListening] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [agentMessage, setAgentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  // ElevenLabs conversation hook
  const conversation = useElevenLabsConversation(
    undefined, // Use default agent ID
    () => {
      console.log('Connected to Udine');
      setConversationActive(true);
      startVoiceOnboarding();
    },
    () => {
      console.log('Disconnected from Udine');
      setConversationActive(false);
    },
    (error) => {
      console.error('Conversation error:', error);
      setConversationActive(false);
    },
    (message) => {
      console.log('Received message:', message);
      if (message.type === 'agent_response') {
        setAgentMessage(message.text);
      }
    }
  );

  // Pulse animation for voice button
  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
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
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isListening, pulseAnim]);

  const startVoiceOnboarding = async () => {
    try {
      setIsLoading(true);
      
      // Start voice-guided onboarding through orchestration engine
      const result = await aiOrchestrationEngine.startVoiceOnboarding(
        user?.id || 'anonymous',
        user
      );

      if (result.agentResponse) {
        setAgentMessage(result.agentResponse.text);
      }
    } catch (error) {
      console.error('Failed to start voice onboarding:', error);
      setAgentMessage("Hi! I'm Udine, your AI mediator. I'm here to help you get started with understand.me. Let's begin by getting to know each other better.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoicePress = () => {
    if (!conversationActive) {
      // Start conversation
      conversation?.startSession();
    } else {
      // Toggle listening
      setIsListening(!isListening);
      if (!isListening) {
        conversation?.startRecording();
      } else {
        conversation?.stopRecording();
      }
    }
  };

  const handleSkipVoice = () => {
    updateOnboardingData({ voiceOnboardingSkipped: true });
    router.push('/(auth)/onboarding/personality');
  };

  const handleContinue = () => {
    updateOnboardingData({ voiceOnboardingCompleted: true });
    router.push('/(auth)/onboarding/personality');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveLayout>
        <OnboardingStep
          currentStep={2}
          totalSteps={5}
          title="Meet Udine"
          subtitle="Your AI mediator is ready to guide you"
          onBack={() => router.back()}
          onSkip={handleSkipVoice}
        >
          <View style={styles.content}>
            {/* Voice Interaction Card */}
            <Card style={styles.voiceCard}>
              <View style={styles.voiceHeader}>
                <Text style={styles.voiceTitle}>Voice Introduction</Text>
                <Text style={styles.voiceSubtitle}>
                  Let's start with a voice conversation to personalize your experience
                </Text>
              </View>

              {/* Agent Message Display */}
              {agentMessage ? (
                <View style={styles.messageContainer}>
                  <View style={styles.messageBubble}>
                    <Text style={styles.messageText}>{agentMessage}</Text>
                  </View>
                  <Text style={styles.speakerLabel}>Udine</Text>
                </View>
              ) : null}

              {/* Voice Button */}
              <View style={styles.voiceButtonContainer}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <VoiceButton
                    isListening={isListening}
                    isProcessing={isLoading}
                    onPress={handleVoicePress}
                    size="large"
                    disabled={isLoading}
                  />
                </Animated.View>
                
                <Text style={styles.voiceInstructions}>
                  {!conversationActive 
                    ? "Tap to start conversation"
                    : isListening 
                      ? "Listening... Speak naturally"
                      : "Tap to speak"
                  }
                </Text>
              </View>

              {/* Connection Status */}
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: conversationActive ? Colors.emotion.positive : Colors.emotion.neutral }
                ]} />
                <Text style={styles.statusText}>
                  {conversationActive ? 'Connected to Udine' : 'Connecting...'}
                </Text>
              </View>
            </Card>

            {/* Benefits Card */}
            <Card style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>Why Voice Matters</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>🎯</Text>
                  <Text style={styles.benefitText}>Personalized guidance based on your communication style</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>🧠</Text>
                  <Text style={styles.benefitText}>Emotional intelligence assessment through voice</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>💬</Text>
                  <Text style={styles.benefitText}>Natural conversation practice for real conflicts</Text>
                </View>
              </View>
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {agentMessage && (
                <Button
                  title="Continue to Assessment"
                  onPress={handleContinue}
                  variant="primary"
                  style={styles.continueButton}
                />
              )}
              
              <Button
                title="Skip Voice Setup"
                onPress={handleSkipVoice}
                variant="outline"
                style={styles.skipButton}
              />
            </View>
          </View>
        </OnboardingStep>
      </ResponsiveLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    gap: Spacing.lg,
  },
  voiceCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  voiceHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  voiceTitle: {
    ...Typography.styles.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  voiceSubtitle: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  messageBubble: {
    backgroundColor: Colors.primary[100],
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.xs,
  },
  messageText: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  speakerLabel: {
    ...Typography.styles.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  voiceButtonContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  voiceInstructions: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...Typography.styles.bodySmall,
    color: Colors.text.secondary,
  },
  benefitsCard: {
    padding: Spacing.lg,
  },
  benefitsTitle: {
    ...Typography.styles.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  benefitsList: {
    gap: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  benefitIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  benefitText: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  actionButtons: {
    gap: Spacing.md,
  },
  continueButton: {
    marginBottom: Spacing.sm,
  },
  skipButton: {
    // Additional styling if needed
  },
});
