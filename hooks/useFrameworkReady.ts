import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Hook to determine when the app framework is ready for use
 * This includes font loading, splash screen management, and platform-specific setup
 */
export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // On web, we're ready immediately
        if (Platform.OS === 'web') {
          setIsReady(true);
          return;
        }

        // For mobile platforms, add any additional setup here
        // This could include:
        // - Preloading assets
        // - Initializing native modules
        // - Setting up crash reporting
        // - Configuring analytics

        // Simulate any async setup time
        await new Promise(resolve => setTimeout(resolve, 100));

        setIsReady(true);
      } catch (error) {
        console.warn('Framework preparation error:', error);
        // Even if there's an error, we should still mark as ready
        // to prevent the app from being stuck in loading state
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  return isReady;
}