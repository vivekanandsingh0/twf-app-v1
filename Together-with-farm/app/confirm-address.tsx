import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAddresses } from '@/contexts/AddressContext';
import ConfirmationMap from '@/components/ConfirmationMap'; // This will resolve to .native or .web automatically

export default function ConfirmAddressScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { selectedAddress, updateAddress } = useAddresses();

    // Local state for coordinate tweaks if user drags pin
    // Note: In real app, we would update the address in context/backend on confirm
    const [coordinate, setCoordinate] = useState<{ lat: number; lng: number } | null>(null);

    const handleConfirm = () => {
        // Here we could perform an update if coordinate changed
        // if (coordinate && selectedAddress) {
        //    updateAddress(selectedAddress.id, { latitude: coordinate.lat, longitude: coordinate.lng });
        // }

        router.push('/payment');
    };

    if (!selectedAddress) {
        // Fallback if accessed directly without address
        return (
            <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
                <Text>No Address Selected</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: 'blue' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirm Location</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.instructionText}>
                    Please confirm your delivery location on the map accurately for faster delivery.
                </Text>

                {/* Map Component */}
                <View style={styles.mapWrapper}>
                    <ConfirmationMap
                        selectedAddress={selectedAddress}
                        onPinChange={(lat, lng) => setCoordinate({ lat, lng })}
                    />
                </View>

                {/* Address Details Card */}
                <View style={styles.addressCard}>
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Ionicons name="location" size={24} color="#1F5E2E" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.addressType}>{selectedAddress.type}</Text>
                            <Text style={styles.addressText}>{selectedAddress.address}, {selectedAddress.city}</Text>
                            {selectedAddress.pincode && <Text style={styles.pincode}>PIN: {selectedAddress.pincode}</Text>}

                            {(selectedAddress.receiverName || selectedAddress.receiverPhone) && (
                                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                                    <Text style={{ fontSize: 12, fontFamily: 'DMSans_700Bold', color: '#666', marginBottom: 2 }}>Receiver</Text>
                                    {selectedAddress.receiverName && <Text style={{ fontSize: 13, fontFamily: 'DMSans_500Medium', color: '#1A1A1A' }}>{selectedAddress.receiverName}</Text>}
                                    {selectedAddress.receiverPhone && <Text style={{ fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#666' }}>{selectedAddress.receiverPhone}</Text>}
                                </View>
                            )}
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                    <Text style={styles.confirmBtnText}>Confirm & Proceed</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
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
        paddingBottom: 20,
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
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    content: {
        paddingHorizontal: 20,
    },
    instructionText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    mapWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 24,
        height: 300, // Taller map for confirmation
    },
    addressCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1F5E2E',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    addressType: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#333',
        lineHeight: 20,
    },
    pincode: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    confirmBtn: {
        backgroundColor: '#1F5E2E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 30,
    },
    confirmBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
});
