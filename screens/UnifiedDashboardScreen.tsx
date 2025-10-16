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
  dataUsedToday: string;
  connectionTime: string;
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
];

const mockAvailableHosts = [
  { name: 'Coffee Shop WiFi', signal: 95 },
  { name: "John's Hotspot", signal: 78 },
  { name: 'Library Access', signal: 88 },
];

export default function UnifiedDashboardScreen() {
  const { state } = useApp();
  const { isSharing, currentConnection } = state;
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
    dataUsedToday: '2.1 GB',
    connectionTime: '4.2h',
  });

  const statsAnimations = Array.from({ length: 4 }, () => useSharedValue(0));

  useEffect(() => {
    statsAnimations.forEach((anim, index) => {
      anim.value = withDelay(index * 100, withSpring(1, { damping: 15 }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSharing && !hasSharedOnce) {
      setShowConfetti(true);
      setHasSharedOnce(true);
    }
  }, [isSharing, hasSharedOnce]);

  const onRefresh = async () => {
    setRefreshing(true);
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
      hostName: state.deviceName || 'My Device',
      deviceType: 'Mobile Device',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  };

  const isConnected = currentConnection?.status === 'connected';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn} style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {isSharing ? 'Good morning, Host' : 'Welcome back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSharing ? 'Manage your internet sharing' : 'Connect & share internet'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/modal')}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
            <StatusIndicator
              status={isSharing ? 'connected' : isConnected ? 'connected' : 'disconnected'}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.heroCard}>
          <Card variant="elevated" role={isSharing ? 'host' : 'connector'}>
            <CardContent style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>
                  {isSharing ? 'Sharing Internet' : isConnected ? 'Connected' : 'Not Connected'}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {isSharing 
                    ? `${stats.activeConnections} devices connected` 
                    : isConnected
                      ? `Connected to ${currentConnection?.name || 'host'}`
                      : 'Toggle switch to share or scan to connect'
                  }
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

        <Animated.View entering={FadeInDown.delay(300)}>
          <BadgeSystem badges={mockBadges} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.quickScanCard}>
          <Card variant="default">
            <CardHeader>
              <Text style={styles.quickScanTitle}>Quick Scan & Connect</Text>
              <Text style={styles.quickScanSubtitle}>Scan or share QR codes</Text>
            </CardHeader>
            <CardContent>
              <View style={styles.scanButtonsContainer}>
                <Button
                  title="📱 Share QR"
                  variant="outline"
                  size="medium"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleShowQRCode();
                  }}
                  style={styles.scanButton}
                />
                <Button
                  title="📱 Scan QR"
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

        {!isSharing && (
          <Animated.View entering={SlideInUp.delay(500)} style={styles.hostsCard}>
            <Card variant="default">
              <CardHeader>
                <Text style={styles.hostsTitle}>Available Hosts Nearby</Text>
                <Text style={styles.hostsSubtitle}>{mockAvailableHosts.length} hosts found</Text>
              </CardHeader>
              <CardContent>
                <View style={styles.hostsList}>
                  {mockAvailableHosts.map((host, index) => (
                    <View key={index} style={styles.hostItem}>
                      <View style={styles.hostInfo}>
                        <IconSymbol name="wifi.router" size={24} color={theme.colors.primary} />
                        <View style={styles.hostDetails}>
                          <Text style={styles.hostName}>{host.name}</Text>
                          <Text style={styles.hostSignal}>Signal: Strong • {host.signal}%</Text>
                        </View>
                      </View>
                      <Button
                        title="Connect"
                        variant="outline"
                        size="small"
                        role="connector"
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      />
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {isSharing && (
          <Animated.View entering={FadeInDown.delay(600)} style={styles.communityCard}>
            <Card variant="elevated" role="host">
              <CardContent>
                <View style={styles.communityHeader}>
                  <View style={styles.communityTitleContainer}>
                    <Text style={styles.communityTitle}>🌟 Invite Friends</Text>
                    <Text style={styles.communitySubtitle}>Share the connection, earn rewards</Text>
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
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    style={styles.inviteButton}
                  />
                  <Button
                    title="QR Code"
                    variant="outline"
                    size="medium"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handleShowQRCode();
                    }}
                    style={styles.inviteButton}
                  />
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Next reward: 5 more invites</Text>
                    <Text style={styles.progressValue}>60%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <Animated.View
                      entering={SlideInRight.delay(800)}
                      style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: '60%' }]}
                    />
                  </View>
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        )}

        <View style={styles.statsGrid}>
          {(isSharing
            ? [
                { title: 'Active Connections', value: stats.activeConnections.toString(), icon: 'link', color: theme.colors.success },
                { title: 'Pending Requests', value: stats.pendingRequests.toString(), icon: 'bell', color: theme.colors.warning },
                { title: 'Data Shared Today', value: stats.totalDataShared, icon: 'arrow.up.circle', color: theme.colors.primary },
                { title: 'Uptime', value: `${stats.uptimeHours}h`, icon: 'checkmark.circle.fill', color: theme.colors.success },
              ]
            : [
                { title: 'Data Used Today', value: stats.dataUsedToday, icon: 'arrow.down.circle', color: theme.colors.primary },
                { title: 'Connection Time', value: stats.connectionTime, icon: 'checkmark.circle.fill', color: theme.colors.success },
                { title: 'Available Hosts', value: mockAvailableHosts.length.toString(), icon: 'wifi.router', color: theme.colors.primary },
                { title: 'Signal Strength', value: '95%', icon: 'antenna.radiowaves.left.and.right', color: theme.colors.success },
              ]
          ).map((stat, index) => {
            const animatedStyle = useAnimatedStyle(() => ({
              transform: [{ scale: statsAnimations[index].value }],
              opacity: statsAnimations[index].value,
            }));

            return (
              <Animated.View key={stat.title} entering={SlideInUp.delay(700 + index * 100)} style={styles.statCard}>
                <Card variant="default">
                  <CardContent>
                    <View style={styles.statContent}>
                      <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                        <IconSymbol name={stat.icon as any} size={24} color={stat.color} />
                      </View>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statTitle}>{stat.title}</Text>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View entering={FadeInDown.delay(1000)} style={styles.actionsCard}>
          <Card variant="default">
            <CardHeader>
              <Text style={styles.actionsTitle}>Quick Actions</Text>
            </CardHeader>
            <CardContent>
              <View style={styles.actionsGrid}>
                {isSharing ? (
                  <>
                    <Button
                      title="Manage Connections"
                      variant="outline"
                      size="medium"
                      role="host"
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/(tabs)/connections');
                      }}
                    />
                    <Button
                      title="View Analytics"
                      variant="outline"
                      size="medium"
                      role="host"
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      title="Find Hosts"
                      variant="outline"
                      size="medium"
                      role="connector"
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/(tabs)/connect');
                      }}
                    />
                    <Button
                      title="Connection History"
                      variant="outline"
                      size="medium"
                      role="connector"
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    />
                  </>
                )}
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      </ScrollView>

      {showQRCode && (
        <Animated.View entering={FadeIn} style={styles.qrModal}>
          <TouchableOpacity style={styles.qrModalOverlay} onPress={() => setShowQRCode(false)} />
          <Animated.View entering={SlideInUp.delay(100)} style={styles.qrModalContent}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>Share Your Connection</Text>
              <TouchableOpacity onPress={() => setShowQRCode(false)} style={styles.qrModalClose}>
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
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing[6], paddingVertical: theme.spacing[5] },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
  settingsButton: { padding: theme.spacing[2], borderRadius: theme.radii.full, justifyContent: 'center', alignItems: 'center' },
  settingsIcon: { fontSize: theme.fontSizes.xl },
  heroCard: { marginHorizontal: theme.spacing[6], marginBottom: theme.spacing[6] },
  heroContent: { alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing[8], position: 'relative', overflow: 'hidden' },
  heroTextContainer: { alignItems: 'center' },
  heroTitle: { fontSize: theme.fontSizes['3xl'], fontWeight: theme.fontWeights.bold, textAlign: 'center', marginBottom: theme.spacing[2], color: theme.colors.text },
  heroSubtitle: { fontSize: theme.fontSizes.md, textAlign: 'center', color: theme.colors.textSecondary },
  waveContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, overflow: 'hidden' },
  waveAnimation: { width: '200%', height: 100, backgroundColor: theme.colors.primary + '1A', borderRadius: 50, position: 'absolute', bottom: -50, left: '-50%' },
  quickScanCard: { marginHorizontal: theme.spacing[6], marginBottom: theme.spacing[6] },
  quickScanTitle: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
  quickScanSubtitle: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary },
  scanButtonsContainer: { flexDirection: 'row', gap: theme.spacing[3] },
  scanButton: { flex: 1 },
  greeting: { fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, marginBottom: theme.spacing[1], color: theme.colors.text },
  subtitle: { fontSize: theme.fontSizes.md, color: theme.colors.textSecondary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: theme.spacing[6], gap: theme.spacing[3], marginBottom: theme.spacing[6] },
  statCard: { width: (width - (theme.spacing[6] * 2) - theme.spacing[3]) / 2 },
  statContent: { alignItems: 'center', gap: theme.spacing[2] },
  statIcon: { width: 48, height: 48, borderRadius: theme.radii.full, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, color: theme.colors.text },
  statTitle: { fontSize: theme.fontSizes.xs, textAlign: 'center', color: theme.colors.textSecondary },
  actionsCard: { marginHorizontal: theme.spacing[6], marginBottom: theme.spacing[6] },
  actionsTitle: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
  actionsGrid: { flexDirection: 'row', gap: theme.spacing[3] },
  communityCard: { marginHorizontal: theme.spacing[6], marginBottom: theme.spacing[6] },
  communityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing[4] },
  communityTitleContainer: { flex: 1 },
  communityTitle: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, marginBottom: theme.spacing[1], color: theme.colors.text },
  communitySubtitle: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary },
  rewardBadge: { backgroundColor: theme.colors.badge, paddingHorizontal: theme.spacing[2], paddingVertical: theme.spacing[1], borderRadius: theme.radii.lg },
  rewardBadgeText: { fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.bold, color: theme.colors.primaryContrast },
  inviteStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: theme.spacing[4], paddingVertical: theme.spacing[3], backgroundColor: theme.colors.background, borderRadius: theme.radii.lg },
  inviteStat: { alignItems: 'center' },
  inviteStatNumber: { fontSize: theme.fontSizes['2xl'], fontWeight: theme.fontWeights.bold, marginBottom: theme.spacing[1], color: theme.colors.primary },
  inviteStatLabel: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary },
  inviteActions: { flexDirection: 'row', gap: theme.spacing[3], marginBottom: theme.spacing[4] },
  inviteButton: { flex: 1 },
  progressContainer: { marginTop: theme.spacing[2] },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[2] },
  progressLabel: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary },
  progressValue: { fontSize: theme.fontSizes.xs, fontWeight: theme.fontWeights.bold, color: theme.colors.primary },
  progressBar: { height: 6, backgroundColor: theme.colors.border, borderRadius: theme.radii.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: theme.radii.full },
  hostsCard: { marginHorizontal: theme.spacing[6], marginBottom: theme.spacing[6] },
  hostsTitle: { fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
  hostsSubtitle: { fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary },
  hostsList: { gap: theme.spacing[4] },
  hostItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing[2] },
  hostInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: theme.spacing[3] },
  hostDetails: { flex: 1 },
  hostName: { fontSize: theme.fontSizes.md, fontWeight: theme.fontWeights.semibold, marginBottom: 2, color: theme.colors.text },
  hostSignal: { fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary },
  qrModal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  qrModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  qrModalContent: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -width * 0.4 }, { translateY: -200 }], width: width * 0.8, maxWidth: 400, borderRadius: theme.radii.lg, padding: theme.spacing[6], backgroundColor: theme.colors.card, ...theme.shadows.lg },
  qrModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing[6] },
  qrModalTitle: { fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold, color: theme.colors.text },
  qrModalClose: { padding: theme.spacing[2] },
  qrCodeContainer: { alignItems: 'center', marginBottom: theme.spacing[6] },
  qrModalSubtitle: { fontSize: theme.fontSizes.sm, textAlign: 'center', lineHeight: theme.lineHeights.loose, marginBottom: theme.spacing[6], color: theme.colors.textSecondary },
  qrModalActions: { flexDirection: 'row', justifyContent: 'center' },
  qrShareButton: { minWidth: 120 },
});
