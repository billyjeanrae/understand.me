/**
 * Digital Signoff Component
 * Handles digital agreement signing with multiple signature methods
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  PenTool,
  Type,
  Check,
  X,
  FileText,
  Clock,
  User,
  Shield,
  Download
} from 'lucide-react-native';

import { 
  DigitalAgreement, 
  DigitalSignature, 
  AgreementParticipant 
} from '../../services/agreements/digitalSignoffService';

interface DigitalSignoffProps {
  agreement: DigitalAgreement;
  participant: AgreementParticipant;
  onSign: (signature: DigitalSignature) => void;
  onCancel: () => void;
  onExport?: () => void;
}

type SignatureMethod = 'typed' | 'drawn';

const { width: screenWidth } = Dimensions.get('window');

export default function DigitalSignoff({
  agreement,
  participant,
  onSign,
  onCancel,
  onExport
}: DigitalSignoffProps) {
  const [signatureMethod, setSignatureMethod] = useState<SignatureMethod>('typed');
  const [typedName, setTypedName] = useState('');
  const [drawnSignature, setDrawnSignature] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [allPaths, setAllPaths] = useState<string[]>([]);
  
  const drawingRef = useRef<any>(null);

  const handleSign = () => {
    if (signatureMethod === 'typed' && !typedName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (signatureMethod === 'drawn' && allPaths.length === 0) {
      Alert.alert('Error', 'Please draw your signature');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSignature = () => {
    const signature: DigitalSignature = {
      type: signatureMethod,
      data: signatureMethod === 'typed' ? typedName.trim() : generateSignatureData(),
      timestamp: new Date(),
      deviceInfo: 'Mobile Device' // In production, get actual device info
    };

    onSign(signature);
    setShowConfirmation(false);
  };

  const generateSignatureData = (): string => {
    // Convert SVG paths to base64 data URL
    const svgContent = `
      <svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
        ${allPaths.map(path => `<path d="${path}" stroke="#000" stroke-width="2" fill="none"/>`).join('')}
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  const clearSignature = () => {
    setAllPaths([]);
    setCurrentPath('');
    setDrawnSignature('');
  };

  const handleTouchStart = (event: any) => {
    if (signatureMethod !== 'drawn') return;
    
    setIsDrawing(true);
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath(`M${locationX},${locationY}`);
  };

  const handleTouchMove = (event: any) => {
    if (!isDrawing || signatureMethod !== 'drawn') return;
    
    const { locationX, locationY } = event.nativeEvent;
    setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
  };

  const handleTouchEnd = () => {
    if (!isDrawing || signatureMethod !== 'drawn') return;
    
    setIsDrawing(false);
    if (currentPath) {
      setAllPaths(prev => [...prev, currentPath]);
      setCurrentPath('');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = agreement.expiresAt && new Date() > agreement.expiresAt;
  const canSign = !isExpired && agreement.status !== 'signed' && !participant.signedAt;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Digital Agreement</Text>
            <Text style={styles.subtitle}>{agreement.title}</Text>
          </View>
          
          <View style={styles.headerActions}>
            {onExport && (
              <Pressable style={styles.actionButton} onPress={onExport}>
                <Download size={18} color="#94A3B8" />
              </Pressable>
            )}
            <Pressable style={styles.actionButton} onPress={onCancel}>
              <X size={18} color="#94A3B8" />
            </Pressable>
          </View>
        </View>

        {/* Status Banner */}
        {isExpired && (
          <View style={styles.expiredBanner}>
            <Clock size={16} color="#EF4444" />
            <Text style={styles.expiredText}>This agreement has expired</Text>
          </View>
        )}

        {participant.signedAt && (
          <View style={styles.signedBanner}>
            <Check size={16} color="#10B981" />
            <Text style={styles.signedText}>
              Signed on {formatDate(participant.signedAt)}
            </Text>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Agreement Content */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={18} color="#E2E8F0" />
              <Text style={styles.sectionTitle}>Agreement Details</Text>
            </View>
            
            <View style={styles.agreementCard}>
              <Text style={styles.agreementContent}>{agreement.content}</Text>
              
              {agreement.terms.length > 0 && (
                <View style={styles.termsSection}>
                  <Text style={styles.termsTitle}>Terms & Commitments:</Text>
                  {agreement.terms.map((term, index) => (
                    <View key={term.id} style={styles.termItem}>
                      <Text style={styles.termNumber}>{index + 1}</Text>
                      <Text style={styles.termText}>{term.description}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Participant Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={18} color="#E2E8F0" />
              <Text style={styles.sectionTitle}>Participant Information</Text>
            </View>
            
            <View style={styles.participantCard}>
              <Text style={styles.participantName}>{participant.name}</Text>
              <Text style={styles.participantRole}>Role: {participant.role}</Text>
              {participant.email && (
                <Text style={styles.participantEmail}>{participant.email}</Text>
              )}
            </View>
          </View>

          {/* Signature Section */}
          {canSign && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Shield size={18} color="#E2E8F0" />
                <Text style={styles.sectionTitle}>Digital Signature</Text>
              </View>

              {/* Signature Method Selection */}
              <View style={styles.methodSelector}>
                <Pressable
                  style={[
                    styles.methodButton,
                    signatureMethod === 'typed' && styles.methodButtonActive
                  ]}
                  onPress={() => setSignatureMethod('typed')}
                >
                  <Type size={16} color={signatureMethod === 'typed' ? '#FFFFFF' : '#94A3B8'} />
                  <Text style={[
                    styles.methodText,
                    signatureMethod === 'typed' && styles.methodTextActive
                  ]}>
                    Type Name
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.methodButton,
                    signatureMethod === 'drawn' && styles.methodButtonActive
                  ]}
                  onPress={() => setSignatureMethod('drawn')}
                >
                  <PenTool size={16} color={signatureMethod === 'drawn' ? '#FFFFFF' : '#94A3B8'} />
                  <Text style={[
                    styles.methodText,
                    signatureMethod === 'drawn' && styles.methodTextActive
                  ]}>
                    Draw Signature
                  </Text>
                </Pressable>
              </View>

              {/* Signature Input */}
              {signatureMethod === 'typed' ? (
                <View style={styles.typedSignatureContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={typedName}
                    onChangeText={setTypedName}
                    placeholder="Enter your full legal name"
                    placeholderTextColor="#64748B"
                  />
                  {typedName.trim() && (
                    <View style={styles.signaturePreview}>
                      <Text style={styles.signaturePreviewText}>{typedName}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.drawnSignatureContainer}>
                  <View
                    style={styles.signatureCanvas}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <Svg width="100%" height="150">
                      {allPaths.map((path, index) => (
                        <Path
                          key={index}
                          d={path}
                          stroke="#E2E8F0"
                          strokeWidth="2"
                          fill="none"
                        />
                      ))}
                      {currentPath && (
                        <Path
                          d={currentPath}
                          stroke="#3B82F6"
                          strokeWidth="2"
                          fill="none"
                        />
                      )}
                    </Svg>
                    
                    {allPaths.length === 0 && (
                      <View style={styles.canvasPlaceholder}>
                        <PenTool size={24} color="#64748B" />
                        <Text style={styles.canvasPlaceholderText}>
                          Draw your signature here
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Pressable style={styles.clearButton} onPress={clearSignature}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </Pressable>
                </View>
              )}

              {/* Legal Notice */}
              <View style={styles.legalNotice}>
                <Text style={styles.legalText}>
                  By signing this agreement, you acknowledge that you have read, understood, 
                  and agree to be bound by all terms and conditions outlined above.
                </Text>
              </View>

              {/* Sign Button */}
              <Pressable
                style={[
                  styles.signButton,
                  (!typedName.trim() && signatureMethod === 'typed') ||
                  (allPaths.length === 0 && signatureMethod === 'drawn')
                    ? styles.signButtonDisabled
                    : null
                ]}
                onPress={handleSign}
                disabled={
                  (!typedName.trim() && signatureMethod === 'typed') ||
                  (allPaths.length === 0 && signatureMethod === 'drawn')
                }
              >
                <Check size={20} color="#FFFFFF" />
                <Text style={styles.signButtonText}>Sign Agreement</Text>
              </Pressable>
            </View>
          )}

          {/* Agreement Metadata */}
          <View style={styles.section}>
            <View style={styles.metadataCard}>
              <Text style={styles.metadataTitle}>Agreement Information</Text>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Created:</Text>
                <Text style={styles.metadataValue}>{formatDate(agreement.createdAt)}</Text>
              </View>
              {agreement.expiresAt && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Expires:</Text>
                  <Text style={[
                    styles.metadataValue,
                    isExpired && styles.expiredValue
                  ]}>
                    {formatDate(agreement.expiresAt)}
                  </Text>
                </View>
              )}
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Status:</Text>
                <Text style={[
                  styles.metadataValue,
                  (styles as any)[`status${agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}`]
                ]}>
                  {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmation}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmation(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmationModal}>
              <Text style={styles.confirmationTitle}>Confirm Signature</Text>
              <Text style={styles.confirmationText}>
                Are you sure you want to sign this agreement? This action cannot be undone.
              </Text>
              
              <View style={styles.confirmationButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowConfirmation(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                
                <Pressable
                  style={styles.confirmButton}
                  onPress={confirmSignature}
                >
                  <Text style={styles.confirmButtonText}>Sign Agreement</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
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
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  expiredText: {
    color: '#FEF2F2',
    fontSize: 14,
    fontWeight: '500',
  },
  signedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  signedText: {
    color: '#D1FAE5',
    fontSize: 14,
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
  agreementCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  agreementContent: {
    fontSize: 16,
    color: '#CBD5E1',
    lineHeight: 24,
    marginBottom: 16,
  },
  termsSection: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  termNumber: {
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
  termText: {
    flex: 1,
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  participantCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  participantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  participantRole: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 14,
    color: '#94A3B8',
  },
  methodSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  methodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  methodText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  methodTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  typedSignatureContainer: {
    marginBottom: 16,
  },
  nameInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#334155',
  },
  signaturePreview: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  signaturePreviewText: {
    fontSize: 24,
    color: '#E2E8F0',
    fontFamily: 'cursive',
    textAlign: 'center',
  },
  drawnSignatureContainer: {
    marginBottom: 16,
  },
  signatureCanvas: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    height: 150,
    position: 'relative',
  },
  canvasPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  canvasPlaceholderText: {
    fontSize: 14,
    color: '#64748B',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#374151',
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  legalNotice: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  legalText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  signButtonDisabled: {
    backgroundColor: '#374151',
  },
  signButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metadataCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  metadataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  metadataValue: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  expiredValue: {
    color: '#EF4444',
  },
  statusDraft: {
    color: '#F59E0B',
  },
  statusPending: {
    color: '#3B82F6',
  },
  statusSigned: {
    color: '#10B981',
  },
  statusExpired: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmationModal: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
