import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

interface Order {
    id: string;
    customerName: string;
    orderIdDisplay: string;
    items: string;
    totalAmount: string;
    status: 'Pending' | 'Preparing' | 'On the Way' | 'Delivered';
    image: any;
}

export default function VendorOrdersScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

    const orders: Order[] = [
        {
            id: '1',
            customerName: 'Ramesh Kumar',
            orderIdDisplay: 'Order #FARM-2341',
            items: '2kg Tomatoes, 1kg Honey, 1X Fresh Basil',
            totalAmount: '$5.49',
            status: 'Pending',
            image: require('@/assets/images/3d-model-with-veg.png'),
        },
        {
            id: '2',
            customerName: 'Ramesh Kumar',
            orderIdDisplay: 'Order #FARM-2341',
            items: '2kg Tomatoes, 1kg Honey, 1X Fresh Basil',
            totalAmount: '$5.49',
            status: 'Preparing',
            image: require('@/assets/images/3d-model-with-veg.png'),
        },
        {
            id: '3',
            customerName: 'Ramesh Kumar',
            orderIdDisplay: 'Order #FARM-2341',
            items: '2kg Tomatoes, 1kg Honey, 1X Fresh Basil',
            totalAmount: '$5.49',
            status: 'On the Way',
            image: require('@/assets/images/3d-model-with-veg.png'),
        }
    ];

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Pending': return '#D97706'; // Orange
            case 'Preparing': return '#1F5E2E'; // Green
            case 'On the Way': return '#5B4DBC'; // Purple/Blue as shown in screenshot for "On the Way"
            default: return '#666';
        }
    };

    const renderOrderCard = (order: Order) => (
        <View key={order.id} style={styles.card}>
            {/* Header Row */}
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Image
                        source={order.image}
                        style={styles.userImage}
                        contentFit="cover"
                    />
                    <View>
                        <Text style={styles.userName}>{order.customerName}</Text>
                        <Text style={styles.orderId}>{order.orderIdDisplay}</Text>
                    </View>
                </View>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status}
                </Text>
            </View>

            {/* Order Details Box */}
            <View style={styles.detailsBox}>
                <Text style={styles.itemsText} numberOfLines={2}>{order.items}</Text>

                <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Total Amount</Text>
                    <Text style={styles.amountValue}>{order.totalAmount}</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
                {order.status === 'Pending' && (
                    <>
                        <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryButtonText}>Accept Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="share-social-outline" size={20} color="#1A1A1A" />
                        </TouchableOpacity>
                    </>
                )}

                {order.status === 'Preparing' && (
                    <>
                        <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]}>
                            {/* Box icon mockup */}
                            <Ionicons name="cube-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryButtonText}>Mark as Ready</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="call-outline" size={20} color="#1A1A1A" />
                        </TouchableOpacity>
                    </>
                )}

                {order.status === 'On the Way' && (
                    <>
                        <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]}>
                            {/* Bike/Delivery icon */}
                            <Ionicons name="bicycle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.primaryButtonText}>Track Delivery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="call-outline" size={20} color="#1A1A1A" />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );

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

                <TouchableOpacity style={styles.notificationButton}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>2</Text>
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
                {orders.map(renderOrderCard)}
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
