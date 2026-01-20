import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Alert, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '@/contexts/AddressContext';

interface Props {
    selectedAddress: Address | null;
    onPinChange?: (latitude: number, longitude: number) => void;
}

export default function ConfirmationMap({ selectedAddress, onPinChange }: Props) {
    const mapRef = useRef<MapView>(null);
    const [loading, setLoading] = useState(false);
    const [coordinate, setCoordinate] = useState({
        latitude: selectedAddress?.latitude || 25.5941,
        longitude: selectedAddress?.longitude || 85.1376,
    });

    // Initial Geocoding or Coordinate setup
    useEffect(() => {
        const initializeMap = async () => {
            if (selectedAddress) {
                if (selectedAddress.latitude && selectedAddress.longitude) {
                    setCoordinate({
                        latitude: selectedAddress.latitude,
                        longitude: selectedAddress.longitude,
                    });
                    animateTo({
                        latitude: selectedAddress.latitude,
                        longitude: selectedAddress.longitude,
                    });
                } else {
                    // Try to Geocode address string
                    setLoading(true);
                    try {
                        // Attempt 1: Address + City
                        let geocoded = await Location.geocodeAsync(
                            `${selectedAddress.address}, ${selectedAddress.city}`
                        );

                        // Attempt 2: Pincode Area (Fallback)
                        if ((!geocoded || geocoded.length === 0) && selectedAddress.pincode) {
                            console.log("Fallback to Pincode Geocoding");
                            geocoded = await Location.geocodeAsync(`${selectedAddress.pincode}, ${selectedAddress.city}`);
                        }

                        if (geocoded && geocoded.length > 0) {
                            const { latitude, longitude } = geocoded[0];
                            setCoordinate({ latitude, longitude });
                            animateTo({ latitude, longitude });

                            // Optionally update parent if we discovered coordinates
                            if (onPinChange) onPinChange(latitude, longitude);
                        }
                    } catch (error) {
                        console.log("Geocoding failed", error);
                        // Try fallback if error?
                    } finally {
                        setLoading(false);
                    }
                }
            }
        };

        initializeMap();
    }, [selectedAddress?.id]); // Re-run if ID changes

    const animateTo = (coord: { latitude: number; longitude: number }) => {
        mapRef.current?.animateToRegion({
            ...coord,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }, 1000);
    };

    const handleLocateMe = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to find your position.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            setCoordinate({ latitude, longitude });
            animateTo({ latitude, longitude });

            if (onPinChange) onPinChange(latitude, longitude);

        } catch (error) {
            Alert.alert('Error', 'Could not fetch location.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.mapContainer}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: coordinate.latitude,
                    longitude: coordinate.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
            >
                <Marker
                    coordinate={coordinate}
                    draggable
                    onDragEnd={(e) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setCoordinate({ latitude, longitude });
                        if (onPinChange) onPinChange(latitude, longitude);
                    }}
                />
            </MapView>

            {/* Locate Me Button */}
            <TouchableOpacity
                style={styles.locateBtn}
                onPress={handleLocateMe}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#1F5E2E" />
                ) : (
                    <Ionicons name="locate" size={20} color="#1F5E2E" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        width: '100%',
        height: 180, // Slightly taller
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#f0f0f0',
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    locateBtn: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
});
