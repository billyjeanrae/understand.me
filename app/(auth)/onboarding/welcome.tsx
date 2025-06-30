import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Heart, Users, Target, Mic } from 'lucide-react-native';

import { OnboardingStep } from '../../../components/onboarding/OnboardingStep';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { Spacing } from '../../../constants/Spacing';

export default function WelcomeScreen() {
  const handleVoiceIntro = () => {
    router.push('/(auth)/onboarding/voice-intro');
  };

  const handleSkipVoice = () => {
    router.push('/(auth)/onboarding/username');
  };

  return (
    <OnboardingStep
      title="Welcome to Understand.me"
      subtitle="Let's set up your profile to personalize your conflict resolution journey"
      currentStep={1}
      totalSteps={7}
      showNextButton={false}
    >
      <View style={styles.content}>
        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={styles.iconContainer}>
              <Heart size={32} color={Colors.emotion.positive} />
            </View>
            <Text style={styles.featureTitle}>Emotional Intelligence</Text>
            <Text style={styles.featureDescription}>
              Learn to understand and manage emotions during conflicts
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.iconContainer}>
              <Users size={32} color={Colors.primary[500]} />
            </View>
            <Text style={styles.featureTitle}>Better Communication</Text>
            <Text style={styles.featureDescription}>
              Develop skills for healthier conversations and relationships
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.iconContainer}>
              <Target size={32} color={Colors.secondary[500]} />
            </View>
            <Text style={styles.featureTitle}>Personalized Growth</Text>
            <Text style={styles.featureDescription}>
              Get insights tailored to your communication style and goals
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.iconContainer}>
              <Mic size={32} color={Colors.primary.main} />
            </View>
            <Text style={styles.featureTitle}>Voice-Guided Experience</Text>
            <Text style={styles.featureDescription}>
              Meet Udine, your AI mediator, for personalized voice interactions
            </Text>
          </View>
        </View>

        <View style={styles.welcomeMessage}>
          <Text style={styles.welcomeText}>
            Choose how you'd like to begin your journey with understand.me
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="🎤 Start with Voice Introduction"
            onPress={handleVoiceIntro}
            variant="primary"
            style={styles.voiceButton}
          />
          
          <Button
            title="Continue with Text Setup"
            onPress={handleSkipVoice}
            variant="outline"
            style={styles.textButton}
          />
        </View>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  features: {
    gap: Spacing.xl,
  },
  
  feature: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  featureTitle: {
    ...Typography.styles.h5,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  featureDescription: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  welcomeMessage: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  
  welcomeText: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  actionButtons: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },

  voiceButton: {
    marginBottom: Spacing.sm,
  },

  textButton: {
    // Additional styling if needed
  },
});
