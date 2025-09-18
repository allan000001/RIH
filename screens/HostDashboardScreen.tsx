import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeIn,
  FadeInDown,
  SlideInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { Card, CardHeader, CardContent } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { IconSymbol } from '@/components/design-system/icon-symbol';
import { StatusIndicator } from '@/components/design-system/status-indicator';
import { useApp } from '@/lib/app-context';
import { QRCodeGenerator } from '@/components/qr-code-generator';
import { useTheme } from '@/lib/useTheme';
import { Theme } from '@/constants/theme';
import { BadgeSystem, Badge } from '@/features/gamification/badge-system';
import { ConfettiEffect } from '@/features/gamification/confetti-effect';

const { width } = Dimensions.get('window');

interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  pendingRequests: number;
  totalDataShared: string;
  currentBandwidth: string;
  uptimeHours: number;
}

interface BandwidthData {
  timestamp: string;
  upload: number;
  download: number;
}

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'First Share',
    description: 'Share your internet connection for the first time.',
    icon: 'share',
    rarity: 'common',
    unlockedAt: new Date(),
  },
  {
    id: '2',
    name: 'Power Host',
    description: 'Share your connection for over 24 hours.',
    icon: 'bolt.fill',
    rarity: 'rare',
    progress: 12,
    maxProgress: 24,
  },
  {
    id: '3',
    name: 'Community Helper',
    description: 'Help 5 friends get online.',
    icon: 'person.2.fill',
    rarity: 'epic',
    unlockedAt: new Date(),
  },
  {
    id: '4',
    name: 'Speed Demon',
    description: 'Reach a connection speed of over 50 Mbps.',
    icon: 'gauge.high',
    rarity: 'legendary',
    progress: 45,
    maxProgress: 50,
  },
];

