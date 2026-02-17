import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

// Types
type OrderStatus = 'Pending' | 'Accepted' | 'Ready' | 'Shipped' | 'Picked' | 'On the Way' | 'Delivered' | 'Cancelled';
type Order = {
    id: string;
    orderNumber: string;
    itemsSummary: string;
    date: string;
    total: string;
    status: OrderStatus;
    image: any; // Changed from string to any to support require/uri
    totalQuantity: number;
};

import { useVendor, VendorOrder } from '@/contexts/VendorContext';
import { useUser } from '@/contexts/UserContext';

// Helper to format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Active' | 'Past'>('Active');
    const { orders: userOrders, user, refreshOrders } = useUser();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshOrders();
        setRefreshing(false);
    };

    // Orders are already fetched for the logged-in user by UserContext
    // Just sort them by date (newest first)
    const myOrders = [...userOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Split into Active vs Past
    const activeOrders = myOrders.filter(o => ['Pending', 'Accepted', 'Ready', 'Shipped', 'Picked', 'On the Way'].includes(o.status));
    const pastOrders = myOrders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

    // Map to View Model
    const mapToViewOrder = (vo: VendorOrder): Order => {
        const itemCount = vo.items.reduce((sum, i) => sum + i.quantity, 0);
        // Use image from first item if available, else fallback
        const firstItemImage = vo.items.length > 0 && vo.items[0].image
            ? vo.items[0].image
            : { uri: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60" }; // Basket of veggies fallback

        const itemSummary = vo.items.length > 0
            ? vo.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')
            : 'No items';

        return {
            id: vo.id,
            orderNumber: `#${vo.id.split('-')[1] || vo.id}`,
            itemsSummary: itemSummary,
            date: `${vo.status} on ${formatDate(vo.date)}`,
            total: `₹${vo.totalAmount}`,
            status: vo.status as OrderStatus,
            image: firstItemImage,
            totalQuantity: itemCount
        };
    };

    const displayActive = activeOrders.map(mapToViewOrder);
    const displayPast = pastOrders.map(mapToViewOrder);

    const renderOrderCard = (order: Order, isPast: boolean) => (
        <TouchableOpacity
            key={order.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => {
                const orderId = order.orderNumber.replace('#', '');
                if (!isPast) {
                    router.push(`/detailed-product/${orderId}` as any);
                } else {
                    router.push(`/detailed-product/${orderId}` as any);
                }
            }}
        >
            <View style={styles.cardHeader}>
                <Image source={order.image} style={styles.productImage} />
                <View style={styles.badgeContainer}>
                    <View style={styles.quantityBadge}><Text style={styles.quantityText}>{order.totalQuantity}</Text></View>
                </View>

                <View style={styles.orderInfo}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                        <View style={[styles.statusBadge, isPast && styles.statusBadgeDelivered]}>
                            <Text style={[styles.statusText, isPast && styles.statusTextDelivered]}>
                                {order.status}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.itemSummary} numberOfLines={1}>{order.itemsSummary}</Text>
                    <Text style={styles.dateText}>{order.date}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <Text style={styles.totalLabel}>Total</Text>
                <View style={styles.footerRight}>
                    <Text style={styles.totalValue}>{order.total}</Text>
                </View>
            </View>

            {isPast && (
                <View style={styles.reorderContainer}>
                    <TouchableOpacity>
                        <Text style={styles.reorderText}>Re-order</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Orders</Text>
                <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                    <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
                    onPress={() => setActiveTab('Active')}
                >
                    <Text style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
                    onPress={() => setActiveTab('Past')}
                >
                    <Text style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}>Past Orders</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1F5E2E']} />
                }
            >
                {activeTab === 'Active'
                    ? displayActive.map(o => renderOrderCard(o, false))
                    : displayPast.map(o => renderOrderCard(o, true))
                }
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
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    notificationBtn: {
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: 2, right: 2,
        backgroundColor: '#1F5E2E',
        width: 16, height: 16, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center',
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#1F5E2E',
    },
    tabText: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 14,
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
    },

    listContent: {
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        // Shadow for premium feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    badgeContainer: {
        position: 'absolute',
        top: -6, left: 50,
        backgroundColor: '#1F5E2E',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        zIndex: 1,
    },
    quantityBadge: {
        // handled in container
    },
    quantityText: {
        color: '#fff', fontSize: 10, fontWeight: 'bold'
    },
    orderInfo: {
        flex: 1,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderNumber: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    statusBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeDelivered: {
        backgroundColor: '#E8F5E9', // Same light green bg
    },
    statusText: {
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E', // Green text for Picking/On Way
    },
    statusTextDelivered: {
        color: '#1F5E2E', // Green text
    },
    itemSummary: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: '#333',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0, // if no re-order
    },
    totalLabel: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
    },
    totalValue: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    footerRight: {
        // 
    },
    reorderContainer: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    reorderText: {
        fontSize: 13,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E', // Green link
    },
});
