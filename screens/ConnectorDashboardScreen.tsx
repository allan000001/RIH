import React, { useState } from 'react';
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
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInUp,
} from 'react-native-reanimated';

import { Card, CardHeader, CardContent } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { IconSymbol } from '@/components/design-system/icon-symbol';
import { StatusIndicator } from '@/components/design-system/status-indicator';
import { useApp } from '@/lib/app-context';
import { useTheme } from '@/lib/useTheme';
import { Theme } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function ConnectorDashboardScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back, Connector
            </Text>
            <Text style={styles.subtitle}>
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
                  <Text style={styles.connectionTitle}>
                    Connection Status
                  </Text>
                  <Text style={styles.connectionSubtitle}>
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
              <Text style={styles.hostsTitle}>
                Available Hosts Nearby
              </Text>
              <Text style={styles.hostsSubtitle}>
                3 hosts found
              </Text>
            </CardHeader>
            <CardContent>
              <View style={styles.hostsList}>
                {['Coffee Shop WiFi', 'John\'s Hotspot', 'Library Access'].map((hostName, index) => (
                  <View key={index} style={styles.hostItem}>
                    <View style={styles.hostInfo}>
                      <IconSymbol name={"wifi.router" as any} size={24} color={theme.colors.primary} />
                      <View style={styles.hostDetails}>
                        <Text style={styles.hostName}>
                          {hostName}
                        </Text>
                        <Text style={styles.hostSignal}>
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
            { title: 'Data Used Today', value: '2.1 GB', icon: 'arrow.down.circle', color: theme.colors.primary },
            { title: 'Connection Time', value: '4.2h', icon: 'checkmark.circle.fill', color: theme.colors.success },
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
          ))}
        </View>
      </ScrollView>
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
  connectionCard: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
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
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing[1],
    color: theme.colors.primary,
  },
  connectionSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  hostsCard: {
    marginHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },
  hostsTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
  },
  hostsSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  hostsList: {
    gap: theme.spacing[4],
  },
  hostItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing[3],
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    marginBottom: 2,
    color: theme.colors.text,
  },
  hostSignal: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
});
