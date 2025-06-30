import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: boolean;
  border?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'medium',
  shadow = true,
  border = false,
}) => {
  const cardStyle = [
    styles.base,
    styles[padding],
    shadow && styles.shadow,
    border && styles.border,
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
  },
  
  // Padding variants
  none: {
    padding: 0,
  },
  small: {
    padding: Spacing.sm,
  },
  medium: {
    padding: Spacing.component.cardPadding,
  },
  large: {
    padding: Spacing.component.cardPaddingLarge,
  },
  
  // Shadow
  shadow: {
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Border
  border: {
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
});
