import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

// Types
type OrderStatus = 'Picked' | 'On the Way' | 'Delivered' | 'Cancelled';
type Order = {
    id: string;
    orderNumber: string;
    itemsSummary: string;
    date: string;
    total: string;
    status: OrderStatus;
    image: string; // URL
};

// Mock Data
const ACTIVE_ORDERS: Order[] = [
    {
        id: '1',
        orderNumber: '#4521',
        itemsSummary: 'Greek yogurt +3 more',
        date: 'Delivered on Oct 10', // Screenshot says Delivered but in Active? Maybe active means "In Progress" in real app, but sticking to screenshot text/style
        total: '$18.99',
        status: 'Picked',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60'
    },
    {
        id: '2',
        orderNumber: '#4521',
        itemsSummary: 'Chicken breast +5 more',
        date: 'Delivered on Oct 5',
        total: '$18.99',
        status: 'On the Way',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&auto=format&fit=crop&q=60'
    }
];

const PAST_ORDERS: Order[] = [
    {
        id: '3',
        orderNumber: '#4521',
        itemsSummary: 'Greek yogurt +3 more',
        date: 'Delivered on Oct 10',
        total: '$18.99',
        status: 'Delivered',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60'
    },
    {
        id: '4',
        orderNumber: '#4521',
        itemsSummary: 'Chicken breast +5 more',
        date: 'Delivered on Oct 5',
        total: '$18.99',
        status: 'Delivered',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&auto=format&fit=crop&q=60'
    },
    {
        id: '5',
        orderNumber: '#4521',
        itemsSummary: 'Chicken breast +5 more',
        date: 'Delivered on Oct 5',
        total: '$18.99',
        status: 'Delivered',
        image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop&q=60' // Corn
    }
];

export default function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Active' | 'Past'>('Active');

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
                    router.push(`/order/${orderId}` as any);
                }
            }}
        >
            <View style={styles.cardHeader}>
                <Image source={{ uri: order.image }} style={styles.productImage} />
                <View style={styles.badgeContainer}>
                    <View style={styles.quantityBadge}><Text style={styles.quantityText}>3</Text></View>
                    {/* Actually quantity in screenshot is overlay on image? Check screenshot. Yes, top right of image */}
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

            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'Active'
                    ? ACTIVE_ORDERS.map(o => renderOrderCard(o, false))
                    : PAST_ORDERS.map(o => renderOrderCard(o, true))
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
