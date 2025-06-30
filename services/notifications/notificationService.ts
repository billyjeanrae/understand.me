import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationSettings, NotificationSchedule, NotificationType } from '../../types/notifications';

const NOTIFICATIONS_KEY = '@understand_me_notifications';
const NOTIFICATION_SETTINGS_KEY = '@understand_me_notification_settings';
const NOTIFICATION_SCHEDULES_KEY = '@understand_me_notification_schedules';

class NotificationService {
  private notifications: Notification[] = [];
  private settings: NotificationSettings = this.getDefaultSettings();
  private schedules: NotificationSchedule[] = [];

  async initialize(): Promise<void> {
    try {
      await this.loadNotifications();
      await this.loadSettings();
      await this.loadSchedules();
      this.scheduleDefaultNotifications();
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      achievements: true,
      sessionReminders: true,
      milestones: true,
      streakReminders: true,
      systemUpdates: true,
      tips: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
      frequency: {
        sessionReminders: 'daily',
        streakReminders: 'daily',
        tips: 'weekly',
      },
    };
  }

  async createNotification(
    title: string,
    message: string,
    type: NotificationType,
    options: {
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      actionUrl?: string;
      actionText?: string;
      icon?: string;
      data?: any;
    } = {}
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      priority: options.priority || 'normal',
      timestamp: new Date(),
      isRead: false,
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      icon: options.icon || this.getDefaultIcon(type),
      data: options.data,
    };

    // Check if notifications are enabled for this type
    if (!this.shouldShowNotification(type)) {
      return notification;
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      // Store for later delivery
      this.scheduleNotification(notification);
      return notification;
    }

    this.notifications.unshift(notification);
    await this.saveNotifications();

    // Show platform-specific notification
    this.showPlatformNotification(notification);

