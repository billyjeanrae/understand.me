/**
 * Typography system optimized for conflict resolution scenarios
 * Focuses on readability during emotional situations
 */

export const Typography = {
  // Font families
  fonts: {
    primary: 'Inter-Regular',
    primaryBold: 'Inter-Bold',
    primarySemiBold: 'Inter-SemiBold',
    primaryMedium: 'Inter-Medium',
    primaryLight: 'Inter-Light',
  },

  // Font sizes - optimized for emotional readability
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // Line heights for better readability
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
  },

  // Text styles for specific use cases
  styles: {
    // Headers
    h1: {
      fontSize: 36,
      fontFamily: 'Inter-Bold',
      lineHeight: 1.25,
      letterSpacing: -0.025,
    },
    h2: {
      fontSize: 30,
      fontFamily: 'Inter-Bold',
      lineHeight: 1.25,
      letterSpacing: -0.025,
    },
    h3: {
      fontSize: 24,
      fontFamily: 'Inter-SemiBold',
      lineHeight: 1.25,
    },
    h4: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      lineHeight: 1.25,
    },
    h5: {
      fontSize: 18,
      fontFamily: 'Inter-Medium',
      lineHeight: 1.25,
    },
    h6: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      lineHeight: 1.25,
    },

    // Body text - optimized for emotional readability
    body: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      lineHeight: 1.5,
    },
    bodyLarge: {
      fontSize: 18,
      fontFamily: 'Inter-Regular',
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      lineHeight: 1.5,
    },

    // UI text
    button: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      lineHeight: 1.25,
      letterSpacing: 0.025,
    },
    buttonLarge: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      lineHeight: 1.25,
      letterSpacing: 0.025,
    },
    buttonSmall: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      lineHeight: 1.25,
      letterSpacing: 0.025,
    },

    // Form elements
    input: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      lineHeight: 1.25,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      lineHeight: 1.25,
    },
    placeholder: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      lineHeight: 1.25,
    },

    // Navigation
    navItem: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      lineHeight: 1.25,
    },
    navTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      lineHeight: 1.25,
    },

    // Session-specific text
    transcription: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      lineHeight: 1.75, // Extra spacing for readability during emotional moments
    },
    emotionLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      lineHeight: 1.25,
      letterSpacing: 0.025,
    },
    conflictLevel: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      lineHeight: 1.25,
    },

    // Analytics and data
    metric: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      lineHeight: 1.25,
    },
    metricLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      lineHeight: 1.25,
      letterSpacing: 0.025,
    },

    // Captions and small text
    caption: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      lineHeight: 1.25,
    },
    overline: {
      fontSize: 10,
      fontFamily: 'Inter-Medium',
      lineHeight: 1.25,
      letterSpacing: 0.05,
      textTransform: 'uppercase' as const,
    },
  },
} as const;

export type TypographyStyle = keyof typeof Typography.styles;
export type FontSize = keyof typeof Typography.sizes;
