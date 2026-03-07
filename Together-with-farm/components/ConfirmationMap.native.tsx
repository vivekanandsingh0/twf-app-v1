import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    StyleSheet, View, TouchableOpacity, ActivityIndicator,
    Alert, Text, TextInput, ScrollView, Keyboard
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '@/contexts/AddressContext';

interface Props {
    selectedAddress: Address | null;
    onPinChange?: (latitude: number, longitude: number, resolvedAddress?: string) => void;
}

interface SearchResult {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
}

export default function ConfirmationMap({ selectedAddress, onPinChange }: Props) {
    const webViewRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [coordinate, setCoordinate] = useState({
        latitude: selectedAddress?.latitude || 25.5941,
        longitude: selectedAddress?.longitude || 85.1376,
    });

    // Reverse geocode a lat/lng to get a human-readable address string
    const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string | undefined> => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
            const res = await fetch(url, { headers: { 'User-Agent': 'TogetherWithFarm/1.0' } });
            if (!res.ok) return undefined;
            const data = await res.json();
            if (data && data.display_name) {
                return data.display_name as string;
            }
        } catch (e) {
            console.log('Reverse geocode failed', e);
        }
        return undefined;
    }, []);

    // On mount: initialize map at the saved address coordinates (NOT current GPS)
    useEffect(() => {
        const initializeMap = async () => {
            // Priority 1: address already has saved GPS coords → use them exactly
            if (selectedAddress?.latitude && selectedAddress?.longitude) {
                const lat = selectedAddress.latitude;
                const lng = selectedAddress.longitude;
                setCoordinate({ latitude: lat, longitude: lng });
                updateMapPosition(lat, lng);
                if (onPinChange) onPinChange(lat, lng);
                return;
            }

            // Priority 2: No saved coords → geocode the address text to place pin
            if (selectedAddress) {
                setLoading(true);
                try {
                    let geocoded = await Location.geocodeAsync(
                        `${selectedAddress.address}, ${selectedAddress.city}`
                    );
                    if ((!geocoded || geocoded.length === 0) && selectedAddress.pincode) {
                        geocoded = await Location.geocodeAsync(
                            `${selectedAddress.pincode}, ${selectedAddress.city}`
                        );
                    }
                    if (geocoded && geocoded.length > 0) {
                        const { latitude, longitude } = geocoded[0];
                        setCoordinate({ latitude, longitude });
                        updateMapPosition(latitude, longitude);
                        if (onPinChange) onPinChange(latitude, longitude);
                    }
                } catch (error) {
                    console.log('Geocoding fallback failed', error);
                } finally {
                    setLoading(false);
                }
            }
            // Priority 3: Everything failed — stays at default fallback coords
        };
        initializeMap();
    }, [selectedAddress?.id]);

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

    // Search via Nominatim (OpenStreetMap free geocoding)
    const handleSearch = async () => {
        const q = searchQuery.trim();
        if (!q) return;
        Keyboard.dismiss();
        setSearching(true);
        setSearchResults([]);
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'TogetherWithFarm/1.0' }
            });
            const data: SearchResult[] = await res.json();
            if (data.length === 0) {
                Alert.alert('No results', 'No location found. Try a different search term.');
            } else {
                setSearchResults(data);
            }
        } catch (e) {
            Alert.alert('Error', 'Location search failed. Check your internet connection.');
        } finally {
            setSearching(false);
        }
    };

    const handleSelectResult = (result: SearchResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setCoordinate({ latitude: lat, longitude: lng });
        updateMapPosition(lat, lng);
        if (onPinChange) onPinChange(lat, lng);
        setSearchResults([]);
        setSearchQuery(result.display_name.split(',').slice(0, 2).join(',').trim());
        Keyboard.dismiss();
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

    // Notify React Native whenever the pin position changes
    function notifyPinChange(lat, lng) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'pinChange',
        latitude: lat,
        longitude: lng
      }));
    }

    marker.on('dragend', function(e) {
      var coord = e.target.getLatLng();
      notifyPinChange(coord.lat, coord.lng);
    });

    // Called from React Native via injectJavaScript
    function updateMarker(lat, lng) {
        var newLatLng = new L.LatLng(lat, lng);
        marker.setLatLng(newLatLng);
        map.setView(newLatLng, 15);
        notifyPinChange(lat, lng);
    }
  </script>
</body>
</html>
    `;

    return (
        <View style={styles.mapContainer}>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={16} color="#666" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search location..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                            <Ionicons name="close-circle" size={16} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
                    {searching
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.searchBtnText}>Go</Text>
                    }
                </TouchableOpacity>
            </View>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
                <View style={styles.resultsDropdown}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                        style={{ maxHeight: 220 }}
                    >
                        {searchResults.map((item, index) => (
                            <View key={item.place_id}>
                                <TouchableOpacity
                                    style={styles.resultItem}
                                    onPress={() => handleSelectResult(item)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="location-outline" size={14} color="#1F5E2E" style={{ marginRight: 8, marginTop: 2 }} />
                                    <Text style={styles.resultText} numberOfLines={2}>{item.display_name}</Text>
                                </TouchableOpacity>
                                {index < searchResults.length - 1 && <View style={styles.resultDivider} />}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Map WebView */}
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: leafletData }}
                style={styles.map}
                onMessage={async (event) => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data.type === 'pinChange') {
                            const { latitude, longitude } = data;
                            setCoordinate({ latitude, longitude });
                            // Reverse geocode to get an address string matching the new pin
                            const resolvedAddress = await reverseGeocode(latitude, longitude);
                            if (onPinChange) onPinChange(latitude, longitude, resolvedAddress);
                        }
                    } catch (e) {
                        console.log('WebView message parse error', e);
                    }
                }}
            />

            {/* Locate Me Button */}
            <TouchableOpacity style={styles.locateBtn} onPress={handleLocateMe} activeOpacity={0.8}>
                {loading
                    ? <ActivityIndicator size="small" color="#1F5E2E" />
                    : <Ionicons name="locate" size={20} color="#1F5E2E" />
                }
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

    // Search Bar
    searchContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        zIndex: 20,
        flexDirection: 'row',
        gap: 8,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
        fontFamily: 'DMSans_400Regular',
        padding: 0,
    },
    searchBtn: {
        backgroundColor: '#1F5E2E',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1F5E2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    searchBtnText: {
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
        fontSize: 14,
    },

    // Results Dropdown
    resultsDropdown: {
        position: 'absolute',
        top: 58,
        left: 10,
        right: 10,
        zIndex: 30,
        backgroundColor: '#fff',
        borderRadius: 14,
        maxHeight: 220,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden',
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    resultText: {
        flex: 1,
        fontSize: 13,
        color: '#1A1A1A',
        fontFamily: 'DMSans_400Regular',
        lineHeight: 18,
    },
    resultDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 14,
    },

    // Locate Me Button
    locateBtn: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
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
