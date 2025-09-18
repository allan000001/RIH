import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Card, CardContent, CardHeader } from './ui/card';
import { StatusIndicator, ConnectionStatus } from './ui/status-indicator';
import { Button } from './ui/button';
import { IconSymbol } from './ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ConnectionData {
  id: string;
  name: string;
  deviceType: string;
  status: ConnectionStatus;
  bandwidth?: number; // MB/s
  latency?: number; // ms
  dataUsed?: number; // MB
  connectedAt?: Date;
}

interface ConnectionCardProps {
  connection: ConnectionData;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDisconnect?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  swipeEnabled?: boolean;
  role?: 'host' | 'connector';
}

export function ConnectionCard({
  connection,
  onApprove,
  onReject,
  onDisconnect,
  onViewDetails,
  swipeEnabled = true,
  role = 'host',
}: ConnectionCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const roleColors = Colors[role][colorScheme ?? 'light'];

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const swipeGesture = Gesture.Pan()
    .enabled(swipeEnabled && connection.status === 'connecting')
    .onUpdate((event) => {
      translateX.value = event.translationX;
      
      // Visual feedback for swipe direction
      if (event.translationX > 50) {
        // Approve (right swipe) - green tint
        scale.value = 1.02;
      } else if (event.translationX < -50) {
        // Reject (left swipe) - red tint
        scale.value = 1.02;
      } else {
        scale.value = 1;
      }
    })
    .onEnd((event) => {
      if (event.translationX > 100 && onApprove) {
        // Approve
        translateX.value = withSpring(300);
        opacity.value = withSpring(0, undefined, () => {
          runOnJS(onApprove)(connection.id);
        });
      } else if (event.translationX < -100 && onReject) {
        // Reject
        translateX.value = withSpring(-300);
        opacity.value = withSpring(0, undefined, () => {
          runOnJS(onReject)(connection.id);
        });
      } else {
        // Snap back
        translateX.value = withSpring(0);
        scale.value = withSpring(1);
      }
    });

  const formatBandwidth = (bandwidth?: number) => {
    if (!bandwidth) return 'N/A';
    return bandwidth < 1 ? `${(bandwidth * 1000).toFixed(0)} KB/s` : `${bandwidth.toFixed(1)} MB/s`;
  };

  const formatDataUsage = (dataUsed?: number) => {
    if (!dataUsed) return '0 MB';
    return dataUsed > 1000 ? `${(dataUsed / 1000).toFixed(1)} GB` : `${dataUsed.toFixed(0)} MB`;
  };

  const formatDuration = (connectedAt?: Date) => {
    if (!connectedAt) return '';
    const now = new Date();
    const diff = now.getTime() - connectedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={animatedStyle}>
        <Card
          variant="elevated"
          role={role}
          animation="slideIn"
          onPress={onViewDetails ? () => onViewDetails(connection.id) : undefined}
        >
          <CardHeader>
            <View style={styles.header}>
              <View style={styles.deviceInfo}>
                <IconSymbol
                  name={connection.deviceType === 'mobile' ? 'iphone' : 'laptopcomputer'}
                  size={24}
                  color={roleColors.primary}
                />
                <View style={styles.nameContainer}>
                  <Text style={[styles.deviceName, { color: colors.text }]}>
                    {connection.name}
                  </Text>
                  <Text style={[styles.deviceType, { color: colors.neutral }]}>
                    {connection.deviceType}
                  </Text>
                </View>
              </View>
              
              <StatusIndicator
                status={connection.status}
                size="small"
                showText={false}
              />
            </View>
          </CardHeader>

          <CardContent>
            {connection.status === 'connected' && (
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <IconSymbol name="speedometer" size={16} color={colors.icon} />
                  <Text style={[styles.statLabel, { color: colors.neutral }]}>Speed</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatBandwidth(connection.bandwidth)}
                  </Text>
                </View>
                
                <View style={styles.stat}>
                  <IconSymbol name="timer" size={16} color={colors.icon} />
                  <Text style={[styles.statLabel, { color: colors.neutral }]}>Latency</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {connection.latency ? `${connection.latency}ms` : 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.stat}>
                  <IconSymbol name="chart.bar" size={16} color={colors.icon} />
                  <Text style={[styles.statLabel, { color: colors.neutral }]}>Data</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatDataUsage(connection.dataUsed)}
                  </Text>
                </View>
                
                {connection.connectedAt && (
                  <View style={styles.stat}>
                    <IconSymbol name="clock" size={16} color={colors.icon} />
                    <Text style={[styles.statLabel, { color: colors.neutral }]}>Duration</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {formatDuration(connection.connectedAt)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {connection.status === 'connecting' && swipeEnabled && (
              <View style={styles.swipeHint}>
                <Text style={[styles.swipeText, { color: colors.neutral }]}>
                  Swipe right to approve, left to reject
                </Text>
                <View style={styles.swipeIcons}>
                  <IconSymbol name="checkmark" size={16} color={colors.success} />
                  <IconSymbol name="xmark" size={16} color={colors.error} />
                </View>
              </View>
            )}

            {connection.status === 'connecting' && !swipeEnabled && (
              <View style={styles.actions}>
                <Button
                  title="Reject"
                  variant="outline"
                  size="small"
                  onPress={() => onReject?.(connection.id)}
                  style={styles.actionButton}
                />
                <Button
                  title="Approve"
                  variant="primary"
                  size="small"
                  onPress={() => onApprove?.(connection.id)}
                  style={styles.actionButton}
                  role={role}
                />
              </View>
            )}

            {connection.status === 'connected' && onDisconnect && (
              <View style={styles.actions}>
                <Button
                  title="Disconnect"
                  variant="outline"
                  size="small"
                  onPress={() => onDisconnect(connection.id)}
                  style={styles.disconnectButton}
                />
              </View>
            )}
          </CardContent>
        </Card>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  deviceType: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    textTransform: 'capitalize',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: Fonts.sans,
    marginTop: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.sans,
    marginTop: 1,
  },
  swipeHint: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  swipeText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    marginBottom: 4,
  },
  swipeIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  disconnectButton: {
    alignSelf: 'flex-end',
  },
});
