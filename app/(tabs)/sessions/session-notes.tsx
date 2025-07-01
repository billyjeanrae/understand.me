import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import CrossPlatformModal from '../../../components/common/CrossPlatformModal';
import CrossPlatformInput, { CrossPlatformTextArea } from '../../../components/common/CrossPlatformInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useResponsive } from '../../../utils/platform';
import { ResponsiveContainer } from '../../../components/layout/ResponsiveContainer';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Save,
  X,
  Clock,
  Tag,
  FileText,
  Star,
  Archive,
  Share,
  Download
} from 'lucide-react-native';

interface SessionNote {
  id: string;
  title: string;
  content: string;
  category: 'observation' | 'action_item' | 'breakthrough' | 'concern' | 'general';
  tags: string[];
  timestamp: Date;
  sessionId: string;
  isStarred: boolean;
  isArchived: boolean;
}

interface NoteCategory {
  id: string;
  label: string;
  color: string;
  icon: any;
  description: string;
}

export default function SessionNotesScreen() {
  const { spacing, fontSize } = useResponsive();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<SessionNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null);
  const [conflictTitle, setConflictTitle] = useState('Family Budget Discussion');

  const categories: NoteCategory[] = [
    {
      id: 'observation',
      label: 'Observation',
      color: '#3B82F6',
      icon: FileText,
      description: 'Key observations about participant behavior or dynamics'
    },
    {
      id: 'action_item',
      label: 'Action Item',
      color: '#F59E0B',
      icon: Clock,
      description: 'Tasks or commitments made during the session'
    },
    {
      id: 'breakthrough',
      label: 'Breakthrough',
      color: '#10B981',
      icon: Star,
      description: 'Moments of understanding or progress'
    },
    {
      id: 'concern',
      label: 'Concern',
      color: '#EF4444',
      icon: Alert,
      description: 'Issues or red flags that need attention'
    },
    {
      id: 'general',
      label: 'General',
      color: '#8B5CF6',
      icon: Edit3,
      description: 'General notes and thoughts'
    }
  ];

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery, selectedCategory]);

  const loadNotes = () => {
    // Mock notes data
    const mockNotes: SessionNote[] = [
      {
        id: 'note_1',
        title: 'Sarah\'s Budget Concerns',
        content: 'Sarah expressed strong feelings about overspending on entertainment. She mentioned feeling stressed about the family\'s financial future and wants to see more discipline in spending habits.',
        category: 'observation',
        tags: ['budget', 'stress', 'sarah'],
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        sessionId: 'session_1',
        isStarred: true,
        isArchived: false
      },
      {
        id: 'note_2',
        title: 'Action: Create Monthly Budget Review',
        content: 'All participants agreed to implement a monthly budget review meeting. Mike will prepare the first agenda, Sarah will track expenses, and Emma will research budgeting apps.',
        category: 'action_item',
        tags: ['budget', 'monthly', 'review', 'action'],
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        sessionId: 'session_1',
        isStarred: false,
        isArchived: false
      },
      {
        id: 'note_3',
        title: 'Breakthrough: Understanding Perspectives',
        content: 'Mike acknowledged Sarah\'s stress and Sarah recognized the importance of family activities. This was a key moment where both parties showed empathy for each other\'s viewpoints.',
        category: 'breakthrough',
        tags: ['empathy', 'understanding', 'progress'],
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        sessionId: 'session_1',
        isStarred: true,
        isArchived: false
      },
      {
        id: 'note_4',
        title: 'Concern: Emma\'s Disengagement',
        content: 'Emma seemed withdrawn during the discussion about entertainment spending. Need to follow up and ensure she feels heard in future sessions.',
        category: 'concern',
        tags: ['emma', 'engagement', 'follow-up'],
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        sessionId: 'session_1',
        isStarred: false,
        isArchived: false
      }
    ];

    setNotes(mockNotes);
  };

  const filterNotes = () => {
    let filtered = notes;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredNotes(filtered);
  };

  const createNote = (noteData: Partial<SessionNote>) => {
    const newNote: SessionNote = {
      id: `note_${Date.now()}`,
      title: noteData.title || '',
      content: noteData.content || '',
      category: noteData.category || 'general',
      tags: noteData.tags || [],
      timestamp: new Date(),
      sessionId: 'session_1',
      isStarred: false,
      isArchived: false,
    };

    setNotes(prev => [newNote, ...prev]);
    setShowCreateModal(false);
  };

  const updateNote = (noteId: string, updates: Partial<SessionNote>) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId ? { ...note, ...updates } : note
    ));
    setEditingNote(null);
  };

  const deleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setNotes(prev => prev.filter(note => note.id !== noteId))
        }
      ]
    );
  };

  const toggleStar = (noteId: string) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId ? { ...note, isStarred: !note.isStarred } : note
    ));
  };

  const exportNotes = () => {
    const notesText = filteredNotes.map(note => {
      const category = categories.find(c => c.id === note.category);
      return `[${category?.label}] ${note.title}\n${note.content}\nTags: ${note.tags.join(', ')}\nTime: ${note.timestamp.toLocaleString()}\n\n`;
    }).join('');

    Alert.alert(
      'Export Notes',
      `Notes exported successfully!\n\nPreview:\n${notesText.substring(0, 200)}...`,
      [
        { text: 'OK' },
        { text: 'Share', onPress: () => Alert.alert('Share', 'Sharing functionality would be implemented here') }
      ]
    );
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[4]; // fallback to general
  };

  const renderNoteCard = (note: SessionNote) => {
    const categoryInfo = getCategoryInfo(note.category);
    const IconComponent = categoryInfo.icon;

    return (
      <TouchableOpacity
        key={note.id}
        style={[styles.noteCard, { padding: spacing(16), marginBottom: spacing(12) }]}
        onPress={() => setEditingNote(note)}
      >
        <View style={styles.noteHeader}>
          <View style={styles.noteCategory}>
            <IconComponent size={16} color={categoryInfo.color} strokeWidth={2} />
            <Text style={[styles.categoryLabel, { fontSize: fontSize(12), color: categoryInfo.color }]}>
              {categoryInfo.label}
            </Text>
          </View>
          
          <View style={styles.noteActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleStar(note.id)}
            >
              <Star 
                size={16} 
                color={note.isStarred ? '#F59E0B' : '#6B7280'} 
                fill={note.isStarred ? '#F59E0B' : 'none'}
                strokeWidth={2} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteNote(note.id)}
            >
              <Trash2 size={16} color="#EF4444" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.noteTitle, { fontSize: fontSize(16) }]}>
          {note.title}
        </Text>

        <Text style={[styles.noteContent, { fontSize: fontSize(14) }]} numberOfLines={3}>
          {note.content}
        </Text>

        <View style={styles.noteFooter}>
          <View style={styles.noteTags}>
            {note.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { paddingHorizontal: spacing(8), paddingVertical: spacing(4) }]}>
                <Text style={[styles.tagText, { fontSize: fontSize(10) }]}>
                  {tag}
                </Text>
              </View>
            ))}
            {note.tags.length > 3 && (
              <Text style={[styles.moreTagsText, { fontSize: fontSize(10) }]}>
                +{note.tags.length - 3} more
              </Text>
            )}
          </View>
          
          <Text style={[styles.noteTime, { fontSize: fontSize(12) }]}>
            {formatTime(note.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { fontSize: fontSize(18) }]}>
            Session Notes
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: fontSize(14) }]}>
            {conflictTitle}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={exportNotes}
          >
            <Download size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={[styles.searchContainer, { padding: spacing(16) }]}>
        <CrossPlatformInput
          leftIcon={<Search size={20} color="#9CA3AF" strokeWidth={2} />}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
          inputStyle={styles.searchInput}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { paddingHorizontal: spacing(16), paddingVertical: spacing(8) },
              selectedCategory === 'all' && styles.activeFilter
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.filterText,
              { fontSize: fontSize(14) },
              selectedCategory === 'all' && styles.activeFilterText
            ]}>
              All
            </Text>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                { paddingHorizontal: spacing(16), paddingVertical: spacing(8) },
                selectedCategory === category.id && styles.activeFilter
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.filterText,
                { fontSize: fontSize(14) },
                selectedCategory === category.id && styles.activeFilterText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notes List */}
      <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer style={styles.notesContent}>
          {filteredNotes.length === 0 ? (
            <View style={[styles.emptyState, { padding: spacing(32) }]}>
              <FileText size={48} color="#6B7280" strokeWidth={1} />
              <Text style={[styles.emptyText, { fontSize: fontSize(16) }]}>
                No notes found
              </Text>
              <Text style={[styles.emptySubtext, { fontSize: fontSize(14) }]}>
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Start taking notes during your mediation session'
                }
              </Text>
              {!searchQuery && selectedCategory === 'all' && (
                <TouchableOpacity
                  style={[styles.createButton, { padding: spacing(12), marginTop: spacing(16) }]}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Plus size={20} color="#FFFFFF" strokeWidth={2} />
                  <Text style={[styles.createButtonText, { fontSize: fontSize(14) }]}>
                    Create First Note
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredNotes.map(renderNoteCard)
          )}
        </ResponsiveContainer>
      </ScrollView>

      {/* Create/Edit Note Modal */}
      <NoteEditorModal
        visible={showCreateModal || editingNote !== null}
        note={editingNote}
        categories={categories}
        onClose={() => {
          setShowCreateModal(false);
          setEditingNote(null);
        }}
        onSave={(noteData) => {
          if (editingNote) {
            updateNote(editingNote.id, noteData);
          } else {
            createNote(noteData);
          }
        }}
      />
    </SafeAreaView>
  );
}

