import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useApp } from '@/contexts/app-context';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, setUserRole } = useApp();
  const roleColors = state.userRole ? Colors[state.userRole][colorScheme ?? 'light'] : { primary: colors.primary };
  
  // Ensure colors object has required properties
  const safeColors = {
    ...colors,
    text: colors.text || '#000000',
    tabIconDefault: colors.tabIconDefault || '#666666',
  };

  const [userName, setUserName] = useState('AirLink User');
  const [deviceName, setDeviceName] = useState('My Device');
  const [autoAccept, setAutoAccept] = useState(false);
  const [dataLimit, setDataLimit] = useState('5');
  const [notifications, setNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleRoleSwitch = () => {
    Alert.alert(
      'Switch Role',
      `Switch from ${state.userRole} to ${state.userRole === 'host' ? 'connector' : 'host'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            const newRole = state.userRole === 'host' ? 'connector' : 'host';
            setUserRole(newRole);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.back();
          },
        },
      ]
    );
  };

  const handleResetRole = () => {
    Alert.alert(
      'Reset Role',
      'This will reset your role selection and return you to onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setUserRole(null);
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const SettingRow = ({ 
    title, 
    subtitle, 
    value, 
    onPress, 
    showChevron = true, 
    children 
  }: {
    title: string;
    subtitle?: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
    children?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: safeColors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.tabIconDefault }]}>
              {subtitle}
            </Text>
          )}
        </View>
        <View style={styles.settingValue}>
          {children || (
            <>
              {value && (
                <Text style={[styles.settingValueText, { color: colors.tabIconDefault }]}>
                  {value}
                </Text>
              )}
              {showChevron && onPress && (
                <IconSymbol name="chevron.right" size={16} color={colors.tabIconDefault} />
              )}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={safeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: safeColors.text }]}>
          Settings
        </Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Card variant="elevated">
            <CardHeader>
              <View style={styles.profileHeader}>
                <View style={[styles.avatar, { backgroundColor: roleColors.primary }]}>
                  <Text style={styles.avatarText}>
                    {state.userRole === 'host' ? '📡' : '📱'}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: safeColors.text }]}>
                    {userName}
                  </Text>
                  <Text style={[styles.profileRole, { color: roleColors.primary }]}>
                    {state.userRole ? state.userRole.charAt(0).toUpperCase() + state.userRole.slice(1) : 'No Role'}
                  </Text>
                  {state.hostId && (
                    <Text style={[styles.profileId, { color: colors.tabIconDefault }]}>
                      ID: {state.hostId}
                    </Text>
                  )}
                </View>
              </View>
            </CardHeader>
            <CardContent>
              <Input
                value={userName}
                onChangeText={setUserName}
                placeholder="Display Name"
                style={styles.input}
              />
              <Input
                value={deviceName}
                onChangeText={setDeviceName}
                placeholder="Device Name"
                style={styles.input}
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* Role Management */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: safeColors.text }]}>
            Role Management
          </Text>
          <Card variant="default">
            <CardContent style={styles.cardContent}>
              <SettingRow
                title="Switch Role"
                subtitle={`Currently: ${state.userRole}`}
                onPress={handleRoleSwitch}
              />
              <View style={styles.divider} />
              <SettingRow
                title="Reset Role Selection"
                subtitle="Return to onboarding"
                onPress={handleResetRole}
                showChevron={false}
              >
                <IconSymbol name="arrow.clockwise" size={16} color={colors.error} />
              </SettingRow>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Connection Settings */}
        {state.userRole === 'host' && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: safeColors.text }]}>
              Host Settings
            </Text>
            <Card variant="default">
              <CardContent style={styles.cardContent}>
                <SettingRow
                  title="Auto-Accept Connections"
                  subtitle="Automatically accept trusted devices"
                  showChevron={false}
                >
                  <Switch
                    value={autoAccept}
                    onValueChange={setAutoAccept}
                    trackColor={{ false: colors.border, true: roleColors.primary }}
                    thumbColor={autoAccept ? 'white' : colors.tabIconDefault}
                  />
                </SettingRow>
                <View style={styles.divider} />
                <SettingRow
                  title="Data Limit"
                  subtitle="Daily sharing limit (GB)"
                  showChevron={false}
                >
                  <Input
                    value={dataLimit}
                    onChangeText={setDataLimit}
                    placeholder="5"
                    keyboardType="numeric"
                    style={styles.smallInput}
                  />
                </SettingRow>
              </CardContent>
            </Card>
          </Animated.View>
        )}

        {/* App Settings */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: safeColors.text }]}>
            App Settings
          </Text>
          <Card variant="default">
            <CardContent style={styles.cardContent}>
              <SettingRow
                title="Notifications"
                subtitle="Connection alerts and updates"
                showChevron={false}
              >
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.border, true: roleColors.primary }}
                  thumbColor={notifications ? 'white' : colors.tabIconDefault}
                />
              </SettingRow>
              <View style={styles.divider} />
              <SettingRow
                title="Haptic Feedback"
                subtitle="Vibration for interactions"
                showChevron={false}
              >
                <Switch
                  value={hapticFeedback}
                  onValueChange={setHapticFeedback}
                  trackColor={{ false: colors.border, true: roleColors.primary }}
                  thumbColor={hapticFeedback ? 'white' : colors.tabIconDefault}
                />
              </SettingRow>
              <View style={styles.divider} />
              <SettingRow
                title="Theme"
                subtitle="App appearance"
                value={colorScheme === 'dark' ? 'Dark' : 'Light'}
                onPress={() => {}}
              />
            </CardContent>
          </Card>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: safeColors.text }]}>
            About
          </Text>
          <Card variant="default">
            <CardContent style={styles.cardContent}>
              <SettingRow
                title="Version"
                subtitle="App version information"
                value="1.0.0"
                showChevron={false}
              />
              <View style={styles.divider} />
              <SettingRow
                title="Privacy Policy"
                subtitle="How we handle your data"
                onPress={() => {}}
              />
              <View style={styles.divider} />
              <SettingRow
                title="Terms of Service"
                subtitle="Usage terms and conditions"
                onPress={() => {}}
              />
            </CardContent>
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  profileId: {
    fontSize: 14,
    opacity: 0.7,
  },
  input: {
    marginBottom: 12,
  },
  smallInput: {
    width: 80,
    textAlign: 'center',
  },
  cardContent: {
    padding: 0,
  },
  settingRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValueText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  bottomSpacing: {
    height: 40,
  },
});
