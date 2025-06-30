import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';

interface TherapeuticCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'supportive' | 'calming' | 'growth' | 'reflection';
  elevation?: 'none' | 'subtle' | 'medium' | 'high';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large' | 'xl';
  useGradient?: boolean;
  darkMode?: boolean;
}

/**
 * Therapeutic Card Component
 * 
 * A calming, supportive card component designed for mental health applications.
 * Provides gentle shadows, therapeutic colors, and accessibility features.
 */
export default function TherapeuticCard({
  children,
  style,
  variant = 'default',
  elevation = 'subtle',
  padding = 'medium',
  borderRadius = 'medium',
  useGradient = false,
  darkMode = false,
}: TherapeuticCardProps) {
  
  const getBackgroundColor = () => {
    if (darkMode) {
      switch (variant) {
        case 'supportive': return Colors.secondary[800];
        case 'calming': return Colors.primary[800];
        case 'growth': return Colors.emotion.grounded;
        case 'reflection': return Colors.secondary[700];
        default: return Colors.background.darkSecondary;
      }
    }
    
    switch (variant) {
      case 'supportive': return Colors.secondary[50];
      case 'calming': return Colors.primary[50];
      case 'growth': return Colors.emotion.calm;
      case 'reflection': return Colors.secondary[100];
      default: return Colors.background.primary;
    }
  };

  const getGradientColors = () => {
    if (darkMode) {
      return variant === 'supportive' 
        ? Colors.gradients.darkNurturing 
        : Colors.gradients.darkCalm;
    }
    
    switch (variant) {
      case 'supportive': return Colors.gradients.softPurple;
      case 'calming': return Colors.gradients.softBlue;
      case 'growth': return Colors.gradients.softGreen;
      case 'reflection': return Colors.gradients.softPurple;
      default: return [Colors.background.primary, Colors.background.secondary];
    }
  };

  const cardStyle = [
    styles.base,
    styles[`radius_${borderRadius}`],
    styles[`padding_${padding}`],
    styles[`elevation_${elevation}`],
    !useGradient && { backgroundColor: getBackgroundColor() },
    style,
  ];

  return (
    <View style={cardStyle}>
      {useGradient && (
        <LinearGradient
          colors={getGradientColors()}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  
  content: {
    position: 'relative',
    zIndex: 1,
  },

  // Border radius variants
  radius_small: {
    borderRadius: 8,
  },
  radius_medium: {
    borderRadius: 12,
  },
  radius_large: {
    borderRadius: 16,
  },
  radius_xl: {
    borderRadius: 20,
  },

  // Padding variants
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: Spacing.padding.sm,
  },
  padding_medium: {
    padding: Spacing.padding.md,
  },
  padding_large: {
    padding: Spacing.padding.lg,
  },

  // Elevation variants - gentle shadows for therapeutic feel
  elevation_none: {
    shadowOpacity: 0,
    elevation: 0,
  },
  elevation_subtle: {
    shadowColor: Colors.primary[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  elevation_medium: {
    shadowColor: Colors.primary[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  elevation_high: {
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
});
