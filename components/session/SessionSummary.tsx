/**
 * Session Summary Component
 * Displays comprehensive summaries of conflict resolution sessions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  MessageCircle,
  Heart,
  Brain,
  Target,
  CheckCircle,
  TrendingUp,
  Download,
  Share2,
  Star,
  ArrowRight
} from 'lucide-react-native';

import { SessionSummary as SessionSummaryType, SessionPhase, EmotionalInsight } from '../../services/analytics/sessionSummaryService';

interface SessionSummaryProps {
  summary: SessionSummaryType;
  onExport?: (format: 'json' | 'text' | 'pdf') => void;
  onClose?: () => void;
  compact?: boolean;
}

const PHASE_ICONS = {
  introduction: MessageCircle,
  exploration: Brain,
  understanding: Heart,
  resolution: Target,
  agreement: CheckCircle
};

const PHASE_COLORS = {
  introduction: '#3B82F6',
  exploration: '#8B5CF6',
  understanding: '#EC4899',
  resolution: '#10B981',
  agreement: '#F59E0B'
};

export default function SessionSummary({ 
  summary, 
  onExport, 
  onClose, 
  compact = false 
}: SessionSummaryProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'emotions' | 'insights'>('overview');

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#64748B';
    }
  };

  const handleShare = async () => {
    try {
      const textSummary = `
Conflict Resolution Session Summary

Duration: ${formatDuration(summary.duration)}
Messages: ${summary.totalMessages}
Resolved: ${summary.conflictResolved ? 'Yes' : 'In Progress'}

Key Insights:
${summary.keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

Next Steps:
${summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
      `.trim();

      await Share.share({
        message: textSummary,
        title: 'Session Summary'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share summary');
    }
  };

  const handleExport = (format: 'json' | 'text' | 'pdf') => {
    if (onExport) {
      onExport(format);
    } else {
      Alert.alert('Export', `Exporting as ${format.toUpperCase()}...`);
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <LinearGradient
          colors={['#1E293B', '#334155']}
          style={styles.compactGradient}
        >
          <View style={styles.compactHeader}>
            <View style={styles.compactInfo}>
              <Text style={styles.compactTitle}>Session Complete</Text>
              <Text style={styles.compactMeta}>
                {formatDuration(summary.duration)} • {summary.totalMessages} messages
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: summary.conflictResolved ? '#10B981' : '#F59E0B' }
            ]}>
              <Text style={styles.statusText}>
                {summary.conflictResolved ? 'Resolved' : 'In Progress'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.compactInsight}>
            {summary.keyInsights[0] || 'Session completed successfully'}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Session Summary</Text>
            <Text style={styles.subtitle}>
              {summary.startTime.toLocaleDateString()} • {formatDuration(summary.duration)}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <Pressable style={styles.actionButton} onPress={handleShare}>
              <Share2 size={18} color="#94A3B8" />
            </Pressable>
            <Pressable 
              style={styles.actionButton} 
              onPress={() => handleExport('text')}
            >
              <Download size={18} color="#94A3B8" />
            </Pressable>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MessageCircle size={16} color="#3B82F6" />
            <Text style={styles.statValue}>{summary.totalMessages}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          
          <View style={styles.statItem}>
            <Clock size={16} color="#8B5CF6" />
            <Text style={styles.statValue}>{formatDuration(summary.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          
          <View style={styles.statItem}>
            <Heart size={16} color={getSentimentColor(summary.overallSentiment)} />
            <Text style={[styles.statValue, { color: getSentimentColor(summary.overallSentiment) }]}>
              {summary.overallSentiment}
            </Text>
            <Text style={styles.statLabel}>Sentiment</Text>
          </View>
          
          <View style={styles.statItem}>
            <CheckCircle size={16} color={summary.conflictResolved ? '#10B981' : '#F59E0B'} />
            <Text style={[
              styles.statValue, 
              { color: summary.conflictResolved ? '#10B981' : '#F59E0B' }
            ]}>
              {summary.conflictResolved ? 'Resolved' : 'Progress'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {(['overview', 'phases', 'emotions', 'insights'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' && (
            <View style={styles.section}>
              <SectionHeader title="Key Insights" icon={Brain} />
              {summary.keyInsights.map((insight, index) => (
                <View key={index} style={styles.listItem}>
                  <View style={styles.listBullet} />
                  <Text style={styles.listText}>{insight}</Text>
                </View>
              ))}

              <SectionHeader title="Resolution Outcomes" icon={Target} />
              {summary.resolutionOutcomes.map((outcome, index) => (
                <View key={index} style={styles.listItem}>
                  <CheckCircle size={14} color="#10B981" />
                  <Text style={styles.listText}>{outcome}</Text>
                </View>
              ))}

              <SectionHeader title="Next Steps" icon={ArrowRight} />
              {summary.nextSteps.map((step, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.listText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'phases' && (
            <View style={styles.section}>
              {summary.phases.map((phase, index) => (
                <PhaseCard key={index} phase={phase} />
              ))}
            </View>
          )}

          {activeTab === 'emotions' && (
            <View style={styles.section}>
              <SectionHeader title="Emotional Journey" icon={Heart} />
              {summary.emotionalJourney.map((insight, index) => (
                <EmotionCard key={index} insight={insight} />
              ))}
            </View>
          )}

          {activeTab === 'insights' && (
            <View style={styles.section}>
              <SectionHeader title="Growth Areas" icon={TrendingUp} />
              {summary.participantGrowth.map((area, index) => (
                <View key={index} style={styles.growthItem}>
                  <Star size={14} color="#F59E0B" />
                  <Text style={styles.listText}>{area}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <View style={styles.sectionHeader}>
      <Icon size={18} color="#E2E8F0" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function PhaseCard({ phase }: { phase: SessionPhase }) {
  const Icon = PHASE_ICONS[phase.phase as keyof typeof PHASE_ICONS] || MessageCircle;
  const color = PHASE_COLORS[phase.phase as keyof typeof PHASE_COLORS] || '#64748B';
  const duration = Math.round((phase.endTime.getTime() - phase.startTime.getTime()) / 60000);

  return (
    <View style={styles.phaseCard}>
      <View style={styles.phaseHeader}>
        <View style={styles.phaseInfo}>
          <Icon size={16} color={color} />
          <Text style={[styles.phaseTitle, { color }]}>
            {phase.phase.charAt(0).toUpperCase() + phase.phase.slice(1)}
          </Text>
        </View>
        <Text style={styles.phaseDuration}>{duration}m</Text>
      </View>
      
      <Text style={styles.phaseEmotion}>Tone: {phase.emotionalTone}</Text>
      
      <View style={styles.phaseTopics}>
        {phase.keyTopics.map((topic, index) => (
          <View key={index} style={styles.topicTag}>
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EmotionCard({ insight }: { insight: EmotionalInsight }) {
  return (
    <View style={styles.emotionCard}>
      <View style={styles.emotionHeader}>
        <Text style={styles.emotionTime}>
          {insight.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <View style={styles.emotionInfo}>
          <Text style={styles.emotionName}>{insight.primaryEmotion}</Text>
          <View style={styles.intensityBar}>
            <View 
              style={[
                styles.intensityFill, 
                { width: `${insight.intensity * 100}%` }
              ]} 
            />
          </View>
        </View>
        {insight.breakthrough && (
          <Star size={14} color="#F59E0B" />
        )}
      </View>
      <Text style={styles.emotionContext}>{insight.context}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradient: {
    flex: 1,
  },
  compactContainer: {
    marginVertical: 8,
  },
  compactGradient: {
    borderRadius: 12,
    padding: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  compactMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  compactInsight: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  listBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  growthItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  phaseCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  phaseDuration: {
    fontSize: 12,
    color: '#64748B',
  },
  phaseEmotion: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  phaseTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicTag: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  topicText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  emotionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  emotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  emotionTime: {
    fontSize: 12,
    color: '#64748B',
    minWidth: 50,
  },
  emotionInfo: {
    flex: 1,
  },
  emotionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  intensityBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
  },
  intensityFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  emotionContext: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
});

