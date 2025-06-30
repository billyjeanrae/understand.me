import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../stores/authStore';
import { useOnboardingStore } from '../stores/onboardingStore';

// Screens
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import ConflictDashboardScreen from '../screens/ConflictDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GroupConflictScreen from '../screens/GroupConflictScreen';

export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  Onboarding: undefined;
  Home: undefined;
  Settings: undefined;
  ConflictDashboard: undefined;
  Profile: undefined;
  GroupConflict: { conflictId?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();
  const { hasCompletedOnboarding } = useOnboardingStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0F172A' },
        }}
      >
        {!isAuthenticated ? (
          // Auth flow
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        ) : !hasCompletedOnboarding ? (
          // Onboarding flow
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          // Main app flow
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ConflictDashboard" component={ConflictDashboardScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="GroupConflict" component={GroupConflictScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
