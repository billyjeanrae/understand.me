import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useOnboardingStore } from '../../stores/onboardingStore';

export default function ProfileSetupScreen() {
  const [bio, setBio] = useState('');
  const [conflictStyle, setConflictStyle] = useState('');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { updateProfile } = useAuthStore();
  const { completeOnboarding } = useOnboardingStore();
  const router = useRouter();

  const conflictStyles = [
    { id: 'collaborative', label: 'Collaborative', description: 'I prefer working together to find solutions' },
    { id: 'direct', label: 'Direct', description: 'I like to address issues head-on' },
    { id: 'accommodating', label: 'Accommodating', description: 'I often put others\' needs first' },
    { id: 'avoiding', label: 'Avoiding', description: 'I tend to avoid confrontation when possible' },
    { id: 'competitive', label: 'Competitive', description: 'I focus on achieving my goals' },
  ];

  const handleSaveProfile = async () => {
    if (!conflictStyle) {
      Alert.alert('Required Field', 'Please select your conflict resolution style');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        bio: bio.trim(),
        conflictStyle,
        goals: goals.trim(),
      });
      
      // Complete onboarding and navigate to main app
      completeOnboarding();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Complete onboarding without profile setup
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Help understand.me personalize your conflict resolution experience
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.label}>Tell us about yourself (optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Share anything that might help understand your perspective..."
              placeholderTextColor="#64748B"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Conflict Resolution Style *</Text>
            <Text style={styles.description}>
              How do you typically approach conflicts? This helps us tailor our guidance.
            </Text>
            
            <View style={styles.optionsContainer}>
              {conflictStyles.map((style) => (
                <Pressable
                  key={style.id}
                  style={[
                    styles.option,
                    conflictStyle === style.id && styles.selectedOption,
                  ]}
                  onPress={() => setConflictStyle(style.id)}
                >
                  <View style={styles.optionHeader}>
                    <View style={[
                      styles.radio,
                      conflictStyle === style.id && styles.radioSelected,
                    ]} />
                    <Text style={[
                      styles.optionLabel,
                      conflictStyle === style.id && styles.selectedOptionLabel,
                    ]}>
                      {style.label}
                    </Text>
                  </View>
                  <Text style={styles.optionDescription}>{style.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Your Goals (optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="What do you hope to achieve with conflict resolution? (e.g., better communication, stronger relationships...)"
              placeholderTextColor="#64748B"
              value={goals}
              onChangeText={setGoals}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.saveButton, loading && styles.disabledButton]} 
            onPress={handleSaveProfile}
            disabled={loading}
          >
            <Text style={styles.saveText}>
              {loading ? 'Saving...' : 'Complete Setup'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontFamily: 'Inter-Regular',
    minHeight: 100,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#64748B',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  selectedOptionLabel: {
    color: '#3B82F6',
  },
  optionDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 32,
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
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
});
