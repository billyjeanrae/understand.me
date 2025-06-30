import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { MessageCircle, Users, Clock, ArrowRight } from 'lucide-react-native';

import { ResponsiveLayout } from '../../../components/layout/ResponsiveLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { Spacing } from '../../../constants/Spacing';

export default function DescribeConflictScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState('2');
  const [sessionType, setSessionType] = useState<'solo' | 'guided' | 'group'>('solo');
  
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const validateForm = () => {
    let hasErrors = false;
    
    if (!title.trim()) {
      setTitleError('Please provide a title for this session');
      hasErrors = true;
    } else {
      setTitleError('');
    }
    
    if (!description.trim()) {
      setDescriptionError('Please describe the situation you\'d like to work on');
      hasErrors = true;
    } else if (description.trim().length < 20) {
      setDescriptionError('Please provide more details (at least 20 characters)');
      hasErrors = true;
    } else {
      setDescriptionError('');
    }
    
    return !hasErrors;
  };

  const handleStartSession = () => {
    if (validateForm()) {
      // TODO: Save session data to store
      router.push('/(main)/session/live');
    }
  };

  const sessionTypes = [
    {
      id: 'solo',
      title: 'Solo Practice',
      description: 'Work through the conflict with AI guidance',
      icon: MessageCircle,
      color: Colors.primary[500],
    },
    {
      id: 'guided',
      title: 'Guided Session',
      description: 'AI facilitates a conversation with others',
      icon: Users,
      color: Colors.secondary[500],
    },
    {
      id: 'group',
      title: 'Group Session',
      description: 'Multiple participants with AI moderation',
      icon: Clock,
      color: Colors.emotion.positive,
    },
  ];

  return (
    <ResponsiveLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Describe Your Situation</Text>
          <Text style={styles.subtitle}>
            Help us understand the conflict so we can provide the best guidance
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.form}>
            <Input
              label="Session Title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Family dinner disagreement"
              error={titleError}
              required
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Describe the situation <Text style={styles.required}>*</Text>
              </Text>
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder="Tell us what happened, who was involved, and what the main points of disagreement are..."
                multiline
                numberOfLines={4}
                style={styles.textArea}
                error={descriptionError}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of participants</Text>
              <Input
                value={participants}
                onChangeText={setParticipants}
                placeholder="2"
                keyboardType="numeric"
                hint="Including yourself"
              />
            </View>
          </View>
        </Card>

        <View style={styles.sessionTypeSection}>
          <Text style={styles.sectionTitle}>Choose Session Type</Text>
          <View style={styles.sessionTypes}>
            {sessionTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = sessionType === type.id;
              
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.sessionTypeCard,
                    isSelected && styles.sessionTypeCardSelected
                  ]}
                  onPress={() => setSessionType(type.id as any)}
                >
                  <View style={[
                    styles.sessionTypeIcon,
                    { backgroundColor: isSelected ? type.color : Colors.background.tertiary }
                  ]}>
                    <IconComponent 
                      size={24} 
                      color={isSelected ? Colors.text.inverse : type.color} 
                    />
                  </View>
                  <Text style={[
                    styles.sessionTypeTitle,
                    isSelected && styles.sessionTypeTextSelected
                  ]}>
                    {type.title}
                  </Text>
                  <Text style={[
                    styles.sessionTypeDescription,
                    isSelected && styles.sessionTypeTextSelected
                  ]}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Card style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Session Preview</Text>
          </View>
          <View style={styles.previewContent}>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Title:</Text>
              <Text style={styles.previewValue}>
                {title || 'Untitled Session'}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Type:</Text>
              <Text style={styles.previewValue}>
                {sessionTypes.find(t => t.id === sessionType)?.title}
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewLabel}>Participants:</Text>
              <Text style={styles.previewValue}>{participants}</Text>
            </View>
          </View>
        </Card>

        <Button
          title="Start Session"
          onPress={handleStartSession}
          size="large"
          fullWidth
          style={styles.startButton}
        />
      </ScrollView>
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  
  title: {
    ...Typography.styles.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  subtitle: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  
  formCard: {
    marginBottom: Spacing.xl,
  },
  
  form: {
    gap: Spacing.lg,
  },
  
  inputGroup: {
    gap: Spacing.sm,
  },
  
  label: {
    ...Typography.styles.label,
    color: Colors.text.primary,
  },
  
  required: {
    color: Colors.error,
  },
  
  textArea: {
    minHeight: 100,
  },
  
  sessionTypeSection: {
    marginBottom: Spacing.xl,
  },
  
  sectionTitle: {
    ...Typography.styles.h5,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  
  sessionTypes: {
    gap: Spacing.md,
  },
  
  sessionTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  
  sessionTypeCardSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  
  sessionTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  
  sessionTypeTitle: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 1,
    marginBottom: Spacing.xs,
  },
  
  sessionTypeDescription: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    flex: 2,
  },
  
  sessionTypeTextSelected: {
    color: Colors.primary[700],
  },
  
  previewCard: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.background.tertiary,
  },
  
  previewHeader: {
    marginBottom: Spacing.md,
  },
  
  previewTitle: {
    ...Typography.styles.h6,
    color: Colors.text.primary,
  },
  
  previewContent: {
    gap: Spacing.sm,
  },
  
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  previewLabel: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    flex: 1,
  },
  
  previewValue: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  
  startButton: {
    marginBottom: Spacing.xl,
  },
});