// Note Editor Modal Component
interface NoteEditorModalProps {
  visible: boolean;
  note: SessionNote | null;
  categories: NoteCategory[];
  onClose: () => void;
  onSave: (noteData: Partial<SessionNote>) => void;
}

function NoteEditorModal({ visible, note, categories, onClose, onSave }: NoteEditorModalProps) {
  const { spacing, fontSize } = useResponsive();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'observation' | 'action_item' | 'breakthrough' | 'concern' | 'general'>('general');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setTags(note.tags.join(', '));
    } else {
      setTitle('');
      setContent('');
      setCategory('general');
      setTags('');
    }
  }, [note]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the note');
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    };

    onSave(noteData);
    onClose();
  };

  return (
    <CrossPlatformModal visible={visible} onClose={onClose}>
      <View style={styles.modalHeader}>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <X size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { fontSize: fontSize(18) }]}>
          {note ? 'Edit Note' : 'Create Note'}
        </Text>
        <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
          <Save size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        <ResponsiveContainer style={styles.modalForm}>
          <CrossPlatformInput
            label="Title"
            placeholder="Enter note title..."
            value={title}
            onChangeText={setTitle}
            containerStyle={styles.formGroup}
          />

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { fontSize: fontSize(16) }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryOptions}>
                  {categories.map((cat) => {
                    const IconComponent = cat.icon;
                    const isSelected = category === cat.id;
                    
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryOption,
                          { padding: spacing(12) },
                          isSelected && { borderColor: cat.color, backgroundColor: `${cat.color}20` }
                        ]}
                        onPress={() => setCategory(cat.id as 'observation' | 'action_item' | 'breakthrough' | 'concern' | 'general')}
                      >
                        <IconComponent 
                          size={20} 
                          color={isSelected ? cat.color : '#9CA3AF'} 
                          strokeWidth={2} 
                        />
                        <Text style={[
                          styles.categoryOptionText,
                          { fontSize: fontSize(12), color: isSelected ? cat.color : '#D1D5DB' }
                        ]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

          <CrossPlatformTextArea
            label="Content"
            placeholder="Write your note here..."
            value={content}
            onChangeText={setContent}
            numberOfLines={8}
            containerStyle={styles.formGroup}
          />

          <CrossPlatformInput
            label="Tags"
            placeholder="Enter tags separated by commas..."
            value={tags}
            onChangeText={setTags}
            containerStyle={styles.formGroup}
          />
        </ResponsiveContainer>
      </ScrollView>
    </CrossPlatformModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  categoryFilter: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  notesList: {
    flex: 1,
  },
  notesContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  noteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryLabel: {
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  noteTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  noteContent: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  tag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
  },
  tagText: {
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
  },
  moreTagsText: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  noteTime: {
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  modalSaveButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  modalContent: {
    flex: 1,
  },
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  formTextArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  categoryOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    gap: 4,
    minWidth: 80,
  },
  categoryOptionText: {
    fontFamily: 'Inter-Medium',
  },
});
