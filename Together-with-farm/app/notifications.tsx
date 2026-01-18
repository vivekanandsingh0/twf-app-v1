import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const FILTERS = ['All 2', 'Order', 'Promo', 'Delivery', 'Update Instructions'];

const NOTIFICATIONS = [
    {
        id: 1,
        title: 'Your Order #4526 is on the way.',
        description: 'Expected delivery 5:30-6:30 pm',
        time: '5min ago',
        type: 'order',
        icon: 'cube-outline',
        highlight: true,
        section: 'Today',
        bg: '#D3D3D3' // Light Grey for unread/highlight
    },
    {
        id: 2,
        title: '20% Off on fresh Veggies Today',
        description: 'Save on all greens until midnight',
        time: '5min ago',
        type: 'promo',
        icon: 'gift-outline',
        highlight: true,
        section: 'Today',
        bg: '#D3D3D3',
        voucherCode: 'FRESH20',
        validity: 'Valid until 11:59 Today',
        promoDetails: 'Save on all greens until midnight. Offers apply automatically when checkout'
    },
    {
        id: 3,
        title: 'How was your delivery?',
        description: 'Tap to rate your driver',
        time: 'Yesterday',
        type: 'feedback',
        icon: 'help-circle-outline',
        highlight: false,
        section: 'Yesterday',
        bg: '#fff'
    },
    {
        id: 4,
        title: 'Your order was delivered successfully',
        description: 'Thank you for shopping with TWF',
        time: 'Yesterday',
        type: 'success',
        icon: 'checkmark-circle-outline',
        highlight: false,
        section: 'Yesterday',
        bg: '#fff'
    },
];

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('All 2');
    const [selectedPromo, setSelectedPromo] = useState<typeof NOTIFICATIONS[0] | null>(null);

    const handleNotificationPress = (item: typeof NOTIFICATIONS[0]) => {
        if (item.type === 'promo') {
            setSelectedPromo(item);
        }
    };

    const renderNotificationItem = (item: typeof NOTIFICATIONS[0]) => (
        <TouchableOpacity
            key={item.id}
            style={[
                styles.notificationCard,
                { backgroundColor: item.highlight ? '#EDEDED' : '#fff' },
                item.highlight ? styles.activeCard : null
            ]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={[styles.iconContainer, item.type === 'success' ? { backgroundColor: '#000' } : { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#000' }]}>
                <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={item.type === 'success' ? '#fff' : '#000'}
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifDesc}>{item.description}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
            </View>
            {item.highlight && <View style={styles.greenDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="gift-outline" size={24} color="#1A1A1A" />
                        <View style={styles.giftBadge} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.badgeText}>2</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {FILTERS.map((filter) => (
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
            </View>

            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {/* Today Section */}
                <Text style={styles.sectionHeader}>Today</Text>
                {NOTIFICATIONS.filter(n => n.section === 'Today').map(renderNotificationItem)}

                {/* Yesterday Section */}
                <Text style={styles.sectionHeader}>Yesterday</Text>
                {NOTIFICATIONS.filter(n => n.section === 'Yesterday').map(renderNotificationItem)}
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
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setSelectedPromo(null)}
                    />
                    <View style={styles.voucherCard}>
                        <View style={styles.voucherIconContainer}>
                            <Ionicons name="ticket-outline" size={64} color="#1F5E2E" />
                        </View>

                        <Text style={styles.voucherTitle}>{selectedPromo?.title}</Text>
                        <Text style={styles.voucherDesc}>
                            {selectedPromo?.promoDetails || selectedPromo?.description}
                        </Text>

                        <View style={styles.codeContainer}>
                            <Text style={styles.codeLabel}>Promo Code</Text>
                            <Text style={styles.codeText}>{selectedPromo?.voucherCode}</Text>
                            <Text style={styles.validityText}>{selectedPromo?.validity}</Text>
                        </View>

                        <TouchableOpacity style={styles.redeemButton} onPress={() => setSelectedPromo(null)}>
                            <Text style={styles.redeemText}>Redeem Now</Text>
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
    giftBadge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CAF50',
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
