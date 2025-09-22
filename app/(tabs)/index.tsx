import React from 'react';
import { useApp } from '@/lib/app-context';
import HostDashboardScreen from '../../screens/HostDashboardScreen';
import ConnectorDashboardScreen from '../../screens/ConnectorDashboardScreen';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  const { state } = useApp();
  const { userRole } = state;

  if (userRole === 'host') {
    return <HostDashboardScreen />;
  }

  if (userRole === 'connector') {
    return <ConnectorDashboardScreen />;
  }

  // Render a loading state or a fallback while the role is being determined
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );
}
