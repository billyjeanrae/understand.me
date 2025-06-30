import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.text.inverse : Colors.primary[500]}
          size="small"
        />
      ) : (
        <Text style={textStyleCombined}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: Spacing.component.touchTarget,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary[500],
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  secondary: {
    backgroundColor: Colors.secondary[500],
    shadowColor: Colors.secondary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // Sizes
  small: {
    paddingVertical: Spacing.component.buttonPaddingVerticalSmall,
    paddingHorizontal: Spacing.component.buttonPaddingHorizontalSmall,
    minHeight: 36,
  },
  medium: {
    paddingVertical: Spacing.component.buttonPaddingVertical,
    paddingHorizontal: Spacing.component.buttonPaddingHorizontal,
  },
  large: {
    paddingVertical: Spacing.component.buttonPaddingVerticalLarge,
    paddingHorizontal: Spacing.component.buttonPaddingHorizontalLarge,
    minHeight: Spacing.component.touchTargetLarge,
  },

  // Text styles
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.text.inverse,
    ...Typography.styles.button,
  },
  secondaryText: {
    color: Colors.text.inverse,
    ...Typography.styles.button,
  },
  outlineText: {
    color: Colors.primary[500],
    ...Typography.styles.button,
  },
  ghostText: {
    color: Colors.primary[500],
    ...Typography.styles.button,
  },
  dangerText: {
    color: Colors.text.inverse,
    ...Typography.styles.button,
  },

  // Size-specific text
  smallText: {
    ...Typography.styles.buttonSmall,
  },
  mediumText: {
    ...Typography.styles.button,
  },
  largeText: {
    ...Typography.styles.buttonLarge,
  },

  // States
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    opacity: 0.7,
  },
  fullWidth: {
    width: '100%',
  },
});
