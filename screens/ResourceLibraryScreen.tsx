/**
 * Resource Library Screen
 * Browse and access conflict resolution and communication resources
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Star,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Play,
  CheckCircle,
  TrendingUp,
  Heart,
  MessageCircle,
  Shield,
  Brain,
  Users,
  Target
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../navigation/types';
import {
  Resource,
  ResourceCategory,
  ResourceType,
  ResourceRecommendation,
  resourceLibraryService
} from '../services/resources/resourceLibraryService';

type ResourceLibraryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResourceLibrary'>;

const CATEGORY_ICONS = {
  communication: MessageCircle,
  conflict_resolution: Shield,
  emotional_intelligence: Heart,
  active_listening: BookOpen,
  empathy: Heart,
  negotiation: Users,
  boundaries: Target,
  stress_management: Brain,
  relationship_building: Users
};

const CATEGORY_COLORS = {
  communication: '#3B82F6',
  conflict_resolution: '#10B981',
  emotional_intelligence: '#EC4899',
  active_listening: '#8B5CF6',
  empathy: '#F59E0B',
  negotiation: '#EF4444',
  boundaries: '#06B6D4',
  stress_management: '#84CC16',
  relationship_building: '#F97316'
};

const DIFFICULTY_COLORS = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444'
};

export default function ResourceLibraryScreen() {
  const navigation = useNavigation<ResourceLibraryScreenNavigationProp>();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [recommendations, setRecommendations] = useState<ResourceRecommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, selectedCategory]);

  const initializeResources = async () => {
    try {
      await resourceLibraryService.initialize();
      const allResources = await resourceLibraryService.getAllResources();
      const userRecommendations = await resourceLibraryService.getRecommendations('current_user');
      
      setResources(allResources);
      setRecommendations(userRecommendations);
    } catch (error) {
      console.error('Failed to load resources:', error);
      Alert.alert('Error', 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    setFilteredResources(filtered);
  };

  const handleResourcePress = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const handleBookmark = async (resourceId: string) => {
    try {
      const isBookmarked = await resourceLibraryService.toggleBookmark(resourceId, 'current_user');
      
      // Update local state
      setResources(prev => prev.map(r => 
        r.id === resourceId ? { ...r, isBookmarked } : r
      ));
      setFilteredResources(prev => prev.map(r => 
        r.id === resourceId ? { ...r, isBookmarked } : r
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update bookmark');
    }
  };

  const handleCompleteResource = async (resourceId: string, rating?: number) => {
    try {
      await resourceLibraryService.markResourceCompleted(resourceId, 'current_user', rating);
      
      // Update local state
      const now = new Date();
      setResources(prev => prev.map(r => 
        r.id === resourceId ? { ...r, completedAt: now, rating } : r
      ));
      setFilteredResources(prev => prev.map(r => 
        r.id === resourceId ? { ...r, completedAt: now, rating } : r
      ));
      
      Alert.alert('Success', 'Resource marked as completed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark resource as completed');
    }
  };

  const categories: Array<{ id: ResourceCategory | 'all'; name: string }> = [
    { id: 'all', name: 'All' },
    { id: 'communication', name: 'Communication' },
    { id: 'conflict_resolution', name: 'Conflict Resolution' },
    { id: 'emotional_intelligence', name: 'Emotional Intelligence' },
    { id: 'active_listening', name: 'Active Listening' },
    { id: 'empathy', name: 'Empathy' },
    { id: 'boundaries', name: 'Boundaries' },
    { id: 'stress_management', name: 'Stress Management' }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading resources...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#E2E8F0" />
          </Pressable>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Resource Library</Text>
            <Text style={styles.headerSubtitle}>
              {filteredResources.length} resources available
            </Text>
          </View>

          <Pressable 
            style={styles.filterButton} 
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search resources..."
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        {/* Category Filter */}
        {showFilters && (
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryList}>
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.id && styles.categoryChipActive
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && styles.categoryChipTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={18} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Recommended for You</Text>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.recommendationsList}>
                  {recommendations.map((rec) => (
                    <RecommendationCard
                      key={rec.resource.id}
                      recommendation={rec}
                      onPress={() => handleResourcePress(rec.resource)}
                      onBookmark={() => handleBookmark(rec.resource.id)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* All Resources */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={18} color="#E2E8F0" />
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'all' ? 'All Resources' : categories.find(c => c.id === selectedCategory)?.name}
              </Text>
            </View>
            
            <View style={styles.resourcesList}>
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onPress={() => handleResourcePress(resource)}
                  onBookmark={() => handleBookmark(resource.id)}
                />
              ))}
            </View>
            
            {filteredResources.length === 0 && (
              <View style={styles.emptyState}>
                <BookOpen size={48} color="#64748B" />
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'No resources found matching your search' : 'No resources in this category'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Resource Detail Modal */}
        <Modal
          visible={!!selectedResource}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedResource(null)}
        >
          {selectedResource && (
            <ResourceDetailView
              resource={selectedResource}
              onClose={() => setSelectedResource(null)}
              onComplete={(rating) => handleCompleteResource(selectedResource.id, rating)}
              onBookmark={() => handleBookmark(selectedResource.id)}
            />
          )}
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

