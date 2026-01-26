import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function VendorProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const renderMenuItem = (icon: any, label: string, onPress?: () => void) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon} size={22} color="#1A1A1A" />
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
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
                    <TouchableOpacity style={[styles.iconButton, { marginLeft: 8 }]}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>2</Text>
                        </View>
                        <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={require('@/assets/images/3d-model-with-veg.png')} // Using existing asset as placeholder
                        style={styles.profileImage}
                        contentFit="cover"
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>Amit Kumar</Text>
                        <Text style={styles.profilePhone}>+912345689</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="create-outline" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>

                {/* Manage Business Section */}
                <Text style={styles.sectionTitle}>Manage Business</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('cube-outline', 'Orders', () => router.push('/(vendor-tabs)/orders'))}
                    <View style={styles.divider} />
                    {renderMenuItem('cash-outline', 'Payouts', () => router.push('/vendor-payouts'))}
                    <View style={styles.divider} />
                    {renderMenuItem('pricetag-outline', 'Sales')}
                </View>

                {/* Performance Section */}
                <Text style={styles.sectionTitle}>Performance</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('grid-outline', 'Business Dashboard')}
                </View>

                {/* More Section */}
                <Text style={styles.sectionTitle}>More</Text>
                <View style={styles.menuGroup}>
                    {renderMenuItem('card-outline', 'Payout Methods')}
                    <View style={styles.divider} />
                    {renderMenuItem('headset-outline', 'Support')}
                    <View style={styles.divider} />
                    {renderMenuItem('information-circle-outline', 'About Us')}
                </View>

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
});
