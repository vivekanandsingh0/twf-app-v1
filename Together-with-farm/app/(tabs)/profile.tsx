import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { userData, signOut } = useUser();

    const handleLogout = () => {
        console.log("Logout button pressed");
        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to log out?")) {
                console.log("Web logout confirmed");
                signOut().catch(error => {
                    console.error("Logout failed:", error);
                    alert("Failed to log out");
                });
            }
        } else {
            console.log("Showing alert dialog");
            Alert.alert(
                "Log Out",
                "Are you sure you want to log out?",
                [
                    { text: "Cancel", style: "cancel", onPress: () => console.log("Logout cancelled") },
                    {
                        text: "Log Out",
                        style: "destructive",
                        onPress: async () => {
                            console.log("Logout confirmed in Alert");
                            try {
                                console.log("Calling signOut...");
                                await signOut();
                                console.log("signOut completed");
                            } catch (error) {
                                console.error("Logout failed:", error);
                                Alert.alert("Error", "Failed to log out. Please try again.");
                            }
                        }
                    }
                ]
            );
        }
    };

    const renderMenuItem = (icon: keyof typeof Ionicons.glyphMap, title: string, onPress?: () => void) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon} size={22} color="#1A1A1A" />
            </View>
            <Text style={styles.menuText}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.iconButton, { marginLeft: 8 }]}
                        onPress={() => router.push('/notifications')}
                    >
                        <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.badgeText}>2</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* User Profile Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop' }}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userData.fullName}</Text>
                        <Text style={styles.userPhone}>{userData.phoneNumber || '+91 23456 7890'}</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile-edit')}>
                        <Ionicons name="create-outline" size={20} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>

                {/* My Activity Section */}
                <Text style={styles.sectionTitle}>My Activity</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('cart-outline', 'Your Orders', () => router.push('/orders'))}
                    {renderMenuItem('heart-outline', 'My Favourites', () => router.push('/favourites'))}
                    {renderMenuItem('pricetag-outline', 'Promotion & Vouchers')}
                </View>

                {/* Account Settings Section */}
                <Text style={styles.sectionTitle}>Account Settings</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('location-outline', 'Addresses', () => router.push('/addresses'))}
                    {renderMenuItem('card-outline', 'Payment Methods')}
                    {renderMenuItem('settings-outline', 'Settings', () => router.push('/settings'))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC', // Slightly off-white for contrast
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },

    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#1F5E2E',
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 4,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
    },
    editButton: {
        padding: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 16,
        marginTop: 8,
    },
    menuGroup: {
        gap: 16,
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    menuIconContainer: {
        width: 32,
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
        color: '#333',
    },
    logoutButton: {
        backgroundColor: '#FFEBEE',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    logoutText: {
        color: '#D32F2F',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
});
