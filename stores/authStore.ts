import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  createdAt?: string;
  personalityProfile?: Record<string, any>;
  onboardingComplete?: boolean;
  profileSetupComplete?: boolean;
}

export interface OnboardingData {
  username?: string;
  password?: string;
  confirmPassword?: string;
  location?: string;
  personalityAnswers?: Record<string, any>;
  personalityProfile?: Record<string, any>;
  currentStep?: number;
  voiceOnboardingSkipped?: boolean;
  voiceOnboardingCompleted?: boolean;
  personalityAssessmentSkipped?: boolean;
  personalityAssessmentCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingData: OnboardingData;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  completeProfileSetup: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  onboardingData: {
    currentStep: 0,
  },
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: Date.now().toString(),
        email,
        name,
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    AsyncStorage.multiRemove(['user', 'isAuthenticated']);
    set({ 
      user: null, 
      isAuthenticated: false,
      onboardingData: { currentStep: 0 }
    });
  },

  updateProfile: async (profile: Partial<User>) => {
    const { user } = get();
    if (!user) return;
    
    const updatedUser = { ...user, ...profile };
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  loadStoredAuth: async () => {
    try {
      const [storedUser, isAuthenticated] = await AsyncStorage.multiGet([
        'user',
        'isAuthenticated'
      ]);
      
      if (storedUser[1] && isAuthenticated[1] === 'true') {
        const user = JSON.parse(storedUser[1]);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    }
  },
  
  updateOnboardingData: (data) => set((state) => ({
    onboardingData: { ...state.onboardingData, ...data },
  })),
  
  completeOnboarding: async () => {
    const { user, onboardingData } = get();
    if (!user) return;
    
    const updatedUser = {
      ...user,
      username: onboardingData.username,
      location: onboardingData.location,
      personalityProfile: onboardingData.personalityAnswers,
      onboardingComplete: true,
    };
    
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
  
  resetOnboarding: () => set({
    onboardingData: { currentStep: 0 },
  }),

  completeProfileSetup: async () => {
    const { user } = get();
    if (!user) return;
    
    const updatedUser = {
      ...user,
      profileSetupComplete: true,
    };
    
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));