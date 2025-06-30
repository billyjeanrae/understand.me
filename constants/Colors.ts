/**
 * Therapeutic Color System for Mental Health & Conflict Resolution
 *
 * A color palette designed specifically for mental health applications,
 * focusing on emotional safety, calm, and support for users in distress.
 * Optimized for both web and mobile platforms with accessibility in mind.
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

  // Secondary colors - nurturing purples for emotional support
  secondary: {
    50: '#faf5ff',  // Lightest - for gentle backgrounds
    100: '#f3e8ff', // Very light - for hover states
    200: '#e9d5ff', // Light - for secondary elements
    300: '#d8b4fe', // Medium light - for accents
    400: '#c084fc', // Medium - for supportive elements
    500: '#a855f7', // Main secondary - for emotional support
    600: '#9333ea', // Medium dark - for hover states
    700: '#7e22ce', // Dark - for emphasis
    800: '#6b21a8', // Very dark - for strong contrast
    900: '#581c87', // Darkest - for deep emphasis
  },

  // Therapeutic emotion indicators - carefully chosen for psychological impact
  emotion: {
    // Positive emotions - greens for growth and healing
    calm: '#10b981',      // Emerald - peaceful, balanced
    growth: '#059669',     // Green - progress, healing
    grounded: '#047857',   // Deep green - stability, safety
    healing: '#065f46',    // Forest green - deep healing

    // Neutral emotions - soft blues/lavenders for reflection
    neutral: '#6b7280',    // Gray - balanced
    reflective: '#8b5cf6', // Purple - introspective
    mindful: '#4b5563',    // Dark gray - present, attentive
    processing: '#6366f1', // Indigo - working through thoughts

    // Challenging emotions - warm, supportive (not alarming)
    tension: '#f59e0b',    // Amber - awareness, not crisis
    struggle: '#d97706',   // Orange - challenge, not danger
    working: '#b45309',    // Deep orange - actively processing
    support: '#ef4444',    // Soft red - attention without alarm
  },

  // Conflict resolution journey stages
  resolution: {
    beginning: '#0ea5e9',  // Blue - starting the process
    exploring: '#8b5cf6',  // Purple - working through
    breakthrough: '#10b981', // Green - making progress
    integration: '#f59e0b', // Amber - completion, warmth
    resolved: '#059669',   // Deep green - successful resolution
  },

  // Voice interaction states - for audio features
  voice: {
    listening: '#10b981',  // Green - active listening
    speaking: '#0ea5e9',   // Blue - calm communication
    processing: '#8b5cf6', // Purple - thoughtful processing
    inactive: '#94a3b8',   // Gray - peaceful rest
    error: '#f59e0b',      // Amber - gentle alert (not red)
  },

  // Therapeutic session states
  session: {
    preparation: '#e0f2fe', // Light blue - getting ready
    active: '#0ea5e9',      // Blue - in session
    reflection: '#a855f7',  // Purple - processing
    completion: '#10b981',  // Green - finished successfully
    paused: '#f59e0b',      // Amber - temporarily stopped
  },

  // UI background colors - soft, non-stimulating
  background: {
    primary: '#ffffff',    // Pure white - clean, open
    secondary: '#f8fafc',  // Off-white - gentle, soft
    tertiary: '#f1f5f9',   // Light gray - calming, neutral
    quaternary: '#e2e8f0', // Slightly darker - subtle definition
    dark: '#1e293b',       // Deep blue-gray - soothing dark mode
    darkSecondary: '#334155', // Lighter dark - for cards in dark mode
    overlay: 'rgba(15, 23, 42, 0.4)', // Softer overlay for modals
    glass: 'rgba(248, 250, 252, 0.8)', // Glass effect for modern UI
  },

  // Text colors - high readability, low strain
  text: {
    primary: '#334155',    // Dark blue-gray - gentle on eyes
    secondary: '#64748b',  // Medium blue-gray - supportive
    tertiary: '#94a3b8',   // Light blue-gray - non-distracting
    quaternary: '#cbd5e1', // Very light - for de-emphasized text
    inverse: '#f8fafc',    // Off-white - for dark backgrounds
    darkPrimary: '#f1f5f9', // Light text for dark mode
    darkSecondary: '#cbd5e1', // Medium light for dark mode
  },

  // Border colors - subtle definition without harshness
  border: {
    light: '#e2e8f0',      // Very light - subtle separation
    medium: '#cbd5e1',     // Light - gentle definition
    dark: '#94a3b8',       // Medium - stronger definition
    focus: '#0ea5e9',      // Blue - for focused elements
    therapeutic: '#a855f7', // Purple - for therapeutic elements
  },

  // Feedback states - emotionally considerate
  success: '#10b981',      // Green - achievement without overwhelming
  error: '#f59e0b',        // Amber - concern without alarm (not harsh red)
  warning: '#d97706',      // Orange - attention without stress
  info: '#0ea5e9',         // Blue - information with calm
  guidance: '#a855f7',     // Purple - supportive direction

  // Therapeutic gradients - for backgrounds and cards
  gradients: {
    // Calming gradients for main backgrounds
    calm: ['#e0f2fe', '#bae6fd', '#7dd3fc'],     // Blue gradient - serenity
    nurturing: ['#faf5ff', '#e9d5ff', '#d8b4fe'], // Purple gradient - support
    growth: ['#ecfdf5', '#d1fae5', '#a7f3d0'],   // Green gradient - progress
    warmth: ['#fff7ed', '#fed7aa', '#fdba74'],   // Orange gradient - comfort
    sunrise: ['#fef3c7', '#fde68a', '#fcd34d'],  // Yellow gradient - hope

    // Subtle gradients for cards and components
    softBlue: ['#f0f9ff', '#e0f2fe'],           // Very subtle blue
    softPurple: ['#faf5ff', '#f3e8ff'],         // Very subtle purple
    softGreen: ['#f0fdf4', '#dcfce7'],          // Very subtle green

    // Dark mode gradients
    darkCalm: ['#1e293b', '#334155'],           // Dark blue gradient
    darkNurturing: ['#581c87', '#6b21a8'],      // Dark purple gradient
  },
} as const;

export type ColorKey = keyof typeof Colors;
export type ColorValue = typeof Colors[ColorKey];
