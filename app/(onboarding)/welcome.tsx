import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { Mic, MessageCircle, Heart, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    icon: Heart,
    title: 'Welcome to understand.me',
    description: 'Your AI-powered conflict resolution companion. Let\'s help you navigate difficult conversations with empathy and understanding.',
  },
  {
    icon: MessageCircle,
    title: 'Two Ways to Communicate',
    description: 'Talk naturally with Udine using your voice, or type your thoughts in the chat. Choose what feels comfortable for each moment.',
  },
  {
    icon: Mic,
    title: 'Voice Permission Needed',
    description: 'To enable voice conversations, we need access to your microphone. This allows for natural, flowing dialogue with your AI mediator.',
  },
  {
    icon: CheckCircle,
    title: 'Ready to Begin',
    description: 'You\'re all set! Start by describing a situation you\'d like help with, and Udine will guide you through the resolution process.',
  },
];

export default function OnboardingWelcomeScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const { completeOnboarding } = useOnboardingStore();
  const router = useRouter();

  const requestMicrophonePermission = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermissionGranted(true);
      } else {
        // For mobile, you would use expo-av or react-native-permissions
        // For now, we'll simulate permission granted
        setMicPermissionGranted(true);
        Alert.alert('Permission Granted', 'Microphone access has been granted!');
      }
    } catch (error) {
      Alert.alert(
        'Permission Denied',
        'Microphone access is needed for voice conversations. You can still use text chat.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleNext = async () => {
    if (currentStep === 2 && !micPermissionGranted) {
      await requestMicrophonePermission();
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and navigate to profile setup
      router.push('/(onboarding)/profile-setup');
    }
  };

  const handleSkip = () => {
    // Skip to profile setup
    router.push('/(onboarding)/profile-setup');
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconComponent size={48} color="#3B82F6" strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </View>

        <View style={styles.indicators}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentStep && styles.activeIndicator,
                index < currentStep && styles.completedIndicator,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>
              {currentStep === onboardingSteps.length - 1 ? 'Continue' : 'Next'}
            </Text>
          </Pressable>
        </View>

        {currentStep === 2 && micPermissionGranted && (
          <View style={styles.permissionGranted}>
            <CheckCircle size={20} color="#10B981" strokeWidth={2} />
            <Text style={styles.permissionText}>Microphone access granted!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  description: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  completedIndicator: {
    backgroundColor: '#10B981',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  permissionGranted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  permissionText: {
    color: '#10B981',
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});
