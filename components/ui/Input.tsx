import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  style,
  inputStyle,
  required = false,
  leftIcon,
  rightIcon,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
  ];

  const textInputStyle = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    inputStyle,
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={textInputStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={Colors.text.tertiary}
          {...textInputProps}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  
  label: {
    ...Typography.styles.label,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  required: {
    color: Colors.error,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: 12,
    backgroundColor: Colors.background.primary,
    minHeight: Spacing.component.touchTarget,
  },
  
  inputContainerFocused: {
    borderColor: Colors.primary[500],
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  inputContainerError: {
    borderColor: Colors.error,
  },
  
  input: {
    flex: 1,
    paddingVertical: Spacing.component.inputPaddingVertical,
    paddingHorizontal: Spacing.component.inputPaddingHorizontal,
    ...Typography.styles.input,
    color: Colors.text.primary,
  },
  
  inputWithLeftIcon: {
    paddingLeft: Spacing.sm,
  },
  
  inputWithRightIcon: {
    paddingRight: Spacing.sm,
  },
  
  leftIcon: {
    paddingLeft: Spacing.component.inputPaddingHorizontal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  rightIcon: {
    paddingRight: Spacing.component.inputPaddingHorizontal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  error: {
    ...Typography.styles.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  
  hint: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
});
