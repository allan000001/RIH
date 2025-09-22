import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/lib/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/design-system/icon-symbol';
import { Button } from '@/components/design-system/button';

const { width, height } = Dimensions.get('window');

interface ConnectionPopupProps {
  isVisible: boolean;
  onClose: () => void;
  hostName: string;
  hostId: string;
  status: 'connecting' | 'connected' | 'failed';
  onRetry?: () => void;
}

export function ConnectionPopup({
  isVisible,
  onClose,
  hostName,
  hostId,
  status,
  onRetry
}: ConnectionPopupProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const connectorColors = Colors.connector[colorScheme ?? 'light'];
  
  const pulseAnimation = useSharedValue(1);
  const progressAnimation = useSharedValue(0);

  useEffect(() => {
    if (isVisible && status === 'connecting') {
      // Pulse animation for connecting state
      pulseAnimation.value = withSequence(
        withSpring(1.2, { duration: 800 }),
        withSpring(1, { duration: 800 })
      );
      
      // Progress animation
      progressAnimation.value = withTiming(1, { duration: 3000 });
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (status === 'connected') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (status === 'failed') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isVisible, status]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));

  const getStatusIcon = () => {
    switch (status) {
      case 'connecting':
        return 'wifi.circle';
      case 'connected':
        return 'checkmark.circle.fill';
      case 'failed':
        return 'xmark.circle.fill';
      default:
        return 'wifi.circle';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connecting':
        return connectorColors.primary;
      case 'connected':
        return colors.success;
      case 'failed':
        return colors.error;
      default:
        return connectorColors.primary;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'connecting':
        return `Establishing secure connection to ${hostName}...`;
      case 'connected':
        return `🎉 Successfully connected to ${hostName}!`;
      case 'failed':
        return `Failed to connect to ${hostName}. Please try again.`;
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.overlay}
      >
        <BlurView
          intensity={20}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          style={styles.blurView}
        />
        
        <Animated.View
          entering={SlideInUp.delay(100)}
          exiting={SlideOutDown}
          style={[styles.popup, { backgroundColor: colors.card }]}
        >
          {/* Status Icon */}
          <Animated.View style={[styles.iconContainer, pulseStyle]}>
            <View style={[styles.iconBackground, { backgroundColor: getStatusColor() + '20' }]}>
              <IconSymbol
                name={getStatusIcon()}
                size={48}
                color={getStatusColor()}
              />
            </View>
          </Animated.View>

          {/* Status Message */}
          <Text style={[styles.title, { color: colors.text }]}>
            {status === 'connecting' ? 'Connecting...' : 
             status === 'connected' ? 'Connected!' : 'Connection Failed'}
          </Text>
          
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {getStatusMessage()}
          </Text>

          {/* Host Info */}
          <View style={[styles.hostInfo, { backgroundColor: colors.surface }]}>
            <Text style={[styles.hostLabel, { color: colors.textSecondary }]}>
              Host ID
            </Text>
            <Text style={[styles.hostId, { color: colors.text }]}>
              {hostId}
            </Text>
          </View>

          {/* Progress Bar (only for connecting) */}
          {status === 'connecting' && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { backgroundColor: connectorColors.primary },
                    progressStyle
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                Establishing secure tunnel...
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            {status === 'failed' && onRetry && (
              <Button
                title="Try Again"
                variant="primary"
                onPress={onRetry}
                style={styles.actionButton}
              />
            )}
            
            <Button
              title={status === 'connecting' ? 'Cancel' : 'Close'}
              variant={status === 'connecting' ? 'outline' : 'primary'}
              onPress={onClose}
              style={styles.actionButton}
            />
          </View>

          {/* Gamification Elements */}
          {status === 'connected' && (
            <Animated.View
              entering={FadeIn.delay(500)}
              style={styles.rewardContainer}
            >
              <Text style={[styles.rewardText, { color: colors.success }]}>
                +10 XP • Connection Established
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popup: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  hostInfo: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  hostLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  hostId: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  rewardContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
