import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Alert, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '@/contexts/AddressContext';

interface Props {
    selectedAddress: Address | null;
    onPinChange?: (latitude: number, longitude: number) => void;
}

export default function ConfirmationMap({ selectedAddress, onPinChange }: Props) {
    const webViewRef = useRef<WebView>(null);
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
                    updateMapPosition(selectedAddress.latitude, selectedAddress.longitude);
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
                            updateMapPosition(latitude, longitude);

                            // Optionally update parent if we discovered coordinates
                            if (onPinChange) onPinChange(latitude, longitude);
                        }
                    } catch (error) {
                        console.log("Geocoding failed", error);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        };

        initializeMap();
    }, [selectedAddress?.id]); // Re-run if ID changes

    const updateMapPosition = (lat: number, lng: number) => {
        webViewRef.current?.injectJavaScript(`
            if (typeof updateMarker === 'function') {
                updateMarker(${lat}, ${lng});
            }
            true;
        `);
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
            updateMapPosition(latitude, longitude);

            if (onPinChange) onPinChange(latitude, longitude);

        } catch (error) {
            Alert.alert('Error', 'Could not fetch location.');
        } finally {
            setLoading(false);
        }
    };

    const leafletData = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    body { padding: 0; margin: 0; }
    html, body, #map { height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${coordinate.latitude}, ${coordinate.longitude}], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'OpenStreetMap'
    }).addTo(map);

    var marker = L.marker([${coordinate.latitude}, ${coordinate.longitude}], { draggable: true }).addTo(map);

    marker.on('dragend', function(e) {
      var coord = e.target.getLatLng();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        latitude: coord.lat,
        longitude: coord.lng
      }));
    });

    function updateMarker(lat, lng) {
        var newLatLng = new L.LatLng(lat, lng);
        marker.setLatLng(newLatLng);
        map.setView(newLatLng, 15);
    }
  </script>
</body>
</html>
    `;

    return (
        <View style={styles.mapContainer}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: leafletData }}
                style={styles.map}
                onMessage={(event) => {
                    const data = JSON.parse(event.nativeEvent.data);
                    setCoordinate(data);
                    if (onPinChange) onPinChange(data.latitude, data.longitude);
                }}
            />

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
        flex: 1,
        width: '100%',
        height: '100%',
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
