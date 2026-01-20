import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Address } from '@/contexts/AddressContext';

interface Props {
    selectedAddress: Address | null;
}

export default function ConfirmationMap({ selectedAddress }: Props) {
    return (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: selectedAddress?.latitude || 25.5941,
                    longitude: selectedAddress?.longitude || 85.1376,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: selectedAddress?.latitude || 25.5941,
                        longitude: selectedAddress?.longitude || 85.1376,
                    }}
                />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        width: '100%',
        height: 150,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#f0f0f0',
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
