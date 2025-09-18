import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme'; // Removed for forced dark mode
import { useApp } from '@/contexts/app-context';

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

export default function NotificationsScreen() {
  const colorScheme = 'dark'; // Force dark mode
  const { state } = useApp();
  const colors = Colors.dark;
  const roleColors = state.userRole ? Colors[state.userRole].dark : colors;
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'connection_request',
      title: 'New Connection Request',
      message: 'John\'s iPhone wants to connect to your network',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      read: false,
      actionable: true,
      priority: 'high',
    },
    {
      id: '2',
      type: 'achievement',
      title: '🎉 Achievement Unlocked!',
      message: 'Data Sharer - You\'ve shared 10GB of data this month',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      read: false,
      priority: 'medium',
      reward: {
        type: 'badge',
        value: 'Data Sharer',
      },
    },
    {
      id: '3',
      type: 'milestone',
      title: '🔥 Streak Milestone!',
      message: '7-day sharing streak! Keep it up for bonus rewards',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      read: false,
      priority: 'medium',
      reward: {
        type: 'streak',
        value: 7,
      },
    },
    {
      id: '4',
      type: 'data_usage',
      title: 'High Data Usage Alert',
      message: 'Sarah\'s MacBook has used 500MB in the last hour',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: false,
      actionable: true,
      priority: 'medium',
    },
    {
      id: '5',
      type: 'connection_approved',
      title: 'Connection Approved',
      message: 'You are now connected to SwiftLink123',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      read: true,
      priority: 'low',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
        return colors.warning;
      case 'connection_approved':
        return colors.success;
      case 'connection_denied':
        return colors.error;
      case 'data_usage':
        return colors.progress;
      case 'system':
        return colors.neutral;
      case 'achievement':
        return '#FFD700'; // Gold for achievements
      case 'milestone':
        return '#FF6B35'; // Orange for milestones
      default:
        return colors.tint;
    }
  };

  const getPriorityColor = (priority?: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.neutral;
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

  // Action handlers
  const handleApproveConnection = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    // Handle connection approval logic
  };

  const handleRejectConnection = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    // Handle connection rejection logic
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleClaimReward = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    // Handle reward claiming logic
  };

  // Enhanced Notification Card Component
  const NotificationCard = ({ notification, index }: { notification: Notification; index: number }) => {
    const scaleAnimation = useSharedValue(1);
    const glowAnimation = useSharedValue(0);

    useEffect(() => {
      if (notification.type === 'achievement' || notification.type === 'milestone') {
        glowAnimation.value = withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0, { duration: 800 })
        );
      }
    }, []);

    const cardStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnimation.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowAnimation.value * 0.3,
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
      <Animated.View style={cardStyle}>
        {/* Glow effect for achievements */}
        {(notification.type === 'achievement' || notification.type === 'milestone') && (
          <Animated.View style={[styles.glowEffect, glowStyle]} />
        )}
        
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
          <Card
            variant={notification.read ? 'default' : 'elevated'}
            style={[
              styles.notificationCard,
              notification.read && { opacity: 0.7 },
              notification.priority === 'high' && {
                borderLeftWidth: 4,
                borderLeftColor: roleColors?.primary || colors.primary,
              },
              notification.priority === 'low' && { marginBottom: 8 },
              notification.type === 'achievement' && styles.achievementCard,
              notification.type === 'milestone' && styles.milestoneCard,
            ] as any}
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
                  <View style={styles.notificationHeader}>
                    <Text style={[
                      styles.notificationTitle,
                      { color: colors.text },
                      !notification.read && { fontWeight: '600' }
                    ]}>
                      {notification.title}
                    </Text>
                    {notification.priority && (
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(notification.priority) }
                      ]}>
                        <Text style={styles.priorityText}>
                          {notification.priority.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={[styles.notificationMessage, { color: colors.neutral }]}>
                    {notification.message}
                  </Text>
                  
                  {notification.reward && (
                    <View style={styles.rewardContainer}>
                      <IconSymbol 
                        name={notification.reward.type === 'badge' ? 'star.fill' as any : 
                              notification.reward.type === 'streak' ? 'flame.fill' as any : 
                              'plus.circle.fill' as any} 
                        size={16} 
                        color={getNotificationColor(notification.type)} 
                      />
                      <Text style={[styles.rewardText, { color: getNotificationColor(notification.type) }]}>
                        {notification.reward.type === 'badge' ? `Badge: ${notification.reward.value}` :
                         notification.reward.type === 'streak' ? `${notification.reward.value} Day Streak` :
                         `+${notification.reward.value} Points`}
                      </Text>
                    </View>
                  )}
                  
                  <Text style={[styles.notificationTime, { color: colors.neutral }]}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
                
                {!notification.read && (
                  <View style={[styles.unreadDot, { backgroundColor: roleColors?.primary || colors.tint }]} />
                )}
              </View>

              {/* Action buttons for actionable notifications */}
              {notification.actionable && !notification.read && (
                <View style={styles.actionButtons}>
                  {notification.type === 'connection_request' && (
                    <>
                      <Button
                        title="Approve"
                        variant="primary"
                        size="small"
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }}
                        style={styles.actionButton}
                      />
                      <Button
                        title="Reject"
                        variant="outline"
                        size="small"
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        }}
                        style={styles.actionButton}
                      />
                    </>
                  )}
                  
                  {notification.type === 'data_usage' && (
                    <>
                      <Button
                        title="View Details"
                        variant="outline"
                        size="small"
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={styles.actionButton}
                      />
                      <Button
                        title="Set Limit"
                        variant="primary"
                        size="small"
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        }}
                        style={styles.actionButton}
                      />
                    </>
                  )}
                </View>
              )}

              {/* Claim reward button for achievements */}
              {notification.reward && !notification.read && (
                <View style={styles.actionButtons}>
                  <Button
                    title="Claim Reward"
                    variant="primary"
                    size="small"
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                    style={styles.actionButton}
                  />
                </View>
              )}
            </CardContent>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
            <Text style={[styles.title, { color: roleColors?.primary || colors.tint }]}>
              Activity
            </Text>
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          {notifications.length > 0 && (
            <Button
              title="Mark All Read"
              variant="ghost"
              size="small"
              onPress={() => {/* Mark all as read */}}
            />
          )}
        </Animated.View>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Animated.View entering={SlideInDown.delay(200)} style={styles.emptyState}>
            <Card variant="surface" role={state.userRole || 'neutral'}>
              <CardContent>
                <View style={styles.emptyContent}>
                  <IconSymbol name="bell" size={64} color={colors.neutral} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    You're All Caught Up!
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: colors.neutral }]}>
                    No new notifications at the moment
                  </Text>
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification, index) => (
              <Animated.View
                key={notification.id}
                entering={SlideInDown.delay(200 + index * 100)}
              >
                <NotificationCard notification={notification} index={index} />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  unreadBadge: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    marginTop: 60,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    marginBottom: 4,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: '400',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  // Enhanced notification styles
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    minWidth: 80,
  },
  claimButton: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: '#FFD700',
    borderRadius: 16,
    zIndex: -1,
  },
  achievementCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  milestoneCard: {
    borderWidth: 2,
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
  },
});
