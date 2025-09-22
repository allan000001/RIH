import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  SlideInRight,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/lib/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/design-system/icon-symbol';

interface GamifiedMessageProps {
  type: 'success' | 'achievement' | 'milestone' | 'reward' | 'info' | 'warning';
  title: string;
  message: string;
  xpGained?: number;
  badge?: string;
  onPress?: () => void;
  showConfetti?: boolean;
}

export function GamifiedMessage({
  type,
  title,
  message,
  xpGained,
  badge,
  onPress,
  showConfetti = false
}: GamifiedMessageProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const scaleAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);
  const confettiAnimation = useSharedValue(0);

  useEffect(() => {
    // Entry animation
    scaleAnimation.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });

    // Glow effect for achievements
    if (type === 'achievement' || type === 'milestone') {
      glowAnimation.value = withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 1200 }),
        withTiming(1, { duration: 800 })
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Confetti animation
    if (showConfetti) {
      confettiAnimation.value = withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 400 })
      );
    }
  }, [type, showConfetti]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glowAnimation.value, [0, 1], [0, 0.8]),
    shadowRadius: interpolate(glowAnimation.value, [0, 1], [0, 20]),
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiAnimation.value,
    transform: [
      { scale: interpolate(confettiAnimation.value, [0, 1], [0.5, 1.2]) },
      { rotate: `${interpolate(confettiAnimation.value, [0, 1], [0, 360])}deg` }
    ],
  }));

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark.circle.fill',
          color: colors.success,
          backgroundColor: colors.success + '15',
          borderColor: colors.success + '30',
        };
      case 'achievement':
        return {
          icon: 'star.fill',
          color: '#FFD700',
          backgroundColor: '#FFD70015',
          borderColor: '#FFD70030',
        };
      case 'milestone':
        return {
          icon: 'crown.fill',
          color: '#FF6B35',
          backgroundColor: '#FF6B3515',
          borderColor: '#FF6B3530',
        };
      case 'reward':
        return {
          icon: 'giftcard.fill',
          color: '#8B5CF6',
          backgroundColor: '#8B5CF615',
          borderColor: '#8B5CF630',
        };
      case 'info':
        return {
          icon: 'info.circle.fill',
          color: colors.primary,
          backgroundColor: colors.primary + '15',
          borderColor: colors.primary + '30',
        };
      case 'warning':
        return {
          icon: 'exclamationmark.triangle.fill',
          color: colors.warning,
          backgroundColor: colors.warning + '15',
          borderColor: colors.warning + '30',
        };
      default:
        return {
          icon: 'info.circle.fill',
          color: colors.primary,
          backgroundColor: colors.primary + '15',
          borderColor: colors.primary + '30',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Animated.View
      entering={SlideInRight.delay(100)}
      style={[animatedStyle, glowStyle]}
    >
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          }
        ]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        {/* Confetti Effect */}
        {showConfetti && (
          <Animated.View style={[styles.confetti, confettiStyle]}>
            <Text style={styles.confettiEmoji}>🎉</Text>
            <Text style={styles.confettiEmoji}>✨</Text>
            <Text style={styles.confettiEmoji}>🌟</Text>
          </Animated.View>
        )}

        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
            <IconSymbol
              name={config.icon}
              size={24}
              color={config.color}
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>

            {/* Gamification Elements */}
            <View style={styles.gamificationContainer}>
              {xpGained && (
                <View style={[styles.xpBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.xpText, { color: colors.success }]}>
                    +{xpGained} XP
                  </Text>
                </View>
              )}

              {badge && (
                <View style={[styles.badgeContainer, { backgroundColor: config.color + '20' }]}>
                  <Text style={styles.badgeEmoji}>{badge}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Arrow for interactive messages */}
          {onPress && (
            <View style={styles.arrowContainer}>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={colors.textSecondary}
              />
            </View>
          )}
        </View>

        {/* Progress indicator for milestones */}
        {type === 'milestone' && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: colors.surface }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { backgroundColor: config.color },
                  {
                    width: '75%', // Mock progress
                  }
                ]}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  confetti: {
    position: 'absolute',
    top: -10,
    right: -10,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  confettiEmoji: {
    fontSize: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  gamificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 16,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  progressTrack: {
    flex: 1,
  },
  progressFill: {
    height: '100%',
  },
});
