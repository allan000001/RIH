import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DockNavigation } from '@/components/ui/dock-navigation';
import { FloatingHamburger } from '@/components/ui/floating-hamburger';
import { HamburgerMenu } from '@/components/ui/hamburger-menu';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/contexts/app-context';

export default function TabLayout() {
  const colorScheme = 'dark'; // Force dark mode
  const { state } = useApp();
  const router = useRouter();
  const colors = Colors.dark;
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  // Get role-specific colors
  const roleColors = state.userRole !== null ? Colors[state.userRole].dark : null;
  const tabBarActiveTintColor = roleColors?.primary || colors.tint;

  // Only 3 tabs: Home, Connect, Notifications
  const getTabScreens = () => {
    return (
      <>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            headerShown: true,
            headerTitle: state.userRole === 'host' ? 'AirLink Host' : 'AirLink',
            headerRight: () => null,
          }}
        />
        <Tabs.Screen
          name="connect"
          options={{
            title: 'Connect',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="wifi" color={color} />,
            headerShown: true,
            headerTitle: 'Connect',
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
            headerShown: true,
            headerTitle: 'Activity',
          }}
        />
      </>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <DockNavigation {...props} />}
        screenOptions={{
          tabBarActiveTintColor: roleColors?.primary || colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        {getTabScreens()}
      </Tabs>
      
      <FloatingHamburger />
      <HamburgerMenu
        isVisible={showHamburgerMenu}
        onClose={() => setShowHamburgerMenu(false)}
      />
    </GestureHandlerRootView>
  );
}
