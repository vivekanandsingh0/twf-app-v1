import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function OrderSuccessScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { isDark } = useTheme();

    // Only animate the icon
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 1. Initial Pop In with Bounce
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,   // Lower friction = more bounce
            tension: 40,
            useNativeDriver: true,
        }).start(() => {
            // 2. Continuous Gentle Pulse
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.05,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    })
                ])
            ).start();
        });
    }, []);

    const handleTrackOrder = () => {
        router.push('/orders');
    };

    const handleContinueShopping = () => {
        router.push('/(tabs)');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.centerContent}>
                {/* Animated Success Icon - Only this part animates */}
                <Animated.View style={[styles.successIconContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={[styles.successCircle, isDark && { backgroundColor: '#1E3E2E', borderColor: '#1F5E2E' }]}>
                        <Ionicons name="checkmark" size={60} color="#fff" style={{ fontWeight: 'bold' }} />
                    </View>
                </Animated.View>

                {/* Static Content */}
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <Text style={[styles.title, isDark && { color: '#FFF' }]}>Your harvest is on it's{'\n'}way.</Text>
                    <Text style={[styles.subtitle, isDark && { color: '#AAA' }]}>Your order have been Placed Sucessfully.</Text>

                    {/* Order Details Card */}
                    <View style={[styles.detailCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                        <View style={styles.row}>
                            <Text style={[styles.label, isDark && { color: '#AAA' }]}>Order ID</Text>
                            <Text style={[styles.value, isDark && { color: '#FFF' }]}>#6537352823</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.label, isDark && { color: '#AAA' }]}>Expected Delivery</Text>
                            <Text style={[styles.value, isDark && { color: '#FFF' }]}>Arriving in 25 mins</Text>
                        </View>
                        <View style={[styles.row, { borderBottomWidth: 0 }]}>
                            <Text style={[styles.label, isDark && { color: '#AAA' }]}>Payment</Text>
                            <Text style={[styles.value, isDark && { color: '#FFF' }]}>PhonePe</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Actions */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.trackBtn} onPress={handleTrackOrder}>
                    <Text style={styles.trackBtnText}>Track Order</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.continueBtn} onPress={handleContinueShopping}>
                    <Text style={styles.continueBtnText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -60,
    },
    successIconContainer: {
        marginBottom: 32,
        shadowColor: 'rgba(31, 94, 46, 0.4)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
    },
    successCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1F5E2E',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 6,
        borderColor: '#E8F5E9',
    },
    title: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    detailCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    label: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
    },
    value: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    footer: {
        width: '100%',
        paddingBottom: 20,
        alignItems: 'center',
    },
    trackBtn: {
        width: '100%',
        backgroundColor: '#1F5E2E',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#1F5E2E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    trackBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
    continueBtn: {
        padding: 10,
    },
    continueBtnText: {
        color: '#888',
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        textDecorationLine: 'underline',
    },
});
