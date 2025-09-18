import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'surface';
export type CardAnimation = 'none' | 'fadeIn' | 'slideIn' | 'stagger';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  onPress?: () => void;
  animation?: CardAnimation;
  animationDelay?: number;
  role?: 'host' | 'connector' | 'neutral';
}

export function Card({
  children,
  variant = 'default',
  style,
  onPress,
  animation = 'none',
  animationDelay = 0,
  role = 'neutral',
}: CardProps) {
  const colorScheme = useColorScheme();
  const scale = useSharedValue(1);

  const colors = Colors[colorScheme ?? 'light'];
  const roleColors = role !== 'neutral' ? Colors[role][colorScheme ?? 'light'] : null;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const getCardStyle = (): ViewStyle => {
    let variantStyle: ViewStyle = {};

    switch (variant) {
      case 'default':
        variantStyle = {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        };
        break;
      case 'elevated':
        variantStyle = {
          backgroundColor: colors.background,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        };
        break;
      case 'outlined':
        variantStyle = {
          backgroundColor: colors.background,
          borderWidth: 2,
          borderColor: roleColors?.primary || colors.border,
        };
        break;
      case 'surface':
        variantStyle = {
          backgroundColor: roleColors?.surface || colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
        break;
    }

    return {
      ...styles.base,
      ...variantStyle,
    };
  };

  const getAnimationProps = () => {
    switch (animation) {
      case 'fadeIn':
        return {
          entering: FadeIn.delay(animationDelay).duration(300),
        };
      case 'slideIn':
        return {
          entering: SlideInDown.delay(animationDelay).duration(400).springify(),
        };
      case 'stagger':
        return {
          entering: FadeIn.delay(animationDelay).duration(300)
            .withInitialValues({ opacity: 0, transform: [{ translateY: 20 }] }),
        };
      default:
        return {};
    }
  };

  if (onPress) {
    return (
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Animated.View
          style={[getCardStyle(), animatedStyle, style]}
          {...getAnimationProps()}
        >
          {children}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <Animated.View
      style={[getCardStyle(), style]}
      {...getAnimationProps()}
    >
      {children}
    </Animated.View>
  );
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
  },
  header: {
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
