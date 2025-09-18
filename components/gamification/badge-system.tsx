import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface BadgeSystemProps {
  badges: Badge[];
  onBadgeUnlock?: (badge: Badge) => void;
}

interface BadgeCardProps {
  badge: Badge;
  index: number;
  onUnlock?: () => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, index, onUnlock }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const scale = useSharedValue(0);
  const glow = useSharedValue(0);
  const sparkle = useSharedValue(0);
  
  const isUnlocked = !!badge.unlockedAt;
  const progress = badge.progress || 0;
  const maxProgress = badge.maxProgress || 100;
  const progressPercent = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  useEffect(() => {
    // Staggered entrance animation
    scale.value = withDelay(
      index * 150,
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    if (isUnlocked) {
      // Glow effect for unlocked badges
      glow.value = withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 1200 }),
        withTiming(1, { duration: 800 })
      );
      
      // Sparkle animation
      sparkle.value = withDelay(
        200,
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 400 })
        )
      );
    }
  }, [index, isUnlocked]);

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return '#10B981';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return colors.tabIconDefault;
    }
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.6,
    transform: [{ scale: 1 + glow.value * 0.1 }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkle.value,
    transform: [
      { scale: sparkle.value },
      { rotate: `${sparkle.value * 360}deg` }
    ],
  }));

  const rarityColor = getRarityColor(badge.rarity);

  return (
    <Animated.View style={[styles.badgeCard, cardAnimatedStyle]}>
      {/* Glow effect for unlocked badges */}
      {isUnlocked && (
        <Animated.View
          style={[
            styles.glowEffect,
            { backgroundColor: rarityColor },
            glowAnimatedStyle,
          ]}
        />
      )}
      
      {/* Sparkle effect */}
      {isUnlocked && (
        <Animated.View style={[styles.sparkleContainer, sparkleAnimatedStyle]}>
          <IconSymbol name="sparkles" size={20} color={rarityColor} />
        </Animated.View>
      )}

      <View style={[
        styles.badgeContent,
        { 
          backgroundColor: colors.card,
          borderColor: isUnlocked ? rarityColor : colors.border,
          borderWidth: isUnlocked ? 2 : 1,
        }
      ]}>
        <View style={[
          styles.badgeIcon,
          { 
            backgroundColor: isUnlocked ? rarityColor + '20' : colors.tabIconDefault + '20'
          }
        ]}>
          <IconSymbol
            name={badge.icon as any}
            size={24}
            color={isUnlocked ? rarityColor : colors.tabIconDefault}
          />
        </View>

        <Text style={[
          styles.badgeName,
          { 
            color: isUnlocked ? colors.text : colors.tabIconDefault,
            fontWeight: isUnlocked ? '600' : '400'
          }
        ]}>
          {badge.name}
        </Text>

        <Text style={[styles.badgeDescription, { color: colors.tabIconDefault }]}>
          {badge.description}
        </Text>

        {/* Progress bar for badges in progress */}
        {!isUnlocked && badge.maxProgress && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { 
                    backgroundColor: rarityColor,
                    width: `${progressPercent}%`
                  }
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.tabIconDefault }]}>
              {progress}/{maxProgress}
            </Text>
          </View>
        )}

        {/* Rarity indicator */}
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>
            {badge.rarity.toUpperCase()}
          </Text>
        </View>

        {/* Unlock date */}
        {isUnlocked && badge.unlockedAt && (
          <Text style={[styles.unlockDate, { color: colors.tabIconDefault }]}>
            Unlocked {badge.unlockedAt.toLocaleDateString()}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

export const BadgeSystem: React.FC<BadgeSystemProps> = ({ badges, onBadgeUnlock }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const unlockedBadges = badges.filter(badge => badge.unlockedAt);
  const lockedBadges = badges.filter(badge => !badge.unlockedAt);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Achievements
        </Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          {unlockedBadges.length} of {badges.length} unlocked
        </Text>
      </View>

      <View style={styles.badgesGrid}>
        {/* Show unlocked badges first */}
        {unlockedBadges.map((badge, index) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            index={index}
            onUnlock={() => onBadgeUnlock?.(badge)}
          />
        ))}
        
        {/* Then show locked badges */}
        {lockedBadges.map((badge, index) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            index={unlockedBadges.length + index}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  badgeCard: {
    width: '48%',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    opacity: 0.3,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  badgeContent: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 180,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
    opacity: 0.8,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    textAlign: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  unlockDate: {
    fontSize: 10,
    opacity: 0.6,
  },
});
