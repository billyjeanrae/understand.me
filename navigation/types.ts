export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  Onboarding: undefined;
  Home: undefined;
  Settings: undefined;
  ConflictDashboard: undefined;
  Profile: undefined;
  GroupConflict: { conflictId?: string };
  Chat: { sessionId?: string; conflictType?: string };
  ResourceLibrary: undefined;
};
