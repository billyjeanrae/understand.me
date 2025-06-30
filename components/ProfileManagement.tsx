/**
 * Profile Management Component
 * Comprehensive interface for managing user profile and preferences
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput,
  Switch,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Settings, 
  Brain, 
  MessageCircle, 
  Target,
  TrendingUp,
  Save,
  RefreshCw
} from 'lucide-react-native';

import { 
  useProfile, 
  useProfileAnalytics, 
  useProfileActions,
  useProfileUpdating,
  useProfileError
} from '../stores/userProfileStore';
import { 
  UserProfile, 
  ConflictSkill, 
  SkillLevel,
  ConflictStrength,
  LearningActivity
} from '../types/user';

interface ProfileManagementProps {
  onClose?: () => void;
}

export default function ProfileManagement({ onClose }: ProfileManagementProps) {
  const profile = useProfile();
  const analytics = useProfileAnalytics();
  const { updateProfile, refreshAnalytics, clearError } = useProfileActions();
  const isUpdating = useProfileUpdating();
  const error = useProfileError();

  const [activeTab, setActiveTab] = useState<'personal' | 'preferences' | 'communication' | 'learning'>('personal');
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState(profile || {} as UserProfile);

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No profile found. Please create a profile first.</Text>
      </View>
    );
  }

  const handleInputChange = (section: keyof UserProfile, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        personalInfo: formData.personalInfo,
        conflictPreferences: formData.conflictPreferences,
        communicationStyle: formData.communicationStyle,
        learningPatterns: formData.learningPatterns,
        personalizationSettings: formData.personalizationSettings,
      });
      setHasChanges(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleRefreshAnalytics = async () => {
    try {
      await refreshAnalytics();
      Alert.alert('Success', 'Analytics refreshed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh analytics.');
    }
  };

  const renderPersonalInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
          placeholder="Your name"
          placeholderTextColor="#64748B"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={formData.personalInfo?.age?.toString() || ''}
          onChangeText={(value) => handleInputChange('personalInfo', 'age', parseInt(value) || undefined)}
          placeholder="Your age"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Occupation</Text>
        <TextInput
          style={styles.input}
          value={formData.personalInfo?.occupation || ''}
          onChangeText={(value) => handleInputChange('personalInfo', 'occupation', value)}
          placeholder="Your occupation"
          placeholderTextColor="#64748B"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Relationship Status</Text>
        <View style={styles.pickerContainer}>
          {['single', 'partnered', 'married', 'divorced', 'widowed', 'other'].map((status) => (
            <Pressable
              key={status}
              style={[
                styles.pickerOption,
                formData.personalInfo?.relationshipStatus === status && styles.pickerOptionSelected
              ]}
              onPress={() => handleInputChange('personalInfo', 'relationshipStatus', status)}
            >
              <Text style={[
                styles.pickerOptionText,
                formData.personalInfo?.relationshipStatus === status && styles.pickerOptionTextSelected
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Has Children</Text>
          <Switch
            value={formData.personalInfo?.hasChildren || false}
            onValueChange={(value) => handleInputChange('personalInfo', 'hasChildren', value)}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );

  const renderConflictPreferences = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Conflict Resolution Preferences</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred Approach</Text>
        <View style={styles.pickerContainer}>
          {['collaborative', 'competitive', 'accommodating', 'avoiding', 'compromising'].map((approach) => (
            <Pressable
              key={approach}
              style={[
                styles.pickerOption,
                formData.conflictPreferences?.preferredApproach === approach && styles.pickerOptionSelected
              ]}
              onPress={() => handleInputChange('conflictPreferences', 'preferredApproach', approach)}
            >
              <Text style={[
                styles.pickerOptionText,
                formData.conflictPreferences?.preferredApproach === approach && styles.pickerOptionTextSelected
              ]}>
                {approach.charAt(0).toUpperCase() + approach.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Communication Preference</Text>
        <View style={styles.pickerContainer}>
          {['direct', 'indirect', 'balanced'].map((pref) => (
            <Pressable
              key={pref}
              style={[
                styles.pickerOption,
                formData.conflictPreferences?.communicationPreference === pref && styles.pickerOptionSelected
              ]}
              onPress={() => handleInputChange('conflictPreferences', 'communicationPreference', pref)}
            >
              <Text style={[
                styles.pickerOptionText,
                formData.conflictPreferences?.communicationPreference === pref && styles.pickerOptionTextSelected
              ]}>
                {pref.charAt(0).toUpperCase() + pref.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Session Duration Preference</Text>
        <View style={styles.pickerContainer}>
          {['short', 'medium', 'long', 'flexible'].map((duration) => (
            <Pressable
              key={duration}
              style={[
                styles.pickerOption,
                formData.conflictPreferences?.sessionDuration === duration && styles.pickerOptionSelected
              ]}
              onPress={() => handleInputChange('conflictPreferences', 'sessionDuration', duration)}
            >
              <Text style={[
                styles.pickerOptionText,
                formData.conflictPreferences?.sessionDuration === duration && styles.pickerOptionTextSelected
              ]}>
                {duration.charAt(0).toUpperCase() + duration.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Trigger Topics (Sensitive Areas)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.conflictPreferences?.triggerTopics?.join(', ') || ''}
          onChangeText={(value) => handleInputChange('conflictPreferences', 'triggerTopics', value.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="Enter topics separated by commas"
          placeholderTextColor="#64748B"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderCommunicationStyle = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Communication Style</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred Mode</Text>
        <View style={styles.pickerContainer}>
          {['voice', 'text', 'mixed'].map((mode) => (
            <Pressable
              key={mode}
              style={[
                styles.pickerOption,
                formData.communicationStyle?.preferredMode === mode && styles.pickerOptionSelected
              ]}
              onPress={() => handleInputChange('communicationStyle', 'preferredMode', mode)}
            >
              <Text style={[
                styles.pickerOptionText,
                formData.communicationStyle?.preferredMode === mode && styles.pickerOptionTextSelected
              ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>AI Personality</Text>
        <View style={styles.pickerContainer}>
          {['supportive', 'direct', 'analytical', 'empathetic'].map((personality) => (
            <Pressable
              key={personality}
              style={[
                styles.pickerOption,
                formData.communicationStyle?.aiInteractionStyle?.personality === personality && styles.pickerOptionSelected
              ]}
              onPress={() => handleInputChange('communicationStyle', 'aiInteractionStyle', {
                ...formData.communicationStyle?.aiInteractionStyle,
                personality
              })}
            >
              <Text style={[
                styles.pickerOptionText,
                formData.communicationStyle?.aiInteractionStyle?.personality === personality && styles.pickerOptionTextSelected
              ]}>
                {personality.charAt(0).toUpperCase() + personality.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Intervention Level</Text>
        <View style={styles.pickerContainer}>
          {['minimal', 'moderate', 'active'].map((level) => (
            <Pressable
              key={level}
              style={[
                styles.pickerOption,
                formData.communicationStyle?.aiInteractionStyle?.interventionLevel === level && styles.pickerOptionSelected
              ]}
              onPress={() => handleInputChange('communicationStyle', 'aiInteractionStyle', {
                ...formData.communicationStyle?.aiInteractionStyle,
                interventionLevel: level
              })}
            >
              <Text style={[
                styles.pickerOptionText,
                formData.communicationStyle?.aiInteractionStyle?.interventionLevel === level && styles.pickerOptionTextSelected
              ]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Use Emojis in Text</Text>
          <Switch
            value={formData.communicationStyle?.textPreferences?.useEmojis || false}
            onValueChange={(value) => handleInputChange('communicationStyle', 'textPreferences', {
              ...formData.communicationStyle?.textPreferences,
              useEmojis: value
            })}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );

  const renderLearningPatterns = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Learning Preferences</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Learning Style</Text>
        <View style={styles.pickerContainer}>
          {['visual', 'auditory', 'kinesthetic', 'reading', 'mixed'].map((style) => (
            <Pressable
              key={style}
              style={[
                styles.pickerOption,
                formData.learningPatterns?.learningStyle === style && styles.pickerOptionSelected
              ]}
              onPress={() => handleInputChange('learningPatterns', 'learningStyle', style)}
            >
              <Text style={[
                styles.pickerOptionText,
                formData.learningPatterns?.learningStyle === style && styles.pickerOptionTextSelected
              ]}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Adaptation Rate</Text>
        <View style={styles.pickerContainer}>
          {['fast', 'moderate', 'slow'].map((rate) => (
            <Pressable
              key={rate}
              style={[
                styles.pickerOption,
                formData.learningPatterns?.adaptationRate === rate && styles.pickerOptionSelected
              ]}
              onPress={() => handleInputChange('learningPatterns', 'adaptationRate', rate)}
            >
              <Text style={[
                styles.pickerOptionText,
                formData.learningPatterns?.adaptationRate === rate && styles.pickerOptionTextSelected
              ]}>
                {rate.charAt(0).toUpperCase() + rate.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {analytics && (
        <View style={styles.analyticsSection}>
          <Text style={styles.analyticsTitle}>Your Progress</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsValue}>{analytics.profileCompleteness}%</Text>
              <Text style={styles.analyticsLabel}>Profile Complete</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsValue}>{analytics.learningProgress}%</Text>
              <Text style={styles.analyticsLabel}>Learning Progress</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsValue}>{analytics.engagementScore}</Text>
              <Text style={styles.analyticsLabel}>Engagement Score</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'preferences':
        return renderConflictPreferences();
      case 'communication':
        return renderCommunicationStyle();
      case 'learning':
        return renderLearningPatterns();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Management</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={handleRefreshAnalytics}>
            <RefreshCw size={20} color="#94A3B8" strokeWidth={2} />
          </Pressable>
          {onClose && (
            <Pressable style={styles.headerButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Done</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.errorButton} onPress={clearError}>
            <Text style={styles.errorButtonText}>Dismiss</Text>
          </Pressable>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'personal', label: 'Personal', icon: User },
            { key: 'preferences', label: 'Preferences', icon: Target },
            { key: 'communication', label: 'Communication', icon: MessageCircle },
            { key: 'learning', label: 'Learning', icon: Brain },
          ].map(({ key, label, icon: Icon }) => (
            <Pressable
              key={key}
              style={[styles.tab, activeTab === key && styles.tabActive]}
              onPress={() => setActiveTab(key as any)}
            >
              <Icon 
                size={16} 
                color={activeTab === key ? '#3B82F6' : '#94A3B8'} 
                strokeWidth={2} 
              />
              <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={styles.saveContainer}>
          <Pressable 
            style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isUpdating}
          >
            <Save size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.saveButtonText}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  closeButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    flex: 1,
  },
  errorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EF4444',
    borderRadius: 6,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  pickerOptionText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#3B82F6',
  },
  analyticsSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    alignItems: 'center',
    flex: 1,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  saveContainer: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#64748B',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

