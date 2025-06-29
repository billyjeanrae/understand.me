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
import { useAuthStore } from '../stores/authStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProfileSetupNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileSetup'>;

interface Props {
  navigation: ProfileSetupNavigationProp;
}

export default function ProfileSetupScreen({ navigation }: Props) {
  const [bio, setBio] = useState('');
  const [conflictStyle, setConflictStyle] = useState('');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { updateProfile } = useAuthStore();

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
      // Navigation will be handled by AppNavigator
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Help Udine understand your communication style for better mediation
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.label}>Tell us about yourself (optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Share anything that might help Udine understand your perspective..."
              placeholderTextColor="#64748B"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Your Conflict Resolution Style *</Text>
            <Text style={styles.helperText}>
              How do you typically approach conflicts?
            </Text>
            {conflictStyles.map((style) => (
              <Pressable
                key={style.id}
                style={[
                  styles.styleOption,
                  conflictStyle === style.id && styles.selectedStyle,
                ]}
                onPress={() => setConflictStyle(style.id)}
              >
                <View style={styles.styleHeader}>
                  <Text style={[
                    styles.styleLabel,
                    conflictStyle === style.id && styles.selectedStyleLabel,
                  ]}>
                    {style.label}
                  </Text>
                  <View style={[
                    styles.radio,
                    conflictStyle === style.id && styles.radioSelected,
                  ]} />
                </View>
                <Text style={styles.styleDescription}>{style.description}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>What are your goals? (optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="What do you hope to achieve through better conflict resolution?"
              placeholderTextColor="#64748B"
              value={goals}
              onChangeText={setGoals}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
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
    color: '#F1F5F9',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  helperText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 100,
  },
  styleOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  selectedStyle: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  styleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  styleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  selectedStyleLabel: {
    color: '#3B82F6',
  },
  styleDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  radioSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

