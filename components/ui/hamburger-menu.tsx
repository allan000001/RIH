import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideOutLeft,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/app-context';

const { width, height } = Dimensions.get('window');

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}

function MenuItem({ icon, title, subtitle, onPress, color }: MenuItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 200 });
    });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.menuItem, { backgroundColor: colors.surface }, animatedStyle]}>
        <View style={[styles.menuIconContainer, { backgroundColor: color || colors.primary + '20' }]}>
          <IconSymbol
            name={icon}
            size={24}
            color={color || colors.primary}
          />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        <IconSymbol
          name="chevron.right"
          size={16}
          color={colors.textSecondary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

interface HamburgerMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

export function HamburgerMenu({ isVisible, onClose }: HamburgerMenuProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { state } = useApp();

  const menuItems = [
    {
      icon: 'gearshape.fill',
      title: 'Settings',
      subtitle: 'Preferences & Account',
      color: '#6B7280',
      onPress: () => {
        onClose();
        router.push('/modal');
      },
    },
    {
      icon: 'chart.bar.fill',
      title: 'Analytics',
      subtitle: 'Usage & Performance',
      color: '#10B981',
      onPress: () => {
        onClose();
        console.log('Navigate to Analytics');
      },
    },
    {
      icon: 'person.2.fill',
      title: 'Community',
      subtitle: 'Connect with others',
      color: '#F59E0B',
      onPress: () => {
        onClose();
        console.log('Navigate to Community');
      },
    },
    {
      icon: 'questionmark.circle.fill',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      color: '#3B82F6',
      onPress: () => {
        onClose();
        console.log('Navigate to Help');
      },
    },
    {
      icon: 'info.circle.fill',
      title: 'About',
      subtitle: 'App info & version',
      color: '#6B7280',
      onPress: () => {
        onClose();
        console.log('Navigate to About');
      },
    },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        
        <Animated.View
          entering={SlideInLeft.delay(100)}
          exiting={SlideOutLeft}
          style={[styles.menu, { backgroundColor: colors.card }]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerContent}>
              <View style={[styles.appIcon, { backgroundColor: state.userRole === 'host' ? '#10B981' : '#3B82F6' }]}>
                <IconSymbol
                  name="wifi"
                  size={24}
                  color="white"
                />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.appName, { color: colors.text }]}>
                  AirLink
                </Text>
                <Text style={[styles.userRole, { color: colors.textSecondary }]}>
                  {state.userRole === 'host' ? 'Host Mode' : 'Connector Mode'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <IconSymbol
                name="xmark"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => (
              <Animated.View
                key={item.title}
                entering={SlideInLeft.delay(200 + index * 50)}
              >
                <MenuItem
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  color={item.color}
                  onPress={item.onPress}
                />
              </Animated.View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              AirLink v1.0.0
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menu: {
    width: width * 0.8,
    maxWidth: 320,
    height: height,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60, // Account for status bar
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  footer: {
    padding: 20,
    paddingBottom: 40, // Account for home indicator
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
