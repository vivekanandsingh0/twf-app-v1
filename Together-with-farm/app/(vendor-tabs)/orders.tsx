import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useVendor, VendorOrder } from '@/contexts/VendorContext';

export default function VendorOrdersScreen() {
    const insets = useSafeAreaInsets();
    const router = require('expo-router').useRouter();
    const { orders, updateOrderStatus } = useVendor();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Pending', 'Preparing', 'On the Way', 'Delivered'];

    // Map Context Status to UI Status filters
    const getUIStatus = (status: VendorOrder['status']) => {
        if (status === 'Accepted') return 'Preparing';
        if (status === 'Shipped') return 'On the Way';
        return status;
    };

    const displayOrders = orders.filter(o => {
        const uiStatus = getUIStatus(o.status);
        if (activeFilter !== 'All' && uiStatus !== activeFilter) return false;

        const searchLower = searchQuery.toLowerCase();
        return o.id.toLowerCase().includes(searchLower) || o.customerName.toLowerCase().includes(searchLower);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getStatusColor = (status: VendorOrder['status']) => {
        switch (status) {
            case 'Pending': return '#D97706'; // Orange
            case 'Accepted': return '#1F5E2E'; // Green (Preparing)
            case 'Ready': return '#1F5E2E'; // Green
            case 'Shipped': return '#5B4DBC'; // Purple/Blue (On the Way)
            case 'Delivered': return '#666';
            default: return '#666';
        }
    };

    const itemsToString = (items: VendorOrder['items']) => {
        return items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
    };

    const renderOrderCard = (order: VendorOrder) => {
        const uiStatus = getUIStatus(order.status);

        return (
            <View key={order.id} style={styles.card}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                        <Image
                            source={require('@/assets/images/3d-model-with-veg.png')} // Placeholder for user avatar
                            style={styles.userImage}
                            contentFit="cover"
                        />
                        <View>
                            <Text style={styles.userName}>{order.customerName}</Text>
                            <Text style={styles.orderId}>{order.id}</Text>
                        </View>
                    </View>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {uiStatus}
                    </Text>
                </View>

                {/* Order Details Box */}
                <View style={styles.detailsBox}>
                    <Text style={styles.itemsText} numberOfLines={2}>{itemsToString(order.items)}</Text>

                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Total Amount</Text>
                        <Text style={styles.amountValue}>₹{order.totalAmount}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                    {order.status === 'Pending' && (
                        <>
                            <TouchableOpacity
                                style={[styles.primaryButton, { flex: 1 }]}
                                onPress={() => updateOrderStatus(order.id, 'Accepted')}
                            >
                                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.primaryButtonText}>Accept Order</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="share-social-outline" size={20} color="#1A1A1A" />
                            </TouchableOpacity>
                        </>
                    )}

                    {(order.status === 'Accepted' || order.status === 'Ready') && (
                        <>
                            {order.status === 'Accepted' ? (
                                <TouchableOpacity
                                    style={[styles.primaryButton, { flex: 1 }]}
                                    onPress={() => updateOrderStatus(order.id, 'Shipped')} // Or 'Ready' then Shipped? Let's go straight to On the Way for simplicity or Ready
                                >
                                    <Ionicons name="cube-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.primaryButtonText}>Mark as Dispatched</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.primaryButton, { flex: 1 }]}
                                    onPress={() => updateOrderStatus(order.id, 'Shipped')}
                                >
                                    <Ionicons name="bicycle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.primaryButtonText}>Dispatch Order</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="call-outline" size={20} color="#1A1A1A" />
                            </TouchableOpacity>
                        </>
                    )}

                    {order.status === 'Shipped' && (
                        <>
                            <TouchableOpacity
                                style={[styles.primaryButton, { flex: 1 }]}
                                onPress={() => updateOrderStatus(order.id, 'Delivered')}
                            >
                                <Ionicons name="checkmark-done-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.primaryButtonText}>Verify Delivery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="call-outline" size={20} color="#1A1A1A" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <View style={styles.titleRow}>
                        <Ionicons name="bag-handle" size={24} color="#1F5E2E" style={{ marginRight: 8 }} />
                        <Text style={styles.headerTitle}>Orders</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>GREENVALLEY FARM</Text>
                </View>

                <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{orders.filter(o => o.status === 'Pending').length}</Text>
                    </View>
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Order ID or Customer"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
                style={{ maxHeight: 60, marginBottom: 12 }}
            >
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterChip,
                            activeFilter === filter ? styles.activeFilterChip : styles.inactiveFilterChip
                        ]}
                        onPress={() => setActiveFilter(filter)}
                    >
                        <Text style={[
                            styles.filterText,
                            activeFilter === filter ? styles.activeFilterText : styles.inactiveFilterText
                        ]}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                contentContainerStyle={styles.ordersList}
                showsVerticalScrollIndicator={false}
            >
                {displayOrders.map(renderOrderCard)}
                {displayOrders.length === 0 && (
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>No orders found.</Text>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: '#529F5D', // Light green
        marginTop: 4,
        textTransform: 'uppercase',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20, // Circular
        backgroundColor: '#F7F7F7',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#1F5E2E',
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        marginHorizontal: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
    },
    filtersContainer: {
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 4, // Add padding to avoid clipping shadow/border
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
    },
    activeFilterChip: {
        backgroundColor: '#1F5E2E',
        borderColor: '#1F5E2E',
    },
    inactiveFilterChip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E0',
    },
    filterText: {
        fontSize: 13,
        fontFamily: 'DMSans_500Medium',
    },
    activeFilterText: {
        color: '#FFFFFF',
    },
    inactiveFilterText: {
        color: '#1A1A1A',
    },
    ordersList: {
        paddingHorizontal: 20,
        gap: 16,
        paddingTop: 8,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.03)',
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        width: 48,
        height: 48,
        borderRadius: 12, // Somewhat squarish rounded
        marginRight: 12,
        backgroundColor: '#EEF',
    },
    userName: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    orderId: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
        marginTop: 2,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
    },
    detailsBox: {
        backgroundColor: '#F0F2F0', // Light grey box
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        gap: 12,
    },
    itemsText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
        lineHeight: 20,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    amountLabel: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: '#888', // Greenish grey
    },
    amountValue: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    primaryButton: {
        height: 48,
        backgroundColor: '#1F5E2E',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
    },
    iconButton: {
        width: 48,
        height: 48,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
