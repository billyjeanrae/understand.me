import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ScreenLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: string[];
  useSafeArea?: boolean;
  backgroundColor?: string;
}

/**
 * Shared layout component to reduce code duplication across screens
 * Provides consistent gradient background and SafeAreaView setup
 */
export default function ScreenLayout({
  children,
  style,
  gradientColors = ['#0F172A', '#1E293B'],
  useSafeArea = true,
  backgroundColor,
}: ScreenLayoutProps) {
  const Container = useSafeArea ? SafeAreaView : View;
  
  return (
    <Container style={[styles.container, style]}>
      {backgroundColor ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
      ) : (
        <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
      )}
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
