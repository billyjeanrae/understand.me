import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlatformUtils } from '../../utils/platform';

interface CrossPlatformModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  title?: string;
}

export default function CrossPlatformModal({
  visible,
  onClose,
  children,
  animationType = 'slide',
  presentationStyle = 'pageSheet',
  showCloseButton = true,
  closeOnBackdropPress = true,
  title,
}: CrossPlatformModalProps) {
  const isWeb = PlatformUtils.isWeb;
  const isMobile = PlatformUtils.isMobile;

  // Web-specific modal implementation
  if (isWeb) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType={animationType === 'slide' ? 'fade' : animationType}
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView style={styles.webModalOverlay} behavior="padding">
          <Pressable
            style={styles.webModalBackdrop}
            onPress={closeOnBackdropPress ? onClose : undefined}
          >
            <Pressable
              style={[styles.webModalContent, PlatformUtils.getShadowStyle(8)]}
              onPress={(e) => e.stopPropagation()}
            >
              <SafeAreaView style={styles.modalInner}>
                {children}
              </SafeAreaView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // Mobile-specific modal implementation
  return (
    <Modal
      visible={visible}
      animationType={animationType}
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.mobileModalContainer}>
        <KeyboardAvoidingView
          style={styles.mobileModalContent}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {children}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// Cross-platform bottom sheet modal
export function CrossPlatformBottomSheet({
  visible,
  onClose,
  children,
  closeOnBackdropPress = true,
}: Omit<CrossPlatformModalProps, 'animationType' | 'presentationStyle'>) {
  const isWeb = PlatformUtils.isWeb;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.bottomSheetOverlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          style={styles.bottomSheetBackdrop}
          onPress={closeOnBackdropPress ? onClose : undefined}
        >
          <Pressable
            style={[
              styles.bottomSheetContent,
              isWeb && styles.webBottomSheetContent,
              PlatformUtils.getShadowStyle(12)
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar for mobile */}
            {!isWeb && (
              <View style={styles.bottomSheetHandle} />
            )}
            <SafeAreaView edges={['bottom']} style={styles.bottomSheetInner}>
              {children}
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Web Modal Styles
  webModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webModalBackdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webModalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    maxWidth: 600,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  
  // Mobile Modal Styles
  mobileModalContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  mobileModalContent: {
    flex: 1,
  },
  
  // Common Modal Styles
  modalInner: {
    flex: 1,
  },
  
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
    maxHeight: '80%',
  },
  webBottomSheetContent: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    maxWidth: 500,
    alignSelf: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  bottomSheetInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
