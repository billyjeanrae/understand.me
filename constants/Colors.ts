/**
 * Color system designed for conflict resolution scenarios
 * Focuses on calming, trustworthy colors that promote emotional safety
 */

export const Colors = {
  // Primary brand colors - calming and trustworthy
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Secondary colors - warm and supportive
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },

  // Emotion-based colors for conflict resolution
  emotion: {
    // Positive emotions - greens
    positive: '#10b981',
    calm: '#059669',
    peaceful: '#047857',
    
    // Neutral emotions - blues/grays
    neutral: '#6b7280',
    balanced: '#4b5563',
    centered: '#374151',
    
    // Challenging emotions - warm oranges (not aggressive reds)
    tension: '#f59e0b',
    conflict: '#d97706',
    intense: '#b45309',
    
    // Alert/warning - soft reds
    alert: '#ef4444',
    warning: '#dc2626',
    critical: '#b91c1c',
  },

  // Conflict level indicators
  conflict: {
    low: '#10b981',      // Green - peaceful
    moderate: '#f59e0b',  // Amber - some tension
    high: '#ef4444',     // Red - needs attention
    resolved: '#8b5cf6', // Purple - resolution achieved
  },

  // UI colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    dark: '#0f172a',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  text: {
    primary: '#1e293b',
    secondary: '#475569',
    tertiary: '#64748b',
    inverse: '#ffffff',
    muted: '#94a3b8',
  },

  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
  },

  // Voice interaction states
  voice: {
    listening: '#10b981',
    speaking: '#3b82f6',
    processing: '#f59e0b',
    inactive: '#6b7280',
    error: '#ef4444',
  },

  // Success/error states
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Gradients for backgrounds
  gradients: {
    primary: ['#4ECDC4', '#44A08D', '#45B7D1'],
    calm: ['#a8edea', '#fed6e3'],
    peaceful: ['#d299c2', '#fef9d7'],
    supportive: ['#89f7fe', '#66a6ff'],
  },
} as const;

export type ColorKey = keyof typeof Colors;
export type ColorValue = typeof Colors[ColorKey];
