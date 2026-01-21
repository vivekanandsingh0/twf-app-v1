import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

export default function OrderDetailScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Mock Status Steps
    const steps = [
        { label: 'Confirmed', done: true },
        { label: 'Packed', done: true },
        { label: 'On the way', done: true },
        { label: 'Delivered', done: false },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>#{id || '4521'}</Text>
                <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                    <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Status Header */}
                <Text style={styles.arrivingText}>Arriving Today, 5:30-6:30 PM</Text>

                {/* Timeline */}
                <View style={styles.timelineContainer}>
                    <View style={styles.timelineLine} />
                    {steps.map((step, index) => (
                        <View key={index} style={styles.stepContainer}>
                            <View style={[styles.stepCircle, step.done ? styles.stepCircleDone : styles.stepCirclePending]}>
                                {step.done && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </View>
                            <Text style={styles.stepLabel}>{step.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Track Delivery Map */}
                <Text style={styles.sectionTitle}>Track Delivery</Text>
                <View style={styles.mapContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=60' }}
                        style={styles.mapImage}
                    />
                    <View style={styles.mapOverlay}>
                        <Text style={styles.overlayText}>Arriving in 20 minutes</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.trackOrderBtn}>
                    <Text style={styles.trackOrderBtnText}>Track Order</Text>
                </TouchableOpacity>

                {/* Order Items */}
                <Text style={styles.sectionTitle}>Order Items</Text>
                <View style={styles.itemCard}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&auto=format&fit=crop&q=60' }}
                        style={styles.itemImage}
                    />
                    <View style={styles.itemInfo}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.itemOrderNum}>#{id || '4521'}</Text>
                            <View style={styles.statusChip}><Text style={styles.statusChipText}>On the Way</Text></View>
                        </View>
                        <Text style={styles.itemDesc}>Chicken breast +5 {"\n"}more</Text>
                        <TouchableOpacity><Text style={styles.viewMore}>View more</Text></TouchableOpacity>
                    </View>
                    <View style={styles.badgeContainer}>
                        <View style={styles.quantityBadge}><Text style={styles.quantityText}>3</Text></View>
                    </View>
                </View>

                {/* Delivery Address */}
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <View style={styles.addressCard}>
                    <View style={styles.addressIcon}>
                        <Ionicons name="location-outline" size={24} color="#1A1A1A" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.addressType}>Home</Text>
                        <Text style={styles.addressText}>Kankarbagh Colony, Near Hanuman Nagar, road no.1 left, Near Nalanda</Text>
                    </View>
                </View>

                {/* Payment Summary */}
                <Text style={styles.sectionTitle}>Payment Summary</Text>
                <View style={styles.paymentCard}>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Order ID</Text>
                        <Text style={styles.paymentValue}>#6537352823</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Expected Delivery</Text>
                        <Text style={styles.paymentValue}>Arriving in 25 mins</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Payment</Text>
                        <Text style={styles.paymentValue}>PhonePe</Text>
                    </View>
                    <View style={[styles.paymentRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                        <Text style={styles.paymentLabel}>Total</Text>
                        <Text style={styles.paymentTotal}>$18.99</Text>
                    </View>
                </View>

                {/* Your Driver */}
                <Text style={styles.sectionTitle}>Your Driver</Text>
                <View style={styles.driverCard}>
                    <View style={styles.driverInfo}>
                        {/* Avatar placeholder */}
                        <View style={styles.driverAvatar}>
                            <Text style={{ fontWeight: 'bold', color: '#555' }}>AK</Text>
                        </View>
                        <View>
                            <Text style={styles.driverName}>Amit Kumar</Text>
                            <Text style={styles.driverDetails}>BR01AJ2346</Text>
                        </View>
                    </View>
                    <View style={styles.driverActions}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E0E0E0' }]}>
                            <Ionicons name="call" size={18} color="#1A1A1A" />
                            <Text style={[styles.actionBtnText, { color: '#1A1A1A' }]}> Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1F5E2E' }]}>
                            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
                            <Text style={[styles.actionBtnText, { color: '#fff' }]}> Chat</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: { padding: 4 },
    notificationBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontFamily: 'DMSans_700Bold', color: '#1A1A1A' },
    badge: {
        position: 'absolute', top: 2, right: 2, backgroundColor: '#1F5E2E',
        width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    content: { paddingHorizontal: 20 },

    arrivingText: {
        fontSize: 16, fontFamily: 'DMSans_700Bold', color: '#1A1A1A', marginBottom: 20,
    },

    timelineContainer: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        backgroundColor: '#F9F9F9', borderRadius: 16, padding: 16, marginBottom: 24,
    },
    timelineLine: {
        position: 'absolute', top: 30, left: 40, right: 40, height: 2, backgroundColor: '#E0E0E0', zIndex: -1,
    },
    stepContainer: { alignItems: 'center', width: 70 },
    stepCircle: {
        width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
        marginBottom: 8, borderWidth: 2, borderColor: '#ccc', backgroundColor: '#fff',
    },
    stepCircleDone: {
        backgroundColor: '#1F5E2E', borderColor: '#1F5E2E',
    },
    stepCirclePending: {
        borderColor: '#ccc',
    },
    stepLabel: {
        fontSize: 10, fontFamily: 'DMSans_500Medium', color: '#666', textAlign: 'center',
    },

    sectionTitle: {
        fontSize: 16, fontFamily: 'DMSans_700Bold', color: '#1A1A1A', marginBottom: 16,
    },
    mapContainer: {
        height: 150, borderRadius: 16, overflow: 'hidden', marginBottom: 16,
        position: 'relative',
    },
    mapImage: { width: '100%', height: '100%' },
    mapOverlay: {
        position: 'absolute', top: 10, right: 10, backgroundColor: '#fff',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, shadowColor: '#000', elevation: 3,
    },
    overlayText: { fontSize: 12, fontFamily: 'DMSans_700Bold', color: '#1A1A1A' },
    trackOrderBtn: {
        backgroundColor: '#E0E0E0', paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 24,
    },
    trackOrderBtnText: {
        color: '#666', fontSize: 16, fontFamily: 'DMSans_700Bold',
    },

    itemCard: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12,
        borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 24,
    },
    itemImage: { width: 80, height: 80, borderRadius: 12, marginRight: 16 },
    itemInfo: { flex: 1 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    itemOrderNum: { fontSize: 16, fontFamily: 'DMSans_700Bold' },
    statusChip: { backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    statusChipText: { fontSize: 10, color: '#1F5E2E', fontFamily: 'DMSans_700Bold' },
    itemDesc: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#333', marginBottom: 8 },
    viewMore: { fontSize: 12, color: '#1F5E2E', fontFamily: 'DMSans_700Bold' },
    badgeContainer: {
        position: 'absolute', top: 8, left: 80, // Adjust position
        backgroundColor: '#1F5E2E', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
    },
    quantityBadge: {},
    quantityText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    addressCard: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 24, alignItems: 'center',
    },
    addressIcon: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5',
        alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    addressType: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: '#1A1A1A', marginBottom: 4 },
    addressText: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#666', lineHeight: 18 },

    paymentCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 24,
    },
    paymentRow: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
    },
    paymentLabel: { fontSize: 14, color: '#666', fontFamily: 'DMSans_400Regular' },
    paymentValue: { fontSize: 14, color: '#1A1A1A', fontFamily: 'DMSans_500Medium' },
    paymentTotal: { fontSize: 16, color: '#1F5E2E', fontFamily: 'DMSans_700Bold' },

    driverCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#EAEAEA',
    },
    driverInfo: { flexDirection: 'row', alignItems: 'center' },
    driverAvatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    driverName: { fontSize: 14, fontFamily: 'DMSans_700Bold', color: '#1A1A1A' },
    driverDetails: { fontSize: 12, color: '#666' },
    driverActions: { flexDirection: 'row', gap: 8 },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    },
    actionBtnText: { fontSize: 12, fontFamily: 'DMSans_700Bold', marginLeft: 4 },

});
