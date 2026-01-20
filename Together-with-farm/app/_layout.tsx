import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import SplashScreen from '@/components/SplashScreen';
import OnboardingScreen from '@/components/OnboardingScreen';
import RoleSelectionScreen from '@/components/RoleSelectionScreen';
import LoginScreen from '@/components/LoginScreen';
import { FavouritesProvider } from '@/contexts/FavouritesContext';
import { AddressProvider } from '@/contexts/AddressContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userType, setUserType] = useState<'User' | 'Vendor'>('User');

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => {
      setShowOnboarding(false);
      setShowRoleSelection(true);
    }} />;
  }

  if (showRoleSelection) {
    return (
      <RoleSelectionScreen
        onSelectUser={() => {
          setUserType('User');
          setShowRoleSelection(false);
          setShowLogin(true);
        }}
        onSelectVendor={() => {
          setUserType('Vendor');
          setShowRoleSelection(false);
          setShowLogin(true);
        }}
      />
    );
  }

  if (showLogin) {
    return (
      <LoginScreen
        userType={userType}
        onLoginSuccess={() => setShowLogin(false)}
        onBack={() => {
          setShowLogin(false);
          setShowRoleSelection(true);
        }}
      />
    );
  }

  return (
    <AddressProvider>
      <FavouritesProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="farmer/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="profile-edit" options={{ headerShown: false }} />
            <Stack.Screen name="favourites" options={{ headerShown: false }} />
            <Stack.Screen name="addresses" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </FavouritesProvider>
    </AddressProvider>
  );
}
