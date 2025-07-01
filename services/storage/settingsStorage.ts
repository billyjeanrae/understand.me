import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Settings Storage Service using AsyncStorage
 * Handles persistence of user preferences and settings
 */

export interface VoiceSettings {
  provider: 'elevenlabs' | 'expo' | 'web';
  voice: string;
  speed: number;
  pitch: number;
  sttProvider: 'elevenlabs' | 'google' | 'whisper' | 'web';
  language: string;
  diarize: boolean;
  tagAudioEvents: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  sessionReminders: boolean;
  conflictUpdates: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface UserSettings {
  voice: VoiceSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  onboardingCompleted: boolean;
  lastSyncDate?: string;
}

// Storage keys
const STORAGE_KEYS = {
  USER_SETTINGS: '@understand_me/user_settings',
  VOICE_SETTINGS: '@understand_me/voice_settings',
  APPEARANCE_SETTINGS: '@understand_me/appearance_settings',
  NOTIFICATION_SETTINGS: '@understand_me/notification_settings',
  ONBOARDING_COMPLETED: '@understand_me/onboarding_completed',
} as const;

// Default settings
const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  provider: 'expo',
  voice: 'default',
  speed: 1.0,
  pitch: 1.0,
  sttProvider: 'elevenlabs',
  language: 'en-US',
  diarize: false,
  tagAudioEvents: true,
};

const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: 'system',
  fontSize: 'medium',
  colorScheme: 'blue',
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: true,
  sessionReminders: true,
  conflictUpdates: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

const DEFAULT_USER_SETTINGS: UserSettings = {
  voice: DEFAULT_VOICE_SETTINGS,
  appearance: DEFAULT_APPEARANCE_SETTINGS,
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  onboardingCompleted: false,
};

/**
 * Generic storage functions
 */
async function storeData<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
}

async function getData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return defaultValue;
  }
}

async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
}

/**
 * Voice Settings
 */
export const VoiceSettingsStorage = {
  async get(): Promise<VoiceSettings> {
    return getData(STORAGE_KEYS.VOICE_SETTINGS, DEFAULT_VOICE_SETTINGS);
  },

  async set(settings: Partial<VoiceSettings>): Promise<void> {
    const currentSettings = await this.get();
    const updatedSettings = { ...currentSettings, ...settings };
    await storeData(STORAGE_KEYS.VOICE_SETTINGS, updatedSettings);
  },

  async reset(): Promise<void> {
    await storeData(STORAGE_KEYS.VOICE_SETTINGS, DEFAULT_VOICE_SETTINGS);
  },
};

/**
 * Appearance Settings
 */
export const AppearanceSettingsStorage = {
  async get(): Promise<AppearanceSettings> {
    return getData(STORAGE_KEYS.APPEARANCE_SETTINGS, DEFAULT_APPEARANCE_SETTINGS);
  },

  async set(settings: Partial<AppearanceSettings>): Promise<void> {
    const currentSettings = await this.get();
    const updatedSettings = { ...currentSettings, ...settings };
    await storeData(STORAGE_KEYS.APPEARANCE_SETTINGS, updatedSettings);
  },

  async reset(): Promise<void> {
    await storeData(STORAGE_KEYS.APPEARANCE_SETTINGS, DEFAULT_APPEARANCE_SETTINGS);
  },
};

/**
 * Notification Settings
 */
export const NotificationSettingsStorage = {
  async get(): Promise<NotificationSettings> {
    return getData(STORAGE_KEYS.NOTIFICATION_SETTINGS, DEFAULT_NOTIFICATION_SETTINGS);
  },

  async set(settings: Partial<NotificationSettings>): Promise<void> {
    const currentSettings = await this.get();
    const updatedSettings = { ...currentSettings, ...settings };
    await storeData(STORAGE_KEYS.NOTIFICATION_SETTINGS, updatedSettings);
  },

  async reset(): Promise<void> {
    await storeData(STORAGE_KEYS.NOTIFICATION_SETTINGS, DEFAULT_NOTIFICATION_SETTINGS);
  },
};

/**
 * User Settings (Combined)
 */
export const UserSettingsStorage = {
  async get(): Promise<UserSettings> {
    const [voice, appearance, notifications, onboardingCompleted] = await Promise.all([
      VoiceSettingsStorage.get(),
      AppearanceSettingsStorage.get(),
      NotificationSettingsStorage.get(),
      getData(STORAGE_KEYS.ONBOARDING_COMPLETED, false),
    ]);

    return {
      voice,
      appearance,
      notifications,
      onboardingCompleted,
      lastSyncDate: new Date().toISOString(),
    };
  },

  async set(settings: Partial<UserSettings>): Promise<void> {
    const promises: Promise<void>[] = [];

    if (settings.voice) {
      promises.push(VoiceSettingsStorage.set(settings.voice));
    }

    if (settings.appearance) {
      promises.push(AppearanceSettingsStorage.set(settings.appearance));
    }

    if (settings.notifications) {
      promises.push(NotificationSettingsStorage.set(settings.notifications));
    }

    if (settings.onboardingCompleted !== undefined) {
      promises.push(storeData(STORAGE_KEYS.ONBOARDING_COMPLETED, settings.onboardingCompleted));
    }

    await Promise.all(promises);
  },

  async reset(): Promise<void> {
    await Promise.all([
      VoiceSettingsStorage.reset(),
      AppearanceSettingsStorage.reset(),
      NotificationSettingsStorage.reset(),
      removeData(STORAGE_KEYS.ONBOARDING_COMPLETED),
    ]);
  },

  async clear(): Promise<void> {
    await Promise.all([
      removeData(STORAGE_KEYS.VOICE_SETTINGS),
      removeData(STORAGE_KEYS.APPEARANCE_SETTINGS),
      removeData(STORAGE_KEYS.NOTIFICATION_SETTINGS),
      removeData(STORAGE_KEYS.ONBOARDING_COMPLETED),
    ]);
  },
};

/**
 * Onboarding
 */
export const OnboardingStorage = {
  async isCompleted(): Promise<boolean> {
    return getData(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
  },

  async setCompleted(completed: boolean = true): Promise<void> {
    await storeData(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  },
};

/**
 * Utility functions
 */
export const SettingsUtils = {
  async exportSettings(): Promise<string> {
    const settings = await UserSettingsStorage.get();
    return JSON.stringify(settings, null, 2);
  },

  async importSettings(settingsJson: string): Promise<void> {
    try {
      const settings = JSON.parse(settingsJson) as UserSettings;
      await UserSettingsStorage.set(settings);
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error('Invalid settings format');
    }
  },

  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith('@understand_me/'));
      
      let totalSize = 0;
      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  },
};

// Export default instance for convenience
export default UserSettingsStorage;
