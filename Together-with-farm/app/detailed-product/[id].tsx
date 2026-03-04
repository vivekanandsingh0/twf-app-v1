import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Platform, ToastAndroid, Alert, ActivityIndicator, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';


export default function OrderDetailScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { orders, refreshOrders } = useUser();
    const { isDark } = useTheme();
    const [cancelling, setCancelling] = useState(false);

    // Find Order
    const order = orders.find(o => o.id.includes(id as string));

    const handleCopyOrderId = async () => {
        if (!order?.id) return;
        await Clipboard.setStringAsync(order.id);
        if (Platform.OS === 'android') {
            ToastAndroid.show('Order ID copied to clipboard', ToastAndroid.SHORT);
        } else {
            Alert.alert('Copied', 'Order ID copied to clipboard');
        }
    };

    const handleCancelOrder = async () => {
        if (!order) return;

        // Check if order can be cancelled
        const cancellableStatuses = ['Pending', 'Confirmed', 'Accepted'];

        if (!cancellableStatuses.includes(order.status)) {
            Alert.alert(
                "Cannot Cancel Order",
                "This order has already been shipped by the farmer and cannot be cancelled.",
                [{ text: "OK" }]
            );
            return;
        }

        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel this order?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        setCancelling(true);
                        try {
                            console.log('🔴 Cancelling order:', order.id);
                            console.log('📝 Current status:', order.status);

                            const { data, error } = await supabase
                                .from('orders')
                                .update({
                                    status: 'Cancelled',
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', order.id)
                                .select();

                            console.log('📊 Update response:', { data, error });

                            if (error) {
                                console.error('❌ Supabase error:', error);
                                throw error;
                            }

                            console.log('✅ Order cancelled in database');

                            // Refresh orders to move from Active to Past
                            console.log('🔄 Refreshing orders...');
                            await refreshOrders();
                            console.log('✅ Orders refreshed');

                            Alert.alert(
                                "Order Cancelled",
                                "Your order has been cancelled successfully.",
                                [{ text: "OK", onPress: () => router.back() }]
                            );
                        } catch (e: any) {
                            console.error('❌ Cancel order error:', e);
                            Alert.alert("Error", "Failed to cancel order: " + e.message);
                        } finally {
                            setCancelling(false);
                        }
                    }
                }
            ]
        );
    };

    if (!order) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }, isDark && { backgroundColor: '#121212' }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={{ fontSize: 18, color: isDark ? '#AAA' : '#666' }}>Order not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 10 }}>
                    <Text style={{ color: isDark ? '#81C784' : '#1F5E2E', fontWeight: 'bold' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Dynamic Steps based on status
    const allStatuses = ['Pending', 'Accepted', 'Ready', 'Shipped', 'Delivered'];
    // Map status to step index
    const getStatusIndex = (status: string) => {
        if (status === 'Pending') return 0;
        if (status === 'Accepted' || status === 'Preparing') return 1;
        if (status === 'Ready' || status === 'Shipped') return 2;
        if (status === 'On the Way') return 2;
        if (status === 'Delivered') return 3;
        return 0;
    };

    const currentStepIndex = getStatusIndex(order.status);

    const steps = [
        { label: 'Confirmed', done: currentStepIndex >= 0 },
        { label: 'Packed', done: currentStepIndex >= 1 },
        { label: 'On the way', done: currentStepIndex >= 2 },
        { label: 'Delivered', done: currentStepIndex >= 3 },
    ];

    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
    const firstImage = firstItem?.image
        ? firstItem.image
        : { uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60' };

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, isDark && { backgroundColor: '#333', borderRadius: 12 }]}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>#{id}</Text>

                {/* Help & Support Icon - Only for Active Orders */}
                {['Pending', 'Accepted', 'Ready', 'Shipped', 'On the Way', 'Picked'].includes(order.status) ? (
                    <TouchableOpacity
                        onPress={() => router.push('/support/' as any)}
                        style={[styles.helpBtn, isDark && { backgroundColor: '#333' }]}
                    >
                        <Ionicons name="help-circle-outline" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 32 }} />
                )}
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Status Header */}
                <Text style={[styles.arrivingText, isDark && { color: '#FFF' }]}>{order.status === 'Delivered' ? 'Delivered' : `Arriving Today, 5:30-6:30 PM`}</Text>

                {/* Timeline */}
                <View style={[styles.timelineContainer, isDark && { backgroundColor: '#1E1E1E' }]}>
                    <View style={[styles.timelineLine, isDark && { backgroundColor: '#444' }]} />
                    {steps.map((step, index) => (
                        <View key={index} style={styles.stepContainer}>
                            <View style={[styles.stepCircle, step.done ? styles.stepCircleDone : styles.stepCirclePending, isDark && !step.done && { backgroundColor: '#333', borderColor: '#444' }]}>
                                {step.done && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </View>
                            <Text style={[styles.stepLabel, isDark && { color: '#AAA' }]}>{step.label}</Text>
                        </View>
                    ))}
                </View>



                {/* Order Items */}
                <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Order Items</Text>
                {order.items.map((item, idx) => (
                    <View key={idx} style={[styles.itemCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                        <Image
                            source={item.image || { uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60' }}
                            style={styles.itemImage}
                        />
                        <View style={styles.itemInfo}>
                            <View style={styles.rowBetween}>
                                <Text style={[styles.itemOrderNum, isDark && { color: '#FFF' }]}>{item.productName}</Text>
                                {/* <View style={styles.statusChip}><Text style={styles.statusChipText}>{order.status}</Text></View> */}
                            </View>
                            <Text style={[styles.itemDesc, isDark && { color: '#AAA' }]}>Quantity: {item.quantity} • ₹{item.price}</Text>
                        </View>
                        <View style={styles.badgeContainer}>
                            <View style={styles.quantityBadge}><Text style={styles.quantityText}>{item.quantity}</Text></View>
                        </View>
                    </View>
                ))}

                {/* Delivery Address */}
                <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Delivery Address</Text>
                <View style={[styles.addressCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                    <View style={[styles.addressIcon, isDark && { backgroundColor: '#333' }]}>
                        <Ionicons name="location-outline" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.addressType, isDark && { color: '#FFF' }]}>Delivery Location</Text>
                        <Text style={[styles.addressText, isDark && { color: '#AAA' }]}>{order.deliveryAddress || 'Address not provided'}</Text>
                    </View>
                </View>

                {/* Payment Summary */}
                <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Payment Summary</Text>
                <View style={[styles.paymentCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                    <View style={styles.paymentRow}>
                        <Text style={[styles.paymentLabel, isDark && { color: '#AAA' }]}>Order ID</Text>
                        <TouchableOpacity
                            onPress={handleCopyOrderId}
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginLeft: 10 }}
                        >
                            <Text
                                style={[styles.paymentValue, { flex: 1, textAlign: 'right', marginRight: 4 }, isDark && { color: '#FFF' }]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                #{order.id}
                            </Text>
                            <Ionicons name="copy-outline" size={14} color="#999" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={[styles.paymentLabel, isDark && { color: '#AAA' }]}>Status</Text>
                        <Text style={[styles.paymentValue, isDark && { color: '#FFF' }]}>{order.status}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={[styles.paymentLabel, isDark && { color: '#AAA' }]}>Subtotal</Text>
                        <Text style={[styles.paymentValue, isDark && { color: '#FFF' }]}>
                            ₹{order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2)}
                        </Text>
                    </View>

                    {order.shippingFee !== undefined && (
                        <View style={styles.paymentRow}>
                            <Text style={[styles.paymentLabel, isDark && { color: '#AAA' }]}>Delivery Fee</Text>
                            <Text style={[styles.paymentValue, isDark && { color: '#FFF' }]}>
                                {order.shippingFee === 0 ? 'FREE' : `₹${Number(order.shippingFee).toFixed(2)}`}
                            </Text>
                        </View>
                    )}

                    {(order as any).coupon_discount ? (
                        <View style={styles.paymentRow}>
                            <Text style={[styles.paymentLabel, isDark && { color: '#AAA' }]}>Coupon Discount</Text>
                            <Text style={[styles.paymentValue, { color: '#D32F2F' }]}>
                                -₹{Number((order as any).coupon_discount).toFixed(2)}
                            </Text>
                        </View>
                    ) : null}

                    <View style={[styles.paymentRow, { borderTopWidth: 1, borderTopColor: isDark ? '#333' : '#F0F0F0', paddingTop: 12, borderBottomWidth: 0, paddingBottom: 0, marginTop: 4 }]}>
                        <Text style={[styles.paymentLabel, { fontFamily: 'DMSans_700Bold' }, isDark && { color: '#AAA' }]}>Grand Total</Text>
                        <Text style={[styles.paymentTotal, isDark && { color: '#81C784' }]}>₹{Number(order.totalAmount).toFixed(2)}</Text>
                    </View>
                </View>


                {/* ── Your Driver — only shown once vendor assigns one ── */}
                {order.deliveryPartnerName ? (
                    <>
                        <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Your Driver</Text>
                        <View style={[styles.driverCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                            <View style={styles.driverInfo}>
                                {order.deliveryPartnerPhoto ? (
                                    <Image
                                        source={{ uri: order.deliveryPartnerPhoto }}
                                        style={styles.driverAvatar}
                                    />
                                ) : (
                                    <View style={[styles.driverAvatar, { backgroundColor: '#1F5E2E', alignItems: 'center', justifyContent: 'center' }]}>
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                            {order.deliveryPartnerName.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')}
                                        </Text>
                                    </View>
                                )}
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={[styles.driverName, isDark && { color: '#FFF' }]}>{order.deliveryPartnerName}</Text>
                                    {order.deliveryPartnerPhone ? (
                                        <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{order.deliveryPartnerPhone}</Text>
                                    ) : null}
                                </View>
                            </View>
                            {order.deliveryPartnerPhone ? (
                                <View style={styles.driverActions}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: '#1F5E2E', paddingHorizontal: 20 }]}
                                        onPress={() => Linking.openURL(`tel:${order.deliveryPartnerPhone}`)}
                                    >
                                        <Ionicons name="call" size={18} color="#fff" />
                                        <Text style={[styles.actionBtnText, { color: '#fff' }]}> Call</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null}
                        </View>
                    </>
                ) : null}


                {/* Rate Order Section - Only for Delivered Orders */}
                {order.status === 'Delivered' && (
                    <View style={styles.rateSection}>
                        <TouchableOpacity
                            style={[styles.rateOrderBtn, isDark && { backgroundColor: '#1F5E2E', borderColor: '#1F5E2E' }]}
                            onPress={() => router.push(`/order/${order.id}` as any)}
                        >
                            <Ionicons name="star" size={20} color="#FFF" />
                            <Text style={styles.rateOrderText}>Rate Your Order</Text>
                        </TouchableOpacity>
                        <Text style={[styles.rateHint, isDark && { color: '#AAA' }]}>
                            Share your experience with this order
                        </Text>
                    </View>
                )}

                {/* Cancel Order Section */}
                {['Pending', 'Confirmed', 'Accepted'].includes(order.status) && (
                    <View style={styles.cancelSection}>
                        <TouchableOpacity
                            style={[styles.cancelOrderBtn, cancelling && styles.disabledBtn]}
                            onPress={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? (
                                <ActivityIndicator color="#FF4444" />
                            ) : (
                                <>
                                    <Ionicons name="close-circle-outline" size={20} color="#FF4444" />
                                    <Text style={styles.cancelOrderText}>Cancel Order</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.cancelHint}>You can cancel this order until it's shipped</Text>
                    </View>
                )}

                {['Shipped', 'On the Way', 'Ready', 'Processing'].includes(order.status) && (
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color="#FF9800" />
                        <Text style={styles.infoText}>
                            This order has been shipped by the farmer and cannot be cancelled.
                        </Text>
                    </View>
                )}

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
    helpBtn: {
        padding: 4,
        borderRadius: 12,
    },
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

    cancelSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    cancelOrderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#FF4444',
        backgroundColor: '#fff',
        gap: 8,
    },
    cancelOrderText: {
        color: '#FF4444',
        fontSize: 15,
        fontFamily: 'DMSans_700Bold',
    },
    cancelHint: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
        fontFamily: 'DMSans_400Regular',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 20,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#E65100',
        fontFamily: 'DMSans_500Medium',
        lineHeight: 18,
    },
    rateSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    rateOrderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#1F5E2E',
        gap: 8,
        shadowColor: '#1F5E2E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    rateOrderText: {
        color: '#FFF',
        fontSize: 15,
        fontFamily: 'DMSans_700Bold',
    },
    rateHint: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        fontFamily: 'DMSans_400Regular',
    },
});
