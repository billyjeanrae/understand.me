import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useResponsive } from '../../../utils/platform';
import { ResponsiveContainer } from '../../../components/layout/ResponsiveContainer';
import { NotificationSettings } from '../../../types/notifications';
import notificationService from '../../../services/notifications/notificationService';
import { 
  Bell, 
  BellOff, 
  Moon, 
  Volume2, 
  VolumeX, 
  Palette, 
  Shield, 
  Eye, 
  EyeOff,
  Clock,
  Smartphone,
  Monitor,
  ArrowLeft,
  ChevronRight
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { spacing, fontSize } = useResponsive();
  const router = useRouter();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock settings state
  const [settings, setSettings] = useState({
    appearance: {
      theme: 'dark' as 'light' | 'dark' | 'auto',
      fontSize: 'medium' as 'small' | 'medium' | 'large',
      animations: true,
    },
    privacy: {
      analytics: true,
      crashReporting: true,
      dataSharing: false,
    },
    accessibility: {
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
      largeText: false,
    },
    voice: {
      enabled: true,
      sensitivity: 0.7,
      noiseReduction: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifSettings = await notificationService.getSettings();
      setNotificationSettings(notifSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    try {
      await notificationService.updateSettings(updates);
      const updatedSettings = await notificationService.getSettings();
      setNotificationSettings(updatedSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const updateSettings = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const settingSections = [
    {
      title: 'Notifications',
      icon: <Bell size={24} color="#10B981" strokeWidth={2} />,
      items: [
        {
          id: 'notifications_enabled',
          title: 'Enable Notifications',
          description: 'Receive app notifications',
          type: 'switch',
          value: notificationSettings?.enabled || false,
          onToggle: (value: boolean) => updateNotificationSettings({ enabled: value }),
        },
        {
          id: 'achievements',
          title: 'Achievement Notifications',
          description: 'Get notified when you unlock achievements',
          type: 'switch',
          value: notificationSettings?.achievements || false,
          onToggle: (value: boolean) => updateNotificationSettings({ achievements: value }),
          disabled: !notificationSettings?.enabled,
        },
        {
          id: 'session_reminders',
          title: 'Session Reminders',
          description: 'Daily reminders to practice conflict resolution',
          type: 'switch',
          value: notificationSettings?.sessionReminders || false,
          onToggle: (value: boolean) => updateNotificationSettings({ sessionReminders: value }),
          disabled: !notificationSettings?.enabled,
        },
        {
          id: 'streak_reminders',
          title: 'Streak Reminders',
          description: 'Reminders to maintain your daily streak',
          type: 'switch',
          value: notificationSettings?.streakReminders || false,
          onToggle: (value: boolean) => updateNotificationSettings({ streakReminders: value }),
          disabled: !notificationSettings?.enabled,
        },
        {
          id: 'tips',
          title: 'Daily Tips',
          description: 'Receive conflict resolution tips and techniques',
          type: 'switch',
          value: notificationSettings?.tips || false,
          onToggle: (value: boolean) => updateNotificationSettings({ tips: value }),
          disabled: !notificationSettings?.enabled,
        },
        {
          id: 'quiet_hours',
          title: 'Quiet Hours',
          description: 'Set times when notifications are silenced',
          type: 'navigation',
          value: notificationSettings?.quietHours.enabled ? 'Enabled' : 'Disabled',
          onPress: () => Alert.alert('Quiet Hours', 'This would open quiet hours settings'),
        },
      ],
    },
    {
      title: 'Appearance',
      icon: <Palette size={24} color="#F59E0B" strokeWidth={2} />,
      items: [
        {
          id: 'theme',
          title: 'Theme',
          description: 'Choose your preferred color scheme',
          type: 'navigation',
          value: settings.appearance.theme === 'auto' ? 'Auto' : settings.appearance.theme === 'dark' ? 'Dark' : 'Light',
          onPress: () => Alert.alert('Theme', 'This would open theme selection'),
        },
        {
          id: 'font_size',
          title: 'Font Size',
          description: 'Adjust text size throughout the app',
          type: 'navigation',
          value: settings.appearance.fontSize.charAt(0).toUpperCase() + settings.appearance.fontSize.slice(1),
          onPress: () => Alert.alert('Font Size', 'This would open font size settings'),
        },
        {
          id: 'animations',
          title: 'Animations',
          description: 'Enable smooth transitions and animations',
          type: 'switch',
          value: settings.appearance.animations,
          onToggle: (value: boolean) => updateSettings('appearance', 'animations', value),
        },
      ],
    },
    {
      title: 'Voice & Audio',
      icon: <Volume2 size={24} color="#3B82F6" strokeWidth={2} />,
      items: [
        {
          id: 'voice_enabled',
          title: 'Voice Sessions',
          description: 'Enable voice-based conflict resolution sessions',
          type: 'switch',
          value: settings.voice.enabled,
          onToggle: (value: boolean) => updateSettings('voice', 'enabled', value),
        },
        {
          id: 'voice_settings',
          title: 'Voice Settings',
          description: 'Configure microphone and voice recognition',
          type: 'navigation',
          value: 'Configure',
          onPress: () => router.push('/(tabs)/profile/voice-settings'),
        },
        {
          id: 'noise_reduction',
          title: 'Noise Reduction',
          description: 'Filter background noise during voice sessions',
          type: 'switch',
          value: settings.voice.noiseReduction,
          onToggle: (value: boolean) => updateSettings('voice', 'noiseReduction', value),
          disabled: !settings.voice.enabled,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: <Shield size={24} color="#EF4444" strokeWidth={2} />,
      items: [
        {
          id: 'analytics',
          title: 'Usage Analytics',
          description: 'Help improve the app by sharing anonymous usage data',
          type: 'switch',
          value: settings.privacy.analytics,
          onToggle: (value: boolean) => updateSettings('privacy', 'analytics', value),
        },
        {
          id: 'crash_reporting',
          title: 'Crash Reporting',
          description: 'Automatically report crashes to help fix bugs',
          type: 'switch',
          value: settings.privacy.crashReporting,
          onToggle: (value: boolean) => updateSettings('privacy', 'crashReporting', value),
        },
        {
          id: 'data_sharing',
          title: 'Data Sharing',
          description: 'Share session insights with research partners',
          type: 'switch',
          value: settings.privacy.dataSharing,
          onToggle: (value: boolean) => updateSettings('privacy', 'dataSharing', value),
        },
        {
          id: 'data_export',
          title: 'Export Data',
          description: 'Download your session data and progress',
          type: 'navigation',
          value: 'Export',
          onPress: () => Alert.alert('Data Export', 'This would open data export options'),
        },
        {
          id: 'delete_data',
          title: 'Delete All Data',
          description: 'Permanently remove all your data from the app',
          type: 'navigation',
          value: 'Delete',
          onPress: () => Alert.alert(
            'Delete All Data',
            'This will permanently delete all your sessions, achievements, and progress. This action cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Data Deleted', 'All data has been removed') },
            ]
          ),
          destructive: true,
        },
      ],
    },
    {
      title: 'Accessibility',
      icon: <Eye size={24} color="#8B5CF6" strokeWidth={2} />,
      items: [
        {
          id: 'high_contrast',
          title: 'High Contrast',
          description: 'Increase contrast for better visibility',
          type: 'switch',
          value: settings.accessibility.highContrast,
          onToggle: (value: boolean) => updateSettings('accessibility', 'highContrast', value),
        },
        {
          id: 'reduce_motion',
          title: 'Reduce Motion',
          description: 'Minimize animations and transitions',
          type: 'switch',
          value: settings.accessibility.reduceMotion,
          onToggle: (value: boolean) => updateSettings('accessibility', 'reduceMotion', value),
        },
        {
          id: 'large_text',
          title: 'Large Text',
          description: 'Use larger text sizes throughout the app',
          type: 'switch',
          value: settings.accessibility.largeText,
          onToggle: (value: boolean) => updateSettings('accessibility', 'largeText', value),
        },
        {
          id: 'screen_reader',
          title: 'Screen Reader Support',
          description: 'Optimize for screen reader accessibility',
          type: 'switch',
          value: settings.accessibility.screenReader,
          onToggle: (value: boolean) => updateSettings('accessibility', 'screenReader', value),
        },
      ],
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ResponsiveContainer style={styles.content}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { fontSize: fontSize(16) }]}>
              Loading settings...
            </Text>
          </View>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer style={styles.content}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing(24) }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={[styles.title, { fontSize: fontSize(24) }]}>
              Settings
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Settings Sections */}
          {settingSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={[styles.section, { marginBottom: spacing(24) }]}>
              <View style={[styles.sectionHeader, { marginBottom: spacing(16) }]}>
                {section.icon}
                <Text style={[styles.sectionTitle, { fontSize: fontSize(18) }]}>
                  {section.title}
                </Text>
              </View>
              
              <View style={styles.sectionItems}>
                {section.items.map((item, itemIndex) => (
                  <View
                    key={item.id}
                    style={[
                      styles.settingItem,
                      { 
                        padding: spacing(16),
                        borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                        opacity: item.disabled ? 0.5 : 1,
                      }
                    ]}
                  >
                    <View style={styles.settingContent}>
                      <Text 
                        style={[
                          styles.settingTitle, 
                          { 
                            fontSize: fontSize(16),
                            color: item.destructive ? '#EF4444' : '#FFFFFF',
                          }
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={[styles.settingDescription, { fontSize: fontSize(14) }]}>
                        {item.description}
                      </Text>
                    </View>
                    
                    <View style={styles.settingControl}>
                      {item.type === 'switch' ? (
                        <Switch
                          value={item.value as boolean}
                          onValueChange={item.onToggle}
                          disabled={item.disabled}
                          trackColor={{ false: '#374151', true: '#10B981' }}
                          thumbColor={item.value ? '#FFFFFF' : '#9CA3AF'}
                        />
                      ) : (
                        <TouchableOpacity
                          style={styles.navigationItem}
                          onPress={item.onPress}
                          disabled={item.disabled}
                        >
                          <Text style={[styles.navigationValue, { fontSize: fontSize(14) }]}>
                            {item.value}
                          </Text>
                          <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* App Info */}
          <View style={[styles.appInfo, { marginTop: spacing(32), marginBottom: spacing(32) }]}>
            <Text style={[styles.appVersion, { fontSize: fontSize(12) }]}>
              understand.me v1.0.0
            </Text>
            <Text style={[styles.appBuild, { fontSize: fontSize(10) }]}>
              Build 2024.06.30
            </Text>
          </View>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  placeholder: {
    width: 40,
  },
  section: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  sectionItems: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  settingDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter-Regular',
  },
  settingControl: {
    marginLeft: 16,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigationValue: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginRight: 8,
  },
  appInfo: {
    alignItems: 'center',
  },
  appVersion: {
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  appBuild: {
    color: '#4B5563',
    fontFamily: 'Inter-Regular',
  },
});
