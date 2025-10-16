import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/design-system/icon-symbol';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/app-context';

const { width } = Dimensions.get('window');

interface DockTabProps {
  title: string;
  icon: any;
  isActive: boolean;
  onPress: () => void;
  color: string;
}

function DockTab({ title, icon, isActive, onPress, color }: DockTabProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isActive ? 1 : 0.9) }],
      opacity: withSpring(isActive ? 1 : 0.7),
    };
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.tabContainer}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <IconSymbol
          name={icon}
          size={28}
          color={isActive ? color : (theme?.colors?.textSecondary || '#64748B')}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

interface DockNavigationProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function DockNavigation({ state, descriptors, navigation }: DockNavigationProps) {
  const { theme, colorScheme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const { state: appState } = useApp();

  const allowedTabs = ['index', 'connect', 'notifications'];
  const filteredRoutes = state.routes.filter((route: any) => allowedTabs.includes(route.name));
  const tabWidth = width / filteredRoutes.length;

  const activeIndex = state.routes.findIndex((r: any) => r.key === state.routes[state.index].key);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(activeIndex * tabWidth, { damping: 15, stiffness: 120 }) }],
    };
  });

  return (
    <View style={[styles.container, { bottom: insets.bottom }]}>
      <BlurView intensity={90} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.blurView}>
        <Animated.View style={[styles.activeIndicator, { width: tabWidth }, indicatorStyle]} />
        {filteredRoutes.map((route: any) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <DockTab
              key={route.key}
              title={options.title}
              icon={options.tabBarIcon({ color: '' }).props.name} // A bit of a hack to get the icon name
              isActive={isFocused}
              onPress={onPress}
              color={theme?.colors?.primary || '#22C55E'}
            />
          );
        })}
      </BlurView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: theme.radii.full,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  blurView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
  },
  activeIndicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: (theme?.colors?.primary || '#22C55E') + '20',
    borderRadius: theme?.radii?.full || 9999,
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