export default function HostDashboardScreen() {
  const { state } = useApp();
  const { userRole, isSharing } = state;
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasSharedOnce, setHasSharedOnce] = useState(false);
  const [stats, setStats] = useState<ConnectionStats>({
    totalConnections: 12,
    activeConnections: 3,
    pendingRequests: 2,
    totalDataShared: '45.2 GB',
    currentBandwidth: '12.5 Mbps',
    uptimeHours: 72,
  });

  const [bandwidthData] = useState<BandwidthData[]>([
    { timestamp: '12:00', upload: 8.2, download: 15.3 },
    { timestamp: '12:05', upload: 12.1, download: 18.7 },
    { timestamp: '12:10', upload: 15.5, download: 22.1 },
    { timestamp: '12:15', upload: 9.8, download: 16.4 },
    { timestamp: '12:20', upload: 18.2, download: 25.8 },
  ]);

  const statsAnimations = Array.from({ length: 4 }, () => useSharedValue(0));

  useEffect(() => {
    // Animate stats cards on mount
    statsAnimations.forEach((anim, index) => {
      anim.value = withDelay(index * 100, withSpring(1, { damping: 15 }));
    });
  }, []);

  useEffect(() => {
    if (isSharing && !hasSharedOnce) {
      setShowConfetti(true);
      setHasSharedOnce(true);
    }
  }, [isSharing, hasSharedOnce]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        activeConnections: Math.floor(Math.random() * 5) + 1,
        currentBandwidth: `${(Math.random() * 20 + 5).toFixed(1)} Mbps`,
      }));
      setRefreshing(false);
    }, 1000);
  };

  const handleShowQRCode = () => {
    setShowQRCode(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const generateQRData = () => {
    return JSON.stringify({
      type: 'airlink-host',
      hostId: state.hostId || 'SwiftLink123',
      hostName: `${state.deviceName || 'My Device'}`,
      deviceType: 'Mobile Device',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn} style={styles.header}>
          <View>
            <Text
              style={styles.greeting}
              accessibilityRole="header"
              accessibilityLabel="Good morning, Host"
            >
              Good morning, Host
            </Text>
            <Text
              style={styles.subtitle}
              accessibilityLabel="Manage your internet sharing"
            >
              Manage your internet sharing
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/modal')}
              accessibilityLabel="Open settings"
              accessibilityHint="Opens the settings and profile screen"
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
            <StatusIndicator
              status={isSharing ? 'connected' : 'disconnected'}
            />
          </View>
        </Animated.View>

        {/* Hero Card */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.heroCard}>
          <Card variant="elevated" role="host">
            <CardContent style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>
                  {isSharing ? 'Sharing Internet' : 'Not Sharing'}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {isSharing ? `${stats.activeConnections} devices connected` : 'Toggle the switch in the header to start sharing'}
                </Text>
              </View>

              {isSharing && (
                <Animated.View entering={FadeInDown.delay(300)} style={styles.waveContainer}>
                  <View style={styles.waveAnimation} />
                </Animated.View>
              )}
            </CardContent>
          </Card>
        </Animated.View>

        {/* Achievements Section */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <BadgeSystem badges={mockBadges} />
        </Animated.View>

        {/* Quick Scan & Connect */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.quickScanCard}>
          <Card variant="default">
            <CardHeader>
              <Text style={styles.quickScanTitle}>
                Quick Scan & Connect
              </Text>
              <Text style={styles.quickScanSubtitle}>
                Scan a code to connect instantly
              </Text>
            </CardHeader>
            <CardContent>
              <View style={styles.scanButtonsContainer}>
                <Button
                  title={userRole === 'host' ? "📱 Share QR" : "📱 Scan QR"}
                  variant="outline"
                  size="medium"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (userRole === 'host') {
                      handleShowQRCode();
                    } else {
                      router.push('/(tabs)/connect');
                    }
                  }}
                  style={styles.scanButton}
                />
                <Button
                  title="📡 Nearby Scan"
                  variant="outline"
                  size="medium"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/(tabs)/connect');
                  }}
                  style={styles.scanButton}
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Live Status Cards */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.liveStatusSection}>
          <Text style={styles.sectionTitle}>
            Live Status
          </Text>
          <View style={styles.liveStatusCards}>
            <Card variant="elevated" style={styles.bandwidthCard}>
              <CardContent>
                <View style={styles.bandwidthHeader}>
                  <Text style={styles.bandwidthTitle}>
                    Bandwidth Usage
                  </Text>
                  <Text style={styles.bandwidthValue}>
                    {stats.currentBandwidth}
                  </Text>
                </View>
                <View style={styles.bandwidthGraph}>
                  {/* Animated bandwidth bars */}
                  {Array.from({ length: 12 }).map((_, index) => (
                    <Animated.View
                      key={index}
                      entering={SlideInUp.delay(600 + index * 50)}
                      style={[
                        styles.bandwidthBar,
                        {
                          height: Math.random() * 40 + 10,
                          backgroundColor: theme.colors.primary,
                          opacity: 0.7 + Math.random() * 0.3,
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.bandwidthLabels}>
                  <Text style={styles.bandwidthLabelLarge}>
                    Upload: 2.1 MB/s
                  </Text>
                  <Text style={styles.bandwidthLabelLarge}>
                    Download: 8.4 MB/s
                  </Text>
                </View>
              </CardContent>
            </Card>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.recentActivitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent Activity
            </Text>
            <Button
              title="View All"
              variant="ghost"
              size="small"
              onPress={() => {}}
              style={styles.viewAllButton}
            />
          </View>
          <View style={styles.activityList}>
            {[
              { time: '2 min ago', action: 'Device connected', device: 'iPhone 14 Pro', type: 'connect' },
              { time: '15 min ago', action: 'Data transfer completed', device: 'MacBook Air', type: 'transfer' },
              { time: '1 hour ago', action: 'Device disconnected', device: 'iPad Pro', type: 'disconnect' },
            ].map((activity, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(700 + index * 100)}
                style={styles.activityItem}
              >
                <View style={[styles.activityIcon, {
                  backgroundColor: activity.type === 'connect' ? theme.colors.success + '20' :
                                 activity.type === 'transfer' ? theme.colors.primary + '20' :
                                 theme.colors.textSecondary + '20'
                }]}>
                  <IconSymbol
                    name={activity.type === 'connect' ? 'plus.circle.fill' as any :
                          activity.type === 'transfer' ? 'arrow.up.arrow.down' as any :
                          'minus.circle.fill' as any}
                    size={16}
                    color={activity.type === 'connect' ? theme.colors.success :
                           activity.type === 'transfer' ? theme.colors.primary :
                           theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>
                    {activity.action}
                  </Text>
                  <Text style={styles.activityDevice}>
                    {activity.device}
                  </Text>
                </View>
                <Text style={styles.activityTime}>
                  {activity.time}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Community/Invite Card */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.communityCard}>
          <Card variant="elevated" role="host">
            <CardContent>
              <View style={styles.communityHeader}>
                <View style={styles.communityTitleContainer}>
                  <Text style={styles.communityTitle}>
                    🌟 Invite Friends
                  </Text>
                  <Text style={styles.communitySubtitle}>
                    Share the connection, earn rewards
                  </Text>
                </View>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardBadgeText}>+50 pts</Text>
                </View>
              </View>

              <View style={styles.inviteStats}>
                <View style={styles.inviteStat}>
                  <Text style={styles.inviteStatNumber}>3</Text>
                  <Text style={styles.inviteStatLabel}>Invited</Text>
                </View>
                <View style={styles.inviteStat}>
                  <Text style={[styles.inviteStatNumber, { color: theme.colors.success }]}>2</Text>
                  <Text style={styles.inviteStatLabel}>Joined</Text>
                </View>
                <View style={styles.inviteStat}>
                  <Text style={[styles.inviteStatNumber, { color: theme.colors.warning }]}>150</Text>
                  <Text style={styles.inviteStatLabel}>Points</Text>
                </View>
              </View>

              <View style={styles.inviteActions}>
                <Button
                  title="Share Link"
                  variant="primary"
                  size="medium"
                  role="host"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={styles.inviteButton}
                />
                <Button
                  title="QR Code"
                  variant="outline"
                  size="medium"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={styles.inviteButton}
                />
              </View>

              {/* Progress bar for next reward */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    Next reward: 5 more invites
                  </Text>
                  <Text style={styles.progressValue}>
                    60%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <Animated.View
                    entering={SlideInRight.delay(800)}
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: theme.colors.primary,
                        width: '60%'
                      }
                    ]}
                  />
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { title: 'Active Connections', value: stats.activeConnections.toString(), icon: 'link', color: theme.colors.success },
            { title: 'Pending Requests', value: stats.pendingRequests.toString(), icon: 'bell', color: theme.colors.warning },
            { title: 'Data Shared Today', value: stats.totalDataShared, icon: 'arrow.up.circle', color: theme.colors.primary },
            { title: 'Uptime', value: `${stats.uptimeHours}h`, icon: 'checkmark.circle.fill', color: theme.colors.success },
          ].map((stat, index) => {
            const animatedStyle = useAnimatedStyle(() => ({
              transform: [{ scale: statsAnimations[index].value }],
              opacity: statsAnimations[index].value,
            }));

            return (
              <Animated.View
                key={stat.title}
                entering={SlideInUp.delay(300 + index * 100)}
                style={styles.statCard}
              >
                <Card variant="default">
                  <CardContent>
                    <View style={styles.statContent}>
                      <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                        <IconSymbol name={stat.icon as any} size={24} color={stat.color} />
                      </View>
                      <Text style={styles.statValue}>
                        {stat.value}
                      </Text>
                      <Text style={styles.statTitle}>
                        {stat.title}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            );
          })}
        </View>

        {/* Bandwidth Chart */}
        <Animated.View entering={SlideInRight.delay(600)} style={styles.chartCard}>
          <Card variant="elevated">
            <CardHeader>
              <Text style={styles.chartTitle}>
                Bandwidth Usage
              </Text>
              <Text style={styles.chartSubtitle}>
                Last 24 hours
              </Text>
            </CardHeader>
            <CardContent>
              <View style={styles.chartContainer}>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={styles.legendText}>Upload</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.secondary }]} />
                    <Text style={styles.legendText}>Download</Text>
                  </View>
                </View>

                {/* Simple bar chart representation */}
                <View style={styles.chart}>
                  {bandwidthData.map((data, index) => (
                    <View key={index} style={styles.chartBar}>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: (data.upload / 30) * 100,
                              backgroundColor: theme.colors.primary,
                            }
                          ]}
                        />
                        <View
                          style={[
                            styles.bar,
                            {
                              height: (data.download / 30) * 100,
                              backgroundColor: theme.colors.secondary,
                            }
                          ]}
                        />
                      </View>
                      <Text style={styles.chartLabel}>
                        {data.timestamp.split(':')[1]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.actionsCard}>
          <Card variant="default">
            <CardHeader>
              <Text style={styles.actionsTitle}>
                Quick Actions
              </Text>
            </CardHeader>
            <CardContent>
              <View style={styles.actionsGrid}>
                <Button
                  title="Manage Connections"
                  variant="outline"
                  size="medium"
                  role="host"
                  onPress={() => {}}
                />
                <Button
                  title="View Analytics"
                  variant="outline"
                  size="medium"
                  role="host"
                  onPress={() => {}}
                />
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      </ScrollView>
       {/* QR Code Modal */}
       {showQRCode && (
          <Animated.View
            entering={FadeIn}
            style={styles.qrModal}
          >
            <TouchableOpacity
              style={styles.qrModalOverlay}
              onPress={() => setShowQRCode(false)}
            />
            <Animated.View
              entering={SlideInUp.delay(100)}
              style={styles.qrModalContent}
            >
              <View style={styles.qrModalHeader}>
                <Text style={styles.qrModalTitle}>
                  Share Your Connection
                </Text>
                <TouchableOpacity
                  onPress={() => setShowQRCode(false)}
                  style={styles.qrModalClose}
                >
                  <IconSymbol name="xmark" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.qrCodeContainer}>
                <QRCodeGenerator
                  value={generateQRData()}
                  size={200}
                  title="Scan to Connect"
                  backgroundColor={theme.colors.card}
                  foregroundColor={theme.colors.text}
                />
              </View>

              <Text style={styles.qrModalSubtitle}>
                Others can scan this code to connect to your shared internet
              </Text>

              <View style={styles.qrModalActions}>
                <Button
                  title="Share Code"
                  variant="primary"
                  onPress={() => {
                    // Implement sharing functionality
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={styles.qrShareButton}
                />
              </View>
            </Animated.View>
          </Animated.View>
        )}
        <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[5],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  settingsButton: {
    padding: theme.spacing[2],
    borderRadius: theme.radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: theme.fontSizes.xl,
  },
  heroCard: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  heroContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[8],
    position: 'relative',
    overflow: 'hidden',
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.bold,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
    color: theme.colors.text,
  },
  heroSubtitle: {
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    overflow: 'hidden',
  },
  waveAnimation: {
    width: '200%',
    height: 100,
    backgroundColor: theme.colors.primary + '1A', // 10% opacity
    borderRadius: 50,
    position: 'absolute',
    bottom: -50,
    left: '-50%',
  },
  quickScanCard: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  quickScanTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
  },
  quickScanSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  scanButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  scanButton: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing[1],
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing[6],
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  statCard: {
    width: (width - (theme.spacing[6] * 2) - theme.spacing[3]) / 2,
  },
  statContent: {
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
  },
  statTitle: {
    fontSize: theme.fontSizes.xs,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  chartCard: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  chartTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
  },
  chartSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  chartContainer: {
    paddingTop: theme.spacing[4],
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing[6],
    marginBottom: theme.spacing[4],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: theme.radii.full,
  },
  legendText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: theme.spacing[4],
  },
  chartBar: {
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 100,
  },
  bar: {
    width: 8,
    borderRadius: theme.radii.sm,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  actionsCard: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  actionsTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  liveStatusSection: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing[4],
    color: theme.colors.text,
  },
  liveStatusCards: {
    gap: theme.spacing[4],
  },
  bandwidthCard: {
    padding: theme.spacing[1],
  },
  bandwidthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  bandwidthTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
  },
  bandwidthValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
  },
  bandwidthGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    marginBottom: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
  },
  bandwidthBar: {
    width: 6,
    borderRadius: theme.radii.sm,
    minHeight: 4,
  },
  bandwidthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bandwidthLabelLarge: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  recentActivitySection: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  viewAllButton: {
    paddingHorizontal: 0,
  },
  activityList: {
    gap: theme.spacing[3],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    gap: theme.spacing[3],
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: 2,
    color: theme.colors.text,
  },
  activityDevice: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  activityTime: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  communityCard: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[4],
  },
  communityTitleContainer: {
    flex: 1,
  },
  communityTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing[1],
    color: theme.colors.text,
  },
  communitySubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  rewardBadge: {
    backgroundColor: theme.colors.badge,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.radii.lg,
  },
  rewardBadgeText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primaryContrast,
  },
  inviteStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
  },
  inviteStat: {
    alignItems: 'center',
  },
  inviteStatNumber: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing[1],
    color: theme.colors.primary,
  },
  inviteStatLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  inviteButton: {
    flex: 1,
  },
  progressContainer: {
    marginTop: theme.spacing[2],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  progressLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radii.full,
  },
  qrModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  qrModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  qrModalContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -width * 0.4 }, { translateY: -200 }],
    width: width * 0.8,
    maxWidth: 400,
    borderRadius: theme.radii.lg,
    padding: theme.spacing[6],
    backgroundColor: theme.colors.card,
    ...theme.shadows.lg,
  },
  qrModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[6],
  },
  qrModalTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
  },
  qrModalClose: {
    padding: theme.spacing[2],
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  qrModalSubtitle: {
    fontSize: theme.fontSizes.sm,
    textAlign: 'center',
    lineHeight: theme.lineHeights.loose,
    marginBottom: theme.spacing[6],
    color: theme.colors.textSecondary,
  },
  qrModalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  qrShareButton: {
    minWidth: 120,
  },
});
