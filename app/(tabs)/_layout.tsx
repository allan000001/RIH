import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Switch, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/design-system/icon-symbol';
import { DockNavigation } from '@/navigation/dock-navigation';
import { FloatingHamburger } from '@/components/ui/floating-hamburger';
import { HamburgerMenu } from '@/components/ui/hamburger-menu';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/app-context';

type TabConfig = {
  name: string;
  title: string;
  icon: any; // TODO: Export IconName from icon-symbol.tsx
  headerTitle: string;
  headerRight?: () => React.ReactNode;
};

const ShareSwitch = () => {
  const { state, toggleSharing } = useApp();
  const { theme } = useTheme();
  return (
    <Switch
      value={state.isSharing}
      onValueChange={toggleSharing}
      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
      thumbColor={theme.colors.primaryContrast}
      style={{ marginRight: theme.spacing[4] }}
    />
  );
};

export default function TabLayout() {
  const { state } = useApp();
  const { theme } = useTheme();
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  const tabs: TabConfig[] = [
    { name: 'index', title: 'Home', icon: 'house.fill', headerTitle: 'AirLink' },
    {
      name: 'connect',
      title: state.userRole === 'host' ? 'Connections' : 'Connect',
      icon: state.userRole === 'host' ? 'person.2.fill' : 'wifi',
      headerTitle: state.userRole === 'host' ? 'Connections' : 'Connect',
    },
    { name: 'notifications', title: 'Notifications', icon: 'bell.fill', headerTitle: 'Activity' },
  ];

  if (state.userRole === 'host') {
    tabs[0].headerTitle = 'AirLink Host';
    tabs[0].headerRight = () => <ShareSwitch />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tabs
        tabBar={(props) => <DockNavigation {...props} />}
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }) => <IconSymbol size={28} name={tab.icon} color={color} />,
              headerShown: true,
              headerTitle: tab.headerTitle,
              headerStyle: {
                backgroundColor: theme.colors.card,
              },
              headerTintColor: theme.colors.text,
              headerTitleStyle: {
                fontSize: theme.fontSizes.lg,
                fontWeight: theme.fontWeights.bold,
              },
              headerRight: tab.headerRight,
            }}
          />
        ))}
      </Tabs>
      
      <FloatingHamburger />
      <HamburgerMenu
        isVisible={showHamburgerMenu}
        onClose={() => setShowHamburgerMenu(false)}
      />
    </GestureHandlerRootView>
  );
}
