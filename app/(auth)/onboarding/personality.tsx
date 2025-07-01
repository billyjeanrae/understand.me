import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
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

interface PersonalityResult {
  communicationStyle: 'direct' | 'diplomatic' | 'analytical' | 'empathetic';
  conflictStyle: 'competitive' | 'collaborative' | 'accommodating' | 'avoiding' | 'compromising';
  emotionalIntelligence: number;
  traits: string[];
  recommendations: string[];
}

export default function PersonalityAssessmentScreen() {
  const { user, updateOnboardingData } = useAuthStore();
  const [isListening, setIsListening] = useState(false);
  const [conversationActive, setConversationActive] = useState(false);
  const [agentMessage, setAgentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [personalityResult, setPersonalityResult] = useState<PersonalityResult | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [pulseAnim] = useState(new Animated.Value(1));

  // ElevenLabs conversation hook
  const conversation = useElevenLabsConversation(
    undefined,
    () => {
      console.log('Connected to Udine for personality assessment');
      setConversationActive(true);
      startPersonalityAssessment();
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
        
        // Check if assessment is complete
        if (message.text.includes('assessment complete') || message.text.includes('personality profile')) {
          completeAssessment();
        }
      } else if (message.type === 'user_transcript') {
        setConversationHistory(prev => [...prev, message.text]);
      }
    }
  );

  // Pulse animation
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

  const startPersonalityAssessment = async () => {
    try {
      setIsLoading(true);
      
      const result = await aiOrchestrationEngine.startPersonalityAssessment(
        user?.id || 'anonymous',
        user
      );

      if (result.agentResponse) {
        setAgentMessage(result.agentResponse.text);
      }
    } catch (error) {
      console.error('Failed to start personality assessment:', error);
      setAgentMessage("Let's explore your communication style and conflict resolution preferences. I'll ask you a few questions to understand how you naturally approach challenging conversations.");
    } finally {
      setIsLoading(false);
    }
  };

  const completeAssessment = async () => {
    try {
      setIsLoading(true);
      
      // Process conversation history to generate personality insights
      const result = await aiOrchestrationEngine.orchestrateWithAgent(
        { userMessage: 'Please complete my personality assessment based on our conversation' },
        {
          conversationId: `assessment-${user?.id}-${Date.now()}`,
          participantIds: [user?.id || 'anonymous'],
          sessionPhase: 'resolution',
          emotionHistory: [],
          sessionType: 'personality-assessment',
          voiceEnabled: true,
          agentPersonality: 'empathetic',
          toolsEnabled: ['assessPersonality', 'updateUserProfile'],
          userProfile: user
        }
      );

      // Extract personality results from tool calls
      const assessmentTool = result.agentResponse?.toolCalls?.find(
        call => call.name === 'assessPersonality'
      );

      if (assessmentTool?.result) {
        setPersonalityResult(assessmentTool.result);
        updateOnboardingData({ 
          personalityProfile: assessmentTool.result,
          personalityAssessmentCompleted: true 
        });
      }

      setAssessmentComplete(true);
    } catch (error) {
      console.error('Failed to complete assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoicePress = () => {
    if (!conversationActive) {
      conversation?.startSession();
    } else {
      setIsListening(!isListening);
      if (!isListening) {
        conversation?.startRecording();
      } else {
        conversation?.stopRecording();
      }
    }
  };

  const handleContinue = () => {
    router.push('/(main)/dashboard');
  };

  const handleSkip = () => {
    updateOnboardingData({ personalityAssessmentSkipped: true });
    router.push('/(main)/dashboard');
  };

  const getStyleDescription = (style: string) => {
    const descriptions = {
      direct: "You communicate clearly and straightforwardly",
      diplomatic: "You prefer tactful and considerate communication",
      analytical: "You approach conversations with logic and data",
      empathetic: "You prioritize understanding emotions and feelings"
    };
    return descriptions[style as keyof typeof descriptions] || style;
  };

  const getConflictStyleDescription = (style: string) => {
    const descriptions = {
      competitive: "You tend to assert your position strongly",
      collaborative: "You seek win-win solutions through cooperation",
      accommodating: "You often prioritize others' needs over your own",
      avoiding: "You prefer to sidestep conflicts when possible",
      compromising: "You look for middle-ground solutions"
    };
    return descriptions[style as keyof typeof descriptions] || style;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ResponsiveLayout>
        <OnboardingStep
          currentStep={3}
          totalSteps={5}
          title="Personality Assessment"
          subtitle="Help us understand your communication style"
          onBack={() => router.back()}
          onSkip={handleSkip}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {!assessmentComplete ? (
              <>
                {/* Assessment Card */}
                <Card style={styles.assessmentCard}>
                  <View style={styles.assessmentHeader}>
                    <Text style={styles.assessmentTitle}>Voice Assessment</Text>
                    <Text style={styles.assessmentSubtitle}>
                      Have a natural conversation with Udine about how you handle conflicts
                    </Text>
                  </View>

                  {/* Agent Message */}
                  {agentMessage ? (
                    <View style={styles.messageContainer}>
                      <View style={styles.messageBubble}>
                        <Text style={styles.messageText}>{agentMessage}</Text>
                      </View>
                      <Text style={styles.speakerLabel}>Udine</Text>
                    </View>
                  ) : null}

                  {/* Voice Interface */}
                  <View style={styles.voiceContainer}>
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
                        ? "Tap to start assessment"
                        : isListening 
                          ? "Listening... Share your thoughts"
                          : "Tap to respond"
                      }
                    </Text>
                  </View>

                  {/* Progress Indicator */}
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                      Responses: {conversationHistory.length}/5
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${Math.min((conversationHistory.length / 5) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </Card>

                {/* Sample Questions Card */}
                <Card style={styles.samplesCard}>
                  <Text style={styles.samplesTitle}>What We'll Explore</Text>
                  <View style={styles.samplesList}>
                    <Text style={styles.sampleItem}>• How you typically approach disagreements</Text>
                    <Text style={styles.sampleItem}>• Your preferred communication style</Text>
                    <Text style={styles.sampleItem}>• How you handle emotional situations</Text>
                    <Text style={styles.sampleItem}>• Your conflict resolution preferences</Text>
                    <Text style={styles.sampleItem}>• Strategies that work best for you</Text>
                  </View>
                </Card>
              </>
            ) : (
              <>
                {/* Results Card */}
                <Card style={styles.resultsCard}>
                  <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>Your Personality Profile</Text>
                    <Text style={styles.resultsSubtitle}>
                      Based on our conversation, here's what we learned about you
                    </Text>
                  </View>

                  {personalityResult && (
                    <View style={styles.resultsContent}>
                      {/* Communication Style */}
                      <View style={styles.resultSection}>
                        <Text style={styles.resultLabel}>Communication Style</Text>
                        <Text style={styles.resultValue}>
                          {personalityResult.communicationStyle.charAt(0).toUpperCase() + 
                           personalityResult.communicationStyle.slice(1)}
                        </Text>
                        <Text style={styles.resultDescription}>
                          {getStyleDescription(personalityResult.communicationStyle)}
                        </Text>
                      </View>

                      {/* Conflict Style */}
                      <View style={styles.resultSection}>
                        <Text style={styles.resultLabel}>Conflict Resolution Style</Text>
                        <Text style={styles.resultValue}>
                          {personalityResult.conflictStyle.charAt(0).toUpperCase() + 
                           personalityResult.conflictStyle.slice(1)}
                        </Text>
                        <Text style={styles.resultDescription}>
                          {getConflictStyleDescription(personalityResult.conflictStyle)}
                        </Text>
                      </View>

                      {/* Emotional Intelligence */}
                      <View style={styles.resultSection}>
                        <Text style={styles.resultLabel}>Emotional Intelligence</Text>
                        <View style={styles.eiContainer}>
                          <Text style={styles.eiScore}>{personalityResult.emotionalIntelligence}/10</Text>
                          <View style={styles.eiBar}>
                            <View 
                              style={[
                                styles.eiFill, 
                                { width: `${personalityResult.emotionalIntelligence * 10}%` }
                              ]} 
                            />
                          </View>
                        </View>
                      </View>

                      {/* Key Traits */}
                      <View style={styles.resultSection}>
                        <Text style={styles.resultLabel}>Key Traits</Text>
                        <View style={styles.traitsContainer}>
                          {personalityResult.traits.map((trait, index) => (
                            <View key={index} style={styles.traitTag}>
                              <Text style={styles.traitText}>{trait}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Recommendations */}
                      <View style={styles.resultSection}>
                        <Text style={styles.resultLabel}>Personalized Recommendations</Text>
                        <View style={styles.recommendationsList}>
                          {personalityResult.recommendations.map((rec, index) => (
                            <Text key={index} style={styles.recommendationItem}>
                              • {rec}
                            </Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                </Card>

                {/* Action Button */}
                <Button
                  title="Complete Setup"
                  onPress={handleContinue}
                  variant="primary"
                  style={styles.completeButton}
                />
              </>
            )}
          </ScrollView>
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
  },
  assessmentCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  assessmentHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  assessmentTitle: {
    ...Typography.styles.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  assessmentSubtitle: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageContainer: {
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
  voiceContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  voiceInstructions: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    ...Typography.styles.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  samplesCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  samplesTitle: {
    ...Typography.styles.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  samplesList: {
    gap: Spacing.sm,
  },
  sampleItem: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  resultsCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  resultsTitle: {
    ...Typography.styles.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  resultsSubtitle: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultsContent: {
    gap: Spacing.lg,
  },
  resultSection: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  resultLabel: {
    ...Typography.styles.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultValue: {
    ...Typography.styles.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  resultDescription: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  eiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  eiScore: {
    ...Typography.styles.h3,
    color: Colors.primary[500],
    fontWeight: '700',
  },
  eiBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  eiFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 4,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  traitTag: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  traitText: {
    ...Typography.styles.bodySmall,
    color: Colors.primary[500],
    fontWeight: '600',
  },
  recommendationsList: {
    gap: Spacing.sm,
  },
  recommendationItem: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  completeButton: {
    marginBottom: Spacing.xl,
  },
});