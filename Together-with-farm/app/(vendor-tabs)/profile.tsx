import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform, Switch, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { useVendor } from '@/contexts/VendorContext';
import { supabase } from '@/lib/supabase';
import { useCallback } from 'react';

export default function VendorProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { signOut, switchUserRole, userData } = useUser();
    const { profile, toggleShopStatus } = useVendor();
    const [requestStatus, setRequestStatus] = React.useState<{ status: string; note?: string } | null>(null);
    const [supportPhone, setSupportPhone] = React.useState<string>('');

    React.useEffect(() => {
        const fetchSupportPhone = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'vendor_support_phone')
                .single();
            if (data?.value) {
                setSupportPhone(data.value);
            }
        };
        fetchSupportPhone();
    }, []);

    // Mock status check (No Supabase)
    useFocusEffect(
        useCallback(() => {
            // MOCK: Check local state or just do nothing
            // setRequestStatus(null); 
        }, [])
    );

    const handleSwitchRole = async () => {
        // Dev Only: Immediate switch for testing without dialogs that might be blocked
        console.log("Switching to User...");
        const success = await switchUserRole('User');
        if (success) {
            router.replace('/(tabs)');
        } else {
            alert("Failed to switch role. Check console.");
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    const renderMenuItem = (icon: any, label: string, onPress?: () => void, textColor: string = '#1A1A1A') => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon} size={22} color={textColor} />
            </View>
            <Text style={[styles.menuLabel, { color: textColor }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="gift-outline" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, { marginLeft: 8 }]} onPress={() => router.push('/notifications')}>
                        <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>
            </View>

            {requestStatus?.status === 'Pending' && (
                <View style={styles.reviewBanner}>
                    <Ionicons name="time-outline" size={20} color="#856404" />
                    <Text style={styles.reviewText}>Your profile edits are currently under review.</Text>
                </View>
            )}

            {requestStatus?.status === 'Rejected' && (
                <View style={styles.rejectedBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Ionicons name="alert-circle-outline" size={20} color="#721C24" />
                        <Text style={styles.rejectedTitle}>Profile Update Rejected</Text>
                    </View>
                    <Text style={styles.rejectedText}>
                        {requestStatus.note ? `Reason: "${requestStatus.note}"` : 'Please check your details and try again.'}
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/edit-profile-vendor')} style={{ marginTop: 8 }}>
                        <Text style={{ color: '#721C24', fontFamily: 'DMSans_700Bold', fontSize: 13, textDecorationLine: 'underline' }}>Fix Now</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={profile.profileImage ? { uri: profile.profileImage } : require('@/assets/images/3d-model-with-veg.png')}
                        style={styles.profileImage}
                        contentFit="cover"
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profile.ownerName || userData?.fullName || 'Guest'}</Text>
                        <Text style={styles.profilePhone}>{profile.phone || userData?.phoneNumber || ''}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push('/edit-profile-vendor')}
                    >
                        <Ionicons name="create-outline" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>

                {/* Shop Status Section */}
                <View style={styles.menuGroup}>
                    <View style={styles.menuItem}>
                        <View style={[styles.menuIconContainer, { backgroundColor: profile.shopStatus === 'Active' ? '#E8F5E9' : '#FFEBEE', borderRadius: 8, width: 32, height: 32, justifyContent: 'center', margin: 0, marginRight: 16 }]}>
                            <Ionicons name={profile.shopStatus === 'Active' ? "radio-button-on" : "radio-button-off"} size={18} color={profile.shopStatus === 'Active' ? "#1F5E2E" : "#D32F2F"} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.menuLabel}>Online Status</Text>
                            <Text style={{ fontSize: 12, color: profile.shopStatus === 'Active' ? '#1F5E2E' : '#D32F2F', marginTop: 2 }}>
                                {profile.shopStatus === 'Active' ? 'Shop is Live & Visible' :
                                    profile.shopStatus === 'Inactive' ? 'Shop is Currently Hidden' :
                                        `Shop is ${profile.shopStatus}`}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: "#81b0ff" }} // Fallbacks
                            thumbColor={profile.shopStatus === 'Active' ? "#1F5E2E" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleShopStatus}
                            value={profile.shopStatus === 'Active'}
                            disabled={profile.shopStatus !== 'Active' && profile.shopStatus !== 'Inactive'}
                        />
                    </View>
                </View>

                {/* Manage Business Section */}
                <Text style={styles.sectionTitle}>Manage Business</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('cube-outline', 'Orders', () => router.push('/(vendor-tabs)/orders'))}
                    <View style={styles.divider} />
                    {renderMenuItem('bicycle-outline', 'Delivery Partners', () => router.push('/delivery-partners'))}
                    <View style={styles.divider} />
                    {renderMenuItem('cash-outline', 'Payouts', () => router.push('/vendor-payouts'))}
                </View>

                {/* Performance Section */}
                <Text style={styles.sectionTitle}>Performance</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('grid-outline', 'Business Dashboard', () => router.push('/business-dashboard'))}
                </View>

                {/* More Section */}
                <Text style={styles.sectionTitle}>More</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('card-outline', 'Payout Methods', () => router.push('/vendor-payment-methods'))}
                    <View style={styles.divider} />
                    {renderMenuItem('headset-outline', 'Support', () => {
                        if (supportPhone) {
                            Linking.openURL(`tel:${supportPhone}`);
                        } else {
                            Alert.alert("Support", "Support contact is currently unavailable.");
                        }
                    })}
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.menuItem} onPress={handleSwitchRole}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="construct-outline" size={22} color="#E65100" />
                        </View>
                        <Text style={[styles.menuLabel, { color: '#E65100' }]}>Switch to User (Dev)</Text>
                        <Ionicons name="swap-horizontal-outline" size={20} color="#E65100" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    {renderMenuItem('information-circle-outline', 'About Us', () => router.push('/about-us'))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#FF5252" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
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
        backgroundColor: '#FFFFFF', // Assuming white circle background from look, or transparent
        // Screenshot implies maybe transparent or very light grey? 
        // Let's keep it transparent for cleaner look or match background if needed.
        // Actually screenshot shows white background on buttons often.
    },
    badge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#1F5E2E',
        width: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        borderWidth: 1,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 8,
        fontFamily: 'DMSans_700Bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        elevation: 2,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E0E0E0',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    profilePhone: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    editButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 12,
        marginTop: 8,
    },
    menuGroup: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.03)',
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    menuIconContainer: {
        width: 24,
        alignItems: 'center',
        marginRight: 16,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    divider: {
        height: 1,
        backgroundColor: '#F5F5F5',
        width: '100%',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F0',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FFDBDB',
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#FF5252',
    },
    reviewBanner: {
        backgroundColor: '#FFF3CD',
        borderColor: '#FFEEBA',
        borderWidth: 1,
        padding: 12,
        marginHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    reviewText: {
        color: '#856404',
        fontFamily: 'DMSans_500Medium',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    rejectedBanner: {
        backgroundColor: '#F8D7DA',
        borderColor: '#F5C6CB',
        borderWidth: 1,
        padding: 12,
        marginHorizontal: 20,
        borderRadius: 8,
        marginBottom: 12,
    },
    rejectedTitle: {
        color: '#721C24',
        fontFamily: 'DMSans_700Bold',
        fontSize: 14,
        marginLeft: 8,
    },
    rejectedText: {
        color: '#721C24',
        fontFamily: 'DMSans_500Medium',
        fontSize: 13,
        marginTop: 4,
    },
});
