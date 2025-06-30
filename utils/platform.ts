import { Platform, Dimensions } from 'react-native';

/**
 * Platform utilities for responsive design and platform-specific behavior
 */

export const PlatformUtils = {
  // Platform detection
  isWeb: Platform.OS === 'web',
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isMobile: Platform.OS === 'ios' || Platform.OS === 'android',

  // Screen dimensions
  getScreenDimensions: () => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  },

  // Responsive breakpoints
  getBreakpoint: () => {
    const { width } = Dimensions.get('window');
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'desktop';
    return 'largeDesktop';
  },

  // Check if device is tablet-sized
  isTablet: () => {
    const { width, height } = Dimensions.get('window');
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    return minDimension >= 768 && maxDimension >= 1024;
  },

  // Platform-specific spacing
  getSpacing: (base: number) => {
    const breakpoint = PlatformUtils.getBreakpoint();
    switch (breakpoint) {
      case 'mobile':
        return base;
      case 'tablet':
        return base * 1.2;
      case 'desktop':
        return base * 1.4;
      case 'largeDesktop':
        return base * 1.6;
      default:
        return base;
    }
  },

  // Platform-specific font sizes
  getFontSize: (base: number) => {
    if (PlatformUtils.isWeb) {
      const breakpoint = PlatformUtils.getBreakpoint();
      switch (breakpoint) {
        case 'mobile':
          return base;
        case 'tablet':
          return base * 1.1;
        case 'desktop':
          return base * 1.2;
        case 'largeDesktop':
          return base * 1.3;
        default:
          return base;
      }
    }
    return base;
  },

  // Platform-specific layout
  getLayoutStyle: () => {
    const breakpoint = PlatformUtils.getBreakpoint();
    const isWeb = PlatformUtils.isWeb;

    return {
      // Container max width for web
      maxWidth: isWeb ? (breakpoint === 'mobile' ? '100%' : 1200) : '100%',
      
      // Padding adjustments
      paddingHorizontal: PlatformUtils.getSpacing(20),
      
      // Web-specific styles
      ...(isWeb && {
        alignSelf: 'center' as const,
        width: '100%',
      }),
    };
  },

  // Touch target sizes
  getTouchTargetSize: () => {
    return PlatformUtils.isMobile ? 44 : 40; // Larger on mobile for touch
  },

  // Platform-specific shadows
  getShadowStyle: (elevation: number = 4) => {
    if (PlatformUtils.isWeb) {
      return {
        boxShadow: `0 ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.1)`,
      };
    } else {
      return {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: elevation / 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: elevation,
        elevation: elevation,
      };
    }
  },
};

/**
 * Responsive hook for getting current breakpoint
 */
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = React.useState(PlatformUtils.getBreakpoint());

  React.useEffect(() => {
    if (PlatformUtils.isWeb) {
      const handleResize = () => {
        setBreakpoint(PlatformUtils.getBreakpoint());
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return {
    breakpoint,
    isWeb: PlatformUtils.isWeb,
    isMobile: PlatformUtils.isMobile,
    isTablet: PlatformUtils.isTablet(),
    spacing: PlatformUtils.getSpacing,
    fontSize: PlatformUtils.getFontSize,
    layoutStyle: PlatformUtils.getLayoutStyle(),
    touchTargetSize: PlatformUtils.getTouchTargetSize(),
    shadowStyle: PlatformUtils.getShadowStyle,
  };
};

// Import React for the hook
import React from 'react';