function RecommendationCard({ 
  recommendation, 
  onPress, 
  onBookmark 
}: { 
  recommendation: ResourceRecommendation;
  onPress: () => void;
  onBookmark: () => void;
}) {
  const { resource } = recommendation;
  const CategoryIcon = CATEGORY_ICONS[resource.category] || BookOpen;
  const categoryColor = CATEGORY_COLORS[resource.category] || '#64748B';

  return (
    <Pressable style={styles.recommendationCard} onPress={onPress}>
      <View style={styles.recommendationHeader}>
        <View style={styles.recommendationIcon}>
          <CategoryIcon size={16} color={categoryColor} />
        </View>
        <Pressable onPress={onBookmark}>
          {resource.isBookmarked ? (
            <BookmarkCheck size={16} color="#F59E0B" />
          ) : (
            <Bookmark size={16} color="#64748B" />
          )}
        </Pressable>
      </View>
      
      <Text style={styles.recommendationTitle} numberOfLines={2}>
        {resource.title}
      </Text>
      
      <Text style={styles.recommendationReason} numberOfLines={2}>
        {recommendation.reason}
      </Text>
      
      <View style={styles.recommendationMeta}>
        <View style={styles.recommendationTime}>
          <Clock size={12} color="#64748B" />
          <Text style={styles.recommendationTimeText}>{resource.estimatedTime}m</Text>
        </View>
        
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: DIFFICULTY_COLORS[resource.difficulty] + '20' }
        ]}>
          <Text style={[
            styles.difficultyText,
            { color: DIFFICULTY_COLORS[resource.difficulty] }
          ]}>
            {resource.difficulty}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function ResourceCard({ 
  resource, 
  onPress, 
  onBookmark 
}: { 
  resource: Resource;
  onPress: () => void;
  onBookmark: () => void;
}) {
  const CategoryIcon = CATEGORY_ICONS[resource.category] || BookOpen;
  const categoryColor = CATEGORY_COLORS[resource.category] || '#64748B';

  return (
    <Pressable style={styles.resourceCard} onPress={onPress}>
      <View style={styles.resourceHeader}>
        <View style={styles.resourceIcon}>
          <CategoryIcon size={20} color={categoryColor} />
        </View>
        
        <View style={styles.resourceActions}>
          {resource.completedAt && (
            <CheckCircle size={16} color="#10B981" />
          )}
          <Pressable onPress={onBookmark}>
            {resource.isBookmarked ? (
              <BookmarkCheck size={16} color="#F59E0B" />
            ) : (
              <Bookmark size={16} color="#64748B" />
            )}
          </Pressable>
        </View>
      </View>
      
      <Text style={styles.resourceTitle}>{resource.title}</Text>
      <Text style={styles.resourceDescription} numberOfLines={2}>
        {resource.description}
      </Text>
      
      <View style={styles.resourceMeta}>
        <View style={styles.resourceTime}>
          <Clock size={12} color="#64748B" />
          <Text style={styles.resourceTimeText}>{resource.estimatedTime}m</Text>
        </View>
        
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: DIFFICULTY_COLORS[resource.difficulty] + '20' }
        ]}>
          <Text style={[
            styles.difficultyText,
            { color: DIFFICULTY_COLORS[resource.difficulty] }
          ]}>
            {resource.difficulty}
          </Text>
        </View>
        
        {resource.rating && (
          <View style={styles.rating}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{resource.rating}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function ResourceDetailView({ 
  resource, 
  onClose, 
  onComplete, 
  onBookmark 
}: { 
  resource: Resource;
  onClose: () => void;
  onComplete: (rating?: number) => void;
  onBookmark: () => void;
}) {
  const [rating, setRating] = useState<number>(0);
  const CategoryIcon = CATEGORY_ICONS[resource.category] || BookOpen;
  const categoryColor = CATEGORY_COLORS[resource.category] || '#64748B';

  const handleComplete = () => {
    onComplete(rating > 0 ? rating : undefined);
    onClose();
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.modalGradient}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Pressable style={styles.modalCloseButton} onPress={onClose}>
            <ArrowLeft size={24} color="#E2E8F0" />
          </Pressable>
          
          <View style={styles.modalHeaderInfo}>
            <Text style={styles.modalTitle}>{resource.title}</Text>
            <View style={styles.modalMeta}>
              <CategoryIcon size={14} color={categoryColor} />
              <Text style={styles.modalCategory}>
                {resource.category.replace('_', ' ')}
              </Text>
            </View>
          </View>

          <Pressable onPress={onBookmark}>
            {resource.isBookmarked ? (
              <BookmarkCheck size={24} color="#F59E0B" />
            ) : (
              <Bookmark size={24} color="#64748B" />
            )}
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.resourceContent}>{resource.content}</Text>
        </ScrollView>

        {/* Actions */}
        {!resource.completedAt && (
          <View style={styles.modalActions}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rate this resource:</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                  >
                    <Star
                      size={24}
                      color="#F59E0B"
                      fill={star <= rating ? "#F59E0B" : "transparent"}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
            
            <Pressable style={styles.completeButton} onPress={handleComplete}>
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </Pressable>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#E2E8F0',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  recommendationsList: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendationCard: {
    width: 200,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  recommendationReason: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  recommendationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendationTimeText: {
    fontSize: 12,
    color: '#64748B',
  },
  resourcesList: {
    gap: 12,
  },
  resourceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 12,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resourceTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resourceTimeText: {
    fontSize: 12,
    color: '#64748B',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalCloseButton: {
    padding: 8,
    marginRight: 12,
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalCategory: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'capitalize',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resourceContent: {
    fontSize: 16,
    color: '#CBD5E1',
    lineHeight: 24,
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

