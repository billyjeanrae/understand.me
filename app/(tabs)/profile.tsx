import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useResponsive } from '../../utils/platform';
import { ResponsiveContainer, ResponsiveGrid } from '../../components/layout/ResponsiveContainer';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import notificationService from '../../services/notifications/notificationService';
import dataExportService from '../../services/export/dataExportService';
import { User, Settings, Award, TrendingUp, Bell, HelpCircle, Shield, Palette, Volume2, Download, Share } from 'lucide-react-native';

export default function ProfileScreen() {
  const { spacing, fontSize } = useResponsive();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Mock user profile data
    setUserProfile({
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      joinedDate: new Date('2024-01-15'),
      avatar: '👤',
      stats: {
        sessionsCompleted: 12,
        conflictsResolved: 8,
        achievementPoints: 450,
        currentStreak: 5,
      },
      preferences: {
        notifications: true,
        voiceEnabled: true,
        theme: 'dark',
      }
    });

    // Load notification count
    loadUnreadCount();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'JSON', onPress: () => exportData('json') },
        { text: 'CSV', onPress: () => exportData('csv') },
        { text: 'PDF Report', onPress: () => exportData('pdf') },
      ]
    );
  };

  const exportData = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const data = await dataExportService.exportAllData(format);
      const filename = `understand_me_export_${new Date().toISOString().split('T')[0]}.${format}`;
      await dataExportService.saveExportToDevice(data, filename);
      Alert.alert('Export Complete', `Your data has been exported as ${filename}`);
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    }
  };

  const handleShareProgress = async () => {
    try {
      const progressReport = await dataExportService.generateProgressReport();
      Alert.alert('Progress Report', progressReport, [
        { text: 'Close', style: 'cancel' },
        { text: 'Copy', onPress: () => {
          // In a real app, you would copy to clipboard
          Alert.alert('Copied!', 'Progress report copied to clipboard');
        }},
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate progress report');
    }
  };

  const profileSections = [
    {
      title: 'Account & Profile',
      items: [
        {
          id: 'profile_edit',
          title: 'Edit Profile',
          description: 'Update your personal information',
          icon: <User size={24} color="#10B981" strokeWidth={2} />,
          onPress: () => {
            // Navigate to existing ProfileScreen
            Alert.alert('Profile Edit', 'This would open the profile editing interface');
          },
        },
        {
          id: 'achievements',
          title: 'Achievements',
          description: 'View your badges and progress',
          icon: <Award size={24} color="#FFD700" strokeWidth={2} />,
          onPress: () => router.push('/(tabs)/growth'),
        },
        {
          id: 'analytics',
          title: 'Progress Analytics',
          description: 'Detailed insights into your growth',
          icon: <TrendingUp size={24} color="#3B82F6" strokeWidth={2} />,
          onPress: () => router.push('/(tabs)/growth'),
        },
      ],
    },
    {
      title: 'Settings & Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          description: 'Manage your notification preferences',
          icon: <Bell size={24} color="#8B5CF6" strokeWidth={2} />,
          onPress: () => setShowNotifications(true),
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
          id: 'voice_settings',
          title: 'Voice Settings',
          description: 'Configure voice and audio preferences',
          icon: <Volume2 size={24} color="#3B82F6" strokeWidth={2} />,
          onPress: () => {
            // Navigate to existing VoiceSettingsScreen
            Alert.alert('Voice Settings', 'This would open voice settings from the existing screen');
          },
        },
        {
          id: 'appearance',
          title: 'Appearance',
          description: 'Customize theme and display options',
          icon: <Palette size={24} color="#F59E0B" strokeWidth={2} />,
          onPress: () => {
            Alert.alert('Appearance', 'This would open appearance settings');
          },
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          description: 'Manage your privacy and data settings',
          icon: <Shield size={24} color="#EF4444" strokeWidth={2} />,
          onPress: () => {
            Alert.alert('Privacy', 'This would open privacy settings');
          },
        },
      ],
    },
    {
      title: 'Support & Information',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          description: 'Get help and contact support',
          icon: <HelpCircle size={24} color="#6B7280" strokeWidth={2} />,
          onPress: () => {
            Alert.alert('Help', 'This would open the help center');
          },
        },
        {
          id: 'export',
          title: 'Export Data',
          description: 'Download your session data and progress',
          icon: <Download size={24} color="#6B7280" strokeWidth={2} />,
          onPress: () => handleDataExport(),
        },
        {
          id: 'share_progress',
          title: 'Share Progress',
          description: 'Share your conflict resolution journey',
          icon: <Share size={24} color="#6B7280" strokeWidth={2} />,
          onPress: () => handleShareProgress(),
        },
        {
          id: 'general_settings',
          title: 'General Settings',
          description: 'Access all app settings',
          icon: <Settings size={24} color="#6B7280" strokeWidth={2} />,
          onPress: () => {
            // Navigate to existing SettingsScreen
            Alert.alert('Settings', 'This would open the general settings from the existing screen');
          },
        },
      ],
    },
  ];

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ResponsiveContainer style={styles.content}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { fontSize: fontSize(16) }]}>
              Loading profile...
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
          {/* Profile Header */}
          <View style={[styles.profileHeader, { marginBottom: spacing(32) }]}>
            <View style={[styles.avatarContainer, { marginBottom: spacing(16) }]}>
              <Text style={[styles.avatar, { fontSize: fontSize(48) }]}>
                {userProfile.avatar}
              </Text>
            </View>
            
            <Text style={[styles.userName, { fontSize: fontSize(24) }]}>
              {userProfile.name}
            </Text>
            <Text style={[styles.userEmail, { fontSize: fontSize(14) }]}>
              {userProfile.email}
            </Text>
            <Text style={[styles.joinDate, { fontSize: fontSize(12) }]}>
              Member since {userProfile.joinedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={[styles.statsSection, { marginBottom: spacing(32) }]}>
            <Text style={[styles.sectionTitle, { fontSize: fontSize(18), marginBottom: spacing(16) }]}>
              Your Progress
            </Text>
            <ResponsiveGrid
              columns={{ mobile: 2, tablet: 4, desktop: 4 }}
              gap={spacing(12)}
            >
              <View style={[styles.statCard, { padding: spacing(16) }]}>
                <Text style={[styles.statNumber, { fontSize: fontSize(20) }]}>
                  {userProfile.stats.sessionsCompleted}
                </Text>
                <Text style={[styles.statLabel, { fontSize: fontSize(12) }]}>
                  Sessions
                </Text>
              </View>
              <View style={[styles.statCard, { padding: spacing(16) }]}>
                <Text style={[styles.statNumber, { fontSize: fontSize(20) }]}>
                  {userProfile.stats.conflictsResolved}
                </Text>
                <Text style={[styles.statLabel, { fontSize: fontSize(12) }]}>
                  Resolved
                </Text>
              </View>
              <View style={[styles.statCard, { padding: spacing(16) }]}>
                <Text style={[styles.statNumber, { fontSize: fontSize(20) }]}>
                  {userProfile.stats.achievementPoints}
                </Text>
                <Text style={[styles.statLabel, { fontSize: fontSize(12) }]}>
                  Points
                </Text>
              </View>
              <View style={[styles.statCard, { padding: spacing(16) }]}>
                <Text style={[styles.statNumber, { fontSize: fontSize(20) }]}>
                  {userProfile.stats.currentStreak}
                </Text>
                <Text style={[styles.statLabel, { fontSize: fontSize(12) }]}>
                  Day Streak
                </Text>
              </View>
            </ResponsiveGrid>
          </View>

          {/* Profile Sections */}
          {profileSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={[styles.section, { marginBottom: spacing(24) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(18), marginBottom: spacing(16) }]}>
                {section.title}
              </Text>
              
              <View style={styles.sectionItems}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.settingItem,
                      { 
                        padding: spacing(16),
                        borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                      }
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.settingIcon}>
                      {item.icon}
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={[styles.settingTitle, { fontSize: fontSize(16) }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.settingDescription, { fontSize: fontSize(14) }]}>
                        {item.description}
                      </Text>
                    </View>
                    <View style={styles.settingArrow}>
                      {item.badge && (
                        <View style={styles.badge}>
                          <Text style={[styles.badgeText, { fontSize: fontSize(10) }]}>
                            {item.badge}
                          </Text>
                        </View>
                      )}
                      <Text style={[styles.arrowText, { fontSize: fontSize(18) }]}>›</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* App Version */}
          <View style={[styles.versionContainer, { marginTop: spacing(32), marginBottom: spacing(32) }]}>
            <Text style={[styles.versionText, { fontSize: fontSize(12) }]}>
              understand.me v1.0.0
            </Text>
            <Text style={[styles.versionSubtext, { fontSize: fontSize(10) }]}>
              Built with ❤️ for better conflict resolution
            </Text>
          </View>
        </ResponsiveContainer>
      </ScrollView>

      {/* Notification Center */}
      <NotificationCenter
        visible={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          loadUnreadCount(); // Refresh count when closing
        }}
      />
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
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  avatar: {
    textAlign: 'center',
  },
  userName: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  joinDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter-Regular',
  },
  statsSection: {
    width: '100%',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  section: {
    width: '100%',
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
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  settingDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter-Regular',
  },
  settingArrow: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  arrowText: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  versionContainer: {
    alignItems: 'center',
  },
  versionText: {
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  versionSubtext: {
    color: '#4B5563',
    fontFamily: 'Inter-Regular',
  },
});
