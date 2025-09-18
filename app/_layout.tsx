import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme'; // Removed for forced dark mode
import { AppProvider, useApp } from '@/contexts/app-context';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { state } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';
    
    if (state.userRole && !inAuthGroup) {
      // User has role selected, redirect to tabs
      router.replace('/(tabs)');
    } else if (!state.userRole && inAuthGroup) {
      // User has no role selected, redirect to onboarding
      router.replace('/onboarding');
    }
  }, [state.userRole, segments]);

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = 'dark'; // Force dark mode

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProvider>
  );
}
