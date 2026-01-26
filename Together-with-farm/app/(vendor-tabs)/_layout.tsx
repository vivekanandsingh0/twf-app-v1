import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { VendorTabBar } from '@/components/VendorTabBar';
import { useUser } from '@/contexts/UserContext';

export default function VendorTabLayout() {
    const { userData, loading } = useUser();

    if (!loading && userData.userType === 'User') {
        // @ts-ignore
        return <Redirect href="/(tabs)" />;
    }

    return (
        <Tabs
            tabBar={(props) => <VendorTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                }}
            />
            <Tabs.Screen
                name="inventory"
                options={{
                    title: 'Inventory',
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
