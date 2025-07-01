import React, { useState, useRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInputProps,
} from 'react-native';
import { PlatformUtils, useResponsive } from '../../utils/platform';

interface CrossPlatformInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  errorStyle?: any;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

export default function CrossPlatformInput({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = 'default',
  size = 'medium',
  ...textInputProps
}: CrossPlatformInputProps) {
  const { spacing, fontSize, touchTargetSize } = useResponsive();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: touchTargetSize * 0.8,
          fontSize: fontSize(14),
          paddingHorizontal: spacing(12),
        };
      case 'large':
        return {
          height: touchTargetSize * 1.2,
          fontSize: fontSize(18),
          paddingHorizontal: spacing(20),
        };
      default:
        return {
          height: touchTargetSize,
          fontSize: fontSize(16),
          paddingHorizontal: spacing(16),
        };
    }
  };

  const getVariantStyles = () => {
    const baseStyle = {
      borderRadius: 8,
      borderWidth: 1,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: error ? '#EF4444' : isFocused ? '#3B82F6' : 'rgba(255, 255, 255, 0.2)',
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: error ? '#EF4444' : 'transparent',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: error ? '#EF4444' : isFocused ? '#3B82F6' : 'rgba(255, 255, 255, 0.2)',
        };
    }
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label,
          { fontSize: fontSize(14), marginBottom: spacing(8) },
          labelStyle
        ]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        sizeStyles,
        variantStyles,
        ...(PlatformUtils.isWeb ? [styles.webInputContainer] : []),
        inputStyle
      ]}>
        {leftIcon && (
          <View style={[styles.iconContainer, styles.leftIcon]}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              fontSize: sizeStyles.fontSize,
              paddingHorizontal: leftIcon || rightIcon ? spacing(8) : sizeStyles.paddingHorizontal,
            },
            PlatformUtils.isWeb && styles.webInput,
          ]}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            style={[styles.iconContainer, styles.rightIcon]}
            onPress={() => inputRef.current?.focus()}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[
          styles.error,
          { fontSize: fontSize(12), marginTop: spacing(4) },
          errorStyle
        ]}>
          {error}
        </Text>
      )}
    </View>
  );
}

// Cross-platform TextArea component
export function CrossPlatformTextArea({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  numberOfLines = 4,
  ...textInputProps
}: CrossPlatformInputProps & { numberOfLines?: number }) {
  const { spacing, fontSize } = useResponsive();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label,
          { fontSize: fontSize(14), marginBottom: spacing(8) },
          labelStyle
        ]}>
          {label}
        </Text>
      )}
      
      <TextInput
        style={[
          styles.textArea,
          {
            fontSize: fontSize(16),
            padding: spacing(16),
            minHeight: numberOfLines * 24,
            borderColor: error ? '#EF4444' : isFocused ? '#3B82F6' : 'rgba(255, 255, 255, 0.2)',
          },
          PlatformUtils.isWeb && styles.webTextArea,
          inputStyle
        ]}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...textInputProps}
      />
      
      {error && (
        <Text style={[
          styles.error,
          { fontSize: fontSize(12), marginTop: spacing(4) },
          errorStyle
        ]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  webInputContainer: {
    // Web-specific input container styles
    cursor: 'text' as any,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    // Remove default outline on web
    ...(PlatformUtils.isWeb && {
      outlineStyle: 'none',
    }),
  },
  webInput: {
    // Web-specific input styles
    outlineStyle: 'none' as any,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    // Remove default outline on web
    ...(PlatformUtils.isWeb && {
      outlineStyle: 'none' as any,
      resize: 'vertical' as any,
    }),
  },
  webTextArea: {
    // Web-specific textarea styles
    outlineStyle: 'none' as any,
    resize: 'vertical' as any,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  leftIcon: {
    paddingLeft: 16,
  },
  rightIcon: {
    paddingRight: 16,
  },
  error: {
    color: '#EF4444',
    fontFamily: 'Inter-Regular',
  },
});
