import 'react-native-url-polyfill/auto';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
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
import NameInputScreen from '@/components/NameInputScreen';
import MaintenanceScreen from '@/components/MaintenanceScreen';
import { supabase } from '@/lib/supabase';
import { FavouritesProvider } from '@/contexts/FavouritesContext';
import { AddressProvider } from '@/contexts/AddressContext';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { CartProvider } from '@/contexts/CartContext';
import { VendorProvider } from '@/contexts/VendorContext';
import { MarketProvider } from '@/contexts/MarketContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/contexts/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Helper component to consume theme context and provide it to Navigation
function NavigationThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, isDark } = useTheme();
  return (
    <NavigationThemeProvider value={theme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </NavigationThemeProvider>
  );
}

function AppContent() {
  const router = useRouter(); // Initialize router
  const { session, loading, userData } = useUser(); // Destructure userData
  console.log("_layout: AppContent rendered", { session: !!session, loading });
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const isFontsReady = fontsLoaded || fontError;

  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userType, setUserType] = useState<'User' | 'Vendor'>('User');
  const [hasNavigated, setHasNavigated] = useState(false);

  const [maintenance, setMaintenance] = useState<{ is_active: boolean; message: string; app_type: string } | null>(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);

  // Fetch maintenance status
  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const { data, error } = await supabase.from('maintenance_settings').select('*');
        if (!error && data) {
          // We'll figure out which app to block down in render based on userType/userData
          const relevantAppType = session && userData?.userType === 'Vendor' ? 'Vendor' : 'User';
          const config = data.find((s: any) => s.app_type === relevantAppType);
          if (config && config.is_active) {
            setMaintenance(config);
          } else {
            setMaintenance(null);
          }
        }
      } catch (e) {
        console.error("Failed to check maintenance", e);
      } finally {
        setMaintenanceLoading(false);
      }
    };
    fetchMaintenance();

    // Listen for real-time maintenance toggles
    const sub = supabase.channel('market:maintenance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_settings' }, () => {
        fetchMaintenance();
      }).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [session, userData?.userType]);

  // Reset auth flow state when user logs out
  useEffect(() => {
    if (!session && !loading) {
      // User is logged out
      setShowOnboarding(true);
      setShowRoleSelection(false);
      setShowLogin(false);
      setHasNavigated(false);
    } else if (session && !loading && !hasNavigated) {
      // Check for valid name before redirecting
      if (userData.fullName && userData.fullName !== 'Anonymous') {
        // User is logged in - Navigate only once
        if (userData.userType === 'Vendor') {
          router.replace('/(vendor-tabs)');
        } else {
          router.replace('/(tabs)');
        }
        setHasNavigated(true);
      }
    }
  }, [session, loading, userData.userType, userData.fullName, hasNavigated]);

  // Determine Main Content
  let content = null;

  if (loading) {
    // While loading session, show nothing (Splash covers it) or a Spinner underneath
    content = (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1F5E2E" />
      </View>
    );
  } else if (session) {
    // Authenticated Stack
    // Check if name is missing or Anonymous (Mandatory Name Step)
    if (!userData.fullName || userData.fullName === 'Anonymous') {
      content = (
        <NameInputScreen onFinish={() => {
          // userData will update, causing re-render.
          // Reset navigation flag to allow router.replace to run again if needed
          setHasNavigated(false);
        }} />
      );
    } else {
      content = (
        <CartProvider>
          <AddressProvider>
            <FavouritesProvider>
              <MarketProvider>
                <VendorProvider>
                  <NotificationProvider>
                    <NavigationThemeWrapper>
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="(vendor-tabs)" />
                        <Stack.Screen name="add-product-vendor" />
                        <Stack.Screen name="vendor-payouts" />
                        <Stack.Screen name="notifications" />
                        <Stack.Screen name="vendor-order-details" />
                        <Stack.Screen name="product/[id]" />
                        <Stack.Screen name="farmer/[id]" />
                        <Stack.Screen name="profile-edit" />
                        <Stack.Screen name="edit-profile-vendor" />
                        <Stack.Screen name="favourites" />
                        <Stack.Screen name="addresses" />
                        <Stack.Screen name="settings" />
                        <Stack.Screen name="cart" />
                        <Stack.Screen name="checkout" />
                        <Stack.Screen name="confirm-address" />
                        <Stack.Screen name="business-dashboard" />
                        <Stack.Screen name="vendor-payment-methods" />
                        <Stack.Screen name="support" />
                        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
                      </Stack>
                    </NavigationThemeWrapper>
                  </NotificationProvider>
                </VendorProvider>
              </MarketProvider>
            </FavouritesProvider>
          </AddressProvider>
        </CartProvider>
      );
    }
  } else {
    // Auth Flow
    if (showOnboarding) {
      content = <OnboardingScreen onFinish={() => {
        setShowOnboarding(false);
        setShowRoleSelection(true);
      }} />;
    } else if (showRoleSelection) {
      content = (
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
    } else if (showLogin) {
      content = (
        <LoginScreen
          userType={userType}
          onLoginSuccess={() => {
            setShowLogin(false);
          }}
          onBack={() => {
            setShowLogin(false);
            setShowRoleSelection(true);
          }}
        />
      );
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {content}

      {/* Maintenance Screen Overlay - Rendered above content but below Splash */}
      {maintenance && !maintenanceLoading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}>
          <MaintenanceScreen
            appType={maintenance.app_type as 'User' | 'Vendor'}
            message={maintenance.message}
          />
        </View>
      )}

      {/* Splash Screen Overlay - Always rendered on top until finished */}
      {(showSplash || !isFontsReady || loading || maintenanceLoading) && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <SplashScreen onFinish={() => setShowSplash(false)} />
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <CustomThemeProvider>
        <AppContent />
      </CustomThemeProvider>
    </UserProvider>
  );
}

