import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVendor } from '@/contexts/VendorContext';

export default function OrderDetailsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { orders, updateOrderStatus } = useVendor();

    const order = orders.find(o => o.id === id);

    if (!order) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Order not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: 'blue' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#D97706';
            case 'Accepted': return '#1F5E2E';
            case 'Shipped': return '#5B4DBC';
            case 'Delivered': return '#666';
            case 'Cancelled': return '#D32F2F'; // Red
            default: return '#666';
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Order ID & Status */}
                <View style={styles.sectionCard}>
                    <View style={styles.rowBetween}>
                        <View>
                            <Text style={styles.orderIdLabel}>Order ID</Text>
                            <Text style={styles.orderIdValue}>{order.id}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                        </View>
                    </View>
                    <Text style={styles.dateText}>{new Date(order.date).toLocaleString()}</Text>
                </View>

                {/* Customer Details */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Customer Details</Text>
                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={20} color="#666" style={{ width: 24 }} />
                        <Text style={styles.detailText}>{order.customerName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={20} color="#666" style={{ width: 24 }} />
                        <Text style={styles.detailText}>{order.customerPhone || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={20} color="#666" style={{ width: 24 }} />
                        <Text style={styles.detailText}>{order.deliveryAddress}</Text>
                    </View>

                    {/* GPS Coordinates */}
                    {order.deliveryLatitude && order.deliveryLongitude ? (
                        <View style={styles.coordsCard}>
                            <View style={styles.coordsRow}>
                                <Ionicons name="navigate" size={16} color="#1F5E2E" />
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.coordsLabel}>Pinned GPS Location</Text>
                                    <Text style={styles.coordsValue}>
                                        {order.deliveryLatitude.toFixed(6)}, {order.deliveryLongitude.toFixed(6)}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.mapBtn}
                                    onPress={() => {
                                        const lat = order.deliveryLatitude;
                                        const lng = order.deliveryLongitude;
                                        const url = Platform.OS === 'ios'
                                            ? `maps://?q=${lat},${lng}&ll=${lat},${lng}`
                                            : `https://maps.google.com/?q=${lat},${lng}`;
                                        Linking.openURL(url!);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="map" size={14} color="#fff" />
                                    <Text style={styles.mapBtnText}>Maps</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.noCoordsBadge}>
                            <Ionicons name="alert-circle-outline" size={14} color="#999" />
                            <Text style={styles.noCoordsText}>No GPS pin — customer did not set map location</Text>
                        </View>
                    )}

                    {/* Receiver Details (Optional) */}
                    {(order.receiverName || order.receiverPhone) && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                            <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 8 }]}>Receiver Info</Text>
                            {order.receiverName && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="person" size={20} color="#666" style={{ width: 24 }} />
                                    <Text style={styles.detailText}>{order.receiverName}</Text>
                                </View>
                            )}
                            {order.receiverPhone && (
                                <View style={styles.detailRow}>
                                    <Ionicons name="call" size={20} color="#666" style={{ width: 24 }} />
                                    <Text style={styles.detailText}>{order.receiverPhone}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Items */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Items Ordered</Text>
                    {order.items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.productName}</Text>
                                <Text style={styles.itemMeta}>{item.quantity} x ₹{item.price}</Text>
                            </View>
                            <Text style={styles.itemTotal}>₹{item.quantity * item.price}</Text>
                        </View>
                    ))}
                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{order.items.reduce((acc, i) => acc + (i.price * i.quantity), 0)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>₹{order.shippingFee || 0}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Discount</Text>
                        <Text style={styles.summaryValue}>-₹{order.discount || 0}</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginTop: 8 }]}>
                        <Text style={styles.totalLabel}>Grand Total</Text>
                        <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
                    </View>
                </View>

                {/* Payment Info */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Payment Information</Text>
                    <View style={styles.rowBetween}>
                        <Text style={styles.detailText}>Method</Text>
                        <Text style={[styles.detailText, { fontWeight: 'bold' }]}>{order.paymentMethod || 'COD'}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.detailText}>Status</Text>
                        <Text style={[styles.detailText, { color: order.paymentStatus === 'Paid' ? 'green' : 'orange', fontWeight: 'bold' }]}>
                            {order.paymentStatus}
                        </Text>
                    </View>
                </View>

                {/* Cancelled Order Notice */}
                {order.status === 'Cancelled' && (
                    <View style={styles.cancelledNotice}>
                        <Ionicons name="close-circle" size={24} color="#D32F2F" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.cancelledTitle}>Order Cancelled</Text>
                            <Text style={styles.cancelledText}>
                                This order was cancelled by the customer. No action is required.
                            </Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Action Footer (Matches Orders Screen Logic) */}
            {order.status === 'Pending' && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => { updateOrderStatus(order.id, 'Accepted'); }}>
                        <Text style={styles.btnText}>Accept Order</Text>
                    </TouchableOpacity>
                </View>
            )}
            {order.status === 'Accepted' && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => { updateOrderStatus(order.id, 'Shipped'); }}>
                        <Text style={styles.btnText}>Mark Dispatched</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 20,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderIdLabel: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'DMSans_500Medium',
    },
    orderIdValue: {
        fontSize: 16,
        color: '#1A1A1A',
        fontFamily: 'DMSans_700Bold',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'DMSans_400Regular',
        flex: 1,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        color: '#1A1A1A',
        fontFamily: 'DMSans_500Medium',
    },
    itemMeta: {
        fontSize: 12,
        color: '#666',
    },
    itemTotal: {
        fontSize: 14,
        color: '#1A1A1A',
        fontFamily: 'DMSans_700Bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1A1A1A',
        fontFamily: 'DMSans_500Medium',
    },
    totalLabel: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    totalValue: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    primaryButton: {
        backgroundColor: '#1F5E2E',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
        fontSize: 16,
    },
    cancelledNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFCDD2',
        marginTop: 20,
    },
    cancelledTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#D32F2F',
        marginBottom: 4,
    },
    cancelledText: {
        fontSize: 14,
        color: '#C62828',
        lineHeight: 20,
    },
    coordsCard: {
        backgroundColor: '#F0FAF3',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#A5D6A7',
        marginTop: 4,
        marginBottom: 4,
    },
    coordsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coordsLabel: {
        fontSize: 11,
        color: '#1F5E2E',
        fontFamily: 'DMSans_700Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    coordsValue: {
        fontSize: 13,
        color: '#1A1A1A',
        fontFamily: 'DMSans_500Medium',
    },
    mapBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 10,
        marginLeft: 8,
    },
    mapBtnText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
    },
    noCoordsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    noCoordsText: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'DMSans_400Regular',
        flex: 1,
    },
});
