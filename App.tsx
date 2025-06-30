import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import { useAuthStore } from './stores/authStore';
import { useOnboardingStore } from './stores/onboardingStore';
import { useUserProfileStore } from './stores/userProfileStore';

/**
 * Main App component that handles authentication state and navigation
 */
export default function App() {
  const { loadStoredAuth } = useAuthStore();
  const { loadOnboardingStatus } = useOnboardingStore();
  const { initializeProfile } = useUserProfileStore();

  useEffect(() => {
    // Load stored authentication and onboarding status on app start
    const initializeApp = async () => {
      await Promise.all([
        loadStoredAuth(),
        loadOnboardingStatus(),
        initializeProfile(),
      ]);
    };

    initializeApp();
  }, [loadStoredAuth, loadOnboardingStatus, initializeProfile]);

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}
