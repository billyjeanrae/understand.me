import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { User } from 'lucide-react-native';

import { OnboardingStep } from '../../../components/onboarding/OnboardingStep';
import { Input } from '../../../components/ui/Input';
import { useAuthStore } from '../../../stores/authStore';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { Spacing } from '../../../constants/Spacing';

export default function UsernameScreen() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  
  const { updateOnboardingData, onboardingData } = useAuthStore();

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (username.trim().length > 20) {
      setError('Username must be less than 20 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateUsername(username)) {
      updateOnboardingData({ username: username.trim(), currentStep: 2 });
      router.push('/(auth)/onboarding/password');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (error) {
      validateUsername(text);
    }
  };

  return (
    <OnboardingStep
      title="Choose Your Username"
      subtitle="This will be how others see you in shared sessions"
      currentStep={2}
      totalSteps={7}
      onNext={handleNext}
      onBack={handleBack}
      nextDisabled={!username.trim() || !!error}
    >
      <View style={styles.content}>
        <View style={styles.inputSection}>
          <Input
            label="Username"
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="Enter your username"
            autoCapitalize="none"
            autoComplete="username"
            error={error}
            leftIcon={<User size={20} color={Colors.text.tertiary} />}
            style={styles.input}
          />
          
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Tips for a good username:</Text>
            <Text style={styles.tip}>• Use 3-20 characters</Text>
            <Text style={styles.tip}>• Letters, numbers, and underscores only</Text>
            <Text style={styles.tip}>• Choose something you're comfortable sharing</Text>
          </View>
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <View style={styles.previewCard}>
            <View style={styles.avatar}>
              <User size={24} color={Colors.text.inverse} />
            </View>
            <Text style={styles.previewUsername}>
              {username.trim() || 'Your Username'}
            </Text>
          </View>
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
  
  inputSection: {
    gap: Spacing.xl,
  },
  
  input: {
    marginBottom: 0,
  },
  
  tips: {
    backgroundColor: Colors.background.tertiary,
    padding: Spacing.md,
    borderRadius: 12,
  },
  
  tipsTitle: {
    ...Typography.styles.label,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  tip: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  
  preview: {
    alignItems: 'center',
  },
  
  previewLabel: {
    ...Typography.styles.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  
  previewUsername: {
    ...Typography.styles.body,
    color: Colors.primary[700],
    fontWeight: '600',
  },
});