    return notification;
  }

  private getDefaultIcon(type: NotificationType): string {
    switch (type) {
      case 'achievement': return '🏆';
      case 'session_reminder': return '💬';
      case 'milestone': return '🎯';
      case 'streak_reminder': return '🔥';
      case 'system': return '⚙️';
      case 'update': return '🆕';
      case 'tip': return '💡';
      default: return '📱';
    }
  }

  private shouldShowNotification(type: NotificationType): boolean {
    if (!this.settings.enabled) return false;

    switch (type) {
      case 'achievement': return this.settings.achievements;
      case 'session_reminder': return this.settings.sessionReminders;
      case 'milestone': return this.settings.milestones;
      case 'streak_reminder': return this.settings.streakReminders;
      case 'system': return this.settings.systemUpdates;
      case 'update': return this.settings.systemUpdates;
      case 'tip': return this.settings.tips;
      default: return true;
    }
  }

  private isQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const startTime = this.settings.quietHours.startTime;
    const endTime = this.settings.quietHours.endTime;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  private showPlatformNotification(notification: Notification): void {
    // For web, we could use the Web Notifications API
    // For mobile, we could use Expo Notifications
    // For now, we'll just log it
    console.log('📱 Notification:', notification.title, notification.message);
  }

  private scheduleNotification(notification: Notification): void {
    // Add to scheduled notifications for later delivery
    const schedule: NotificationSchedule = {
      id: `schedule_${Date.now()}`,
      type: notification.type,
      scheduledFor: new Date(Date.now() + 60000), // 1 minute later for demo
      recurring: false,
      title: notification.title,
      message: notification.message,
      data: notification.data,
    };

    this.schedules.push(schedule);
    this.saveSchedules();
  }

  async getNotifications(): Promise<Notification[]> {
    return this.notifications;
  }

  async getUnreadCount(): Promise<number> {
    return this.notifications.filter(n => !n.isRead).length;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      await this.saveNotifications();
    }
  }

  async markAllAsRead(): Promise<void> {
    this.notifications.forEach(n => n.isRead = true);
    await this.saveNotifications();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    await this.saveNotifications();
  }

  async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    await this.saveNotifications();
  }

  async getSettings(): Promise<NotificationSettings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  // Predefined notification creators
  async createAchievementNotification(achievementTitle: string, points: number): Promise<Notification> {
    return this.createNotification(
      'Achievement Unlocked! 🏆',
      `You've earned "${achievementTitle}" and gained ${points} points!`,
      'achievement',
      {
        priority: 'high',
        actionUrl: '/(tabs)/growth',
        actionText: 'View Achievements',
        data: { achievementTitle, points },
      }
    );
  }

  async createSessionReminderNotification(): Promise<Notification> {
    return this.createNotification(
      'Time for Growth! 💬',
      'Ready to work on your conflict resolution skills today?',
      'session_reminder',
      {
        priority: 'normal',
        actionUrl: '/(tabs)/sessions',
        actionText: 'Start Session',
      }
    );
  }

  async createStreakReminderNotification(currentStreak: number): Promise<Notification> {
    return this.createNotification(
      `${currentStreak} Day Streak! 🔥`,
      'Keep your momentum going with another session today!',
      'streak_reminder',
      {
        priority: 'normal',
        actionUrl: '/(tabs)/sessions',
        actionText: 'Continue Streak',
        data: { currentStreak },
      }
    );
  }

  async createMilestoneNotification(milestone: string): Promise<Notification> {
    return this.createNotification(
      'Milestone Reached! 🎯',
      `Congratulations! You've reached: ${milestone}`,
      'milestone',
      {
        priority: 'high',
        actionUrl: '/(tabs)/growth',
        actionText: 'View Progress',
        data: { milestone },
      }
    );
  }

  async createTipNotification(): Promise<Notification> {
    const tips = [
      'Practice active listening by summarizing what others say before responding.',
      'Take a deep breath before responding in heated conversations.',
      'Use "I" statements to express your feelings without blaming others.',
      'Ask open-ended questions to better understand different perspectives.',
      'Focus on the issue, not the person, when discussing conflicts.',
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    return this.createNotification(
      'Daily Tip 💡',
      randomTip,
      'tip',
      {
        priority: 'low',
        actionUrl: '/(tabs)/sessions',
        actionText: 'Practice Now',
      }
    );
  }

  private scheduleDefaultNotifications(): void {
    // Schedule daily session reminders if enabled
    if (this.settings.frequency.sessionReminders === 'daily') {
      this.scheduleRecurringNotification('session_reminder', 'daily');
    }

    // Schedule weekly tips if enabled
    if (this.settings.frequency.tips === 'weekly') {
      this.scheduleRecurringNotification('tip', 'weekly');
    }
  }

  private scheduleRecurringNotification(type: NotificationType, pattern: 'daily' | 'weekly'): void {
    const now = new Date();
    let scheduledFor = new Date(now);

    if (pattern === 'daily') {
      scheduledFor.setDate(now.getDate() + 1);
      scheduledFor.setHours(10, 0, 0, 0); // 10 AM next day
    } else if (pattern === 'weekly') {
      scheduledFor.setDate(now.getDate() + 7);
      scheduledFor.setHours(10, 0, 0, 0); // 10 AM next week
    }

    const schedule: NotificationSchedule = {
      id: `recurring_${type}_${Date.now()}`,
      type,
      scheduledFor,
      recurring: true,
      recurringPattern: pattern,
      title: type === 'session_reminder' ? 'Time for Growth!' : 'Daily Tip',
      message: type === 'session_reminder' 
        ? 'Ready to work on your conflict resolution skills today?'
        : 'Check out today\'s conflict resolution tip!',
    };

    this.schedules.push(schedule);
    this.saveSchedules();
  }

  // Storage methods
  private async loadNotifications(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (data) {
        const notifications = JSON.parse(data);
        this.notifications = notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  private async saveNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (data) {
        this.settings = { ...this.getDefaultSettings(), ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  private async loadSchedules(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATION_SCHEDULES_KEY);
      if (data) {
        const schedules = JSON.parse(data);
        this.schedules = schedules.map((s: any) => ({
          ...s,
          scheduledFor: new Date(s.scheduledFor),
        }));
      }
    } catch (error) {
      console.error('Failed to load notification schedules:', error);
    }
  }

  private async saveSchedules(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SCHEDULES_KEY, JSON.stringify(this.schedules));
    } catch (error) {
      console.error('Failed to save notification schedules:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
