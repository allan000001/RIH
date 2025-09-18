import * as Haptics from 'expo-haptics';
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
  SlideInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/input';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
// import { useColorScheme } from '@/hooks/use-color-scheme'; // Removed for forced dark mode

const { width } = Dimensions.get('window');

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

export default function ConnectionsScreen() {
  const colorScheme = 'dark'; // Force dark mode
  const colors = Colors.dark;
  const { state } = useApp();
  const { userRole } = state;
  
  // Ensure colors object has required properties
  const safeColors = {
    ...colors,
    text: colors.text || '#000000',
    tabIconDefault: colors.tabIconDefault || '#666666',
  };
  const roleColors = userRole ? Colors[userRole].dark : colors;

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('connectedAt');
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock connections data
  const [connections] = useState<Connection[]>([
    {
      id: '1',
      name: 'Sarah\'s iPhone',
      deviceType: 'iPhone 15 Pro',
      status: 'connected',
      connectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      dataUsed: 1250,
      bandwidth: 15.2,
      location: 'New York, NY',
      avatar: '👩‍💻',
      trustLevel: 'high',
    },
    {
      id: '2',
      name: 'John\'s MacBook',
      deviceType: 'MacBook Pro M3',
      status: 'connected',
      connectedAt: new Date(Date.now() - 45 * 60 * 1000),
      dataUsed: 2100,
      bandwidth: 22.8,
      location: 'San Francisco, CA',
      avatar: '👨‍💼',
      trustLevel: 'high',
    },
    {
      id: '3',
      name: 'Alex\'s Android',
      deviceType: 'Samsung Galaxy S24',
      status: 'pending',
      dataUsed: 0,
      bandwidth: 0,
      location: 'Los Angeles, CA',
      avatar: '🧑‍🎓',
      trustLevel: 'medium',
    },
    {
      id: '4',
      name: 'Emma\'s iPad',
      deviceType: 'iPad Air',
      status: 'connecting',
      dataUsed: 0,
      bandwidth: 8.5,
      location: 'Chicago, IL',
      avatar: '👩‍🎨',
      trustLevel: 'medium',
    },
  ]);

  const filterAnimations = Array.from({ length: 4 }, () => useSharedValue(0));
  const bulkActionsAnimation = useSharedValue(0);

  useEffect(() => {
    // Animate filter buttons
    filterAnimations.forEach((anim, index) => {
      anim.value = withDelay(index * 100, withSpring(1, { damping: 15 }));
    });
  }, []);

  useEffect(() => {
    bulkActionsAnimation.value = withSpring(showBulkActions ? 1 : 0, { damping: 15 });
  }, [showBulkActions]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
    // Update connection status
  };

  const handleReject = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    // Remove connection
  };

  const handleDisconnect = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // Disconnect connection
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

  const getStatusColor = (status: Connection['status']) => {
    switch (status) {
      case 'connected': return colors.success;
      case 'connecting': return colors.warning;
      case 'pending': return colors.warning;
      case 'disconnected': return colors.error;
      default: return colors.tabIconDefault;
    }
  };

  const getTrustLevelColor = (level: Connection['trustLevel']) => {
    switch (level) {
      case 'high': return colors.success;
      case 'medium': return colors.warning;
      case 'low': return colors.error;
      default: return colors.tabIconDefault;
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
              <View style={[styles.skeletonAvatar, { backgroundColor: colors.tabIconDefault + '20' }]} />
              <View style={styles.skeletonInfo}>
                <View style={[styles.skeletonLine, styles.skeletonTitle, { backgroundColor: colors.tabIconDefault + '20' }]} />
                <View style={[styles.skeletonLine, styles.skeletonSubtitle, { backgroundColor: colors.tabIconDefault + '15' }]} />
              </View>
              <View style={[styles.skeletonStatus, { backgroundColor: colors.tabIconDefault + '20' }]} />
            </View>
            <View style={styles.skeletonStats}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.skeletonStat, { backgroundColor: colors.tabIconDefault + '15' }]} />
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
    style, 
    delay 
  }: { 
    connection: Connection; 
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onDisconnect?: (id: string) => void;
    style?: any;
    delay?: number;
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
        {/* Left Action (Approve for pending) */}
        {connection.status === 'pending' && (
          <Animated.View style={[styles.swipeAction, styles.leftAction, leftActionStyle]}>
            <IconSymbol name="checkmark.circle.fill" size={32} color="#10B981" />
            <Text style={[styles.swipeActionText, { color: '#10B981' }]}>Approve</Text>
          </Animated.View>
        )}

        {/* Right Action (Reject/Disconnect) */}
        <Animated.View style={[styles.swipeAction, styles.rightAction, rightActionStyle]}>
          <IconSymbol 
            name={connection.status === 'connected' ? "xmark.circle.fill" : "trash.circle.fill"} 
            size={32} 
            color="#EF4444" 
          />
          <Text style={[styles.swipeActionText, { color: '#EF4444' }]}>
            {connection.status === 'connected' ? 'Disconnect' : 'Reject'}
          </Text>
        </Animated.View>

        <GestureDetector gesture={gestureHandler}>
          <Animated.View style={cardStyle}>
            <Card 
              variant="default" 
              style={(() => {
                const baseStyle = styles.connectionCard;
                const selectedStyle = selectedConnections.includes(connection.id) 
                  ? { borderColor: roleColors.primary, borderWidth: 2 }
                  : {};
                return { ...baseStyle, ...selectedStyle };
              })()}
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
                        <Text style={[styles.connectionName, { color: safeColors.text }]}>
                          {connection.name}
                        </Text>
                        <Text style={[styles.connectionDevice, { color: safeColors.tabIconDefault }]}>
                          {connection.deviceType}
                        </Text>
                        <Text style={[styles.connectionLocation, { color: safeColors.tabIconDefault }]}>
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
                      <IconSymbol name="arrow.up.circle" size={16} color={colors.tabIconDefault} />
                      <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
                        Data Used
                      </Text>
                      <Text style={[styles.statValue, { color: safeColors.text }]}>
                        {formatDataUsage(connection.dataUsed)}
                      </Text>
                    </View>

                    {connection.status === 'connected' && (
                      <View style={styles.statItem}>
                        <IconSymbol name="arrow.clockwise.circle" size={16} color={colors.success} />
                        <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
                          Speed
                        </Text>
                        <Text style={[styles.statValue, { color: safeColors.text }]}>
                          {connection.bandwidth.toFixed(1)} Mbps
                        </Text>
                      </View>
                    )}

                    <View style={styles.statItem}>
                      <IconSymbol name="clock" size={16} color={colors.tabIconDefault} />
                      <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
                        Last Seen
                      </Text>
                      <Text style={[styles.statValue, { color: safeColors.text }]}>
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <IconSymbol name="person.2" size={64} color={colors.tabIconDefault} />
          <Text style={[styles.emptyTitle, { color: safeColors.text }]}>
            Connections
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.tabIconDefault }]}>
            This feature is only available for hosts
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <View>
          <Text style={[styles.title, { color: safeColors.text }]}>
            Connections
          </Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
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
                      backgroundColor: roleColors.primary,
                    }
                  ]}
                  onPress={() => setSelectedFilter(filter.key as FilterType)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    { color: selectedFilter === filter.key ? 'white' : safeColors.text }
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
                <Text style={[styles.bulkActionsText, { color: safeColors.text }]}>
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
            filteredConnections.map((connection, index) => (
              <SwipeableConnectionCard
                key={connection.id}
                connection={connection}
                onApprove={handleApprove}
                onReject={handleReject}
                onDisconnect={handleDisconnect}
                style={{ marginBottom: 12 }}
                delay={index * 100}
              />
            ))
          )}
        </View>

        {filteredConnections.length === 0 && (
          <Animated.View entering={FadeIn.delay(600)} style={styles.emptyState}>
            <IconSymbol name="magnifyingglass" size={64} color={colors.tabIconDefault} />
            <Text style={[styles.emptyTitle, { color: safeColors.text }]}>
              No connections found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.tabIconDefault }]}>
              {searchQuery ? 'Try adjusting your search or filters' : 'Share your Host ID to get started'}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchInput: {
    marginBottom: 16,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingRight: 24,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bulkActions: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  bulkActionsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulkActionsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bulkActionsButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  scrollView: {
    flex: 1,
  },
  connectionsList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 120,
  },
  connectionCard: {
    marginBottom: 0,
  },
  connectionContent: {
    gap: 12,
    padding: 4,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  connectionInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
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
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionDetails: {
    flex: 1,
    gap: 2,
  },
  connectionName: {
    fontSize: 18,
    fontWeight: '600',
  },
  connectionDevice: {
    fontSize: 14,
  },
  connectionLocation: {
    fontSize: 12,
  },
  connectionStatus: {
    alignItems: 'flex-end',
  },
  connectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  connectionActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Swipe gesture styles
  swipeContainer: {
    position: 'relative',
    marginBottom: 16,
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
    backgroundColor: '#10B981',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightAction: {
    right: 0,
    backgroundColor: '#EF4444',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  swipeActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  // Skeleton loading styles
  skeletonCard: {
    marginBottom: 16,
  },
  skeletonContent: {
    gap: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  skeletonInfo: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
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
    borderRadius: 12,
  },
  skeletonStats: {
    flexDirection: 'row',
    gap: 16,
  },
  skeletonStat: {
    flex: 1,
    height: 40,
    borderRadius: 8,
  },
});
