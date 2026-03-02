import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { useVendor } from '@/contexts/VendorContext';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';

interface PayoutRequest {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    admin_notes?: string;
    transaction_id?: string;
}

export default function PayoutsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { transactions, orders, profile } = useVendor();
    const { user } = useUser();

    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loadingPayouts, setLoadingPayouts] = useState(true);

    const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
    const [historyTab, setHistoryTab] = useState<'payouts' | 'transactions'>('payouts');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [isExporting, setIsExporting] = useState(false);

    const fetchPayouts = React.useCallback(async () => {
        if (!user?.id) return;
        try {
            const { data, error } = await supabase
                .from('payout_requests')
                .select('*')
                .eq('vendor_id', user.id)
                .order('created_at', { ascending: false });
            if (!error && data) {
                setPayouts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPayouts(false);
        }
    }, [user?.id]);

    React.useEffect(() => {
        fetchPayouts();
    }, [fetchPayouts]);

    // Calculate total payouts (Pending + Processing + Completed) to subtract from available balance
    const totalPayoutsRequested = payouts
        .filter(p => !['Rejected'].includes(p.status))
        .reduce((sum, p) => sum + p.amount, 0);

    // 1. Available Balance (Completed/Delivered Orders - Payouts)
    let availableBalance = (transactions
        .filter(t => t.type === 'Credit' && t.status === 'Completed')
        .reduce((sum, t) => sum + t.amount, 0)) - totalPayoutsRequested;

    if (availableBalance < 0) availableBalance = 0;

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
            return t.type === 'Credit' && t.status === 'Completed' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const handleRequestPayout = async () => {
        if (!user?.id) return;
        if (availableBalance < 100) {
            alert("Minimum payout request is ₹100.");
            return;
        }
        if (!profile.bankDetails?.accountNumber || !profile.bankDetails?.ifscCode) {
            alert("Please add your bank details in Profile setting to request payouts.");
            return;
        }

        try {
            const { error } = await supabase.from('payout_requests').insert({
                vendor_id: user.id,
                amount: availableBalance,
            });
            if (error) throw error;
            alert("Payout request submitted successfully!");
            fetchPayouts();
        } catch (error: any) {
            alert("Failed to submit payout request: " + error.message);
        }
    };

    const filteredPayouts = payouts
        .filter(p => filterStatus === 'All' || p.status === filterStatus)
        .sort((a, b) => sortOrder === 'desc'
            ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            : new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const filteredTransactions = transactions
        .filter(t => filterStatus === 'All' || t.status === filterStatus)
        .sort((a, b) => sortOrder === 'desc'
            ? new Date(b.date).getTime() - new Date(a.date).getTime()
            : new Date(a.date).getTime() - new Date(b.date).getTime());

    const openHistory = (tab: 'payouts' | 'transactions') => {
        setHistoryTab(tab);
        setFilterStatus('All');
        setHistoryModalVisible(true);
    };

    const generateReport = async () => {
        setIsExporting(true);
        try {
            let csvContent = "";
            if (historyTab === 'payouts') {
                csvContent = "ID,Status,Amount,Date,Admin Notes,Transaction ID\n";
                filteredPayouts.forEach(p => {
                    csvContent += `${p.id},${p.status},${p.amount},${new Date(p.created_at).toLocaleDateString()},"${p.admin_notes || ''}","${p.transaction_id || ''}"\n`;
                });
            } else {
                csvContent = "ID,Type,Status,Amount,Date,Description\n";
                filteredTransactions.forEach(t => {
                    csvContent += `${t.id},${t.type},${t.status},${t.amount},${new Date(t.date).toLocaleDateString()},"${t.description || ''}"\n`;
                });
            }

            const fileUri = `${FileSystem.documentDirectory}TWF_${historyTab}_report.csv`;
            await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                alert("Sharing is not available on this device");
            }
        } catch (err: any) {
            alert("Failed to generate report");
        } finally {
            setIsExporting(false);
        }
    };

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
                    <TouchableOpacity style={styles.requestButton} onPress={handleRequestPayout}>
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

                {/* Payout Statements */}
                <Text style={styles.sectionTitle}>Payout Statements</Text>
                <View style={styles.transactionList}>
                    {payouts.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#999', fontFamily: 'DMSans_400Regular' }}>No payout requests yet.</Text>
                        </View>
                    ) : (
                        payouts.slice(0, 3).map((p) => (
                            <View key={p.id} style={styles.transactionCard}>
                                <View style={[styles.transactionIcon, { backgroundColor: p.status === 'Completed' ? '#E8F5E9' : p.status === 'Rejected' ? '#FFEBEE' : '#FFF3E0' }]}>
                                    <Ionicons name="wallet-outline" size={20} color={p.status === 'Completed' ? '#1F5E2E' : p.status === 'Rejected' ? '#D32F2F' : '#D97706'} />
                                </View>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionId}>Payout • {p.status}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.transactionMeta}>{new Date(p.created_at).toLocaleDateString()}</Text>
                                        {p.status === 'Completed' && p.transaction_id ? (
                                            <Text style={[styles.transactionMeta, { color: '#1F5E2E', marginLeft: 8 }]}>• TXN: {p.transaction_id}</Text>
                                        ) : p.admin_notes ? (
                                            <Text style={[styles.transactionMeta, { color: '#D32F2F', marginLeft: 8 }]}>• {p.admin_notes}</Text>
                                        ) : null}
                                    </View>
                                </View>
                                <View style={styles.transactionAmountContainer}>
                                    <Text style={[styles.transactionAmount, { color: p.status === 'Rejected' ? '#999' : '#1A1A1A' }]}>
                                        ₹{Number(p.amount).toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                    {payouts.length > 3 && (
                        <TouchableOpacity style={styles.viewAllBtn} onPress={() => openHistory('payouts')}>
                            <Text style={styles.viewAllText}>View All Payouts</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Recent Transactions */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Transaction History</Text>
                <View style={styles.transactionList}>
                    {transactions.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: '#999', fontFamily: 'DMSans_400Regular' }}>No completed transactions yet.</Text>
                        </View>
                    ) : (
                        transactions.slice(0, 3).map((tx) => (
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
                    {transactions.length > 3 && (
                        <TouchableOpacity style={styles.viewAllBtn} onPress={() => openHistory('transactions')}>
                            <Text style={styles.viewAllText}>View All Transactions</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* View All History Modal */}
            <Modal visible={isHistoryModalVisible} animationType="slide" transparent={true} onRequestClose={() => setHistoryModalVisible(false)}>
                <View style={styles.modalBg}>
                    <View style={[styles.modalContent, { marginTop: insets.top + 20 }]}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setHistoryModalVisible(false)} style={styles.iconButton}>
                                <Ionicons name="close" size={24} color="#1A1A1A" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>All History</Text>
                            <TouchableOpacity onPress={generateReport} style={styles.iconButton}>
                                {isExporting ? <ActivityIndicator color="#1F5E2E" size="small" /> : <Ionicons name="download-outline" size={24} color="#1F5E2E" />}
                            </TouchableOpacity>
                        </View>

                        {/* Tabs */}
                        <View style={styles.modalTabs}>
                            <TouchableOpacity
                                style={[styles.modalTab, historyTab === 'payouts' && styles.modalTabActive]}
                                onPress={() => { setHistoryTab('payouts'); setFilterStatus('All'); }}
                            >
                                <Text style={[styles.modalTabText, historyTab === 'payouts' && styles.modalTabTextActive]}>Payouts</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalTab, historyTab === 'transactions' && styles.modalTabActive]}
                                onPress={() => { setHistoryTab('transactions'); setFilterStatus('All'); }}
                            >
                                <Text style={[styles.modalTabText, historyTab === 'transactions' && styles.modalTabTextActive]}>Transactions</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Filters */}
                        <View style={styles.filtersContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
                                {['All', 'Completed', 'Pending', 'Rejected'].map(opt => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.filterChip, filterStatus === opt && styles.filterChipActive]}
                                        onPress={() => setFilterStatus(opt)}
                                    >
                                        <Text style={[styles.filterChipText, filterStatus === opt && styles.filterChipTextActive]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TouchableOpacity style={styles.sortButton} onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                                <Ionicons name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} size={16} color="#1A1A1A" />
                                <Text style={styles.sortText}>Date</Text>
                            </TouchableOpacity>
                        </View>

                        {/* List */}
                        <ScrollView contentContainerStyle={styles.modalListContent}>
                            {historyTab === 'payouts' ? (
                                filteredPayouts.length === 0 ? <Text style={styles.emptyText}>No payouts found.</Text> :
                                    filteredPayouts.map(p => (
                                        <View key={p.id} style={styles.transactionCard}>
                                            <View style={[styles.transactionIcon, { backgroundColor: p.status === 'Completed' ? '#E8F5E9' : p.status === 'Rejected' ? '#FFEBEE' : '#FFF3E0' }]}>
                                                <Ionicons name="wallet-outline" size={20} color={p.status === 'Completed' ? '#1F5E2E' : p.status === 'Rejected' ? '#D32F2F' : '#D97706'} />
                                            </View>
                                            <View style={styles.transactionInfo}>
                                                <Text style={styles.transactionId}>Payout • {p.status}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={styles.transactionMeta}>{new Date(p.created_at).toLocaleDateString()}</Text>
                                                    {p.status === 'Completed' && p.transaction_id ? (
                                                        <Text style={[styles.transactionMeta, { color: '#1F5E2E', marginLeft: 8 }]}>• TXN: {p.transaction_id}</Text>
                                                    ) : p.admin_notes ? (
                                                        <Text style={[styles.transactionMeta, { color: '#D32F2F', marginLeft: 8 }]}>• {p.admin_notes}</Text>
                                                    ) : null}
                                                </View>
                                            </View>
                                            <View style={styles.transactionAmountContainer}>
                                                <Text style={[styles.transactionAmount, { color: p.status === 'Rejected' ? '#999' : '#1A1A1A' }]}>₹{Number(p.amount).toFixed(2)}</Text>
                                            </View>
                                        </View>
                                    ))
                            ) : (
                                filteredTransactions.length === 0 ? <Text style={styles.emptyText}>No transactions found.</Text> :
                                    filteredTransactions.map(tx => (
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
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    viewAllBtn: {
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        marginTop: 8,
    },
    viewAllText: {
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
        fontSize: 14,
    },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        flex: 1,
        backgroundColor: '#FCFCFC',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    modalTabs: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    modalTab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    modalTabActive: {
        borderBottomColor: '#1F5E2E',
    },
    modalTabText: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 14,
        color: '#999',
    },
    modalTabTextActive: {
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    filtersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    filterChipActive: {
        backgroundColor: '#E8F5E9',
        borderColor: '#1F5E2E',
    },
    filterChipText: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: '#666',
    },
    filterChipTextActive: {
        color: '#1F5E2E',
        fontFamily: 'DMSans_700Bold',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 20,
    },
    sortText: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    modalListContent: {
        padding: 20,
        gap: 12,
    },
    emptyText: {
        textAlign: 'center',
        paddingTop: 40,
        color: '#999',
        fontFamily: 'DMSans_500Medium',
    },
});
