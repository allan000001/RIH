import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useApp } from '@/contexts/app-context';

const { width } = Dimensions.get('window');

interface DockTabProps {
  name: string;
  title: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
  color: string;
}

function DockTab({ name, title, icon, isActive, onPress, color }: DockTabProps) {
  const scale = useSharedValue(1);
  const colorScheme = 'dark'; // Force dark mode
  const colors = Colors.dark;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 200 });
    });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.tabContainer}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View style={[animatedStyle]}>
        <View style={[
          styles.iconContainer,
          isActive && {
            backgroundColor: color + '20',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }
        ]}>
          <IconSymbol
            name={icon as any}
            size={24}
            color={isActive ? color : colors.tabIconDefault}
          />
        </View>
        <Text style={[
          styles.tabLabel,
          {
            color: isActive ? color : colors.textSecondary,
            fontWeight: isActive ? '700' : '500',
          }
        ]}>
          {title}
        </Text>
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
  const colorScheme = 'dark'; // Force dark mode
  const colors = Colors.dark;
  const { state: appState } = useApp();

  // Get role-specific colors
  const roleColors = appState.userRole ? Colors[appState.userRole].dark : null;

  const getTabConfig = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return {
          title: 'Home',
          icon: 'house.fill',
          color: roleColors?.primary || colors.primary,
        };
      case 'connect':
        return {
          title: 'Connect',
          icon: 'wifi',
          color: '#3B82F6', // Blue for connect
        };
      case 'notifications':
        return {
          title: 'Notifications',
          icon: 'bell.fill',
          color: '#F59E0B', // Amber for notifications
        };
      default:
        return {
          title: routeName,
          icon: 'circle.fill',
          color: colors.primary,
        };
    }
  };

  // Filter to only show the 3 main tabs
  const allowedTabs = ['index', 'connect', 'notifications'];
  const filteredRoutes = state.routes.filter((route: any) => allowedTabs.includes(route.name));

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.dock}>
        {filteredRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);
          const config = getTabConfig(route.name);

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
              name={route.name}
              title={config.title}
              icon={config.icon}
              isActive={isFocused}
              onPress={onPress}
              color={config.color}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    paddingVertical: 4, // Minimal padding
    paddingBottom: 12, // Minimal safe area
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  dock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8, // Minimal padding
  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40, // Very compact
    paddingVertical: 2, // Minimal padding
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0, // No margin
  },
  tabLabel: {
    fontSize: 8, // Very small text
    textAlign: 'center',
    marginTop: 0,
  },
});
