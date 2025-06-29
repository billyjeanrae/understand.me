import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  microphonePermissionGranted: boolean;
  
  // Actions
  completeOnboarding: () => void;
  setMicrophonePermission: (granted: boolean) => void;
  loadOnboardingStatus: () => Promise<void>;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: false,
  microphonePermissionGranted: false,
  
  completeOnboarding: async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    set({ hasCompletedOnboarding: true });
  },
  
  setMicrophonePermission: (granted: boolean) => {
    set({ microphonePermissionGranted: granted });
  },
  
  loadOnboardingStatus: async () => {
    try {
      const completed = await AsyncStorage.getItem('onboarding_completed');
      if (completed === 'true') {
        set({ hasCompletedOnboarding: true });
      }
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
    }
  },
  
  reset: async () => {
    await AsyncStorage.removeItem('onboarding_completed');
    set({
      hasCompletedOnboarding: false,
      microphonePermissionGranted: false,
    });
  },
}));
