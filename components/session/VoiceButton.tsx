import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { Mic, MicOff, Loader } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';

export interface VoiceButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  disabled?: boolean;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isProcessing,
  disabled = false,
  onPress,
  size = 'large',
}) => {
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 60;
      case 'medium':
        return 80;
      case 'large':
        return Spacing.component.voiceButtonSize;
      default:
        return Spacing.component.voiceButtonSize;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 32;
      case 'large':
        return 48;
      default:
        return 48;
    }
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();

  const getButtonColor = () => {
    if (disabled) return Colors.voice.inactive;
    if (isProcessing) return Colors.voice.processing;
    if (isListening) return Colors.voice.listening;
    return Colors.voice.speaking;
  };

  const getIcon = () => {
    if (isProcessing) {
      return <Loader size={iconSize} color={Colors.text.inverse} />;
    }
    if (disabled) {
      return <MicOff size={iconSize} color={Colors.text.inverse} />;
    }
    return <Mic size={iconSize} color={Colors.text.inverse} />;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: getButtonColor(),
        },
        disabled && styles.disabled,
        isListening && styles.listening,
      ]}
      onPress={onPress}
      disabled={disabled || isProcessing}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      
      {isListening && (
        <View style={[styles.pulse, { width: buttonSize + 20, height: buttonSize + 20 }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  
  listening: {
    shadowColor: Colors.voice.listening,
    shadowOpacity: 0.4,
  },
  
  pulse: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: Colors.voice.listening,
    opacity: 0.3,
  },
});
