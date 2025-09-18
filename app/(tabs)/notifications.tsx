import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Layout,
  FadeOut,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/design-system/button';
import { Card, CardContent } from '@/components/design-system/card';
import { IconSymbol } from '@/components/design-system/icon-symbol';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/app-context';
import { Theme } from '@/constants/theme';
import { api } from '@/services/api';

/**
 * @interface Notification
 * @description Represents a notification item.
 */
interface Notification {
  id: string;
  type: 'connection_request' | 'connection_approved' | 'connection_denied' | 'data_usage' | 'system' | 'achievement' | 'milestone';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  priority?: 'low' | 'medium' | 'high';
  reward?: {
    type: 'badge' | 'points' | 'streak';
    value: string | number;
  };
}

/**
 * NotificationsScreen
 * @description This screen displays a list of notifications for the user.
 */
export default function NotificationsScreen() {
  const { theme, colorScheme } = useTheme();
  const styles = getStyles(theme);
  const { state } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const fetchedNotifications = await api.getNotifications();
    setNotifications(fetchedNotifications);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'connection_request':
        return 'person.badge.plus';
      case 'connection_approved':
        return 'checkmark.circle.fill';
      case 'connection_denied':
        return 'xmark.circle.fill';
      case 'data_usage':
        return 'chart.bar.fill';
      case 'system':
        return 'gear';
      case 'achievement':
        return 'trophy.fill';
      case 'milestone':
        return 'flame.fill';
      default:
        return 'bell.fill';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'connection_request':
        return theme.colors.warning;
      case 'connection_approved':
        return theme.colors.success;
      case 'connection_denied':
        return theme.colors.error;
      case 'data_usage':
        return theme.colors.progress;
      case 'system':
        return theme.colors.textSecondary;
      case 'achievement':
        return theme.colors.badge;
      case 'milestone':
        return '#FF6B35'; // Custom color
      default:
        return theme.colors.primary;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllRead = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotifications([]);
  };

  const handleAddNewNotification = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'system',
      title: 'New System Notification',
      message: 'This is a new notification added for testing purposes.',
      timestamp: new Date(),
      read: false,
      priority: 'medium',
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Enhanced Notification Card Component
  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const scaleAnimation = useSharedValue(1);

    const cardStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnimation.value }],
    }));

    const handlePress = () => {
      scaleAnimation.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      
      if (!notification.read) {
        runOnJS(handleMarkAsRead)(notification.id);
      }
    };

    return (
      <Animated.View layout={Layout.springify()} exiting={FadeOut}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
          <Card
            variant={notification.read ? 'default' : 'elevated'}
            style={[
              styles.notificationCard,
              notification.read && { opacity: 0.7 },
            ]}
          >
            <CardContent>
              <View style={styles.notificationContent}>
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: getNotificationColor(notification.type) + '20' }
                ]}>
                  <IconSymbol
                    name={getNotificationIcon(notification.type) as any}
                    size={20}
                    color={getNotificationColor(notification.type)}
                  />
                </View>
                
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{formatTimestamp(notification.timestamp)}</Text>
                </View>
                
                {!notification.read && (
                  <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
                )}
              </View>
            </CardContent>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Activity</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerActions}>
            <Button
              title="Add"
              variant="ghost"
              size="small"
              onPress={handleAddNewNotification}
            />
            <Button
              title="Mark All Read"
              variant="ghost"
              size="small"
              onPress={handleMarkAllRead}
            />
            {notifications.length > 0 && (
              <Button
                title="Clear All"
                variant="ghost"
                size="small"
                onPress={handleClearAll}
              />
            )}
          </View>
        </Animated.View>

        {/* Notifications List */}
        {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
                <View key={index} style={styles.skeletonCard} />
            ))
        ) : notifications.length === 0 ? (
          <Animated.View entering={SlideInDown.delay(200)} style={styles.emptyState}>
            <Card variant="default">
              <CardContent>
                <View style={styles.emptyContent}>
                  <IconSymbol name="bell" size={64} color={theme.colors.textSecondary} />
                  <Text style={styles.emptyTitle}>You're All Caught Up!</Text>
                  <Text style={styles.emptySubtitle}>No new notifications at the moment</Text>
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[16],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
  },
  unreadBadge: {
    marginLeft: theme.spacing[3],
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: theme.radii.full,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: theme.colors.primaryContrast,
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
  },
  emptyState: {
    marginTop: theme.spacing[12],
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing[10],
  },
  emptyTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semibold,
    marginTop: theme.spacing[5],
    marginBottom: theme.spacing[2],
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  notificationsList: {
    gap: theme.spacing[3],
  },
  notificationCard: {
    marginBottom: theme.spacing[1],
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: theme.spacing[1],
    color: theme.colors.text,
  },
  notificationMessage: {
    fontSize: theme.fontSizes.sm,
    lineHeight: theme.lineHeights.loose,
    marginBottom: theme.spacing[1],
    color: theme.colors.textSecondary,
  },
  notificationTime: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.full,
    marginTop: theme.spacing[1],
  },
  skeletonCard: {
      height: 100,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radii.lg,
      marginBottom: theme.spacing[3],
  }
});
