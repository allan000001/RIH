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

import { Card, CardContent, CardHeader } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { Input } from '@/components/design-system/input';
import { IconSymbol } from '@/components/design-system/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/lib/use-color-scheme';
import { useApp } from '@/lib/app-context';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const colors = theme.colors;
  const { state, setUserRole } = useApp();
  const roleTheme = state.userRole ? Colors[state.userRole][colorScheme ?? 'light'] : null;
  const roleColors = roleTheme?.colors || colors;

  const [userName, setUserName] = useState('AirLink User');
  const [deviceName, setDeviceName] = useState('My Device');
  const [autoAccept, setAutoAccept] = useState(false);
  const [dataLimit, setDataLimit] = useState('5');
  const [notifications, setNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);



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
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        <View style={styles.settingValue}>
          {children || (
            <>
              {value && (
                <Text style={[styles.settingValueText, { color: colors.textSecondary }]}>
                  {value}
                </Text>
              )}
              {showChevron && onPress && (
                <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
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
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
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
                <View style={[styles.avatar, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.avatarText}>
                    📡
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: colors.text }]}>
                    {userName}
                  </Text>
                  <Text style={[styles.profileRole, { color: '#10B981' }]}>
                    AirLink User
                  </Text>
                  {state.hostId && (
                    <Text style={[styles.profileId, { color: colors.textSecondary }]}>
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

        {/* Connection Settings */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Connection Settings
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
                    thumbColor={autoAccept ? 'white' : colors.textSecondary}
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

        {/* App Settings */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
                  thumbColor={notifications ? 'white' : colors.textSecondary}
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
                  thumbColor={hapticFeedback ? 'white' : colors.textSecondary}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
