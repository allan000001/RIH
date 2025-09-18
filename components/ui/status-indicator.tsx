import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { IconSymbol } from './icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
export type StatusSize = 'small' | 'medium' | 'large';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  size?: StatusSize;
  showText?: boolean;
  customText?: string;
  style?: ViewStyle;
  animated?: boolean;
}

export function StatusIndicator({
  status,
  size = 'medium',
  showText = true,
  customText,
  style,
  animated = true,
}: StatusIndicatorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Fallback colors if theme colors are undefined
  const fallbackColors = {
    connected: '#10B981',
    connecting: '#F59E0B', 
    disconnected: '#6B7280',
    error: '#EF4444',
  };
  
  const pulseAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      if (status === 'connecting') {
        // Pulsing animation for connecting
        pulseAnimation.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        
        // Rotating animation for connecting
        rotateAnimation.value = withRepeat(
          withTiming(360, { duration: 2000, easing: Easing.linear }),
          -1,
          false
        );
      } else {
        pulseAnimation.value = withTiming(1, { duration: 300 });
        rotateAnimation.value = withTiming(0, { duration: 300 });
      }
    }
  }, [status, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseAnimation.value },
      { rotate: `${rotateAnimation.value}deg` },
    ],
  }));

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: colors.connected || fallbackColors.connected,
          icon: 'checkmark.circle.fill' as any,
          text: customText || 'Connected',
          backgroundColor: (colors.connected || fallbackColors.connected) + '20',
        };
      case 'connecting':
        return {
          color: colors.connecting || fallbackColors.connecting,
          icon: 'arrow.clockwise' as any,
          text: customText || 'Connecting...',
          backgroundColor: (colors.connecting || fallbackColors.connecting) + '20',
        };
      case 'disconnected':
        return {
          color: colors.disconnected || fallbackColors.disconnected,
          icon: 'circle' as any,
          text: customText || 'Disconnected',
          backgroundColor: (colors.disconnected || fallbackColors.disconnected) + '20',
        };
      case 'error':
        return {
          color: colors.error || fallbackColors.error,
          icon: 'exclamationmark.circle.fill' as any,
          text: customText || 'Connection Error',
          backgroundColor: (colors.error || fallbackColors.error) + '20',
        };
    }
  };

  const config = getStatusConfig();
  const sizeConfig = getSizeConfig(size);

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.indicator,
          {
            width: sizeConfig.indicatorSize,
            height: sizeConfig.indicatorSize,
            backgroundColor: config.backgroundColor,
          },
          animatedStyle,
        ]}
      >
        <IconSymbol
          name={config.icon}
          size={sizeConfig.iconSize}
          color={config.color}
        />
      </Animated.View>
      
      {showText && (
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeConfig.fontSize,
              color: config.color,
            },
          ]}
        >
          {config.text}
        </Text>
      )}
    </View>
  );
}

function getSizeConfig(size: StatusSize) {
  switch (size) {
    case 'small':
      return {
        indicatorSize: 24,
        iconSize: 16,
        fontSize: 12,
      };
    case 'medium':
      return {
        indicatorSize: 32,
        iconSize: 20,
        fontSize: 14,
      };
    case 'large':
      return {
        indicatorSize: 48,
        iconSize: 28,
        fontSize: 16,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
