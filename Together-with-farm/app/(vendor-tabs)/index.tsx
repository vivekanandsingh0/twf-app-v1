

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Svg, Path, Circle, Text as SvgText } from 'react-native-svg';
import { useVendor, VendorProduct } from '@/contexts/VendorContext';

export default function VendorHomeScreen() {
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = useWindowDimensions();
    const router = require('expo-router').useRouter();
    const { products, updateProduct, orders, dashboardStats } = useVendor();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Stock');

    const filters = ['All Stock', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Meat', 'Seafood', 'Out of Stock'];

    // Derived State
    const activeOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Accepted' || o.status === 'Ready').length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    const filteredProducts = products.filter(p => {
        if (activeFilter === 'All Stock') return true;
        if (activeFilter === 'Out of Stock') return p.stock === 0;
        if (activeFilter === 'Low Stock') return p.stock > 0 && p.stock < 10;
        return p.category === activeFilter;
    }).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleStockToggle = (id: string, currentStatus: string) => {
        // Toggle Logic: If Active/Low Stock -> Out of Stock. If Out of Stock -> Active (default stock 1)
        if (currentStatus === 'Out of Stock') {
            updateProduct(id, { status: 'Active', stock: 1 });
        } else {
            updateProduct(id, { status: 'Out of Stock', stock: 0 });
        }
    };

    const handleQuantityUpdate = (id: string, currentStock: number, change: number) => {
        const newStock = Math.max(0, currentStock + change);
        let newStatus: VendorProduct['status'] = 'Active';

        if (newStock === 0) newStatus = 'Out of Stock';
        else if (newStock < 10) newStatus = 'Active'; // Simplified status logic, assuming context handles granular if needed, or we map styling below

        // Context interface uses 'Active' | 'Draft' | 'Out of Stock'. 
        // We can infer logic here.
        updateProduct(id, { stock: newStock, status: newStatus });
    };

    const getDisplayStatus = (p: VendorProduct) => {
        if (p.stock === 0) return 'OUT OF STOCK';
        if (p.stock < 10) return 'LOW STOCK';
        return 'IN STOCK';
    };

    const renderStockItem = (item: VendorProduct) => {
        const displayStatus = getDisplayStatus(item);
        const isActive = displayStatus !== 'OUT OF STOCK';

        return (
            <View key={item.id} style={styles.stockCard}>
                <Image
                    source={item.image}
                    style={styles.stockImage}
                    contentFit="cover"
                />
                <View style={styles.stockInfo}>
                    <View style={styles.stockHeader}>
                        <Text style={styles.stockName}>{item.name}</Text>
                        <Switch
                            trackColor={{ false: '#E0E0E0', true: '#1F5E2E' }}
                            thumbColor={'#FFFFFF'}
                            ios_backgroundColor="#E0E0E0"
                            onValueChange={() => handleStockToggle(item.id, item.status)}
                            value={isActive}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </View>
                    <Text style={styles.stockPrice}>₹{item.price}/{item.unit}</Text>

                    <View style={styles.stockControls}>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity
                                style={styles.qtyButton}
                                onPress={() => handleQuantityUpdate(item.id, item.stock, -1)}
                            >
                                <Text style={styles.qtyButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{item.stock}</Text>
                            <TouchableOpacity
                                style={styles.qtyButton}
                                onPress={() => handleQuantityUpdate(item.id, item.stock, 1)}
                            >
                                <Text style={styles.qtyButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[
                            styles.statusBadge,
                            displayStatus === 'LOW STOCK' && styles.statusLow,
                            displayStatus === 'OUT OF STOCK' && styles.statusOut
                        ]}>
                            <Text style={[
                                styles.statusText,
                                displayStatus === 'LOW STOCK' && styles.statusTextLow,
                                displayStatus === 'OUT OF STOCK' && styles.statusTextOut
                            ]}>{displayStatus}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Green Header Background */}
            <View style={[styles.headerBackground, { paddingTop: insets.top }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Home</Text>
                        <Text style={styles.headerSubtitle}>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {activeOrdersCount} Active Orders</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
                        <Ionicons name="notifications-outline" size={24} color="#1F5E2E" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search 'Tomato' or 'Potato'"
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
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsLabel}>Active Orders</Text>
                        <Text style={styles.statsValue}>{activeOrdersCount}</Text>
                    </View>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsLabel}>Out of Stock</Text>
                        <Text style={[styles.statsValue, { color: '#FF5252' }]}>{outOfStockCount}</Text>
                    </View>
                </View>

                {/* Quick Stock Updates */}
                <Text style={styles.sectionTitle}>Quick Stock Updates</Text>
                <View style={styles.stockList}>
                    {filteredProducts.map(renderStockItem)}
                    {filteredProducts.length === 0 && (
                        <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>No items found.</Text>
                    )}
                </View>

                {/* Business Insights */}
                <Text style={styles.sectionTitle}>Business Insights</Text>
                <View style={styles.insightsCard}>
                    <Text style={styles.insightsLabel}>Sales Overview</Text>
                    <Text style={styles.totalSalesText}>Total Revenue: ₹{dashboardStats.totalSales}</Text>

                    <View style={styles.chartContainer}>
                        {(() => {
                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                            // 1. Get last 7 days
                            const last7Days = Array.from({ length: 7 }, (_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() - (6 - i));
                                return d;
                            });

                            // 2. Aggregate Data
                            const dailyAmounts = last7Days.map(date => {
                                const dayStr = date.toISOString().split('T')[0];
                                return orders
                                    .filter(o => o.date.startsWith(dayStr) && o.status !== 'Cancelled')
                                    .reduce((sum, o) => sum + o.totalAmount, 0);
                            });

                            const labels = last7Days.map(d => days[d.getDay()]);

                            // 3. Custom Chart Logic
                            const chartHeight = 150;
                            const chartWidth = screenWidth - 80; // Card padding
                            const maxVal = Math.max(...dailyAmounts, 100); // Avoid div by 0

                            // Calculate Points
                            const points = dailyAmounts.map((val, index) => {
                                const x = (index / (dailyAmounts.length - 1)) * chartWidth;
                                const y = chartHeight - ((val / maxVal) * chartHeight);
                                return `${x},${y}`;
                            });

                            const pathData = `M ${points.join(' L ')}`;

                            return (
                                <View>
                                    <Svg height={chartHeight + 20} width={chartWidth + 20} style={{ overflow: 'visible' }}>
                                        {/* Line */}
                                        <Path
                                            d={pathData}
                                            fill="none"
                                            stroke="#1F5E2E"
                                            strokeWidth="3"
                                        />
                                        {/* Dots */}
                                        {dailyAmounts.map((val, index) => {
                                            const x = (index / (dailyAmounts.length - 1)) * chartWidth;
                                            const y = chartHeight - ((val / maxVal) * chartHeight);
                                            return (
                                                <Circle
                                                    key={index}
                                                    cx={x}
                                                    cy={y}
                                                    r="4"
                                                    fill="#FFFFFF"
                                                    stroke="#1F5E2E"
                                                    strokeWidth="2"
                                                />
                                            );
                                        })}
                                        {/* Labels */}
                                        {labels.map((label, index) => {
                                            const x = (index / (labels.length - 1)) * chartWidth;
                                            return (
                                                <SvgText
                                                    key={index}
                                                    x={x}
                                                    y={chartHeight + 20}
                                                    fontSize="10"
                                                    fill="#999"
                                                    textAnchor="middle"
                                                >
                                                    {label}
                                                </SvgText>
                                            );
                                        })}
                                    </Svg>
                                </View>
                            );
                        })()}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    headerBackground: {
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#E0E0E0',
        marginTop: 4,
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
    },
    filtersContainer: {
        gap: 12,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeFilterChip: {
        backgroundColor: '#164522',
    },
    filterText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#1F5E2E', // Default text color for white chips
    },
    activeFilterText: {
        color: '#FFFFFF',
    },

    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    statsCard: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 16,
    },
    statsLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#666',
        marginBottom: 8,
    },
    statsValue: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },

    sectionTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    stockList: {
        marginBottom: 32,
        gap: 16,
    },
    stockCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#fff',
    },
    stockInfo: {
        flex: 1,
    },
    stockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    stockName: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    stockPrice: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium', // Green color in design?
        color: '#1F5E2E',
        marginBottom: 8,
    },
    stockControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 4,
    },
    qtyButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    qtyText: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginHorizontal: 8,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: '#B0BEC5', // Light gray for IN STOCK (default) based on image "IN STOCK" text
    },
    statusLow: {
        backgroundColor: '#FFECB3',
    },
    statusTextLow: {
        color: '#FFA000',
    },
    statusOut: {
        backgroundColor: 'transparent',
    },
    statusTextOut: {
        color: '#FF5252',
    },

    insightsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 300,
    },
    insightsLabel: {
        fontSize: 14,
        color: '#999',
        marginBottom: 20,
    },
    chartContainer: {
        marginTop: 10,
        height: 180,
    },
    totalSalesText: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
        marginBottom: 20,
    },
    chartRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: '100%',
        paddingBottom: 20,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    barContainer: {
        height: '100%', // 100% of chartRow height
        width: 12,
        backgroundColor: '#F0F0F0',
        borderRadius: 6,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        borderRadius: 6,
    },
    barActive: {
        backgroundColor: '#1F5E2E',
    },
    barInactive: {
        backgroundColor: '#E0E0E0',
    },
    barLabel: {
        marginTop: 8,
        fontSize: 10,
        color: '#999',
        fontFamily: 'DMSans_500Medium',
    },
});
