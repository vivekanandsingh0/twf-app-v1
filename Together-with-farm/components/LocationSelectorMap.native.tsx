import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, long: number) => void;
}

export default function LocationSelectorMap({ latitude, longitude, onLocationChange }: Props) {
    const mapRef = useRef<MapView>(null);
    const [loading, setLoading] = useState(false);

    // Internal coordinate state for smooth dragging
    const [coord, setCoord] = useState({ latitude, longitude });

    // Sync when props change (e.g. initial load or external update)
    useEffect(() => {
        setCoord({ latitude, longitude });
        mapRef.current?.animateToRegion({
            latitude, longitude,
            latitudeDelta: 0.005, longitudeDelta: 0.005
        }, 1000);
    }, [latitude, longitude]);

    const handleLocateMe = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access.');
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            const { latitude: lat, longitude: long } = loc.coords;
            setCoord({ latitude: lat, longitude: long });
            onLocationChange(lat, long);

            mapRef.current?.animateToRegion({
                latitude: lat, longitude: long,
                latitudeDelta: 0.005, longitudeDelta: 0.005
            }, 1000);
        } catch (e) {
            Alert.alert("Error", "Could not locate.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={StyleSheet.absoluteFill}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={{
                    latitude: coord.latitude,
                    longitude: coord.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005
                }}
                showsBuildings
                showsIndoors
            >
                <Marker
                    coordinate={coord}
                    draggable
                    onDragEnd={(e) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setCoord({ latitude, longitude });
                        onLocationChange(latitude, longitude);
                    }}
                />
            </MapView>

            <TouchableOpacity style={styles.locateBtn} onPress={handleLocateMe} activeOpacity={0.8}>
                {loading ? (
                    <ActivityIndicator color="#1A1A1A" size="small" />
                ) : (
                    <Ionicons name="locate" size={24} color="#1A1A1A" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    locateBtn: {
        position: 'absolute',
        top: 180, // Positioned to account for header
        right: 20,
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
        elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
        zIndex: 10,
    }
});
