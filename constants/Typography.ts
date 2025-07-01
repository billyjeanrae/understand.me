/**
 * Therapeutic Typography System for Mental Health & Conflict Resolution
 *
 * Designed for maximum readability and emotional comfort for users in distress.
 * Optimized for both web and mobile platforms with accessibility as a priority.
 * Uses calming, readable fonts with generous spacing to reduce cognitive load.
 */

export const Typography = {
  // Font families - calming and highly readable
  fonts: {
    // Primary font stack for therapeutic readability
    primary: 'Inter-Regular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    primaryBold: 'Inter-Bold, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    primarySemiBold: 'Inter-SemiBold, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    primaryMedium: 'Inter-Medium, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    primaryLight: 'Inter-Light, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

    // Therapeutic reading font for longer content
    reading: 'Georgia, "Times New Roman", serif', // Serif for better reading comprehension

    // Monospace for technical content (if needed)
    mono: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
  },

  // Font sizes - larger for accessibility and emotional comfort
  sizes: {
    xs: 13,    // Increased from 12 for better readability
    sm: 15,    // Increased from 14
    base: 17,  // Increased from 16 - more comfortable reading
    lg: 19,    // Increased from 18
    xl: 22,    // Increased from 20
    '2xl': 26, // Increased from 24
    '3xl': 32, // Increased from 30
    '4xl': 40, // Increased from 36
    '5xl': 52, // Increased from 48
    '6xl': 64, // Increased from 60
  },

  // Line heights - generous for therapeutic reading
  lineHeights: {
    tight: 1.3,     // Increased minimum for readability
    normal: 1.6,    // Increased from 1.5 for comfort
    relaxed: 1.8,   // Increased for therapeutic content
    loose: 2.1,     // Increased for maximum comfort
    therapeutic: 1.7, // Special line height for therapeutic content
  },

  // Letter spacing - optimized for calm reading
  letterSpacing: {
    tight: -0.015,  // Less tight to avoid stress
    normal: 0,
    wide: 0.02,     // Slightly wider for calm feeling
    wider: 0.04,    // For emphasis without boldness
    therapeutic: 0.01, // Subtle spacing for therapeutic content
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
