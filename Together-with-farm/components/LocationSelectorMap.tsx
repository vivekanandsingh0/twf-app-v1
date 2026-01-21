import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, long: number) => void;
}

export default function LocationSelectorMap({ latitude, longitude, onLocationChange }: Props) {
    return (
        <View style={[StyleSheet.absoluteFill, styles.container]}>
            <Text style={styles.text}>Interactive Map is available on Mobile App.</Text>
            <Text style={styles.subtext}>Address: {latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    text: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 14,
        color: '#999',
    }
});
