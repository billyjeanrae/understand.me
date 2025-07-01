import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ResponsiveLayout } from '../layout/ResponsiveLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export interface OnboardingStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  nextButtonText?: string;
  backButtonText?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextButtonText = 'Continue',
  backButtonText = 'Back',
  nextDisabled = false,
  loading = false,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <ResponsiveLayout>
      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentStep} of {totalSteps}
          </Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* Content */}
        <Card style={styles.contentCard}>
          {children}
        </Card>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          {onBack && (
            <Button
              title={backButtonText}
              onPress={onBack}
              variant="outline"
              style={styles.backButton}
            />
          )}
          
          {onNext && (
            <Button
              title={nextButtonText}
              onPress={onNext}
              disabled={nextDisabled}
              loading={loading}
              style={styles.nextButton}
              fullWidth={!onBack}
            />
          )}
        </View>
      </View>
    </ResponsiveLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: Spacing.xl,
  },
  
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  
  progressBackground: {
    height: 4,
    backgroundColor: Colors.border.light,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  
  progressText: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  
  title: {
    ...Typography.styles.h2,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  subtitle: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  
  contentCard: {
    flex: 1,
    marginBottom: Spacing.xl,
  },
  
  navigation: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  backButton: {
    flex: 1,
  },
  
  nextButton: {
    flex: 2,
  },
});
