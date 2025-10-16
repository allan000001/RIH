import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/design-system/icon-symbol';
import { useTheme } from '@/lib/useTheme';
import { Theme } from '@/constants/theme';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
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
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, index }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
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
      case 'common': return theme.colors.success;
      case 'rare': return theme.colors.primary;
      case 'epic': return theme.colors.badge;
      case 'legendary': return theme.colors.warning;
      default: return theme.colors.textSecondary;
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
      {isUnlocked && (
        <Animated.View
          style={[
            styles.glowEffect,
            { backgroundColor: rarityColor },
            glowAnimatedStyle,
          ]}
        />
      )}
      
      {isUnlocked && (
        <Animated.View style={[styles.sparkleContainer, sparkleAnimatedStyle]}>
          <IconSymbol name="sparkles" size={20} color={rarityColor} />
        </Animated.View>
      )}

      <View style={[
        styles.badgeContent,
        { 
          borderColor: isUnlocked ? rarityColor : theme.colors.border,
          borderWidth: isUnlocked ? 2 : 1,
        }
      ]}>
        <View style={[
          styles.badgeIcon,
          { 
            backgroundColor: isUnlocked ? rarityColor + '20' : theme.colors.textSecondary + '20'
          }
        ]}>
          <IconSymbol
            name={badge.icon}
            size={24}
            color={isUnlocked ? rarityColor : theme.colors.textSecondary}
          />
        </View>

        <Text style={styles.badgeName}>
          {badge.name}
        </Text>

        <Text style={styles.badgeDescription}>
          {badge.description}
        </Text>

        {!isUnlocked && badge.maxProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
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
            <Text style={styles.progressText}>
              {progress}/{maxProgress}
            </Text>
          </View>
        )}

        <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>
            {badge.rarity.toUpperCase()}
          </Text>
        </View>

        {isUnlocked && badge.unlockedAt && (
          <Text style={styles.unlockDate}>
            Unlocked {badge.unlockedAt.toLocaleDateString()}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

export const BadgeSystem: React.FC<BadgeSystemProps> = ({ badges }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const unlockedBadges = badges.filter(badge => badge.unlockedAt);
  const lockedBadges = badges.filter(badge => !badge.unlockedAt);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Achievements
        </Text>
        <Text style={styles.subtitle}>
          {unlockedBadges.length} of {badges.length} unlocked
        </Text>
      </View>

      <View style={styles.badgesGrid}>
        {unlockedBadges.map((badge, index) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            index={index}
          />
        ))}
        
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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[4],
  },
  header: {
    marginBottom: theme.spacing[6],
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing[2],
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    position: 'relative',
    marginBottom: theme.spacing[4],
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: theme.radii.lg,
    opacity: 0.3,
  },
  sparkleContainer: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    zIndex: 10,
  },
  badgeContent: {
    padding: theme.spacing[4],
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
  },
  badgeName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
    color: theme.colors.text,
  },
  badgeDescription: {
    fontSize: theme.fontSizes.xs,
    textAlign: 'center',
    lineHeight: theme.lineHeights.normal,
    marginBottom: theme.spacing[3],
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    width: '100%',
    marginBottom: theme.spacing[3],
  },
  progressBar: {
    height: 4,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing[1],
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radii.full,
  },
  progressText: {
    fontSize: 10,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  rarityBadge: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing[2],
  },
  rarityText: {
    fontSize: 10,
    fontWeight: theme.fontWeights.bold,
  },
  unlockDate: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
});
