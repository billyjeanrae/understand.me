import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useResponsive } from '../../../utils/platform';
import { ResponsiveContainer } from '../../../components/layout/ResponsiveContainer';
import {
  X,
  Users,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Heart,
  Briefcase,
  Home,
  UserCheck,
  Globe
} from 'lucide-react-native';

interface ConflictParticipant {
  id: string;
  name: string;
  relationship: string;
  role: 'participant' | 'mediator';
}

interface ConflictCreationProps {
  visible: boolean;
  onClose: () => void;
  onConflictCreated: (conflict: any) => void;
}

export default function ConflictCreationModal({ visible, onClose, onConflictCreated }: ConflictCreationProps) {
  const { spacing, fontSize } = useResponsive();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    intensity: 'medium' as 'low' | 'medium' | 'high',
    participants: [
      { id: 'user', name: 'You', relationship: 'self', role: 'mediator' as const }
    ] as ConflictParticipant[],
    isPrivate: true,
    tags: [] as string[],
  });

  const categories = [
    { id: 'romantic', label: 'Romantic', icon: Heart, color: '#EC4899' },
    { id: 'family', label: 'Family', icon: Home, color: '#10B981' },
    { id: 'workplace', label: 'Workplace', icon: Briefcase, color: '#3B82F6' },
    { id: 'friendship', label: 'Friendship', icon: UserCheck, color: '#F59E0B' },
    { id: 'other', label: 'Other', icon: Globe, color: '#8B5CF6' },
  ];

  const intensityLevels = [
    { id: 'low', label: 'Low', color: '#10B981', description: 'Minor disagreement' },
    { id: 'medium', label: 'Medium', color: '#F59E0B', description: 'Significant tension' },
    { id: 'high', label: 'High', color: '#EF4444', description: 'Major conflict' },
  ];

  const addParticipant = () => {
    const newParticipant: ConflictParticipant = {
      id: `participant_${Date.now()}`,
      name: '',
      relationship: '',
      role: 'participant',
    };
    setFormData(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));
  };

  const removeParticipant = (id: string) => {
    if (id === 'user') return; // Can't remove self
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }));
  };

  const updateParticipant = (id: string, field: keyof ConflictParticipant, value: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.title.trim().length > 0 && formData.description.trim().length > 0;
      case 2:
        return formData.category.length > 0;
      case 3:
        return formData.participants.every(p => p.name.trim().length > 0);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    } else {
      Alert.alert('Required Fields', 'Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const createConflict = async () => {
    try {
      // Validate all participants have names
      const invalidParticipants = formData.participants.filter(p => !p.name.trim());
      if (invalidParticipants.length > 0) {
        Alert.alert('Error', 'Please provide names for all participants.');
        return;
      }

      const newConflict = {
        id: `conflict_${Date.now()}`,
        ...formData,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        issues: [],
        progressNotes: [],
      };

      // TODO: Save to backend/storage
      onConflictCreated(newConflict);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        intensity: 'medium',
        participants: [
          { id: 'user', name: 'You', relationship: 'self', role: 'mediator' }
        ],
        isPrivate: true,
        tags: [],
      });
      setStep(1);
      onClose();
      
      Alert.alert('Success', 'Conflict created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create conflict. Please try again.');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((stepNum) => (
        <View key={stepNum} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            { backgroundColor: step >= stepNum ? '#3B82F6' : '#374151' }
          ]}>
            <Text style={[styles.stepNumber, { fontSize: fontSize(12) }]}>
              {stepNum}
            </Text>
          </View>
          {stepNum < 4 && (
            <View style={[
              styles.stepLine,
              { backgroundColor: step > stepNum ? '#3B82F6' : '#374151' }
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { fontSize: fontSize(20) }]}>
        Describe the Conflict
      </Text>
      <Text style={[styles.stepDescription, { fontSize: fontSize(14) }]}>
        Give your conflict a clear title and description
      </Text>

      <View style={[styles.inputGroup, { marginTop: spacing(24) }]}>
        <Text style={[styles.label, { fontSize: fontSize(16) }]}>
          Conflict Title *
        </Text>
        <TextInput
          style={[styles.input, { fontSize: fontSize(16), padding: spacing(16) }]}
          placeholder="e.g., Household chores disagreement"
          placeholderTextColor="#6B7280"
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
        />
      </View>

      <View style={[styles.inputGroup, { marginTop: spacing(16) }]}>
        <Text style={[styles.label, { fontSize: fontSize(16) }]}>
          Description *
        </Text>
        <TextInput
          style={[styles.textArea, { fontSize: fontSize(14), padding: spacing(16) }]}
          placeholder="Describe what happened, who was involved, and the main points of disagreement..."
          placeholderTextColor="#6B7280"
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { fontSize: fontSize(20) }]}>
        Conflict Category
      </Text>
      <Text style={[styles.stepDescription, { fontSize: fontSize(14) }]}>
        Choose the category that best describes this conflict
      </Text>

      <View style={[styles.categoryGrid, { marginTop: spacing(24) }]}>
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = formData.category === category.id;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { padding: spacing(16) },
                isSelected && { borderColor: category.color, backgroundColor: `${category.color}20` }
              ]}
              onPress={() => setFormData(prev => ({ ...prev, category: category.id }))}
            >
              <IconComponent 
                size={32} 
                color={isSelected ? category.color : '#9CA3AF'} 
                strokeWidth={2} 
              />
              <Text style={[
                styles.categoryLabel,
                { fontSize: fontSize(14), color: isSelected ? category.color : '#D1D5DB' }
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.inputGroup, { marginTop: spacing(24) }]}>
        <Text style={[styles.label, { fontSize: fontSize(16) }]}>
          Intensity Level
        </Text>
        <View style={styles.intensityOptions}>
          {intensityLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.intensityOption,
                { padding: spacing(12) },
                formData.intensity === level.id && { 
                  borderColor: level.color, 
                  backgroundColor: `${level.color}20` 
                }
              ]}
              onPress={() => setFormData(prev => ({ ...prev, intensity: level.id as any }))}
            >
              <Text style={[
                styles.intensityLabel,
                { fontSize: fontSize(14) },
                formData.intensity === level.id && { color: level.color }
              ]}>
                {level.label}
              </Text>
              <Text style={[styles.intensityDescription, { fontSize: fontSize(12) }]}>
                {level.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { fontSize: fontSize(20) }]}>
        Add Participants
      </Text>
      <Text style={[styles.stepDescription, { fontSize: fontSize(14) }]}>
        Who else is involved in this conflict?
      </Text>

      <View style={[styles.participantsList, { marginTop: spacing(24) }]}>
        {formData.participants.map((participant, index) => (
          <View key={participant.id} style={[styles.participantCard, { padding: spacing(16) }]}>
            <View style={styles.participantHeader}>
              <Text style={[styles.participantNumber, { fontSize: fontSize(12) }]}>
                {index + 1}
              </Text>
              {participant.id !== 'user' && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeParticipant(participant.id)}
                >
                  <Minus size={16} color="#EF4444" strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.participantInputs}>
              <TextInput
                style={[styles.participantInput, { fontSize: fontSize(14), padding: spacing(12) }]}
                placeholder="Name"
                placeholderTextColor="#6B7280"
                value={participant.name}
                onChangeText={(text) => updateParticipant(participant.id, 'name', text)}
                editable={participant.id !== 'user'}
              />
              <TextInput
                style={[styles.participantInput, { fontSize: fontSize(14), padding: spacing(12) }]}
                placeholder="Relationship (e.g., spouse, colleague)"
                placeholderTextColor="#6B7280"
                value={participant.relationship}
                onChangeText={(text) => updateParticipant(participant.id, 'relationship', text)}
                editable={participant.id !== 'user'}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addParticipantButton, { padding: spacing(16) }]}
          onPress={addParticipant}
        >
          <Plus size={20} color="#3B82F6" strokeWidth={2} />
          <Text style={[styles.addParticipantText, { fontSize: fontSize(14) }]}>
            Add Another Participant
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { fontSize: fontSize(20) }]}>
        Review & Create
      </Text>
      <Text style={[styles.stepDescription, { fontSize: fontSize(14) }]}>
        Review your conflict details before creating
      </Text>

      <View style={[styles.reviewSection, { marginTop: spacing(24) }]}>
        <View style={[styles.reviewItem, { padding: spacing(16) }]}>
          <Text style={[styles.reviewLabel, { fontSize: fontSize(14) }]}>Title</Text>
          <Text style={[styles.reviewValue, { fontSize: fontSize(16) }]}>{formData.title}</Text>
        </View>

        <View style={[styles.reviewItem, { padding: spacing(16) }]}>
          <Text style={[styles.reviewLabel, { fontSize: fontSize(14) }]}>Category</Text>
          <Text style={[styles.reviewValue, { fontSize: fontSize(16) }]}>
            {categories.find(c => c.id === formData.category)?.label || 'Not selected'}
          </Text>
        </View>

        <View style={[styles.reviewItem, { padding: spacing(16) }]}>
          <Text style={[styles.reviewLabel, { fontSize: fontSize(14) }]}>Participants</Text>
          <Text style={[styles.reviewValue, { fontSize: fontSize(16) }]}>
            {formData.participants.length} people
          </Text>
        </View>

        <View style={[styles.reviewItem, { padding: spacing(16) }]}>
          <Text style={[styles.reviewLabel, { fontSize: fontSize(14) }]}>Intensity</Text>
          <Text style={[styles.reviewValue, { fontSize: fontSize(16) }]}>
            {formData.intensity.charAt(0).toUpperCase() + formData.intensity.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: fontSize(18) }]}>
            Create New Conflict
          </Text>
          <View style={styles.placeholder} />
        </View>

        {renderStepIndicator()}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ResponsiveContainer>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </ResponsiveContainer>
        </ScrollView>

        <View style={[styles.footer, { padding: spacing(20) }]}>
          <View style={styles.footerButtons}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.secondaryButton, { padding: spacing(16) }]}
                onPress={prevStep}
              >
                <Text style={[styles.secondaryButtonText, { fontSize: fontSize(16) }]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}

            {step < 4 ? (
              <TouchableOpacity
                style={[styles.primaryButton, { padding: spacing(16) }]}
                onPress={nextStep}
              >
                <Text style={[styles.primaryButtonText, { fontSize: fontSize(16) }]}>
                  Next
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, { padding: spacing(16) }]}
                onPress={createConflict}
              >
                <Check size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={[styles.primaryButtonText, { fontSize: fontSize(16) }]}>
                  Create Conflict
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  placeholder: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  stepDescription: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    minWidth: '45%',
    gap: 8,
  },
  categoryLabel: {
    fontFamily: 'Inter-SemiBold',
  },
  intensityOptions: {
    gap: 8,
  },
  intensityOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  intensityLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  intensityDescription: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  participantsList: {
    gap: 12,
  },
  participantCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantNumber: {
    color: '#3B82F6',
    fontFamily: 'Inter-Bold',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  removeButton: {
    padding: 4,
  },
  participantInputs: {
    gap: 8,
  },
  participantInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  addParticipantButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addParticipantText: {
    color: '#3B82F6',
    fontFamily: 'Inter-SemiBold',
  },
  reviewSection: {
    gap: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  reviewItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  reviewLabel: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  reviewValue: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-SemiBold',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
});
