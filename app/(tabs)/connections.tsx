import * as Haptics from 'expo-haptics';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/design-system/button';
import { Card, CardContent } from '@/components/design-system/card';
import { IconSymbol } from '@/components/design-system/icon-symbol';
import { Input } from '@/components/design-system/input';
import { StatusIndicator } from '@/components/design-system/status-indicator';
import { useApp } from '@/lib/app-context';
import { useTheme } from '@/lib/useTheme';
import { Theme } from '@/constants/theme';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');

/**
 * @interface Connection
 * @description Represents a connection to the host.
 */
interface Connection {
  id: string;
  name: string;
  deviceType: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'pending';
  connectedAt?: Date;
  dataUsed: number;
  bandwidth: number;
  location: string;
  avatar: string;
  trustLevel: 'high' | 'medium' | 'low';
}

type FilterType = 'all' | 'connected' | 'pending' | 'disconnected';
type SortType = 'name' | 'dataUsed' | 'connectedAt' | 'trustLevel';

/**
 * ConnectionsScreen
 * @description This screen displays a list of connections for the host, with options to filter, sort, and manage them.
 */
export default function ConnectionsScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { state } = useApp();
  const { userRole } = state;

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('connectedAt');
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const filterAnimations = Array.from({ length: 4 }, () => useSharedValue(0));
  const bulkActionsAnimation = useSharedValue(0);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    // Animate filter buttons
    filterAnimations.forEach((anim, index) => {
      anim.value = withDelay(index * 100, withSpring(1, { damping: 15 }));
    });
  }, []);

  useEffect(() => {
    bulkActionsAnimation.value = withSpring(showBulkActions ? 1 : 0, { damping: 15 });
  }, [showBulkActions]);

  const fetchConnections = async () => {
    setLoading(true);
    const fetchedConnections = await api.getConnections();
    setConnections(fetchedConnections);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConnections();
    setRefreshing(false);
  };

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.deviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || conn.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const sortedConnections = [...filteredConnections].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'dataUsed':
        return b.dataUsed - a.dataUsed;
      case 'connectedAt':
        if (!a.connectedAt && !b.connectedAt) return 0;
        if (!a.connectedAt) return 1;
        if (!b.connectedAt) return -1;
        return b.connectedAt.getTime() - a.connectedAt.getTime();
      case 'trustLevel':
        const trustOrder = { high: 3, medium: 2, low: 1 };
        return trustOrder[b.trustLevel] - trustOrder[a.trustLevel];
      default:
        return 0;
    }
  });

  const handleApprove = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Implement API call to approve connection
  };

  const handleReject = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    // TODO: Implement API call to reject connection
  };

  const handleDisconnect = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // TODO: Implement API call to disconnect connection
  };

  const toggleConnectionSelection = (id: string) => {
    setSelectedConnections(prev => 
      prev.includes(id) 
        ? prev.filter(connId => connId !== id)
        : [...prev, id]
    );
    setShowBulkActions(selectedConnections.length > 0 || !selectedConnections.includes(id));
  };

  const handleBulkApprove = () => {
    selectedConnections.forEach(handleApprove);
    setSelectedConnections([]);
    setShowBulkActions(false);
  };

  const handleBulkReject = () => {
    selectedConnections.forEach(handleReject);
    setSelectedConnections([]);
    setShowBulkActions(false);
  };

  const getTrustLevelColor = (level: Connection['trustLevel']) => {
    switch (level) {
      case 'high': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const formatDataUsage = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    if (bytes < 1024) return `${bytes} MB`;
    return `${(bytes / 1024).toFixed(1)} GB`;
  };

  const formatTimeAgo = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const bulkActionsStyle = useAnimatedStyle(() => ({
    opacity: bulkActionsAnimation.value,
    transform: [{ translateY: (1 - bulkActionsAnimation.value) * 50 }],
  }));

  // Skeleton Loading Component
  const ConnectionSkeleton = () => (
    <Animated.View entering={FadeIn} style={styles.skeletonCard}>
      <Card variant="default">
        <CardContent>
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonHeader}>
              <View style={[styles.skeletonAvatar, { backgroundColor: theme.colors.border }]} />
              <View style={styles.skeletonInfo}>
                <View style={[styles.skeletonLine, styles.skeletonTitle, { backgroundColor: theme.colors.border }]} />
                <View style={[styles.skeletonLine, styles.skeletonSubtitle, { backgroundColor: theme.colors.border }]} />
              </View>
              <View style={[styles.skeletonStatus, { backgroundColor: theme.colors.border }]} />
            </View>
            <View style={styles.skeletonStats}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.skeletonStat, { backgroundColor: theme.colors.border }]} />
              ))}
            </View>
          </View>
        </CardContent>
      </Card>
    </Animated.View>
  );

  // Swipeable Connection Card Component
  const SwipeableConnectionCard = React.memo(({ 
    connection, 
    onApprove, 
    onReject, 
    onDisconnect, 
  }: { 
    connection: Connection; 
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onDisconnect?: (id: string) => void;
  }) => {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const gestureHandler = Gesture.Pan()
      .onStart(() => {
        scale.value = withSpring(0.95);
      })
      .onUpdate((event) => {
        translateX.value = event.translationX;
      })
      .onEnd((event) => {
        scale.value = withSpring(1);
        const shouldDismiss = Math.abs(event.translationX) > width * 0.3;
        
        if (shouldDismiss) {
          const direction = event.translationX > 0 ? 1 : -1;
          translateX.value = withTiming(direction * width);
          opacity.value = withTiming(0, undefined, () => {
            if (direction > 0 && connection.status === 'pending' && onApprove) {
              runOnJS(onApprove)(connection.id);
            } else if (direction < 0) {
              if (connection.status === 'pending' && onReject) {
                runOnJS(onReject)(connection.id);
              } else if (connection.status === 'connected' && onDisconnect) {
                runOnJS(onDisconnect)(connection.id);
              }
            }
          });
        } else {
          translateX.value = withSpring(0);
        }
      });

    const cardStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    }));

    const leftActionStyle = useAnimatedStyle(() => ({
      opacity: translateX.value > 50 ? 1 : 0,
      transform: [{ scale: translateX.value > 50 ? 1 : 0.8 }],
    }));

    const rightActionStyle = useAnimatedStyle(() => ({
      opacity: translateX.value < -50 ? 1 : 0,
      transform: [{ scale: translateX.value < -50 ? 1 : 0.8 }],
    }));

    return (
      <View style={styles.swipeContainer}>
        {connection.status === 'pending' && (
          <Animated.View style={[styles.swipeAction, styles.leftAction, leftActionStyle]}>
            <IconSymbol name="checkmark.circle.fill" size={32} color={theme.colors.primaryContrast} />
            <Text style={[styles.swipeActionText, { color: theme.colors.primaryContrast }]}>Approve</Text>
          </Animated.View>
        )}

        <Animated.View style={[styles.swipeAction, styles.rightAction, rightActionStyle]}>
          <IconSymbol 
            name={connection.status === 'connected' ? "xmark.circle.fill" : "trash.circle.fill"} 
            size={32} 
            color={theme.colors.primaryContrast}
          />
          <Text style={[styles.swipeActionText, { color: theme.colors.primaryContrast }]}>
            {connection.status === 'connected' ? 'Disconnect' : 'Reject'}
          </Text>
        </Animated.View>

        <GestureDetector gesture={gestureHandler}>
          <Animated.View style={cardStyle}>
            <Card 
              variant="default" 
              style={[
                styles.connectionCard,
                selectedConnections.includes(connection.id) && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                },
              ]}
            >
              <CardContent>
                <TouchableOpacity
                  style={styles.connectionContent}
                  onLongPress={() => toggleConnectionSelection(connection.id)}
                  onPress={() => selectedConnections.length > 0 && toggleConnectionSelection(connection.id)}
                >
                  <View style={styles.connectionHeader}>
                    <View style={styles.connectionInfo}>
                      <View style={styles.avatarContainer}>
                        <Text style={styles.avatar}>{connection.avatar}</Text>
                        <View style={[
                          styles.trustBadge,
                          { backgroundColor: getTrustLevelColor(connection.trustLevel) + '20' }
                        ]}>
                          <View style={[
                            styles.trustDot,
                            { backgroundColor: getTrustLevelColor(connection.trustLevel) }
                          ]} />
                        </View>
                      </View>
                      
                      <View style={styles.connectionDetails}>
                        <Text style={styles.connectionName}>
                          {connection.name}
                        </Text>
                        <Text style={styles.connectionDevice}>
                          {connection.deviceType}
                        </Text>
                        <Text style={styles.connectionLocation}>
                          📍 {connection.location}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.connectionStatus}>
                      <StatusIndicator
                        status={connection.status as any}
                        size="small"
                        showText={false}
                      />
                    </View>
                  </View>

                  <View style={styles.connectionStats}>
                    <View style={styles.statItem}>
                      <IconSymbol name="arrow.up.circle" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.statLabel}>
                        Data Used
                      </Text>
                      <Text style={styles.statValue}>
                        {formatDataUsage(connection.dataUsed)}
                      </Text>
                    </View>

                    {connection.status === 'connected' && (
                      <View style={styles.statItem}>
                        <IconSymbol name="arrow.clockwise.circle" size={16} color={theme.colors.success} />
                        <Text style={styles.statLabel}>
                          Speed
                        </Text>
                        <Text style={styles.statValue}>
                          {connection.bandwidth.toFixed(1)} Mbps
                        </Text>
                      </View>
                    )}

                    <View style={styles.statItem}>
                      <IconSymbol name="clock" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.statLabel}>
                        Last Seen
                      </Text>
                      <Text style={styles.statValue}>
                        {formatTimeAgo(connection.connectedAt)}
                      </Text>
                    </View>
                  </View>

                  {connection.status === 'pending' && (
                    <View style={styles.connectionActions}>
                      <Button
                        title="Approve"
                        variant="primary"
                        size="small"
                        role="host"
                        onPress={() => handleApprove(connection.id)}
                      />
                      <Button
                        title="Reject"
                        variant="outline"
                        size="small"
                        onPress={() => handleReject(connection.id)}
                      />
                    </View>
                  )}

                  {connection.status === 'connected' && (
                    <View style={styles.connectionActions}>
                      <Button
                        title="Manage"
                        variant="outline"
                        size="small"
                        onPress={() => {}}
                      />
                      <Button
                        title="Details"
                        variant="outline"
                        size="small"
                        onPress={() => {}}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </CardContent>
            </Card>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  });

  if (userRole !== 'host') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <IconSymbol name="person.2" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>
            Connections
          </Text>
          <Text style={styles.emptySubtitle}>
            This feature is only available for hosts
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <View>
          <Text style={styles.title}>
            Connections
          </Text>
          <Text style={styles.subtitle}>
            {filteredConnections.length} total • {filteredConnections.filter(c => c.status === 'connected').length} active
          </Text>
        </View>
      </Animated.View>

      {/* Search and Filters */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.searchSection}>
        <Input
          placeholder="Search connections..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="magnifyingglass"
          style={styles.searchInput}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {[
            { key: 'all', label: 'All', count: connections.length },
            { key: 'connected', label: 'Connected', count: connections.filter(c => c.status === 'connected').length },
            { key: 'pending', label: 'Pending', count: connections.filter(c => c.status === 'pending').length },
            { key: 'disconnected', label: 'Offline', count: connections.filter(c => c.status === 'disconnected').length },
          ].map((filter, index) => {
            const animatedStyle = useAnimatedStyle(() => ({
              opacity: filterAnimations[index].value,
              transform: [{ scale: filterAnimations[index].value }],
            }));

            return (
              <Animated.View key={filter.key} style={animatedStyle}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.key && {
                      backgroundColor: theme.colors.primary,
                    }
                  ]}
                  onPress={() => setSelectedFilter(filter.key as FilterType)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    { color: selectedFilter === filter.key ? theme.colors.primaryContrast : theme.colors.text }
                  ]}>
                    {filter.label} ({filter.count})
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Bulk Actions */}
      {showBulkActions && (
        <Animated.View style={[styles.bulkActions, bulkActionsStyle]}>
          <Card variant="elevated">
            <CardContent>
              <View style={styles.bulkActionsContent}>
                <Text style={styles.bulkActionsText}>
                  {selectedConnections.length} selected
                </Text>
                <View style={styles.bulkActionsButtons}>
                  <Button
                    title="Approve All"
                    variant="primary"
                    size="small"
                    role="host"
                    onPress={handleBulkApprove}
                  />
                  <Button
                    title="Disconnect All"
                    variant="outline"
                    size="small"
                    onPress={() => {}}
                  />
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      )}

      {/* Connections List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Connection List */}
        <View style={styles.connectionsList}>
          {loading ? (
            // Show skeleton loading states
            Array.from({ length: 3 }).map((_, index) => (
              <ConnectionSkeleton key={`skeleton-${index}`} />
            ))
          ) : (
            sortedConnections.map((connection, index) => (
              <SwipeableConnectionCard
                key={connection.id}
                connection={connection}
                onApprove={handleApprove}
                onReject={handleReject}
                onDisconnect={handleDisconnect}
              />
            ))
          )}
        </View>

        {sortedConnections.length === 0 && !loading && (
          <Animated.View entering={FadeIn.delay(600)} style={styles.emptyState}>
            <IconSymbol name="magnifyingglass" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              No connections found
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search or filters' : 'Share your Host ID to get started'}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[5],
  },
  title: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing[1],
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  searchSection: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[5],
  },
  searchInput: {
    marginBottom: theme.spacing[4],
  },
  filtersContainer: {
    marginBottom: theme.spacing[2],
  },
  filtersContent: {
    paddingRight: theme.spacing[6],
    gap: theme.spacing[3],
  },
  filterButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.card,
  },
  filterButtonText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
  },
  bulkActions: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  bulkActionsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulkActionsText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
  },
  bulkActionsButtons: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  scrollView: {
    flex: 1,
  },
  connectionsList: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
    paddingBottom: 120,
  },
  connectionCard: {
    marginBottom: 0,
  },
  connectionContent: {
    gap: theme.spacing[3],
    padding: theme.spacing[1],
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[2],
  },
  connectionInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: theme.spacing[3],
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    fontSize: 32,
    width: 48,
    height: 48,
    textAlign: 'center',
    lineHeight: 48,
  },
  trustBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: theme.radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.full,
  },
  connectionDetails: {
    flex: 1,
    gap: 2,
  },
  connectionName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
  },
  connectionDevice: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  connectionLocation: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  connectionStatus: {
    alignItems: 'flex-end',
  },
  connectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing[3],
    marginTop: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap: theme.spacing[1],
    flex: 1,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
  },
  connectionActions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    justifyContent: 'flex-end',
    marginTop: theme.spacing[3],
    paddingTop: theme.spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[16],
    paddingHorizontal: theme.spacing[8],
  },
  emptyTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
    textAlign: 'center',
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
    lineHeight: theme.lineHeights.loose,
    color: theme.colors.textSecondary,
  },
  // Swipe gesture styles
  swipeContainer: {
    position: 'relative',
    marginBottom: theme.spacing[4],
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  leftAction: {
    left: 0,
    backgroundColor: theme.colors.success,
    borderTopLeftRadius: theme.radii.lg,
    borderBottomLeftRadius: theme.radii.lg,
  },
  rightAction: {
    right: 0,
    backgroundColor: theme.colors.error,
    borderTopRightRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
  },
  swipeActionText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    marginTop: theme.spacing[1],
  },
  // Skeleton loading styles
  skeletonCard: {
    marginBottom: theme.spacing[4],
  },
  skeletonContent: {
    gap: theme.spacing[4],
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.full,
  },
  skeletonInfo: {
    flex: 1,
    gap: theme.spacing[2],
  },
  skeletonLine: {
    height: 12,
    borderRadius: theme.radii.sm,
  },
  skeletonTitle: {
    width: '70%',
  },
  skeletonSubtitle: {
    width: '50%',
  },
  skeletonStatus: {
    width: 60,
    height: 24,
    borderRadius: theme.radii.full,
  },
  skeletonStats: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  skeletonStat: {
    flex: 1,
    height: 40,
    borderRadius: theme.radii.md,
  },
});
