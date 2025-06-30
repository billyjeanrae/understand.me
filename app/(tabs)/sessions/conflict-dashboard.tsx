import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import ConflictCreationModal from './conflict-creation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useResponsive } from '../../../utils/platform';
import { ResponsiveContainer } from '../../../components/layout/ResponsiveContainer';
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
  ArrowLeft
} from 'lucide-react-native';

// Import types and services from the original screen
interface Conflict {
  id: string;
  title: string;
  description: string;
  category: 'romantic' | 'family' | 'workplace' | 'friendship' | 'other';
  intensity: 'low' | 'medium' | 'high';
  status: 'active' | 'in_mediation' | 'resolved' | 'paused';
  participants: Array<{
    id: string;
    name: string;
    relationship: string;
  }>;
  issues: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    tags: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
  progressNotes: string[];
  tags: string[];
  isPrivate: boolean;
}

interface ConflictMetrics {
  totalConflicts: number;
  activeConflicts: number;
  resolvedConflicts: number;
  averageResolutionTime: number;
  successRate: number;
}

export default function ConflictDashboardScreen() {
  const { spacing, fontSize } = useResponsive();
  const router = useRouter();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [metrics, setMetrics] = useState<ConflictMetrics | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'in_mediation' | 'resolved' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
            description: 'Disagreement about realistic timelines',
            category: 'work',
            priority: 'high',
            tags: ['deadlines', 'workload']
          }
        ],
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        progressNotes: ['Started mediation process', 'Identified key issues'],
        tags: ['workplace', 'deadlines'],
        isPrivate: false
      }
    ];

    setConflicts(mockConflicts);
  };

  const loadMetrics = () => {
    const mockMetrics: ConflictMetrics = {
      totalConflicts: 8,
      activeConflicts: 2,
      resolvedConflicts: 5,
      averageResolutionTime: 12, // days
      successRate: 85 // percentage
    };

    setMetrics(mockMetrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#F59E0B';
      case 'in_mediation': return '#3B82F6';
      case 'resolved': return '#10B981';
      case 'paused': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const filteredConflicts = conflicts.filter(conflict => {
    const matchesFilter = filterStatus === 'all' || conflict.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      conflict.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conflict.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateConflict = () => {
    setShowCreateModal(true);
  };

  const handleConflictCreated = (newConflict: Conflict) => {
    setConflicts(prev => [newConflict, ...prev]);
    // Update metrics
    loadMetrics();
  };

  const handleConflictPress = (conflict: Conflict) => {
    if (conflict.participants.length > 2) {
      // Navigate to group conflict screen
      router.push('/(tabs)/sessions/group-conflict');
    } else {
      // Navigate to individual conflict session
      Alert.alert('Individual Conflict', `This would open conflict: ${conflict.title}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer style={styles.content}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing(24) }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={[styles.title, { fontSize: fontSize(24) }]}>
              Conflict Dashboard
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateConflict}
            >
              <Plus size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Metrics Cards */}
          {metrics && (
            <View style={[styles.metricsContainer, { marginBottom: spacing(24) }]}>
              <View style={[styles.metricCard, { padding: spacing(16) }]}>
                <TrendingUp size={24} color="#10B981" strokeWidth={2} />
                <Text style={[styles.metricValue, { fontSize: fontSize(20) }]}>
                  {metrics.successRate}%
                </Text>
                <Text style={[styles.metricLabel, { fontSize: fontSize(12) }]}>
                  Success Rate
                </Text>
              </View>
              
              <View style={[styles.metricCard, { padding: spacing(16) }]}>
                <Clock size={24} color="#3B82F6" strokeWidth={2} />
                <Text style={[styles.metricValue, { fontSize: fontSize(20) }]}>
                  {metrics.averageResolutionTime}d
                </Text>
                <Text style={[styles.metricLabel, { fontSize: fontSize(12) }]}>
                  Avg Resolution
                </Text>
              </View>
              
              <View style={[styles.metricCard, { padding: spacing(16) }]}>
                <CheckCircle size={24} color="#10B981" strokeWidth={2} />
                <Text style={[styles.metricValue, { fontSize: fontSize(20) }]}>
                  {metrics.resolvedConflicts}
                </Text>
                <Text style={[styles.metricLabel, { fontSize: fontSize(12) }]}>
                  Resolved
                </Text>
              </View>
            </View>
          )}

          {/* Filter Buttons */}
          <View style={[styles.filterContainer, { marginBottom: spacing(24) }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['all', 'active', 'in_mediation', 'resolved', 'paused'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    { 
                      paddingHorizontal: spacing(16),
                      paddingVertical: spacing(8),
                      marginRight: spacing(8),
                      backgroundColor: filterStatus === status ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)',
                    }
                  ]}
                  onPress={() => setFilterStatus(status as any)}
                >
                  <Text style={[
                    styles.filterText,
                    { 
                      fontSize: fontSize(14),
                      color: filterStatus === status ? '#FFFFFF' : '#9CA3AF',
                    }
                  ]}>
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Conflicts List */}
          <View style={styles.conflictsList}>
            {filteredConflicts.length === 0 ? (
              <View style={[styles.emptyState, { padding: spacing(32) }]}>
                <MessageCircle size={48} color="#6B7280" strokeWidth={1} />
                <Text style={[styles.emptyText, { fontSize: fontSize(16) }]}>
                  No conflicts found
                </Text>
                <Text style={[styles.emptySubtext, { fontSize: fontSize(14) }]}>
                  {filterStatus === 'all' 
                    ? 'Start by creating your first conflict to track'
                    : `No ${filterStatus.replace('_', ' ')} conflicts at the moment`
                  }
                </Text>
              </View>
            ) : (
              filteredConflicts.map((conflict) => (
                <TouchableOpacity
                  key={conflict.id}
                  style={[styles.conflictCard, { padding: spacing(16), marginBottom: spacing(16) }]}
                  onPress={() => handleConflictPress(conflict)}
                >
                  <View style={styles.conflictHeader}>
                    <View style={styles.conflictTitleRow}>
                      <Text style={[styles.conflictTitle, { fontSize: fontSize(16) }]}>
                        {conflict.title}
                      </Text>
                      <View style={styles.conflictBadges}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(conflict.status) }]}>
                          <Text style={[styles.badgeText, { fontSize: fontSize(10) }]}>
                            {conflict.status.replace('_', ' ')}
                          </Text>
                        </View>
                        <View style={[styles.intensityBadge, { backgroundColor: getIntensityColor(conflict.intensity) }]}>
                          <Text style={[styles.badgeText, { fontSize: fontSize(10) }]}>
                            {conflict.intensity}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <Text style={[styles.conflictDescription, { fontSize: fontSize(14) }]}>
                      {conflict.description}
                    </Text>
                  </View>

                  <View style={styles.conflictFooter}>
                    <View style={styles.participantsInfo}>
                      <Users size={16} color="#9CA3AF" strokeWidth={2} />
                      <Text style={[styles.participantsText, { fontSize: fontSize(12) }]}>
                        {conflict.participants.length} participants
                      </Text>
                    </View>
                    
                    <Text style={[styles.updatedText, { fontSize: fontSize(12) }]}>
                      Updated {Math.floor((Date.now() - conflict.updatedAt.getTime()) / (1000 * 60 * 60 * 24))}d ago
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ResponsiveContainer>
      </ScrollView>

      <ConflictCreationModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConflictCreated={handleConflictCreated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  metricValue: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  metricLabel: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterText: {
    fontFamily: 'Inter-Medium',
  },
  conflictsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  conflictCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  conflictHeader: {
    marginBottom: 12,
  },
  conflictTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  conflictTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  conflictBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
  },
  conflictDescription: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  conflictFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  updatedText: {
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
});
