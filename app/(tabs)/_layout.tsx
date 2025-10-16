import { Tabs } from 'expo-router';
import React from 'react';
import { Switch } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/design-system/icon-symbol';
import { DockNavigation } from '@/navigation/dock-navigation';
import { FloatingHamburger } from '@/components/ui/floating-hamburger';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/app-context';

type TabConfig = {
  name: string;
  title: string;
  icon: string;
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

  const tabs: TabConfig[] = [
    { 
      name: 'index', 
      title: 'Home', 
      icon: 'house.fill', 
      headerTitle: 'AirLink',
      headerRight: () => <ShareSwitch />
    },
    {
      name: 'connect',
      title: 'Connect',
      icon: 'wifi',
      headerTitle: 'Connect & Share',
    },
    { name: 'notifications', title: 'Activity', icon: 'bell.fill', headerTitle: 'Activity' },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme?.colors?.background || '#F8FAFC' }}>
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
              tabBarIcon: ({ color }) => <IconSymbol size={28} name={tab.icon as any} color={color} />,
              headerShown: true,
              headerTitle: tab.headerTitle,
              headerStyle: {
                backgroundColor: theme.colors.card,
              },
              headerTintColor: theme.colors.text,
              headerTitleStyle: {
                fontSize: theme.fontSizes.lg,
                fontWeight: theme.fontWeights.bold as any,
              },
              headerRight: tab.headerRight,
            }}
          />
        ))}
      </Tabs>
      
      <FloatingHamburger />
    </GestureHandlerRootView>
  );
}
