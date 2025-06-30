import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import CrossPlatformModal from '../common/CrossPlatformModal';
import CrossPlatformInput, { CrossPlatformTextArea } from '../common/CrossPlatformInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../../utils/platform';
import { ResponsiveContainer } from '../layout/ResponsiveContainer';
import {
  X,
  UserPlus,
  Mail,
  Phone,
  Users,
  Check,
  Search,
  Contact,
  MessageSquare,
  Send
} from 'lucide-react-native';

interface ParticipantInviteProps {
  visible: boolean;
  onClose: () => void;
  onParticipantAdded: (participant: any) => void;
  conflictTitle?: string;
}

interface InviteMethod {
  id: string;
  label: string;
  icon: any;
  color: string;
  description: string;
}

interface ContactSuggestion {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  avatar?: string;
}

export default function ParticipantInviteModal({ 
  visible, 
  onClose, 
  onParticipantAdded,
  conflictTitle = "this conflict"
}: ParticipantInviteProps) {
  const { spacing, fontSize } = useResponsive();
  
  const [step, setStep] = useState(1);
  const [inviteMethod, setInviteMethod] = useState('');
  const [participantData, setParticipantData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    role: 'participant' as 'participant' | 'mediator',
    message: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const inviteMethods: InviteMethod[] = [
    {
      id: 'email',
      label: 'Email Invitation',
      icon: Mail,
      color: '#3B82F6',
      description: 'Send an email invitation with conflict details'
    },
    {
      id: 'sms',
      label: 'SMS Invitation',
      icon: MessageSquare,
      color: '#10B981',
      description: 'Send a text message with invitation link'
    },
    {
      id: 'manual',
      label: 'Add Manually',
      icon: UserPlus,
      color: '#F59E0B',
      description: 'Add participant details without sending invitation'
    },
    {
      id: 'contacts',
      label: 'From Contacts',
      icon: Contact,
      color: '#8B5CF6',
      description: 'Select from your device contacts'
    }
  ];

  // Mock contact suggestions
  const contactSuggestions: ContactSuggestion[] = [
    {
      id: 'contact_1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      relationship: 'colleague'
    },
    {
      id: 'contact_2',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+1 (555) 987-6543',
      relationship: 'friend'
    },
    {
      id: 'contact_3',
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      phone: '+1 (555) 456-7890',
      relationship: 'family'
    }
  ];

  const filteredContacts = contactSuggestions.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const resetForm = () => {
    setStep(1);
    setInviteMethod('');
    setParticipantData({
      name: '',
      email: '',
      phone: '',
      relationship: '',
      role: 'participant',
      message: '',
    });
    setSearchQuery('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return inviteMethod.length > 0;
      case 2:
        if (inviteMethod === 'contacts') {
          return participantData.name.length > 0;
        }
        return participantData.name.trim().length > 0 && 
               (inviteMethod === 'manual' || 
                (inviteMethod === 'email' && participantData.email.trim().length > 0) ||
                (inviteMethod === 'sms' && participantData.phone.trim().length > 0));
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    } else {
      Alert.alert('Required Fields', 'Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const sendInvitation = async () => {
    try {
      const newParticipant = {
        id: `participant_${Date.now()}`,
        ...participantData,
        status: inviteMethod === 'manual' ? 'active' : 'pending',
        joinedAt: new Date(),
        inviteMethod,
      };

      // TODO: Send actual invitation based on method
      switch (inviteMethod) {
        case 'email':
          // Send email invitation
          break;
        case 'sms':
          // Send SMS invitation
          break;
        case 'manual':
          // No invitation needed
          break;
        case 'contacts':
          // Handle contact selection
          break;
      }

      onParticipantAdded(newParticipant);
      handleClose();
      
      const methodText = inviteMethod === 'manual' ? 'added' : 'invited';
      Alert.alert('Success', `${participantData.name} has been ${methodText} to the conflict!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add participant. Please try again.');
    }
  };

  const selectContact = (contact: ContactSuggestion) => {
    setParticipantData(prev => ({
      ...prev,
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      relationship: contact.relationship || '',
    }));
    nextStep();
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((stepNum) => (
        <View key={stepNum} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            { backgroundColor: step >= stepNum ? '#3B82F6' : '#374151' }
          ]}>
            <Text style={[styles.stepNumber, { fontSize: fontSize(12) }]}>
              {stepNum}
            </Text>
          </View>
          {stepNum < 3 && (
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
        How would you like to invite them?
      </Text>
      <Text style={[styles.stepDescription, { fontSize: fontSize(14) }]}>
        Choose how you'd like to add this participant to {conflictTitle}
      </Text>

      <View style={[styles.methodGrid, { marginTop: spacing(24) }]}>
        {inviteMethods.map((method) => {
          const IconComponent = method.icon;
          const isSelected = inviteMethod === method.id;
          
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                { padding: spacing(16) },
                isSelected && { borderColor: method.color, backgroundColor: `${method.color}20` }
              ]}
              onPress={() => setInviteMethod(method.id)}
            >
              <IconComponent 
                size={32} 
                color={isSelected ? method.color : '#9CA3AF'} 
                strokeWidth={2} 
              />
              <Text style={[
                styles.methodLabel,
                { fontSize: fontSize(16), color: isSelected ? method.color : '#D1D5DB' }
              ]}>
                {method.label}
              </Text>
              <Text style={[styles.methodDescription, { fontSize: fontSize(12) }]}>
                {method.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep2 = () => {
    if (inviteMethod === 'contacts') {
      return (
        <View style={styles.stepContent}>
          <Text style={[styles.stepTitle, { fontSize: fontSize(20) }]}>
            Select from Contacts
          </Text>
          <Text style={[styles.stepDescription, { fontSize: fontSize(14) }]}>
            Choose a contact to invite to this conflict
          </Text>

          <View style={[styles.searchContainer, { marginTop: spacing(24) }]}>
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, { fontSize: fontSize(14) }]}
              placeholder="Search contacts..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={[styles.contactsList, { marginTop: spacing(16) }]}>
            {filteredContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactCard, { padding: spacing(16) }]}
                onPress={() => selectContact(contact)}
              >
                <View style={styles.contactAvatar}>
                  <Text style={[styles.contactInitial, { fontSize: fontSize(16) }]}>
                    {contact.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { fontSize: fontSize(16) }]}>
                    {contact.name}
                  </Text>
                  {contact.email && (
                    <Text style={[styles.contactDetail, { fontSize: fontSize(12) }]}>
                      {contact.email}
                    </Text>
                  )}
                  {contact.relationship && (
                    <Text style={[styles.contactRelationship, { fontSize: fontSize(12) }]}>
                      {contact.relationship}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, { fontSize: fontSize(20) }]}>
          Participant Details
        </Text>
        <Text style={[styles.stepDescription, { fontSize: fontSize(14) }]}>
          Enter the participant's information
        </Text>

        <View style={[styles.formContainer, { marginTop: spacing(24) }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontSize: fontSize(16) }]}>
              Full Name *
            </Text>
            <TextInput
              style={[styles.input, { fontSize: fontSize(16), padding: spacing(16) }]}
              placeholder="Enter participant's name"
              placeholderTextColor="#6B7280"
              value={participantData.name}
              onChangeText={(text) => setParticipantData(prev => ({ ...prev, name: text }))}
            />
          </View>

          {inviteMethod === 'email' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontSize: fontSize(16) }]}>
                Email Address *
              </Text>
              <TextInput
                style={[styles.input, { fontSize: fontSize(16), padding: spacing(16) }]}
                placeholder="Enter email address"
                placeholderTextColor="#6B7280"
                value={participantData.email}
                onChangeText={(text) => setParticipantData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {inviteMethod === 'sms' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontSize: fontSize(16) }]}>
                Phone Number *
              </Text>
              <TextInput
                style={[styles.input, { fontSize: fontSize(16), padding: spacing(16) }]}
                placeholder="Enter phone number"
                placeholderTextColor="#6B7280"
                value={participantData.phone}
                onChangeText={(text) => setParticipantData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontSize: fontSize(16) }]}>
              Relationship
            </Text>
            <TextInput
              style={[styles.input, { fontSize: fontSize(16), padding: spacing(16) }]}
              placeholder="e.g., colleague, family member, friend"
              placeholderTextColor="#6B7280"
              value={participantData.relationship}
              onChangeText={(text) => setParticipantData(prev => ({ ...prev, relationship: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontSize: fontSize(16) }]}>
              Role in Conflict
            </Text>
            <View style={styles.roleOptions}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  { padding: spacing(12) },
                  participantData.role === 'participant' && styles.selectedRole
                ]}
                onPress={() => setParticipantData(prev => ({ ...prev, role: 'participant' }))}
              >
                <Text style={[
                  styles.roleText,
                  { fontSize: fontSize(14) },
                  participantData.role === 'participant' && styles.selectedRoleText
                ]}>
                  Participant
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  { padding: spacing(12) },
                  participantData.role === 'mediator' && styles.selectedRole
                ]}
                onPress={() => setParticipantData(prev => ({ ...prev, role: 'mediator' }))}
              >
                <Text style={[
                  styles.roleText,
                  { fontSize: fontSize(14) },
                  participantData.role === 'mediator' && styles.selectedRoleText
                ]}>
                  Mediator
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { fontSize: fontSize(20) }]}>
        {inviteMethod === 'manual' ? 'Add Participant' : 'Send Invitation'}
      </Text>
      <Text style={[styles.stepDescription, { fontSize: fontSize(14) }]}>
        {inviteMethod === 'manual' 
          ? 'Review the participant details before adding them'
          : 'Add a personal message to the invitation (optional)'
        }
      </Text>

      {inviteMethod !== 'manual' && (
        <View style={[styles.inputGroup, { marginTop: spacing(24) }]}>
          <Text style={[styles.label, { fontSize: fontSize(16) }]}>
            Personal Message
          </Text>
          <TextInput
            style={[styles.textArea, { fontSize: fontSize(14), padding: spacing(16) }]}
            placeholder="Hi! I'd like to invite you to participate in a conflict resolution session. Your perspective would be valuable in helping us work through this together."
            placeholderTextColor="#6B7280"
            value={participantData.message}
            onChangeText={(text) => setParticipantData(prev => ({ ...prev, message: text }))}
            multiline
            numberOfLines={4}
          />
        </View>
      )}

      <View style={[styles.reviewSection, { marginTop: spacing(24) }]}>
        <Text style={[styles.reviewTitle, { fontSize: fontSize(16) }]}>
          Participant Summary
        </Text>
        
        <View style={[styles.reviewItem, { padding: spacing(16) }]}>
          <Text style={[styles.reviewLabel, { fontSize: fontSize(14) }]}>Name</Text>
          <Text style={[styles.reviewValue, { fontSize: fontSize(16) }]}>{participantData.name}</Text>
        </View>

        {participantData.email && (
          <View style={[styles.reviewItem, { padding: spacing(16) }]}>
            <Text style={[styles.reviewLabel, { fontSize: fontSize(14) }]}>Email</Text>
            <Text style={[styles.reviewValue, { fontSize: fontSize(16) }]}>{participantData.email}</Text>
          </View>
        )}

        {participantData.phone && (
          <View style={[styles.reviewItem, { padding: spacing(16) }]}>
            <Text style={[styles.reviewLabel, { fontSize: fontSize(14) }]}>Phone</Text>
            <Text style={[styles.reviewValue, { fontSize: fontSize(16) }]}>{participantData.phone}</Text>
          </View>
        )}

        <View style={[styles.reviewItem, { padding: spacing(16) }]}>
          <Text style={[styles.reviewLabel, { fontSize: fontSize(14) }]}>Role</Text>
          <Text style={[styles.reviewValue, { fontSize: fontSize(16) }]}>
            {participantData.role.charAt(0).toUpperCase() + participantData.role.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: fontSize(18) }]}>
            Invite Participant
          </Text>
          <View style={styles.placeholder} />
        </View>

        {renderStepIndicator()}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ResponsiveContainer>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
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

            {step < 3 ? (
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
                onPress={sendInvitation}
              >
                {inviteMethod === 'manual' ? (
                  <UserPlus size={20} color="#FFFFFF" strokeWidth={2} />
                ) : (
                  <Send size={20} color="#FFFFFF" strokeWidth={2} />
                )}
                <Text style={[styles.primaryButtonText, { fontSize: fontSize(16) }]}>
                  {inviteMethod === 'manual' ? 'Add Participant' : 'Send Invitation'}
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
  methodGrid: {
    gap: 12,
  },
  methodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    gap: 8,
  },
  methodLabel: {
    fontFamily: 'Inter-SemiBold',
  },
  methodDescription: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  contactsList: {
    maxHeight: 300,
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInitial: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  contactDetail: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  contactRelationship: {
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
  },
  formContainer: {
    gap: 16,
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
  roleOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  roleText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Medium',
  },
  selectedRoleText: {
    color: '#3B82F6',
  },
  reviewSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  reviewTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
