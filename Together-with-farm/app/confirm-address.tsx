import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAddresses } from '@/contexts/AddressContext';
import ConfirmationMap from '@/components/ConfirmationMap';
import { useTheme } from '@/contexts/ThemeContext';

export default function ConfirmAddressScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { selectedAddress, updateAddress } = useAddresses();
    const { isDark } = useTheme();

    // Initialize with already-known coords if address has them
    const [pinnedCoord, setPinnedCoord] = useState<{ lat: number; lng: number } | null>(
        selectedAddress?.latitude && selectedAddress?.longitude
            ? { lat: selectedAddress.latitude, lng: selectedAddress.longitude }
            : null
    );
    const [saving, setSaving] = useState(false);

    const handleConfirm = async () => {
        if (!selectedAddress) return;

        if (!pinnedCoord) {
            Alert.alert(
                'Pin a Location',
                'Please drag the pin or use "Locate Me" / search to set your delivery location on the map.',
                [{ text: 'OK' }]
            );
            return;
        }

        setSaving(true);
        try {
            // Save the pinned lat/lng back to Supabase via AddressContext
            await updateAddress(selectedAddress.id, {
                latitude: pinnedCoord.lat,
                longitude: pinnedCoord.lng,
            });
        } catch (e) {
            console.error('Failed to persist pin location:', e);
            // Non-fatal — continue to payment anyway
        } finally {
            setSaving(false);
        }

        router.push('/payment');
    };

    if (!selectedAddress) {
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
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, isDark && { backgroundColor: '#333' }]}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Confirm Location</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={[styles.instructionText, isDark && { color: '#CCC' }]}>
                    Search or drag the pin to your exact delivery location.
                </Text>

                {/* Live Pin Status Badge */}
                <View style={[styles.pinStatus, pinnedCoord ? styles.pinStatusSet : styles.pinStatusUnset]}>
                    <Ionicons
                        name={pinnedCoord ? 'checkmark-circle' : 'alert-circle-outline'}
                        size={16}
                        color={pinnedCoord ? '#1F5E2E' : '#E65100'}
                    />
                    <Text style={[styles.pinStatusText, { color: pinnedCoord ? '#1F5E2E' : '#E65100' }]}>
                        {pinnedCoord
                            ? `📍 ${pinnedCoord.lat.toFixed(5)}, ${pinnedCoord.lng.toFixed(5)}`
                            : 'No location pinned — move the map marker to your spot'
                        }
                    </Text>
                </View>

                {/* Map */}
                <View style={styles.mapWrapper}>
                    <ConfirmationMap
                        selectedAddress={selectedAddress}
                        onPinChange={(lat, lng) => setPinnedCoord({ lat, lng })}
                    />
                </View>

                {/* Address Details Card */}
                <View style={[styles.addressCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                    <View style={styles.row}>
                        <View style={[styles.iconBox, isDark && { backgroundColor: '#333' }]}>
                            <Ionicons name="location" size={24} color={isDark ? '#FFF' : '#1F5E2E'} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.addressType, isDark && { color: '#FFF' }]}>{selectedAddress.type}</Text>
                            <Text style={[styles.addressText, isDark && { color: '#AAA' }]}>
                                {selectedAddress.address}, {selectedAddress.city}
                            </Text>
                            {selectedAddress.pincode && (
                                <Text style={[styles.pincode, isDark && { color: '#888' }]}>PIN: {selectedAddress.pincode}</Text>
                            )}
                            {(selectedAddress.receiverName || selectedAddress.receiverPhone) && (
                                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: isDark ? '#333' : '#f0f0f0' }}>
                                    <Text style={{ fontSize: 12, fontFamily: 'DMSans_700Bold', color: isDark ? '#AAA' : '#666', marginBottom: 2 }}>Receiver</Text>
                                    {selectedAddress.receiverName && (
                                        <Text style={{ fontSize: 13, fontFamily: 'DMSans_500Medium', color: isDark ? '#FFF' : '#1A1A1A' }}>
                                            {selectedAddress.receiverName}
                                        </Text>
                                    )}
                                    {selectedAddress.receiverPhone && (
                                        <Text style={{ fontSize: 13, fontFamily: 'DMSans_400Regular', color: isDark ? '#AAA' : '#666' }}>
                                            {selectedAddress.receiverPhone}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }, isDark && { backgroundColor: '#1E1E1E', borderTopColor: '#333' }]}>
                <TouchableOpacity
                    style={[styles.confirmBtn, saving && { opacity: 0.75 }]}
                    onPress={handleConfirm}
                    disabled={saving}
                    activeOpacity={0.85}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={styles.confirmBtnText}>Confirm &amp; Proceed</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                        </>
                    )}
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
        paddingBottom: 120,
    },
    instructionText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    pinStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
    },
    pinStatusSet: {
        backgroundColor: '#E8F5E9',
        borderColor: '#A5D6A7',
    },
    pinStatusUnset: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FFCC80',
    },
    pinStatusText: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        flex: 1,
    },
    mapWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 20,
        height: 360,
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
