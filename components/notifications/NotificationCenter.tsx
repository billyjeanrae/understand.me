import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useResponsive } from '../../utils/platform';
import { ResponsiveCard } from '../layout/ResponsiveContainer';
import { Notification } from '../../types/notifications';
import notificationService from '../../services/notifications/notificationService';
import { Bell, BellOff, Check, Trash2, X } from 'lucide-react-native';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
  const { spacing, fontSize } = useResponsive();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    try {
      const notifs = await notificationService.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.clearAllNotifications();
              await loadNotifications();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'normal': return '#10B981';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ResponsiveCard style={[styles.container, { padding: spacing(0) }]}>
        {/* Header */}
        <View style={[styles.header, { padding: spacing(16) }]}>
          <View style={styles.headerLeft}>
            <Bell size={24} color="#FFFFFF" strokeWidth={2} />
            <Text style={[styles.headerTitle, { fontSize: fontSize(18) }]}>
              Notifications
            </Text>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={[styles.unreadText, { fontSize: fontSize(12) }]}>
                  {notifications.filter(n => !n.isRead).length}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        {notifications.length > 0 && (
          <View style={[styles.actions, { padding: spacing(16) }]}>
            <TouchableOpacity
              style={[styles.actionButton, { paddingHorizontal: spacing(12), paddingVertical: spacing(6) }]}
              onPress={handleMarkAllAsRead}
            >
              <Check size={16} color="#10B981" strokeWidth={2} />
              <Text style={[styles.actionText, { fontSize: fontSize(12) }]}>
                Mark All Read
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { paddingHorizontal: spacing(12), paddingVertical: spacing(6) }]}
              onPress={handleClearAll}
            >
              <Trash2 size={16} color="#EF4444" strokeWidth={2} />
              <Text style={[styles.actionText, { fontSize: fontSize(12), color: '#EF4444' }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={[styles.emptyState, { padding: spacing(32) }]}>
              <Text style={[styles.emptyText, { fontSize: fontSize(16) }]}>
                Loading notifications...
              </Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={[styles.emptyState, { padding: spacing(32) }]}>
              <BellOff size={48} color="#6B7280" strokeWidth={1} />
              <Text style={[styles.emptyText, { fontSize: fontSize(16) }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptySubtext, { fontSize: fontSize(14) }]}>
                You'll see achievement unlocks, reminders, and tips here
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  {
                    backgroundColor: notification.isRead 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    borderLeftColor: getPriorityColor(notification.priority),
                    padding: spacing(16),
                  }
                ]}
                onPress={() => handleMarkAsRead(notification.id)}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationTitleRow}>
                      <Text style={styles.notificationIcon}>
                        {notification.icon}
                      </Text>
                      <Text 
                        style={[
                          styles.notificationTitle, 
                          { 
                            fontSize: fontSize(14),
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                          }
                        ]}
                      >
                        {notification.title}
                      </Text>
                      {!notification.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteNotification(notification.id)}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={16} color="#6B7280" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text 
                    style={[
                      styles.notificationMessage, 
                      { 
                        fontSize: fontSize(13),
                        opacity: notification.isRead ? 0.7 : 1,
                      }
                    ]}
                  >
                    {notification.message}
                  </Text>
                  
                  <View style={styles.notificationFooter}>
                    <Text style={[styles.notificationTime, { fontSize: fontSize(11) }]}>
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                    {notification.actionText && (
                      <Text style={[styles.actionLink, { fontSize: fontSize(11) }]}>
                        {notification.actionText}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </ResponsiveCard>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  actionText: {
    color: '#10B981',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  notificationsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#D1D5DB',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  notificationItem: {
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 4,
  },
  notificationMessage: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    lineHeight: 18,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  actionLink: {
    color: '#10B981',
    fontFamily: 'Inter-Medium',
  },
});
