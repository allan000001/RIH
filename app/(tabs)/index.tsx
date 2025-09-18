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
  withSequence,
  FadeIn,
  FadeInDown,
  SlideInUp,
  SlideInRight,
  SlideInDown,
} from 'react-native-reanimated';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme'; // Removed for forced dark mode
import { useApp } from '@/contexts/app-context';
import { useRouter } from 'expo-router';
import { QRCodeGenerator } from '@/components/qr-code-generator';

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

export default function HomeScreen() {
  const { state } = useApp();
  const { userRole } = state;
  const colorScheme = 'dark'; // Force dark mode
  const colors = Colors.dark;
  const roleColors = userRole ? Colors[userRole].dark : colors;
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
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

  const shareAnimation = useSharedValue(isSharing ? 1 : 0);
  const shareButtonScale = useSharedValue(1);
  const statsAnimations = Array.from({ length: 4 }, () => useSharedValue(0));

  useEffect(() => {
    // Animate stats cards on mount
    statsAnimations.forEach((anim, index) => {
      anim.value = withDelay(index * 100, withSpring(1, { damping: 15 }));
    });
  }, []);

  useEffect(() => {
    shareAnimation.value = withSpring(isSharing ? 1 : 0, { damping: 15 });
  }, [isSharing]);

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

  const handleToggleSharing = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSharing(!isSharing);
      // Here you would implement actual sharing logic
    } catch (error) {
      console.error('Error toggling sharing:', error);
    }
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

  const toggleSharing = () => {
    // Haptic feedback for better UX
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setIsSharing(!isSharing);
    shareButtonScale.value = withSequence(
      withTiming(0.95, { duration: 150 }),
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );

    // Animate stats when sharing state changes
    statsAnimations.forEach((anim, index) => {
      anim.value = withDelay(
        index * 100,
        withSequence(
          withTiming(0.8, { duration: 200 }),
          withSpring(1, { damping: 15, stiffness: 300 })
        )
      );
    });
  };

  const shareButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareButtonScale.value }],
    opacity: shareButtonScale.value,
  }));

  if (userRole === 'connector') {
    return renderConnectorDashboard();
  }

  return renderHostDashboard();

  function renderHostDashboard() {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
                style={[styles.greeting, { color: colors.text }]}
                accessibilityRole="header"
                accessibilityLabel="Good morning, Host"
              >
                Good morning, Host
              </Text>
              <Text 
                style={[styles.subtitle, { color: colors.tabIconDefault }]}
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

          {/* Hero Toggle */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.heroCard}>
            <Card variant="elevated" role="host">
              <CardContent style={styles.heroContent}>
                <View style={styles.heroTextContainer}>
                  <Text style={[styles.heroTitle, { color: colors.text }]}>
                    {isSharing ? 'Sharing Internet' : 'Share Internet'}
                  </Text>
                  <Text style={[styles.heroSubtitle, { color: colors.tabIconDefault }]}>
                    {isSharing ? '3 devices connected' : 'Tap to start sharing'}
                  </Text>
                </View>
                <Animated.View style={shareButtonStyle}>
                  <Button
                    title={isSharing ? "Stop Sharing" : "Share Internet"}
                    variant="primary"
                    size="large"
                    role="host"
                    onPress={handleToggleSharing}
                    style={StyleSheet.flatten([
                      styles.shareButton,
                      {
                        backgroundColor: isSharing ? colors.error : roleColors.primary,
                      }
                    ])}
                  />
                </Animated.View>
                
                {isSharing && (
                  <Animated.View entering={FadeInDown.delay(300)} style={styles.waveContainer}>
                    <View style={styles.waveAnimation} />
                  </Animated.View>
                )}
              </CardContent>
            </Card>
          </Animated.View>

          {/* Quick Scan & Connect */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.quickScanCard}>
            <Card variant="default">
              <CardHeader>
                <Text style={[styles.quickScanTitle, { color: colors.text }]}>
                  Quick Scan & Connect
                </Text>
                <Text style={[styles.quickScanSubtitle, { color: colors.tabIconDefault }]}>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Live Status
            </Text>
            <View style={styles.liveStatusCards}>
              <Card variant="elevated" style={styles.bandwidthCard}>
                <CardContent>
                  <View style={styles.bandwidthHeader}>
                    <Text style={[styles.bandwidthTitle, { color: colors.text }]}>
                      Bandwidth Usage
                    </Text>
                    <Text style={[styles.bandwidthValue, { color: roleColors.primary }]}>
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
                            backgroundColor: roleColors.primary,
                            opacity: 0.7 + Math.random() * 0.3,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.bandwidthLabels}>
                    <Text style={[styles.bandwidthLabelLarge, { color: colors.tabIconDefault }]}>
                      Upload: 2.1 MB/s
                    </Text>
                    <Text style={[styles.bandwidthLabelLarge, { color: colors.tabIconDefault }]}>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
                    backgroundColor: activity.type === 'connect' ? colors.success + '20' : 
                                   activity.type === 'transfer' ? roleColors.primary + '20' : 
                                   colors.neutral + '20' 
                  }]}>
                    <IconSymbol 
                      name={activity.type === 'connect' ? 'plus.circle.fill' as any : 
                            activity.type === 'transfer' ? 'arrow.up.arrow.down' as any : 
                            'minus.circle.fill' as any} 
                      size={16} 
                      color={activity.type === 'connect' ? colors.success : 
                             activity.type === 'transfer' ? roleColors.primary : 
                             colors.neutral} 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityAction, { color: colors.text }]}>
                      {activity.action}
                    </Text>
                    <Text style={[styles.activityDevice, { color: colors.tabIconDefault }]}>
                      {activity.device}
                    </Text>
                  </View>
                  <Text style={[styles.activityTime, { color: colors.tabIconDefault }]}>
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
                    <Text style={[styles.communityTitle, { color: colors.text }]}>
                      🌟 Invite Friends
                    </Text>
                    <Text style={[styles.communitySubtitle, { color: colors.tabIconDefault }]}>
                      Share the connection, earn rewards
                    </Text>
                  </View>
                  <View style={styles.rewardBadge}>
                    <Text style={styles.rewardBadgeText}>+50 pts</Text>
                  </View>
                </View>
                
                <View style={styles.inviteStats}>
                  <View style={styles.inviteStat}>
                    <Text style={[styles.inviteStatNumber, { color: roleColors.primary }]}>3</Text>
                    <Text style={[styles.inviteStatLabel, { color: colors.tabIconDefault }]}>Invited</Text>
                  </View>
                  <View style={styles.inviteStat}>
                    <Text style={[styles.inviteStatNumber, { color: colors.success }]}>2</Text>
                    <Text style={[styles.inviteStatLabel, { color: colors.tabIconDefault }]}>Joined</Text>
                  </View>
                  <View style={styles.inviteStat}>
                    <Text style={[styles.inviteStatNumber, { color: colors.warning }]}>150</Text>
                    <Text style={[styles.inviteStatLabel, { color: colors.tabIconDefault }]}>Points</Text>
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
                    <Text style={[styles.progressLabel, { color: colors.tabIconDefault }]}>
                      Next reward: 5 more invites
                    </Text>
                    <Text style={[styles.progressValue, { color: roleColors.primary }]}>
                      60%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      entering={SlideInRight.delay(800)}
                      style={[
                        styles.progressFill,
                        { 
                          backgroundColor: roleColors.primary,
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
              { title: 'Active Connections', value: stats.activeConnections.toString(), icon: 'link', color: colors.success },
              { title: 'Pending Requests', value: stats.pendingRequests.toString(), icon: 'bell', color: colors.warning },
              { title: 'Data Shared Today', value: stats.totalDataShared, icon: 'arrow.up.circle', color: roleColors.primary },
              { title: 'Uptime', value: `${stats.uptimeHours}h`, icon: 'checkmark.circle.fill', color: colors.success },
            ].map((stat, index) => {
              const animatedStyle = useAnimatedStyle(() => ({
                transform: [{ scale: statsAnimations[index].value }],
                opacity: statsAnimations[index].value,
              }));

              return (
                <Animated.View
                  key={stat.title}
                  entering={SlideInUp.delay(300 + index * 100)}
                  style={[styles.statCard, animatedStyle]}
                >
                  <Card variant="default">
                    <CardContent>
                      <View style={styles.statContent}>
                        <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                          <IconSymbol name={stat.icon as any} size={24} color={stat.color} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          {stat.value}
                        </Text>
                        <Text style={[styles.statTitle, { color: colors.tabIconDefault }]}>
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
                <Text style={[styles.chartTitle, { color: colors.text }]}>
                  Bandwidth Usage
                </Text>
                <Text style={[styles.chartSubtitle, { color: colors.tabIconDefault }]}>
                  Last 24 hours
                </Text>
              </CardHeader>
              <CardContent>
                <View style={styles.chartContainer}>
                  <View style={styles.chartLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: roleColors.primary }]} />
                      <Text style={[styles.legendText, { color: colors.tabIconDefault }]}>Upload</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors.connector.light.primary }]} />
                      <Text style={[styles.legendText, { color: colors.tabIconDefault }]}>Download</Text>
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
                                backgroundColor: roleColors.primary,
                              }
                            ]}
                          />
                          <View
                            style={[
                              styles.bar,
                              {
                                height: (data.download / 30) * 100,
                                backgroundColor: Colors.connector.light.primary,
                              }
                            ]}
                          />
                        </View>
                        <Text style={[styles.chartLabel, { color: colors.tabIconDefault }]}>
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
                <Text style={[styles.actionsTitle, { color: colors.text }]}>
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
      </SafeAreaView>
    );
  }

  function renderConnectorDashboard() {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>
                Welcome back, Connector
              </Text>
              <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
                Find and connect to hosts
              </Text>
            </View>
            <View style={styles.headerRight}>
              <StatusIndicator
                status="disconnected"
              />
              <TouchableOpacity
                  onPress={() => console.log('Settings pressed')}
                style={styles.settingsButton}
              >
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Connection Status */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.connectionCard}>
            <Card variant="elevated" role="connector">
              <CardContent>
                <View style={styles.connectionStatus}>
                  <View style={styles.connectionInfo}>
                    <Text style={[styles.connectionTitle, { color: roleColors.primary }]}>
                      Connection Status
                    </Text>
                    <Text style={[styles.connectionSubtitle, { color: colors.tabIconDefault }]}>
                      Not connected to any host
                    </Text>
                  </View>
                  <Button
                    title="Quick Connect"
                    variant="primary"
                    size="medium"
                    role="connector"
                    onPress={() => {}}
                  />
                </View>
              </CardContent>
            </Card>
          </Animated.View>

          {/* Available Hosts */}
          <Animated.View entering={SlideInUp.delay(400)} style={styles.hostsCard}>
            <Card variant="default">
              <CardHeader>
                <Text style={[styles.hostsTitle, { color: colors.text }]}>
                  Available Hosts Nearby
                </Text>
                <Text style={[styles.hostsSubtitle, { color: colors.tabIconDefault }]}>
                  3 hosts found
                </Text>
              </CardHeader>
              <CardContent>
                <View style={styles.hostsList}>
                  {['Coffee Shop WiFi', 'John\'s Hotspot', 'Library Access'].map((hostName, index) => (
                    <View key={index} style={styles.hostItem}>
                      <View style={styles.hostInfo}>
                        <IconSymbol name={"wifi.router" as any} size={24} color={Colors.host.light.primary} />
                        <View style={styles.hostDetails}>
                          <Text style={[styles.hostName, { color: colors.text }]}>
                            {hostName}
                          </Text>
                          <Text style={[styles.hostSignal, { color: colors.tabIconDefault }]}>
                            Signal: Strong • {Math.floor(Math.random() * 50 + 50)}%
                          </Text>
                        </View>
                      </View>
                      <Button
                        title="Connect"
                        variant="outline"
                        size="small"
                        role="connector"
                        onPress={() => {}}
                      />
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>
          </Animated.View>

          {/* Usage Stats */}
          <View style={styles.statsGrid}>
            {[
              { title: 'Data Used Today', value: '2.1 GB', icon: 'arrow.down.circle', color: roleColors.primary },
              { title: 'Connection Time', value: '4.2h', icon: 'checkmark.circle.fill', color: colors.success },
            ].map((stat, index) => (
              <Animated.View
                key={stat.title}
                entering={SlideInUp.delay(600 + index * 100)}
                style={styles.statCard}
              >
                <Card variant="default">
                  <CardContent>
                    <View style={styles.statContent}>
                      <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                        <IconSymbol name={stat.icon as any} size={24} color={stat.color} />
                      </View>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {stat.value}
                      </Text>
                      <Text style={[styles.statTitle, { color: colors.tabIconDefault }]}>
                        {stat.title}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            ))}
          </View>
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
              style={[styles.qrModalContent, { backgroundColor: colors.card }]}
            >
              <View style={styles.qrModalHeader}>
                <Text style={[styles.qrModalTitle, { color: colors.text }]}>
                  Share Your Connection
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowQRCode(false)}
                  style={styles.qrModalClose}
                >
                  <IconSymbol name="xmark" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.qrCodeContainer}>
                <QRCodeGenerator
                  value={generateQRData()}
                  size={200}
                  title="Scan to Connect"
                  backgroundColor={colors.card}
                  foregroundColor={colors.text}
                />
              </View>
              
              <Text style={[styles.qrModalSubtitle, { color: colors.textSecondary }]}>
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
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  shareButton: {
    marginTop: 16,
    minHeight: 52,
  },
  heroCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  heroTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  heroButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  heroButton: {
    width: 200,
    height: 56,
    borderRadius: 28,
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
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 50,
    position: 'absolute',
    bottom: -50,
    left: '-50%',
  },
  quickScanCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  quickScanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickScanSubtitle: {
    fontSize: 14,
  },
  scanButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  scanButton: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  sharingCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sharingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sharingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sharingStatus: {
    fontSize: 14,
  },
  bandwidthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  bandwidthItem: {
    alignItems: 'center',
    gap: 4,
  },
  bandwidthLabel: {
    fontSize: 12,
  },
  bandwidthValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 60) / 2,
  },
  statContent: {
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartSubtitle: {
    fontSize: 14,
  },
  chartContainer: {
    paddingTop: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 16,
  },
  chartBar: {
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 100,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 10,
  },
  actionsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  connectionCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  connectionSubtitle: {
    fontSize: 14,
  },
  hostsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  hostsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hostsSubtitle: {
    fontSize: 14,
  },
  hostsList: {
    gap: 16,
  },
  hostItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  hostSignal: {
    fontSize: 12,
  },
  // Live Status Cards styles
  liveStatusSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  liveStatusCards: {
    gap: 16,
  },
  bandwidthCard: {
    padding: 4,
  },
  bandwidthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bandwidthTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bandwidthValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bandwidthGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  bandwidthBar: {
    width: 6,
    borderRadius: 3,
    minHeight: 4,
  },
  bandwidthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bandwidthLabelLarge: {
    fontSize: 12,
  },
  // Recent Activity styles
  recentActivitySection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 0,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDevice: {
    fontSize: 12,
  },
  activityTime: {
    fontSize: 12,
  },
  // Community/Invite Card styles
  communityCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  communityTitleContainer: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  communitySubtitle: {
    fontSize: 14,
  },
  rewardBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  inviteStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  inviteStat: {
    alignItems: 'center',
  },
  inviteStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  inviteStatLabel: {
    fontSize: 12,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inviteButton: {
    flex: 1,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  qrModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  qrModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  qrModalClose: {
    padding: 8,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrModalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  qrModalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  qrShareButton: {
    minWidth: 120,
  },
});
