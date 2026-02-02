import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useVendor, VendorTransaction } from '@/contexts/VendorContext';

export default function PayoutsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { transactions, orders, dashboardStats } = useVendor();

    // 1. Available Balance (Completed/Delivered Orders)
    const availableBalance = transactions
        .filter(t => t.type === 'Credit' && t.status === 'Completed')
        .reduce((sum, t) => sum + t.amount, 0);

    // 2. Processing Balance (Active Orders not yet Delivered)
    const processingBalance = orders
        .filter(o => ['Pending', 'Accepted', 'Preparing', 'Ready', 'Shipped', 'On the Way'].includes(o.status))
        .reduce((sum, o) => sum + o.totalAmount, 0);

    // 3. Monthly Revenue (Completed Sales this Month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = transactions
        .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payouts & Earnings</Text>
                <TouchableOpacity style={[styles.iconButton]}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>2</Text>
                    </View>
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Available Balance Card */}
                <View style={styles.balanceCard}>
                    <View>
                        <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
                        <Text style={styles.balanceValue}>₹{availableBalance.toFixed(2)}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#D97706' }} />
                            <Text style={styles.payoutSchedule}>Processing: ₹{processingBalance.toFixed(2)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.requestButton}>
                        <Text style={styles.requestButtonText}>Request Payout</Text>
                    </TouchableOpacity>
                </View>

                {/* Monthly Performance */}
                <Text style={styles.sectionTitle}>Monthly Performance</Text>
                <View style={styles.performanceCard}>
                    <Text style={styles.performanceLabel}>This Month's Revenue</Text>
                    <Text style={styles.performanceValue}>₹{monthlyRevenue.toFixed(2)}</Text>

                    {/* Dummy Chart Mockup */}
                    <View style={styles.chartContainer}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                            {/* Simple Bar Chart Visualization */}
                            <View style={{ width: 30, height: '40%', backgroundColor: '#E2E8F0', borderRadius: 4 }} />
                            <View style={{ width: 30, height: '60%', backgroundColor: '#E2E8F0', borderRadius: 4 }} />
                            <View style={{ width: 30, height: '85%', backgroundColor: '#1F5E2E', borderRadius: 4 }} />
                            <View style={{ width: 30, height: '55%', backgroundColor: '#E2E8F0', borderRadius: 4 }} />
                            <View style={{ width: 30, height: '70%', backgroundColor: '#E2E8F0', borderRadius: 4 }} />
                        </View>

                        <View style={styles.chartLabels}>
                            <Text style={styles.chartLabel}>Jan</Text>
                            <Text style={styles.chartLabel}>Feb</Text>
                            <Text style={[styles.chartLabel, styles.activeChartLabel]}>Mar</Text>
                            <Text style={styles.chartLabel}>Apr</Text>
                            <Text style={styles.chartLabel}>May</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Transactions */}
                <Text style={styles.sectionTitle}>Transaction History</Text>
                <View style={styles.transactionList}>
                    {transactions.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#999', fontFamily: 'DMSans_400Regular' }}>No completed transactions yet.</Text>
                        </View>
                    ) : (
                        transactions.slice(0, 10).map((tx) => (
                            <View key={tx.id} style={styles.transactionCard}>
                                <View style={styles.transactionIcon}>
                                    <Ionicons name="cube-outline" size={20} color="#1F5E2E" />
                                </View>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionId}>{tx.id}</Text>
                                    <Text style={styles.transactionMeta}>{tx.description}</Text>
                                </View>
                                <View style={styles.transactionAmountContainer}>
                                    <Text style={styles.transactionAmount}>+₹{tx.amount}</Text>
                                    <Text style={styles.netEarned}>{new Date(tx.date).toLocaleDateString()}</Text>
                                </View>
                            </View>
                        ))
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
        backgroundColor: '#FCFCFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
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
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
    },
    badge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#1F5E2E',
        width: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        borderWidth: 1,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 8,
        fontFamily: 'DMSans_700Bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    balanceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        marginBottom: 24,
    },
    balanceLabel: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: '#999',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    balanceValue: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    payoutSchedule: {
        fontSize: 10,
        fontFamily: 'DMSans_500Medium',
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    payoutDate: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    requestButton: {
        backgroundColor: '#1F5E2E',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    requestButtonText: {
        color: '#FFFFFF',
        fontFamily: 'DMSans_500Medium',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    performanceCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        height: 250, // Fixed height for chart area
        borderWidth: 1,
        borderColor: '#EFEFEF',
        marginBottom: 24,
    },
    performanceLabel: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
    },
    performanceValue: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    chartContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    chartLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    chartLabel: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'DMSans_400Regular',
    },
    activeChartLabel: {
        color: '#1A1A1A',
        fontFamily: 'DMSans_700Bold',
    },
    payoutsScroll: {
        marginBottom: 24,
    },
    payoutCard: {
        width: 180,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 16,
        padding: 16,
    },
    payoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    payoutStatusPaid: {
        color: '#1F5E2E',
        fontFamily: 'DMSans_700Bold',
        fontSize: 12,
    },
    payoutStatusProcessing: {
        color: '#D97706', // Orange
        fontFamily: 'DMSans_700Bold',
        fontSize: 12,
    },
    payoutDateSmall: {
        color: '#999',
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
    },
    payoutAmount: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    payoutMethod: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'DMSans_400Regular',
    },
    transactionList: {
        gap: 12,
    },
    transactionCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionId: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    transactionMeta: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'DMSans_400Regular',
    },
    transactionAmountContainer: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold', // Green in screenshot
        color: '#1F5E2E',
    },
    netEarned: {
        fontSize: 10,
        color: '#999',
        marginTop: 2,
        fontFamily: 'DMSans_400Regular',
    },
});
