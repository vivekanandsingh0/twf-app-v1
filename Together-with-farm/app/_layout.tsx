import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useColorScheme } from '@/hooks/use-color-scheme';
import SplashScreen from '@/components/SplashScreen';
import OnboardingScreen from '@/components/OnboardingScreen';
import RoleSelectionScreen from '@/components/RoleSelectionScreen';
import LoginScreen from '@/components/LoginScreen';
import { FavouritesProvider } from '@/contexts/FavouritesContext';
import { AddressProvider } from '@/contexts/AddressContext';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { CartProvider } from '@/contexts/CartContext';
import { VendorProvider } from '@/contexts/VendorContext';
import { MarketProvider } from '@/contexts/MarketContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const router = useRouter(); // Initialize router
  const { session, loading, userData } = useUser(); // Destructure userData
  console.log("_layout: AppContent rendered", { session: !!session, loading });
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userType, setUserType] = useState<'User' | 'Vendor'>('User');

  // Reset auth flow state when user logs out
  // Reset auth flow state when user logs out
  useEffect(() => {
    if (!session && !loading) {
      setShowSplash(true);
      setShowOnboarding(true);
      setShowRoleSelection(false);
      setShowLogin(false);
    } else if (session && !loading) {
      // Redirect to appropriate home screen on login
      // This prevents stuck states like "Product not found"
      if (userData.userType === 'Vendor') {
        router.replace('/(vendor-tabs)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [session, loading, userData.userType]);

  if (showSplash || !fontsLoaded) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // If Supabase is still loading the session after Splash is done, show a loader
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1F5E2E" />
      </View>
    );
  }

  // If user is authenticated, show the main app
  if (session) {
    return (
      <CartProvider>
        <AddressProvider>
          <FavouritesProvider>
            <MarketProvider>
              <VendorProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(vendor-tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="add-product-vendor" options={{ headerShown: false }} />
                    <Stack.Screen name="vendor-payouts" options={{ headerShown: false }} />
                    <Stack.Screen name="notifications" options={{ headerShown: false }} />
                    <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="farmer/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="profile-edit" options={{ headerShown: false }} />
                    <Stack.Screen name="edit-profile-vendor" options={{ headerShown: false }} />
                    <Stack.Screen name="favourites" options={{ headerShown: false }} />
                    <Stack.Screen name="addresses" options={{ headerShown: false }} />
                    <Stack.Screen name="settings" options={{ headerShown: false }} />
                    <Stack.Screen name="cart" options={{ headerShown: false }} />
                    <Stack.Screen name="checkout" options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  </Stack>
                  <StatusBar style="auto" />
                </ThemeProvider>
              </VendorProvider>
            </MarketProvider>
          </FavouritesProvider>
        </AddressProvider>
      </CartProvider>
    );
  }

  // Auth Flow
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
        onLoginSuccess={() => {
          // Context handles session update, triggering re-render to main app
          // But strictly we can reset this local state too
          setShowLogin(false);
        }}
        onBack={() => {
          setShowLogin(false);
          setShowRoleSelection(true);
        }}
      />
    );
  }

  return null;
}

export default function RootLayout() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
