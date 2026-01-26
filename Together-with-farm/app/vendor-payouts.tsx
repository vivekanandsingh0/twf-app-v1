import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function PayoutsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

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
                        <Text style={styles.balanceValue}>₹2500.00</Text>
                        <Text style={styles.payoutSchedule}>NEXT SCHEDULED PAYOUT</Text>
                        <Text style={styles.payoutDate}>Oct 24,2026</Text>
                    </View>
                    <TouchableOpacity style={styles.requestButton}>
                        <Text style={styles.requestButtonText}>Request Payout</Text>
                    </TouchableOpacity>
                </View>

                {/* Monthly Performance */}
                <Text style={styles.sectionTitle}>Monthly Performance</Text>
                <View style={styles.performanceCard}>
                    <Text style={styles.performanceLabel}>Avg. Monthly Revenue</Text>
                    <Text style={styles.performanceValue}>₹2500.00</Text>

                    {/* Dummy Chart Mockup */}
                    <View style={styles.chartContainer}>
                        {/* Placeholder for chart lines/bars */}
                        {/* Just simple visual representation */}
                        <View style={{ flex: 1 }}></View>

                        <View style={styles.chartLabels}>
                            <Text style={styles.chartLabel}>January</Text>
                            <Text style={[styles.chartLabel, styles.activeChartLabel]}>February</Text>
                            <Text style={styles.chartLabel}>March</Text>
                            <Text style={styles.chartLabel}>April</Text>
                            <Text style={styles.chartLabel}>May</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Payouts */}
                <Text style={styles.sectionTitle}>Recent Payouts</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.payoutsScroll}>
                    <View style={styles.payoutCard}>
                        <View style={styles.payoutHeader}>
                            <Text style={styles.payoutStatusPaid}>PAID</Text>
                            <Text style={styles.payoutDateSmall}>Oct 12</Text>
                        </View>
                        <Text style={styles.payoutAmount}>₹2500.00</Text>
                        <Text style={styles.payoutMethod}>Bank Transfer-1467</Text>
                    </View>
                    <View style={[styles.payoutCard, { marginLeft: 16 }]}>
                        <View style={styles.payoutHeader}>
                            <Text style={styles.payoutStatusProcessing}>PROCESSING</Text>
                            <Text style={styles.payoutDateSmall}>Aug 12</Text>
                        </View>
                        <Text style={styles.payoutAmount}>₹2500.00</Text>
                        <Text style={styles.payoutMethod}>Bank Transfer-1467</Text>
                    </View>
                </ScrollView>

                {/* Transaction History */}
                <Text style={styles.sectionTitle}>Transaction History</Text>
                <View style={styles.transactionList}>
                    {[
                        { id: '1004', date: 'Oct 21', amount: '+₹84.00' },
                        { id: '1003', date: 'Oct 21', amount: '+₹124.00' },
                        { id: '1002', date: 'Oct 21', amount: '+₹94.00' },
                        { id: '1001', date: 'Oct 21', amount: '+₹114.00' },
                    ].map((tx) => (
                        <View key={tx.id} style={styles.transactionCard}>
                            <View style={styles.transactionIcon}>
                                <Ionicons name="cube" size={20} color="#1F5E2E" />
                                {/* Using cube as placeholder for the basket-like icon */}
                            </View>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionId}>#FARM-{tx.id}</Text>
                                <Text style={styles.transactionMeta}>Ramesh Kumar~{tx.date}</Text>
                            </View>
                            <View style={styles.transactionAmountContainer}>
                                <Text style={styles.transactionAmount}>{tx.amount}</Text>
                                <Text style={styles.netEarned}>Net Earned</Text>
                            </View>
                        </View>
                    ))}
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
