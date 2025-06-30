import React from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';

const { width: screenWidth } = Dimensions.get('window');

export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
  safeArea?: boolean;
  maxWidth?: number;
  centered?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  style,
  padding = true,
  safeArea = true,
  maxWidth,
  centered = false,
}) => {
  const insets = useSafeAreaInsets();
  
  const isTablet = screenWidth >= Spacing.breakpoints.tablet;
  const isDesktop = screenWidth >= Spacing.breakpoints.desktop;
  
  const containerStyle = [
    styles.container,
    safeArea && {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    padding && (isDesktop ? styles.desktopPadding : styles.mobilePadding),
    maxWidth && { maxWidth },
    centered && styles.centered,
    style,
  ];

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  
  mobilePadding: {
    paddingHorizontal: Spacing.component.screenPadding,
  },
  
  desktopPadding: {
    paddingHorizontal: Spacing.component.screenPaddingLarge,
  },
  
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
