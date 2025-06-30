/**
 * User Profile Store
 * Zustand store for managing user profile state and personalization
 */

import { create } from 'zustand';
import { 
  UserProfile, 
  UserProfileUpdate, 
  ProfileAnalytics,
  PersonalizationRecommendation,
  UserPreferences,
  ConflictSummary,
  ConflictSkill,
  SkillLevel
} from '../types/user';
import { userProfileService } from '../services/user/profile';
import { personalizationService } from '../services/user/personalization';

interface UserProfileState {
  // Profile data
  profile: UserProfile | null;
  analytics: ProfileAnalytics | null;
  recommendations: PersonalizationRecommendation[];
  preferences: UserPreferences | null;
  
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isGeneratingRecommendations: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  initializeProfile: () => Promise<void>;
  createProfile: (userId: string, email: string, name: string, initialData?: Partial<UserProfile>) => Promise<void>;
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;
  addConflictToHistory: (conflict: ConflictSummary) => Promise<void>;
  updateSkillProgress: (skill: ConflictSkill, level: SkillLevel) => Promise<void>;
  generateRecommendations: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  clearError: () => void;
  resetProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  // Initial state
  profile: null,
  analytics: null,
  recommendations: [],
  preferences: null,
  isLoading: false,
  isUpdating: false,
  isGeneratingRecommendations: false,
  error: null,

  // Initialize profile service and load existing data
  initializeProfile: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await userProfileService.initialize();
      
      const profile = userProfileService.getProfile();
      const analytics = userProfileService.getAnalytics();
      const preferences = userProfileService.getUserPreferences();
      
      set({ 
        profile, 
        analytics, 
        preferences,
        isLoading: false 
      });

      // Generate recommendations if profile exists
      if (profile) {
        get().generateRecommendations();
      }
    } catch (error) {
      console.error('Failed to initialize profile:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize profile',
        isLoading: false 
      });
    }
  },

  // Create new user profile
  createProfile: async (userId: string, email: string, name: string, initialData?: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    
    try {
      const profile = await userProfileService.createProfile(userId, email, name, initialData);
      const analytics = userProfileService.getAnalytics();
      const preferences = userProfileService.getUserPreferences();
      
      set({ 
        profile, 
        analytics, 
        preferences,
        isLoading: false 
      });

      // Generate initial recommendations
      get().generateRecommendations();
    } catch (error) {
      console.error('Failed to create profile:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create profile',
        isLoading: false 
      });
    }
  },

  // Update user profile
  updateProfile: async (updates: UserProfileUpdate) => {
    set({ isUpdating: true, error: null });
    
    try {
      const updatedProfile = await userProfileService.updateProfile(updates);
      const analytics = userProfileService.getAnalytics();
      const preferences = userProfileService.getUserPreferences();
      
      set({ 
        profile: updatedProfile, 
        analytics, 
        preferences,
        isUpdating: false 
      });

      // Regenerate recommendations after profile update
      get().generateRecommendations();
    } catch (error) {
      console.error('Failed to update profile:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update profile',
        isUpdating: false 
      });
    }
  },

  // Add conflict to user history
  addConflictToHistory: async (conflict: ConflictSummary) => {
    try {
      await userProfileService.addConflictToHistory(conflict);
      
      const updatedProfile = userProfileService.getProfile();
      const analytics = userProfileService.getAnalytics();
      
      set({ 
        profile: updatedProfile, 
        analytics 
      });

      // Update recommendations based on new conflict data
      get().generateRecommendations();
    } catch (error) {
      console.error('Failed to add conflict to history:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update conflict history'
      });
    }
  },

  // Update skill progress
  updateSkillProgress: async (skill: ConflictSkill, level: SkillLevel) => {
    try {
      await userProfileService.updateSkillProgress(skill, level);
      
      const updatedProfile = userProfileService.getProfile();
      const analytics = userProfileService.getAnalytics();
      
      set({ 
        profile: updatedProfile, 
        analytics 
      });

      // Update recommendations based on skill progress
      get().generateRecommendations();
    } catch (error) {
      console.error('Failed to update skill progress:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update skill progress'
      });
    }
  },

  // Generate personalization recommendations
  generateRecommendations: async () => {
    set({ isGeneratingRecommendations: true });
    
    try {
      const recommendations = await userProfileService.generateRecommendations();
      set({ 
        recommendations,
        isGeneratingRecommendations: false 
      });
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
        isGeneratingRecommendations: false 
      });
    }
  },

  // Refresh analytics
  refreshAnalytics: async () => {
    try {
      // Force analytics update by updating profile with empty changes
      const profile = get().profile;
      if (profile) {
        await userProfileService.updateProfile({});
        const analytics = userProfileService.getAnalytics();
        set({ analytics });
      }
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to refresh analytics'
      });
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Reset profile (for logout)
  resetProfile: () => {
    set({
      profile: null,
      analytics: null,
      recommendations: [],
      preferences: null,
      isLoading: false,
      isUpdating: false,
      isGeneratingRecommendations: false,
      error: null,
    });
  },
}));

// Selector hooks for common use cases
export const useProfile = () => useUserProfileStore(state => state.profile);
export const useProfileAnalytics = () => useUserProfileStore(state => state.analytics);
export const usePersonalizationRecommendations = () => useUserProfileStore(state => state.recommendations);
export const useUserPreferences = () => useUserProfileStore(state => state.preferences);
export const useProfileLoading = () => useUserProfileStore(state => state.isLoading);
export const useProfileUpdating = () => useUserProfileStore(state => state.isUpdating);
export const useProfileError = () => useUserProfileStore(state => state.error);

// Action hooks
export const useProfileActions = () => useUserProfileStore(state => ({
  initializeProfile: state.initializeProfile,
  createProfile: state.createProfile,
  updateProfile: state.updateProfile,
  addConflictToHistory: state.addConflictToHistory,
  updateSkillProgress: state.updateSkillProgress,
  generateRecommendations: state.generateRecommendations,
  refreshAnalytics: state.refreshAnalytics,
  clearError: state.clearError,
  resetProfile: state.resetProfile,
}));

// Computed selectors
export const useProfileCompleteness = () => useUserProfileStore(state => 
  state.analytics?.profileCompleteness || 0
);

export const useEngagementScore = () => useUserProfileStore(state => 
  state.analytics?.engagementScore || 0
);

export const useLearningProgress = () => useUserProfileStore(state => 
  state.analytics?.learningProgress || 0
);

export const useConflictResolutionRate = () => useUserProfileStore(state => 
  state.profile?.conflictHistory.resolutionRate || 0
);

export const useTopSkillsNeedingWork = () => useUserProfileStore(state => {
  if (!state.profile) return [];
  
  const skillProgress = state.profile.learningPatterns.skillProgress;
  const needsWork = Object.entries(skillProgress)
    .filter(([_, level]) => level === 'beginner' || level === 'developing')
    .map(([skill, level]) => ({ skill: skill as ConflictSkill, level }))
    .slice(0, 3);
  
  return needsWork;
});

export const useHighPriorityRecommendations = () => useUserProfileStore(state => 
  state.recommendations.filter(rec => rec.priority === 'high').slice(0, 3)
);

export const useRecentConflicts = () => useUserProfileStore(state => 
  state.profile?.conflictHistory.recentConflicts.slice(0, 5) || []
);

export const usePersonalizedInsights = () => useUserProfileStore(state => 
  state.analytics?.personalizedInsights || []
);

export default useUserProfileStore;

