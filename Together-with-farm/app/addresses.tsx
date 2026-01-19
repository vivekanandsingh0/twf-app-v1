import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SAVED_ADDRESSES = [
    {
        id: 1,
        type: 'Home',
        icon: 'home-outline',
        address: 'Kankarbagh Colony, Near Hanuman Nagar, road no.1',
        city: 'left, Near Nalanda',
    },
    {
        id: 2,
        type: 'Office',
        icon: 'briefcase-outline',
        address: 'Kankarbagh Colony, Near Hanuman Nagar, road no.1',
        city: 'left, Near Nalanda',
    },
    {
        id: 3,
        type: 'Coffee Shop',
        icon: 'cafe-outline',
        address: 'Kankarbagh Colony, Near Hanuman Nagar, road no.1',
        city: 'left, Near Nalanda',
    },
];

export default function AddressesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Addresses</Text>
                <TouchableOpacity
                    style={styles.notificationBtn}
                    onPress={() => router.push('/notifications')}
                >
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* My Addresses Section */}
                <Text style={styles.sectionTitle}>My Addresses</Text>

                {SAVED_ADDRESSES.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.addressCard}
                        activeOpacity={0.7}
                    >
                        <View style={styles.addressContent}>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons
                                    name={item.icon as any}
                                    size={24}
                                    color="#1A1A1A"
                                />
                            </View>
                            <View style={styles.addressInfo}>
                                <Text style={styles.addressType}>{item.type}</Text>
                                <Text style={styles.addressText} numberOfLines={2}>
                                    {item.address}
                                </Text>
                                <Text style={styles.addressCity}>{item.city}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.moreButton}>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#1A1A1A" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}

                {/* Add Address Section */}
                <Text style={styles.sectionTitle}>Add Address</Text>

                <TouchableOpacity
                    style={styles.addAddressCard}
                    activeOpacity={0.7}
                >
                    <View style={styles.addressContent}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="add" size={24} color="#1A1A1A" />
                        </View>
                        <View style={styles.addressInfo}>
                            <Text style={styles.addressType}>Add New Address</Text>
                            <Text style={styles.addressSubtext}>
                                Like, Home, Work, Office, etc
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#1A1A1A" />
                    </TouchableOpacity>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    notificationBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#1F5E2E',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontFamily: 'DMSans_700Bold',
        lineHeight: 10,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 16,
        marginTop: 8,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    addAddressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    addressContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    addressInfo: {
        flex: 1,
    },
    addressType: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        lineHeight: 18,
    },
    addressCity: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginTop: 2,
    },
    addressSubtext: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
        marginTop: 2,
    },
    moreButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
});
