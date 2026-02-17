import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';

const FILTERS = ['All', 'Promo', 'Order', 'Alert', 'Success'];

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { notifications, unreadCount, refreshNotifications, markAllAsRead } = useNotifications();
    const { isDark } = useTheme();
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedPromo, setSelectedPromo] = useState<any>(null);

    React.useEffect(() => {
        markAllAsRead();
    }, []);

    const handleNotificationPress = (item: any) => {
        if (item.type === 'promo') {
            setSelectedPromo(item);
        }
    };

    const handleCopyCode = async () => {
        if (selectedPromo?.voucherCode) {
            await Clipboard.setStringAsync(selectedPromo.voucherCode);
            alert(`Code ${selectedPromo.voucherCode} copied to clipboard!`);
            setSelectedPromo(null);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeFilter === 'All') return true;
        // Map filter labels to notification types if needed, or simple equality
        return n.type.toLowerCase() === activeFilter.toLowerCase();
    });

    const renderNotificationItem = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={[
                styles.notificationCard,
                { backgroundColor: item.highlight ? (isDark ? '#1E3E2E' : '#F0FDF4') : (isDark ? '#1E1E1E' : '#fff') },
                item.highlight ? styles.activeCard : null,
                isDark && { borderColor: '#333' }
            ]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={[styles.iconContainer, item.type === 'success' ? { backgroundColor: isDark ? '#FFF' : '#000' } : { backgroundColor: 'transparent', borderWidth: 2, borderColor: isDark ? '#FFF' : '#000' }]}>
                <Ionicons
                    name={item.icon}
                    size={24}
                    color={item.type === 'success' ? (isDark ? '#000' : '#fff') : (isDark ? '#FFF' : '#000')}
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.notifTitle, isDark && { color: '#FFF' }]}>{item.title}</Text>
                <Text style={[styles.notifDesc, isDark && { color: '#AAA' }]}>{item.description}</Text>
                {item.voucherCode && (
                    <Text style={{ fontSize: 11, color: '#4CAF50', fontFamily: 'DMSans_700Bold', marginTop: 2 }}>
                        Use Code: {item.voucherCode}
                    </Text>
                )}
                <Text style={styles.notifTime}>{item.time}</Text>
            </View>
            {item.highlight && <View style={styles.greenDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: '#333' }]} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Notifications</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: '#333' }]} onPress={refreshNotifications}>
                        <Ionicons name="refresh-outline" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: '#333' }]}>
                        <Ionicons name="notifications-outline" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                        {/* Badge Removed on Notification Screen as we mark read on entry */}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={[styles.filterContainer, isDark && { borderBottomColor: '#333' }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter ? styles.activeFilterChip : [styles.inactiveFilterChip, isDark && { backgroundColor: '#333', borderColor: '#444' }]
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter ? styles.activeFilterText : [styles.inactiveFilterText, isDark && { color: '#AAA' }]
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {filteredNotifications.length === 0 ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Ionicons name="chatbubble-ellipses-outline" size={48} color="#ddd" />
                        <Text style={{ marginTop: 16, color: '#999', fontFamily: 'DMSans_500Medium' }}>No notifications yet</Text>
                    </View>
                ) : (
                    <>
                        {/* Today Section */}
                        {filteredNotifications.some(n => n.section === 'Today') && (
                            <>
                                <Text style={[styles.sectionHeader, isDark && { color: '#FFF' }]}>Today</Text>
                                {filteredNotifications.filter(n => n.section === 'Today').map(renderNotificationItem)}
                            </>
                        )}

                        {/* Yesterday Section */}
                        {filteredNotifications.some(n => n.section === 'Yesterday') && (
                            <>
                                <Text style={[styles.sectionHeader, isDark && { color: '#FFF' }]}>Yesterday</Text>
                                {filteredNotifications.filter(n => n.section === 'Yesterday').map(renderNotificationItem)}
                            </>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Voucher Modal */}
            <Modal
                visible={!!selectedPromo}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedPromo(null)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={[styles.modalBackdrop, isDark && { backgroundColor: 'rgba(0,0,0,0.9)' }]}
                        activeOpacity={1}
                        onPress={() => setSelectedPromo(null)}
                    />
                    <View style={[styles.voucherCard, isDark && { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20 }]}>
                        <View style={[styles.voucherIconContainer, isDark && { backgroundColor: '#333' }]}>
                            <Ionicons name="ticket-outline" size={64} color="#4CAF50" />
                        </View>

                        <Text style={[styles.voucherTitle, isDark && { color: '#FFF' }]}>{selectedPromo?.title}</Text>
                        <Text style={[styles.voucherDesc, isDark && { color: '#AAA' }]}>
                            {selectedPromo?.promoDetails || selectedPromo?.description}
                        </Text>

                        <View style={[styles.codeContainer, isDark && { backgroundColor: '#333' }]}>
                            <Text style={[styles.codeLabel, isDark && { color: '#FFF' }]}>Promo Code</Text>
                            <Text style={[styles.codeText, isDark && { color: '#81C784' }]}>{selectedPromo?.voucherCode}</Text>
                            <Text style={[styles.validityText, isDark && { color: '#AAA' }]}>{selectedPromo?.validity}</Text>
                        </View>

                        <TouchableOpacity style={styles.redeemButton} onPress={handleCopyCode}>
                            <Text style={styles.redeemText}>Copy Code</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

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
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },

    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#1F5E2E',
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    filterContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingVertical: 12,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    activeFilterChip: {
        backgroundColor: '#1F5E2E',
        borderColor: '#1F5E2E',
    },
    inactiveFilterChip: {
        backgroundColor: '#fff',
        borderColor: '#EFEFEF',
    },
    filterText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
    },
    activeFilterText: {
        color: '#fff',
    },
    inactiveFilterText: {
        color: '#333',
    },
    listContent: {
        padding: 20,
    },
    sectionHeader: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 16,
        marginTop: 8,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        // Shadow for white cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F5F5F5',
    },
    activeCard: {
        borderWidth: 0, // Grey cards usually flat
        elevation: 0,
        shadowOpacity: 0,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    notifTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    notifDesc: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginBottom: 6,
    },
    notifTime: {
        fontSize: 10,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
    },
    greenDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#1F5E2E',
        alignSelf: 'center', // Vertically center? No top right usually.
        marginBottom: 'auto', // Push to top
        marginTop: 8,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // White backdrop as per design, maybe slightly blurred/opaque
    },
    voucherCard: {
        width: '85%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    voucherIconContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#F9F9F9',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    voucherTitle: {
        fontSize: 22,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12,
    },
    voucherDesc: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    codeContainer: {
        backgroundColor: '#E0E0E0',
        borderRadius: 24,
        paddingVertical: 20,
        paddingHorizontal: 40,
        alignItems: 'center',
        marginBottom: 40,
        width: '100%',
    },
    codeLabel: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    codeText: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
        marginBottom: 4,
    },
    validityText: {
        fontSize: 10,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
    },
    redeemButton: {
        backgroundColor: '#1F5E2E',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    redeemText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    }
});
