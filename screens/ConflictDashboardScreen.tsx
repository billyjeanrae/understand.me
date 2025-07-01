import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Brain,
  Settings
} from 'lucide-react-native';
import {
  Conflict,
  ConflictStatus,
  ConflictCategory,
  ConflictMetrics,
  AssessmentResult
} from '../types/conflict';
import ConflictAssessment from '../components/ConflictAssessment';
import MediationWorkflow from '../components/MediationWorkflow';
import { selectWorkflowTemplate } from '../services/conflict/mediation';

interface ConflictDashboardScreenProps {
  onNavigateToChat?: () => void;
  onNavigateToVoice?: () => void;
}

export default function ConflictDashboardScreen({
  onNavigateToChat,
  onNavigateToVoice
}: ConflictDashboardScreenProps) {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [metrics, setMetrics] = useState<ConflictMetrics | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showMediation, setShowMediation] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ConflictStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app, this would come from a service
  useEffect(() => {
    loadConflicts();
    loadMetrics();
  }, []);

  const loadConflicts = () => {
    // Mock conflicts data
    const mockConflicts: Conflict[] = [
      {
        id: 'conflict_1',
        title: 'Communication Issues with Partner',
        description: 'We\'ve been having trouble communicating effectively about household responsibilities.',
        category: 'romantic',
        intensity: 'medium',
        status: 'active',
        participants: [
          { id: 'user', name: 'You', relationship: 'self' },
          { id: 'partner', name: 'Alex', relationship: 'romantic partner' }
        ],
        issues: [
          {
            id: 'issue_1',
            title: 'Household chores distribution',
            description: 'Disagreement about who does what around the house',
            category: 'responsibilities',
            priority: 'high',
            tags: ['chores', 'fairness']
          }
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        progressNotes: [],
        tags: ['communication', 'household'],
        isPrivate: true
      },
      {
        id: 'conflict_2',
        title: 'Workplace Team Dynamics',
        description: 'Tension with a colleague over project responsibilities and deadlines.',
        category: 'workplace',
        intensity: 'high',
        status: 'in_mediation',
        participants: [
          { id: 'user', name: 'You', relationship: 'self' },
          { id: 'colleague', name: 'Jordan', relationship: 'colleague' }
        ],
        issues: [
          {
            id: 'issue_2',
            title: 'Project deadline conflicts',
            description: 'Disagreement about realistic timelines and workload distribution',
            category: 'work_responsibilities',
            priority: 'high',
            tags: ['deadlines', 'workload']
          }
        ],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        currentPhase: 'exploration',
        mediationStarted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        progressNotes: [],
        tags: ['workplace', 'deadlines'],
        isPrivate: false
      }
    ];
    setConflicts(mockConflicts);
  };

  const loadMetrics = () => {
    // Mock metrics data
    const mockMetrics: ConflictMetrics = {
      totalConflicts: 5,
      resolvedConflicts: 3,
      resolutionRate: 60,
      averageResolutionTime: 12,
      relationshipHealthScore: 75,
      communicationImprovement: 25,
      trustLevel: 7,
      satisfactionLevel: 8,
      conflictResolutionSkills: 6,
      emotionalRegulation: 7,
      activeListening: 8,
      empathy: 7,
      preferredMediationPhases: ['exploration', 'option_generation'],
      mostUsedTemplates: ['constructive_feedback', 'boundary_setting'],
      commonConflictTypes: ['romantic', 'workplace'],
      peakUsageTimes: ['evening', 'weekend'],
      emotionalTrends: [],
      aiSuggestionAcceptanceRate: 78,
      templateEffectiveness: {},
      interventionSuccess: {}
    };
    setMetrics(mockMetrics);
  };

  const createNewConflict = () => {
    Alert.alert(
      'New Conflict',
      'How would you like to start?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Assessment', onPress: () => setShowAssessment(true) },
        { text: 'Start with Chat', onPress: onNavigateToChat },
        { text: 'Voice Session', onPress: onNavigateToVoice }
      ]
    );
  };

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setShowAssessment(false);
    // Create new conflict from assessment
    const newConflict: Conflict = {
      id: `conflict_${Date.now()}`,
      title: 'New Conflict',
      description: 'Conflict identified through assessment',
      category: 'other',
      intensity: 'medium',
      status: 'active',
      participants: [{ id: 'user', name: 'You', relationship: 'self' }],
      issues: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      assessment: {
        id: result.id,
        conflictId: `conflict_${Date.now()}`,
        completedAt: result.completedAt,
        scores: {
          intensity: result.scores.conflictIntensity,
          complexity: result.scores.communicationQuality,
          emotionalImpact: result.scores.emotionalImpact,
          relationshipThreat: result.scores.relationshipHealth,
        },
        conflictStyle: 'collaborating',
        readinessForMediation: result.scores.resolutionReadiness,
        recommendedApproach: result.suggestedApproaches,
        notes: 'Assessment completed'
      },
      progressNotes: [],
      tags: [],
      isPrivate: true
    };
    setConflicts(prev => [newConflict, ...prev]);
    setSelectedConflict(newConflict);
  };

  const startMediation = (conflict: Conflict) => {
    setSelectedConflict(conflict);
    setShowMediation(true);
  };

  const filteredConflicts = conflicts.filter(conflict => {
    const matchesStatus = filterStatus === 'all' || conflict.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      conflict.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conflict.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (showAssessment) {
    return (
      <ConflictAssessment
        conflictId="new_conflict"
        onComplete={handleAssessmentComplete}
        onCancel={() => setShowAssessment(false)}
      />
    );
  }

  if (showMediation && selectedConflict) {
    const workflowTemplate = selectWorkflowTemplate(selectedConflict);
    return (
      <MediationWorkflow
        conflict={selectedConflict}
        workflowTemplate={workflowTemplate}
        onSessionComplete={(session) => {
          setShowMediation(false);
          setSelectedConflict(null);
          // Update conflict status
          const updatedConflicts = conflicts.map(c => 
            c.id === selectedConflict.id 
              ? { ...c, status: 'resolved' as ConflictStatus }
              : c
          );
          setConflicts(updatedConflicts);
        }}
        onSessionPause={(session) => {
          setShowMediation(false);
          setSelectedConflict(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Conflict Resolution</Text>
          <Text style={styles.subtitle}>Manage and resolve your conflicts</Text>
        </View>
        <Pressable style={styles.settingsButton}>
          <Settings size={24} color="#94A3B8" strokeWidth={2} />
        </Pressable>
      </View>

      {/* Metrics Overview */}
      {metrics && (
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              icon={TrendingUp}
              title="Resolution Rate"
              value={`${metrics.resolutionRate}%`}
              subtitle={`${metrics.resolvedConflicts}/${metrics.totalConflicts} resolved`}
              color="#10B981"
            />
            <MetricCard
              icon={Clock}
              title="Avg. Resolution"
              value={`${metrics.averageResolutionTime} days`}
              subtitle="Time to resolution"
              color="#3B82F6"
            />
            <MetricCard
              icon={Users}
              title="Relationship Health"
              value={`${metrics.relationshipHealthScore}/100`}
              subtitle="Overall health score"
              color="#8B5CF6"
            />
            <MetricCard
              icon={Brain}
              title="AI Acceptance"
              value={`${metrics.aiSuggestionAcceptanceRate}%`}
              subtitle="AI suggestions used"
              color="#F59E0B"
            />
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionCard
            icon={Plus}
            title="New Conflict"
            subtitle="Start assessment"
            onPress={createNewConflict}
            color="#10B981"
          />
          <QuickActionCard
            icon={MessageCircle}
            title="Chat with Udine"
            subtitle="Get immediate help"
            onPress={onNavigateToChat}
            color="#3B82F6"
          />
          <QuickActionCard
            icon={Brain}
            title="Voice Session"
            subtitle="Speak with AI"
            onPress={onNavigateToVoice}
            color="#8B5CF6"
          />
        </View>
      </View>

      {/* Conflicts List */}
      <View style={styles.conflictsSection}>
        <View style={styles.conflictsHeader}>
          <Text style={styles.sectionTitle}>Active Conflicts</Text>
          <View style={styles.conflictsControls}>
            <Pressable style={styles.filterButton}>
              <Filter size={16} color="#94A3B8" strokeWidth={2} />
            </Pressable>
            <Pressable style={styles.searchButton}>
              <Search size={16} color="#94A3B8" strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.conflictsList} showsVerticalScrollIndicator={false}>
          {filteredConflicts.map((conflict) => (
            <ConflictCard
              key={conflict.id}
              conflict={conflict}
              onPress={() => setSelectedConflict(conflict)}
              onStartMediation={() => startMediation(conflict)}
            />
          ))}
          
          {filteredConflicts.length === 0 && (
            <View style={styles.emptyState}>
              <CheckCircle size={48} color="#94A3B8" strokeWidth={1} />
              <Text style={styles.emptyStateTitle}>No conflicts found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {filterStatus === 'all' 
                  ? 'Create a new conflict to get started'
                  : `No conflicts with status: ${filterStatus}`
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Metric Card Component
function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color
}: {
  icon: any;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Icon size={20} color={color} strokeWidth={2} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );
}

// Quick Action Card Component
function QuickActionCard({
  icon: Icon,
  title,
  subtitle,
  onPress,
  color
}: {
  icon: any;
  title: string;
  subtitle: string;
  onPress?: () => void;
  color: string;
}) {
  return (
    <Pressable style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={24} color={color} strokeWidth={2} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

// Conflict Card Component
function ConflictCard({
  conflict,
  onPress,
  onStartMediation
}: {
  conflict: Conflict;
  onPress: () => void;
  onStartMediation: () => void;
}) {
  const getStatusColor = (status: ConflictStatus) => {
    switch (status) {
      case 'active': return '#F59E0B';
      case 'in_mediation': return '#3B82F6';
      case 'resolved': return '#10B981';
      case 'paused': return '#94A3B8';
      case 'escalated': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'severe': return '#DC2626';
      default: return '#94A3B8';
    }
  };

  return (
    <Pressable style={styles.conflictCard} onPress={onPress}>
      <View style={styles.conflictHeader}>
        <View style={styles.conflictInfo}>
          <Text style={styles.conflictTitle}>{conflict.title}</Text>
          <Text style={styles.conflictDescription} numberOfLines={2}>
            {conflict.description}
          </Text>
        </View>
        <View style={styles.conflictBadges}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(conflict.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(conflict.status) }]}>
              {conflict.status.replace('_', ' ')}
            </Text>
          </View>
          <View style={[styles.intensityBadge, { backgroundColor: `${getIntensityColor(conflict.intensity)}20` }]}>
            <Text style={[styles.intensityText, { color: getIntensityColor(conflict.intensity) }]}>
              {conflict.intensity}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.conflictMeta}>
        <View style={styles.conflictMetaItem}>
          <Users size={14} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.conflictMetaText}>
            {conflict.participants.length} participant{conflict.participants.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.conflictMetaItem}>
          <Clock size={14} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.conflictMetaText}>
            {Math.ceil((Date.now() - conflict.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days ago
          </Text>
        </View>
      </View>

      {conflict.status === 'active' && (
        <View style={styles.conflictActions}>
          <Pressable 
            style={styles.mediationButton} 
            onPress={(e) => {
              e.stopPropagation();
              onStartMediation();
            }}
          >
            <Text style={styles.mediationButtonText}>Start Mediation</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
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
  headerLeft: {
    flex: 1,
  },
  title: {
    color: '#F1F5F9',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
  },
  settingsButton: {
    padding: 8,
  },
  sectionTitle: {
    color: '#F1F5F9',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricsSection: {
    padding: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricSubtitle: {
    color: '#64748B',
    fontSize: 11,
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  conflictsSection: {
    flex: 1,
    paddingHorizontal: 24,
  },
  conflictsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  conflictsControls: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  searchButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  conflictsList: {
    flex: 1,
  },
  conflictCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  conflictInfo: {
    flex: 1,
    marginRight: 12,
  },
  conflictTitle: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conflictDescription: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
  },
  conflictBadges: {
    gap: 4,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  intensityBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  intensityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  conflictMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  conflictMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conflictMetaText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  conflictActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  mediationButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mediationButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
