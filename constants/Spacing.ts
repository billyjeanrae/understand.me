/**
 * Spacing system for consistent layout and comfortable touch targets
 * Optimized for both mobile and web interfaces
 */

export const Spacing = {
  // Base spacing units
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128,

  // Component-specific spacing
  component: {
    // Touch targets - minimum 44px for accessibility
    touchTarget: 44,
    touchTargetLarge: 56,
    
    // Buttons
    buttonPaddingVertical: 12,
    buttonPaddingHorizontal: 24,
    buttonPaddingVerticalLarge: 16,
    buttonPaddingHorizontalLarge: 32,
    buttonPaddingVerticalSmall: 8,
    buttonPaddingHorizontalSmall: 16,
    
    // Input fields
    inputPaddingVertical: 12,
    inputPaddingHorizontal: 16,
    
    // Cards and containers
    cardPadding: 16,
    cardPaddingLarge: 24,
    cardMargin: 16,
    
    // Screen margins
    screenPadding: 20,
    screenPaddingLarge: 32,
    
    // Voice interface - larger spacing for emotional comfort
    voiceButtonSize: 120,
    voiceButtonMargin: 32,
    
    // Session interface spacing
    sessionPadding: 24,
    emotionIndicatorSpacing: 12,
    conflictMeterSize: 80,
  },

  // Layout spacing
  layout: {
    // Section spacing
    sectionSpacing: 32,
    sectionSpacingLarge: 48,
    
    // Content spacing
    contentSpacing: 16,
    contentSpacingLarge: 24,
    
    // List item spacing
    listItemSpacing: 12,
    listItemSpacingLarge: 16,
    
    // Navigation
    navItemSpacing: 8,
    navSectionSpacing: 24,
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    largeDesktop: 1440,
  },
} as const;

export type SpacingKey = keyof typeof Spacing;
export type SpacingValue = typeof Spacing[SpacingKey];
