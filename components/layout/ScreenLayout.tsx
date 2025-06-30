import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ViewStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'calm' | 'nurturing' | 'growth' | 'warmth' | 'sunrise' | 'softBlue' | 'softPurple' | 'softGreen';
  useSafeArea?: boolean;
  backgroundColor?: string;
  darkMode?: boolean;
}

/**
 * Therapeutic Screen Layout Component
 *
 * Provides a calming, supportive environment with therapeutic color gradients
 * optimized for mental health applications. Works seamlessly on web and mobile.
 */
export default function ScreenLayout({
  children,
  style,
  variant = 'calm',
  useSafeArea = true,
  backgroundColor,
  darkMode = false,
}: ScreenLayoutProps) {
  const Container = useSafeArea ? SafeAreaView : View;

  // Select therapeutic gradient based on variant
  const getGradientColors = () => {
    if (backgroundColor) return [backgroundColor, backgroundColor];

    if (darkMode) {
      return variant === 'nurturing'
        ? Colors.gradients.darkNurturing
        : Colors.gradients.darkCalm;
    }

    return Colors.gradients[variant] || Colors.gradients.calm;
  };

  return (
    <Container style={[styles.container, style]}>
      <LinearGradient
        colors={getGradientColors()}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.content}>
        {children}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    paddingVertical: Platform.OS === 'web' ? 24 : 16,
  },
});
