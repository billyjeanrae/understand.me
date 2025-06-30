export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  data?: any;
}

export type NotificationType = 
  | 'achievement'
  | 'session_reminder'
  | 'milestone'
  | 'streak_reminder'
  | 'system'
  | 'update'
  | 'tip';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationSettings {
  enabled: boolean;
  achievements: boolean;
  sessionReminders: boolean;
  milestones: boolean;
  streakReminders: boolean;
  systemUpdates: boolean;
  tips: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  frequency: {
    sessionReminders: 'daily' | 'weekly' | 'never';
    streakReminders: 'daily' | 'weekly' | 'never';
    tips: 'daily' | 'weekly' | 'never';
  };
}

export interface NotificationSchedule {
  id: string;
  type: NotificationType;
  scheduledFor: Date;
  recurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  title: string;
  message: string;
  data?: any;
}
