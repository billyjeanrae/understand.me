import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
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
  testID?: string;
}

const TherapeuticCard: React.FC<TherapeuticCardProps> = ({
  children,
  style,
  variant = 'default',
  elevation = 'medium',
  padding = 'medium',
  borderRadius = 'medium',
  useGradient = false,
  darkMode = true,
  testID,
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'supportive':
        return useGradient 
          ? ['#10B981', '#059669'] 
          : darkMode ? '#065F46' : '#D1FAE5';
      case 'calming':
        return useGradient 
          ? ['#3B82F6', '#2563EB'] 
          : darkMode ? '#1E3A8A' : '#DBEAFE';
      case 'growth':
        return useGradient 
          ? ['#8B5CF6', '#7C3AED'] 
          : darkMode ? '#5B21B6' : '#EDE9FE';
      case 'reflection':
        return useGradient 
          ? ['#F59E0B', '#D97706'] 
          : darkMode ? '#92400E' : '#FEF3C7';
      default:
        return useGradient 
          ? ['#1F2937', '#374151'] 
          : darkMode ? '#1F2937' : '#F9FAFB';
    }
  };

  const getElevationStyle = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'subtle':
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        };
      case 'medium':
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'high':
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
        };
      default:
        return {};
    }
  };

  const cardStyle = [
    styles.base,
    styles[padding],
    styles[borderRadius],
    getElevationStyle(),
    !useGradient && { backgroundColor: getVariantColors() as string },
    style,
  ];

  if (useGradient) {
    return (
      <View style={cardStyle} testID={testID}>
        <LinearGradient
          colors={getVariantColors() as string[]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {children}
      </View>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Padding variants
  none: {
    padding: 0,
  },
  small: {
    padding: Spacing.sm,
  },
  medium: {
    padding: Spacing.md,
  },
  large: {
    padding: Spacing.lg,
  },
  
  // Border radius variants
  small: {
    borderRadius: 8,
  },
  medium: {
    borderRadius: 12,
  },
  large: {
    borderRadius: 16,
  },
  xl: {
    borderRadius: 20,
  },
});

export default TherapeuticCard;
