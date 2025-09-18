import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { IconSymbol } from './icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/lib/use-color-scheme';

export type InputVariant = 'default' | 'outlined' | 'filled';
export type InputSize = 'small' | 'medium' | 'large';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: any;
  rightIcon?: any;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
  inputStyle?: TextStyle;
  role?: 'host' | 'connector' | 'neutral';
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  variant = 'default',
  size = 'medium',
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  style,
  inputStyle,
  role = 'neutral',
}: InputProps) {
  const colorScheme = useColorScheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);

  const colors = Colors[colorScheme ?? 'light'];
  const roleColors = role !== 'neutral' ? Colors[role][colorScheme ?? 'light'] : null;

  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [colors.border, roleColors?.primary || colors.tint]
    );

    return {
      borderColor,
    };
  });

  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle = styles[size];
    let variantStyle: ViewStyle = {};

    switch (variant) {
      case 'default':
        variantStyle = {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        };
        break;
      case 'outlined':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.border,
        };
        break;
      case 'filled':
        variantStyle = {
          backgroundColor: roleColors?.surface || colors.surface,
          borderWidth: 1,
          borderColor: 'transparent',
        };
        break;
    }

    if (error) {
      variantStyle.borderColor = colors.error;
    }

    if (disabled) {
      variantStyle.opacity = 0.5;
    }

    return {
      ...baseStyle,
      ...variantStyle,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      ...styles.input,
      ...styles[`${size}Text` as keyof typeof styles],
      color: colors.text,
      ...(multiline && { height: numberOfLines * 20 + 20 }),
    };
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <Animated.View style={[getContainerStyle(), animatedStyle]}>
        <View style={styles.inputContainer}>
          {leftIcon && (
            <IconSymbol
              name={leftIcon}
              size={20}
              color={colors.icon}
              style={styles.leftIcon}
            />
          )}
          
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.neutral}
            style={[getInputStyle(), inputStyle]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            multiline={multiline}
            numberOfLines={numberOfLines}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
          />
          
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIcon}
              disabled={!onRightIconPress}
            >
              <IconSymbol
                name={rightIcon}
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  
  // Size variants
  small: {
    borderRadius: 8,
    minHeight: 36,
  },
  medium: {
    borderRadius: 12,
    minHeight: 44,
  },
  large: {
    borderRadius: 16,
    minHeight: 52,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    paddingVertical: 8,
  },

  // Text sizes
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

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: Fonts.sans,
  },

  error: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.sans,
  },

  leftIcon: {
    marginRight: 8,
  },

  rightIcon: {
    marginLeft: 8,
    padding: 4,
  },
});
