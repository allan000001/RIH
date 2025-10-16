import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/lib/use-color-scheme';
import { Colors } from '@/constants/theme';
import { HamburgerMenu } from '@/components/ui/hamburger-menu';
import { useApp } from '@/lib/app-context';

const { width } = Dimensions.get('window');

export function FloatingHamburger() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const colors = theme.colors;
  const { state } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 200 });
    });
    
    rotation.value = withTiming(showMenu ? 0 : 180, { duration: 300 });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMenu(!showMenu);
  };

  const brandColor = '#10B981';

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: brandColor,
              shadowColor: brandColor,
            }
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.iconContainer, animatedStyle]}>
            <View style={styles.hamburgerIcon}>
              <View style={[styles.line, { backgroundColor: 'white' }]} />
              <View style={[styles.line, { backgroundColor: 'white' }]} />
              <View style={[styles.line, { backgroundColor: 'white' }]} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <HamburgerMenu
        isVisible={showMenu}
        onClose={() => {
          setShowMenu(false);
          rotation.value = withTiming(0, { duration: 300 });
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below status bar
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburgerIcon: {
    gap: 3,
  },
  line: {
    width: 18,
    height: 2,
    borderRadius: 1,
  },
});
