import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { CustomTabBar } from '@/components/CustomTabBar';
import { useUser } from '@/contexts/UserContext';

export default function TabLayout() {
  const { userData, loading } = useUser();

  if (!loading && userData.userType === 'Vendor') {
    // @ts-ignore
    return <Redirect href="/(vendor-tabs)" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: 'Category',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
