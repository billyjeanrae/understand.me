import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive } from '../../utils/platform';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number | 'mobile' | 'tablet' | 'desktop';
  padding?: boolean;
  centered?: boolean;
}

/**
 * Responsive container that adapts to different screen sizes
 * Provides consistent layout across mobile and web platforms
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  maxWidth = 'desktop',
  padding = true,
  centered = true,
}) => {
  const { breakpoint, isWeb, layoutStyle, spacing } = useResponsive();

  const getMaxWidth = () => {
    if (typeof maxWidth === 'number') return maxWidth;
    
    switch (maxWidth) {
      case 'mobile':
        return '100%';
      case 'tablet':
        return 768;
      case 'desktop':
        return 1200;
      default:
        return 1200;
    }
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    width: '100%',
    ...(isWeb && {
      maxWidth: getMaxWidth(),
      ...(centered && { alignSelf: 'center' }),
    }),
    ...(padding && {
      paddingHorizontal: spacing(20),
    }),
    ...style,
  };

  return <View style={containerStyle}>{children}</View>;
};

/**
 * Grid container for responsive layouts
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  style?: ViewStyle;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
  style,
}) => {
  const { breakpoint, spacing } = useResponsive();

  const getColumns = () => {
    switch (breakpoint) {
      case 'mobile':
        return columns.mobile || 1;
      case 'tablet':
        return columns.tablet || 2;
      case 'desktop':
      case 'largeDesktop':
        return columns.desktop || 3;
      default:
        return 1;
    }
  };

  const numColumns = getColumns();
  const adjustedGap = spacing(gap);

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -adjustedGap / 2,
    ...style,
  };

  const itemStyle: ViewStyle = {
    width: `${100 / numColumns}%`,
    paddingHorizontal: adjustedGap / 2,
    marginBottom: adjustedGap,
  };

  return (
    <View style={gridStyle}>
      {React.Children.map(children, (child, index) => (
        <View key={index} style={itemStyle}>
          {child}
        </View>
      ))}
    </View>
  );
};

/**
 * Responsive card component
 */
interface ResponsiveCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
  shadow?: boolean;
  elevation?: number;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  style,
  padding = true,
  shadow = true,
  elevation = 4,
}) => {
  const { spacing, shadowStyle } = useResponsive();

  const cardStyle: ViewStyle = {
    backgroundColor: '#fff',
    borderRadius: 12,
    ...(padding && {
      padding: spacing(16),
    }),
    ...(shadow && shadowStyle(elevation)),
    ...style,
  };

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});
