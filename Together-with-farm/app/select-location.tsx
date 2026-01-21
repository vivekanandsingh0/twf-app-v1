import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import LocationSelectorMap from '@/components/LocationSelectorMap';
import * as Location from 'expo-location';
import { useAddresses } from '@/contexts/AddressContext';
// Using conditional require for web compatibility handled in checking platform, 
// strictly creating native-first experience as per other files.

export default function SelectLocationScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { selectedAddress, updateAddress } = useAddresses();

    const [coordinate, setCoordinate] = useState({
        latitude: selectedAddress?.latitude || 25.5941,
        longitude: selectedAddress?.longitude || 85.1376,
    });

    // Initialize Map with Geocoding if needed
    useEffect(() => {
        const initializeLocation = async () => {
            if (selectedAddress) {
                if (selectedAddress.latitude && selectedAddress.longitude) {
                    setCoordinate({
                        latitude: selectedAddress.latitude,
                        longitude: selectedAddress.longitude
                    });
                } else {
                    // Geocode fallback
                    try {
                        let geocoded = await Location.geocodeAsync(`${selectedAddress.address}, ${selectedAddress.city}`);
                        if ((!geocoded || geocoded.length === 0) && selectedAddress.pincode) {
                            geocoded = await Location.geocodeAsync(`${selectedAddress.pincode}, ${selectedAddress.city}`);
                        }
                        if (geocoded && geocoded.length > 0) {
                            const { latitude, longitude } = geocoded[0];
                            setCoordinate({ latitude, longitude });
                            // Update context so map stays consistent
                            updateAddress(selectedAddress.id, { latitude, longitude });
                        }
                    } catch (e) {
                        console.log("Geocoding error", e);
                    }
                }
            }
        };
        initializeLocation();
    }, [selectedAddress?.id]);

    const handleConfirm = () => {
        console.log("Navigating to payment...");
        router.push('/payment');
    };

    if (Platform.OS === 'web') {
        return (
            <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Map Selection not available on Web</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}><Text>Go Back</Text></TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Map Background */}
            <LocationSelectorMap
                latitude={coordinate.latitude}
                longitude={coordinate.longitude}
                onLocationChange={(lat, long) => {
                    setCoordinate({ latitude: lat, longitude: long });
                    if (selectedAddress) updateAddress(selectedAddress.id, { latitude: lat, longitude: long });
                }}
            />

            {/* Header & Search Overlay */}
            <View style={[styles.topOverlay, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Select Location</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search Locations, Street, etc"
                        placeholderTextColor="#999"
                        style={styles.searchInput}
                    />
                </View>
            </View>

            {/* Bottom Card */}
            <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.addressRow}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="location-outline" size={24} color="#1A1A1A" />
                    </View>
                    <View style={styles.addressTextContainer}>
                        <Text style={styles.addressType}>{selectedAddress?.type || 'Location'}</Text>
                        <Text style={styles.addressDetail} numberOfLines={2}>
                            {selectedAddress?.address || 'Select a location'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                    <Text style={styles.confirmBtnText}>Confirm Location</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)', // Slight transparency or solid white
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
        paddingTop: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    searchContainer: {
        marginHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: '#1A1A1A',
    },
    locateBtn: {
        position: 'absolute',
        top: 180, // Below header
        right: 20,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 20,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 16,
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        // backgroundColor: '#F5F5F5', // Screenshot seems to have simple icon
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    addressTextContainer: {
        flex: 1,
    },
    addressType: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    addressDetail: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        lineHeight: 18,
    },
    confirmBtn: {
        backgroundColor: '#1F5E2E',
        borderRadius: 30, // Pill shape
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
});
