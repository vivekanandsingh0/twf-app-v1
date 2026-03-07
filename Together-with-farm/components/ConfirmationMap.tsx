import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Address } from '@/contexts/AddressContext';

interface Props {
    selectedAddress: Address | null;
    onPinChange?: (latitude: number, longitude: number, resolvedAddress?: string) => void;
}

export default function ConfirmationMap({ selectedAddress }: Props) {
    return (
        <View style={styles.mapContainer}>
            <Text style={{ color: '#999', fontFamily: 'DMSans_400Regular' }}>Map View available on App</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
});
