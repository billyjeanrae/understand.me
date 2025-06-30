import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react-native';
import {
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentResult
} from '../types/conflict';
import {
  CONFLICT_ASSESSMENT_QUESTIONNAIRE,
  processAssessment
} from '../services/conflict/assessment';

interface ConflictAssessmentProps {
  conflictId: string;
  onComplete: (result: AssessmentResult) => void;
  onCancel: () => void;
}

export default function ConflictAssessment({
  conflictId,
  onComplete,
  onCancel
}: ConflictAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, AssessmentResponse>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = CONFLICT_ASSESSMENT_QUESTIONNAIRE;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleResponse = (value: string | number | boolean, confidence?: number) => {
    const response: AssessmentResponse = {
      questionId: currentQuestion.id,
      value,
      timestamp: new Date(),
      confidence
    };

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: response
    }));
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const response = responses[currentQuestion.id];
    return response && response.value !== undefined && response.value !== '';
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const responseArray = Object.values(responses);
      const result = await processAssessment(conflictId, responseArray);
      onComplete(result);
    } catch (error) {
      console.error('Assessment submission error:', error);
      Alert.alert('Error', 'Failed to process assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    const response = responses[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'scale':
        return (
          <ScaleQuestion
            question={currentQuestion}
            value={response?.value as number}
            onChange={handleResponse}
          />
        );
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            question={currentQuestion}
            value={response?.value as string}
            onChange={handleResponse}
          />
        );
      case 'text':
        return (
          <TextQuestion
            question={currentQuestion}
            value={response?.value as string}
            onChange={handleResponse}
          />
        );
      case 'boolean':
        return (
          <BooleanQuestion
            question={currentQuestion}
            value={response?.value as boolean}
            onChange={handleResponse}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <ChevronLeft size={24} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>Conflict Assessment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1}</Text>
            {currentQuestion.required && (
              <View style={styles.requiredBadge}>
                <AlertCircle size={12} color="#EF4444" strokeWidth={2} />
                <Text style={styles.requiredText}>Required</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          
          <View style={styles.questionContent}>
            {renderQuestion()}
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Pressable
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={goToPrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft size={20} color={currentQuestionIndex === 0 ? "#64748B" : "#F1F5F9"} strokeWidth={2} />
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </Pressable>

        <Pressable
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={goToNext}
          disabled={!canProceed() || isSubmitting}
        >
          <Text style={[styles.nextButtonText, !canProceed() && styles.nextButtonTextDisabled]}>
            {currentQuestionIndex === questions.length - 1 ? 'Complete Assessment' : 'Next'}
          </Text>
          {currentQuestionIndex < questions.length - 1 && (
            <ChevronRight size={20} color={!canProceed() ? "#64748B" : "#FFFFFF"} strokeWidth={2} />
          )}
          {currentQuestionIndex === questions.length - 1 && (
            <CheckCircle size={20} color={!canProceed() ? "#64748B" : "#FFFFFF"} strokeWidth={2} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

// Scale Question Component
function ScaleQuestion({
  question,
  value,
  onChange
}: {
  question: AssessmentQuestion;
  value?: number;
  onChange: (value: number) => void;
}) {
  const { scaleRange } = question;
  if (!scaleRange) return null;

  const { min, max, labels } = scaleRange;
  const scaleValues = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.scaleContainer}>
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabel}>{labels[0]}</Text>
        <Text style={styles.scaleLabel}>{labels[labels.length - 1]}</Text>
      </View>
      
      <View style={styles.scaleOptions}>
        {scaleValues.map((scaleValue) => (
          <Pressable
            key={scaleValue}
            style={[
              styles.scaleOption,
              value === scaleValue && styles.scaleOptionSelected
            ]}
            onPress={() => onChange(scaleValue)}
          >
            <Text style={[
              styles.scaleOptionText,
              value === scaleValue && styles.scaleOptionTextSelected
            ]}>
              {scaleValue}
            </Text>
          </Pressable>
        ))}
      </View>

      {labels.length > 2 && (
        <View style={styles.scaleDescriptions}>
          {labels.slice(1, -1).map((label, index) => (
            <Text key={index} style={styles.scaleDescription}>
              {min + index + 1}: {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// Multiple Choice Question Component
function MultipleChoiceQuestion({
  question,
  value,
  onChange
}: {
  question: AssessmentQuestion;
  value?: string;
  onChange: (value: string) => void;
}) {
  const { options } = question;
  if (!options) return null;

  return (
    <View style={styles.optionsContainer}>
      {options.map((option, index) => (
        <Pressable
          key={index}
          style={[
            styles.option,
            value === option && styles.optionSelected
          ]}
          onPress={() => onChange(option)}
        >
          <View style={[
            styles.optionRadio,
            value === option && styles.optionRadioSelected
          ]} />
          <Text style={[
            styles.optionText,
            value === option && styles.optionTextSelected
          ]}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// Text Question Component
function TextQuestion({
  question,
  value,
  onChange
}: {
  question: AssessmentQuestion;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.textContainer}>
      <TextInput
        style={styles.textInput}
        value={value || ''}
        onChangeText={onChange}
        placeholder="Type your response here..."
        placeholderTextColor="#64748B"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );
}

// Boolean Question Component
function BooleanQuestion({
  question,
  value,
  onChange
}: {
  question: AssessmentQuestion;
  value?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.booleanContainer}>
      <Pressable
        style={[
          styles.booleanOption,
          value === true && styles.booleanOptionSelected
        ]}
        onPress={() => onChange(true)}
      >
        <View style={[
          styles.booleanRadio,
          value === true && styles.booleanRadioSelected
        ]} />
        <Text style={[
          styles.booleanText,
          value === true && styles.booleanTextSelected
        ]}>
          Yes
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.booleanOption,
          value === false && styles.booleanOptionSelected
        ]}
        onPress={() => onChange(false)}
      >
        <View style={[
          styles.booleanRadio,
          value === false && styles.booleanRadioSelected
        ]} />
        <Text style={[
          styles.booleanText,
          value === false && styles.booleanTextSelected
        ]}>
          No
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  title: {
    color: '#F1F5F9',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionContainer: {
    paddingVertical: 24,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  questionNumber: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  requiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  requiredText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  questionText: {
    color: '#F1F5F9',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 24,
  },
  questionContent: {
    minHeight: 200,
  },
  
  // Scale Question Styles
  scaleContainer: {
    gap: 16,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scaleLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  scaleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scaleOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  scaleOptionText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  scaleOptionTextSelected: {
    color: '#FFFFFF',
  },
  scaleDescriptions: {
    gap: 4,
  },
  scaleDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 16,
  },

  // Multiple Choice Styles
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  optionRadioSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  optionText: {
    color: '#E2E8F0',
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  optionTextSelected: {
    color: '#F1F5F9',
    fontWeight: '500',
  },

  // Text Question Styles
  textContainer: {
    gap: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    color: '#F1F5F9',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Boolean Question Styles
  booleanContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  booleanOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  booleanOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  booleanRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  booleanRadioSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  booleanText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '500',
  },
  booleanTextSelected: {
    color: '#F1F5F9',
  },

  // Navigation Styles
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#F1F5F9',
    fontSize: 16,
  },
  navButtonTextDisabled: {
    color: '#64748B',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  nextButtonDisabled: {
    backgroundColor: '#374151',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#64748B',
  },
});

