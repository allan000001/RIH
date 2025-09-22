import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/useTheme';
import { Theme } from '@/constants/theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  role?: 'host' | 'connector' | 'neutral';
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 10, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles[size];
    let variantStyle: ViewStyle = {};

    switch (variant) {
      case 'primary':
        variantStyle = {
          backgroundColor: theme.colors.primary,
        };
        break;
      case 'secondary':
        variantStyle = {
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.colors.primary,
        };
        break;
      case 'ghost':
        variantStyle = {
          backgroundColor: 'transparent',
        };
        break;
      case 'success':
        variantStyle = {
          backgroundColor: theme.colors.success,
        };
        break;
      case 'warning':
        variantStyle = {
          backgroundColor: theme.colors.warning,
        };
        break;
      case 'error':
        variantStyle = {
          backgroundColor: theme.colors.error,
        };
        break;
    }

    if (disabled) {
      variantStyle.opacity = 0.5;
    }

    return {
      ...baseStyle,
      ...variantStyle,
      ...(fullWidth && { width: '100%' }),
    };
  };

  const getTextStyle = (): TextStyle => {
    let color = theme.colors.text;

    switch (variant) {
      case 'primary':
      case 'success':
      case 'warning':
      case 'error':
        color = theme.colors.primaryContrast;
        break;
      case 'outline':
      case 'ghost':
        color = theme.colors.primary;
        break;
      case 'secondary':
        color = theme.colors.text;
        break;
    }

    return {
      ...styles.text,
      ...styles[`${size}Text` as keyof typeof styles],
      color,
    };
  };

  return (
    <AnimatedTouchableOpacity
      style={[getButtonStyle(), animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'success' || variant === 'warning' || variant === 'error' ? theme.colors.primaryContrast : theme.colors.primary}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </AnimatedTouchableOpacity>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  // Size variants
  small: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radii.md,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medium: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.radii.lg,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  large: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.radii.lg,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text styles
  text: {
    fontFamily: theme.fonts.sans,
    fontWeight: theme.fontWeights.semibold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: theme.fontSizes.sm,
  },
  mediumText: {
    fontSize: theme.fontSizes.md,
  },
  largeText: {
    fontSize: theme.fontSizes.lg,
  },
});
