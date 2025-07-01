import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isFrameworkReady = useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Check initial session and onboarding status
    const initializeApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check if user has completed onboarding
          const { useOnboardingStore } = await import('../stores/onboardingStore');
          const { hasCompletedOnboarding, loadOnboardingStatus } = useOnboardingStore.getState();
          
          await loadOnboardingStatus();
          
          if (hasCompletedOnboarding) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(onboarding)/welcome');
          }
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        router.replace('/(auth)/login');
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Check onboarding status for authenticated users
        try {
          const { useOnboardingStore } = await import('../stores/onboardingStore');
          const { hasCompletedOnboarding, loadOnboardingStatus } = useOnboardingStore.getState();
          
          await loadOnboardingStatus();
          
          if (hasCompletedOnboarding) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(onboarding)/welcome');
          }
        } catch (error) {
          console.error('Failed to check onboarding status:', error);
          router.replace('/(onboarding)/welcome');
        }
      } else {
        router.replace('/(auth)/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!isFrameworkReady) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
