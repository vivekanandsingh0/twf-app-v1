import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, long: number) => void;
}

export default function LocationSelectorMap({ latitude, longitude, onLocationChange }: Props) {
    const webViewRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(false);
    const [coord, setCoord] = useState({ latitude, longitude });

    // Sync when props change
    useEffect(() => {
        setCoord({ latitude, longitude });
        updateMapPosition(latitude, longitude);
    }, [latitude, longitude]);

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
                Alert.alert('Permission Denied', 'Allow location access.');
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            const { latitude: lat, longitude: long } = loc.coords;
            setCoord({ latitude: lat, longitude: long });
            onLocationChange(lat, long);
            updateMapPosition(lat, long);

        } catch (e) {
            Alert.alert("Error", "Could not locate.");
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
    var map = L.map('map').setView([${coord.latitude}, ${coord.longitude}], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'OpenStreetMap'
    }).addTo(map);

    var marker = L.marker([${coord.latitude}, ${coord.longitude}], { draggable: true }).addTo(map);

    marker.on('dragend', function(e) {
      var c = e.target.getLatLng();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        latitude: c.lat,
        longitude: c.lng
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
        <View style={StyleSheet.absoluteFill}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: leafletData }}
                style={{ flex: 1 }}
                onMessage={(event) => {
                    const data = JSON.parse(event.nativeEvent.data);
                    setCoord(data);
                    onLocationChange(data.latitude, data.longitude);
                }}
            />

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
