import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppProvider, useApp } from '@/lib/app-context';
import { ThemeProvider, useTheme } from '@/lib/useTheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { state } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';
    
    if (state.userRole && !inAuthGroup) {
      // User has role selected, redirect to tabs
      router.replace('/(tabs)');
    } else if (!state.userRole && inAuthGroup) {
      // User has no role selected, redirect to onboarding
      router.replace('/onboarding');
    }
  }, [state.userRole, segments, router]);

  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.card,
      },
      headerTintColor: theme.colors.text,
    }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

function ThemedRootLayout() {
    const { colorScheme } = useTheme();
    const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    return (
        <NavigationThemeProvider value={navigationTheme}>
            <RootLayoutNav />
            <ExpoStatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </NavigationThemeProvider>
    )
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppProvider>
      <ThemeProvider>
        <ThemedRootLayout />
      </ThemeProvider>
    </AppProvider>
  );
}
