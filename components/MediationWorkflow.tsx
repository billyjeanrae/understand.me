import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Users, 
  MessageCircle,
  Brain,
  ArrowRight,
  AlertTriangle
} from 'lucide-react-native';
import {
  MediationSession,
  WorkflowStep,
  WorkflowTemplate,
  MediationActivity,
  Conflict
} from '../types/conflict';
import {
  createMediationSession,
  generateMediationSuggestions,
  createMediationActivities,
  trackEmotionalJourney,
  createAIIntervention,
  calculateSessionProgress
} from '../services/conflict/mediation';
import { EmotionAnalysis } from '../services/ai/emotion';

interface MediationWorkflowProps {
  conflict: Conflict;
  workflowTemplate: WorkflowTemplate;
  emotionalContext?: EmotionAnalysis;
  onSessionComplete: (session: MediationSession) => void;
  onSessionPause: (session: MediationSession) => void;
  onEmotionUpdate?: (analysis: EmotionAnalysis) => void;
}

export default function MediationWorkflow({
  conflict,
  workflowTemplate,
  emotionalContext,
  onSessionComplete,
  onSessionPause,
  onEmotionUpdate
}: MediationWorkflowProps) {
  const [currentSession, setCurrentSession] = useState<MediationSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

  const currentStep = workflowTemplate.steps[currentStepIndex];
  const progress = currentSession ? calculateSessionProgress(currentSession) : 0;

  useEffect(() => {
    if (emotionalContext && currentSession) {
      trackEmotionalJourney(currentSession, 'user', emotionalContext);
      
      // Check if AI intervention is needed
      if (emotionalContext.primaryEmotion.intensity > 0.8) {
        createAIIntervention(currentSession, emotionalContext, 'High emotional intensity detected');
      }
    }
  }, [emotionalContext, currentSession]);

  const startSession = () => {
    const session = createMediationSession(
      conflict.id,
      workflowTemplate,
      currentStep.phase
    );
    
    // Add activities for current step
    session.activities = createMediationActivities(currentStep);
    
    // Generate AI suggestions
    session.aiSuggestions = generateMediationSuggestions(
      session,
      currentStep,
      emotionalContext
    );

    setCurrentSession(session);
    setIsSessionActive(true);
  };

  const pauseSession = () => {
    if (currentSession) {
      currentSession.endTime = new Date();
      currentSession.duration = Math.round(
        (currentSession.endTime.getTime() - currentSession.startTime.getTime()) / 60000
      );
      setIsSessionActive(false);
      onSessionPause(currentSession);
    }
  };

  const completeActivity = (activityId: string, effectiveness?: number, notes?: string) => {
    if (!currentSession) return;

    const activity = currentSession.activities.find(a => a.id === activityId);
    if (activity) {
      activity.completed = true;
      activity.effectiveness = effectiveness;
      activity.notes = notes;
      
      setCompletedActivities(prev => new Set([...prev, activityId]));
      
      // Update session progress
      currentSession.progress = calculateSessionProgress(currentSession);
      setCurrentSession({ ...currentSession });
    }
  };

  const moveToNextStep = () => {
    if (currentStepIndex < workflowTemplate.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setCompletedActivities(new Set());
      
      if (currentSession) {
        // Update session for new step
        const nextStep = workflowTemplate.steps[currentStepIndex + 1];
        currentSession.phase = nextStep.phase;
        currentSession.activities = createMediationActivities(nextStep);
        currentSession.aiSuggestions = generateMediationSuggestions(
          currentSession,
          nextStep,
          emotionalContext
        );
        setCurrentSession({ ...currentSession });
      }
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    if (currentSession) {
      currentSession.endTime = new Date();
      currentSession.duration = Math.round(
        (currentSession.endTime.getTime() - currentSession.startTime.getTime()) / 60000
      );
      currentSession.progress = 100;
      setIsSessionActive(false);
      onSessionComplete(currentSession);
    }
  };

  const canProceedToNext = () => {
    if (!currentSession) return false;
    const requiredActivities = currentSession.activities.filter(a => a.type !== 'brainstorming');
    const completedRequired = requiredActivities.filter(a => completedActivities.has(a.id));
    return completedRequired.length >= Math.ceil(requiredActivities.length * 0.7); // 70% completion
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.workflowTitle}>{workflowTemplate.name}</Text>
          <Text style={styles.workflowDescription}>{workflowTemplate.description}</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.stat}>
            <Clock size={16} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.statText}>{workflowTemplate.estimatedTotalDuration}min</Text>
          </View>
          <View style={styles.stat}>
            <Users size={16} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.statText}>{conflict.participants.length} people</Text>
          </View>
        </View>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Session Progress</Text>
          <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.stepIndicators}>
          {workflowTemplate.steps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.stepIndicator,
                index === currentStepIndex && styles.stepIndicatorActive,
                index < currentStepIndex && styles.stepIndicatorCompleted
              ]}
            >
              <Text style={[
                styles.stepIndicatorText,
                index === currentStepIndex && styles.stepIndicatorTextActive,
                index < currentStepIndex && styles.stepIndicatorTextCompleted
              ]}>
                {index + 1}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Step */}
        <View style={styles.currentStepSection}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{currentStep.phase}</Text>
            </View>
          </View>
          <Text style={styles.stepDescription}>{currentStep.description}</Text>
          
          {/* Step Objectives */}
          <View style={styles.objectivesSection}>
            <Text style={styles.sectionTitle}>Objectives</Text>
            {currentStep.objectives.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <CheckCircle size={16} color="#10B981" strokeWidth={2} />
                <Text style={styles.objectiveText}>{objective}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Suggestions */}
        {currentSession && currentSession.aiSuggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <View style={styles.sectionHeader}>
              <Brain size={20} color="#3B82F6" strokeWidth={2} />
              <Text style={styles.sectionTitle}>AI Guidance</Text>
            </View>
            {currentSession.aiSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Activities */}
        {currentSession && (
          <View style={styles.activitiesSection}>
            <Text style={styles.sectionTitle}>Activities</Text>
            {currentSession.activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isCompleted={completedActivities.has(activity.id)}
                onComplete={(effectiveness, notes) => 
                  completeActivity(activity.id, effectiveness, notes)
                }
              />
            ))}
          </View>
        )}

        {/* Emotional Check-in */}
        {emotionalContext && (
          <View style={styles.emotionSection}>
            <Text style={styles.sectionTitle}>Emotional Check-in</Text>
            <View style={styles.emotionCard}>
              <View style={styles.emotionHeader}>
                <Text style={styles.emotionPrimary}>
                  Feeling: {emotionalContext.primaryEmotion.emotion}
                </Text>
                <Text style={styles.emotionIntensity}>
                  Intensity: {Math.round(emotionalContext.primaryEmotion.intensity * 100)}%
                </Text>
              </View>
              {emotionalContext.recommendations.length > 0 && (
                <View style={styles.emotionRecommendations}>
                  <Text style={styles.emotionRecommendationsTitle}>Recommendations:</Text>
                  {emotionalContext.recommendations.slice(0, 2).map((rec, index) => (
                    <Text key={index} style={styles.emotionRecommendation}>• {rec}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Session Controls */}
      <View style={styles.controls}>
        {!isSessionActive ? (
          <Pressable style={styles.startButton} onPress={startSession}>
            <Play size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.startButtonText}>Start Session</Text>
          </Pressable>
        ) : (
          <View style={styles.activeControls}>
            <Pressable style={styles.pauseButton} onPress={pauseSession}>
              <Pause size={20} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.pauseButtonText}>Pause</Text>
            </Pressable>
            
            <Pressable
              style={[styles.nextButton, !canProceedToNext() && styles.nextButtonDisabled]}
              onPress={moveToNextStep}
              disabled={!canProceedToNext()}
            >
              <Text style={[
                styles.nextButtonText,
                !canProceedToNext() && styles.nextButtonTextDisabled
              ]}>
                {currentStepIndex === workflowTemplate.steps.length - 1 ? 'Complete' : 'Next Step'}
              </Text>
              <ArrowRight size={20} color={!canProceedToNext() ? "#64748B" : "#FFFFFF"} strokeWidth={2} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

// Activity Card Component
function ActivityCard({
  activity,
  isCompleted,
  onComplete
}: {
  activity: MediationActivity;
  isCompleted: boolean;
  onComplete: (effectiveness?: number, notes?: string) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [effectiveness, setEffectiveness] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');

  const handleComplete = () => {
    Alert.alert(
      'Complete Activity',
      'How effective was this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: () => onComplete(effectiveness, notes)
        }
      ]
    );
  };

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'story_sharing': return MessageCircle;
      case 'active_listening': return Users;
      case 'brainstorming': return Brain;
      default: return CheckCircle;
    }
  };

  const ActivityIcon = getActivityIcon();

  return (
    <View style={[styles.activityCard, isCompleted && styles.activityCardCompleted]}>
      <Pressable
        style={styles.activityHeader}
        onPress={() => setShowDetails(!showDetails)}
      >
        <View style={styles.activityInfo}>
          <ActivityIcon 
            size={20} 
            color={isCompleted ? "#10B981" : "#3B82F6"} 
            strokeWidth={2} 
          />
          <View style={styles.activityTitleContainer}>
            <Text style={[styles.activityTitle, isCompleted && styles.activityTitleCompleted]}>
              {activity.title}
            </Text>
            <Text style={styles.activityDuration}>{activity.duration} minutes</Text>
          </View>
        </View>
        {isCompleted && (
          <CheckCircle size={24} color="#10B981" strokeWidth={2} />
        )}
      </Pressable>

      {showDetails && (
        <View style={styles.activityDetails}>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          
          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>Instructions:</Text>
            {activity.instructions.map((instruction, index) => (
              <Text key={index} style={styles.instructionItem}>
                {index + 1}. {instruction}
              </Text>
            ))}
          </View>

          {!isCompleted && (
            <Pressable style={styles.completeActivityButton} onPress={handleComplete}>
              <CheckCircle size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.completeActivityButtonText}>Mark Complete</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerInfo: {
    marginBottom: 12,
  },
  workflowTitle: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workflowDescription: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  progressSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorActive: {
    backgroundColor: '#3B82F6',
  },
  stepIndicatorCompleted: {
    backgroundColor: '#10B981',
  },
  stepIndicatorText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  stepIndicatorTextActive: {
    color: '#FFFFFF',
  },
  stepIndicatorTextCompleted: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  currentStepSection: {
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepTitle: {
    color: '#F1F5F9',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  stepBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepBadgeText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  stepDescription: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  objectivesSection: {
    gap: 8,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  objectiveText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  suggestionsSection: {
    marginBottom: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  suggestionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  suggestionText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  activitiesSection: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityCardCompleted: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityTitleContainer: {
    flex: 1,
  },
  activityTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTitleCompleted: {
    color: '#10B981',
  },
  activityDuration: {
    color: '#94A3B8',
    fontSize: 12,
  },
  activityDetails: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityDescription: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  instructionsSection: {
    marginBottom: 16,
  },
  instructionsTitle: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionItem: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  completeActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  completeActivityButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emotionSection: {
    marginBottom: 24,
  },
  emotionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emotionPrimary: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '500',
  },
  emotionIntensity: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  emotionRecommendations: {
    gap: 4,
  },
  emotionRecommendationsTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  emotionRecommendation: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
  },
  controls: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pauseButtonText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
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

