import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useVendor, VendorOrder, VendorProduct } from '@/contexts/VendorContext';

// --- Types ---
type TimeRange = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'This Month';

export default function BusinessDashboardScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { orders, products, transactions } = useVendor();
    const [selectedRange, setSelectedRange] = useState<TimeRange>('Last 7 Days');

    // --- Helpers ---
    const getDateDate = (dateStr: string) => {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    // --- Filtering Logic ---
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return orders.filter(o => {
            const orderDate = getDateDate(o.date);

            if (selectedRange === 'Today') {
                return orderDate.getTime() === today.getTime();
            }
            if (selectedRange === 'Yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return orderDate.getTime() === yesterday.getTime();
            }
            if (selectedRange === 'Last 7 Days') {
                const last7 = new Date(today);
                last7.setDate(today.getDate() - 7);
                return orderDate >= last7;
            }
            if (selectedRange === 'Last 30 Days') {
                const last30 = new Date(today);
                last30.setDate(today.getDate() - 30);
                return orderDate >= last30;
            }
            if (selectedRange === 'This Month') {
                return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
            }
            return true;
        });
    }, [orders, selectedRange]);

    // --- Analytics Calculations ---
    const totalSales = filteredOrders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrdersCount = filteredOrders.length;

    // Avg Order Value
    const validOrdersCount = filteredOrders.filter(o => o.status !== 'Cancelled').length;
    const avgOrderValue = validOrdersCount > 0 ? (totalSales / validOrdersCount).toFixed(0) : 0;

    const cancelledCount = filteredOrders.filter(o => o.status === 'Cancelled').length;

    // Category Performance
    const categoryPerformance = useMemo(() => {
        const catMap: Record<string, number> = {};

        filteredOrders.filter(o => o.status !== 'Cancelled').forEach(order => {
            order.items.forEach(item => {
                // Find product to get category
                const product = products.find(p => p.name === item.productName);
                const category = product?.category || 'Uncategorized';
                catMap[category] = (catMap[category] || 0) + (item.price * item.quantity);
            });
        });

        const sorted = Object.entries(catMap)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => {
                const total = Object.values(catMap).reduce((s, c) => s + c, 0);
                return { name: cat, amount, percentage: total > 0 ? (amount / total) * 100 : 0 };
            });

        return sorted;
    }, [filteredOrders, products]);

    // Top Products
    const topProducts = useMemo(() => {
        const prodMap: Record<string, { name: string, sales: number, qty: number }> = {};

        filteredOrders.filter(o => o.status !== 'Cancelled').forEach(order => {
            order.items.forEach(item => {
                if (!prodMap[item.productName]) {
                    prodMap[item.productName] = { name: item.productName, sales: 0, qty: 0 };
                }
                prodMap[item.productName].sales += (item.price * item.quantity);
                prodMap[item.productName].qty += item.quantity;
            });
        });

        return Object.values(prodMap).sort((a, b) => b.sales - a.sales).slice(0, 5);
    }, [filteredOrders]);


    // --- Render Helpers ---

    const renderMetricCard = (title: string, value: string | number, subtext: string, icon: any, color: string) => (
        <View style={styles.metricCard}>
            <View style={[styles.metricHeader, { marginBottom: 8 }]}>
                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                {/* <Ionicons name="ellipsis-horizontal" size={16} color="#999" /> */}
            </View>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricTitle}>{title}</Text>
            {/* <Text style={styles.metricSubtext}>{subtext}</Text> */}
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Business Dashboard</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="download-outline" size={22} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Date Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {(['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'] as TimeRange[]).map((range) => (
                        <TouchableOpacity
                            key={range}
                            style={[styles.filterChip, selectedRange === range && styles.activeFilterChip]}
                            onPress={() => setSelectedRange(range)}
                        >
                            <Text style={[styles.filterText, selectedRange === range && styles.activeFilterText]}>{range}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                    <View style={styles.gridRow}>
                        {renderMetricCard('Total Sales', `₹${totalSales.toLocaleString()}`, '+12% from last week', 'cash-outline', '#1F5E2E')}
                        {renderMetricCard('Total Orders', totalOrdersCount, '+5% from last week', 'cart-outline', '#2979FF')}
                    </View>
                    <View style={styles.gridRow}>
                        {renderMetricCard('Avg. Order Value', `₹${avgOrderValue}`, 'Stagnant', 'pricetag-outline', '#F57C00')}
                        {renderMetricCard('Cancelled', cancelledCount, '2 orders returned', 'alert-circle-outline', '#D32F2F')}
                    </View>
                </View>

                {/* Sales Chart Skeleton (Visual Only representation of trend) */}
                <View style={styles.sectionCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Sales Trend</Text>
                        <Text style={styles.cardSubtitle}>{selectedRange}</Text>
                    </View>
                    <View style={{ height: 150, alignItems: 'center', justifyContent: 'center' }}>
                        {/* Simple Bar Chart Visualization */}
                        <View style={styles.chartContainer}>
                            {filteredOrders.length > 0 ? (
                                // This is a simplified logic just to show bars. In real app, we group by day.
                                Array.from({ length: 7 }).map((_, i) => (
                                    <View key={i} style={styles.chartBarWrapper}>
                                        <View style={[styles.chartBar, { height: `${Math.random() * 60 + 20}%` }]} />
                                    </View>
                                ))
                            ) : (
                                <Text style={{ color: '#999', fontSize: 13 }}>No data for selected period</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Category Performance */}
                <View style={styles.sectionCard}>
                    <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Sales by Category</Text>
                    {categoryPerformance.length > 0 ? categoryPerformance.map((cat, index) => (
                        <View key={index} style={styles.catRow}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={styles.catName}>{cat.name}</Text>
                                <Text style={styles.catAmount}>{Math.round(cat.percentage)}% (₹{cat.amount})</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${cat.percentage}%` }]} />
                            </View>
                        </View>
                    )) : (
                        <Text style={{ color: '#999', textAlign: 'center', padding: 20 }}>No sales data</Text>
                    )}
                </View>

                {/* Top Products */}
                <View style={styles.sectionCard}>
                    <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Top Performing Products</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, { flex: 2 }]}>Product</Text>
                        <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Sold</Text>
                        <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Revenue</Text>
                    </View>
                    {topProducts.length > 0 ? topProducts.map((prod, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{prod.name}</Text>
                            <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>{prod.qty}</Text>
                            <Text style={[styles.td, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>₹{prod.sales}</Text>
                        </View>
                    )) : (
                        <Text style={{ color: '#999', textAlign: 'center', padding: 20 }}>No items sold</Text>
                    )}
                </View>

                {/* Recent Payouts */}
                <View style={styles.sectionCard}>
                    <View style={[styles.cardHeader, { marginBottom: 10 }]}>
                        <Text style={styles.cardTitle}>Recent Payouts</Text>
                        <TouchableOpacity onPress={() => router.push('/vendor-payouts')}>
                            <Text style={{ color: '#1F5E2E', fontSize: 13, fontWeight: '600' }}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {transactions.length > 0 ? transactions.slice(0, 3).map((txn, index) => (
                        <View key={index} style={styles.txnRow}>
                            <View style={styles.txnIcon}>
                                <Ionicons name={txn.type === 'Credit' ? 'arrow-down' : 'arrow-up'} size={18} color="#1F5E2E" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.txnDesc}>{txn.description}</Text>
                                <Text style={styles.txnDate}>{new Date(txn.date).toLocaleDateString()}</Text>
                            </View>
                            <Text style={styles.txnAmount}>+₹{txn.amount}</Text>
                        </View>
                    )) : (
                        <Text style={{ color: '#999', textAlign: 'center', padding: 20 }}>No recent payouts</Text>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
        height: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -8,
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
    scrollContent: {
        padding: 20,
    },
    filterRow: {
        gap: 8,
        paddingBottom: 20,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeFilterChip: {
        backgroundColor: '#1F5E2E',
        borderColor: '#1F5E2E',
    },
    filterText: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'DMSans_500Medium',
    },
    activeFilterText: {
        color: '#FFFFFF',
    },
    metricsGrid: {
        gap: 12,
        marginBottom: 20,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricValue: {
        fontSize: 22,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    metricTitle: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'DMSans_500Medium',
    },
    metricSubtext: {
        fontSize: 11,
        color: '#1F5E2E',
        marginTop: 4,
        fontWeight: '600',
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#999',
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        height: 120,
        width: '100%',
        paddingHorizontal: 20,
    },
    chartBarWrapper: {
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
    },
    chartBar: {
        backgroundColor: '#1F5E2E',
        borderRadius: 4,
        opacity: 0.8,
    },
    catRow: {
        marginBottom: 16,
    },
    catName: {
        fontSize: 14,
        color: '#1A1A1A',
        fontFamily: 'DMSans_500Medium',
    },
    catAmount: {
        fontSize: 13,
        color: '#666',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1F5E2E',
        borderRadius: 3,
    },
    tableHeader: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    th: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'DMSans_700Bold',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F9F9F9',
    },
    td: {
        fontSize: 14,
        color: '#1A1A1A',
        fontFamily: 'DMSans_500Medium',
    },
    txnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F9F9F9',
    },
    txnIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    txnDesc: {
        fontSize: 14,
        color: '#1A1A1A',
        fontFamily: 'DMSans_500Medium',
    },
    txnDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    txnAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F5E2E',
    },
});
