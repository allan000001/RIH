import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme'; // Removed for forced dark mode
import { useApp } from '@/contexts/app-context';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = 'dark'; // Force dark mode
  const colors = Colors.dark;
  const { setUserRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<'host' | 'connector' | null>(null);

  const handleRoleSelect = (role: 'host' | 'connector') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (selectedRole) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await setUserRole(selectedRole);
      router.replace('/(tabs)');
    }
  };

  const getRoleColors = (role: 'host' | 'connector') => {
    return Colors[role].dark;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeIn} style={styles.content}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome to AirLink
          </Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
            Choose how you want to use AirLink
          </Text>
        </Animated.View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          {/* Host Role */}
          <Animated.View entering={SlideInRight.delay(400)}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'host' && {
                  borderColor: getRoleColors('host').primary,
                  borderWidth: 3,
                },
              ]}
              onPress={() => handleRoleSelect('host')}
            >
              <Card variant="elevated" style={styles.card}>
                <CardContent style={styles.cardContent}>
                  <View style={[styles.roleIcon, { backgroundColor: getRoleColors('host').primary }]}>
                    <Text style={styles.roleEmoji}>📡</Text>
                  </View>
                  <Text style={[styles.roleTitle, { color: getRoleColors('host').primary }]}>
                    Host
                  </Text>
                  <Text style={[styles.roleDescription, { color: colors.text }]}>
                    Share your internet connection with others
                  </Text>
                  <View style={styles.featureList}>
                    <Text style={[styles.feature, { color: colors.tabIconDefault }]}>
                      • Share your mobile data or WiFi
                    </Text>
                    <Text style={[styles.feature, { color: colors.tabIconDefault }]}>
                      • Control who connects to you
                    </Text>
                    <Text style={[styles.feature, { color: colors.tabIconDefault }]}>
                      • Monitor data usage and bandwidth
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          </Animated.View>

          {/* Connector Role */}
          <Animated.View entering={SlideInRight.delay(600)}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedRole === 'connector' && {
                  borderColor: getRoleColors('connector').primary,
                  borderWidth: 3,
                },
              ]}
              onPress={() => handleRoleSelect('connector')}
            >
              <Card variant="elevated" style={styles.card}>
                <CardContent style={styles.cardContent}>
                  <View style={[styles.roleIcon, { backgroundColor: getRoleColors('connector').primary }]}>
                    <Text style={styles.roleEmoji}>📱</Text>
                  </View>
                  <Text style={[styles.roleTitle, { color: getRoleColors('connector').primary }]}>
                    Connector
                  </Text>
                  <Text style={[styles.roleDescription, { color: colors.text }]}>
                    Connect to shared internet from hosts
                  </Text>
                  <View style={styles.featureList}>
                    <Text style={[styles.feature, { color: colors.tabIconDefault }]}>
                      • Find and connect to nearby hosts
                    </Text>
                    <Text style={[styles.feature, { color: colors.tabIconDefault }]}>
                      • Scan QR codes for quick connection
                    </Text>
                    <Text style={[styles.feature, { color: colors.tabIconDefault }]}>
                      • Track your data usage
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Continue Button */}
        {selectedRole && (
          <Animated.View entering={FadeInDown.delay(800)} style={styles.buttonContainer}>
            <Button
              title="Continue"
              variant="primary"
              size="large"
              role={selectedRole}
              onPress={handleContinue}
              style={styles.continueButton}
            />
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  roleContainer: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
  },
  roleCard: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  card: {
    margin: 0,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleEmoji: {
    fontSize: 36,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  featureList: {
    alignSelf: 'stretch',
  },
  feature: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 40,
  },
  continueButton: {
    width: '100%',
  },
});
