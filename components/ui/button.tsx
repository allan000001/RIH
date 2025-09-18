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
  withTiming,
} from 'react-native-reanimated';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  role = 'neutral',
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const colors = Colors[colorScheme ?? 'light'];
  const roleColors = role !== 'neutral' ? Colors[role][colorScheme ?? 'light'] : null;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles[size];
    let variantStyle: ViewStyle = {};

    switch (variant) {
      case 'primary':
        variantStyle = {
          backgroundColor: roleColors?.primary || colors.tint,
          borderWidth: 0,
        };
        break;
      case 'secondary':
        variantStyle = {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: roleColors?.primary || colors.tint,
        };
        break;
      case 'ghost':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
        break;
      case 'success':
        variantStyle = {
          backgroundColor: colors.success,
          borderWidth: 0,
        };
        break;
      case 'warning':
        variantStyle = {
          backgroundColor: colors.warning,
          borderWidth: 0,
        };
        break;
      case 'error':
        variantStyle = {
          backgroundColor: colors.error,
          borderWidth: 0,
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
    let color = colors.text;

    switch (variant) {
      case 'primary':
      case 'success':
      case 'warning':
      case 'error':
        color = '#FFFFFF';
        break;
      case 'outline':
      case 'ghost':
        color = roleColors?.primary || colors.tint;
        break;
      case 'secondary':
        color = colors.text;
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
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'success' || variant === 'warning' || variant === 'error' ? '#FFFFFF' : colors.tint}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Size variants
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text styles
  text: {
    fontFamily: Fonts.sans,
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediumText: {
    fontSize: 16,
    lineHeight: 24,
  },
  largeText: {
    fontSize: 18,
    lineHeight: 28,
  },
});
